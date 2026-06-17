import { getAiProviders } from '@/app/actions/ai-providers';
import prisma from '@/lib/db';
import RoutingClientPage from './RoutingClientPage';

export const metadata = {
  title: 'Smart AI Routing | Admin Panel',
};

export default async function AIRoutingPage() {
  const providers = await getAiProviders();
  const routingRules = await prisma.aiRoutingRule.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Smart AI Routing</h1>
          <p className="text-muted-foreground mt-1">
            Map specific tasks (e.g., Coding, Support) to specialized AI models.
          </p>
        </div>
      </div>

      <RoutingClientPage providers={providers} initialRules={routingRules} />
    </div>
  );
}
