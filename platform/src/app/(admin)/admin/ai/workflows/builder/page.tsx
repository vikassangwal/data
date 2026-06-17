import WorkflowCanvas from '@/components/workflows/WorkflowCanvas';
import Button from '@/components/ui/Button';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Workflow Builder | Admin Panel',
};

export default function WorkflowBuilderPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/ai/workflows" className="p-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workflow Builder</h1>
            <p className="text-muted-foreground mt-1">
              Drag and drop nodes to create custom AI chains.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">Discard</Button>
          <Button icon={<Save className="w-4 h-4" />}>Save Workflow</Button>
        </div>
      </div>

      <WorkflowCanvas />
    </div>
  );
}
