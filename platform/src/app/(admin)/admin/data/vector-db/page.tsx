import GlassCard from '@/components/ui/GlassCard';
import { Database, Search, Activity } from 'lucide-react';

export const metadata = {
  title: 'Vector DB Analytics | Admin Panel',
};

export default function VectorDBPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vector Database</h1>
          <p className="text-muted-foreground mt-1">
            Monitor embedding storage, index health, and similarity search performance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassCard className="p-6 border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-muted-foreground">Total Vectors</h3>
            <Database className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-muted-foreground mt-2">Across all indexes</p>
        </GlassCard>
        
        <GlassCard className="p-6 border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-muted-foreground">Active Indexes</h3>
            <Activity className="w-5 h-5 text-secondary" />
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-muted-foreground mt-2">Pinecone / Chroma</p>
        </GlassCard>

        <GlassCard className="p-6 border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-muted-foreground">Recent Queries</h3>
            <Search className="w-5 h-5 text-accent" />
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-muted-foreground mt-2">Last 24 hours</p>
        </GlassCard>
      </div>

      <GlassCard className="p-12 text-center border-dashed border-2 border-border/50">
        <h3 className="text-xl font-bold mb-2">No Active Indexes</h3>
        <p className="text-muted-foreground">Process a dataset to generate embeddings and create your first index.</p>
      </GlassCard>
    </div>
  );
}
