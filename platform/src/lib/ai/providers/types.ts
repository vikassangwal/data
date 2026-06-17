export interface AIRequestPayload {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
  taskType?: string;
}

export interface AIResponsePayload {
  text: string;
  tokensUsed: number;
  provider: string;
  model: string;
  responseTimeMs: number;
  error?: string;
}

export interface AIProviderPlugin {
  id: string;
  type: string;
  name: string;
  execute(
    request: AIRequestPayload,
    config: { apiKey: string; baseUrl?: string; endpointUrl?: string; model?: string }
  ): Promise<AIResponsePayload>;
}
