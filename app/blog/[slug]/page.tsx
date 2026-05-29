import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import blogPosts from '@/data/blog-posts.json';
import Breadcrumb from '@/components/Breadcrumb';
import MobileNav from '@/components/MobileNav';
import CollegeSearch from '@/components/CollegeSearch';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SITE_URL = 'https://ranksure.vercel.app';

export function generateStaticParams() {
  return blogPosts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find(p => p.slug === slug);
  if (!post) return { title: 'Article Not Found' };

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updated,
      authors: [post.author],
      siteName: 'RankSure',
      url: `${SITE_URL}/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function renderContent(block: any, i: number) {
  switch (block.type) {
    case 'tldr':
      return (
        <div key={i} className="blog-tldr" style={{
          background: 'linear-gradient(135deg, rgba(200,134,42,.08), rgba(200,134,42,.03))',
          border: '1px solid rgba(200,134,42,.2)',
          borderLeft: '4px solid var(--gold)',
          borderRadius: 'var(--r2)', padding: '20px 24px', marginBottom: 32,
        }}>
          <p style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Plus Jakarta Sans,sans-serif' }}>
            TL;DR
          </p>
          <p style={{ color: 'var(--text)', fontSize: '.92rem', lineHeight: 1.7, fontWeight: 500 }}>
            {block.text}
          </p>
        </div>
      );

    case 'heading':
      if (block.level === 2) {
        return (
          <h2 key={i} style={{
            fontFamily: 'Playfair Display,serif', fontSize: '1.3rem',
            color: 'var(--navy)', fontWeight: 800, marginTop: 40, marginBottom: 16,
            paddingBottom: 10, borderBottom: '1px solid var(--line)',
          }}>
            {block.text}
          </h2>
        );
      }
      return <h3 key={i} style={{ fontSize: '1.1rem', color: 'var(--navy)', fontWeight: 700, marginTop: 28, marginBottom: 12 }}>{block.text}</h3>;

    case 'paragraph':
      return (
        <p key={i} style={{
          color: 'var(--text)', fontSize: '.92rem', lineHeight: 1.8,
          marginBottom: 18, fontFamily: 'Plus Jakarta Sans,sans-serif',
        }}>
          {block.text}
        </p>
      );

    case 'list':
      return (
        <div key={i} style={{ marginBottom: 20 }}>
          {block.title && (
            <p style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '.9rem', marginBottom: 10 }}>
              {block.title}
            </p>
          )}
          <ul style={{
            paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8,
            color: 'var(--text)', fontSize: '.88rem', lineHeight: 1.6,
          }}>
            {block.items.map((item: string, j: number) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        </div>
      );

    case 'callout':
      return (
        <div key={i} className="blog-callout" style={{
          background: 'var(--cream)', border: '1px solid var(--line)',
          borderLeft: '4px solid var(--navy)', borderRadius: 'var(--r2)',
          padding: '18px 22px', marginBottom: 24,
        }}>
          <p style={{ fontSize: '.88rem', color: 'var(--navy)', lineHeight: 1.6, fontWeight: 500 }}>
            💡 {block.text}
          </p>
        </div>
      );

    case 'table':
      return (
        <div key={i} className="blog-table-wrapper" style={{ overflowX: 'auto', marginBottom: 24 }}>
          <table className="blog-table" style={{
            width: '100%', borderCollapse: 'collapse',
            fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '.85rem',
          }}>
            <thead>
              <tr style={{ background: 'var(--cream)' }}>
                {block.headers.map((h: string, j: number) => (
                  <th key={j} style={{
                    textAlign: 'left', padding: '10px 14px', color: 'var(--subtle)',
                    fontWeight: 700, fontSize: '.72rem', letterSpacing: '.06em',
                    textTransform: 'uppercase', borderBottom: '2px solid var(--line-dk)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row: string[], j: number) => (
                <tr key={j} style={{ borderBottom: '1px solid var(--line)' }}>
                  {row.map((cell: string, k: number) => (
                    <td key={k} style={{ padding: '10px 14px', color: k === 0 ? 'var(--navy)' : 'var(--muted)', fontWeight: k === 0 ? 600 : 400 }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts.find(p => p.slug === slug);
  if (!post) notFound();

  // Article JSON-LD schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated,
    author: { '@type': 'Organization', name: 'RankSure', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'RankSure', url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
  };

  // FAQPage schema if post has FAQ
  const faqSchema = post.faq && post.faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null;

  // Other articles for "Related Articles" section
  const otherPosts = blogPosts.filter(p => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <nav className="nav" aria-label="Main navigation">
        <div className="nav-inner">
          <a href="/" className="nav-logo">🎯 Rank<span>Sure</span></a>
          <ul className="nav-links">
            <li><a href="/">Predictor</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/tools/counselling">Counselling</a></li>
            <li><a href="/tools/scholarships">Scholarships</a></li>
          </ul>
          <CollegeSearch />
          <MobileNav />
        </div>
      </nav>

      {/* Hero */}
      <div className="blog-hero" style={{ background: 'var(--navy)', padding: '48px 24px 60px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <Breadcrumb
            variant="dark"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Blog', href: '/blog' },
              { label: post.category },
            ]}
          />
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(200,134,42,.15)', color: 'var(--gold-lt)',
              padding: '3px 10px', borderRadius: 'var(--r)',
              fontSize: '.7rem', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase',
            }}>
              {post.category}
            </span>
            <span style={{ color: 'rgba(255,255,255,.4)', fontSize: '.72rem' }}>
              {post.readingTime} · {post.date}
            </span>
          </div>
          <h1 style={{
            fontFamily: 'Playfair Display,serif',
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            color: '#fff', fontWeight: 800, lineHeight: 1.2, marginBottom: 16,
          }}>
            {post.title}
          </h1>
          <p style={{
            color: 'rgba(255,255,255,.6)', fontSize: '1rem',
            fontFamily: 'Plus Jakarta Sans,sans-serif', lineHeight: 1.6, maxWidth: 650,
          }}>
            {post.description}
          </p>
        </div>
      </div>

      {/* Article Body */}
      <main className="blog-main" style={{
        maxWidth: 780, margin: '-24px auto 0', padding: '0 24px 60px',
        position: 'relative', zIndex: 10,
      }}>
        <article className="blog-article" style={{
          background: '#fff', border: '1px solid var(--line)',
          borderRadius: 'var(--r2)', padding: '40px 36px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
        }}>
          {post.content.map((block, i) => renderContent(block, i))}

          {/* FAQ section */}
          {post.faq && post.faq.length > 0 && (
            <>
              <h2 style={{
                fontFamily: 'Playfair Display,serif', fontSize: '1.3rem',
                color: 'var(--navy)', fontWeight: 800, marginTop: 40, marginBottom: 20,
                paddingBottom: 10, borderBottom: '1px solid var(--line)',
              }}>
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {post.faq.map((faq, i) => (
                  <details key={i} className="faq-item">
                    <summary>{faq.q}</summary>
                    <div className="faq-answer">{faq.a}</div>
                  </details>
                ))}
              </div>
            </>
          )}
        </article>

        {/* CTA Banner */}
        <div className="blog-cta-banner" style={{
          background: 'var(--navy)', borderRadius: 'var(--r2)',
          padding: '32px 28px', marginTop: 32, textAlign: 'center',
        }}>
          <h3 style={{ color: '#fff', fontFamily: 'Playfair Display,serif', fontSize: '1.2rem', marginBottom: 10 }}>
            Ready to Find Your College?
          </h3>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.88rem', marginBottom: 20, fontFamily: 'Plus Jakarta Sans,sans-serif' }}>
            Enter your EAPCET rank and get instant predictions for 328+ colleges.
          </p>
          <a href="/" style={{
            display: 'inline-block', background: 'var(--gold)', color: '#fff',
            padding: '12px 28px', borderRadius: 'var(--r)', fontWeight: 700,
            textDecoration: 'none', fontSize: '.95rem',
          }}>
            Try RankSure Predictor →
          </a>
        </div>

        {/* Related Articles */}
        {otherPosts.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h3 style={{
              fontFamily: 'Playfair Display,serif', fontSize: '1.15rem',
              color: 'var(--navy)', fontWeight: 800, marginBottom: 20,
            }}>
              More Guides for EAPCET Students
            </h3>
            <div style={{ display: 'grid', gap: 16 }}>
              {otherPosts.map(p => (
                <a
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  style={{
                    display: 'block', background: '#fff', border: '1px solid var(--line)',
                    borderRadius: 'var(--r2)', padding: '18px 22px',
                    textDecoration: 'none', transition: 'all .15s',
                  }}
                >
                  <span style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    {p.category}
                  </span>
                  <h4 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1rem', color: 'var(--navy)', fontWeight: 700, marginTop: 6 }}>
                    {p.title}
                  </h4>
                </a>
              ))}
            </div>
          </div>
        )}
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
              {blogPosts.slice(0, 3).map(p => (
                <li key={p.slug}><a href={`/blog/${p.slug}`}>{p.title.split('—')[0].trim()}</a></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="/blog">All Articles</a></li>
              <li><a href="/tools/counselling">Document Checklist</a></li>
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
