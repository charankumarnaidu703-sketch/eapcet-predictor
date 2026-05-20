'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkEligibility, EligibilityResult, ScholarshipScheme } from '@/lib/scholarshipRules';
import ShareButton from '@/components/ShareButton';

export default function ReimbursementPage() {
  const router = useRouter();
  
  // Wizard State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // Step 4 is results
  
  // Form State
  const [stateForm, setStateForm] = useState<'AP' | 'Telangana' | ''>('');
  const [category, setCategory] = useState<string>('');
  const [incomeRange, setIncomeRange] = useState<number | ''>('');
  const [hasCert, setHasCert] = useState<'yes' | 'no' | 'will-get' | ''>('');
  const [marks, setMarks] = useState<string>('');
  const [rank, setRank] = useState<string>('');

  // Results State
  const [results, setResults] = useState<EligibilityResult | null>(null);

  const categories = ['OC', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'SC', 'ST', 'EBC', 'Minority'];

  const handleNext = () => {
    if (step === 3) {
      // Calculate results
      const res = checkEligibility({
        state: stateForm as 'AP' | 'Telangana',
        category,
        annualIncome: incomeRange as number,
        incomeCertificate: hasCert as 'yes' | 'no' | 'will-get',
      });
      setResults(res);
      setStep(4);
    } else {
      setStep((s) => (s + 1) as 1 | 2 | 3);
    }
  };

  const handleBack = () => {
    setStep((s) => (s - 1) as 1 | 2 | 3);
  };

  const isStepValid = () => {
    if (step === 1) return stateForm !== '' && category !== '';
    if (step === 2) return incomeRange !== '' && hasCert !== '';
    if (step === 3) return marks !== ''; // rank is optional
    return true;
  };

  const cardStyle = {
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: 'var(--r2)',
    boxShadow: 'var(--sh1)',
    padding: '32px 24px',
    maxWidth: 600,
    margin: '0 auto',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, padding: '40px 16px', background: 'var(--cream-lt)' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          
          <button onClick={() => router.back()} style={{ marginBottom: 20, padding: '8px 16px', background: 'transparent', border: '1px solid var(--line-dk)', borderRadius: 'var(--r)', color: 'var(--muted)', fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans,sans-serif' }}>
            ← Back
          </button>

          
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Playfair Display,serif', color: 'var(--navy)', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: 8 }}>
              Fee Reimbursement Checker
            </h1>
            <p style={{ color: 'var(--muted)', fontFamily: 'Plus Jakarta Sans,sans-serif', maxWidth: 500, margin: '0 auto' }}>
              Check your eligibility for government scholarships and fee reimbursement schemes in AP and Telangana.
            </p>
          </div>

          {step < 4 && (
            <div style={cardStyle}>
              {/* Progress */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, fontSize: '.75rem', fontWeight: 700, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'Plus Jakarta Sans,sans-serif' }}>
                <span>Step {step} of 3</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ height: 4, width: 24, borderRadius: 2, background: i <= step ? 'var(--gold)' : 'var(--line)' }} />
                  ))}
                </div>
              </div>

              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 12, fontWeight: 700, color: 'var(--navy)', fontSize: '.9rem' }}>Which state are you studying in?</label>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {['AP', 'Telangana'].map(s => (
                        <button key={s} onClick={() => setStateForm(s as any)}
                          style={{ flex: 1, padding: '12px', border: stateForm === s ? '2px solid var(--gold)' : '1px solid var(--line)', background: stateForm === s ? 'var(--gold-pale)' : '#fff', borderRadius: 'var(--r)', fontWeight: 600, color: stateForm === s ? 'var(--gold)' : 'var(--text)', transition: 'all .15s' }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 12, fontWeight: 700, color: 'var(--navy)', fontSize: '.9rem' }}>What is your reservation category?</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {categories.map(c => (
                        <button key={c} onClick={() => setCategory(c)}
                          style={{ padding: '8px 16px', border: category === c ? '2px solid var(--navy)' : '1px solid var(--line)', background: category === c ? 'var(--navy)' : '#fff', color: category === c ? '#fff' : 'var(--text)', borderRadius: 20, fontWeight: 500, fontSize: '.85rem', transition: 'all .15s' }}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 12, fontWeight: 700, color: 'var(--navy)', fontSize: '.9rem' }}>Annual Family Income</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { label: 'Below Rs. 1,00,000', val: 99000 },
                        { label: 'Rs. 1,00,001 to Rs. 2,00,000', val: 150000 },
                        { label: 'Rs. 2,00,001 to Rs. 2,50,000', val: 240000 },
                        { label: 'Above Rs. 2,50,000', val: 300000 },
                      ].map(inc => (
                        <button key={inc.val} onClick={() => setIncomeRange(inc.val)}
                          style={{ textAlign: 'left', padding: '12px 16px', border: incomeRange === inc.val ? '2px solid var(--gold)' : '1px solid var(--line)', background: incomeRange === inc.val ? 'var(--gold-pale)' : '#fff', borderRadius: 'var(--r)', fontWeight: 500, color: incomeRange === inc.val ? 'var(--gold)' : 'var(--text)', transition: 'all .15s' }}>
                          {inc.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 12, fontWeight: 700, color: 'var(--navy)', fontSize: '.9rem' }}>Do you have a valid Income Certificate?</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { label: 'Yes, I have it', val: 'yes' },
                        { label: 'No, I don\'t', val: 'no' },
                        { label: 'I will get one soon', val: 'will-get' },
                      ].map(opt => (
                        <button key={opt.val} onClick={() => setHasCert(opt.val as any)}
                          style={{ textAlign: 'left', padding: '12px 16px', border: hasCert === opt.val ? '2px solid var(--navy)' : '1px solid var(--line)', background: hasCert === opt.val ? 'var(--navy)' : '#fff', color: hasCert === opt.val ? '#fff' : 'var(--text)', borderRadius: 'var(--r)', fontWeight: 500, transition: 'all .15s' }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, color: 'var(--navy)', fontSize: '.9rem' }}>Intermediate (12th) Marks %</label>
                    <input type="number" placeholder="e.g. 85" value={marks} onChange={e => setMarks(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--line)', borderRadius: 'var(--r)', fontSize: '1rem', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, color: 'var(--navy)', fontSize: '.9rem' }}>EAPCET Rank (Optional)</label>
                    <input type="number" placeholder="e.g. 15420" value={rank} onChange={e => setRank(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--line)', borderRadius: 'var(--r)', fontSize: '1rem', outline: 'none' }} />
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
                {step > 1 ? (
                  <button onClick={handleBack} style={{ padding: '10px 20px', background: 'transparent', border: 'none', color: 'var(--muted)', fontWeight: 600, cursor: 'pointer' }}>
                    ← Back
                  </button>
                ) : <div />}
                
                <button onClick={handleNext} disabled={!isStepValid()}
                  style={{ padding: '12px 28px', background: isStepValid() ? 'var(--gold)' : 'var(--line-dk)', color: isStepValid() ? '#fff' : 'var(--muted)', border: 'none', borderRadius: 'var(--r)', fontWeight: 700, cursor: isStepValid() ? 'pointer' : 'not-allowed', transition: 'all .2s' }}>
                  {step === 3 ? 'Check Eligibility' : 'Next Step →'}
                </button>
              </div>
            </div>
          )}

          {step === 4 && results && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 8, fontFamily: 'Playfair Display,serif' }}>Your Scholarship Results</h2>
                <div style={{ display: 'inline-block', padding: '12px 24px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: 'var(--r2)', color: '#166534' }}>
                  <p style={{ fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700, marginBottom: 4 }}>Total Potential Savings</p>
                  <p style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'Playfair Display,serif' }}>{results.totalPotentialSavings}</p>
                </div>
              </div>

              {/* Eligible */}
              {results.eligible.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem', fontWeight: 700, color: '#166534', marginBottom: 16 }}>
                    <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }}/> 
                    Eligible Schemes
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {results.eligible.map(s => (
                      <SchemeCard key={s.id} scheme={s} status="eligible" />
                    ))}
                  </div>
                </div>
              )}

              {/* Possibly Eligible */}
              {results.possiblyEligible.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem', fontWeight: 700, color: '#854d0e', marginBottom: 16 }}>
                    <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#eab308' }}/> 
                    Action Required
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {results.possiblyEligible.map(s => (
                      <SchemeCard key={s.id} scheme={s} status="possibly" />
                    ))}
                  </div>
                </div>
              )}

              {/* Not Eligible */}
              {results.notEligible.length > 0 && (
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem', fontWeight: 700, color: 'var(--muted)', marginBottom: 16 }}>
                    <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: 'var(--line-dk)' }}/> 
                    Not Eligible
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {results.notEligible.map(s => (
                      <div key={s.id} style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: 'var(--r)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ fontWeight: 600, color: 'var(--subtle)' }}>{s.name}</h4>
                          <p style={{ fontSize: '.8rem', color: 'var(--faint)' }}>Does not match category or income limits.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                <ShareButton 
                  text={`Check your AP/TS Fee Reimbursement eligibility! I could save ${results.totalPotentialSavings}. Check yours here: ${typeof window !== 'undefined' ? window.location.origin : 'https://eapcetpredictor.com'}/tools/reimbursement`}
                  label="Tell a Friend on WhatsApp"
                  size="lg"
                />
                
                <button onClick={() => setStep(1)} style={{ padding: '10px 20px', border: '1px solid var(--line-dk)', background: 'transparent', borderRadius: 'var(--r)', color: 'var(--muted)', fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans,sans-serif' }}>
                  ↻ Check Another Profile
                </button>
              </div>

              <div style={{ marginTop: 40, textAlign: 'center' }}>
                <a href="/tools/scholarships" style={{ fontSize: '1.05rem', color: 'var(--navy)', fontWeight: 600, textDecoration: 'underline' }}>
                  See all available schemes →
                </a>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

function SchemeCard({ scheme, status }: { scheme: ScholarshipScheme, status: 'eligible' | 'possibly' }) {
  const isGreen = status === 'eligible';
  const bg = isGreen ? '#f0fdf4' : '#fefce8';
  const border = isGreen ? '#bbf7d0' : '#fef08a';
  const badgeBg = isGreen ? '#dcfce7' : '#fef9c3';
  const badgeCol = isGreen ? '#166534' : '#854d0e';

  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 'var(--r2)', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 4 }}>{scheme.name}</h4>
          <span style={{ display: 'inline-block', padding: '2px 8px', background: badgeBg, color: badgeCol, borderRadius: 4, fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
            {scheme.state === 'Both' ? 'AP & Telangana' : scheme.state} Scheme
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--subtle)', fontWeight: 700 }}>Amount Covered</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold)' }}>{scheme.amount}</p>
        </div>
      </div>
      
      <p style={{ fontSize: '.9rem', color: 'var(--text)', marginBottom: 16, lineHeight: 1.5 }}>
        {scheme.description}
      </p>

      {status === 'possibly' && (
        <div style={{ background: '#fffbeb', padding: '10px 14px', borderRadius: 'var(--r)', border: '1px solid #fde68a', marginBottom: 16 }}>
          <p style={{ fontSize: '.85rem', color: '#b45309', fontWeight: 600 }}>⚠️ Income Certificate Required</p>
          <p style={{ fontSize: '.8rem', color: '#b45309' }}>You match the criteria, but you must obtain a valid Income Certificate to apply.</p>
        </div>
      )}

      <div style={{ background: 'rgba(255,255,255,0.6)', padding: 16, borderRadius: 'var(--r)', marginBottom: 16 }}>
        <p style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 8, textTransform: 'uppercase' }}>Required Documents</p>
        <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6, margin: 0, paddingLeft: 16, fontSize: '.85rem', color: 'var(--muted)' }}>
          {scheme.documents.map((doc, i) => (
            <li key={i}>{doc}</li>
          ))}
        </ul>
      </div>

      <a href={scheme.applyUrl} target="_blank" rel="noopener noreferrer"
        style={{ display: 'inline-block', padding: '10px 20px', background: 'var(--navy)', color: '#fff', borderRadius: 'var(--r)', fontWeight: 600, fontSize: '.9rem', textDecoration: 'none' }}>
        Apply Now ↗
      </a>
    </div>
  );
}
