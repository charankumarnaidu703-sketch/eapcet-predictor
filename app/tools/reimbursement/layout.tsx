import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fee Reimbursement Eligibility Checker 2025 — AP & Telangana',
  description:
    'Check your eligibility for AP Vidya Deevena, TS ePASS, and 8 more government scholarship and fee reimbursement schemes. Free eligibility checker for EAPCET engineering students.',
  alternates: {
    canonical: '/tools/reimbursement',
  },
  openGraph: {
    title: 'Fee Reimbursement Checker — AP & TS Engineering Scholarships',
    description: 'Instantly check if you qualify for government fee reimbursement schemes. Covers AP Vidya Deevena, TS ePASS, and more.',
  },
};

export default function ReimbursementLayout({ children }: { children: React.ReactNode }) {
  return children;
}
