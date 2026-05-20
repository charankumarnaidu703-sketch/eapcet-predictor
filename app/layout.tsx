import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EAPCET College Predictor 2025 — Find Your Best College by Rank',
  description:
    'Predict your best AP EAPCET 2025 college and branch based on your rank. Uses 3 years of real cutoff data from 328+ colleges. Free, fast, accurate.',
  keywords: 'EAPCET predictor, AP EAMCET college predictor, EAPCET 2025, AP engineering colleges cutoff rank',
  openGraph: {
    title: 'EAPCET College Predictor 2025',
    description: 'Find your best AP EAPCET college based on real cutoff data',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
