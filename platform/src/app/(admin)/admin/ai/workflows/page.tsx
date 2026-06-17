import GlassCard from '@/components/ui/GlassCard';
import { Workflow, Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'AI Workflows | Admin Panel',
};

export default function AIWorkflowsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Workflows & Agents</h1>
          <p className="text-muted-foreground mt-1">
            Build multi-agent architectures and connect prompt chains.
          </p>
        </div>
        <Link href="/admin/ai/workflows/builder" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Create Workflow
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/ai/workflows/builder" className="block">
          <GlassCard className="p-8 text-center flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-border/50 hover:border-primary/50 transition-colors cursor-pointer group h-full">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">Blank Workflow</h3>
            <p className="text-sm text-muted-foreground">Start from scratch with the visual builder.</p>
          </GlassCard>
        </Link>

        <GlassCard className="p-8 flex flex-col justify-between min-h-[300px] border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
          <div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Workflow className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-xl mb-2">Support Auto-Responder</h3>
            <p className="text-sm text-muted-foreground">
              Analyzes incoming user queries, classifies them, and drafts an automated response using Claude 3 Opus.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-6 pt-6 border-t border-border/50">
            <span className="px-2 py-1 bg-muted rounded text-xs font-medium">3 Agents</span>
            <span className="px-2 py-1 bg-muted rounded text-xs font-medium">Active</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
