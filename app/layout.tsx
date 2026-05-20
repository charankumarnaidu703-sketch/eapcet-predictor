import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ranksure.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'RankSure — AP EAPCET College Predictor 2025 | Find Your Best College by Rank',
    template: '%s | RankSure',
  },
  description:
    'Enter your AP EAPCET 2025 rank and get instant predictions for 328+ colleges. See Safe/Medium/Reach colleges with fees, placements & cutoffs. Free, no login required.',
  keywords: [
    'EAPCET predictor', 'AP EAMCET college predictor', 'EAPCET 2025',
    'AP engineering colleges cutoff rank', 'EAPCET rank wise college list',
    'EAPCET counselling 2025', 'AP EAPCET cutoff', 'RankSure',
    'EAPCET college predictor', 'best college for EAPCET rank',
  ],
  authors: [{ name: 'RankSure' }],
  creator: 'RankSure',
  publisher: 'RankSure',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'RankSure — AP EAPCET College Predictor 2025',
    description: 'Predict your best AP EAPCET college based on 3 years of real cutoff data from 328+ colleges. Free and instant.',
    url: SITE_URL,
    siteName: 'RankSure',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RankSure — AP EAPCET College Predictor 2025',
    description: 'Enter your rank → Get instant predictions for 328+ AP engineering colleges. Free, no login.',
  },
  alternates: {
    canonical: '/',
  },
  category: 'education',
};

// Organization + WebApplication JSON-LD schema
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'RankSure',
  url: SITE_URL,
  description: 'Free AP EAPCET college predictor with 3 years of real cutoff data from 328+ engineering colleges.',
  sameAs: [],
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'RankSure — EAPCET College Predictor',
  url: SITE_URL,
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
  },
  description: 'Predict your best AP EAPCET 2025 college based on rank. Uses trend-adjusted statistical model on 6,243 official cutoff records.',
  featureList: [
    'Rank-based college prediction',
    'Branch-wise cutoff trends (2023–2025)',
    'Side-by-side college comparison',
    'Fee reimbursement eligibility checker',
    'Counselling dates tracker',
    'Scholarship guide',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light" />
        <link rel="icon" href="/favicon.ico" sizes="256x256" type="image/x-icon" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
