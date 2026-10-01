import { createServerFn } from "@tanstack/react-start";

/** Public catalog only. Crewed stations and Earth-observation spacecraft. Not a phone or person. */
const IDS = [25544, 48274, 25994, 27424, 39084, 49260, 43013];

export type PublicTle = {
  norad: number;
  name: string;
  line1: string;
  line2: string;
  updated: string;
  source: string;
};

type Pack = {
  mode: "public" | "unavailable";
  rows: PublicTle[];
  fetchedAt: string;
  note: string;
};

let cache: { at: number; pack: Pack } | null = null;

export const loadPublicTles = createServerFn({ method: "GET" }).handler(async (): Promise<Pack> => {
  const now = Date.now();
  if (cache && now - cache.at < 3 * 60 * 60 * 1000 && cache.pack.rows.length) return cache.pack;
  const rows: PublicTle[] = [];
  await Promise.all(
    IDS.map(async (id) => {
      try {
        const res = await fetch(`https://db.satnogs.org/api/tle/?format=json&norad_cat_id=${id}`, {
          headers: { Accept: "application/json", "User-Agent": "ubichain-orbital-desk" },
        });
        if (!res.ok) return;
        const data = (await res.json()) as Array<{
          tle0?: string;
          tle1?: string;
          tle2?: string;
          updated?: string;
          tle_source?: string;
          norad_cat_id?: number;
        }>;
        const row = data[0];
        if (!row?.tle1 || !row.tle2) return;
        rows.push({
          norad: row.norad_cat_id ?? id,
          name: (row.tle0 ?? String(id)).replace(/^0\s+/, ""),
          line1: row.tle1,
          line2: row.tle2,
          updated: row.updated ?? "",
          source: row.tle_source || "SatNOGS",
        });
      } catch {
        /* one catalog miss does not invent a position */
      }
    }),
  );
  rows.sort((a, b) => IDS.indexOf(a.norad) - IDS.indexOf(b.norad));
  const pack: Pack = rows.length
    ? {
        mode: "public",
        rows,
        fetchedAt: new Date(now).toISOString(),
        note: "SatNOGS mirror of Space-Track elements. Positions are local SGP4, not a camera and not live video.",
      }
    : {
        mode: "unavailable",
        rows: [],
        fetchedAt: new Date(now).toISOString(),
        note: "TLE source unreachable. No positions were invented.",
      };
  if (rows.length) cache = { at: now, pack };
  return pack;
});
