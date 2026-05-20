import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/* ─── Types ──────────────────────────────────────────────── */
export interface PredictRequest {
  rank: number;
  category?: string;
  gender?: string;
  branch?: string;
  location?: string;
}

export interface PredictResult {
  college_name: string;
  branch: string;
  location: string;
  type: string;
  closing_rank: string;
  opening_rank: string;
  annual_fees: string;
  placement_rating: number | null;
  probability: 'Safe' | 'Medium' | 'Reach';
  probability_pct: number;
  slug: string;
}

/* ─── Helpers ────────────────────────────────────────────── */
function parseRank(rankStr: string | null): number | null {
  if (!rankStr || rankStr === '-') return null;
  const parts = rankStr.split('-').map(s => s.trim()).filter(Boolean);
  const nums = parts.map(p => parseInt(p.replace(/\D/g, ''), 10)).filter(n => !isNaN(n) && n > 0);
  return nums.length ? Math.min(...nums) : null;
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Accurate approximation of the Standard Normal Cumulative Distribution Function
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

// The Trend-Adjusted Normal Distribution Model
function calculatePrediction(
  userRank: number,
  records: any[] // Must be sorted by year descending
): { probability: 'Safe' | 'Medium' | 'Reach'; pct: number } {
  const latest = records[0];
  const latestClosing = parseRank(latest.closing_rank);
  const latestOpening = parseRank(latest.opening_rank);
  
  if (!latestClosing) return { probability: 'Reach', pct: 5 };
  
  // 1. Time-Series Trend Analysis
  let trendAdjustment = 0;
  if (records.length > 1) {
    const prev = records[1];
    const prevClosing = parseRank(prev.closing_rank);
    if (prevClosing) {
      // e.g. 10000 (latest) - 12000 (prev) = -2000 (getting harder)
      const rawTrend = latestClosing - prevClosing; 
      // Dampen the trend by 50% and clamp to max +/- 15% of the closing rank to avoid outliers
      const maxSwing = latestClosing * 0.15;
      trendAdjustment = Math.max(-maxSwing, Math.min(maxSwing, rawTrend * 0.5)); 
    }
  }
  
  // 2. Expected Cutoff
  const expectedCutoff = Math.max(1, latestClosing + trendAdjustment);
  
  // 3. Volatility (Spread Measurement)
  let spread = 0;
  if (latestOpening && latestOpening < latestClosing) {
    spread = latestClosing - latestOpening;
  } else {
    // Default to 10% spread if opening rank is invalid/missing
    spread = latestClosing * 0.1; 
  }
  
  // Standard deviation (sigma) based on spread. Minimum 5% to prevent instantaneous steps.
  const sigma = Math.max(spread * 0.4, expectedCutoff * 0.05);
  
  // 4. Z-Score and Probability
  // Positive Z means userRank is better (lower) than expectedCutoff
  const z = (expectedCutoff - userRank) / sigma;
  
  let pct = Math.round(normalCDF(z) * 100);
  pct = Math.max(1, Math.min(99, pct)); // Clamp to realistic bounds
  
  // 5. Hard threshold caps
  // If rank is completely out of the galaxy (> 1.5x expected), cap probability strictly
  if (userRank > expectedCutoff * 1.5) {
      pct = Math.min(pct, 5);
  }

  // 6. Tier assignment
  let probability: 'Safe' | 'Medium' | 'Reach' = 'Reach';
  if (pct >= 75) probability = 'Safe';
  else if (pct >= 40) probability = 'Medium';
  
  return { probability, pct };
}

/* ─── Route Handler ──────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body: PredictRequest = await req.json();
    const { rank, branch, location } = body;

    if (!rank || rank < 1 || rank > 250000) {
      return NextResponse.json({ error: 'Invalid rank. Must be 1–2,50,000.' }, { status: 400 });
    }

    /* Query Supabase – getting up to last 3 years (2023, 2024, 2025) for trend analysis */
    let query = supabase
      .from('eapcet_cutoffs')
      .select('college_name,type,year,branch,opening_rank,closing_rank,annual_fees,placement_rating,location')
      .gte('year', 2023)
      .neq('closing_rank', '-')
      .order('year', { ascending: false });

    if (branch && branch !== 'All') query = query.ilike('branch', `%${branch}%`);
    if (location && location !== 'All') query = query.eq('location', location);

    const { data, error } = await query.limit(5000);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    /* Group by college+branch to collect historical records per course */
    const map = new Map<string, any[]>();
    for (const row of data ?? []) {
      const key = `${row.college_name}__${row.branch}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    }

    /* Score & filter using statistical model */
    const ORDER = { Safe: 0, Medium: 1, Reach: 2 };
    const results: PredictResult[] = [];

    for (const [key, records] of map) {
      // records are already sorted by year desc from Supabase
      const latest = records[0];
      const latestClosingNum = parseRank(latest.closing_rank);
      
      if (!latestClosingNum) continue;
      
      // Preliminary filter: if rank is insanely far off the raw cutoff, skip expensive math
      if (rank > latestClosingNum * 2.0) continue; 

      const { probability, pct } = calculatePrediction(rank, records);

      // Final strict filter to avoid returning too much noise
      if (pct < 2 && rank > latestClosingNum * 1.5) continue;

      results.push({
        college_name: latest.college_name as string,
        branch: latest.branch as string,
        location: latest.location as string,
        type: latest.type as string,
        closing_rank: latest.closing_rank as string,
        opening_rank: latest.opening_rank as string,
        annual_fees: latest.annual_fees as string,
        placement_rating: latest.placement_rating as number | null,
        probability,
        probability_pct: pct,
        slug: toSlug(latest.college_name as string),
      });
    }

    // Sort by tier first, then exact percentage
    results.sort((a, b) => {
      if (ORDER[a.probability] !== ORDER[b.probability])
        return ORDER[a.probability] - ORDER[b.probability];
      return b.probability_pct - a.probability_pct;
    });

    return NextResponse.json(
      { results, count: results.length, rank },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    console.error('[/api/predict]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/* ─── GET — for metadata/filters ────────────────────────── */
export async function GET() {
  const [branchRes, locationRes] = await Promise.all([
    supabase.from('eapcet_cutoffs').select('branch').eq('year', 2025),
    supabase.from('eapcet_cutoffs').select('location').eq('year', 2025),
  ]);

  const branches = ['All', ...new Set((branchRes.data ?? []).map(r => r.branch as string))].sort();
  const locations = ['All', ...new Set((locationRes.data ?? []).map(r => r.location as string))].sort();

  return NextResponse.json(
    { branches, locations },
    { headers: { 'Cache-Control': 'public, s-maxage=3600' } }
  );
}
