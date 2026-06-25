'use client';

import { useState, useEffect } from 'react';
import { getPricingPlans, updatePricingPlan } from '@/app/actions/pricing';
import { IndianRupee, DollarSign, CreditCard } from 'lucide-react';

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await getPricingPlans();
      setPlans(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleUpdate = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      price: (form.elements.namedItem('price') as HTMLInputElement).value,
      basePrice: (form.elements.namedItem('basePrice') as HTMLInputElement).value,
      isPopular: (form.elements.namedItem('isPopular') as HTMLInputElement).checked,
      isActive: (form.elements.namedItem('isActive') as HTMLInputElement).checked,
    };
    
    await updatePricingPlan(id, data);
    alert('Plan updated successfully!');
    loadPlans();
  };

  if (loading) return <div className="text-white p-8">Loading plans...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <CreditCard className="text-primary" /> Pricing Plans Manager
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">{plan.name}</h2>
            
            <form onSubmit={(e) => handleUpdate(plan.id, e)} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase font-semibold">Plan Name</label>
                <input name="name" defaultValue={plan.name} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white mt-1" />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-semibold">Display Price</label>
                <input name="price" defaultValue={plan.price} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white mt-1" />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-semibold">Base Price (Numeric for Razorpay)</label>
                <input name="basePrice" type="number" defaultValue={plan.basePrice} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white mt-1" />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" name="isPopular" defaultChecked={plan.isPopular} className="w-5 h-5 accent-primary" />
                <label className="text-white text-sm">Mark as Popular</label>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" name="isActive" defaultChecked={plan.isActive} className="w-5 h-5 accent-emerald-500" />
                <label className="text-white text-sm">Active</label>
              </div>
              
              <button type="submit" className="w-full py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl mt-4">
                Save Plan
              </button>
            </form>
          </div>
        ))}
        {plans.length === 0 && (
          <div className="text-slate-400">No pricing plans found. Please seed the database.</div>
        )}
      </div>
    </div>
  );
}
