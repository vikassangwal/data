import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

import NodemailerProvider from 'next-auth/providers/nodemailer';
import speakeasy from 'speakeasy';

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || 'devforge_super_secret_fallback_key_2026',
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  basePath: '/api/auth',
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || 'mock_google_id',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || 'mock_google_secret',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
      allowDangerousEmailAccountLinking: true,
    }),
    NodemailerProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT) || 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: 'DevFort <vikas.sangwal.05@gmail.com>',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        code: { label: '2FA Code', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user || !user.passwordHash) return null;

        if (!user.emailVerified) {
          throw new Error('Please verify your email before logging in.');
        }

        const isMatch = await bcrypt.compare(credentials.password as string, user.passwordHash);
        
        if (isMatch) {
          // Check 2FA
          if (user.twoFactorEnabled && user.twoFactorSecret) {
            if (!credentials.code) {
              throw new Error('2FA_REQUIRED');
            }
            const isValid2FA = speakeasy.totp.verify({
              secret: user.twoFactorSecret,
              encoding: 'base32',
              token: credentials.code as string,
              window: 1
            });
            if (!isValid2FA) {
              throw new Error('Invalid 2FA code.');
            }
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            planId: user.planId,
            twoFactorEnabled: user.twoFactorEnabled,
            profession: user.profession
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.planId = (user as any).planId;
        token.twoFactorEnabled = (user as any).twoFactorEnabled;
        token.profession = (user as any).profession;
      }
      if (trigger === "update" && session) {
        token.twoFactorEnabled = session.twoFactorEnabled;
        if (session.profession) token.profession = session.profession;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.planId = token.planId as string;
        (session.user as any).twoFactorEnabled = token.twoFactorEnabled as boolean;
        (session.user as any).profession = token.profession as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  }
});
