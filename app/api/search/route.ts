import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // 1. Search for matching colleges
  const { data: collegesData, error: colError } = await supabase
    .from('eapcet_cutoffs')
    .select('college_name, location')
    .ilike('college_name', `%${q}%`)
    .order('college_name', { ascending: true });

  // 2. Search for matching locations
  const { data: locationsData, error: locError } = await supabase
    .from('eapcet_cutoffs')
    .select('location')
    .ilike('location', `%${q}%`);

  if (colError || locError) {
    return NextResponse.json(
      { error: colError?.message || locError?.message },
      { status: 500 }
    );
  }

  // Deduplicate locations
  const seenLocations = new Set<string>();
  for (const row of locationsData ?? []) {
    if (row.location) {
      seenLocations.add(row.location);
    }
  }

  // Deduplicate colleges
  const seenColleges = new Map<string, string>();
  for (const row of collegesData ?? []) {
    if (!seenColleges.has(row.college_name)) {
      seenColleges.set(row.college_name, row.location ?? '');
    }
  }

  const results: any[] = [];

  // Add up to 3 location suggestions
  const locationResults = Array.from(seenLocations)
    .slice(0, 3)
    .map(loc => ({
      name: loc,
      location: loc,
      type: 'location'
    }));
  results.push(...locationResults);

  // Add matching colleges
  const collegeResults = Array.from(seenColleges.entries())
    .slice(0, 10 - results.length)
    .map(([name, location]) => ({
      name,
      location,
      type: 'college'
    }));
  results.push(...collegeResults);

  return NextResponse.json(
    { results },
    { headers: { 'Cache-Control': 'public, s-maxage=3600' } }
  );
}

