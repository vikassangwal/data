'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function getPricingPlans() {
  try {
    const plans = await prisma.pricingPlan.findMany({
      orderBy: { order: 'asc' },
      include: {
        features: true,
        planFeatures: {
          include: {
            feature: true
          }
        }
      }
    });
    return { success: true, data: plans };
  } catch (error: any) {
    console.error('Error fetching pricing plans:', error);
    return { success: false, error: error.message };
  }
}

export async function createPricingPlan(data: {
  name: string;
  price: string;
  period: string;
  isPopular: boolean;
  order: number;
}) {
  try {
    const plan = await prisma.pricingPlan.create({
      data: {
        ...data,
      }
    });
    revalidatePath('/admin/pricing-editor');
    revalidatePath('/pricing');
    return { success: true, data: plan };
  } catch (error: any) {
    console.error('Error creating pricing plan:', error);
    return { success: false, error: error.message };
  }
}

export async function updatePricingPlan(id: string, data: {
  name?: string;
  price?: string;
  period?: string;
  isPopular?: boolean;
}) {
  try {
    const plan = await prisma.pricingPlan.update({
      where: { id },
      data
    });
    revalidatePath('/admin/pricing-editor');
    revalidatePath('/pricing');
    return { success: true, data: plan };
  } catch (error: any) {
    console.error('Error updating pricing plan:', error);
    return { success: false, error: error.message };
  }
}

export async function deletePricingPlan(id: string) {
  try {
    await prisma.pricingPlan.delete({
      where: { id }
    });
    revalidatePath('/admin/pricing-editor');
    revalidatePath('/pricing');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting pricing plan:', error);
    return { success: false, error: error.message };
  }
}

export async function addPricingFeature(pricingPlanId: string, title: string) {
  try {
    const feature = await prisma.pricingFeature.create({
      data: {
        pricingPlanId,
        title
      }
    });
    revalidatePath('/admin/pricing-editor');
    revalidatePath('/pricing');
    return { success: true, data: feature };
  } catch (error: any) {
    console.error('Error adding pricing feature:', error);
    return { success: false, error: error.message };
  }
}

export async function deletePricingFeature(id: string) {
  try {
    await prisma.pricingFeature.delete({
      where: { id }
    });
    revalidatePath('/admin/pricing-editor');
    revalidatePath('/pricing');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting pricing feature:', error);
    return { success: false, error: error.message };
  }
}

export async function simulateCheckout(planId: string) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: 'Authentication required. Please sign in to upgrade.' };
    }

    const plan = await prisma.pricingPlan.findUnique({
      where: { id: planId }
    });
    if (!plan) {
      return { success: false, error: 'Selected pricing plan does not exist.' };
    }

    const basePrice = plan.basePrice || 0;
    const discount = plan.discount || 0;
    const amount = parseFloat((basePrice * (1 - discount / 100)).toFixed(2));

    const referenceId = `ch_mock_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    await prisma.$transaction([
      prisma.paymentLog.create({
        data: {
          userId: session.user.id,
          planName: plan.name,
          amount,
          paymentStatus: 'SUCCESS',
          gatewayUsed: 'Stripe',
          transactionId: referenceId
        }
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { planId }
      })
    ]);

    revalidatePath('/pricing');
    revalidatePath('/lab');
    revalidatePath('/profile');

    return { success: true, message: `Successfully upgraded to ${plan.name}!` };
  } catch (err: any) {
    console.error('Checkout failed:', err);
    return { success: false, error: err.message || 'Transaction could not be completed.' };
  }
}

export async function getGlobalFeatures() {
  try {
    const features = await prisma.feature.findMany({
      orderBy: { name: 'asc' }
    });
    return { success: true, data: features };
  } catch (error: any) {
    console.error('Error fetching global features:', error);
    return { success: false, error: error.message };
  }
}

export async function addGlobalFeature(name: string) {
  try {
    const code = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const feature = await prisma.feature.create({
      data: { code, name }
    });
    revalidatePath('/admin/pricing-editor');
    revalidatePath('/pricing');
    return { success: true, data: feature };
  } catch (error: any) {
    console.error('Error adding global feature:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteGlobalFeature(code: string) {
  try {
    await prisma.feature.delete({ where: { code } });
    revalidatePath('/admin/pricing-editor');
    revalidatePath('/pricing');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting global feature:', error);
    return { success: false, error: error.message };
  }
}

export async function togglePlanFeature(planId: string, featureCode: string, isEnabled: boolean) {
  try {
    if (isEnabled) {
      await prisma.planFeature.upsert({
        where: {
          planId_featureCode: { planId, featureCode }
        },
        update: {},
        create: { planId, featureCode }
      });
    } else {
      await prisma.planFeature.delete({
        where: {
          planId_featureCode: { planId, featureCode }
        }
      }).catch(() => {}); // Ignore if it doesn't exist
    }
    revalidatePath('/admin/pricing-editor');
    revalidatePath('/pricing');
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling plan feature:', error);
    return { success: false, error: error.message };
  }
}

