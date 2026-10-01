/** ISS is a delay-tolerant replica, never the primary ledger. */

export type GroundStation = {
  id: string;
  ja: string;
  en: string;
  lat: number;
  lon: number;
};

export const GROUND_STATIONS: GroundStation[] = [
  { id: "kitamoto", ja: "北本", en: "Kitamoto", lat: 36.027, lon: 139.53 },
  { id: "tsukuba", ja: "つくば JAXA", en: "Tsukuba JAXA", lat: 36.06, lon: 140.08 },
  { id: "houston", ja: "ヒューストン", en: "Houston", lat: 29.56, lon: -95.09 },
  { id: "gsoc", ja: "ミュンヘン GSOC", en: "Munich GSOC", lat: 48.08, lon: 11.28 },
];

const PERIOD_MS = 92.68 * 60 * 1000;
const INC = (51.64 * Math.PI) / 180;

export type IssFix = {
  lat: number;
  lon: number;
  altKm: number;
  periodMin: number;
};

export type IssReplica = {
  role: "replica";
  lat: number;
  lon: number;
  altKm: number;
  inView: boolean;
  stationId: string | null;
  lastSync: string | null;
  cycle: number;
  version: string;
  bankPool: number;
};

export const INITIAL_ISS: IssReplica = {
  role: "replica",
  lat: 0,
  lon: 0,
  altKm: 408,
  inView: false,
  stationId: null,
  lastSync: null,
  cycle: 1,
  version: "1.1.0",
  bankPool: 0,
};

export function issPosition(now = new Date()): IssFix {
  const t = now.getTime();
  const nu = ((t % PERIOD_MS) / PERIOD_MS) * 2 * Math.PI;
  const raan = (t / 86_400_000) * 0.9856 * (Math.PI / 180);
  const lat = Math.asin(Math.sin(INC) * Math.sin(nu)) * (180 / Math.PI);
  const arg = Math.atan2(Math.cos(INC) * Math.sin(nu), Math.cos(nu)) + raan;
  const earth = (t / 240_000) * (Math.PI / 180) * (180 / Math.PI);
  let lon = (arg * 180) / Math.PI - earth;
  lon = ((((lon + 180) % 360) + 360) % 360) - 180;
  return { lat, lon, altKm: 408, periodMin: 92.68 };
}

export function issFootprint(fix: IssFix, steps = 72): { lat: number; lon: number }[] {
  const radius = 6371;
  const ang = Math.acos(Math.min(1, radius / (radius + fix.altKm)));
  const lat1 = (fix.lat * Math.PI) / 180;
  const lon1 = (fix.lon * Math.PI) / 180;
  const out: { lat: number; lon: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const brng = (i / steps) * 2 * Math.PI;
    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(ang) + Math.cos(lat1) * Math.sin(ang) * Math.cos(brng));
    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(brng) * Math.sin(ang) * Math.cos(lat1),
        Math.cos(ang) - Math.sin(lat1) * Math.sin(lat2),
      );
    let lon = (lon2 * 180) / Math.PI;
    lon = ((((lon + 180) % 360) + 360) % 360) - 180;
    out.push({ lat: (lat2 * 180) / Math.PI, lon });
  }
  return out;
}

export function issTrack(now = new Date(), n = 36): IssFix[] {
  return Array.from({ length: n }, (_, i) => issPosition(new Date(now.getTime() + (i / n) * PERIOD_MS)));
}

function hav(a: IssFix, b: { lat: number; lon: number }) {
  const r = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function visibleStation(fix: IssFix, maxKm = 2100) {
  let best: GroundStation | null = null;
  let bestD = maxKm;
  for (const st of GROUND_STATIONS) {
    const d = hav(fix, st);
    if (d < bestD) {
      best = st;
      bestD = d;
    }
  }
  return best;
}

export function stationName(id: string | null, lang: string) {
  const st = GROUND_STATIONS.find((s) => s.id === id);
  if (!st) return lang === "en" ? "AOS wait" : "AOS待ち";
  return lang === "en" ? st.en : st.ja;
}
