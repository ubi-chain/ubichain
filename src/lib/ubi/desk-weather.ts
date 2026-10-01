import { createServerFn } from "@tanstack/react-start";

export type DeskWeather = {
  mode: "public" | "demo";
  temp: number | null;
  humidity: number | null;
  cloud: number | null;
  precip: number | null;
  wind: number | null;
  dir: number | null;
  visKm: number | null;
  time: string | null;
};

const EMPTY: DeskWeather = {
  mode: "demo",
  temp: null,
  humidity: null,
  cloud: null,
  precip: null,
  wind: null,
  dir: null,
  visKm: null,
  time: null,
};

const cache = new Map<string, { at: number; row: DeskWeather }>();

export const readDeskWeather = createServerFn({ method: "POST" })
  .validator((input: { lat: number; lon: number }) => {
    const lat = Number(input?.lat);
    const lon = Number(input?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return { lat: 35.7, lon: 139.8 };
    return {
      lat: Math.round(Math.min(90, Math.max(-90, lat)) * 10) / 10,
      lon: Math.round(Math.min(180, Math.max(-180, lon)) * 10) / 10,
    };
  })
  .handler(async ({ data }): Promise<DeskWeather> => {
    const key = `${data.lat},${data.lon}`;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < 10 * 60 * 1000) return hit.row;
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${data.lat}&longitude=${data.lon}` +
      `&current=temperature_2m,relative_humidity_2m,cloud_cover,precipitation,wind_speed_10m,wind_direction_10m,visibility&timezone=Asia%2FTokyo`;
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) return EMPTY;
      const body = (await res.json()) as {
        current?: {
          time?: string;
          temperature_2m?: number;
          relative_humidity_2m?: number;
          cloud_cover?: number;
          precipitation?: number;
          wind_speed_10m?: number;
          wind_direction_10m?: number;
          visibility?: number;
        };
      };
      const c = body.current;
      if (!c || typeof c.temperature_2m !== "number") return EMPTY;
      const row: DeskWeather = {
        mode: "public",
        temp: c.temperature_2m,
        humidity: typeof c.relative_humidity_2m === "number" ? c.relative_humidity_2m : null,
        cloud: typeof c.cloud_cover === "number" ? c.cloud_cover : null,
        precip: typeof c.precipitation === "number" ? c.precipitation : null,
        wind: typeof c.wind_speed_10m === "number" ? c.wind_speed_10m : null,
        dir: typeof c.wind_direction_10m === "number" ? c.wind_direction_10m : null,
        visKm: typeof c.visibility === "number" ? c.visibility / 1000 : null,
        time: c.time ?? null,
      };
      cache.set(key, { at: Date.now(), row });
      return row;
    } catch {
      return EMPTY;
    }
  });
