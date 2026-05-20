'use client';

import type { CollegeData } from '@/app/compare/page';
import { parseFee, parseRank } from '@/lib/utils';

interface Props {
  colleges: CollegeData[];
  studentRank: number | null;
  siteUrl: string;
}

function calcProbability(closingRank: number | null, studentRank: number | null): number | null {
  if (!closingRank || !studentRank) return null;
  if (studentRank <= closingRank * 0.75) return 90;
  if (studentRank <= closingRank * 0.90) return 80;
  if (studentRank <= closingRank) return 65;
  if (studentRank <= closingRank * 1.15) return 40;
  if (studentRank <= closingRank * 1.30) return 20;
  return 5;
}

function calcScore(college: CollegeData, studentRank: number | null): number {
  const allRows = college.rows;
  const years = [...new Set(allRows.map((r) => r.year))].sort((a, b) => b - a);
  const latestYear = years[0] ?? 0;
  const latestRows = allRows.filter((r) => r.year === latestYear);
  const csRow = latestRows.find((r) => r.branch.toLowerCase().includes('cse') || r.branch.toLowerCase().includes('computer'));
  const rankRow = csRow ?? latestRows[0];
  const closingRank = rankRow ? parseRank(rankRow.closing_rank) : null;

  const prob = calcProbability(closingRank, studentRank) ?? 50;

  const ratings = allRows
    .map((r) => r.placement_rating)
    .filter((r): r is number => r !== null && r > 0);
  const avgRating = ratings.length
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : 3.0;

  const fees = allRows
    .map((r) => parseFee(r.annual_fees))
    .filter((f): f is number => f !== null);
  const minFee = fees.length ? Math.min(...fees) : 150000;
  const feeScore = ((300000 - Math.min(minFee, 300000)) / 300000) * 100;

  return prob * 0.40 + (avgRating / 5) * 100 * 0.35 + feeScore * 0.25;
}

export default function RecommendationCard({ colleges, studentRank, siteUrl }: Props) {
  if (colleges.length < 2) return null;

  const scores = colleges.map((c) => calcScore(c, studentRank));
  const winnerIdx = scores.indexOf(Math.max(...scores));
  const winner = colleges[winnerIdx];

  const dimensions = [
    { label: 'Admission Probability', weight: 0.40 },
    { label: 'Placement Rating', weight: 0.35 },
    { label: 'Fee Value', weight: 0.25 },
  ];

  // WhatsApp share text
  const shareText = encodeURIComponent(
    `I compared ${colleges.map((c) => c.name).join(' vs ')} on EAPCET Predictor!\n` +
    `Best pick based on rank, fees and placements: ${winner.name}.\n` +
    `Check yours free at ${siteUrl}\n\n#EAPCET2025 #EAMCET2025`
  );

  const isMobile =
    typeof window !== 'undefined' &&
    /Android|iPhone|iPad/i.test(navigator.userAgent);
  const whatsappUrl = isMobile
    ? `whatsapp://send?text=${shareText}`
    : `https://web.whatsapp.com/send?text=${shareText}`;

  return (
    <div
      className="p-5 md:p-[28px_32px] mt-8"
      style={{
        borderRadius: 20,
        border: '2px solid var(--primary)',
        background: 'rgba(99,102,241,0.08)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Mobile Winner Callout: FIX 4 */}
      <div className="block md:hidden p-4 rounded-xl text-center bg-green-50 border border-green-200 mb-6">
        <p className="text-green-800 text-xs uppercase tracking-wider font-bold mb-1">
          🏆 Our Recommendation
        </p>
        <h3 className="text-base font-bold text-green-900 mb-1.5 leading-snug">
          {winner.name}
        </h3>
        <p className="text-xs text-green-700 leading-relaxed">
          Based on admission probability, placement record, and annual fees, this college offers the best overall value for you.
        </p>
      </div>

      {/* Desktop Recommendation headline */}
      <div className="hidden md:block" style={{ marginBottom: 24 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          🏆 Our Recommendation
        </p>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 8 }}>
          {winner.name}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Based on admission probability, placement record, and annual fees, this college
          offers the best overall value for you.
        </p>
      </div>

      {/* Progress bars per college: FIX 4 */}
      <div className="flex flex-col gap-5 md:gap-6">
        {colleges.map((c, i) => (
          <div key={i} className="w-full">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs md:text-sm font-semibold truncate max-w-[70%]" style={{ color: i === winnerIdx ? 'var(--primary-lt)' : 'var(--text-muted)' }}>
                {c.name} {i === winnerIdx ? '👑' : ''}
              </span>
              <span className="text-[10px] md:text-xs text-slate-400" style={{ color: 'var(--text-muted)' }}>
                Score: {scores[i].toFixed(0)}/100
              </span>
            </div>
            
            {/* Main score progress bar */}
            <div
              style={{
                height: 8,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.08)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(scores[i], 100)}%`,
                  borderRadius: 8,
                  background: i === winnerIdx
                    ? 'linear-gradient(90deg, #6366f1, #22c55e)'
                    : 'rgba(148,163,184,0.4)',
                  transition: 'width 1s ease',
                }}
              />
            </div>

            {/* Per-dimension mini bars: stack on mobile */}
            <div className="flex flex-col md:flex-row gap-2 md:gap-3 mt-2">
              {dimensions.map((d) => (
                <div key={d.label} className="w-full md:flex-1">
                  <div className="text-[9px] md:text-[0.68rem] text-slate-400 mb-0.5" style={{ color: 'var(--text-muted)' }}>
                    {d.label}
                  </div>
                  <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(scores[i] * d.weight * 2.5, 100)}%`,
                        background: i === winnerIdx ? '#6366f1' : 'rgba(148,163,184,0.3)',
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* WhatsApp Share */}
      <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 12 }}>
          Share this comparison with friends or family on WhatsApp:
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 24px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #25d366, #128c7e)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.9rem',
            textDecoration: 'none',
            transition: 'opacity 0.2s',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Share This Comparison
        </a>
      </div>
    </div>
  );
}
