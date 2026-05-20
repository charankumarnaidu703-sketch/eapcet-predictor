'use client';

import { useState, useEffect } from 'react';
import { counsellingDates, CounsellingEvent } from '@/lib/counsellingDates';
import Link from 'next/link';

interface CounsellingWidgetProps {
  compact?: boolean;
}

export default function CounsellingWidget({ compact = false }: CounsellingWidgetProps) {
  const [now, setNow] = useState<number>(Date.now());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sort dates properly
  const sortedDates = [...counsellingDates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Find the next upcoming event
  const nextEventIndex = sortedDates.findIndex(e => new Date(e.date).getTime() > now);
  const nextEvent = nextEventIndex !== -1 ? sortedDates[nextEventIndex] : null;

  // Next 5 events logic
  const startIndex = Math.max(0, nextEventIndex === -1 ? sortedDates.length - 5 : nextEventIndex - 1);
  const displayEvents = sortedDates.slice(startIndex, startIndex + 5);

  const formatCountdown = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime();
    const diff = target - now;
    
    if (diff <= 0) return '00d 00h 00m 00s';

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    return `${d.toString().padStart(2, '0')}d ${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  const getCountdownValues = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime();
    const diff = target - now;
    
    if (diff <= 0) {
      return { days: '00', hours: '00', minutes: '00', seconds: '00' };
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      days: d.toString().padStart(2, '0'),
      hours: h.toString().padStart(2, '0'),
      minutes: m.toString().padStart(2, '0'),
      seconds: s.toString().padStart(2, '0')
    };
  };

  const widgetBg = '#ffffff';

  return (
    <div 
      className={compact ? "py-4 px-0 md:p-5 bg-white border border-gray-200 shadow-sm" : "py-4 px-0 md:p-6 bg-white border border-gray-200 shadow-sm"}
      style={{ borderRadius: 'var(--r2)', boxShadow: 'var(--sh1)' }}
    >
      {/* Next Event Display */}
      {nextEvent ? (
        <div 
          className="mx-4 md:mx-0 p-5 md:p-6 text-center"
          style={{ background: 'var(--navy)', color: '#fff', borderRadius: 'var(--r)', marginBottom: compact ? 0 : 24 }}
        >
          <p style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginBottom: 8 }}>Next Upcoming Event</p>
          <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: compact ? '1.3rem' : '1.6rem', fontWeight: 800, marginBottom: 12, color: 'var(--gold)' }}>
            {nextEvent.title}
          </h3>
          
          {/* Desktop countdown: Untouched */}
          <div className="hidden md:block" style={{ fontSize: compact ? '1.5rem' : '2rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '2px' }}>
            {formatCountdown(nextEvent.date)}
          </div>

          {/* Mobile Countdown Grid: FIX 6 */}
          <div className="block md:hidden mt-3">
            {(() => {
              const { days, hours, minutes, seconds } = getCountdownValues(nextEvent.date);
              return (
                <div className="grid grid-cols-4 gap-2">
                  <div className="aspect-square flex flex-col items-center justify-center rounded-lg bg-blue-600 text-white p-2">
                    <span className="text-2xl font-bold leading-none">{days}</span>
                    <span className="text-[10px] uppercase tracking-wide mt-1 text-blue-200 font-sans">Days</span>
                  </div>
                  <div className="aspect-square flex flex-col items-center justify-center rounded-lg bg-blue-600 text-white p-2">
                    <span className="text-2xl font-bold leading-none">{hours}</span>
                    <span className="text-[10px] uppercase tracking-wide mt-1 text-blue-200 font-sans">Hours</span>
                  </div>
                  <div className="aspect-square flex flex-col items-center justify-center rounded-lg bg-blue-600 text-white p-2">
                    <span className="text-2xl font-bold leading-none">{minutes}</span>
                    <span className="text-[10px] uppercase tracking-wide mt-1 text-blue-200 font-sans">Mins</span>
                  </div>
                  <div className="aspect-square flex flex-col items-center justify-center rounded-lg bg-blue-600 text-white p-2">
                    <span className="text-2xl font-bold leading-none">{seconds}</span>
                    <span className="text-[10px] uppercase tracking-wide mt-1 text-blue-200 font-sans">Secs</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <p style={{ fontSize: '.85rem', marginTop: 12, color: 'rgba(255,255,255,0.8)' }}>
            {nextEvent.state} • {new Date(nextEvent.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          {compact && (
             <div style={{ marginTop: 20 }}>
               <Link href="/tools/counselling" style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 'var(--r)', fontSize: '.85rem', fontWeight: 600, textDecoration: 'none' }}>
                 See All Dates & Checklist →
               </Link>
             </div>
          )}
        </div>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', background: 'var(--cream)', borderRadius: 'var(--r)', marginBottom: compact ? 0 : 24 }}>
          <p style={{ fontWeight: 600, color: 'var(--muted)' }}>No upcoming events found.</p>
        </div>
      )}

      {/* Upcoming Events List */}
      {!compact && (
        <>
          <h4 
            className="text-base font-semibold mb-3 px-4 md:px-0 md:text-[1.1rem] md:font-extrabold"
            style={{ color: 'var(--navy)', fontFamily: 'Playfair Display,serif' }}
          >
            Important Dates
          </h4>
          <div className="flex flex-col gap-0 md:gap-3 mb-6">
            {displayEvents.map((evt, i) => {
              const evtTime = new Date(evt.date).getTime();
              const isPast = evtTime < now;
              const isSoon = evtTime >= now && (evtTime - now) < (3 * 24 * 60 * 60 * 1000); // within 3 days

              let statusBadge = null;
              if (isPast) {
                statusBadge = <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: 4, fontSize: '.65rem', fontWeight: 700 }}>PASSED</span>;
              } else if (isSoon) {
                statusBadge = <span style={{ background: '#fef08a', color: '#854d0e', padding: '2px 6px', borderRadius: 4, fontSize: '.65rem', fontWeight: 700 }}>SOON</span>;
              }

              return (
                <div key={evt.id}>
                  {/* Desktop layout: Untouched */}
                  <div className="hidden md:grid" style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 12, alignItems: 'center', padding: '12px 16px', border: '1px solid var(--line)', borderRadius: 'var(--r)', background: isPast ? '#f8fafc' : '#fff', opacity: isPast ? 0.7 : 1 }}>
                    <div style={{ fontSize: '.8rem', fontWeight: 700, color: isPast ? 'var(--faint)' : (isSoon ? '#c2410c' : 'var(--navy)') }}>
                      {new Date(evt.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={{ fontSize: '.9rem', fontWeight: 700, color: isPast ? 'var(--muted)' : 'var(--text)', textDecoration: isPast ? 'line-through' : 'none' }}>
                          {evt.title}
                        </p>
                        {statusBadge}
                      </div>
                      <p style={{ fontSize: '.75rem', color: 'var(--subtle)', marginTop: 2 }}>{evt.state}</p>
                    </div>
                  </div>

                  {/* Mobile layout: FIX 2 */}
                  <div 
                    className={`block md:hidden py-3 px-4 border-b border-gray-100 ${
                      isPast ? 'opacity-50 bg-white' : isSoon ? 'bg-orange-50 border-l-4 border-orange-400' : 'bg-white'
                    }`}
                  >
                    {/* ROW 1: date chip + state badge */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="bg-gray-100 text-gray-700 rounded-md px-2 py-1 text-xs font-mono whitespace-nowrap">
                        {new Date(evt.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                      <span className="bg-blue-50 text-blue-800 text-xs px-2 py-0.5 rounded font-medium">
                        {evt.state}
                      </span>
                    </div>
                    {/* ROW 2: event name (full width) */}
                    <div className="text-sm font-medium text-gray-800 mb-1.5">
                      {evt.title}
                    </div>
                    {/* ROW 3: status badge */}
                    <div>
                      {isPast ? (
                        <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded font-bold">
                          PASSED
                        </span>
                      ) : isSoon ? (
                        <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded font-bold">
                          SOON
                        </span>
                      ) : (
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-bold">
                          UPCOMING
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Disclaimer: FIX 4 */}
          <div>
            {/* Desktop Disclaimer */}
            <div className="hidden md:block" style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '16px', borderRadius: 'var(--r)', fontSize: '.8rem', color: '#115e59' }}>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>⚠️ Disclaimer: Estimated Dates</p>
              <p>These dates are estimates based on previous years. Always verify with official portals:</p>
              <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
                <li><a href="https://sche.ap.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#0f766e', textDecoration: 'underline' }}>AP SCHE Official Website</a></li>
                <li><a href="https://tsche.ac.in" target="_blank" rel="noopener noreferrer" style={{ color: '#0f766e', textDecoration: 'underline' }}>TSCHE Official Website</a></li>
              </ul>
            </div>

            {/* Mobile Disclaimer */}
            <div className="block md:hidden mx-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 shadow-sm">
              <div className="flex gap-3 items-start">
                <span className="text-lg leading-none mt-0.5">⚠️</span>
                <div>
                  <p className="font-bold mb-1">Disclaimer: Estimated Dates</p>
                  <p className="text-amber-800 leading-normal">These dates are estimates based on previous years. Always verify with official portals:</p>
                  <div className="mt-2 space-y-1.5">
                    <a href="https://sche.ap.gov.in" target="_blank" rel="noopener noreferrer" className="block text-amber-700 underline text-sm font-semibold">
                      AP SCHE Official Website ↗
                    </a>
                    <a href="https://tsche.ac.in" target="_blank" rel="noopener noreferrer" className="block text-amber-700 underline text-sm font-semibold">
                      TSCHE Official Website ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
