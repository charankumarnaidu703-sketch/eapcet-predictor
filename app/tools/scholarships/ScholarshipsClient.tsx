'use client';

import { useState, useMemo } from 'react';
import { ScholarshipScheme, SCHOLARSHIP_SCHEMES } from '@/lib/scholarshipRules';

export default function ScholarshipsClient({ schemes }: { schemes?: ScholarshipScheme[] }) {
  const data = schemes || SCHOLARSHIP_SCHEMES;
  const [stateFilter, setStateFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showAllCategories, setShowAllCategories] = useState<boolean>(false);

  // Derive unique filter options from the data
  const stateOptions = useMemo(() => {
    const states = new Set(data.map(s => s.state));
    return ['All', ...Array.from(states)];
  }, [data]);

  const categoryOptions = useMemo(() => {
    const cats = new Set<string>();
    data.forEach(s => s.eligibleCategories.forEach(c => cats.add(c)));
    return ['All', ...Array.from(cats)];
  }, [data]);

  // Filter schemes based on selection
  const filteredSchemes = useMemo(() => {
    return data.filter(scheme => {
      const stateMatch = stateFilter === 'All' || scheme.state === stateFilter || scheme.state === 'Both';
      const catMatch = categoryFilter === 'All' || scheme.eligibleCategories.includes(categoryFilter) || scheme.eligibleCategories.includes('All Categories');
      return stateMatch && catMatch;
    });
  }, [stateFilter, categoryFilter]);

  // Utility to determine badge colors based on state
  const getStateBadgeColor = (state: string) => {
    if (state === 'AP') return { background: '#dbeafe', color: '#1e40af' }; // Blue
    if (state === 'Telangana') return { background: '#fce7f3', color: '#9d174d' }; // Pink
    return { background: '#fef3c7', color: '#92400e' }; // Both/Central (Yellow)
  };

  return (
    <>
      <div className="hero !px-4 !py-6 md:!px-6 md:!py-[60px]">
        <div className="hero-inner" style={{ textAlign: 'center' }}>
          <div className="hero-eyebrow">Financial Aid Guide</div>
          <h1 className="!text-2xl md:!text-4xl">Scholarships & Fee Reimbursement</h1>
          <p className="!text-sm md:!text-[1.1rem]">
            Explore 10+ government and private scholarship schemes available for AP & Telangana engineering students. Check your eligibility instantly.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* SECTION B — Quick Filter Bar */}
        <div className="filter-section">
          <div className="filter-label">Filter by Provider/Region</div>
          <div className="filter-group flex flex-nowrap overflow-x-auto scrollbar-hide pb-1 gap-2 md:flex-wrap md:overflow-visible md:pb-0 md:gap-[10px]">
            {stateOptions.map(opt => (
              <button 
                key={opt}
                className={`filter-pill whitespace-nowrap flex-shrink-0 text-sm px-4 py-2 rounded-full md:rounded-[var(--r)] md:text-[0.85rem] md:px-4 md:py-2 transition-all ${
                  stateFilter === opt 
                    ? 'bg-blue-600 text-white md:bg-[var(--navy)] md:text-white' 
                    : 'bg-gray-100 text-gray-700 md:bg-[var(--cream)] md:text-[var(--muted)] md:border md:border-[var(--line)]'
                }`}
                onClick={() => setStateFilter(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
          
          <div className="filter-label" style={{ marginTop: 24 }}>Filter by Category</div>
          <div className="filter-group flex flex-wrap gap-1.5 md:gap-[10px]">
            {categoryOptions.slice(0, 4).map(opt => (
              <button 
                key={opt}
                className={`text-xs px-2.5 py-1 rounded-md whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === opt 
                    ? 'bg-blue-600 text-white md:bg-[var(--navy)] md:text-white' 
                    : 'bg-gray-100 text-gray-700 md:bg-[var(--cream)] md:text-[var(--muted)] md:border md:border-[var(--line)]'
                } md:text-[0.85rem] md:px-4 md:py-2 md:rounded-[var(--r)]`}
                onClick={() => setCategoryFilter(opt)}
              >
                {opt}
              </button>
            ))}
            {categoryOptions.slice(4).map(opt => (
              <button 
                key={opt}
                className={`${showAllCategories ? 'block' : 'hidden'} md:block text-xs px-2.5 py-1 rounded-md whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === opt 
                    ? 'bg-blue-600 text-white md:bg-[var(--navy)] md:text-white' 
                    : 'bg-gray-100 text-gray-700 md:bg-[var(--cream)] md:text-[var(--muted)] md:border md:border-[var(--line)]'
                } md:text-[0.85rem] md:px-4 md:py-2 md:rounded-[var(--r)]`}
                onClick={() => setCategoryFilter(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="md:hidden mt-2">
            <button
              type="button"
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-transparent border-none cursor-pointer"
            >
              {showAllCategories ? 'Show less ↑' : 'Show more ↓'}
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-500 mt-2 md:text-base md:text-[var(--slate)] md:font-medium md:mt-0" style={{ marginBottom: 24 }}>
          Showing {filteredSchemes.length} scholarship schemes
        </div>

        {/* SECTION C — Scheme Cards Grid */}
        <div className="cards-grid">
          {filteredSchemes.map(scheme => {
            const badgeStyle = getStateBadgeColor(scheme.state);
            
            return (
              <article key={scheme.id} className="scheme-card !p-4 md:!p-[24px]">
                <div className="card-top">
                  <h3 className="card-name">{scheme.name}</h3>
                  <span className="badge" style={badgeStyle}>{scheme.state}</span>
                </div>
                
                {/* Mobile version — show first 4 + "+X more" if > 5 */}
                <div className="scheme-cats flex flex-wrap gap-1 mb-4 md:hidden">
                  {scheme.eligibleCategories.length <= 5 ? (
                    scheme.eligibleCategories.map(cat => (
                      <span key={cat} className="cat-chip !text-xs !px-2 !py-0.5 max-w-fit">{cat}</span>
                    ))
                  ) : (
                    <>
                      {scheme.eligibleCategories.slice(0, 4).map(cat => (
                        <span key={cat} className="cat-chip !text-xs !px-2 !py-0.5 max-w-fit">{cat}</span>
                      ))}
                      <span className="cat-chip !text-xs !px-2 !py-0.5 max-w-fit">+{scheme.eligibleCategories.length - 4} more</span>
                    </>
                  )}
                </div>

                {/* Desktop version — show first 8 + "+X more" if > 8 */}
                <div className="scheme-cats hidden md:flex flex-wrap gap-1.5 mb-4">
                  {scheme.eligibleCategories.slice(0, 8).map(cat => (
                    <span key={cat} className="cat-chip">{cat}</span>
                  ))}
                  {scheme.eligibleCategories.length > 8 && <span className="cat-chip">+{scheme.eligibleCategories.length - 8} more</span>}
                </div>

                <div className="scheme-amount !text-xl !font-bold md:!text-[0.9rem] md:!font-bold">
                  {scheme.amount}
                </div>

                <p className="scheme-desc">
                  {scheme.shortDescription || scheme.description}
                </p>

                <div className="scheme-income">
                  💰 Family income below Rs. {(scheme.maxAnnualIncome / 100000).toFixed(1)} Lakhs
                </div>

                <div className="card-actions flex flex-col gap-2 mt-3 sm:flex-row sm:gap-3 sm:mt-auto">
                  <a href="/tools/reimbursement" className="btn-primary w-full text-center py-2.5 text-sm sm:w-auto sm:text-center sm:py-[10px] sm:text-[0.85rem]">
                    Check Eligibility
                  </a>
                  <a 
                    href={`/tools/scholarships/${scheme.id}`}
                    className="btn-outline w-full text-center py-2.5 text-sm sm:w-auto sm:text-center sm:py-[10px] sm:text-[0.85rem]"
                    style={{ textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    View Details
                  </a>
                </div>
              </article>
            );
          })}
          {filteredSchemes.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">😔</div>
              <h3>No schemes found</h3>
              <p>Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .hero {
          background: var(--navy);
          padding: 60px 24px;
          color: #fff;
        }
        .hero-inner {
          max-width: 800px;
          margin: 0 auto;
        }
        .hero-eyebrow {
          color: var(--gold-lt);
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          font-size: .75rem;
          margin-bottom: 16px;
        }
        .hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          margin-bottom: 20px;
          line-height: 1.1;
        }
        .hero p {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.8);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.5;
        }
        
        .filter-section {
          background: #fff;
          border-radius: var(--r2);
          border: 1px solid var(--border);
          padding: 24px;
          margin-bottom: 32px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }
        .filter-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--subtle);
          margin-bottom: 12px;
        }
        .filter-group {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .filter-pill {
          padding: 8px 16px;
          background: var(--cream);
          border: 1px solid var(--line);
          border-radius: var(--r);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-pill:hover {
          border-color: var(--gold);
          color: var(--gold);
        }
        .filter-pill.active {
          background: var(--navy);
          border-color: var(--navy);
          color: #fff;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .scheme-card {
          background: #fff;
          border-radius: var(--r2);
          border: 1px solid var(--border);
          padding: 24px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .scheme-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        }
        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }
        .card-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          color: var(--navy);
          line-height: 1.3;
          margin: 0;
        }
        .badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--r);
          white-space: nowrap;
          text-transform: uppercase;
        }

        .scheme-cats {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }
        .cat-chip {
          background: var(--cream-dk);
          color: var(--slate);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .scheme-amount {
          background: var(--gold-pale);
          color: var(--gold);
          padding: 8px 12px;
          border-radius: var(--r);
          font-weight: 700;
          font-size: 0.9rem;
          margin-bottom: 16px;
          border-left: 3px solid var(--gold);
        }

        .scheme-desc {
          font-size: 0.9rem;
          color: var(--text);
          line-height: 1.5;
          margin-bottom: 16px;
          flex-grow: 1;
        }

        .scheme-income {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--muted);
          background: var(--cream);
          padding: 8px 12px;
          border-radius: var(--r);
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .card-actions {
          display: flex;
          gap: 12px;
          margin-top: auto;
        }

        .btn-primary, .btn-outline {
          flex: 1;
          padding: 10px;
          border-radius: var(--r);
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        .btn-primary {
          background: var(--navy);
          color: #fff;
          border: none;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-primary:hover {
          background: var(--navy-light, #1a2b4c);
        }
        .btn-outline {
          background: transparent;
          color: var(--navy);
          border: 1px solid var(--navy);
        }
        .btn-outline:hover {
          background: var(--cream);
        }
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          background: #fff;
          border-radius: var(--r2);
          border: 1px dashed var(--line);
        }
        .empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }
      `}</style>
    </>
  );
}
