'use client';

import { useRouter } from 'next/navigation';

export default function ReimbursementMiniBanner() {
  const router = useRouter();

  return (
    <>
      {/* Desktop Banner: Untouched */}
      <div 
        className="hidden md:flex"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
          borderRadius: 'var(--r2)',
          padding: '24px',
          color: '#fff',
          flexDirection: 'column',
          gap: 16,
          boxShadow: 'var(--sh1)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative background shape */}
        <div style={{
          position: 'absolute',
          right: -30,
          top: -30,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none'
        }} />

        <div>
          <h3 style={{ 
            fontFamily: 'Playfair Display,serif', 
            fontSize: '1.2rem', 
            fontWeight: 800, 
            marginBottom: 6,
            color: 'var(--gold)' 
          }}>
            You May Be Eligible for Fee Reimbursement
          </h3>
          <p style={{ 
            fontFamily: 'Plus Jakarta Sans,sans-serif', 
            fontSize: '.85rem', 
            lineHeight: 1.5, 
            color: 'rgba(255,255,255,0.85)',
            maxWidth: '90%'
          }}>
            AP and Telangana governments offer fee reimbursement for eligible categories. Check if you qualify and potentially save <strong>Rs. 1 to 3 Lakhs per year.</strong>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <button 
            onClick={() => router.push('/tools/reimbursement')}
            className="pulse-anim"
            style={{
              background: 'var(--gold)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--r)',
              padding: '10px 20px',
              fontWeight: 700,
              fontSize: '.85rem',
              fontFamily: 'Plus Jakarta Sans,sans-serif',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            Check My Eligibility ↗
          </button>
          <a 
            href="/tools/scholarships"
            style={{
              fontSize: '.85rem',
              color: '#fff',
              textDecoration: 'underline',
              fontWeight: 600,
              fontFamily: 'Plus Jakarta Sans,sans-serif'
            }}
          >
            Browse all schemes
          </a>
        </div>
      </div>

      {/* Mobile Banner: Redesigned */}
      <div 
        className="flex md:hidden flex-col gap-4 p-5 rounded-xl text-white relative overflow-hidden shadow"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
        }}
      >
        <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

        <div>
          <h3 className="font-serif text-lg font-bold text-[#E8A84A] mb-1.5 leading-snug">
            You May Be Eligible for Fee Reimbursement
          </h3>
          <p className="text-xs text-white/80 leading-relaxed">
            AP and Telangana governments offer fee reimbursement for eligible categories. Check if you qualify and potentially save <strong>Rs. 1 to 3 Lakhs per year.</strong>
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={() => router.push('/tools/reimbursement')}
            className="pulse-anim w-full text-center py-3 bg-[#C8862A] text-white rounded font-bold text-sm tracking-wide shadow"
            style={{ fontFamily: 'Plus Jakarta Sans,sans-serif' }}
          >
            Check My Eligibility ↗
          </button>
          <a 
            href="/tools/scholarships"
            className="block mt-2 text-center text-xs text-white underline font-semibold"
            style={{ fontFamily: 'Plus Jakarta Sans,sans-serif' }}
          >
            Browse all schemes
          </a>
        </div>
      </div>
    </>
  );
}
