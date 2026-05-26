'use client';
import { useState, useEffect } from 'react';
import type { PredictResult } from '@/app/api/predict/route';
import CounsellingWidget from '@/components/CounsellingWidget';
import ShareButton from '@/components/ShareButton';
import FilterBar from '@/components/college/FilterBar';
import MobileNav from '@/components/MobileNav';
import Header from '@/components/layout/Header';
import { generatePredictionShareText, generateCollegeShareText } from '@/lib/share';
const CATEGORIES = ['OC','BC-A','BC-B','BC-C','BC-D','BC-E','SC','ST'];
const GENDERS    = ['Male','Female'];

function StarRating({ r }: { r: number | null }) {
  if (!r) return <span style={{color:'var(--faint)',fontFamily:'inherit'}}>—</span>;
  return <span className="stars">{'★'.repeat(Math.round(r))}{'☆'.repeat(5-Math.round(r))}</span>;
}

function CollegeCard({
  result, isSelected, onToggle,
}: { result: PredictResult; isSelected: boolean; onToggle:(n:string)=>void }) {
  const cls = result.probability.toLowerCase();
  const href = `/college/${encodeURIComponent(result.college_name)}`;
  return (
    <article className={`college-card ${cls}${isSelected?' selected-for-compare':''}`}>
      <div className="card-top">
        <h3 className="card-name">{result.college_name}</h3>
        <span className={`badge ${cls}`}>{result.probability}</span>
      </div>
      <p className="card-branch">{result.branch}</p>
      <div className="card-info">
        <div><div className="info-label">Location</div><div className="info-val">{result.location}</div></div>
        <div><div className="info-label">Annual Fees</div><div className="info-val">{result.annual_fees||'—'}</div></div>
        <div><div className="info-label">Closing Rank</div><div className="info-val">{result.closing_rank}</div></div>
        <div><div className="info-label">Placement</div><div className="info-val"><StarRating r={result.placement_rating}/></div></div>
      </div>
      <div className="prob-bar-wrap">
        <div className="prob-label">
          <span>Admission chance</span>
          <span className={`prob-pct ${cls}`}>{result.probability_pct}%</span>
        </div>
        <div className="prob-bar-track">
          <div className={`prob-bar-fill ${cls}`} style={{width:`${result.probability_pct}%`}}
            role="progressbar" aria-valuenow={result.probability_pct} aria-valuemin={0} aria-valuemax={100}/>
        </div>
      </div>
      <div className="card-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="compare-btn" onClick={(e)=>{e.stopPropagation();onToggle(result.college_name)}} aria-pressed={isSelected}>
          {isSelected? '➖ Remove':'⊕ Compare'}
        </button>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <ShareButton 
            text={generateCollegeShareText(
              result.college_name, 
              result.location, 
              typeof window !== 'undefined' ? window.location.origin : 'https://eapcetpredictor.com'
            )} 
            iconOnly 
            size="sm" 
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
            <a href={href} target="_blank" rel="noopener noreferrer"
              className="card-detail-btn" onClick={e=>e.stopPropagation()}>
              View Details →
            </a>
            <a href={`${href}/cutoff`} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '.75rem', color: 'var(--navy)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}
              onClick={e=>e.stopPropagation()}>
              Cutoff History
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [rank,setRank]       = useState('');
  const [category,setCategory] = useState('OC');
  const [gender,setGender]   = useState('Male');
  const [branch,setBranch]   = useState('All');
  const [location,setLocation] = useState('All');
  const [branches,setBranches] = useState<string[]>(['All']);
  const [locations,setLocations] = useState<string[]>(['All']);
  const [results,setResults] = useState<PredictResult[]>([]);
  const [filteredResults,setFilteredResults] = useState<PredictResult[]>([]);
  const [loading,setLoading] = useState(false);
  const [searched,setSearched] = useState(false);
  const [error,setError]     = useState('');
  const [compareList,setCompareList] = useState<string[]>([]);

  useEffect(()=>{
    fetch('/api/predict').then(r=>r.json()).then(d=>{
      if(d.branches) setBranches(d.branches);
      if(d.locations) setLocations(d.locations);
    }).catch(()=>{});

    // Load persisted state from previous navigation
    try {
      const saved = sessionStorage.getItem('prediction_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.results && parsed.results.length > 0) {
          setRank(parsed.rank?.toString() || '');
          setCategory(parsed.category || 'OC');
          setGender(parsed.gender || 'Male');
          setBranch(parsed.branch || 'All');
          setLocation(parsed.location || 'All');
          setResults(parsed.results);
          setFilteredResults(parsed.results);
          setSearched(true);
        }
      }
    } catch {}
  },[]);

  const handlePredict = async (e:React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(rank);
    if(!n||n<1||n>250000){setError('Enter a valid rank between 1 and 2,50,000');return;}
    setError('');setLoading(true);setSearched(true);setCompareList([]);
    try{
      const res = await fetch('/api/predict',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({rank:n,category,gender,branch,location})});
      const data = await res.json();
      if(!res.ok) throw new Error(data.error||'Failed');
      setResults(data.results??[]);
      setFilteredResults(data.results??[]);
      try {
        sessionStorage.setItem('prediction_state', JSON.stringify({
          rank: n, category, gender, branch, location, results: data.results??[]
        }));
      } catch {}
    }catch(err){setError('Something went wrong. Please try again.');console.error(err);}
    finally{setLoading(false);}
  };

  const toggleCompare = (name:string) =>
    setCompareList(prev=> prev.includes(name)?prev.filter(n=>n!==name):prev.length>=3?prev:[...prev,name]);

  const rankNum  = parseInt(rank)||0;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .results-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 768px) {
          .results-layout {
            grid-template-columns: 1fr;
          }
        }
      `}} />
      {/* ── Nav ── */}
      <Header />

      {/* ── Hero ── */}
      <section className="hero !px-4 md:!px-8" aria-labelledby="hero-heading">
        <div className="hero-inner">
          {/* Left: editorial headline */}
          <div>
            <div className="hero-eyebrow">AP EAPCET 2025 · Rank Predictor</div>
            <h1 id="hero-heading" className="!text-3xl md:!text-5xl font-extrabold leading-tight text-white mb-5">
              Find Your Place Among<br/><em>AP&apos;s Best Engineering</em><br/>Colleges
            </h1>
            <p className="hero-sub !text-base md:!text-lg text-white/55 mb-9 leading-relaxed">
              Personalised predictions from 6,243 real cutoff records across 328+ colleges.
              Enter your rank — get your answer in under 2 seconds.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 w-full mb-9" role="list" aria-label="Stats">
              {[{n:'328+',l:'Colleges'},{n:'117',l:'Branches'},{n:'6,243',l:'Records'},{n:'3 Yrs',l:'Data'}].map((s, idx)=>(
                <div 
                  className={`text-center py-3 border-white/10 !border-l-0 md:!border-l-2 md:border-t-0 md:border-b-0 md:border-r-0 md:pl-[14px] md:py-0 md:text-left md:border-[var(--gold)] ${
                    idx % 2 === 0 ? 'border-r' : ''
                  } ${
                    idx < 2 ? 'border-b' : ''
                  } hero-stat`} 
                  role="listitem" 
                  key={s.l}
                >
                  <div className="hero-stat-num">{s.n}</div>
                  <div className="hero-stat-lbl">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form card */}
          <div className="form-card">
            <div className="form-card-title">Enter Your Details</div>
            <form onSubmit={handlePredict} noValidate aria-label="College prediction form">
              <div className="form-grid grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-[14px]">
                <div className="form-group full flex flex-col gap-1">
                  <label className="form-label block mb-1 text-sm font-medium md:text-[0.67rem] md:font-bold md:tracking-[0.08em] md:uppercase md:mb-0" htmlFor="rank-input">Your EAPCET Rank *</label>
                  <input id="rank-input" type="number" className="form-input w-full min-h-[44px] px-3 py-2.5 text-base md:min-h-0 md:px-[13px] md:py-[11px] md:text-[0.92rem]"
                    placeholder="e.g. 25000" value={rank} onChange={e=>setRank(e.target.value)}
                    min="1" max="250000" required aria-invalid={!!error}/>
                  <p className="rank-hint">Enter overall rank · 1 – 2,50,000</p>
                  {error&&<p role="alert" style={{color:'var(--reach)',fontSize:'.78rem',marginTop:3}}>{error}</p>}
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="form-label block mb-1 text-sm font-medium md:text-[0.67rem] md:font-bold md:tracking-[0.08em] md:uppercase md:mb-0" htmlFor="cat">Category</label>
                  {/* Mobile Radio Chips — Visible on mobile (< 768px) */}
                  <div className="flex flex-wrap gap-2 md:hidden" role="radiogroup" aria-label="Category selection">
                    {CATEGORIES.map(c => {
                      const isSel = category === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCategory(c)}
                          className={`text-sm px-3 py-1.5 rounded-full whitespace-nowrap border transition-all cursor-pointer text-center flex-1 min-w-[70px] ${
                            isSel
                              ? 'bg-[var(--navy)] text-white border-[var(--navy)] font-semibold'
                              : 'bg-[var(--cream)] text-[var(--subtle)] border-[var(--line-dk)] hover:border-[var(--muted)]'
                          }`}
                          aria-checked={isSel}
                          role="radio"
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                  {/* Desktop Dropdown select — Visible on desktop (md:) */}
                  <div className="hidden md:block select-wrap">
                    <select id="cat" className="form-select w-full px-3 py-2.5 text-base min-h-[44px] md:min-h-0 md:px-[13px] md:py-[11px] md:text-[0.92rem]" value={category} onChange={e=>setCategory(e.target.value)}>
                      {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="form-label block mb-1 text-sm font-medium md:text-[0.67rem] md:font-bold md:tracking-[0.08em] md:uppercase md:mb-0" htmlFor="gen">Gender</label>
                  <div className="select-wrap">
                    <select id="gen" className="form-select w-full px-3 py-2.5 text-base min-h-[44px] md:min-h-0 md:px-[13px] md:py-[11px] md:text-[0.92rem]" value={gender} onChange={e=>setGender(e.target.value)}>
                      {GENDERS.map(g=><option key={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="form-label block mb-1 text-sm font-medium md:text-[0.67rem] md:font-bold md:tracking-[0.08em] md:uppercase md:mb-0" htmlFor="br">Branch</label>
                  <div className="select-wrap">
                    <select id="br" className="form-select w-full px-3 py-2.5 text-base min-h-[44px] md:min-h-0 md:px-[13px] md:py-[11px] md:text-[0.92rem]" value={branch} onChange={e=>setBranch(e.target.value)}>
                      {branches.map(b=><option key={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="form-label block mb-1 text-sm font-medium md:text-[0.67rem] md:font-bold md:tracking-[0.08em] md:uppercase md:mb-0" htmlFor="loc">Location</label>
                  <div className="select-wrap">
                    <select id="loc" className="form-select w-full px-3 py-2.5 text-base min-h-[44px] md:min-h-0 md:px-[13px] md:py-[11px] md:text-[0.92rem]" value={location} onChange={e=>setLocation(e.target.value)}>
                      {locations.map(l=><option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-predict w-full min-h-[52px] text-lg md:min-h-0 md:text-[0.9rem]" id="predict-btn" disabled={loading} aria-busy={loading}>
                {loading
                  ?<><span className="spinner"/>Analysing…</>
                  :<><span className="gold-dot"/>Predict My Colleges</>}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Results ── */}
      {searched&&(
        <section className="results-section" aria-live="polite">
          {loading?(
            <div className="empty-state">
              <div className="spinner dark" style={{width:44,height:44,margin:'0 auto 16px'}}/>
              <p>Scanning 6,243 cutoff records…</p>
            </div>
          ):results.length===0?(
            <div className="empty-state">
              <div className="empty-icon">😔</div>
              <h3>No colleges found</h3>
              <p>Try adjusting the branch or location filter.</p>
            </div>
          ):(
            <>
              <div className="rank-header">
                <div className="rank-display">
                  <span className="rank-label">Rank Analysis</span>
                  <span className="rank-number">{rankNum.toLocaleString('en-IN')}</span>
                  <span className="rank-meta">{category} · {gender}</span>
                </div>
                <span className="rank-count">Showing {filteredResults.length} of {results.length} colleges</span>
              </div>

              {/* ── Rank Percentile Viral Card ── */}
              {results.length > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, var(--gold-lt) 0%, #fff 100%)',
                  border: '1px solid var(--gold)',
                  borderRadius: 'var(--r2)',
                  padding: '20px',
                  marginBottom: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  alignItems: 'flex-start',
                  boxShadow: 'var(--sh1)'
                }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--navy)', lineHeight: 1.4 }}>
                    Your rank <strong>{rankNum.toLocaleString('en-IN')}</strong> puts you in the <strong>TOP {Math.max(0, Math.min(99.9, (((branch.toLowerCase().includes('agri') || branch.toLowerCase().includes('pharm') || branch.toLowerCase().includes('b.sc') ? 75000 : 210000) - rankNum) / (branch.toLowerCase().includes('agri') || branch.toLowerCase().includes('pharm') || branch.toLowerCase().includes('b.sc') ? 75000 : 210000)) * 100)).toFixed(1)}%</strong> of all EAPCET 2025 candidates!
                  </div>
                  <ShareButton 
                    text={generatePredictionShareText(
                      results[0], 
                      rankNum, 
                      typeof window !== 'undefined' ? window.location.origin : 'https://eapcetpredictor.com'
                    )} 
                  />
                </div>
              )}

              {results.length>0 && (
                <div className="action-hint pulse-anim">
                  💡 <strong>Click any college card</strong> to view detailed cutoff trends and transport routes!
                  {compareList.length === 0 && ' (Or use ⊕ Compare for side-by-side analysis)'}
                </div>
              )}

              <div className="results-layout">
                <div className="filter-sidebar-wrapper">
                  <FilterBar results={results} onFilter={setFilteredResults} />
                </div>

                <div className="results-main">
                  {filteredResults.length===0?(
                    <div className="empty-state" style={{ marginTop: 0 }}>
                      <div className="empty-icon">🔍</div>
                      <h3>No colleges match your filters</h3>
                      <p>Try adjusting your filter criteria or clearing all filters.</p>
                    </div>
                  ):(
                    <div className="cards-grid">
                      {filteredResults.map((r,i)=>(
                        <CollegeCard key={`${r.college_name}-${i}`}
                          result={r} isSelected={compareList.includes(r.college_name)}
                          onToggle={toggleCompare}/>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {/* ── Features ── */}
      {!searched&&(
        <section className="features">
          <div className="features-inner">
            <div className="features-eyebrow">Why RankSure</div>
            <h2>Built for AP students,<br/>by data — not guesswork</h2>
            <div className="features-grid grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {[
                {icon:'📊',title:'Real 3-Year Data',desc:'2023, 2024 & 2025 AP EAPCET official allotment cutoffs. No estimates.'},
                {icon:'🎯',title:'Safe / Medium / Reach',desc:'Personalised probability bands for every college based on your exact rank.'},
                {icon:'⚡',title:'Under 2 Seconds',desc:'328+ colleges ranked and filtered in milliseconds. No login, no ads.'},
                {icon:'⚖️',title:'Side-by-Side Compare',desc:'Select up to 3 colleges and compare fees, ranks, and placements together.'},
                {icon:'🏦',title:'Fee Reimbursement',desc:'Check eligibility for AP government fee reimbursement schemes instantly.'},
                {icon:'📅',title:'Counselling Tracker',desc:'AP EAPCET 2025 counselling schedule and document checklist — all in one place.'},
              ].map(f=>(
                <div className="feature-card" key={f.title}>
                  <div className="feature-icon">{f.icon}</div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Counselling Widget Embed ── */}
      {!searched && (
        <section style={{ maxWidth: 800, margin: '0 auto 60px', padding: '0 16px' }}>
          <CounsellingWidget compact={true} />
        </section>
      )}

      {/* ── How It Works (SEO content for indexing) ── */}
      {!searched&&(
        <section className="how-it-works">
          <div className="how-inner">
            <div className="how-eyebrow">How It Works</div>
            <h2>Get Your College Prediction in 4 Simple Steps</h2>
            <div className="how-steps flex flex-col relative space-y-8 md:grid md:grid-cols-4 md:gap-6 md:space-y-0">
              {/* Connecting vertical dashed line — mobile only */}
              <div className="absolute left-[36px] top-6 bottom-6 border-l-2 border-dashed border-[var(--gold)] md:hidden pointer-events-none" />
              
              {[
                { step: 1, title: 'Enter Your EAPCET Rank', desc: 'Type your AP EAPCET 2025 rank along with your category (OC, BC, SC, ST) and preferred branch.' },
                { step: 2, title: 'AI Analyses 6,243 Records', desc: 'Our prediction engine uses a trend-adjusted statistical model on 3 years of official cutoff data from 328+ colleges.' },
                { step: 3, title: 'See Safe / Medium / Reach', desc: 'Colleges are sorted by your admission probability — Safe (75%+), Medium (40–74%), and Reach (below 40%).' },
                { step: 4, title: 'Compare & Decide', desc: <>Compare up to 3 colleges side-by-side on fees, placements, and cutoff trends. Check <a href="/tools/reimbursement" style={{color:'var(--gold)'}}>fee reimbursement</a> eligibility too.</> }
              ].map((s, idx) => (
                <div key={idx} className="how-step before:hidden flex flex-row items-start gap-4 p-5 md:flex-col md:gap-0 md:p-6 md:pt-7 relative">
                  {/* Number Circle on the Left (Mobile) and Top (Desktop reset via absolute or block) */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--navy)] text-[var(--gold)] font-serif font-extrabold text-sm flex items-center justify-center relative z-10 md:absolute md:-top-3.5 md:left-5 md:w-7 md:h-7 md:text-[0.85rem]">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-[0.95rem] text-[var(--navy)] mb-2 md:mt-2">
                      {s.title}
                    </h3>
                    <p className="text-xs text-[var(--subtle)] leading-relaxed md:text-[0.82rem]">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ Section with Schema (SEO) ── */}
      {!searched&&(
        <section className="faq-section">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              { '@type': 'Question', name: 'What is the AP EAPCET College Predictor?', acceptedAnswer: { '@type': 'Answer', text: 'RankSure is a free tool that predicts which AP engineering colleges you can get admission to based on your EAPCET 2025 rank. It uses 3 years of official cutoff data (2023–2025) from 328+ colleges and calculates your probability using a trend-adjusted statistical model.' }},
              { '@type': 'Question', name: 'How accurate is the EAPCET rank predictor?', acceptedAnswer: { '@type': 'Answer', text: 'RankSure uses actual closing rank data from AP EAPCET official allotments across 2023, 2024, and 2025. The prediction model accounts for year-over-year cutoff trends and volatility. While no predictor can guarantee admission, our Safe/Medium/Reach bands provide reliable guidance based on historical patterns.' }},
              { '@type': 'Question', name: 'Is RankSure free to use?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, RankSure is completely free. No login required, no hidden fees. Enter your rank and get instant predictions for 328+ colleges.' }},
              { '@type': 'Question', name: 'What data does RankSure use?', acceptedAnswer: { '@type': 'Answer', text: 'RankSure uses official AP EAPCET allotment data from 2023, 2024, and 2025 — a total of 6,243 cutoff records across 328+ colleges and 117 branches. The data includes opening ranks, closing ranks, annual fees, and placement ratings.' }},
              { '@type': 'Question', name: 'Can I check fee reimbursement eligibility?', acceptedAnswer: { '@type': 'Answer', text: 'Yes! RankSure includes a fee reimbursement eligibility checker that covers 10 government and private schemes including AP Vidya Deevena, TS ePASS, PM YASASVI, and more. Visit the Fee Aid section to check your eligibility based on category and family income.' }},
              { '@type': 'Question', name: 'When is AP EAPCET 2025 counselling?', acceptedAnswer: { '@type': 'Answer', text: 'RankSure provides a live counselling tracker with countdown timers to all upcoming AP EAPCET 2025 counselling events including web options, certificate verification, and seat allotment dates. Visit the Counselling section for the latest schedule and required document checklist.' }},
            ]
          })}} />
          <div className="faq-inner">
            <div className="faq-eyebrow">Frequently Asked Questions</div>
            <h2>Everything You Need to Know About EAPCET Predictions</h2>
            <div className="faq-list">
              <details className="faq-item">
                <summary>What is the AP EAPCET College Predictor?</summary>
                <div className="faq-answer">
                  RankSure is a free tool that predicts which AP engineering colleges you can get admission to based on your <strong>EAPCET 2025 rank</strong>. It uses 3 years of official cutoff data (2023–2025) from 328+ colleges and calculates your probability using a trend-adjusted statistical model.
                </div>
              </details>
              <details className="faq-item">
                <summary>How accurate is the EAPCET rank predictor?</summary>
                <div className="faq-answer">
                  RankSure uses actual closing rank data from AP EAPCET official allotments across 2023, 2024, and 2025. The prediction model accounts for year-over-year cutoff trends and volatility. While no predictor can guarantee admission, our <strong>Safe / Medium / Reach</strong> bands provide reliable guidance based on historical patterns.
                </div>
              </details>
              <details className="faq-item">
                <summary>Is RankSure free to use?</summary>
                <div className="faq-answer">
                  Yes, RankSure is completely free. No login required, no hidden fees. Enter your rank and get instant predictions for 328+ colleges.
                </div>
              </details>
              <details className="faq-item">
                <summary>What data does RankSure use?</summary>
                <div className="faq-answer">
                  RankSure uses official AP EAPCET allotment data from 2023, 2024, and 2025 — a total of <strong>6,243 cutoff records</strong> across 328+ colleges and 117 branches. The data includes opening ranks, closing ranks, annual fees, and placement ratings.
                </div>
              </details>
              <details className="faq-item">
                <summary>Can I check fee reimbursement eligibility?</summary>
                <div className="faq-answer">
                  Yes! RankSure includes a <a href="/tools/reimbursement">fee reimbursement eligibility checker</a> that covers 10 government and private schemes including AP Vidya Deevena, TS ePASS, PM YASASVI, and more. Check your eligibility based on category and family income.
                </div>
              </details>
              <details className="faq-item">
                <summary>When is AP EAPCET 2025 counselling?</summary>
                <div className="faq-answer">
                  RankSure provides a live <a href="/tools/counselling">counselling tracker</a> with countdown timers to all upcoming AP EAPCET 2025 counselling events including web options, certificate verification, and seat allotment dates. Visit the Counselling section for the latest schedule and required document checklist.
                </div>
              </details>
            </div>
          </div>
        </section>
      )}

      {/* ── Enhanced Footer with Internal Links (SEO) ── */}
      <footer className="footer-enhanced">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="nav-logo">🎯 Rank<span>Sure</span></a>
            <p>Free AP EAPCET college predictor built on 3 years of official cutoff data. Helping students find the right engineering college since 2025.</p>
            <p style={{fontSize:'.7rem',color:'rgba(255,255,255,.25)',marginTop:4}}>
              Data sourced from AP EAPCET official allotments (2023–2025).
            </p>
          </div>
          <div className="footer-col">
            <h4>Tools</h4>
            <ul>
              <li><a href="/">EAPCET Predictor</a></li>
              <li><a href="/compare">Compare Colleges</a></li>
              <li><a href="/tools/counselling">Counselling Dates</a></li>
              <li><a href="/tools/scholarships">Scholarships</a></li>
              <li><a href="/tools/reimbursement">Fee Reimbursement</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Popular Branches</h4>
            <ul>
              <li><a href="/?branch=CSE">CSE Colleges</a></li>
              <li><a href="/?branch=ECE">ECE Colleges</a></li>
              <li><a href="/?branch=EEE">EEE Colleges</a></li>
              <li><a href="/?branch=Mechanical">Mechanical Colleges</a></li>
              <li><a href="/?branch=IT">IT Colleges</a></li>
              <li><a href="/?branch=Civil">Civil Colleges</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="/tools/counselling">Document Checklist</a></li>
              <li><a href="/tools/scholarships">Vidya Deevena Scheme</a></li>
              <li><a href="/tools/scholarships">TS ePASS Guide</a></li>
              <li><a href="/tools/reimbursement">Eligibility Checker</a></li>
              <li><a href="/sitemap.xml">Sitemap</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 RankSure · Data from AP EAPCET official allotments · Predictions are based on historical data.</p>
          <p>Built with 💛 for AP engineering students</p>
        </div>
      </footer>

      {/* ── Floating Compare Bar ── */}
      {compareList.length>=2&&(
        <div className="compare-bar" role="status" aria-live="polite">
          <span className="compare-bar-text">
            <strong>{compareList.length} colleges</strong> selected
          </span>
          <button className="compare-bar-btn"
            onClick={()=>window.open(`/compare?colleges=${compareList.map(encodeURIComponent).join(',')}`)}>
            Compare Now →
          </button>
          <button className="compare-bar-clear" onClick={()=>setCompareList([])}>✕</button>
        </div>
      )}
    </>
  );
}
