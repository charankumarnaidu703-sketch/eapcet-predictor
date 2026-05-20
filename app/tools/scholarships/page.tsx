import React from 'react';
import { Metadata } from 'next';
import { SCHOLARSHIP_SCHEMES } from '@/lib/scholarshipRules';
import ScholarshipsClient from './ScholarshipsClient';

export const metadata: Metadata = {
  title: 'EAPCET Scholarship & Fee Reimbursement Guide 2025 — AP & Telangana',
  description: 'Complete guide to 10 government and private scholarships for AP & Telangana engineering students. Covers Vidya Deevena, TS ePASS, PM YASASVI, and more. Check eligibility instantly.',
  alternates: {
    canonical: '/tools/scholarships',
  },
  openGraph: {
    title: 'EAMCET Scholarship & Fee Reimbursement Guide 2025 — RankSure',
    description: 'Find all scholarships available for AP & TS EAPCET engineering students. Compare benefits, eligibility, and apply directly.',
  },
};

export default function ScholarshipsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Can I apply for multiple schemes simultaneously?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, you can apply for both state and central government schemes. However, fee reimbursement is typically capped at the actual tuition fee — you cannot profit from multiple fee schemes.',
        },
      },
      {
        '@type': 'Question',
        name: 'When should I apply for fee reimbursement?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You should apply for state fee reimbursement (like AP Vidya Deevena or TS ePASS) within 30 days of confirming your admission at the allotted college.',
        },
      },
      {
        '@type': 'Question',
        name: 'What if my income certificate is from last year?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most government schemes require a valid income certificate issued on or after April 1st of the current financial year. An older certificate may lead to application rejection.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does reimbursement cover hostel fees?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Standard fee reimbursement covers only tuition fees. However, schemes like AP Vasathi Deevena or central maintenance allowances provide additional stipends to help cover hostel and mess charges.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        {/* SECTION A — Page Header */}
        <header className="px-4 py-6 md:px-0 md:py-0 text-center" style={{ marginBottom: 40 }}>
          <h1 className="text-2xl md:text-4xl font-bold text-[var(--navy)] mb-4" style={{ margin: '0 0 16px 0', lineHeight: 1.2 }}>
            EAMCET Scholarship & Fee Reimbursement Guide 2025
          </h1>
          <p className="text-sm md:text-[1.1rem] text-[var(--slate)] max-w-[800px] mx-auto">
            Complete guide to government and private scholarships available for AP and Telangana engineering students
          </p>
        </header>

        {/* Client Component for filtering and accordion */}
        <ScholarshipsClient schemes={SCHOLARSHIP_SCHEMES} />

        {/* SECTION E — FAQ Section */}
        <section style={{ marginTop: 80 }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--navy)', marginBottom: 32, textAlign: 'center' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 800, margin: '0 auto' }}>
            <details className="faq-item" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px' }}>
              <summary style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--navy)', cursor: 'pointer' }}>
                Can I apply for multiple schemes simultaneously?
              </summary>
              <div style={{ marginTop: 12, color: 'var(--slate)', lineHeight: 1.6 }}>
                Yes, you can apply for both state and central government schemes. However, fee reimbursement is typically capped at the actual tuition fee — you cannot profit from multiple fee schemes.
              </div>
            </details>
            <details className="faq-item" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px' }}>
              <summary style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--navy)', cursor: 'pointer' }}>
                When should I apply for fee reimbursement?
              </summary>
              <div style={{ marginTop: 12, color: 'var(--slate)', lineHeight: 1.6 }}>
                You should apply for state fee reimbursement (like AP Vidya Deevena or TS ePASS) within 30 days of confirming your admission at the allotted college.
              </div>
            </details>
            <details className="faq-item" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px' }}>
              <summary style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--navy)', cursor: 'pointer' }}>
                What if my income certificate is from last year?
              </summary>
              <div style={{ marginTop: 12, color: 'var(--slate)', lineHeight: 1.6 }}>
                Most government schemes require a valid income certificate issued on or after April 1st of the current financial year. An older certificate may lead to application rejection.
              </div>
            </details>
            <details className="faq-item" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px' }}>
              <summary style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--navy)', cursor: 'pointer' }}>
                Does reimbursement cover hostel fees?
              </summary>
              <div style={{ marginTop: 12, color: 'var(--slate)', lineHeight: 1.6 }}>
                Standard fee reimbursement covers only tuition fees. However, schemes like AP Vasathi Deevena or central maintenance allowances provide additional stipends to help cover hostel and mess charges.
              </div>
            </details>
          </div>
        </section>
      </div>
    </>
  );
}
