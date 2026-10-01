import * as satellite from "satellite.js";
import type { PublicTle } from "./tle-fn";

export type Fix = {
  norad: number;
  name: string;
  lat: number;
  lon: number;
  altKm: number;
  speedKmh: number;
  footprintKm: number;
  updated: string;
  source: string;
};

function vec(v: satellite.EciVec3<number> | boolean | undefined) {
  if (!v || typeof v === "boolean") return null;
  return v;
}

/** Geometric horizon diameter. The spacecraft, not a person or a device. */
export function horizonKm(altKm: number) {
  const re = 6371;
  const rho = Math.acos(Math.min(1, re / (re + Math.max(altKm, 1))));
  return 2 * rho * re;
}

export function propagateAll(rows: PublicTle[], at = new Date()): Fix[] {
  const gmst = satellite.gstime(at);
  const out: Fix[] = [];
  for (const row of rows) {
    let satrec: satellite.SatRec;
    try {
      satrec = satellite.twoline2satrec(row.line1, row.line2);
    } catch {
      continue;
    }
    const pv = satellite.propagate(satrec, at);
    const pos = vec(pv?.position);
    if (!pos) continue;
    const gd = satellite.eciToGeodetic(pos, gmst);
    const lat = satellite.degreesLat(gd.latitude);
    const lon = satellite.degreesLong(gd.longitude);
    const altKm = gd.height;
    const vel = vec(pv?.velocity);
    const speedKmh = vel ? Math.sqrt(vel.x ** 2 + vel.y ** 2 + vel.z ** 2) * 3600 : 0;
    out.push({
      norad: row.norad,
      name: row.name,
      lat,
      lon,
      altKm,
      speedKmh,
      footprintKm: horizonKm(altKm),
      updated: row.updated,
      source: row.source,
    });
  }
  return out;
}

export function groundTrack(row: PublicTle, at = new Date()): [number, number][][] {
  const pts: [number, number][] = [];
  for (let m = -48; m <= 48; m += 3) {
    const fix = propagateAll([row], new Date(at.getTime() + m * 60_000))[0];
    if (fix) pts.push([fix.lat, fix.lon]);
  }
  const parts: [number, number][][] = [];
  let cur: [number, number][] = [];
  for (const p of pts) {
    const prev = cur[cur.length - 1];
    if (prev && Math.abs(prev[1] - p[1]) > 180) {
      if (cur.length > 1) parts.push(cur);
      cur = [p];
    } else cur.push(p);
  }
  if (cur.length > 1) parts.push(cur);
  return parts;
}

export function ageHours(iso: string, now = Date.now()) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return Math.max(0, (now - t) / 36e5);
}
