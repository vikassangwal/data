'use client';

import { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { Route, Plus, Trash2 } from 'lucide-react';

export default function RoutingClientPage({ providers, initialRules }: { providers: any[], initialRules: any[] }) {
  // Mock client state since server actions aren't fully implemented for rules here yet
  const [rules, setRules] = useState(initialRules);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg">
          <Plus className="w-4 h-4" /> New Rule
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rules.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
            No routing rules configured. All requests will use the Default Active Provider.
          </div>
        ) : (
          rules.map(rule => (
            <GlassCard key={rule.id} className="p-4 flex items-center justify-between border border-border/50">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded-lg">
                  <Route className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Task: {rule.taskType}</h3>
                  <p className="text-sm text-muted-foreground">
                    Routed to Provider ID: {rule.providerId}
                  </p>
                </div>
              </div>
              <button className="text-error hover:bg-error/10 p-2 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
