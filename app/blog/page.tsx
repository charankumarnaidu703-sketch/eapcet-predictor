import type { Metadata } from 'next';
import blogPosts from '@/data/blog-posts.json';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'EAPCET 2025 Guides & Articles — Counselling, Colleges & Scholarships',
  description:
    'Expert guides for AP EAPCET 2025 students — counselling process, top colleges, rank-wise predictions, scholarship guides, and branch selection tips. Updated regularly.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'EAPCET 2025 Guides & Articles — RankSure Blog',
    description: 'In-depth guides on AP EAPCET counselling, college rankings, scholarships, and career advice for engineering students.',
    siteName: 'RankSure',
  },
};

export default function BlogPage() {
  return (
    <>
      <nav className="nav" aria-label="Main navigation">
        <div className="nav-inner">
          <a href="/" className="nav-logo">🎯 Rank<span>Sure</span></a>
          <ul className="nav-links">
            <li><a href="/">Predictor</a></li>
            <li><a href="/compare">Compare</a></li>
            <li><a href="/tools/counselling">Counselling</a></li>
            <li><a href="/tools/scholarships">Scholarships</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: 'var(--navy)', padding: '48px 24px 60px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Breadcrumb
            variant="dark"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Blog' },
            ]}
          />
          <div className="hero-eyebrow" style={{ marginBottom: 12, color: 'var(--gold-lt)' }}>
            EAPCET 2025 Guides
          </div>
          <h1 style={{
            fontFamily: 'Playfair Display,serif',
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            color: '#fff', fontWeight: 800, marginBottom: 16, lineHeight: 1.15,
          }}>
            Expert Guides for<br /><em>EAPCET Students</em>
          </h1>
          <p style={{
            color: 'rgba(255,255,255,.7)', fontSize: '1.05rem',
            fontFamily: 'Plus Jakarta Sans,sans-serif', lineHeight: 1.6, maxWidth: 600,
          }}>
            Counselling process, college rankings, scholarship guides, and branch selection advice — all backed by data from 328+ colleges.
          </p>
        </div>
      </div>

      {/* Article Grid */}
      <main style={{ maxWidth: 900, margin: '-24px auto 60px', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gap: 20 }}>
          {blogPosts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{
                display: 'block', background: '#fff', border: '1px solid var(--line)',
                borderRadius: 'var(--r2)', padding: '28px 28px 24px',
                textDecoration: 'none', transition: 'all .2s',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{
                  background: 'rgba(200,134,42,.1)', color: 'var(--gold)',
                  padding: '3px 10px', borderRadius: 'var(--r)',
                  fontSize: '.7rem', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase',
                }}>
                  {post.category}
                </span>
                <span style={{
                  color: 'var(--faint)', fontSize: '.72rem',
                  fontFamily: 'Plus Jakarta Sans,sans-serif', display: 'flex', alignItems: 'center',
                }}>
                  {post.readingTime}
                </span>
                {post.featured && (
                  <span style={{
                    background: 'rgba(21,51,82,.08)', color: 'var(--navy)',
                    padding: '3px 10px', borderRadius: 'var(--r)',
                    fontSize: '.68rem', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase',
                  }}>
                    ⭐ Featured
                  </span>
                )}
              </div>
              <h2 style={{
                fontFamily: 'Playfair Display,serif', fontSize: '1.25rem',
                color: 'var(--navy)', fontWeight: 800, marginBottom: 10, lineHeight: 1.3,
              }}>
                {post.title}
              </h2>
              <p style={{
                color: 'var(--muted)', fontSize: '.88rem',
                fontFamily: 'Plus Jakarta Sans,sans-serif', lineHeight: 1.6,
              }}>
                {post.description}
              </p>
              <div style={{
                marginTop: 16, fontSize: '.78rem', color: 'var(--gold)',
                fontWeight: 700, fontFamily: 'Plus Jakarta Sans,sans-serif',
              }}>
                Read Article →
              </div>
            </a>
          ))}
        </div>
      </main>

      {/* Footer */}
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
            <h4>Guides</h4>
            <ul>
              {blogPosts.slice(0, 4).map(p => (
                <li key={p.slug}><a href={`/blog/${p.slug}`}>{p.category}</a></li>
              ))}
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
