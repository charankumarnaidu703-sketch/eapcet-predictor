import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Search for matching college names using ilike
  const { data, error } = await supabase
    .from('eapcet_cutoffs')
    .select('college_name, location')
    .ilike('college_name', `%${q}%`)
    .order('college_name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Deduplicate by college_name, keeping the first location found
  const seen = new Map<string, string>();
  for (const row of data ?? []) {
    if (!seen.has(row.college_name)) {
      seen.set(row.college_name, row.location ?? '');
    }
  }

  const results = Array.from(seen.entries())
    .slice(0, 10)
    .map(([name, location]) => ({ name, location }));

  return NextResponse.json(
    { results },
    { headers: { 'Cache-Control': 'public, s-maxage=3600' } }
  );
}
