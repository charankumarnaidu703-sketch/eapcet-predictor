'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Lazy-load the transport component so geolocation code doesn't block SSR
const TransportSection = dynamic(
  () => import('@/components/college/TransportSection'),
  { ssr: false, loading: () => <div style={{ padding: 24, color: 'var(--muted)', fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '.88rem' }}>Loading map…</div> }
);

import ReimbursementMiniBanner from '@/components/college/ReimbursementMiniBanner';
import ShareButton from '@/components/ShareButton';
import { generateCollegeShareText } from '@/lib/share';

interface CutoffRow {
  id: number; college_name: string; type: string; year: number;
  branch: string; opening_rank: string; closing_rank: string;
  annual_fees: string; placement_rating: number | null; location: string;
}

function parseRank(r: string): number | null {
  if (!r || r === '-') return null;
  const n = parseInt(r.replace(/\D/g, ''), 10);
  return isNaN(n) ? null : n;
}

function Stars({ r }: { r: number | null }) {
  if (!r) return <span style={{ color: 'var(--faint)' }}>Not rated</span>;
  return <span className="stars">{'★'.repeat(Math.round(r))}{'☆'.repeat(5 - Math.round(r))} <small style={{ color: 'var(--subtle)', fontSize: '.72rem' }}>({r.toFixed(1)})</small></span>;
}

function TrendChart({ data, branch }: { data: CutoffRow[]; branch: string }) {
  const years = [2023, 2024, 2025];
  const rows = data.filter(r => r.branch === branch);
  const ranks = years.map(y => { const r = rows.find(x => x.year === y); return r ? parseRank(r.closing_rank) : null; });
  const valid = ranks.filter(Boolean) as number[];
  if (valid.length < 2) return <p style={{ color: 'var(--subtle)', fontSize: '.8rem', padding: '16px 0' }}>Not enough data for trend</p>;
  const maxR = Math.max(...valid), H = 100, W = 300, PAD = 36, plotH = H - 20, plotW = W - PAD * 2;
  const pts = years.map((_, i) => {
    const r = ranks[i]; if (!r) return null;
    return { x: PAD + (i / 2) * plotW, y: 8 + ((maxR - r) / maxR) * plotH, r, yr: years[i] };
  }).filter(Boolean) as { x: number; y: number; r: number; yr: number }[];
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 320 }} role="img" aria-label={`Trend for ${branch}`}>
      <defs>
        <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--navy)" stopOpacity=".15" />
          <stop offset="100%" stopColor="var(--navy)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[.25,.5,.75,1].map((t, i) => <line key={i} x1={PAD} y1={8 + t * plotH} x2={W - PAD} y2={8 + t * plotH} stroke="var(--cream-line)" strokeWidth="1" />)}
      <path d={`${path} L${pts[pts.length-1].x} ${H} L${pts[0].x} ${H}Z`} fill="url(#tg)" />
      <path d={path} fill="none" stroke="var(--navy)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill="var(--gold)" stroke="var(--white)" strokeWidth="2" />
          <text x={p.x} y={H - 1} textAnchor="middle" fontSize="10" fill="var(--subtle)">{p.yr}</text>
          <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize="9.5" fill="var(--navy)" fontWeight="700">{p.r.toLocaleString('en-IN')}</text>
        </g>
      ))}
    </svg>
  );
}

const card: React.CSSProperties = {
  background: 'var(--white)', border: '1px solid var(--line)',
  borderRadius: 'var(--r2)', boxShadow: 'var(--sh1)', padding: 24,
};

export default function CollegeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collegeName = decodeURIComponent(params.name as string);
  const [data, setData]           = useState<CutoffRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selBranch, setSelBranch] = useState('');
  const [activeYear, setActiveYear] = useState(2025);

  useEffect(() => {
    fetch(`/api/college?name=${encodeURIComponent(collegeName)}`)
      .then(r => r.json())
      .then(j => {
        const rows: CutoffRow[] = j.data ?? [];
        if (rows.length) {
          setData(rows);
          const maxY = Math.max(...rows.map(x => x.year));
          setActiveYear(maxY);
          setSelBranch(rows.find(r => r.year === maxY)?.branch ?? rows[0].branch);
        }
      }).catch(console.error).finally(() => setLoading(false));
  }, [collegeName]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div className="spinner dark" style={{ width: 44, height: 44 }} />
      <p style={{ color: 'var(--muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Loading college data…</p>
    </div>
  );

  if (!data.length) return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ fontSize: '3rem' }}>😔</div>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: 'var(--navy)' }}>College not found</h1>
      <p style={{ color: 'var(--muted)', maxWidth: 360, textAlign: 'center' }}>We couldn&apos;t find &ldquo;{collegeName}&rdquo; in our database.</p>
      <button onClick={() => router.push('/')}
        style={{ padding: '10px 24px', background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 'var(--r)', fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        ← Back to Predictor
      </button>
    </div>
  );

  const c = data[0];
  const years    = [...new Set(data.map(r => r.year))].sort((a, b) => b - a);
  const branches = [...new Set(data.map(r => r.branch))].sort();
  const yearData = data.filter(r => r.year === activeYear)
    .sort((a, b) => (parseRank(a.closing_rank) ?? 999999) - (parseRank(b.closing_rank) ?? 999999));

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <a href="/" className="nav-logo">🎯 EAPCET <span>Predictor</span></a>
          <ul className="nav-links">
            <li><a href="/compare">Compare</a></li>
            <li><a href="/tools/counselling">Counselling</a></li>
            <li><a href="/tools/scholarships">Scholarships</a></li>
            <li><a href="/tools/reimbursement">Fee Aid</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero strip */}
      <div style={{ background: 'var(--navy)', padding: '40px 24px 48px', position: 'relative' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <nav style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.4)', marginBottom: 14, letterSpacing: '.04em', textTransform: 'uppercase', fontFamily: 'Plus Jakarta Sans,sans-serif' }}>
            <a href="/" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Home</a>{' › '}
            <span>{c.college_name}</span>
          </nav>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <span style={{ background: 'rgba(200,134,42,.15)', color: 'var(--gold-lt)', border: '1px solid rgba(200,134,42,.3)', borderRadius: 'var(--r)', padding: '2px 10px', fontSize: '.7rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>
              {c.type}
            </span>
            <span style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.6)', borderRadius: 'var(--r)', padding: '2px 10px', fontSize: '.7rem', fontWeight: 600 }}>
              📍 {c.location}
            </span>
          </div>
          <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(1.4rem,3vw,2rem)', color: '#fff', fontWeight: 800, lineHeight: 1.25, marginBottom: 24 }}>
            {c.college_name}
          </h1>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Annual Fees', val: c.annual_fees || '—' },
              { label: 'Placement', val: <Stars r={c.placement_rating} /> },
              { label: 'Branches', val: branches.length },
              { label: 'Years Available', val: years.join(', ') },
            ].map(s => (
              <div key={String(s.label)} style={{ borderLeft: '2px solid var(--gold)', paddingLeft: 14 }}>
                <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: 'Plus Jakarta Sans,sans-serif', marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontFamily: typeof s.val === 'string' ? 'Playfair Display,serif' : 'Plus Jakarta Sans,sans-serif', fontWeight: 700, color: '#fff', fontSize: '.95rem' }}>{s.val}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 32, display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => document.getElementById('transport')?.scrollIntoView({ behavior: 'smooth' })} 
              className="pulse-anim"
              style={{ background: 'var(--gold)', color: '#fff', border: 'none', borderRadius: 'var(--r)', padding: '10px 18px', fontWeight: 700, fontSize: '.85rem', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans,sans-serif', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              🗺 View Transportation Route ↓
            </button>
            <ShareButton 
              text={generateCollegeShareText(
                c.college_name,
                c.location,
                typeof window !== 'undefined' ? window.location.origin : 'https://eapcetpredictor.com'
              )} 
            />
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 72 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <button onClick={() => router.push('/')}
            style={{ padding: '8px 18px', background: 'var(--cream-dk)', border: '1px solid var(--line-dk)', borderRadius: 'var(--r)', fontWeight: 600, fontSize: '.82rem', color: 'var(--muted)', fontFamily: 'Plus Jakarta Sans,sans-serif' }}>
            ← Back to Results
          </button>
          {/* Year selector */}
          <div className="filter-bar" style={{ marginBottom: 0, border: 'none', paddingBottom: 0, gap: 4 }}>
            {years.map(y => (
              <button key={y} className={`filter-chip${activeYear === y ? ' active' : ''}`} onClick={() => setActiveYear(y)}
                style={{ padding: '5px 14px' }}>{y}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(160px,200px) 1fr', gap: 20, alignItems: 'start' }}>
          {/* Branch sidebar */}
          <div style={card}>
            <p style={{ fontSize: '.67rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--subtle)', marginBottom: 12 }}>Branches</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {branches.map(b => (
                <button key={b} onClick={() => setSelBranch(b)}
                  style={{
                    textAlign: 'left', padding: '7px 10px', borderRadius: 'var(--r)',
                    border: selBranch === b ? '1.5px solid var(--gold)' : '1px solid var(--line)',
                    background: selBranch === b ? 'var(--gold-pale)' : 'none',
                    color: selBranch === b ? 'var(--gold)' : 'var(--muted)',
                    fontSize: '.75rem', fontWeight: selBranch === b ? 700 : 400,
                    cursor: 'pointer', transition: 'all .15s',
                    fontFamily: 'Plus Jakarta Sans,sans-serif',
                  }}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Main area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Trend chart */}
            {selBranch && (
              <div style={card}>
                <p style={{ fontSize: '.67rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--subtle)', marginBottom: 4 }}>Closing Rank Trend</p>
                <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.1rem', color: 'var(--navy)', marginBottom: 20 }}>{selBranch}</h2>
                <TrendChart data={data} branch={selBranch} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 16 }}>
                  {[2023, 2024, 2025].map(y => {
                    const row = data.find(r => r.branch === selBranch && r.year === y);
                    return (
                      <div key={y} style={{ background: 'var(--cream)', borderRadius: 'var(--r)', padding: '10px 14px', textAlign: 'center', border: '1px solid var(--line)' }}>
                        <div style={{ fontSize: '.65rem', color: 'var(--faint)', marginBottom: 4, fontFamily: 'Plus Jakarta Sans,sans-serif' }}>{y}</div>
                        <div style={{ fontFamily: 'Playfair Display,serif', fontWeight: 700, color: row ? 'var(--navy)' : 'var(--faint)', fontSize: '.9rem' }}>
                          {row ? row.closing_rank : 'N/A'}
                        </div>
                        <div style={{ fontSize: '.6rem', color: 'var(--faint)', fontFamily: 'Plus Jakarta Sans,sans-serif' }}>Closing</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Full table */}
            <div style={card}>
              <p style={{ fontSize: '.67rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--subtle)', marginBottom: 4 }}>All Branch Cutoffs</p>
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.1rem', color: 'var(--navy)', marginBottom: 20 }}>{activeYear}</h2>
              {yearData.length === 0
                ? <p style={{ color: 'var(--muted)', fontFamily: 'Plus Jakarta Sans,sans-serif' }}>No data for {activeYear}</p>
                : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '.83rem' }}>
                      <thead>
                        <tr style={{ background: 'var(--cream)' }}>
                          {['Branch', 'Opening', 'Closing', 'Fees'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '9px 12px', color: 'var(--subtle)', fontWeight: 600, fontSize: '.67rem', letterSpacing: '.07em', textTransform: 'uppercase', borderBottom: '2px solid var(--line-dk)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {yearData.map((row, i) => (
                          <tr key={i} onClick={() => setSelBranch(row.branch)}
                            style={{ borderBottom: '1px solid var(--line)', cursor: 'pointer', transition: 'background .1s', background: selBranch === row.branch ? 'var(--gold-pale)' : 'transparent' }}
                            onMouseEnter={e => { if (selBranch !== row.branch) (e.currentTarget as HTMLElement).style.background = 'var(--cream)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = selBranch === row.branch ? 'var(--gold-pale)' : 'transparent'; }}>
                            <td style={{ padding: '10px 12px', fontWeight: selBranch === row.branch ? 700 : 400, color: selBranch === row.branch ? 'var(--gold)' : 'var(--text)' }}>{row.branch}</td>
                            <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row.opening_rank}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--navy)', fontFamily: 'Playfair Display,serif' }}>{row.closing_rank}</td>
                            <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row.annual_fees || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <a 
                  href={`/college/${encodeURIComponent(collegeName)}/cutoff`}
                  style={{ display: 'inline-block', color: 'var(--navy)', fontWeight: 700, fontSize: '.9rem', textDecoration: 'none', borderBottom: '2px solid var(--gold)', paddingBottom: '2px', transition: 'opacity .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  View Complete Cutoff History →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Reimbursement Mini Banner */}
      <div className="container" style={{ paddingBottom: 48 }}>
        <ReimbursementMiniBanner />
      </div>

      {/* ════════════════════════
           HOW TO GET HERE (Step 7)
          ════════════════════════ */}
      <div id="transport" className="container" style={{ paddingBottom: 48 }}>
        <div style={card}>
          {/* Section heading */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontSize: '1.3rem' }}>🗺</span>
            <div>
              <p style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--subtle)', fontFamily: 'Plus Jakarta Sans,sans-serif' }}>Transport</p>
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.15rem', color: 'var(--navy)', marginTop: 2 }}>How to Get Here</h2>
            </div>
          </div>
          <TransportSection collegeName={c.college_name} location={c.location} />
        </div>
      </div>

      <footer className="footer">
        <p>© 2025 EAPCET Predictor · <a href="/">Back to Predictor</a></p>
      </footer>
    </>
  );
}
