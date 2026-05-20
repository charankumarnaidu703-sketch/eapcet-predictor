import type { Metadata } from 'next';
import CounsellingWidget from '@/components/CounsellingWidget';
import DocumentChecklist from '@/components/DocumentChecklist';
import ReimbursementMiniBanner from '@/components/college/ReimbursementMiniBanner';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'AP EAPCET 2025 Counselling Dates & Document Checklist',
  description: 'AP & TS EAPCET 2025 counselling schedule with live countdown, web options dates, allotment schedule, and complete document checklist for verification. Updated daily.',
  alternates: {
    canonical: '/tools/counselling',
  },
  openGraph: {
    title: 'EAPCET 2025 Counselling Dates & Document Checklist — RankSure',
    description: 'Live countdown to AP EAPCET counselling events. Track web options, allotment dates, and verify your document checklist.',
  },
};

export default function CounsellingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <main style={{ flex: 1, padding: '40px 16px', background: 'var(--cream-lt)' }}>
        <div className="container" style={{ maxWidth: 1000 }}>
          
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Tools', href: '/' },
            { label: 'Counselling Dates' },
          ]} />
          
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{ fontFamily: 'Playfair Display,serif', color: 'var(--navy)', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: 8 }}>
              Counselling Dates & Document Checklist
            </h1>
            <p style={{ color: 'var(--muted)', fontFamily: 'Plus Jakarta Sans,sans-serif', maxWidth: 600, margin: '0 auto' }}>
              Track important upcoming counselling dates and organize your certificates before verification.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start', marginBottom: 32 }}>
            <div>
              <CounsellingWidget />
            </div>
            <div>
              <DocumentChecklist />
            </div>
          </div>

          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <ReimbursementMiniBanner />
          </div>

        </div>
      </main>
      
    </div>
  );
}
