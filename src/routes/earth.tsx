import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  activeAdapter,
  earth2Adapter,
  fetchWeather,
  gibsUrl,
  utcDay,
  type Observation,
} from "@/lib/ubi/earth";
import { ageHours, groundTrack, propagateAll, type Fix } from "@/lib/ubi/orbits";
import { loadPublicTles, type PublicTle } from "@/lib/ubi/tle-fn";
import { useUbi } from "@/lib/ubi/store";

export const Route = createFileRoute("/earth")({ component: EarthPage });

const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const OSM = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

type Layers = { sat: boolean; gibs: boolean; terrain: boolean; cloud: boolean; precip: boolean; wx: boolean; orbits: boolean };

function EarthPage() {
  const lang = useUbi((s) => s.lang);
  const en = lang === "en" || lang === "fr";
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const gibsRef = useRef<import("leaflet").TileLayer | null>(null);
  const overlayRef = useRef<import("leaflet").LayerGroup | null>(null);
  const satLayer = useRef<import("leaflet").LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [view, setView] = useState<"2d" | "3d">("2d");
  const [day, setDay] = useState(13);
  const [query, setQuery] = useState("");
  const [obs, setObs] = useState<Observation | null>(null);
  const [layers, setLayers] = useState<Layers>({ sat: true, gibs: true, terrain: false, cloud: true, precip: true, wx: true, orbits: true });
  const [focus, setFocus] = useState(en ? "Globe" : "地球");
  const [tle, setTle] = useState<PublicTle[]>([]);
  const [tleMode, setTleMode] = useState<"loading" | "public" | "unavailable">("loading");
  const [tleNote, setTleNote] = useState("");
  const [fixes, setFixes] = useState<Fix[]>([]);
  const [picked, setPicked] = useState(25544);
  const [clock, setClock] = useState("—");
  const date = utcDay(-(13 - day));
  const asset = fixes.find((f) => f.norad === picked) ?? fixes[0] ?? null;

  useEffect(() => {
    let dead = false;
    const el = mapEl.current;
    if (!el) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    void import("leaflet").then((mod) => {
      if (dead || mapRef.current) return;
      const L = mod.default ?? mod;
      const map = L.map(el, { zoomSnap: 0.25, worldCopyJump: true }).setView([20, 10], 2);
      L.tileLayer(ESRI, { maxZoom: 18, attribution: "Esri World Imagery mosaic — not live video" }).addTo(map);
      const gibs = L.tileLayer(gibsUrl(utcDay(0)), { maxZoom: 9, opacity: 0.72, attribution: "NASA GIBS / Terra MODIS" }).addTo(map);
      const overlay = L.layerGroup().addTo(map);
      mapRef.current = map;
      gibsRef.current = gibs;
      overlayRef.current = overlay;
      map.on("moveend", () => {
        const c = map.getCenter();
        void pull(c.lat, c.lng, dateOf());
      });
      void pull(20, 10, utcDay(0));
      setMapReady(true);
      setTimeout(() => map.invalidateSize(), 80);
    });
    return () => {
      dead = true;
      mapRef.current?.remove();
      mapRef.current = null;
      satLayer.current = null;
      setMapReady(false);
      link.remove();
    };
    // map is created once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dateOf() {
    const el = document.getElementById("earth-day") as HTMLInputElement | null;
    const n = el ? Number(el.value) : 13;
    return utcDay(-(13 - n));
  }

  async function pull(lat: number, lon: number, gibsDate: string) {
    const next = await fetchWeather(lat, lon, gibsDate);
    setObs(next);
    paintOverlay(next);
  }

  function paintOverlay(next: Observation) {
    const group = overlayRef.current;
    const map = mapRef.current;
    if (!group || !map) return;
    void import("leaflet").then((mod) => {
      const L = mod.default ?? mod;
      group.clearLayers();
      const flags = readFlags();
      if (flags.wx && next.mode === "public") {
        L.circle([next.lat, next.lon], { radius: 28000, color: "#00d4ff", weight: 1, fillOpacity: 0.05 }).addTo(group);
      }
      if (flags.cloud && next.cloudCover != null) {
        L.circle([next.lat, next.lon], { radius: 90000, color: "#9ad7ff", weight: 1, fillOpacity: Math.min(0.28, next.cloudCover / 200) }).addTo(group);
      }
      if (flags.precip && (next.precipMm ?? 0) > 0) {
        L.circle([next.lat, next.lon], { radius: 50000, color: "#7dffb3", weight: 1, fillOpacity: 0.14 }).addTo(group);
      }
      L.circleMarker([next.lat, next.lon], { radius: 5, color: "#00d4ff", weight: 1, fillOpacity: 0.2 }).addTo(group);
    });
  }

  function readFlags(): Layers {
    const on = (id: string) => (document.getElementById(id) as HTMLInputElement | null)?.checked ?? false;
    return { sat: on("ly-sat"), gibs: on("ly-gibs"), terrain: on("ly-osm"), cloud: on("ly-cloud"), precip: on("ly-precip"), wx: on("ly-wx"), orbits: true };
  }

  useEffect(() => {
    const map = mapRef.current;
    const gibs = gibsRef.current;
    if (!map || !gibs) return;
    void import("leaflet").then((mod) => {
      const L = mod.default ?? mod;
      if (layers.sat && !hasAttr(map, "Esri")) {
        L.tileLayer(ESRI, { maxZoom: 18, attribution: "Esri World Imagery mosaic — not live video" }).addTo(map);
      }
      if (!layers.sat) removeAttr(map, "Esri");
      if (layers.terrain && !hasAttr(map, "OpenStreetMap")) {
        L.tileLayer(OSM, { maxZoom: 18, attribution: "© OpenStreetMap" }).addTo(map);
      }
      if (!layers.terrain) removeAttr(map, "OpenStreetMap");
      if (layers.gibs) {
        if (!map.hasLayer(gibs)) gibs.addTo(map);
        gibs.setUrl(gibsUrl(date));
      } else if (map.hasLayer(gibs)) {
        map.removeLayer(gibs);
      }
      const c = map.getCenter();
      void pull(c.lat, c.lng, date);
    });
    // pull uses current layers via DOM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers, date]);

  useEffect(() => {
    let dead = false;
    void loadPublicTles()
      .then((pack) => {
        if (dead) return;
        setTle(pack.rows);
        setTleMode(pack.mode);
        setTleNote(pack.note);
      })
      .catch(() => {
        if (!dead) {
          setTleMode("unavailable");
          setTleNote("TLE source unreachable. No positions were invented.");
        }
      });
    return () => {
      dead = true;
    };
  }, []);

  useEffect(() => {
    if (!tle.length) return;
    const tick = () => {
      const now = new Date();
      setClock(now.toISOString().slice(11, 19) + "Z");
      setFixes(propagateAll(tle, now));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [tle]);

  const flew = useRef(false);
  useEffect(() => {
    if (flew.current || !mapReady || !fixes.length) return;
    const f = fixes.find((x) => x.norad === picked) ?? fixes[0];
    if (!f) return;
    flew.current = true;
    setFocus(f.name);
    mapRef.current?.flyTo([f.lat, f.lon], 3, { duration: 1.2 });
  }, [mapReady, fixes, picked]);

  useEffect(() => {
    if (view !== "2d") return;
    const id = window.setTimeout(() => mapRef.current?.invalidateSize(), 60);
    return () => window.clearTimeout(id);
  }, [view]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    let dead = false;
    void import("leaflet").then((mod) => {
      if (dead) return;
      const L = mod.default ?? mod;
      if (!satLayer.current) satLayer.current = L.layerGroup().addTo(map);
      const group = satLayer.current;
      group.clearLayers();
      if (!layers.orbits) return;
      for (const f of fixes) {
        const on = f.norad === (asset?.norad ?? picked);
        const marker = L.circleMarker([f.lat, f.lon], {
          radius: on ? 6 : 4,
          color: on ? "#ffcc00" : "#00d4ff",
          weight: 1,
          fillColor: on ? "#ffcc00" : "#00d4ff",
          fillOpacity: 0.9,
        });
        marker.bindTooltip(f.name, { direction: "top", opacity: 0.9 });
        marker.on("click", () => setPicked(f.norad));
        marker.addTo(group);
      }
      const row = tle.find((t) => t.norad === (asset?.norad ?? picked));
      const sel = fixes.find((f) => f.norad === row?.norad);
      if (row && sel) {
        for (const part of groundTrack(row)) {
          L.polyline(part, { color: "#ffcc00", weight: 1, opacity: 0.55 }).addTo(group);
        }
        L.circle([sel.lat, sel.lon], {
          radius: (sel.footprintKm / 2) * 1000,
          color: "#ffcc00",
          weight: 1,
          fillOpacity: 0.04,
        }).addTo(group);
      }
    });
    return () => {
      dead = true;
    };
  }, [fixes, picked, layers.orbits, tle, mapReady, asset?.norad]);

  const analysis = obs ? activeAdapter().analyze(obs) : null;

  const fly = (name: string, lat: number, lon: number, z: number) => {
    setFocus(name);
    mapRef.current?.flyTo([lat, lon], z, { duration: 1.1 });
  };

  const pickAsset = (norad: number) => {
    setPicked(norad);
    const f = fixes.find((x) => x.norad === norad);
    if (!f) return;
    setFocus(f.name);
    const z = mapRef.current?.getZoom() ?? 2;
    mapRef.current?.flyTo([f.lat, f.lon], Math.max(z, 3), { duration: 0.8 });
  };

  const search = async (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const rows = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`, {
      headers: { Accept: "application/json" },
    })
      .then((r) => r.json())
      .catch(() => []);
    const hit = rows[0] as { lat: string; lon: string; display_name: string; type?: string } | undefined;
    if (!hit) return;
    const z = hit.type === "country" ? 5 : hit.type === "city" || hit.type === "town" ? 11 : 8;
    fly(hit.display_name.split(",")[0] ?? q, Number(hit.lat), Number(hit.lon), z);
  };

  const toggle = (key: keyof Layers) => setLayers((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg font-mono text-fg">
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <div className="min-w-0">
          <div className="text-[10px] tracking-[0.22em] text-accent">ORBITAL DESK</div>
          <div className="text-[11px] text-dim">
            {en ? "Public ephemeris. Not live video. Not a locator." : "公開軌道。生中継ではない。人物も端末も探さない。"}
          </div>
        </div>
        <form onSubmit={search} className="flex min-w-0 flex-1 gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={en ? "Search a place" : "場所を検索"}
            className="h-10 min-w-0 flex-1 border border-border bg-bg px-2"
            aria-label={en ? "Search" : "検索"}
          />
          <button type="submit" className="h-10 border border-border px-3 text-accent">SEARCH</button>
        </form>
        <button type="button" className={`h-10 border border-border px-3 ${view === "2d" ? "text-accent" : "text-muted"}`} onClick={() => setView("2d")}>2D</button>
        <button type="button" className={`h-10 border border-border px-3 ${view === "3d" ? "text-accent" : "text-muted"}`} onClick={() => setView("3d")}>3D</button>
        <button
          type="button"
          className="h-10 border border-border px-3"
          onClick={() => {
            if (!document.fullscreenElement) void document.documentElement.requestFullscreen().catch(() => undefined);
            else void document.exitFullscreen();
          }}
        >
          FULL
        </button>
        <div className="font-mono text-[11px] text-accent tabular">{clock}</div>
      </header>

      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-border px-2 py-1">
        {fixes.map((f) => (
          <button
            key={f.norad}
            type="button"
            onClick={() => pickAsset(f.norad)}
            className={`h-9 shrink-0 border px-2 text-[10px] ${f.norad === asset?.norad ? "border-warn text-warn" : "border-border text-muted"}`}
          >
            {shortName(f.name)}
          </button>
        ))}
        {tleMode === "loading" ? <span className="self-center px-2 text-[10px] text-muted">TLE</span> : null}
        {tleMode === "unavailable" ? (
          <span className="self-center px-2 text-[10px] text-alert">{en ? "NO ELEMENTS · NOTHING INVENTED" : "要素なし · 位置は作らない"}</span>
        ) : null}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,4.5rem)_minmax(180px,1fr)_minmax(0,7.5rem)] overflow-hidden lg:grid-cols-[220px_minmax(0,1fr)_260px] lg:grid-rows-1">
        <aside className="min-h-0 overflow-auto border-b border-border p-3 lg:border-r lg:border-b-0">
          <h2 className="text-[10px] tracking-[0.2em] text-accent">LAYERS</h2>
          <Check id="ly-sat" on={layers.sat} label="Satellite mosaic" onChange={() => toggle("sat")} />
          <Check id="ly-gibs" on={layers.gibs} label="NASA GIBS daily" onChange={() => toggle("gibs")} />
          <Check id="ly-osm" on={layers.terrain} label="Terrain / OSM" onChange={() => toggle("terrain")} />
          <Check id="ly-cloud" on={layers.cloud} label="Cloud" onChange={() => toggle("cloud")} />
          <Check id="ly-precip" on={layers.precip} label="Precipitation" onChange={() => toggle("precip")} />
          <Check id="ly-wx" on={layers.wx} label="Weather grid" onChange={() => toggle("wx")} />
          <Check id="ly-orbit" on={layers.orbits} label="Public orbits" onChange={() => toggle("orbits")} />
          <h2 className="mt-3 text-[10px] tracking-[0.2em] text-accent">ZOOM</h2>
          <div className="mt-2 flex flex-wrap gap-1">
            <button type="button" className="h-9 border border-border px-2" onClick={() => fly(en ? "Globe" : "地球", 20, 10, 2)}>GLOBE</button>
            <button type="button" className="h-9 border border-border px-2" onClick={() => fly(en ? "Japan" : "日本", 36, 138, 5)}>JP</button>
            <button type="button" className="h-9 border border-border px-2" onClick={() => fly(en ? "Kanto" : "関東", 35.7, 139.7, 8)}>KANTO</button>
          </div>
          <h2 className="mt-3 text-[10px] tracking-[0.2em] text-accent">ADAPTERS</h2>
          <p className="mt-1 text-[10px] leading-relaxed text-muted">
            {en
              ? "Processing = GIBS/Esri/Open-Meteo. Analysis = local rule unless Earth-2 is bound. Visualization = this map."
              : "処理はGIBS・Esri・Open-Meteo。解析はEarth-2未接続なのでローカル規則。表示はこの地図。"}
          </p>
          <div className="mt-1 text-[11px]">Earth-2 {earth2Adapter.bound ? "BOUND" : "UNBOUND"}</div>
          <p className="mt-1 text-[10px] leading-relaxed text-muted">
            {en
              ? "Desk look only. Elements stay public. No intercept, no phone, no person."
              : "見た目だけ軌道デスク。要素は公開のもの。傍受も電話も人物もない。"}
          </p>
        </aside>

        <div className="relative min-h-0">
          <div ref={mapEl} className={`absolute inset-0 ${view === "2d" ? "" : "invisible"}`} />
          {view === "3d" ? <Globe lat={obs?.lat ?? 20} lon={obs?.lon ?? 10} fixes={fixes} picked={asset?.norad ?? picked} /> : null}
          <div className="pointer-events-none absolute inset-2 border border-accent/25" />
          <div className="orbital-scan pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute top-2 right-2 text-[10px] tracking-[0.16em] text-warn">
            {tleMode === "public" ? "PUBLIC EPHEMERIS" : tleMode === "loading" ? "LOADING" : "UNAVAILABLE"}
          </div>
          <div className="pointer-events-none absolute bottom-2 left-2 text-[10px] tracking-[0.14em] text-accent">
            {focus} · {obs ? `${obs.lat.toFixed(2)}, ${obs.lon.toFixed(2)}` : "—"}
          </div>
        </div>

        <aside className="min-h-0 overflow-auto border-t border-border p-3 lg:border-t-0 lg:border-l">
          <h2 className="text-[10px] tracking-[0.2em] text-warn">ASSET</h2>
          <Row k="Craft" v={asset?.name ?? "—"} />
          <Row k="NORAD" v={asset ? String(asset.norad) : "—"} />
          <Row k="Lat / Lon" v={asset ? `${asset.lat.toFixed(2)}, ${asset.lon.toFixed(2)}` : "—"} />
          <Row k="Alt" v={asset ? `${asset.altKm.toFixed(0)} km` : "—"} />
          <Row k="Speed" v={asset ? `${asset.speedKmh.toFixed(0)} km/h` : "—"} />
          <Row k="Horizon" v={asset ? `${asset.footprintKm.toFixed(0)} km` : "—"} />
          <Row k="Elements" v={asset?.updated ? asset.updated.replace("T", " ").slice(0, 19) + "Z" : "—"} />
          <Row k="Age" v={asset?.updated && ageHours(asset.updated) != null ? `${ageHours(asset.updated)!.toFixed(1)} h` : "—"} />
          <Row k="State" v={clock} />
          <p className="mt-1 text-[10px] leading-relaxed text-muted">
            {tleMode === "public"
              ? en
                ? "Propagated from published elements. Horizon is geometry, not a sensor."
                : "公開要素からの補外。地平圏は幾何で、センサーではない。"
              : tleNote || (en ? "No track." : "航跡なし。")}
          </p>
          <h2 className="mt-3 text-[10px] tracking-[0.2em] text-accent">OBSERVATION</h2>
          <Row k="Focus" v={focus} />
          <Row k="Lat / Lon" v={obs ? `${obs.lat.toFixed(3)}, ${obs.lon.toFixed(3)}` : "—"} />
          <Row k="Source" v="NASA GIBS Terra MODIS" />
          <Row k="Acquisition" v={obs?.acquisition ?? "—"} />
          <Row k="Imagery age" v={obs?.ageHours != null ? `${obs.ageHours.toFixed(0)} h` : "—"} />
          <Row k="Revisit" v="~1 day (Terra)" />
          <Row k="Esri" v={en ? "Mosaic, per-pixel dates" : "合成。日時は画素ごと"} />
          <h2 className="mt-3 text-[10px] tracking-[0.2em] text-accent">DATA</h2>
          <Row k="Mode" v={obs?.mode === "demo" ? "DEMO DATA" : obs ? "PUBLIC" : "—"} />
          <Row k="Cloud" v={obs?.cloudCover == null ? "—" : `${obs.cloudCover} %`} />
          <Row k="Precip" v={obs?.precipMm == null ? "—" : `${obs.precipMm} mm`} />
          <Row k="Weather time" v={obs?.weatherTime ?? "—"} />
          <p className="mt-1 text-[10px] leading-relaxed text-muted">{obs?.note}</p>
          <h2 className="mt-3 text-[10px] tracking-[0.2em] text-accent">AI STATUS</h2>
          {analysis ? (
            <>
              <div className={`mt-1 text-[10px] ${analysis.demo ? "text-alert" : "text-ok"}`}>
                {analysis.demo ? "NOT NVIDIA-POWERED" : analysis.adapterId}
              </div>
              <p className="mt-1 text-[10px] leading-relaxed text-dim">{en ? analysis.text : jaAnalysis(analysis.text, obs?.mode === "demo")}</p>
              <Row k="Cloud class" v={analysis.cloudClass} />
              <Row k="Precip class" v={analysis.precipClass} />
            </>
          ) : null}
        </aside>
      </div>

      <footer className="flex shrink-0 items-center gap-2 border-t border-border px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <span className="text-[10px] tracking-[0.18em] text-accent">TIMELINE</span>
        <button type="button" className="h-9 border border-border px-2" onClick={() => setDay((d) => Math.max(0, d - 1))}>-1d</button>
        <input id="earth-day" type="range" min={0} max={13} value={day} onChange={(e) => setDay(Number(e.target.value))} className="min-w-0 flex-1" />
        <button type="button" className="h-9 border border-border px-2" onClick={() => setDay((d) => Math.min(13, d + 1))}>+1d</button>
        <span className="text-[11px] text-fg">{date}</span>
      </footer>
    </div>
  );
}

function hasAttr(map: import("leaflet").Map, needle: string) {
  let found = false;
  map.eachLayer((layer) => {
    const attr = (layer as { options?: { attribution?: string } }).options?.attribution ?? "";
    if (attr.includes(needle)) found = true;
  });
  return found;
}

function removeAttr(map: import("leaflet").Map, needle: string) {
  map.eachLayer((layer) => {
    const attr = (layer as { options?: { attribution?: string } }).options?.attribution ?? "";
    if (attr.includes(needle)) map.removeLayer(layer);
  });
}

function jaAnalysis(text: string, demo: boolean | undefined) {
  if (demo || text.startsWith("Weather")) return "気象の取得に失敗。下の分類はDemo Data。衛星画像は合成していない。";
  if (text.startsWith("Earth-2")) return "Earth-2は未接続。ナウキャストも同化も動いていない。";
  return "雲と降水の分類はOpen-Meteoの数値に対するローカル規則。NVIDIAのモデルではない。";
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="mt-1 flex justify-between gap-2 text-[11px]">
      <span className="text-muted">{k}</span>
      <span className="truncate text-right text-fg">{v}</span>
    </div>
  );
}

function Check({ id, on, label, onChange }: { id: string; on: boolean; label: string; onChange: () => void }) {
  return (
    <label className="mt-1 flex items-center justify-between gap-2 text-[12px]">
      <span>{label}</span>
      <input id={id} type="checkbox" checked={on} onChange={onChange} />
    </label>
  );
}

function shortName(name: string) {
  return name.replace(/\s*\(.*\)/, "").slice(0, 16);
}

function Globe({ lat, lon, fixes, picked }: { lat: number; lon: number; fixes: Fix[]; picked: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let frame = 0;
    const draw = (t: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#020408";
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.34;
      const ry = t * 0.00025;
      ctx.strokeStyle = "rgba(0,212,255,.45)";
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = -60; i <= 60; i += 30) {
        ctx.beginPath();
        const y = cy + (i / 90) * r;
        const rr = Math.sqrt(Math.max(0, r * r - (y - cy) ** 2));
        ctx.ellipse(cx, y, rr, rr * 0.18, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(0,212,255,.25)";
      for (let i = 0; i < 8; i++) {
        const a = ry + (i / 8) * Math.PI;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.abs(Math.cos(a)) * r, r, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      const phi = (lat * Math.PI) / 180;
      const lam = ((lon * Math.PI) / 180) + ry;
      const x = cx + r * Math.cos(phi) * Math.sin(lam);
      const y = cy - r * Math.sin(phi);
      if (Math.cos(lam) > 0) {
        ctx.fillStyle = "#7a9aaa";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const f of fixes) {
        const p = (f.lat * Math.PI) / 180;
        const l = ((f.lon * Math.PI) / 180) + ry;
        if (Math.cos(l) <= 0) continue;
        const sx = cx + r * Math.cos(p) * Math.sin(l);
        const sy = cy - r * Math.sin(p);
        ctx.fillStyle = f.norad === picked ? "#ffcc00" : "#00d4ff";
        ctx.beginPath();
        ctx.arc(sx, sy, f.norad === picked ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [lat, lon, fixes, picked]);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}
