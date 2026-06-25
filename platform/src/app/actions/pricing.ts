'use server';

import prisma from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function getPricingPlans() {
  try {
    return await prisma.pricingPlan.findMany({
      orderBy: { order: 'asc' }
    });
  } catch (e) {
    console.error('Failed to fetch pricing plans:', e);
    return [];
  }
}

export async function updatePricingPlan(id: string, data: any) {
  const session = await auth();
  if (session?.user?.role !== 'SUPER-ADMIN' && session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  await prisma.pricingPlan.update({
    where: { id },
    data: {
      name: data.name,
      price: data.price, // string for display like "$999" or "Custom"
      basePrice: parseFloat(data.basePrice), // float for razorpay
      isPopular: data.isPopular,
      isActive: data.isActive
    }
  });

  revalidatePath('/admin/pricing-editor');
  revalidatePath('/pricing');
  return { success: true };
}

export async function getGlobalFeatures() {
  try {
    return await prisma.feature.findMany();
  } catch (e) {
    return [];
  }
}

export async function createPricingPlan(data: any) {
  const session = await auth();
  if (session?.user?.role !== 'SUPER-ADMIN' && session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  await prisma.pricingPlan.create({
    data: {
      name: data.name,
      price: data.price,
      period: data.period || 'monthly',
      basePrice: parseFloat(data.basePrice) || 0,
    }
  });
  revalidatePath('/admin/pricing-editor');
  return { success: true };
}

export async function deletePricingPlan(id: string) {
  const session = await auth();
  if (session?.user?.role !== 'SUPER-ADMIN' && session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');
  
  await prisma.pricingPlan.delete({ where: { id } });
  revalidatePath('/admin/pricing-editor');
  return { success: true };
}

export async function addGlobalFeature(title: string) {
  const session = await auth();
  if (session?.user?.role !== 'SUPER-ADMIN' && session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  const code = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  await prisma.feature.create({
    data: { code, name: title }
  });
  revalidatePath('/admin/pricing-editor');
  return { success: true };
}

export async function deleteGlobalFeature(code: string) {
  const session = await auth();
  if (session?.user?.role !== 'SUPER-ADMIN' && session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  await prisma.feature.delete({ where: { code } });
  revalidatePath('/admin/pricing-editor');
  return { success: true };
}

export async function togglePlanFeature(planId: string, featureCode: string, isEnabled: boolean) {
  const session = await auth();
  if (session?.user?.role !== 'SUPER-ADMIN' && session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  if (isEnabled) {
    await prisma.planFeature.create({
      data: { planId, featureCode }
    });
  } else {
    await prisma.planFeature.delete({
      where: { planId_featureCode: { planId, featureCode } }
    });
  }
  revalidatePath('/admin/pricing-editor');
  return { success: true };
}

export async function simulateCheckout(planId: string) {
  return { url: '/checkout/' + planId };
}
