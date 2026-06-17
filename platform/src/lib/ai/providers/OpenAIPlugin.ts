import { AIProviderPlugin, AIRequestPayload, AIResponsePayload } from './types';

export const OpenAIPlugin: AIProviderPlugin = {
  id: 'openai_compatible',
  type: 'openai_compatible',
  name: 'OpenAI Compatible',
  async execute(request, config) {
    const startTime = Date.now();
    
    try {
      const endpoint = config.endpointUrl || `${config.baseUrl || 'https://api.openai.com/v1'}/chat/completions`;
      
      const messages = [];
      if (request.systemPrompt) {
        messages.push({ role: 'system', content: request.systemPrompt });
      }
      messages.push({ role: 'user', content: request.prompt });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model || request.model || 'gpt-4o',
          messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 2048,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      return {
        text: data.choices?.[0]?.message?.content || '',
        tokensUsed: data.usage?.total_tokens || 0,
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
        error: error.message || 'Unknown error occurred in OpenAIPlugin'
      };
    }
  }
};
