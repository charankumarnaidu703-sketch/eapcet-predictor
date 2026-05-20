import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    // Production: Save to Supabase
    const { error } = await supabase
      .from('analytics_events')
      .insert({ event, metadata: metadata || {} });

    if (error) {
      console.error('Supabase analytics insert error:', error.message);
      // Don't fail the request if analytics fails
      return NextResponse.json({ success: true, warning: 'Analytics not saved' });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
