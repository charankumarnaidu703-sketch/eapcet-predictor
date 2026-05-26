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
      {/* Desktop view: Horizontal scroll comparison table */}
      <div className="hidden md:block">
        <p style={{ color: 'var(--subtle)', fontSize: '.75rem', marginBottom: 10, textAlign: 'right', fontFamily: 'Plus Jakarta Sans,sans-serif' }}>
          ← Scroll to see all columns →
        </p>

        <div className="w-full overflow-x-auto -mx-4 px-4">
          <div className="min-w-[600px] md:min-w-0">
            <div ref={tableRef} style={{
              overflowX: 'auto', WebkitOverflowScrolling: 'touch',
              borderRadius: 'var(--r2)', border: '1px solid var(--line-dk)',
              background: 'var(--white)',
              boxShadow: 'var(--sh2)',
            }}>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr>
                    {/* Sticky corner cell */}
                    <th 
                      className="sticky left-0 z-20 border-r border-gray-100 bg-white text-gray-600 md:bg-[var(--navy)] md:text-white/50 font-medium text-sm md:text-xs min-w-[120px] md:min-w-[180px] p-3 text-left"
                      style={{ 
                        position: 'sticky', left: 0, zIndex: 20,
                        fontFamily: 'Plus Jakarta Sans,sans-serif',
                      }}
                    >
                      Criteria
                    </th>
                    {colleges.map((c, i) => (
                      <th 
                        key={i} 
                        className="p-3 md:p-[16px_18px] min-w-[160px] md:min-w-[200px] max-w-[200px] bg-[var(--navy)] text-center text-white"
                        style={{
                          borderBottom: '2px solid var(--line-dk)',
                          fontFamily: 'Plus Jakarta Sans,sans-serif',
                        }}
                      >
                        <a 
                          href={`/college/${encodeURIComponent(c.name)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm md:text-[0.78rem] font-bold text-[var(--gold)] line-clamp-2 text-center block hover:underline"
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {c.name}
                        </a>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={ri} style={{ background: ri % 2 === 0 ? 'var(--white)' : 'var(--cream)' }}>
                      {/* Sticky row labels */}
                      <td 
                        className={`sticky left-0 z-10 border-r border-gray-100 bg-white text-gray-600 font-medium text-sm min-w-[120px] md:min-w-[180px] p-3 md:p-[13px_18px] md:text-[var(--subtle)] md:text-[0.75rem] md:font-bold md:uppercase md:tracking-widest ${ri % 2 === 0 ? 'md:bg-[var(--cream-dk)]' : 'md:bg-[var(--cream)]'}`}
                        style={{ 
                          position: 'sticky', left: 0, zIndex: 10,
                          fontFamily: 'Plus Jakarta Sans,sans-serif',
                        }}
                      >
                        {row.label}
                      </td>
                      {row.values.map((val, ci) => {
                        const isBest = row.bestIdx === ci;
                        return (
                          <td 
                            key={ci}
                            className="p-3 md:p-[13px_18px] min-w-[160px] md:min-w-[200px] max-w-[200px] text-center"
                            style={{
                              fontSize: '.88rem', fontFamily: 'Plus Jakarta Sans,sans-serif',
                              color: isBest ? 'var(--safe)' : 'var(--text)',
                              background: isBest ? 'var(--safe-bg)' : 'transparent',
                              fontWeight: isBest ? 700 : 400,
                              borderBottom: '1px solid var(--line)',
                              transition: 'background .15s',
                            }}
                          >
                            {val}
                            {isBest && (
                              <span style={{ display: 'block', fontSize: '.65rem', color: 'var(--safe)', marginTop: 3, fontWeight: 700, letterSpacing: '.06em' }}>
                                ✓ BEST
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-first comparative card system (≤768px) */}
      <div className="block md:hidden space-y-5">
        <p className="text-xs text-gray-500 text-center italic mb-4">
          Grouped comparison across all selected colleges
        </p>

        {/* 1. Admission Probability (only if studentRank is provided) */}
        {studentRank && (
          <div className="bg-white border border-[var(--line)] rounded-xl p-4 shadow-sm" style={{ boxShadow: 'var(--sh1)' }}>
            <h4 className="text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'var(--subtle)' }}>
              <span>🎯</span> Admission Probability
            </h4>
            <div className="space-y-4">
              {colleges.map((c, i) => {
                const s = stats[i];
                if (s.prob === null) return null;
                const isBest = i === bestProbIdx;
                return (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1 text-sm font-medium">
                      <span className="font-semibold text-[var(--navy)] text-xs line-clamp-1">{c.name}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isBest && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[var(--safe-bg)] text-[var(--safe)] rounded border border-[var(--safe)]/20">
                            ✓ BEST
                          </span>
                        )}
                        <span className={`font-bold text-xs ${
                          s.prob >= 70 ? 'text-[var(--safe)]' : s.prob >= 40 ? 'text-[var(--med)]' : 'text-[var(--reach)]'
                        }`}>
                          {s.prob}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          s.prob >= 70 ? 'bg-[var(--safe-bar)]' : s.prob >= 40 ? 'bg-[var(--med-bar)]' : 'bg-[var(--reach-bar)]'
                        }`} 
                        style={{ width: `${s.prob}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Closing Rank */}
        <div className="bg-white border border-[var(--line)] rounded-xl p-4 shadow-sm" style={{ boxShadow: 'var(--sh1)' }}>
          <h4 className="text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'var(--subtle)' }}>
            <span>🏆</span> Closing Rank (Latest)
          </h4>
          <div className="divide-y divide-gray-100">
            {colleges.map((c, i) => {
              const s = stats[i];
              const isBest = i === bestRankIdx;
              return (
                <div key={i} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                  <span className="font-semibold text-xs text-[var(--navy)] max-w-[60%] line-clamp-2 leading-relaxed">{c.name}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isBest && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[var(--safe-bg)] text-[var(--safe)] rounded border border-[var(--safe)]/20">
                        ✓ BEST
                      </span>
                    )}
                    <span className="font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {s.latestClosingRank ? s.latestClosingRank.toLocaleString('en-IN') : 'N/A'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Tuition Fees */}
        <div className="bg-white border border-[var(--line)] rounded-xl p-4 shadow-sm" style={{ boxShadow: 'var(--sh1)' }}>
          <h4 className="text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'var(--subtle)' }}>
            <span>💰</span> Annual Tuition Fee
          </h4>
          <div className="divide-y divide-gray-100">
            {colleges.map((c, i) => {
              const s = stats[i];
              const isBest = i === bestMinFeeIdx;
              return (
                <div key={i} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                  <span className="font-semibold text-xs text-[var(--navy)] max-w-[60%] line-clamp-2 leading-relaxed">{c.name}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isBest && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[var(--safe-bg)] text-[var(--safe)] rounded border border-[var(--safe)]/20">
                        ✓ BEST
                      </span>
                    )}
                    <span className="font-bold text-xs text-[var(--navy)]">
                      {s.minFee !== null && s.maxFee !== null ? (
                        s.minFee === s.maxFee ? formatINR(s.minFee) : `${formatINR(s.minFee)} - ${formatINR(s.maxFee)}`
                      ) : 'N/A'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Placement Rating */}
        <div className="bg-white border border-[var(--line)] rounded-xl p-4 shadow-sm" style={{ boxShadow: 'var(--sh1)' }}>
          <h4 className="text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'var(--subtle)' }}>
            <span>⭐</span> Placement Rating
          </h4>
          <div className="divide-y divide-gray-100">
            {colleges.map((c, i) => {
              const s = stats[i];
              const isBest = i === bestRatingIdx;
              const rating = s.avgRating;
              const starsCount = rating ? Math.round(rating) : 0;
              return (
                <div key={i} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                  <span className="font-semibold text-xs text-[var(--navy)] max-w-[60%] line-clamp-2 leading-relaxed">{c.name}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isBest && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[var(--safe-bg)] text-[var(--safe)] rounded border border-[var(--safe)]/20">
                        ✓ BEST
                      </span>
                    )}
                    {rating !== null ? (
                      <div className="flex items-center gap-0.5">
                        <span className="text-[var(--gold)] text-xs">
                          {'★'.repeat(starsCount)}{'☆'.repeat(5 - starsCount)}
                        </span>
                        <span className="text-[10px] text-gray-500 ml-1 font-medium">({rating.toFixed(1)})</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">N/A</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Location & Type */}
        <div className="bg-white border border-[var(--line)] rounded-xl p-4 shadow-sm" style={{ boxShadow: 'var(--sh1)' }}>
          <h4 className="text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'var(--subtle)' }}>
            <span>📍</span> Location & Type
          </h4>
          <div className="divide-y divide-gray-100">
            {colleges.map((c, i) => {
              const s = stats[i];
              return (
                <div key={i} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="font-semibold text-xs text-[var(--navy)] mb-1.5 line-clamp-1">{c.name}</div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-semibold rounded">
                      📍 {s.location || '—'}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-semibold rounded border border-amber-200/50">
                      🏛 {s.type || '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Offered Branches */}
        <div className="bg-white border border-[var(--line)] rounded-xl p-4 shadow-sm" style={{ boxShadow: 'var(--sh1)' }}>
          <h4 className="text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'var(--subtle)' }}>
            <span>🎓</span> Offered Branches
          </h4>
          <div className="divide-y divide-gray-100">
            {colleges.map((c, i) => {
              const s = stats[i];
              return (
                <div key={i} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="font-semibold text-xs text-[var(--navy)] mb-1.5 line-clamp-1">{c.name}</div>
                  {s.branches.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {s.branches.map((b, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-gray-50 border border-gray-200 text-gray-600 text-[9px] rounded">
                          {b}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">No branches listed</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
