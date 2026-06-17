'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getLeads() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        notes: true,
      }
    });
    return { success: true, data: leads };
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return { success: false, error: error.message };
  }
}

export async function createLead(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const company = formData.get('company') as string || null;
    const phone = formData.get('phone') as string || null;
    const message = formData.get('message') as string || null;

    if (!name || !email) {
      return { success: false, error: 'Name and email are required' };
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        company,
        phone,
        message,
        status: 'NEW',
      }
    });

    revalidatePath('/admin/leads');
    return { success: true, data: lead };
  } catch (error: any) {
    console.error('Error creating lead:', error);
    return { success: false, error: error.message };
  }
}

export async function updateLeadStatus(id: string, status: string) {
  try {
    const lead = await prisma.lead.update({
      where: { id },
      data: { status }
    });
    revalidatePath('/admin/leads');
    return { success: true, data: lead };
  } catch (error: any) {
    console.error('Error updating lead status:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteLead(id: string) {
  try {
    await prisma.lead.delete({
      where: { id }
    });
    revalidatePath('/admin/leads');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    return { success: false, error: error.message };
  }
}
