'use server';

import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signIn, auth } from '@/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { sendMail } from '@/lib/email';

const JWT_SECRET = process.env.JWT_SECRET || 'saas_auth_super_secret_key_987654321';

// Dynamic Database Self-Seeding check for SaaS Features & Permissions Gate
async function seedMasterFeaturesIfNeeded() {
  try {
    const count = await prisma.feature.count();
    if (count === 0) {
      // 1. Create standard features
      const list = [
        { code: 'csv-upload', name: 'CSV Cleaner Grid', description: 'Parse, cleanse, and structure raw spreadsheet records.' },
        { code: 'plotly-charts', name: '16+ Plotly Visualizations', description: 'Dynamic drag-and-drop custom themed charts.' },
        { code: 'predictive-forecasts', name: 'Predictive AI Forecasting', description: 'Trend regression and live factory streams.' },
        { code: 'word-reports', name: 'Word & Slides Compiling Studio', description: '21-Agent Orchestra compilation compilers.' }
      ];
      await prisma.feature.createMany({ data: list });

      // 2. Create mapping mappings
      const mappings = [
        { planId: 'trial', featureCode: 'csv-upload' },
        { planId: 'trial', featureCode: 'plotly-charts' },
        { planId: 'growth', featureCode: 'csv-upload' },
        { planId: 'growth', featureCode: 'plotly-charts' },
        { planId: 'growth', featureCode: 'predictive-forecasts' },
        { planId: 'enterprise', featureCode: 'csv-upload' },
        { planId: 'enterprise', featureCode: 'plotly-charts' },
        { planId: 'enterprise', featureCode: 'predictive-forecasts' },
        { planId: 'enterprise', featureCode: 'word-reports' }
      ];
      await prisma.planFeature.createMany({ data: mappings });
      console.log('Successfully seeded master SaaS features and default plan permissions.');
    }
  } catch (err) {
    console.error('Self-seeding master features failed:', err);
  }
}

// 1. REGISTER USER SERVER ACTION
export async function registerUser(formData: FormData) {
  await seedMasterFeaturesIfNeeded();

  const name = formData.get('name') as string;
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const mobile = formData.get('mobile') as string || null;
  const password = formData.get('password') as string;
  const termsAccepted = formData.get('termsAccepted') === 'on' || formData.get('termsAccepted') === 'true';

  if (!email || !password || !name || !username) {
    return { error: 'All fields are required.' };
  }

  if (!termsAccepted) {
    return { error: 'You must agree to the Terms and Conditions to register.' };
  }

  // Ensure username has no spaces
  if (/\s/.test(username)) {
    return { error: 'Username cannot contain spaces.' };
  }

  try {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail && existingEmail.emailVerified) {
      return { error: 'Email is already registered and verified.' };
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername && existingUsername.email !== email) {
      return { error: 'Username is already taken.' };
    }

    const salt = await bcrypt.genSalt(8);
    const passwordHash = await bcrypt.hash(password, salt);

    // Calculate standard 7-Day Free Trial expiration date
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (existingEmail && !existingEmail.emailVerified) {
      // Update existing unverified user with new OTP and details
      await prisma.user.update({
        where: { email },
        data: {
          name,
          username,
          passwordHash,
          mobile,
          signupOtp: otp,
          signupOtpExpires: otpExpires,
        }
      });
    } else {
      // Create new unverified user
      await prisma.user.create({
        data: {
          name,
          username,
          email,
          passwordHash,
          mobile,
          planId: 'trial',
          trialEndsAt,
          termsAccepted: true,
          termsAcceptedDate: new Date(),
          signupOtp: otp,
          signupOtpExpires: otpExpires,
        },
      });
    }

    // Send real email via SMTP
    await sendMail({
      to: email,
      subject: 'Verify your account - DevFort',
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
              <h2 style="color: #6366f1;">Welcome to DevFort!</h2>
              <p>Please use the following 6-digit OTP to verify your account.</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1e293b; padding: 16px; background: #f8fafc; border-radius: 8px; text-align: center; margin: 24px 0;">
                ${otp}
              </div>
              <p>This code expires in 10 minutes.</p>
             </div>`,
    });

    return { success: true, otpSent: true }; // Real OTP sent, do not return OTP value!
  } catch (error: any) {
    console.error('Registration error', error);
    return { error: 'An error occurred during registration.' };
  }
}

// 1.5. VERIFY SIGNUP OTP SERVER ACTION
export async function verifySignupOtp(email: string, otp: string) {
  if (!email || !otp) return { error: 'Email and OTP are required.' };
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.signupOtp || !user.signupOtpExpires) {
      return { error: 'Invalid signup session.' };
    }

    if (new Date() > new Date(user.signupOtpExpires)) {
      return { error: 'OTP has expired. Please register again.' };
    }

    if (user.signupOtp !== otp) {
      return { error: 'Incorrect OTP.' };
    }

    // Mark as verified
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        signupOtp: null,
        signupOtpExpires: null
      }
    });

    return { success: true };
  } catch (err) {
    console.error('OTP Verification error', err);
    return { error: 'Verification failed.' };
  }
}

// 2. LOGIN USER SERVER ACTION
export async function loginUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials.' };
        default:
          return { error: 'Something went wrong.' };
      }
    }
    
    // Rethrow to allow Next.js redirects to work
    throw error;
  }
}

// ================= ACCOUNT RECOVERY LAYERS =================

// 3. FORGOT PASSWORD ACTION (OTP Generation)
export async function forgotPassword(email: string) {
  if (!email) return { error: 'Email is required.' };
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: 'No user account matches this email address.' };

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await prisma.user.update({
      where: { email },
      data: {
        resetOtp: otp,
        resetOtpExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
      }
    });

    // Send real email
    await sendMail({
      to: email,
      subject: 'Password Reset Request - DevFort',
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
              <h2 style="color: #6366f1;">Password Reset</h2>
              <p>We received a request to reset your password. Use the OTP below to proceed:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1e293b; padding: 16px; background: #f8fafc; border-radius: 8px; text-align: center; margin: 24px 0;">
                ${otp}
              </div>
              <p>This code expires in 10 minutes. If you did not request a password reset, you can safely ignore this email.</p>
             </div>`,
    });

    return { 
      success: true, 
      message: 'If an account with that email exists, an OTP has been sent.' 
    };
  } catch (err: any) {
    return { error: 'Failed to process account ID recovery.' };
  }
}

// 3.5 VERIFY OTP ACTION
export async function verifyOtp(email: string, otp: string) {
  if (!email || !otp) return { error: 'Email and verification code are required.' };
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      return { error: 'Invalid reset session.' };
    }

    if (new Date() > new Date(user.resetOtpExpires)) {
      return { error: 'Verification code has expired.' };
    }

    if (user.resetOtp !== otp) {
      return { error: 'Incorrect verification code.' };
    }

    // OTP verified successfully, clear OTP and generate a short-lived reset token
    await prisma.user.update({
      where: { email },
      data: {
        resetOtp: null,
        resetOtpExpires: null
      }
    });

    const resetToken = jwt.sign({ email, otpVerified: true }, JWT_SECRET, { expiresIn: '5m' });
    return { success: true, resetToken };
  } catch (err) {
    return { error: 'Verification failed.' };
  }
}

// 4. RESET PASSWORD ACTION (JWT Signature Check)
export async function resetPassword(token: string, newPasswordStr: string) {
  if (!token || !newPasswordStr) return { error: 'Token and new password are required.' };
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string, otpVerified?: boolean };
    
    if (!decoded.otpVerified) {
      return { error: 'OTP verification is required before resetting password.' };
    }

    const salt = await bcrypt.genSalt(8);
    const passwordHash = await bcrypt.hash(newPasswordStr, salt);

    await prisma.user.update({
      where: { email: decoded.email },
      data: { passwordHash }
    });

    return { success: true, message: 'Password updated successfully!' };
  } catch (err) {
    return { error: 'Reset session is invalid or has expired.' };
  }
}

// 5. FORGOT LOGIN ID / EMAIL (Mobile Query)
export async function recoverLoginId(mobile: string) {
  if (!mobile) return { error: 'Mobile number is required.' };
  try {
    const user = await prisma.user.findFirst({
      where: { mobile }
    });
    if (!user || !user.email) return { error: 'No registered user matches this mobile number.' };

    const atIdx = user.email.indexOf('@');
    const maskedEmail = user.email[0] + '***' + user.email[atIdx - 1] + user.email.substring(atIdx);

    return { 
      success: true, 
      maskedEmail
      // rawEmail removed to prevent data leak
    };
  } catch (err) {
    return { error: 'Failed to process account ID recovery.' };
  }
}

// ================= ADMIN PLAN BUILDER & FEATURE GATES ACTIONS =================

// 6. GET MATRIX CONFIGS
export async function getPlanFeaturesMatrix() {
  await seedMasterFeaturesIfNeeded();
  try {
    const masterFeatures = await prisma.feature.findMany();
    const mappings = await prisma.planFeature.findMany();
    return { masterFeatures, mappings };
  } catch (err) {
    console.error(err);
    return { masterFeatures: [], mappings: [] };
  }
}

// 7. SAVE MASTER CONFIGS
export async function updatePlanFeaturesMap(planId: string, featureCodes: string[]) {
  try {
    await prisma.$transaction([
      prisma.planFeature.deleteMany({ where: { planId } }),
      prisma.planFeature.createMany({
        data: featureCodes.map(code => ({ planId, featureCode: code }))
      })
    ]);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: 'Failed to update plan feature gates.' };
  }
}

// 8. MIDDLEWARE ACCESS AUTHORIZATION VALIDATION FOR FEATURE CODES
export async function hasFeatureAccess(userId: string, featureCode: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;

    // A. Verify Free Trial Lifecycle Expiration
    if (user.planId === 'trial' && user.trialEndsAt) {
      if (new Date() > new Date(user.trialEndsAt)) {
        return { error: 'TRIAL_EXPIRED' };
      }
    }

    // B. Verify Granular Feature Access Pivot Mapping
    const mapping = await prisma.planFeature.findUnique({
      where: {
        planId_featureCode: {
          planId: user.planId,
          featureCode
        }
      }
    });

    return !!mapping;
  } catch (err) {
    return false;
  }
}

// 9. ACCOUNT LINKING ACTIONS
export async function getLinkedStatus() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return { error: 'Unauthorized' };
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { accounts: true }
    });
    if (!user) return { error: 'User not found' };
    const hasGoogle = user.accounts.some(acc => acc.provider === 'google');
    const hasPassword = !!user.passwordHash;
    return { 
      success: true, 
      hasGoogle, 
      hasPassword, 
      email: user.email, 
      name: user.name, 
      role: user.role,
      username: user.username,
      mobile: user.mobile,
      dateOfBirth: user.dateOfBirth?.toISOString(),
      gender: user.gender,
      country: user.country
    };
  } catch (err) {
    console.error('Failed to get link status:', err);
    return { error: 'Failed to retrieve link status.' };
  }
}

export async function linkGoogleAccount(providerAccountId: string, googleEmail: string) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return { error: 'Unauthorized' };
    }
    
    const existingAccount = await prisma.account.findFirst({
      where: {
        provider: 'google',
        providerAccountId: providerAccountId
      }
    });
    
    if (existingAccount) {
      if (existingAccount.userId === session.user.id) {
        return { success: true, message: 'Google account is already linked.' };
      }
      return { error: 'This Google account is already linked to another user profile.' };
    }

    await prisma.account.create({
      data: {
        userId: session.user.id,
        type: 'oauth',
        provider: 'google',
        providerAccountId: providerAccountId,
        scope: 'openid email profile',
      }
    });

    return { success: true, message: 'Google account successfully linked.' };
  } catch (err) {
    console.error('Failed to link Google account:', err);
    return { error: 'Failed to link Google account.' };
  }
}

export async function unlinkGoogleAccount() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return { error: 'Unauthorized' };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { accounts: true }
    });

    if (!user) {
      return { error: 'User not found.' };
    }

    if (!user.passwordHash && user.accounts.length <= 1) {
      return { error: 'Cannot unlink Google account. You must set a password or link another account to avoid lock out.' };
    }

    await prisma.account.deleteMany({
      where: {
        userId: session.user.id,
        provider: 'google'
      }
    });

    return { success: true, message: 'Google account successfully unlinked.' };
  } catch (err) {
    console.error('Failed to unlink Google account:', err);
    return { error: 'Failed to unlink Google account.' };
  }
}

// 10. UPDATE PERSONAL DETAILS
export async function updatePersonalDetails(formData: FormData) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const username = formData.get('username') as string;
    const mobile = formData.get('mobile') as string;
    const dateOfBirthStr = formData.get('dateOfBirth') as string;
    const gender = formData.get('gender') as string;
    const country = formData.get('country') as string;

    if (!name || !username) {
      return { error: 'Name and Username are required.' };
    }

    if (/\s/.test(username)) {
      return { error: 'Username cannot contain spaces.' };
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername && existingUsername.id !== session.user.id) {
      return { error: 'Username is already taken.' };
    }

    let dateOfBirth = null;
    if (dateOfBirthStr) {
      dateOfBirth = new Date(dateOfBirthStr);
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        username,
        mobile: mobile || null,
        dateOfBirth,
        gender: gender || null,
        country: country || null
      }
    });

    return { success: true, message: 'Personal details updated successfully!' };
  } catch (err) {
    console.error('Failed to update personal details:', err);
    return { error: 'Failed to update personal details.' };
  }
}
