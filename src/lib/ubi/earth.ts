/** Public observation + a future Earth-2 slot. No invented NVIDIA endpoint. */
export type ObsMode = "public" | "demo";

export type Observation = {
  lat: number;
  lon: number;
  gibsDate: string;
  source: string;
  acquisition: string;
  ageHours: number | null;
  cloudCover: number | null;
  precipMm: number | null;
  weatherTime: string | null;
  mode: ObsMode;
  note: string;
};

export type Analysis = {
  adapterId: string;
  bound: boolean;
  demo: boolean;
  cloudClass: string;
  precipClass: string;
  text: string;
};

export type AnalysisAdapter = {
  id: string;
  label: string;
  /** True only when a real server-side Earth-2 process is configured. */
  bound: boolean;
  analyze(obs: Observation): Analysis;
};

function cloudClass(n: number | null) {
  if (n == null) return "—";
  if (n > 70) return "overcast";
  if (n > 40) return "broken";
  return "clear-ish";
}

function precipClass(n: number | null) {
  if (n == null) return "—";
  if (n > 1) return "wet";
  if (n > 0) return "trace";
  return "dry";
}

/** Visualization stays here. This adapter does not fetch imagery. */
export const localRuleAdapter: AnalysisAdapter = {
  id: "local-rule",
  label: "Local rule",
  bound: false,
  analyze(obs) {
    return {
      adapterId: "local-rule",
      bound: false,
      demo: obs.mode === "demo" || obs.cloudCover == null,
      cloudClass: cloudClass(obs.cloudCover),
      precipClass: precipClass(obs.precipMm),
      text:
        obs.mode === "demo"
          ? "Weather fetch failed. Classes below are Demo Data, not a satellite product."
          : "Cloud and rain classes are a local rule on Open-Meteo numbers. Not an NVIDIA model.",
    };
  },
};

/**
 * Slot for NVIDIA Earth-2 / Earth2Studio.
 * bound stays false: no key, no endpoint, no fake response.
 */
export const earth2Adapter: AnalysisAdapter = {
  id: "earth-2",
  label: "Earth-2 / Earth2Studio",
  bound: false,
  analyze(obs) {
    return {
      adapterId: "earth-2",
      bound: false,
      demo: true,
      cloudClass: "—",
      precipClass: "—",
      text: "Earth-2 is not connected. Nowcast and data assimilation are not running. " + obs.source,
    };
  },
};

export function activeAdapter(): AnalysisAdapter {
  return earth2Adapter.bound ? earth2Adapter : localRuleAdapter;
}

export function gibsUrl(date: string) {
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
}

export function utcDay(offset: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}

export async function fetchWeather(lat: number, lon: number, gibsDate: string): Promise<Observation> {
  const ageHours = Math.max(0, (Date.now() - Date.parse(`${gibsDate}T00:00:00Z`)) / 36e5);
  const base = {
    lat,
    lon,
    gibsDate,
    source: "NASA GIBS MODIS Terra CorrectedReflectance TrueColor",
    acquisition: `${gibsDate}T00:00:00Z`,
    ageHours,
  };
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&current=cloud_cover,precipitation&timezone=UTC`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { current?: { time?: string; cloud_cover?: number; precipitation?: number } };
    const cur = data.current;
    if (!cur || typeof cur.cloud_cover !== "number") throw new Error("empty");
    return {
      ...base,
      cloudCover: cur.cloud_cover,
      precipMm: typeof cur.precipitation === "number" ? cur.precipitation : null,
      weatherTime: cur.time ? `${cur.time}Z` : null,
      mode: "public",
      note: "Open-Meteo current grid. Not a live satellite video.",
    };
  } catch {
    return {
      ...base,
      cloudCover: null,
      precipMm: null,
      weatherTime: null,
      mode: "demo",
      note: "Demo Data — Open-Meteo did not return. GIBS tiles may still load. No synthetic image was invented.",
    };
  }
}
