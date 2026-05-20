import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, metadata } = body;

    if (!event) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics Event Tracked]: ${event}`, metadata);
      return NextResponse.json({ success: true, mode: 'development' });
    }

    // Production: Save to database
    await prisma.analyticsEvent.create({
      data: {
        event,
        metadata: metadata || {},
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
