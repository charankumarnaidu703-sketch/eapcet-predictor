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

  // Next 5 events logic (can include recent past depending on requirements, but let's just do upcoming/recent)
  // Let's get up to 5 events starting slightly before the next event (e.g. 1 passed, 4 upcoming)
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

  const widgetBg = '#ffffff';

  return (
    <div style={{ background: widgetBg, borderRadius: 'var(--r2)', border: '1px solid var(--line)', padding: compact ? '20px' : '24px', boxShadow: 'var(--sh1)' }}>
      {/* Next Event Display */}
      {nextEvent ? (
        <div style={{ background: 'var(--navy)', color: '#fff', padding: '24px', borderRadius: 'var(--r)', marginBottom: compact ? 0 : 24, textAlign: 'center' }}>
          <p style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginBottom: 8 }}>Next Upcoming Event</p>
          <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: compact ? '1.3rem' : '1.6rem', fontWeight: 800, marginBottom: 12, color: 'var(--gold)' }}>
            {nextEvent.title}
          </h3>
          <div style={{ fontSize: compact ? '1.5rem' : '2rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '2px' }}>
            {formatCountdown(nextEvent.date)}
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
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 16 }}>Important Dates</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
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
                <div key={evt.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 12, alignItems: 'center', padding: '12px 16px', border: '1px solid var(--line)', borderRadius: 'var(--r)', background: isPast ? '#f8fafc' : '#fff', opacity: isPast ? 0.7 : 1 }}>
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
              );
            })}
          </div>

          {/* Disclaimer */}
          <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '16px', borderRadius: 'var(--r)', fontSize: '.8rem', color: '#115e59' }}>
            <p style={{ fontWeight: 700, marginBottom: 4 }}>⚠️ Disclaimer: Estimated Dates</p>
            <p>These dates are estimates based on previous years. Always verify with official portals:</p>
            <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
              <li><a href="https://sche.ap.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#0f766e', textDecoration: 'underline' }}>AP SCHE Official Website</a></li>
              <li><a href="https://tsche.ac.in" target="_blank" rel="noopener noreferrer" style={{ color: '#0f766e', textDecoration: 'underline' }}>TSCHE Official Website</a></li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
