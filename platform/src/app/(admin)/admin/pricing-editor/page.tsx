import { getPricingPlans, getGlobalFeatures } from '@/app/actions/pricing';
import PricingEditorClient from './client';

export const dynamic = 'force-dynamic';

export default async function PricingEditorPage() {
  const [plans, features] = await Promise.all([
    getPricingPlans(),
    getGlobalFeatures()
  ]);

  return <PricingEditorClient initialPlans={plans || []} initialFeatures={features || []} />;
}
