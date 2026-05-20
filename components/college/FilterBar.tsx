'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PredictResult } from '@/app/api/predict/route';

interface FilterBarProps {
  results: PredictResult[];
  onFilter: (filtered: PredictResult[]) => void;
}

function parseFee(feeStr: string | null | undefined): number {
  if (!feeStr) return Infinity;
  const clean = feeStr.replace(/,/g, '').replace(/rs\.?/i, '').trim();
  if (clean.toLowerCase().includes('l')) {
    const num = parseFloat(clean.replace(/l/i, ''));
    if (!isNaN(num)) return num * 100000;
  }
  const num = parseFloat(clean);
  if (!isNaN(num)) return num;
  return Infinity;
}

export default function FilterBar({ results, onFilter }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [sortBy, setSortBy] = useState<string>('match');
  
  // Derived unique values
  const uniqueProbs = useMemo(() => Array.from(new Set(results.map(r => r.probability))).filter(Boolean), [results]);
  const uniqueBranches = useMemo(() => Array.from(new Set(results.map(r => r.branch))).filter(Boolean).sort(), [results]);
  const uniqueLocations = useMemo(() => Array.from(new Set(results.map(r => r.location))).filter(Boolean).sort(), [results]);
  
  const absoluteMaxFee = useMemo(() => {
    let max = 0;
    results.forEach(r => {
      const fee = parseFee(r.annual_fees);
      if (fee !== Infinity && fee > max) max = fee;
    });
    return max > 0 ? Math.ceil(max / 10000) * 10000 : 200000; // default 2L if none
  }, [results]);

  // Filter states
  const [probLevels, setProbLevels] = useState<Set<string>>(new Set(uniqueProbs));
  const [branches, setBranches] = useState<Set<string>>(new Set(uniqueBranches));
  const [locations, setLocations] = useState<Set<string>>(new Set(uniqueLocations));
  const [maxFee, setMaxFee] = useState<number>(absoluteMaxFee);
  
  const [showAllLocations, setShowAllLocations] = useState(false);

  // When results change, reset default filters if needed, but here we just update options
  useEffect(() => {
    setProbLevels(new Set(uniqueProbs));
    setBranches(new Set(uniqueBranches));
    setLocations(new Set(uniqueLocations));
    setMaxFee(absoluteMaxFee);
    setSortBy('match');
  }, [uniqueProbs, uniqueBranches, uniqueLocations, absoluteMaxFee]);

  // Apply filters and sort
  useEffect(() => {
    let filtered = results.filter(r => {
      if (!probLevels.has(r.probability)) return false;
      if (!branches.has(r.branch)) return false;
      if (!locations.has(r.location)) return false;
      const fee = parseFee(r.annual_fees);
      if (fee !== Infinity && fee > maxFee) return false;
      return true;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'match') {
        return (b.probability_pct || 0) - (a.probability_pct || 0);
      } else if (sortBy === 'feeAsc') {
        return parseFee(a.annual_fees) - parseFee(b.annual_fees);
      } else if (sortBy === 'feeDesc') {
        return parseFee(b.annual_fees) - parseFee(a.annual_fees);
      } else if (sortBy === 'placement') {
        return (b.placement_rating || 0) - (a.placement_rating || 0);
      } else if (sortBy === 'name') {
        return a.college_name.localeCompare(b.college_name);
      }
      return 0;
    });

    onFilter(filtered);
  }, [results, probLevels, branches, locations, maxFee, sortBy, onFilter]);

  const activeFilterCount = 
    (probLevels.size < uniqueProbs.length ? 1 : 0) + 
    (branches.size < uniqueBranches.length ? 1 : 0) + 
    (locations.size < uniqueLocations.length ? 1 : 0) + 
    (maxFee < absoluteMaxFee ? 1 : 0);

  const clearAll = () => {
    setProbLevels(new Set(uniqueProbs));
    setBranches(new Set(uniqueBranches));
    setLocations(new Set(uniqueLocations));
    setMaxFee(absoluteMaxFee);
    setSortBy('match');
  };

  const toggleProb = (p: string) => {
    const next = new Set(probLevels);
    if (next.has(p)) next.delete(p);
    else next.add(p);
    setProbLevels(next);
  };

  const toggleBranch = (b: string) => {
    const next = new Set(branches);
    if (next.has(b)) next.delete(b);
    else next.add(b);
    setBranches(next);
  };

  const toggleAllBranches = () => {
    if (branches.size === uniqueBranches.length) {
      setBranches(new Set());
    } else {
      setBranches(new Set(uniqueBranches));
    }
  };

  const toggleLocation = (l: string) => {
    const next = new Set(locations);
    if (next.has(l)) next.delete(l);
    else next.add(l);
    setLocations(next);
  };

  return (
    <>
      <div className="mobile-filter-toggle">
        <button onClick={() => setIsOpen(!isOpen)}>
          <span style={{ marginRight: 8 }}>{isOpen ? '✕' : '⚙️'}</span>
          Filter & Sort {activeFilterCount > 0 ? `(${activeFilterCount} active)` : ''}
        </button>
      </div>

      <div className={`filter-sidebar ${isOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)', fontFamily: 'Playfair Display,serif' }}>Filter & Sort</h3>
          {activeFilterCount > 0 && (
            <button onClick={clearAll} style={{ fontSize: '.75rem', color: 'var(--gold)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              Clear All
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="filter-section">
          <h4>Sort By</h4>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="form-select" style={{ fontSize: '.85rem', padding: '8px 12px' }}>
            <option value="match">Best Match</option>
            <option value="feeAsc">Fee: Low to High</option>
            <option value="feeDesc">Fee: High to Low</option>
            <option value="placement">Placement Rating</option>
            <option value="name">College Name (A-Z)</option>
          </select>
        </div>

        {/* Probability Levels */}
        <div className="filter-section">
          <h4>Probability Level</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {uniqueProbs.map(p => {
              const active = probLevels.has(p);
              const count = results.filter(r => r.probability === p).length;
              return (
                <button
                  key={p}
                  onClick={() => toggleProb(p)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '.75rem',
                    fontWeight: 600,
                    border: `1px solid ${active ? 'var(--gold)' : 'var(--line)'}`,
                    background: active ? 'var(--gold-pale)' : '#fff',
                    color: active ? 'var(--gold)' : 'var(--muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {p} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Branch */}
        <div className="filter-section">
          <h4>Branch</h4>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.85rem', marginBottom: 8, color: 'var(--navy)', fontWeight: 600, cursor: 'pointer' }}>
            <input type="checkbox" checked={branches.size === uniqueBranches.length} onChange={toggleAllBranches} />
            All Branches
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
            {uniqueBranches.map(b => (
              <label key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.8rem', color: 'var(--text)', cursor: 'pointer' }}>
                <input type="checkbox" checked={branches.has(b)} onChange={() => toggleBranch(b)} />
                {b}
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="filter-section">
          <h4>Location</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {uniqueLocations.slice(0, showAllLocations ? undefined : 6).map(l => (
              <label key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.8rem', color: 'var(--text)', cursor: 'pointer' }}>
                <input type="checkbox" checked={locations.has(l)} onChange={() => toggleLocation(l)} />
                {l}
              </label>
            ))}
          </div>
          {uniqueLocations.length > 6 && (
            <button onClick={() => setShowAllLocations(!showAllLocations)} style={{ marginTop: 8, fontSize: '.75rem', color: 'var(--gold)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
              {showAllLocations ? '- Show less' : `+ ${uniqueLocations.length - 6} more`}
            </button>
          )}
        </div>

        {/* Max Fee */}
        <div className="filter-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h4>Max Annual Fee</h4>
            <span style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--gold)' }}>
              {maxFee >= absoluteMaxFee ? 'No limit' : `Up to Rs. ${(maxFee / 100000).toFixed(1)} L`}
            </span>
          </div>
          <input 
            type="range" 
            min={0} 
            max={absoluteMaxFee} 
            step={10000} 
            value={maxFee} 
            onChange={(e) => setMaxFee(Number(e.target.value))} 
            style={{ width: '100%', accentColor: 'var(--gold)' }} 
          />
        </div>
      </div>
      
      <style jsx>{`
        .filter-section {
          margin-bottom: 24px;
        }
        .filter-section h4 {
          font-size: .8rem;
          font-weight: 700;
          color: var(--subtle);
          text-transform: uppercase;
          letter-spacing: .05em;
          margin-bottom: 12px;
        }
        .mobile-filter-toggle {
          display: none;
          margin-bottom: 16px;
        }
        .mobile-filter-toggle button {
          width: 100%;
          padding: 12px;
          background: #fff;
          border: 1px solid var(--line);
          border-radius: var(--r);
          font-family: inherit;
          font-weight: 600;
          color: var(--navy);
          font-size: .9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .filter-sidebar {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: var(--r2);
          padding: 24px;
          position: sticky;
          top: 24px;
        }
        @media (max-width: 768px) {
          .mobile-filter-toggle {
            display: block;
          }
          .filter-sidebar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            top: auto;
            z-index: 100;
            border-radius: 24px 24px 0 0;
            padding: 24px 24px 40px;
            box-shadow: 0 -4px 24px rgba(0,0,0,0.15);
            transform: translateY(100%);
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            max-height: 85vh;
            overflow-y: auto;
            border: none;
          }
          .filter-sidebar.open {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
