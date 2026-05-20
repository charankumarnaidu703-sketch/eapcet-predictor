import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'Missing name param' }, { status: 400 });
  }

  // Try exact match first (when name is passed from card click)
  let { data, error } = await supabase
    .from('eapcet_cutoffs')
    .select('*')
    .ilike('college_name', name.trim())
    .order('year', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If no exact match, try wildcard search
  if (!data || data.length === 0) {
    const { data: wildcardData } = await supabase
      .from('eapcet_cutoffs')
      .select('*')
      .ilike('college_name', `%${name.trim()}%`)
      .order('year', { ascending: false });
    
    if (wildcardData && wildcardData.length > 0) {
      data = wildcardData;
    } else {
      // If no wildcard results, try word-by-word fuzzy fallback
      const words = name
        .replace(/-/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 3)
        .slice(0, 3);

      if (words.length > 0) {
        const { data: fuzzy } = await supabase
          .from('eapcet_cutoffs')
          .select('*')
          .ilike('college_name', `%${words[0]}%`)
          .order('year', { ascending: false });
        data = fuzzy;
      }
    }
  }

  return NextResponse.json(
    { data: data ?? [] },
    { headers: { 'Cache-Control': 'public, s-maxage=3600' } }
  );
}
