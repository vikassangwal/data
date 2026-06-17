import { getAiProviders } from '@/app/actions/ai-providers';
import ProviderClientPage from './ProviderClientPage';
import { Cpu } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AiProvidersPage() {
  const providers = await getAiProviders();

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Cpu className="w-8 h-8 text-primary animate-pulse" />
          AI Provider Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure API keys, model endpoints, and connect to local/custom inferences (Ollama, LMStudio, HuggingFace, or OpenAI).
        </p>
      </div>

      <ProviderClientPage initialProviders={providers} />
    </div>
  );
}
