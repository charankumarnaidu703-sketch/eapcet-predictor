'use client';

import { useEffect, useState } from 'react';
import ComparisonTable from '@/components/college/ComparisonTable';
import RecommendationCard from '@/components/college/RecommendationCard';
import ShareButton from '@/components/ShareButton';
import { generateComparisonShareText } from '@/lib/share';
import type { CollegeData } from '@/app/compare/page';

interface Props {
  colleges: CollegeData[];
  siteUrl: string;
}

export default function CompareClient({ colleges, siteUrl }: Props) {
  const [studentRank, setStudentRank] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('prediction_input');
      if (stored) {
        const parsed = JSON.parse(stored);
        const rank = parseInt(parsed.rank);
        if (!isNaN(rank) && rank > 0) setStudentRank(rank);
      }
    } catch {
      // sessionStorage may be unavailable in some contexts
    }
  }, []);

  return (
    <>
      {studentRank && (
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.82rem',
            marginBottom: 16,
            padding: '8px 14px',
            background: 'rgba(99,102,241,0.08)',
            borderRadius: 8,
            display: 'inline-block',
          }}
        >
          🎯 Showing probabilities for your rank:{' '}
          <strong style={{ color: 'var(--primary-lt)' }}>
            {studentRank.toLocaleString('en-IN')}
          </strong>
        </p>
      )}

      <ComparisonTable colleges={colleges} studentRank={studentRank} />
      <RecommendationCard colleges={colleges} studentRank={studentRank} siteUrl={siteUrl} />
      
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: '12px' }}>
          Need a second opinion? Ask your friends or parents.
        </p>
        <ShareButton 
          text={generateComparisonShareText(
            colleges.map(c => c.name), 
            typeof window !== 'undefined' ? window.location.origin : 'https://eapcetpredictor.com'
          )} 
        />
      </div>
    </>
  );
}
