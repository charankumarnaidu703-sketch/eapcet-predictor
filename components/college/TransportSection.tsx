'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface TransportHub { name: string; distance_km: number; }

interface GeoData {
  lat: number; lng: number;
  formatted_address: string;
  nearestRailway?: TransportHub;
  nearestBusStand?: TransportHub;
}

type State =
  | { type: 'idle' }
  | { type: 'loading'; message: string }
  | { type: 'denied' }
  | { type: 'geo_failed' }
  | { type: 'error'; message: string }
  | { type: 'result'; geo: GeoData; distanceKm: number | null; originLabel: string };

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

/** Geocode the college via our server-side Nominatim proxy */
async function fetchCollegeGeo(collegeName: string, location: string): Promise<GeoData> {
  const res = await fetch(
    `/api/geocode?college=${encodeURIComponent(collegeName)}&location=${encodeURIComponent(location)}`
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

/** Geocode a user's starting city via the same server-side route */
async function fetchCityGeo(city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(`/api/geocode?city=${encodeURIComponent(city)}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function dailyCost(distKm: number) {
  return Math.round((distKm * 2 * 5) / 10) * 10;
}

function formatDrive(distKm: number) {
  // Rough estimate: 50 km/h average in Indian road conditions
  const hours = distKm / 50;
  if (hours < 1) return `~${Math.round(hours * 60)} min`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `~${h} hr ${m} min` : `~${h} hr`;
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */
function InfoRow({ icon, label, value }: { icon: string; label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
      <span style={{ fontSize: '1.1rem', marginTop: 2, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--subtle)', fontFamily: 'Plus Jakarta Sans,sans-serif', marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ color: 'var(--text)', fontFamily: 'Plus Jakarta Sans,sans-serif', fontWeight: 600, fontSize: '.9rem' }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function HubPill({ icon, label, name, distKm }: { icon: string; label: string; name: string; distKm: number }) {
  return (
    <div style={{ background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center', fontFamily: 'Plus Jakarta Sans,sans-serif', minWidth: 0 }}>
      <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{icon}</span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: '.6rem', color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: '.83rem', fontWeight: 600, color: 'var(--text)', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{name}</div>
        <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{distKm} km away</div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
interface Props { collegeName: string; location: string; }

export default function TransportSection({ collegeName, location }: Props) {
  const [state, setState] = useState<State>({ type: 'idle' });
  const [manualCity, setManualCity] = useState('');
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadingPhrases = [
    'Getting your location...', 
    'Fetching road data...', 
    'Calculating best route...', 
    'Almost there...'
  ];

  useEffect(() => {
    if (state.type === 'loading') {
      const interval = setInterval(() => {
        setLoadingPhraseIndex(prev => (prev + 1) % loadingPhrases.length);
      }, 1500);
      return () => clearInterval(interval);
    } else {
      setLoadingPhraseIndex(0);
    }
  }, [state.type]);

  /** Core flow: given user origin coords, fetch college geo + compute distance */
  const resolveRoute = useCallback(async (originLat: number, originLng: number, originLabel: string) => {
    setState({ type: 'loading', message: 'Finding route to college…' });
    try {
      const geo = await fetchCollegeGeo(collegeName, location);
      const distanceKm = haversineKm(originLat, originLng, geo.lat, geo.lng);
      setState({ type: 'result', geo, distanceKm, originLabel });
    } catch {
      setState({ type: 'geo_failed' });
    }
  }, [collegeName, location]);

  /** Browser geolocation button */
  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) { 
      setState({ type: 'error', message: 'Location access is not supported by your browser.' }); 
      return; 
    }
    setState({ type: 'loading', message: 'Getting your location…' });
    navigator.geolocation.getCurrentPosition(
      pos => resolveRoute(pos.coords.latitude, pos.coords.longitude, 'Your Location'),
      (err) => { 
        let msg = 'Location access was denied or unavailable.';
        if (err.code === 1) msg = 'Location permission was denied. Please allow it in your browser settings.';
        else if (err.code === 2) msg = 'Location is unavailable. Please check your device settings.';
        else if (err.code === 3) msg = 'Location request timed out. Please try again or type your city.';
        setState({ type: 'error', message: msg });
        setTimeout(() => inputRef.current?.focus(), 100); 
      },
      { timeout: 15000, enableHighAccuracy: false, maximumAge: 60000 }
    );
  }, [resolveRoute]);

  /** Manual city submit */
  const handleManualSubmit = useCallback(async () => {
    const city = manualCity.trim();
    if (!city) return;
    setState({ type: 'loading', message: `Looking up "${city}"…` });
    const coords = await fetchCityGeo(city);
    if (!coords) {
      setState({ type: 'error', message: `Couldn't find "${city}". Try a city name like "Hyderabad" or "Vijayawada".` });
      return;
    }
    resolveRoute(coords.lat, coords.lng, city);
  }, [manualCity, resolveRoute]);

  /* ── Derived values ── */
  const isOther = location.toLowerCase() === 'ap-other' || location.toLowerCase() === 'other';
  const mapQuery = encodeURIComponent(
    isOther 
      ? `${collegeName} Andhra Pradesh India` 
      : `${collegeName} ${location} Andhra Pradesh India`
  );
  const mapSrc = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  
  // Use exact college name for Google Maps links so it routes to the actual college
  const exactCollegeSearch = isOther 
    ? `${collegeName}, Andhra Pradesh` 
    : `${collegeName}, ${location}, Andhra Pradesh`;
  const mapsLink = `https://www.google.com/maps/search/${encodeURIComponent(exactCollegeSearch)}`;
  const showControls = state.type !== 'result';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>
        {`
          @keyframes indeterminate {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .progress-bar-fill {
            width: 100%; height: 100%; border-radius: 4px;
            animation: indeterminate 1.5s infinite linear;
          }
          @media (max-width: 768px) {
            .nearest-hubs-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>

      {/* ── Controls ── */}
      {showControls && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--r2)', boxShadow: 'var(--sh1)', padding: 24 }}>

          <p style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', color: 'var(--muted)', marginBottom: 16, fontSize: '.9rem' }}>
            📍 College is located in <strong style={{ color: 'var(--navy)' }}>{location}</strong>
          </p>

          {/* geo_failed: college couldn't be geocoded */}
          {state.type === 'geo_failed' ? (
            <div style={{ background: '#fffbf0', border: '1px solid #f0d060', borderRadius: 'var(--r)', padding: '14px 16px', marginBottom: 16 }}>
              <p style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontWeight: 700, color: '#7a6000', fontSize: '.85rem', marginBottom: 8 }}>
                ⚠ We couldn&apos;t pin this college precisely on the map.
              </p>
              <p style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', color: '#7a6000', fontSize: '.8rem', marginBottom: 12 }}>
                You can still find it on Google Maps directly.
              </p>
              <a href={mapsLink} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-block', padding: '9px 18px', background: 'var(--navy)', color: '#fff', borderRadius: 'var(--r)', fontWeight: 700, fontFamily: 'Plus Jakarta Sans,sans-serif', textDecoration: 'none', fontSize: '.85rem' }}>
                🗺 Open in Google Maps ↗
              </a>
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <button
                id="btn-geolocate"
                onClick={handleGeolocate}
                disabled={state.type === 'loading'}
                style={{
                  position: 'relative', overflow: 'hidden',
                  width: '100%', padding: '12px 20px',
                  background: 'var(--navy)', color: '#fff',
                  border: 'none', borderRadius: 'var(--r)',
                  fontWeight: 700, fontSize: '.92rem',
                  fontFamily: 'Plus Jakarta Sans,sans-serif',
                  cursor: state.type === 'loading' ? 'not-allowed' : 'pointer',
                  opacity: state.type === 'loading' ? 0.9 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'opacity .15s',
                }}>
                {state.type === 'loading' && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, height: 4, width: '100%', background: 'rgba(255,255,255,0.15)' }}>
                    <div className="progress-bar-fill" style={{ background: 'var(--gold)' }} />
                  </div>
                )}
                {state.type === 'loading'
                  ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> {loadingPhrases[loadingPhraseIndex]}</>
                  : <>📡 Show Route from My Location</>
                }
              </button>
            </div>
          )}

          {state.type === 'denied' && (
            <p style={{ color: '#b45309', fontSize: '.82rem', fontFamily: 'Plus Jakarta Sans,sans-serif', marginBottom: 12, padding: '8px 12px', background: '#fffbeb', borderRadius: 'var(--r)', border: '1px solid #fde68a' }}>
              ⚠ Location access was denied. Please enter your starting city below.
            </p>
          )}

          {state.type === 'error' && (
            <p style={{ color: '#b45309', fontSize: '.82rem', fontFamily: 'Plus Jakarta Sans,sans-serif', marginBottom: 12, padding: '8px 12px', background: '#fffbeb', borderRadius: 'var(--r)', border: '1px solid #fde68a' }}>
              ⚠ {(state as { message: string }).message}
            </p>
          )}

          <p style={{ fontSize: '.78rem', color: 'var(--subtle)', fontFamily: 'Plus Jakarta Sans,sans-serif', marginBottom: 8 }}>
            Or enter your starting city:
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              id="manual-city-input"
              type="text"
              className="form-input"
              placeholder="e.g. Vijayawada, Hyderabad, Tirupati"
              value={manualCity}
              onChange={e => setManualCity(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
              disabled={state.type === 'loading'}
              style={{ flex: 1, fontSize: '.88rem' }}
            />
            <button
              onClick={handleManualSubmit}
              disabled={!manualCity.trim() || state.type === 'loading'}
              style={{
                padding: '10px 18px', background: 'var(--gold)',
                color: '#fff', border: 'none', borderRadius: 'var(--r)',
                fontWeight: 700, cursor: state.type === 'loading' ? 'not-allowed' : 'pointer', fontSize: '.88rem',
                fontFamily: 'Plus Jakarta Sans,sans-serif',
                opacity: (!manualCity.trim() || state.type === 'loading') ? 0.5 : 1, transition: 'opacity .15s',
              }}>
              Go
            </button>
          </div>
        </div>
      )}

      {/* ── Route Results ── */}
      {state.type === 'result' && (() => {
        const { geo, distanceKm, originLabel } = state;
        const cost = distanceKm !== null ? dailyCost(distanceKm) : null;
        const driveTime = distanceKm !== null ? formatDrive(distanceKm) : null;
        
        // Pass original college info instead of Nominatim fallback to Google Maps for highly accurate routing
        const destParam = originLabel === 'Your Location' || originLabel ? exactCollegeSearch : exactCollegeSearch; // Always use exact college name for destination
        let directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destParam)}`;
        
        if (originLabel && originLabel !== 'Your Location') {
           directionsUrl += `&origin=${encodeURIComponent(originLabel)}`;
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--r2)', boxShadow: 'var(--sh1)', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <p style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--subtle)', fontFamily: 'Plus Jakarta Sans,sans-serif' }}>
                    Route from {originLabel}
                  </p>
                  <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.1rem', color: 'var(--navy)', marginTop: 4 }}>
                    Your Journey to {location}
                  </h3>
                </div>
                <button onClick={() => setState({ type: 'idle' })}
                  style={{ padding: '6px 14px', background: 'var(--cream-dk)', border: '1px solid var(--line-dk)', borderRadius: 'var(--r)', fontSize: '.78rem', fontWeight: 600, color: 'var(--muted)', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans,sans-serif' }}>
                  ↩ Change Location
                </button>
              </div>

              {distanceKm !== null && (
                <>
                  <InfoRow icon="📏" label="Approximate Distance" value={`${distanceKm} km`} />
                  {driveTime && <InfoRow icon="🚗" label="Estimated Drive Time" value={driveTime} />}
                  {cost !== null && cost > 0 && (
                    <InfoRow icon="💰" label="Est. Daily Commute Cost (own vehicle)" value={`≈ ₹${cost.toLocaleString('en-IN')} / day`} />
                  )}
                </>
              )}

              <InfoRow icon="📍" label="College Address" value={geo.formatted_address} />

              <InfoRow icon="🗺" label="Get Exact Directions"
                value={
                  <a href={directionsUrl} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--gold)', fontWeight: 700, textDecoration: 'none', fontSize: '.88rem' }}>
                    Open Turn-by-Turn Directions in Google Maps ↗
                  </a>
                }
              />

              {/* Transport hubs */}
              {(geo.nearestRailway || geo.nearestBusStand) && (
                <div style={{ marginTop: 20 }}>
                  <p style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--subtle)', fontFamily: 'Plus Jakarta Sans,sans-serif', marginBottom: 12 }}>
                    Nearest Transport Hubs
                  </p>
                  <div className="nearest-hubs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
                    {geo.nearestRailway  && <HubPill icon="🚂" label="Railway Station" name={geo.nearestRailway.name}  distKm={geo.nearestRailway.distance_km} />}
                    {geo.nearestBusStand && <HubPill icon="🚌" label="Bus Stand"        name={geo.nearestBusStand.name} distKm={geo.nearestBusStand.distance_km} />}
                  </div>
                </div>
              )}

              {/* APSRTC/TSRTC */}
              <div style={{ marginTop: 20, background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '10px 14px', fontSize: '.78rem', color: 'var(--muted)', fontFamily: 'Plus Jakarta Sans,sans-serif', lineHeight: 1.6 }}>
                🚌 For bus schedules, check{' '}
                <a href="https://apsrtconline.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', fontWeight: 700 }}>APSRTC</a>
                {' '}or{' '}
                <a href="https://tsrtconline.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', fontWeight: 700 }}>TSRTC</a>
                {' '}for official bus route information.
              </div>
            </div>

            {/* Embedded map */}
            <div style={{ borderRadius: 'var(--r2)', overflow: 'hidden', boxShadow: 'var(--sh1)', border: '1px solid var(--line)' }}>
              <iframe title={`Map — ${collegeName}`} src={mapSrc}
                width="100%" height="280" style={{ border: 0, display: 'block' }}
                loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>
        );
      })()}

      {/* ── Idle / geo_failed: show embedded map ── */}
      {(state.type === 'idle' || state.type === 'geo_failed') && (
        <div style={{ borderRadius: 'var(--r2)', overflow: 'hidden', boxShadow: 'var(--sh1)', border: '1px solid var(--line)' }}>
          <iframe title={`Map — ${collegeName}`} src={mapSrc}
            width="100%" height="240" style={{ border: 0, display: 'block' }}
            loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      )}
    </div>
  );
}
