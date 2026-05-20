import { ImageResponse } from 'next/og';
import blogPosts from '@/data/blog-posts.json';

export const alt = 'RankSure Blog — EAPCET Guides & Tips';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function BlogPostOGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find(p => p.slug === slug);
  const title = post?.title ?? 'Blog Post';
  const category = post?.category ?? 'Guide';
  const readTime = post?.readingTime ?? '';

  // Category emoji mapping
  const emojiMap: Record<string, string> = {
    'Counselling': '📋',
    'College Rankings': '🏆',
    'Predictions': '🎯',
    'Scholarships': '💰',
    'Branch Guidance': '🔀',
    'Data Analysis': '📊',
  };
  const emoji = emojiMap[category] ?? '📚';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0f2439 0%, #1a3a5c 50%, #0f2439 100%)',
          fontFamily: 'sans-serif',
          padding: '48px 56px',
        }}
      >
        {/* Gold accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #c8862a, #e6a84d, #c8862a)',
          }}
        />

        {/* Top: Category badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 32 }}>{emoji}</span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#c8862a',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            {category}
          </span>
          {readTime && (
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', marginLeft: 8 }}>
              · {readTime}
            </span>
          )}
        </div>

        {/* Center: Title */}
        <div
          style={{
            fontSize: title.length > 60 ? 38 : 44,
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.25,
            maxWidth: 1000,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {title}
        </div>

        {/* Bottom: Branding */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>🎯</span>
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#ffffff',
              }}
            >
              Rank<span style={{ color: '#c8862a' }}>Sure</span>
            </span>
          </div>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>
            ranksure.vercel.app
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
