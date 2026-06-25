import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organization, profession } = await req.json();

    if (!organization || !profession) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        organization,
        profession
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
