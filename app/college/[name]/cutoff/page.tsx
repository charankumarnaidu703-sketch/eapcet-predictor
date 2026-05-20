import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import CutoffClient from '@/components/college/CutoffClient';
import Breadcrumb from '@/components/Breadcrumb';
import MobileNav from '@/components/MobileNav';

interface PageProps {
  params: Promise<{ name: string }>;
}

export const revalidate = 86400; // 24 hours

export async function generateStaticParams() {
  try {
    const { data } = await supabase.from('eapcet_cutoffs').select('college_name');
    if (!data) return [];
    
    // Get unique names
    const uniqueNames = Array.from(new Set(data.map(d => d.college_name)));
    return uniqueNames.map(name => ({ name: encodeURIComponent(name) }));
  } catch (e) {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  // Fetch unique branches for metadata
  const { data: branchData } = await supabase
    .from('eapcet_cutoffs')
    .select('branch')
    .eq('college_name', decodedName);
    
  const branches = branchData ? Array.from(new Set(branchData.map(b => b.branch))) : [];

  if (!branches.length) {
    return { title: 'College Not Found' };
  }

  const branchList = branches.slice(0, 3).join(', ') + (branches.length > 3 ? ', etc.' : '');
  
  const { data: cseRow } = await supabase
    .from('eapcet_cutoffs')
    .select('college_name, closing_rank')
    .eq('college_name', decodedName)
    .ilike('branch', '%CSE%')
    .order('year', { ascending: false })
    .limit(1)
    .single();

  const { data: eceRow } = await supabase
    .from('eapcet_cutoffs')
    .select('college_name, closing_rank')
    .eq('college_name', decodedName)
    .ilike('branch', '%ECE%')
    .order('year', { ascending: false })
    .limit(1)
    .single();

  const cseRankText = cseRow ? `CSE closing rank ${cseRow.closing_rank}` : '';
  const eceRankText = eceRow ? `ECE closing rank ${eceRow.closing_rank}` : '';
  const rankTexts = [cseRankText, eceRankText].filter(Boolean).join(', ');

  const actualName = cseRow?.college_name || eceRow?.college_name || decodedName;

  return {
    title: `${actualName} EAMCET Cutoff 2024, 2023 | Branch-wise Opening & Closing Ranks`,
    description: `${actualName} EAMCET cutoff ranks for ${branchList}. ${rankTexts}. Check branch-wise cutoff trends from 2023 to 2025.`,
  };
}

export default async function CollegeCutoffPage({ params }: PageProps) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  const { data: rows } = await supabase
    .from('eapcet_cutoffs')
    .select('*')
    .eq('college_name', decodedName)
    .order('branch', { ascending: true })
    .order('year', { ascending: false });

  if (!rows || rows.length === 0) {
    notFound();
  }

  const collegeName = rows[0].college_name;
  const location = rows[0].location;
  const type = rows[0].type;
  const minYear = Math.min(...rows.map(r => r.year));
  const maxYear = Math.max(...rows.map(r => r.year));

  // FAQ Schema JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How is EAMCET cutoff calculated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "EAMCET cutoffs are determined by the exam conducting body based on the total number of applicants, exam difficulty, and available seat matrix across colleges and branches."
        }
      },
      {
        "@type": "Question",
        "name": "Does cutoff change every year?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, cutoffs fluctuate annually based on candidate preferences, the introduction of new branches (like AI/ML), and changes in the overall student performance."
        }
      },
      {
        "@type": "Question",
        "name": "What is opening vs closing rank?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The opening rank is the highest rank at which a seat was allotted in a branch, while the closing rank is the lowest rank (last admitted student) for that specific branch and category."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* Navigation matching other pages */}
      <nav className="nav" aria-label="Main navigation">
        <div className="nav-inner">
          <a href="/" className="nav-logo">🎯 Rank<span>Sure</span></a>
          <ul className="nav-links">
            <li><a href="/">← Predictor</a></li>
            <li><a href="/blog">Guides</a></li>
            <li><a href="/tools/counselling">Counselling</a></li>
            <li><a href="/tools/reimbursement">Fee Aid</a></li>
          </ul>
          <MobileNav />
        </div>
      </nav>

      {/* SECTION A — Hero */}
      <div style={{ background: 'var(--navy)', padding: '48px 24px 60px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Breadcrumb
            variant="dark"
            items={[
              { label: 'Home', href: '/' },
              { label: collegeName, href: `/college/${encodeURIComponent(collegeName)}` },
              { label: 'Cutoff History' },
            ]}
          />
          <div className="hero-eyebrow" style={{ marginBottom: 12, color: 'var(--gold-lt)' }}>
            Official Cutoff History
          </div>
          <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#fff', fontWeight: 800, marginBottom: 16, lineHeight: 1.1 }}>
            {collegeName}
          </h1>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: 'var(--r)', fontSize: '0.85rem', fontWeight: 600 }}>
              📍 {location}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: 'var(--r)', fontSize: '0.85rem', fontWeight: 600 }}>
              🏛 {type}
            </span>
          </div>
          <p style={{ marginTop: 24, color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', fontFamily: 'Plus Jakarta Sans,sans-serif' }}>
            Cutoff data from {minYear} to {maxYear}. Explore branch-wise opening and closing ranks below.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: '-24px auto 80px', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        {/* Render Client component for interactive Tabs & Charts */}
        <CutoffClient collegeName={collegeName} rows={rows} />

        {/* SECTION E — CTA Banner */}
        <div style={{ marginTop: 48, background: 'var(--navy)', borderRadius: 'var(--r2)', padding: '32px 24px', textAlign: 'center', color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12, fontFamily: 'Playfair Display,serif' }}>
            Check your admission chances for {collegeName}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 24, fontSize: '0.95rem' }}>
            Use our AI predictor to see your exact probability of getting into this college based on your rank.
          </p>
          <a 
            href={`/?college=${encodeURIComponent(collegeName)}`}
            style={{ display: 'inline-block', background: 'var(--gold)', color: '#fff', padding: '12px 28px', borderRadius: 'var(--r)', fontWeight: 700, textDecoration: 'none', transition: 'transform 0.2s' }}
            className="pulse-anim"
          >
            Predict My Chances →
          </a>
        </div>

        {/* SECTION F — FAQ */}
        <div style={{ marginTop: 60 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 24, fontFamily: 'Playfair Display,serif' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              {
                q: "How is EAMCET cutoff calculated?",
                a: "EAMCET cutoffs are determined by the exam conducting body based on the total number of applicants, exam difficulty, and available seat matrix across colleges and branches."
              },
              {
                q: "Does cutoff change every year?",
                a: "Yes, cutoffs fluctuate annually based on candidate preferences, the introduction of new branches (like AI/ML), and changes in the overall student performance."
              },
              {
                q: "What is opening vs closing rank?",
                a: "The opening rank is the highest rank at which a seat was allotted in a branch, while the closing rank is the lowest rank (last admitted student) for that specific branch and category."
              }
            ].map((faq, idx) => (
              <details 
                key={idx} 
                style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '16px 20px', cursor: 'pointer' }}
              >
                <summary style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '1rem', outline: 'none' }}>
                  {faq.q}
                </summary>
                <p style={{ marginTop: 12, color: 'var(--text)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
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
            <h4>This College</h4>
            <ul>
              <li><a href={`/college/${encodeURIComponent(collegeName)}`}>College Details</a></li>
              <li><a href={`/compare?colleges=${encodeURIComponent(collegeName)}`}>Compare</a></li>
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
          <p>© 2025 RankSure · Official Data</p>
          <p>Built with 💛 for AP engineering students</p>
        </div>
      </footer>
    </>
  );
}
