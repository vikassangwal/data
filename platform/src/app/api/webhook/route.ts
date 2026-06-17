import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Determine the source of the webhook (e.g. ?source=stripe)
    const url = new URL(req.url);
    const source = url.searchParams.get('source') || 'unknown';
    
    // Parse Payload
    const payload = await req.json().catch(() => ({}));

    // Here we can use the UniversalGateway or Prisma to log the webhook
    // For now, we will log it to console or database. In a real system,
    // you would trigger specific workflows based on `source` (e.g. n8n, Stripe).
    
    console.log(`[Webhook Received] Source: ${source}`, payload);

    // If source is Stripe, verify signature and update DB...
    // If source is Custom Tool, push event to ML pipeline or Data file...

    return NextResponse.json({ received: true, source });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
