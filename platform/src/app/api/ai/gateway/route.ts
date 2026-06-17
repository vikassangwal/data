import { NextRequest, NextResponse } from 'next/server';
import { UniversalAIGateway } from '@/lib/ai/gateway';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    if (!payload.prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const result = await UniversalAIGateway.executeRequest({
      prompt: payload.prompt,
      systemPrompt: payload.systemPrompt,
      temperature: payload.temperature,
      maxTokens: payload.maxTokens,
      model: payload.model,
      taskType: payload.taskType
    });

    if (result.error) {
      return NextResponse.json({ error: result.error, ...result }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[AI Gateway API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
