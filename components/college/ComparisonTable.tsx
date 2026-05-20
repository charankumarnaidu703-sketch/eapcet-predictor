'use client';
import { useEffect, useRef } from 'react';
import type { CollegeData } from '@/app/compare/page';
import { parseFee, parseRank, formatINR } from '@/lib/utils';

interface Props { colleges: CollegeData[]; studentRank: number | null; }

function getBestIdx(values: (number | null)[], higherIsBetter: boolean): number {
  let bestIdx = -1; let bestVal: number | null = null;
  for (let i = 0; i < values.length; i++) {
    const v = values[i]; if (v === null) continue;
    if (bestVal === null || (higherIsBetter ? v > bestVal : v < bestVal)) { bestVal = v; bestIdx = i; }
  }
  return bestIdx;
}

function calcProbability(closingRank: number | null, studentRank: number | null): number | null {
  if (!closingRank || !studentRank) return null;
  if (studentRank <= closingRank * 0.75) return 90;
  if (studentRank <= closingRank * 0.90) return 80;
  if (studentRank <= closingRank)        return 65;
  if (studentRank <= closingRank * 1.15) return 40;
  if (studentRank <= closingRank * 1.30) return 20;
  return 5;
}

export default function ComparisonTable({ colleges, studentRank }: Props) {
  const tableRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = tableRef.current;
    if (el && el.scrollWidth > el.clientWidth) el.dataset.overflow = 'true';
  }, []);

  if (colleges.length === 0) return null;

  const stats = colleges.map((c) => {
    const allRows = c.rows;
    const years = [...new Set(allRows.map(r => r.year))].sort((a, b) => b - a);
    const latestYear = years[0] ?? 0;
    const latestRows = allRows.filter(r => r.year === latestYear);
    const csRow = latestRows.find(r => r.branch.toLowerCase().includes('cse') || r.branch.toLowerCase().includes('computer'));
    const rankRow = csRow ?? latestRows[0];
    const latestClosingRank = rankRow ? parseRank(rankRow.closing_rank) : null;
    const prob = calcProbability(latestClosingRank, studentRank);
    const fees = allRows.map(r => parseFee(r.annual_fees)).filter((f): f is number => f !== null);
    const minFee = fees.length ? Math.min(...fees) : null;
    const maxFee = fees.length ? Math.max(...fees) : null;
    const ratings = allRows.map(r => r.placement_rating).filter((r): r is number => r !== null && r > 0);
    const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
    const branches = [...new Set(latestRows.map(r => r.branch))];
    return { latestClosingRank, prob, minFee, maxFee, avgRating, branches, location: c.location, type: c.type };
  });

  const bestProbIdx   = getBestIdx(stats.map(s => s.prob), true);
  const bestRankIdx   = getBestIdx(stats.map(s => s.latestClosingRank), false);
  const bestMinFeeIdx = getBestIdx(stats.map(s => s.minFee), false);
  const bestMaxFeeIdx = getBestIdx(stats.map(s => s.maxFee), false);
  const bestRatingIdx = getBestIdx(stats.map(s => s.avgRating), true);

  /* ── Styles (using editorial design vars) ── */
  const cellStyle = (isBest: boolean): React.CSSProperties => ({
    padding: '13px 18px', textAlign: 'center',
    fontSize: '.88rem', fontFamily: 'Plus Jakarta Sans,sans-serif',
    color: isBest ? 'var(--safe)' : 'var(--text)',
    background: isBest ? 'var(--safe-bg)' : 'transparent',
    fontWeight: isBest ? 700 : 400,
    borderBottom: '1px solid var(--line)',
    minWidth: 200,
    transition: 'background .15s',
  });

  const headerStyle: React.CSSProperties = {
    padding: '16px 18px', textAlign: 'center',
    fontSize: '.78rem', fontWeight: 700,
    color: 'var(--gold)', letterSpacing: '.04em',
    borderBottom: '2px solid var(--line-dk)',
    minWidth: 200,
    background: 'var(--navy)',
    lineHeight: 1.4,
    fontFamily: 'Plus Jakarta Sans,sans-serif',
  };

  const rowLabelStyle: React.CSSProperties = {
    padding: '13px 18px', fontSize: '.75rem', fontWeight: 700,
    color: 'var(--subtle)', letterSpacing: '.06em', textTransform: 'uppercase',
    borderBottom: '1px solid var(--line)',
    position: 'sticky', left: 0,
    background: 'var(--cream)', whiteSpace: 'nowrap',
    minWidth: 180, zIndex: 2,
    fontFamily: 'Plus Jakarta Sans,sans-serif',
  };

  const rows: { label: string; values: React.ReactNode[]; bestIdx: number }[] = [
    { label: '📍 Location',      values: stats.map(s => s.location || '—'), bestIdx: -1 },
    { label: '🏛 Type',          values: stats.map(s => s.type || '—'), bestIdx: -1 },
    {
      label: '🎓 Branches',
      values: stats.map(s => s.branches.length > 0
        ? <span style={{ fontSize: '.78rem', lineHeight: 1.7, textAlign: 'left', display: 'block' }}>{s.branches.join(' · ')}</span>
        : '—'),
      bestIdx: -1,
    },
    {
      label: '🏆 Closing Rank (Latest)',
      values: stats.map(s => s.latestClosingRank
        ? <span style={{ fontFamily: 'Playfair Display,serif', fontWeight: 800, fontSize: '1rem' }}>{s.latestClosingRank.toLocaleString('en-IN')}</span>
        : 'N/A'),
      bestIdx: bestRankIdx,
    },
    ...(studentRank ? [{
      label: '🎯 Your Admission Chance',
      values: stats.map(s => s.prob !== null ? (
        <span style={{
          padding: '4px 12px', borderRadius: 'var(--r)',
          fontSize: '.82rem', fontWeight: 700,
          background: s.prob >= 70 ? 'var(--safe-bg)' : s.prob >= 40 ? 'var(--med-bg)' : 'var(--reach-bg)',
          color: s.prob >= 70 ? 'var(--safe)' : s.prob >= 40 ? 'var(--med)' : 'var(--reach)',
        }}>{s.prob}%</span>
      ) : 'N/A'),
      bestIdx: bestProbIdx,
    }] : []),
    { label: '💰 Min Annual Fee', values: stats.map(s => s.minFee ? formatINR(s.minFee) : 'N/A'), bestIdx: bestMinFeeIdx },
    { label: '💰 Max Annual Fee', values: stats.map(s => s.maxFee ? formatINR(s.maxFee) : 'N/A'), bestIdx: bestMaxFeeIdx },
    {
      label: '⭐ Placement Rating',
      values: stats.map(s => s.avgRating !== null
        ? <span>{'★'.repeat(Math.round(s.avgRating))}{'☆'.repeat(5 - Math.round(s.avgRating))} <small style={{ color: 'var(--subtle)', fontSize: '.72rem' }}>({s.avgRating.toFixed(1)})</small></span>
        : 'N/A'),
      bestIdx: bestRatingIdx,
    },
  ];

  return (
    <div>
      <p style={{ color: 'var(--subtle)', fontSize: '.75rem', marginBottom: 10, textAlign: 'right', fontFamily: 'Plus Jakarta Sans,sans-serif' }}>
        ← Scroll to see all columns →
      </p>
      <div ref={tableRef} style={{
        overflowX: 'auto', WebkitOverflowScrolling: 'touch',
        borderRadius: 'var(--r2)', border: '1px solid var(--line-dk)',
        background: 'var(--white)',
        boxShadow: 'var(--sh2)',
      }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 560 }}>
          <thead>
            <tr>
              {/* Sticky corner */}
              <th style={{ ...rowLabelStyle, position: 'sticky', left: 0, zIndex: 3, background: 'var(--navy)', color: 'rgba(255,255,255,.5)', textAlign: 'left' }}>
                Criteria
              </th>
              {colleges.map((c, i) => (
                <th key={i} style={headerStyle}>
                  <a href={`/college/${encodeURIComponent(c.name)}`} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none' }}>
                    {c.name}
                  </a>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? 'var(--white)' : 'var(--cream)' }}>
                <td style={{ ...rowLabelStyle, background: ri % 2 === 0 ? 'var(--cream-dk)' : 'var(--cream)' }}>{row.label}</td>
                {row.values.map((val, ci) => (
                  <td key={ci} style={cellStyle(row.bestIdx === ci)}>
                    {val}
                    {row.bestIdx === ci && (
                      <span style={{ display: 'block', fontSize: '.65rem', color: 'var(--safe)', marginTop: 3, fontWeight: 700, letterSpacing: '.06em' }}>
                        ✓ BEST
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
