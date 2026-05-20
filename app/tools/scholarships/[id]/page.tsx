import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SCHOLARSHIP_SCHEMES } from '@/lib/scholarshipRules';

export const revalidate = 86400; // 24 hours

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return SCHOLARSHIP_SCHEMES.map(scheme => ({
    id: scheme.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const scheme = SCHOLARSHIP_SCHEMES.find(s => s.id === id);
  if (!scheme) return { title: 'Scholarship Not Found' };
  
  return {
    title: `${scheme.name} - Eligibility & Details`,
    description: scheme.shortDescription || scheme.description,
  };
}

export default async function ScholarshipDetailPage({ params }: PageProps) {
  const { id } = await params;
  const scheme = SCHOLARSHIP_SCHEMES.find(s => s.id === id);

  if (!scheme) {
    notFound();
  }

  return (
    <>
      {/* Navigation matching other pages */}
      <nav className="nav" aria-label="Main navigation">
        <div className="nav-inner">
          <a href="/" className="nav-logo">🎯 EAPCET <span>Predictor</span></a>
          <ul className="nav-links">
            <li><a href="/">← Predictor</a></li>
            <li><a href="/tools/counselling">Counselling</a></li>
            <li><a href="/tools/scholarships">Scholarships</a></li>
            <li><a href="/tools/reimbursement">Fee Aid</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ background: 'var(--navy)', padding: '48px 24px 60px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <span style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--gold-lt)', padding: '4px 10px', borderRadius: 'var(--r)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {scheme.state === 'Both' ? 'AP & Telangana' : scheme.state}
            </span>
          </div>
          <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#fff', fontWeight: 800, marginBottom: 16, lineHeight: 1.1 }}>
            {scheme.name}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', fontFamily: 'Plus Jakarta Sans,sans-serif', lineHeight: 1.6, maxWidth: 700 }}>
            {scheme.shortDescription || scheme.description}
          </p>
          <div style={{ marginTop: 24, display: 'inline-block', background: 'var(--gold)', color: '#fff', padding: '8px 16px', borderRadius: 'var(--r)', fontWeight: 700, fontSize: '0.95rem' }}>
            {scheme.amount}
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 800, margin: '-24px auto 80px', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        
        {/* Main Content Card */}
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--r2)', padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--navy)', marginBottom: 12, fontWeight: 800 }}>Overview</h2>
            <p style={{ color: 'var(--text)', lineHeight: 1.6 }}>{scheme.fullDescription}</p>
            <div style={{ marginTop: 16, background: 'var(--cream)', padding: 16, borderRadius: 'var(--r)', borderLeft: '3px solid var(--gold)' }}>
              <strong>Income Limit:</strong> Family income must be below Rs. {(scheme.maxAnnualIncome / 100000).toFixed(1)} Lakhs per annum.
            </div>
            {scheme.eligibleCategories.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <strong>Eligible Categories:</strong>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  {scheme.eligibleCategories.map(cat => (
                    <span key={cat} style={{ background: 'var(--cream-dk)', padding: '4px 10px', borderRadius: 4, fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate)' }}>
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {scheme.eligibilitySteps && scheme.eligibilitySteps.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--navy)', marginBottom: 12, fontWeight: 800 }}>Eligibility & Process</h2>
              <ol style={{ paddingLeft: 20, color: 'var(--text)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {scheme.eligibilitySteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </section>
          )}

          {scheme.documents && scheme.documents.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--navy)', marginBottom: 12, fontWeight: 800 }}>Required Documents</h2>
              <ul style={{ paddingLeft: 20, color: 'var(--text)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {scheme.documents.map((doc, i) => (
                  <li key={i}>{doc}</li>
                ))}
              </ul>
            </section>
          )}

          {scheme.disbursementTimeline && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--navy)', marginBottom: 12, fontWeight: 800 }}>Disbursement Timeline</h2>
              <p style={{ color: 'var(--text)', lineHeight: 1.6 }}>{scheme.disbursementTimeline}</p>
            </section>
          )}

          {scheme.importantNotes && scheme.importantNotes.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: '1.25rem', color: '#b91c1c', marginBottom: 12, fontWeight: 800 }}>Important Notes</h2>
              <ul style={{ paddingLeft: 20, color: '#991b1b', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 8, background: '#fef2f2', padding: '16px 16px 16px 36px', borderRadius: 'var(--r)' }}>
                {scheme.importantNotes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </section>
          )}

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--line)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {scheme.applyUrl && (
              <a href={scheme.applyUrl} target="_blank" rel="noopener noreferrer" style={{ background: 'var(--navy)', color: '#fff', padding: '12px 24px', borderRadius: 'var(--r)', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                Visit Official Portal ↗
              </a>
            )}
            <a href="/tools/reimbursement" style={{ background: 'var(--gold)', color: '#fff', padding: '12px 24px', borderRadius: 'var(--r)', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
              Check Eligibility Tool
            </a>
          </div>

        </div>
      </main>
      
      <footer className="footer">
        <p>© 2025 EAPCET Predictor · <a href="/tools/scholarships">Back to Scholarships</a></p>
      </footer>
    </>
  );
}
