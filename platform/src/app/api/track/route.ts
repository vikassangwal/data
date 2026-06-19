export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { path } = await req.json();

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    // Extract basic headers for analytics
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    // Get IP address (useful for hashing to count unique visitors)
    // On Vercel, x-forwarded-for is populated
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // Hash IP for privacy (GDPR compliance)
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    // Vercel specific headers for location
    const country = req.headers.get('x-vercel-ip-country') || 'Unknown';

    // Store the page view
    await prisma.pageView.create({
      data: {
        path,
        userAgent,
        ipHash,
        country,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to track page view:', error);
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
  }
}
