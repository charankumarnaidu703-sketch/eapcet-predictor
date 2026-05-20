import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'RankSure Blog — EAPCET Guides & Tips';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function BlogOGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0f2439 0%, #1a3a5c 50%, #0f2439 100%)',
          fontFamily: 'sans-serif',
        }}
      >
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

        <span style={{ fontSize: 56, marginBottom: 16 }}>📚</span>

        <div
          style={{
            fontSize: 42,
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.3,
            marginBottom: 16,
          }}
        >
          Expert EAPCET Guides
        </div>

        <div
          style={{
            fontSize: 22,
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            maxWidth: 700,
            lineHeight: 1.5,
          }}
        >
          Counselling process, college rankings, cutoff trends,
          branch selection & scholarship guides
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 32,
          }}
        >
          <span style={{ fontSize: 20 }}>🎯</span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#c8862a',
            }}
          >
            RankSure
          </span>
          <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>
            — ranksure.vercel.app/blog
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
