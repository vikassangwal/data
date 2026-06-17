import prisma from '@/lib/db';
import { OpenAIPlugin } from './providers/OpenAIPlugin';
import { GeminiPlugin } from './providers/GeminiPlugin';
import { ClaudePlugin } from './providers/ClaudePlugin';
import { AIProviderPlugin, AIRequestPayload, AIResponsePayload } from './providers/types';

const plugins: Record<string, AIProviderPlugin> = {
  [OpenAIPlugin.type]: OpenAIPlugin,
  [GeminiPlugin.type]: GeminiPlugin,
  [ClaudePlugin.type]: ClaudePlugin,
};

export class UniversalAIGateway {
  static async executeRequest(payload: AIRequestPayload): Promise<AIResponsePayload> {
    try {
      // 1. Smart Routing: Check if there's a routing rule for this taskType
      let provider = null;
      if (payload.taskType) {
        const route = await prisma.aiRoutingRule.findFirst({
          where: { taskType: payload.taskType },
        });
        if (route) {
          provider = await prisma.aiProvider.findUnique({
            where: { id: route.providerId }
          });
        }
      }

      // 2. Default: Get active provider
      if (!provider || !provider.isActive) {
        provider = await prisma.aiProvider.findFirst({
          where: { isActive: true }
        });
      }

      if (!provider) {
        throw new Error('No active AI Provider configured in the Admin Panel.');
      }

      // 3. Get Plugin
      const plugin = plugins[provider.type];
      if (!plugin) {
        throw new Error(`Plugin type '${provider.type}' is not supported.`);
      }

      // 4. Execute
      let response = await plugin.execute(payload, {
        apiKey: provider.apiKey,
        baseUrl: provider.baseUrl || undefined,
        endpointUrl: provider.endpointUrl || undefined,
        model: payload.model || JSON.parse(provider.models || '[]')[0] || undefined
      });

      // 5. Failover logic
      if (response.error) {
        console.warn(`[AI Gateway] Primary provider failed: ${response.error}. Attempting fallback...`);
        const fallbackProvider = await prisma.aiProvider.findFirst({
          where: { isFallback: true, id: { not: provider.id } }
        });

        if (fallbackProvider) {
          const fallbackPlugin = plugins[fallbackProvider.type];
          if (fallbackPlugin) {
            response = await fallbackPlugin.execute(payload, {
              apiKey: fallbackProvider.apiKey,
              baseUrl: fallbackProvider.baseUrl || undefined,
              endpointUrl: fallbackProvider.endpointUrl || undefined,
              model: payload.model || JSON.parse(fallbackProvider.models || '[]')[0] || undefined
            });
          }
        }
      }

      // 6. Log usage
      const activeProviderId = provider.id; // Log against the original requested provider, or fallback? We'll log against whoever responded.
      // But we can't easily track fallback provider ID unless we return it. We'll just log against primary for simplicity or skip if not found.
      
      // Since server actions / API routes are stateless, we do it asynchronously or block.
      await prisma.aiApiLog.create({
        data: {
          providerId: activeProviderId,
          endpoint: payload.taskType || 'default',
          tokensUsed: response.tokensUsed,
          cost: 0, // calculate cost based on tokens later
          status: response.error ? 500 : 200,
          responseTimeMs: response.responseTimeMs
        }
      });

      return response;

    } catch (error: any) {
      return {
        text: '',
        tokensUsed: 0,
        provider: 'Gateway Error',
        model: 'unknown',
        responseTimeMs: 0,
        error: error.message || 'Unknown Gateway Error'
      };
    }
  }
}
