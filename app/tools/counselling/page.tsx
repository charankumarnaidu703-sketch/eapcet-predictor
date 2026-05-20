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
      
      <main 
        className="flex-1 py-6 px-0 md:py-10 md:px-4"
        style={{ background: 'var(--cream-lt)' }}
      >
        <div className="container" style={{ maxWidth: 1000 }}>
          
          <div className="px-4 md:px-0 mb-4">
            <Breadcrumb items={[
              { label: 'Home', href: '/' },
              { label: 'Tools', href: '/' },
              { label: 'Counselling Dates' },
            ]} />
          </div>
          
          <div className="px-4 md:px-0 text-center mb-8 md:mb-10">
            <h1 
              className="text-2xl font-bold md:text-[clamp(1.5rem,4vw,2.2rem)] md:font-extrabold text-[var(--navy)] mb-2"
              style={{ fontFamily: 'Playfair Display,serif' }}
            >
              Counselling Dates & Document Checklist
            </h1>
            <p 
              className="text-sm text-gray-600 md:text-base md:text-[var(--muted)] max-w-[600px] mx-auto"
              style={{ fontFamily: 'Plus Jakarta Sans,sans-serif' }}
            >
              Track important upcoming counselling dates and organize your certificates before verification.
            </p>
          </div>

          <div 
            className="grid grid-cols-1 md:grid gap-6 items-start mb-8 px-4 md:px-0"
            style={{ 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 24, 
              alignItems: 'start', 
              marginBottom: 32 
            }}
          >
            <div>
              <CounsellingWidget />
            </div>
            <div>
              <DocumentChecklist />
            </div>
          </div>

          <div className="px-4 md:px-0 max-w-[600px] mx-auto">
            <ReimbursementMiniBanner />
          </div>

        </div>
      </main>
      
    </div>
  );
}
