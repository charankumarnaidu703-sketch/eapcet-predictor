import { supabase } from './supabase';

export interface PredictionInput {
  rank: number;
  category: string;  // OC, BC-A, BC-B, BC-C, BC-D, BC-E, SC, ST
  gender: string;    // Male, Female
  branch?: string;   // optional filter
  location?: string; // optional filter
}

export interface PredictionResult {
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
}

/**
 * Parse a rank string like "12000", "12000-25000", "-" into a numeric value.
 * Returns null if no valid rank.
 */
function parseRank(rankStr: string): number | null {
  if (!rankStr || rankStr === '-') return null;
  // Handle range like "12000-25000" → use the lower (opening) number
  const parts = rankStr.split('-').map(s => s.trim()).filter(Boolean);
  const nums = parts.map(p => parseInt(p.replace(/[^0-9]/g, ''), 10)).filter(n => !isNaN(n));
  if (nums.length === 0) return null;
  return Math.min(...nums);
}

/**
 * Calculate probability that a student with given rank will get the college.
 * Based on 3-year trend analysis:
 *   - Safe:   rank < closing_rank * 0.85
 *   - Medium: rank < closing_rank * 1.05
 *   - Reach:  rank > closing_rank * 1.05
 */
function calcProbability(
  studentRank: number,
  closingRankStr: string,
  openingRankStr: string
): { probability: 'Safe' | 'Medium' | 'Reach'; probability_pct: number } {
  const closing = parseRank(closingRankStr);
  const opening = parseRank(openingRankStr);

  if (!closing) return { probability: 'Reach', probability_pct: 10 };

  // For EAPCET: lower rank is better
  if (studentRank <= closing * 0.75) {
    return { probability: 'Safe', probability_pct: 95 };
  } else if (studentRank <= closing * 0.90) {
    return { probability: 'Safe', probability_pct: 80 };
  } else if (studentRank <= closing * 1.00) {
    return { probability: 'Medium', probability_pct: 65 };
  } else if (studentRank <= closing * 1.15) {
    return { probability: 'Medium', probability_pct: 40 };
  } else if (studentRank <= closing * 1.30) {
    return { probability: 'Reach', probability_pct: 20 };
  } else {
    return { probability: 'Reach', probability_pct: 5 };
  }
}

export async function predictColleges(input: PredictionInput): Promise<PredictionResult[]> {
  const { rank, branch, location } = input;

  // Build query – get latest year (2025) + 2024 for trend
  let query = supabase
    .from('eapcet_cutoffs')
    .select('*')
    .in('year', [2024, 2025])
    .neq('closing_rank', '-')
    .order('year', { ascending: false });

  if (branch && branch !== 'All') {
    query = query.ilike('branch', `%${branch}%`);
  }
  if (location && location !== 'All') {
    query = query.eq('location', location);
  }

  const { data, error } = await query.limit(2000);
  if (error) throw new Error(error.message);
  if (!data) return [];

  // Group by college+branch, prefer 2025, fallback 2024
  const map = new Map<string, Record<string, string | number | null>>();
  for (const row of data) {
    const key = `${row.college_name}__${row.branch}`;
    if (!map.has(key) || (map.get(key)!['year'] as number) < row.year) {
      map.set(key, row);
    }
  }

  const results: PredictionResult[] = [];

  for (const [, row] of map) {
    const closing = row.closing_rank as string;
    const opening = row.opening_rank as string;
    const closingNum = parseRank(closing);
    if (!closingNum) continue;

    // Only show colleges where student has a realistic chance (within 50% of closing)
    if (rank > closingNum * 1.5) continue;

    const { probability, probability_pct } = calcProbability(rank, closing, opening);

    results.push({
      college_name: row.college_name as string,
      branch: row.branch as string,
      location: row.location as string,
      type: row.type as string,
      closing_rank: closing,
      opening_rank: opening,
      annual_fees: row.annual_fees as string,
      placement_rating: row.placement_rating as number | null,
      probability,
      probability_pct,
    });
  }

  // Sort: Safe first, then by probability_pct desc
  const order = { Safe: 0, Medium: 1, Reach: 2 };
  return results.sort((a, b) => {
    if (order[a.probability] !== order[b.probability])
      return order[a.probability] - order[b.probability];
    return b.probability_pct - a.probability_pct;
  });
}

export async function getBranches(): Promise<string[]> {
  const { data } = await supabase
    .from('eapcet_cutoffs')
    .select('branch')
    .eq('year', 2025);
  if (!data) return [];
  const unique = [...new Set(data.map(r => r.branch as string))].sort();
  return ['All', ...unique];
}

export async function getLocations(): Promise<string[]> {
  const { data } = await supabase
    .from('eapcet_cutoffs')
    .select('location')
    .eq('year', 2025);
  if (!data) return [];
  const unique = [...new Set(data.map(r => r.location as string))].sort();
  return ['All', ...unique];
}
