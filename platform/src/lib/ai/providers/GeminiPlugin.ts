import { AIProviderPlugin, AIRequestPayload, AIResponsePayload } from './types';

export const GeminiPlugin: AIProviderPlugin = {
  id: 'gemini',
  type: 'gemini',
  name: 'Google Gemini API',
  async execute(request, config) {
    const startTime = Date.now();
    
    try {
      const model = config.model || request.model || 'gemini-1.5-pro';
      const endpoint = config.endpointUrl || `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;
      
      let contents = [];
      if (request.systemPrompt) {
        // Gemini handles system prompts via systemInstruction or prepending, 
        // we'll use systemInstruction for v1beta if supported, or prepend for safety here.
      }
      
      contents.push({
        role: 'user',
        parts: [{ text: (request.systemPrompt ? `System: ${request.systemPrompt}\n\n` : '') + request.prompt }]
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: request.temperature ?? 0.7,
            maxOutputTokens: request.maxTokens ?? 2048,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return {
        text,
        tokensUsed: data.usageMetadata?.totalTokenCount || 0,
        provider: this.name,
        model: model,
        responseTimeMs: Date.now() - startTime
      };
    } catch (error: any) {
      return {
        text: '',
        tokensUsed: 0,
        provider: this.name,
        model: config.model || 'unknown',
        responseTimeMs: Date.now() - startTime,
        error: error.message || 'Unknown error occurred in GeminiPlugin'
      };
    }
  }
};
