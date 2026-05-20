import { NextRequest, NextResponse } from 'next/server';

// ─── Module-level cache (survives hot-reloads via globalThis) ────────────────
const gCache = (globalThis as Record<string, unknown>) as {
  _geocodeCache?: Map<string, TransportResult>;
};
if (!gCache._geocodeCache) gCache._geocodeCache = new Map();
const cache = gCache._geocodeCache;

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface GeoResult {
  lat: number;
  lng: number;
  formatted_address: string;
  resolvedBy: string;
}

interface TransportResult extends GeoResult {
  nearestRailway?: { name: string; distance_km: number };
  nearestBusStand?: { name: string; distance_km: number };
}

/* ─── Haversine ──────────────────────────────────────────────────────────── */
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

/* ─── Nominatim geocoder (OpenStreetMap — free, no key, works server-side) ── */
async function nominatimGeocode(query: string): Promise<GeoResult | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'in');

  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'EAPCETPredictor/1.0 (educational project)' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.length) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      formatted_address: data[0].display_name,
      resolvedBy: 'nominatim',
    };
  } catch {
    return null;
  }
}

/* ─── Shorten unwieldy college names ─────────────────────────────────────── */
function shortenName(name: string): string {
  return name
    .replace(/\b(Group Of Institutions?|Society|Educational Society|Educational Academy)\b/gi, '')
    .replace(/,\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/* ─── Progressive fallback geocoding ─────────────────────────────────────── */
async function geocodeWithFallback(
  college: string,
  location: string | undefined
): Promise<GeoResult | null> {
  const loc = location ?? '';
  const short = shortenName(college);

  // Ordered from most specific to most generic
  const queries = [
    `${college} ${loc} Andhra Pradesh India`,
    `${short} ${loc} Andhra Pradesh India`,
    `${short} college ${loc} Andhra Pradesh`,
    `${loc} Andhra Pradesh India`,             // city-only fallback — always works
  ].filter(q => q.trim().length > 10);

  for (const q of queries) {
    const result = await nominatimGeocode(q);
    if (result) return { ...result, resolvedBy: q === queries[queries.length - 1] ? 'city-fallback' : 'college' };
    // Nominatim rate-limit: 1 req/sec
    await new Promise(r => setTimeout(r, 1100));
  }
  return null;
}

/* ─── Nominatim reverse-lookup for nearby transport hubs ─────────────────── */
async function nearbyHub(
  lat: number,
  lng: number,
  keyword: string
): Promise<{ name: string; distance_km: number } | undefined> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', `${keyword} near ${lat},${lng}`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'in');
  url.searchParams.set('viewbox', `${lng - 0.2},${lat + 0.2},${lng + 0.2},${lat - 0.2}`);
  url.searchParams.set('bounded', '0');

  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'EAPCETPredictor/1.0 (educational project)' },
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    if (!data?.length) return undefined;
    const pLat = parseFloat(data[0].lat);
    const pLng = parseFloat(data[0].lon);
    const name = data[0].display_name.split(',')[0].trim();
    return { name, distance_km: haversineKm(lat, lng, pLat, pLng) };
  } catch {
    return undefined;
  }
}

/* ─── GET /api/geocode ────────────────────────────────────────────────────── */
// Mode 1: ?college=[name]&location=[city]  → geocode college + transport hubs
// Mode 2: ?city=[name]                     → geocode a user's starting city
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const college  = searchParams.get('college')?.trim();
  const location = searchParams.get('location')?.trim();
  const city     = searchParams.get('city')?.trim();

  // ── Mode 2: simple city geocode (for user's starting location) ──
  if (city) {
    const cacheKey = `city|${city}`;
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!;
      return NextResponse.json({ lat: cached.lat, lng: cached.lng });
    }
    const geo = await nominatimGeocode(`${city} Andhra Pradesh India`);
    if (!geo) {
      // Try without state qualification
      const geo2 = await nominatimGeocode(`${city} India`);
      if (!geo2) return NextResponse.json({ error: `Could not find "${city}"` }, { status: 404 });
      cache.set(cacheKey, geo2 as TransportResult);
      return NextResponse.json({ lat: geo2.lat, lng: geo2.lng });
    }
    cache.set(cacheKey, geo as TransportResult);
    return NextResponse.json({ lat: geo.lat, lng: geo.lng });
  }

  // ── Mode 1: college geocode ──
  if (!college) {
    return NextResponse.json({ error: 'college or city param is required' }, { status: 400 });
  }

  const cacheKey = `${college}|${location ?? ''}`;

  // Return cached result instantly
  if (cache.has(cacheKey)) {
    return NextResponse.json(cache.get(cacheKey));
  }

  try {
    const geo = await geocodeWithFallback(college, location);

    if (!geo) {
      return NextResponse.json(
        { error: `Could not locate "${college}" in "${location}".` },
        { status: 404 }
      );
    }

    // Fetch nearby transport hubs (best-effort, non-blocking)
    let nearestRailway: { name: string; distance_km: number } | undefined;
    let nearestBusStand: { name: string; distance_km: number } | undefined;

    try {
      nearestRailway = await nearbyHub(geo.lat, geo.lng, 'railway station');
      await new Promise(r => setTimeout(r, 1100)); // rate limit
      nearestBusStand = await nearbyHub(geo.lat, geo.lng, 'bus station');
    } catch {
      // Tolerate failures — transport hubs are nice-to-have
    }

    const result: TransportResult = {
      ...geo,
      nearestRailway,
      nearestBusStand,
    };

    cache.set(cacheKey, result);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[/api/geocode] error:', err);
    return NextResponse.json({ error: 'Geocoding service unavailable' }, { status: 500 });
  }
}
