'use server';

import prisma from '@/lib/db';
import { auth } from '@/auth';

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Authentication required.');
  return session;
}

// ─── 1. GET EMAIL TEMPLATES ───
export async function getEmailTemplates() {
  await requireAuth();
  
  const templates = [
    { id: 'tpl-1', name: 'Welcome Onboarding', subject: 'Welcome to our platform! 🚀', category: 'Transactional', openRate: 68.4, clickRate: 24.1, lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: 'Active' },
    { id: 'tpl-2', name: 'Monthly Newsletter', subject: 'Your Monthly Wrap-Up', category: 'Marketing', openRate: 42.1, clickRate: 12.5, lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), status: 'Draft' },
    { id: 'tpl-3', name: 'Password Reset', subject: 'Reset your password securely', category: 'Transactional', openRate: 98.2, clickRate: 85.0, lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), status: 'Active' },
    { id: 'tpl-4', name: 'Abandoned Cart', subject: 'You left something behind...', category: 'E-commerce', openRate: 54.3, clickRate: 18.9, lastEdited: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'Active' },
  ];

  return { success: true, templates };
}

// ─── 2. CREATE NEW TEMPLATE ───
export async function createEmailTemplate(name: string, subject: string, category: string) {
  await requireAuth();
  
  if (!name || !subject) return { success: false, error: 'Name and Subject are required.' };

  return { 
    success: true, 
    message: 'Template created successfully!',
    template: {
      id: `tpl-${Date.now()}`,
      name,
      subject,
      category,
      openRate: 0,
      clickRate: 0,
      lastEdited: new Date().toISOString(),
      status: 'Draft'
    }
  };
}

// ─── 3. SEND TEST EMAIL ───
export async function sendTestEmail(templateId: string, emailAddress: string) {
  await requireAuth();
  
  if (!emailAddress.includes('@')) return { success: false, error: 'Invalid email address.' };

  // Simulate API delay (e.g. Resend, SendGrid)
  await new Promise(resolve => setTimeout(resolve, 1500));

  return { success: true, message: `Test email sent to ${emailAddress}!` };
}
