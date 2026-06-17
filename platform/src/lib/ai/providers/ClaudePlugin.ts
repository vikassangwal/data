import { AIProviderPlugin, AIRequestPayload, AIResponsePayload } from './types';

export const ClaudePlugin: AIProviderPlugin = {
  id: 'claude',
  type: 'claude',
  name: 'Anthropic Claude API',
  async execute(request, config) {
    const startTime = Date.now();
    
    try {
      const endpoint = config.endpointUrl || 'https://api.anthropic.com/v1/messages';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: config.model || request.model || 'claude-3-opus-20240229',
          system: request.systemPrompt,
          messages: [
            { role: 'user', content: request.prompt }
          ],
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 2048,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      return {
        text: data.content?.[0]?.text || '',
        tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        provider: this.name,
        model: data.model,
        responseTimeMs: Date.now() - startTime
      };
    } catch (error: any) {
      return {
        text: '',
        tokensUsed: 0,
        provider: this.name,
        model: config.model || 'unknown',
        responseTimeMs: Date.now() - startTime,
        error: error.message || 'Unknown error occurred in ClaudePlugin'
      };
    }
  }
};
