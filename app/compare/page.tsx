/**
 * Compare Page — redesigned to match editorial design system
 */
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import CompareClient from '@/components/college/CompareClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eapcet-predictor.vercel.app';

export interface CutoffRow {
  id: number; college_name: string; type: string; year: number;
  branch: string; opening_rank: string; closing_rank: string;
  annual_fees: string; placement_rating: number | null; location: string;
}

export interface CollegeData {
  name: string; slug: string; location: string; type: string;
  rows: CutoffRow[]; found: boolean;
}

export const metadata: Metadata = {
  title: 'Compare EAPCET Colleges Side by Side | 2025 Cutoffs & Fees',
  description: 'Compare up to 3 EAPCET colleges side by side. See closing ranks, annual fees, placement ratings and your admission probability at a glance.',
};

function toSlug(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

async function fetchCollegeData(name: string): Promise<CollegeData> {
  const { data, error } = await supabase
    .from('eapcet_cutoffs').select('*')
    .ilike('college_name', `%${name.trim()}%`)
    .order('year', { ascending: false });
  if (error || !data || data.length === 0) {
    return { name, slug: toSlug(name), location: '—', type: '—', rows: [], found: false };
  }
  const rows = data as CutoffRow[];
  const exactName = rows[0]?.college_name ?? name;
  return { name: exactName, slug: toSlug(exactName), location: rows[0]?.location ?? '—', type: rows[0]?.type ?? '—', rows, found: true };
}

interface PageProps { searchParams: Promise<{ colleges?: string }>; }

export default async function ComparePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const raw = params.colleges ?? '';
  const names = raw.split(',').map(n => decodeURIComponent(n.trim())).filter(Boolean).slice(0, 3);
  const colleges: CollegeData[] = names.length ? await Promise.all(names.map(fetchCollegeData)) : [];

  return (
    <>
      {/* ── Nav (matches main site) ── */}
      <nav className="nav" aria-label="Comparison navigation">
        <div className="nav-inner">
          <a href="/" className="nav-logo">🎯 EAPCET <span>Predictor</span></a>
          <ul className="nav-links">
            <li><a href="/">← Predictor</a></li>
            <li><a href="/tools/counselling">Counselling</a></li>
            <li><a href="/tools/reimbursement">Fee Aid</a></li>
          </ul>
        </div>
      </nav>

      {/* ── Page hero strip ── */}
      <div style={{ background: 'var(--navy)', padding: '40px 24px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="hero-eyebrow" style={{ marginBottom: 12 }}>College Comparison · AP EAPCET 2025</div>
          <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(1.6rem,4vw,2.4rem)', color: '#fff', fontWeight: 800, marginBottom: 10 }}>
            Side-by-Side Analysis
          </h1>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9rem', fontFamily: 'Plus Jakarta Sans,sans-serif', maxWidth: 520 }}>
            Closing ranks, fees, placements, and your admission probability compared in one place.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px 80px' }}>

        {/* ── Empty state ── */}
        {colleges.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No colleges selected</h3>
            <p style={{ marginBottom: 24 }}>Select colleges from the predictor results to compare here.</p>
            <a href="/" style={{
              display: 'inline-block', padding: '12px 28px',
              background: 'var(--navy)', color: '#fff',
              borderRadius: 'var(--r)', fontWeight: 700,
              fontFamily: 'Plus Jakarta Sans,sans-serif',
              textDecoration: 'none',
            }}>
              Go to Predictor
            </a>
          </div>
        )}

        {/* ── College chips ── */}
        {colleges.length > 0 && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
              {colleges.map((c, i) => (
                <div key={i} style={{
                  padding: '7px 16px',
                  background: c.found ? 'var(--gold-pale)' : 'var(--reach-bg)',
                  border: `1.5px solid ${c.found ? 'rgba(200,134,42,.35)' : 'var(--reach-bar)'}`,
                  borderRadius: 'var(--r)',
                  fontSize: '.8rem', fontWeight: 700,
                  color: c.found ? 'var(--gold)' : 'var(--reach)',
                  fontFamily: 'Plus Jakarta Sans,sans-serif',
                }}>
                  {c.found ? '✓' : '⚠️'} {c.name}
                  {!c.found && ' — not found'}
                </div>
              ))}
              {colleges.length < 3 && (
                <a href="/" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '7px 16px',
                  background: 'var(--cream-dk)',
                  border: '1.5px dashed var(--line-dk)',
                  borderRadius: 'var(--r)',
                  fontSize: '.8rem', fontWeight: 600, color: 'var(--muted)',
                  textDecoration: 'none', fontFamily: 'Plus Jakarta Sans,sans-serif',
                }}>
                  + Add Another College
                </a>
              )}
            </div>

            <CompareClient colleges={colleges} siteUrl={SITE_URL} />
          </>
        )}
      </main>

      <footer className="footer">
        <p>© 2025 EAPCET Predictor · <a href="/">Back to Predictor</a></p>
      </footer>
    </>
  );
}
