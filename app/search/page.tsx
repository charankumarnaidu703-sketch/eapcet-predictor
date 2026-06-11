import { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import Breadcrumb from '@/components/Breadcrumb';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    location?: string;
  }>;
}

const SITE_URL = 'https://ranksure.vercel.app';

export const revalidate = 3600; // Cache search queries for 1 hour

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q?.trim() || '';
  const location = resolvedSearchParams.location?.trim() || '';
  const term = location || q || 'Colleges';

  return {
    title: `Colleges in ${term} | EAPCET Cutoffs & Placements | RankSure`,
    description: `View all engineering colleges in ${term} with official AP EAPCET cutoffs, annual fee structures, placement ratings, and branches offered.`,
    alternates: {
      canonical: `/search${location ? `?location=${encodeURIComponent(location)}` : q ? `?q=${encodeURIComponent(q)}` : ''}`,
    },
  };
}

function StarRating({ r }: { r: number | null }) {
  if (!r) return <span style={{ color: 'var(--faint)', fontFamily: 'inherit' }}>—</span>;
  return (
    <span className="stars" aria-label={`Rating: ${r} out of 5`}>
      {'★'.repeat(Math.round(r))}
      {'☆'.repeat(5 - Math.round(r))}
    </span>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q?.trim() || '';
  const location = resolvedSearchParams.location?.trim() || '';

  let query = supabase
    .from('eapcet_cutoffs')
    .select('college_name, type, year, branch, opening_rank, closing_rank, annual_fees, placement_rating, location')
    .order('year', { ascending: false });

  if (location) {
    query = query.ilike('location', location);
  } else if (q) {
    query = query.or(`college_name.ilike.%${q}%,location.ilike.%${q}%`);
  }

  const { data, error } = await query.limit(4000);

  // Group by college name
  const collegesMap = new Map<string, {
    name: string;
    location: string;
    fees: string;
    rating: number | null;
    branches: Set<string>;
    ranks2025: number[];
  }>();

  for (const row of data || []) {
    const name = row.college_name;
    if (!collegesMap.has(name)) {
      collegesMap.set(name, {
        name,
        location: row.location || 'AP - Other',
        fees: row.annual_fees || '—',
        rating: row.placement_rating,
        branches: new Set<string>(),
        ranks2025: [],
      });
    }

    const col = collegesMap.get(name)!;
    if (row.branch) {
      col.branches.add(row.branch);
    }

    // Capture 2025 ranks for range estimation
    if (row.year === 2025 && row.closing_rank && row.closing_rank !== '-') {
      const rankNum = parseInt(row.closing_rank.replace(/\D/g, ''), 10);
      if (!isNaN(rankNum) && rankNum > 0) {
        col.ranks2025.push(rankNum);
      }
    }
  }

  const resultsList = Array.from(collegesMap.values()).map(col => {
    const sortedRanks = [...col.ranks2025].sort((a, b) => a - b);
    return {
      name: col.name,
      location: col.location,
      fees: col.fees,
      rating: col.rating,
      branches: Array.from(col.branches),
      minRank: sortedRanks.length > 0 ? sortedRanks[0] : null,
      maxRank: sortedRanks.length > 0 ? sortedRanks[sortedRanks.length - 1] : null,
    };
  });

  // Sort alphabetically
  resultsList.sort((a, b) => a.name.localeCompare(b.name));

  const pageTitle = location
    ? `Colleges in ${location}`
    : q
    ? `Search Results for "${q}"`
    : 'All Engineering Colleges';

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Search', href: '/search' },
    { label: location || q || 'Colleges', href: '' }
  ];

  return (
    <>
      {/* Navbar Header */}
      <Header />

      {/* Hero Section */}
      <section className="search-hero">
        <div className="search-hero-inner">
          <div className="search-hero-eyebrow">RankSure Directory</div>
          <h1>{pageTitle}</h1>
          <p>
            {resultsList.length > 0
              ? `Found ${resultsList.length} colleges matching your search criteria. Click on any card to view cutoffs and details.`
              : 'Browse AP engineering colleges and cutoff databases.'}
          </p>
        </div>
      </section>

      <div className="container" style={{ paddingBottom: 64 }}>
        <Breadcrumb items={breadcrumbs} />

        {resultsList.length > 0 ? (
          <div className="cards-grid" style={{ marginTop: 24 }}>
            {resultsList.map((col) => {
              const href = `/college/${encodeURIComponent(col.name)}`;
              const branchText = col.branches.slice(0, 4).join(', ') + 
                (col.branches.length > 4 ? ` & ${col.branches.length - 4} more` : '');

              return (
                <Link
                  href={href}
                  key={col.name}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <article className="college-card" style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="card-top">
                        <h3 className="card-name" style={{ fontSize: '1.05rem', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
                          🏫 {col.name}
                        </h3>
                      </div>
                      
                      <p className="card-branch" style={{ fontSize: '.72rem', minHeight: '34px', textOverflow: 'ellipsis', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {branchText || 'Engineering'}
                      </p>

                      <div className="card-info" style={{ marginTop: 12 }}>
                        <div>
                          <div className="info-label">Location</div>
                          <div className="info-val">{col.location}</div>
                        </div>
                        <div>
                          <div className="info-label">Annual Fees</div>
                          <div className="info-val">{col.fees || '—'}</div>
                        </div>
                        <div>
                          <div className="info-label">Closing Cutoff (2025)</div>
                          <div className="info-val" style={{ fontSize: '.8rem' }}>
                            {col.minRank && col.maxRank
                              ? `${col.minRank.toLocaleString('en-IN')} - ${col.maxRank.toLocaleString('en-IN')}`
                              : '—'}
                          </div>
                        </div>
                        <div>
                          <div className="info-label">Placement</div>
                          <div className="info-val"><StarRating r={col.rating} /></div>
                        </div>
                      </div>
                    </div>

                    <div className="card-actions" style={{ marginTop: 16 }}>
                      <span className="card-detail-btn" style={{ width: '100%', textAlign: 'center' }}>
                        View Cutoffs &amp; Details →
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="search-empty-state">
            <div className="search-empty-icon">🔍</div>
            <h3>No Colleges Found</h3>
            <p>We couldn&apos;t find any colleges matching &ldquo;{location || q}&rdquo;.</p>
            
            <div className="popular-locations-box">
              <h4>Popular Locations in Andhra Pradesh:</h4>
              <div className="popular-locations-grid">
                {['Vijayawada', 'Visakhapatnam', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Kadapa', 'Anantapur'].map((loc) => (
                  <Link
                    key={loc}
                    href={`/search?location=${encodeURIComponent(loc)}`}
                    className="popular-location-pill"
                  >
                    {loc}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer-enhanced">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="nav-logo">🎯 Rank<span>Sure</span></a>
            <p>Free AP EAPCET college predictor built on 3 years of official cutoff data. Helping students find the right engineering college since 2025.</p>
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
