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

  revalidatePath('/admin/pricing');
  revalidatePath('/pricing');
  return { success: true };
}
