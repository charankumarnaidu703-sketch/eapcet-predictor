import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'RankSure — Free AP EAPCET 2025 College Predictor';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
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

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <span style={{ fontSize: 56 }}>🎯</span>
          <span
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-1px',
            }}
          >
            Rank
            <span style={{ color: '#c8862a' }}>Sure</span>
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 600,
            textAlign: 'center',
            lineHeight: 1.4,
            maxWidth: 800,
            marginBottom: 24,
          }}
        >
          Free AP EAPCET 2025 College Predictor
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: 'flex',
            gap: 48,
            marginTop: 12,
          }}
        >
          {[
            { value: '328+', label: 'Colleges' },
            { value: '6,243', label: 'Cutoff Records' },
            { value: '117', label: 'Branches' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: '#c8862a',
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontWeight: 600,
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 28,
            fontSize: 16,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '1px',
          }}
        >
          ranksure.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
