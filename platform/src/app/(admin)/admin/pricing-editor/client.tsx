'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, Plus, CheckCircle2, 
  Settings2, Save, Trash2, Edit3, ArrowRight, ListChecks, Check, X
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { 
  createPricingPlan, 
  updatePricingPlan, 
  deletePricingPlan,
  addGlobalFeature,
  deleteGlobalFeature,
  togglePlanFeature
} from '@/app/actions/pricing';

export default function PricingEditorClient({ initialPlans, initialFeatures }: { initialPlans: any[], initialFeatures: any[] }) {
  const [plans, setPlans] = useState(initialPlans);
  const [globalFeatures, setGlobalFeatures] = useState(initialFeatures);
  const [activePlanId, setActivePlanId] = useState<string | null>(initialPlans[0]?.id || null);
  const [isSaving, setIsSaving] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState('');

  // Form states for active plan
  const activePlan = plans.find(p => p.id === activePlanId);
  
  const handleCreatePlan = async () => {
    setIsSaving(true);
    const res = await createPricingPlan({
      name: 'New Plan',
      price: '$99',
      period: '/month',
      isPopular: false,
      order: plans.length
    });
    if (res.success && res.data) {
      setPlans([...plans, { ...res.data, features: [], planFeatures: [] }]);
      setActivePlanId(res.data.id);
    }
    setIsSaving(false);
  };

  const handleUpdatePlan = async (id: string, updates: any) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    await updatePricingPlan(id, updates);
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    setIsSaving(true);
    const res = await deletePricingPlan(id);
    if (res.success) {
      setPlans(plans.filter(p => p.id !== id));
      if (activePlanId === id) setActivePlanId(plans[0]?.id || null);
    }
    setIsSaving(false);
  };

  const handleAddGlobalFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureName.trim()) return;
    setIsSaving(true);
    const res = await addGlobalFeature(newFeatureName);
    if (res.success && res.data) {
      setGlobalFeatures([...globalFeatures, res.data]);
      setNewFeatureName('');
    }
    setIsSaving(false);
  };

  const handleDeleteGlobalFeature = async (code: string) => {
    if (!confirm('Delete this global feature? It will be removed from all plans.')) return;
    setIsSaving(true);
    const res = await deleteGlobalFeature(code);
    if (res.success) {
      setGlobalFeatures(globalFeatures.filter(f => f.code !== code));
      // Optimistically remove it from plans
      setPlans(prev => prev.map(p => ({
        ...p,
        planFeatures: p.planFeatures?.filter((pf: any) => pf.featureCode !== code) || []
      })));
    }
    setIsSaving(false);
  };

  const handleTogglePlanFeature = async (planId: string, featureCode: string, isCurrentlyEnabled: boolean) => {
    const isEnabled = !isCurrentlyEnabled;
    
    // Optimistic UI update
    setPlans(prev => prev.map(p => {
      if (p.id === planId) {
        let newPlanFeatures = p.planFeatures || [];
        if (isEnabled) {
          const feature = globalFeatures.find(f => f.code === featureCode);
          newPlanFeatures = [...newPlanFeatures, { planId, featureCode, feature }];
        } else {
          newPlanFeatures = newPlanFeatures.filter((pf: any) => pf.featureCode !== featureCode);
        }
        return { ...p, planFeatures: newPlanFeatures };
      }
      return p;
    }));

    await togglePlanFeature(planId, featureCode, isEnabled);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-primary" />
            Pricing Editor
          </h1>
          <p className="text-muted-foreground mt-1">
            Design and manage your subscription tiers and feature lists.
          </p>
        </div>
      </div>

      {/* Global Features Manager */}
      <GlassCard className="p-6 border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 mb-4">
          <ListChecks className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-white">Global Features Manager</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Add features here, then use the checkboxes in the plans below to easily toggle them on or off.
        </p>
        
        <form onSubmit={handleAddGlobalFeature} className="flex gap-2 mb-6 max-w-md">
          <input 
            type="text" 
            value={newFeatureName}
            onChange={(e) => setNewFeatureName(e.target.value)}
            placeholder="e.g. Priority Support"
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
          />
          <button 
            type="submit"
            disabled={isSaving || !newFeatureName.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Add Feature
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {globalFeatures.map((feature: any) => (
            <div key={feature.code} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-sm text-white/80 group">
              <span>{feature.name}</span>
              <button 
                onClick={() => handleDeleteGlobalFeature(feature.code)}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all"
                title="Delete Global Feature"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {globalFeatures.length === 0 && (
            <span className="text-sm text-muted-foreground italic">No global features defined yet.</span>
          )}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative"
            onClick={() => setActivePlanId(plan.id)}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                  Most Popular
                </span>
              </div>
            )}
            
            <GlassCard 
              className={`p-6 cursor-pointer transition-all duration-300 h-full flex flex-col ${
                activePlanId === plan.id 
                  ? 'border-primary shadow-[0_0_30px_rgba(59,130,246,0.15)] ring-1 ring-primary/50' 
                  : 'hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id); }}
                    className="p-1.5 hover:bg-red-500/20 rounded-md text-red-400 transition-colors"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 flex-1 mt-4 border-t border-white/10 pt-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Features Included</h4>
                
                {globalFeatures.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Add global features above.</p>
                ) : (
                  globalFeatures.map((feature: any) => {
                    const isEnabled = plan.planFeatures?.some((pf: any) => pf.featureCode === feature.code);
                    return (
                      <label 
                        key={feature.code} 
                        className="flex items-center gap-3 text-sm cursor-pointer group"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={isEnabled}
                            onChange={() => handleTogglePlanFeature(plan.id, feature.code, isEnabled)}
                          />
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            isEnabled 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'border-white/20 bg-black/20 group-hover:border-white/40'
                          }`}>
                            {isEnabled && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                        <span className={isEnabled ? 'text-white' : 'text-muted-foreground'}>
                          {feature.name}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </GlassCard>
          </motion.div>
        ))}

        {/* Add New Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={handleCreatePlan}
          className="cursor-pointer"
        >
          <GlassCard 
            className="p-6 h-full min-h-[400px] border-dashed border-2 border-white/10 hover:border-primary/50 transition-colors flex flex-col items-center justify-center text-center group"
          >
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors group-hover:scale-110 duration-300">
              <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Create New Tier</h3>
            <p className="text-sm text-muted-foreground">Add a new pricing plan to your offerings.</p>
          </GlassCard>
        </motion.div>
      </div>
      
      {/* Settings Panel for Active Plan */}
      {activePlan && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-8"
        >
          <GlassCard className="p-6 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-6">
              <Settings2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-white">Tier Settings: {activePlan.name}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Plan Name</label>
                  <input 
                    type="text" 
                    value={activePlan.name} 
                    onChange={(e) => handleUpdatePlan(activePlan.id, { name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Price</label>
                  <input 
                    type="text" 
                    value={activePlan.price} 
                    onChange={(e) => handleUpdatePlan(activePlan.id, { price: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Period (e.g. /month)</label>
                  <input 
                    type="text" 
                    value={activePlan.period} 
                    onChange={(e) => handleUpdatePlan(activePlan.id, { period: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors" 
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={activePlan.isPopular} 
                        onChange={(e) => handleUpdatePlan(activePlan.id, { isPopular: e.target.checked })}
                      />
                      <div className="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                    <span className="text-sm font-medium text-white">Feature this plan (Most Popular Highlight)</span>
                  </label>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
