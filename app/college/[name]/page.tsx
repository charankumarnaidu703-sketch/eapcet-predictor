import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import CollegeDetailClient from '@/components/college/CollegeDetailClient';
import CollegeSearch from '@/components/CollegeSearch';
import MobileNav from '@/components/MobileNav';

interface PageProps {
  params: Promise<{ name: string }>;
}

const SITE_URL = 'https://ranksure.vercel.app';

export const revalidate = 86400; // 24 hours

export async function generateStaticParams() {
  try {
    const { data } = await supabase.from('eapcet_cutoffs').select('college_name');
    if (!data) return [];
    const uniqueNames = Array.from(new Set(data.map(d => d.college_name)));
    return uniqueNames.map(name => ({ name: encodeURIComponent(name) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  const { data: rows } = await supabase
    .from('eapcet_cutoffs')
    .select('college_name, branch, closing_rank, annual_fees, placement_rating, location, year')
    .eq('college_name', decodedName)
    .order('year', { ascending: false });

  if (!rows || rows.length === 0) {
    return { title: 'College Not Found' };
  }

  const collegeName = rows[0].college_name;
  const location = rows[0].location;
  const branches = Array.from(new Set(rows.map(r => r.branch)));
  const branchList = branches.slice(0, 4).join(', ') + (branches.length > 4 ? ` & ${branches.length - 4} more` : '');
  
  const cseRow = rows.find(r => r.branch.includes('CSE'));
  const eceRow = rows.find(r => r.branch.includes('ECE'));
  const rankTexts = [
    cseRow ? `CSE closing rank ${cseRow.closing_rank}` : '',
    eceRow ? `ECE closing rank ${eceRow.closing_rank}` : '',
  ].filter(Boolean).join(', ');

  const fees = rows[0].annual_fees || '';
  const feesText = fees ? ` Annual fees: ${fees}.` : '';

  return {
    title: `${collegeName} EAPCET Cutoff 2025 | Fees, Placements & Admission | RankSure`,
    description: `${collegeName} (${location}) EAPCET 2025 cutoffs for ${branchList}. ${rankTexts}.${feesText} Check branch-wise cutoff trends from 2023–2025 and predict your admission chances.`,
    alternates: {
      canonical: `/college/${encodeURIComponent(collegeName)}`,
    },
    openGraph: {
      title: `${collegeName} — EAPCET Cutoff 2025`,
      description: `Branch-wise cutoffs, fees, placements & admission chances for ${collegeName}. ${rankTexts}.`,
      url: `${SITE_URL}/college/${encodeURIComponent(collegeName)}`,
      type: 'website',
      siteName: 'RankSure',
    },
  };
}

export default async function CollegeDetailPage({ params }: PageProps) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  const { data: rows } = await supabase
    .from('eapcet_cutoffs')
    .select('*')
    .eq('college_name', decodedName)
    .order('year', { ascending: false });

  if (!rows || rows.length === 0) {
    notFound();
  }

  const collegeName = rows[0].college_name;
  const location = rows[0].location;
  const branches = Array.from(new Set(rows.map(r => r.branch)));

  // Fetch related colleges in the same location for internal linking
  let relatedColleges: string[] = [];
  try {
    const { data: related } = await supabase
      .from('eapcet_cutoffs')
      .select('college_name')
      .eq('location', location)
      .neq('college_name', collegeName);
    if (related) {
      relatedColleges = Array.from(new Set(related.map(r => r.college_name))).slice(0, 6);
    }
  } catch { /* ignore */ }

  // EducationalOrganization schema
  const collegeSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: collegeName,
    address: {
      '@type': 'PostalAddress',
      addressLocality: location,
      addressRegion: 'Andhra Pradesh',
      addressCountry: 'IN',
    },
    description: `${collegeName} is an engineering college in ${location}, Andhra Pradesh offering ${branches.length} branches including ${branches.slice(0, 3).join(', ')}.`,
  };

  // BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: collegeName, item: `${SITE_URL}/college/${encodeURIComponent(collegeName)}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collegeSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <nav className="nav">
        <div className="nav-inner">
          <a href="/" className="nav-logo">🎯 Rank<span>Sure</span></a>
          <ul className="nav-links">
            <li><a href="/compare">Compare</a></li>
            <li><a href="/blog">Guides</a></li>
            <li><a href="/tools/counselling">Counselling</a></li>
            <li><a href="/tools/scholarships">Scholarships</a></li>
            <li><a href="/tools/reimbursement">Fee Aid</a></li>
          </ul>
          <CollegeSearch />
          <MobileNav />
        </div>
      </nav>

      <CollegeDetailClient collegeName={collegeName} data={rows} />

      {/* ── Related Colleges (Internal Linking for SEO) ── */}
      {relatedColleges.length > 0 && (
        <div className="container" style={{ paddingBottom: 48 }}>
          <div style={{
            background: 'var(--white)', border: '1px solid var(--line)',
            borderRadius: 'var(--r2)', boxShadow: 'var(--sh1)', padding: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontSize: '1.3rem' }}>🏫</span>
              <div>
                <p style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--subtle)', fontFamily: 'Plus Jakarta Sans,sans-serif' }}>Also in {location}</p>
                <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.15rem', color: 'var(--navy)', marginTop: 2 }}>Similar Colleges Nearby</h2>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {relatedColleges.map(relName => (
                <a
                  key={relName}
                  href={`/college/${encodeURIComponent(relName)}`}
                  style={{
                    display: 'block', padding: '14px 16px',
                    background: 'var(--cream)', border: '1px solid var(--line)',
                    borderRadius: 'var(--r)', textDecoration: 'none',
                    color: 'var(--navy)', fontSize: '.85rem',
                    fontWeight: 600, fontFamily: 'Plus Jakarta Sans,sans-serif',
                    transition: 'all .15s',
                  }}
                >
                  {relName}
                  <span style={{ display: 'block', fontSize: '.72rem', color: 'var(--muted)', fontWeight: 400, marginTop: 2 }}>
                    View cutoffs &amp; details →
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Footer with internal links ── */}
      <footer className="footer-enhanced">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="nav-logo">🎯 Rank<span>Sure</span></a>
            <p>Free AP EAPCET college predictor with 3 years of official cutoff data from 328+ colleges.</p>
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
            <h4>This College</h4>
            <ul>
              <li><a href={`/college/${encodeURIComponent(collegeName)}/cutoff`}>Full Cutoff History</a></li>
              <li><a href={`/compare?colleges=${encodeURIComponent(collegeName)}`}>Compare This College</a></li>
              <li><a href="/tools/reimbursement">Check Fee Aid</a></li>
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
