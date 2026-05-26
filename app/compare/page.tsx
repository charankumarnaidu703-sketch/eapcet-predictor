/**
 * Compare Page — redesigned to match editorial design system
 */
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';
import CompareClient from '@/components/college/CompareClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SITE_URL = 'https://ranksure.vercel.app';

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
  alternates: {
    canonical: '/compare',
  },
  openGraph: {
    title: 'Compare EAPCET Colleges — RankSure',
    description: 'Side-by-side comparison of AP EAPCET colleges with cutoff ranks, fees, placements, and admission probability.',
  },
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
          <a href="/" className="nav-logo">🎯 Rank<span>Sure</span></a>
          <ul className="nav-links">
            <li><a href="/">← Predictor</a></li>
            <li><a href="/blog">Guides</a></li>
            <li><a href="/tools/counselling">Counselling</a></li>
            <li><a href="/tools/scholarships">Scholarships</a></li>
            <li><a href="/tools/reimbursement">Fee Aid</a></li>
          </ul>
          <MobileNav />
        </div>
      </nav>

      {/* ── Page hero strip ── */}
      <div 
        className="px-4 pt-6 pb-8 md:p-[40px_24px_48px]" 
        style={{ background: 'var(--navy)' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="hero-eyebrow" style={{ marginBottom: 12 }}>College Comparison · AP EAPCET 2025</div>
          <h1 
            className="text-2xl md:text-[clamp(1.6rem,4vw,2.4rem)]"
            style={{ fontFamily: 'Playfair Display,serif', color: '#fff', fontWeight: 800, marginBottom: 10 }}
          >
            Side-by-Side Analysis
          </h1>
          <p 
            className="text-sm line-clamp-2 md:line-clamp-none md:text-[0.9rem]"
            style={{ color: 'rgba(255,255,255,.5)', fontFamily: 'Plus Jakarta Sans,sans-serif', maxWidth: 520 }}
          >
            Closing ranks, fees, placements, and your admission probability compared in one place.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px 80px' }}>

        {/* ── Empty state ── */}
        {colleges.length === 0 && (
          <>
            <div className="empty-state flex flex-col items-center justify-center text-center px-6 py-16 md:block md:py-[72px] md:px-6">
              <div className="empty-icon text-5xl mb-4 md:text-[3rem] md:mb-[14px]">🔍</div>
              <h3 
                className="text-lg font-semibold md:text-[1.2rem] md:font-800 md:text-[var(--navy)] md:mb-[8px]"
              >
                No colleges selected
              </h3>
              <p 
                className="text-sm text-gray-500 mb-6 md:text-[.88rem] md:text-[var(--muted)] md:mb-[24px]"
                style={{ fontFamily: 'Plus Jakarta Sans,sans-serif' }}
              >
                Select colleges from the predictor results to compare here.
              </p>
              <a 
                href="/" 
                style={{
                  display: 'inline-block', padding: '12px 28px',
                  background: 'var(--navy)', color: '#fff',
                  borderRadius: 'var(--r)', fontWeight: 700,
                  fontFamily: 'Plus Jakarta Sans,sans-serif',
                  textDecoration: 'none',
                }}
                className="w-full max-w-xs mx-auto md:w-auto md:max-w-none"
              >
                Go to Predictor
              </a>
            </div>

            {/* Fixed bottom bar: FIX 5 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 md:hidden flex justify-center">
              <Link 
                href="/" 
                className="w-full max-w-xs text-center py-3 bg-[var(--navy)] text-white rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                style={{ fontFamily: 'Plus Jakarta Sans,sans-serif' }}
              >
                ← Back to Predictor
              </Link>
            </div>
          </>
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

      <footer className="footer-enhanced">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="nav-logo">🎯 Rank<span>Sure</span></a>
            <p>Free AP EAPCET college predictor with 3 years of official cutoff data.</p>
          </div>
          <div className="footer-col">
            <h4>Tools</h4>
            <ul>
              <li><a href="/">EAPCET Predictor</a></li>
              <li><a href="/compare">Compare Colleges</a></li>
              <li><a href="/tools/counselling">Counselling Dates</a></li>
              <li><a href="/tools/scholarships">Scholarships</a></li>
              <li><a href="/tools/reimbursement">Fee Reimbursement</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Popular Branches</h4>
            <ul>
              <li><a href="/?branch=CSE">CSE Colleges</a></li>
              <li><a href="/?branch=ECE">ECE Colleges</a></li>
              <li><a href="/?branch=EEE">EEE Colleges</a></li>
              <li><a href="/?branch=Mechanical">Mechanical Colleges</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="/tools/counselling">Document Checklist</a></li>
              <li><a href="/tools/scholarships">Vidya Deevena Scheme</a></li>
              <li><a href="/sitemap.xml">Sitemap</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 RankSure · Data from AP EAPCET official allotments</p>
          <p>Built with 💛 for AP engineering students</p>
        </div>
      </footer>
    </>
  );
}
