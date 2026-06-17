import { getPricingPlans, getGlobalFeatures } from '@/app/actions/pricing';
import PricingEditorClient from './client';

export const dynamic = 'force-dynamic';

export default async function PricingEditorPage() {
  const [plansRes, featuresRes] = await Promise.all([
    getPricingPlans(),
    getGlobalFeatures()
  ]);

  if (!plansRes.success) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold mb-2">Error loading pricing plans</h2>
        <p>{plansRes.error}</p>
      </div>
    );
  }

  return <PricingEditorClient initialPlans={plansRes.data || []} initialFeatures={featuresRes.data || []} />;
}
