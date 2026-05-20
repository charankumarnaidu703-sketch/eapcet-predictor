import type { Metadata } from 'next';
import CounsellingWidget from '@/components/CounsellingWidget';
import DocumentChecklist from '@/components/DocumentChecklist';
import ReimbursementMiniBanner from '@/components/college/ReimbursementMiniBanner';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'EAPCET 2025 Counselling Dates & Document Checklist',
  description: 'Stay updated with AP & TS EAPCET counselling dates, web options, allotment schedules, and track your required documents for verification.',
};

export default function CounsellingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <main style={{ flex: 1, padding: '40px 16px', background: 'var(--cream-lt)' }}>
        <div className="container" style={{ maxWidth: 1000 }}>
          
          <Link href="/" style={{ display: 'inline-block', marginBottom: 20, padding: '8px 16px', background: 'transparent', border: '1px solid var(--line-dk)', borderRadius: 'var(--r)', color: 'var(--muted)', fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans,sans-serif', textDecoration: 'none' }}>
            ← Back to Predictor
          </Link>
          
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
