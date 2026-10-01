/** X/SpaceX AI1 mesh is orbital edge inference — never the ledger. First birds ~end 2027. */

export const AI1_ALT_KM = 600;
export const AI1_INC_DEG = 53;
export const AI1_PERIOD_MIN = 96.7;
export const AI1_PLANES = 4;
export const AI1_PER_PLANE = 6;
export const AI1_FIRST_LAUNCH = "2027-12";
export const AI1_POWER_KW = 120;
export const KITAMOTO = { lat: 36.027, lon: 139.53 };

export type XSatFix = { id: string; lat: number; lon: number; plane: number };

export type XSatEdge = {
  role: "edge";
  altKm: number;
  inView: number;
  birds: number;
  laserLinks: number;
  lastPing: string | null;
  version: string;
  status: "design-orbit" | "live";
};

export const INITIAL_XSAT: XSatEdge = {
  role: "edge",
  altKm: AI1_ALT_KM,
  inView: 0,
  birds: AI1_PLANES * AI1_PER_PLANE,
  laserLinks: 0,
  lastPing: null,
  version: "1.1.0",
  status: "design-orbit",
};

const PERIOD_MS = AI1_PERIOD_MIN * 60 * 1000;
const INC = (AI1_INC_DEG * Math.PI) / 180;

export function xsatMesh(now = new Date()): XSatFix[] {
  const t = now.getTime();
  const out: XSatFix[] = [];
  for (let p = 0; p < AI1_PLANES; p++) {
    const raan0 = (p / AI1_PLANES) * 2 * Math.PI + (t / 86_400_000) * 0.22;
    for (let s = 0; s < AI1_PER_PLANE; s++) {
      const nu = ((t % PERIOD_MS) / PERIOD_MS) * 2 * Math.PI + (s / AI1_PER_PLANE) * 2 * Math.PI + p * 0.35;
      const lat = Math.asin(Math.sin(INC) * Math.sin(nu)) * (180 / Math.PI);
      const arg = Math.atan2(Math.cos(INC) * Math.sin(nu), Math.cos(nu)) + raan0;
      let lon = (arg * 180) / Math.PI - t / 240_000;
      lon = ((((lon + 180) % 360) + 360) % 360) - 180;
      out.push({ id: `ai1-${p}-${s}`, lat, lon, plane: p });
    }
  }
  return out;
}

function havKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const r = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function xsatOverJapan(mesh: XSatFix[], maxKm = 2400) {
  return mesh.filter((sat) => havKm(sat, KITAMOTO) < maxKm);
}

export function xsatSnapshot(now = new Date(), version = "1.1.0"): XSatEdge {
  const mesh = xsatMesh(now);
  const over = xsatOverJapan(mesh);
  return {
    role: "edge",
    altKm: AI1_ALT_KM,
    inView: over.length,
    birds: mesh.length,
    laserLinks: Math.max(0, mesh.length - AI1_PLANES),
    lastPing: over.length ? now.toISOString() : null,
    version,
    status: "design-orbit",
  };
}
