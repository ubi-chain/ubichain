import { Link } from "@tanstack/react-router";
import {
  Archive,
  Bell,
  Crosshair,
  Hexagon,
  Map as MapIcon,
  Minus,
  Plus,
  Radio,
  Satellite,
  Settings,
  Shield,
  Terminal,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { QConsole } from "@/components/q-console";
import { gibsUrl, utcDay } from "@/lib/ubi/earth";
import { issPosition, type IssFix } from "@/lib/ubi/iss";
import { readDeskWeather, type DeskWeather } from "@/lib/ubi/desk-weather";
import { useUbi } from "@/lib/ubi/store";

/** Desk id only. Never a handset, home, or tracking key. */
export const DESK_ID = "080-5725-6673";
export const POLICE_NO = "110";
export const SECTION_NAME = "TRINITY HEX SECTION 6";

const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const OSM = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const PLACES = [
  { name: "東京駅", en: "Tokyo Station", lat: 35.6812, lon: 139.7671 },
  { name: "大阪駅", en: "Osaka Station", lat: 34.7024, lon: 135.4959 },
  { name: "札幌駅", en: "Sapporo Station", lat: 43.0687, lon: 141.3508 },
  { name: "福岡", en: "Hakata", lat: 33.5902, lon: 130.4017 },
  { name: "京都", en: "Kyoto", lat: 35.0116, lon: 135.7681 },
  { name: "名古屋", en: "Nagoya", lat: 35.1709, lon: 136.8815 },
  { name: "横浜", en: "Yokohama", lat: 35.4437, lon: 139.638 },
  { name: "仙台", en: "Sendai", lat: 38.2682, lon: 140.8694 },
] as const;

const OFFSETS = [
  { id: "HEX-1", dlat: 0.008, dlon: -0.006 },
  { id: "HEX-2", dlat: -0.006, dlon: 0.01 },
  { id: "HEX-3", dlat: 0.004, dlon: 0.012 },
  { id: "HEX-4", dlat: -0.01, dlon: -0.008 },
  { id: "HEX-5", dlat: 0.011, dlon: 0.002 },
  { id: "HEX-6", dlat: -0.003, dlon: -0.012 },
];

type View = "desk" | "map" | "assets" | "alerts" | "sats" | "archive" | "intel" | "comms" | "settings" | "q";
type LayerName = "imagery" | "osm" | "gibs";
type Wx = DeskWeather;

type LogLine = { t: string; text: string };

const NAV: { id: View; ja: string; en: string; icon: typeof Shield }[] = [
  { id: "desk", ja: "指令", en: "DESK", icon: Shield },
  { id: "map", ja: "地図", en: "MAP", icon: MapIcon },
  { id: "assets", ja: "資産", en: "ASSETS", icon: Crosshair },
  { id: "alerts", ja: "通知", en: "ALERTS", icon: Bell },
  { id: "sats", ja: "衛星", en: "SATS", icon: Satellite },
  { id: "archive", ja: "記録", en: "ARCHIVE", icon: Archive },
  { id: "intel", ja: "解析", en: "INTEL", icon: Hexagon },
  { id: "comms", ja: "通信", en: "COMMS", icon: Radio },
  { id: "settings", ja: "設定", en: "SETUP", icon: Settings },
  { id: "q", ja: "Q机", en: "Q DESK", icon: Terminal },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function clockNow() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function stamp() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmtCoord(lat: number, lon: number) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${ns}   ${Math.abs(lon).toFixed(4)}° ${ew}`;
}

function hav(aLat: number, aLon: number, bLat: number, bLon: number) {
  const r = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(s)));
}

function compass(deg: number) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round((((deg % 360) + 360) % 360) / 45) % 8];
}

function token(name: string, fallback: string) {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function TrinityHex() {
  const lang = useUbi((s) => s.lang);
  const en = lang === "en" || lang === "fr";
  const [view, setView] = useState<View>("desk");
  const [clock, setClock] = useState("--:--:--");
  const [dateLabel, setDateLabel] = useState("—");
  const [uptime, setUptime] = useState("00:00:00");
  const [center, setCenter] = useState<{ lat: number; lon: number; zoom: number }>({
    lat: PLACES[0].lat,
    lon: PLACES[0].lon,
    zoom: 14,
  });
  const [place, setPlace] = useState<string>(PLACES[0].name);
  const [query, setQuery] = useState("");
  const [layer, setLayer] = useState<LayerName>("imagery");
  const [showPins, setShowPins] = useState(true);
  const [showReticle, setShowReticle] = useState(true);
  const [followIss, setFollowIss] = useState(false);
  const [ready, setReady] = useState(false);
  const [gibsDay, setGibsDay] = useState(utcDay(-1));
  const [wx, setWx] = useState<Wx | null>(null);
  const [logs, setLogs] = useState<LogLine[]>([{ t: "—", text: "TRINITY HEX SECTION 6 を開いた。演習画面。" }]);
  const [saved, setSaved] = useState<string[]>([]);
  const [iss, setIss] = useState<IssFix | null>(null);
  const boot = useRef(Date.now());
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layerRef = useRef<{
    imagery: import("leaflet").TileLayer;
    osm: import("leaflet").TileLayer;
    gibs: import("leaflet").TileLayer;
    pins: import("leaflet").LayerGroup;
    iss: import("leaflet").LayerGroup;
  } | null>(null);

  function pushLog(text: string) {
    setLogs((rows) => [{ t: stamp(), text }, ...rows].slice(0, 14));
  }

  useEffect(() => {
    const id = window.setInterval(() => {
      setClock(clockNow());
      const s = Math.floor((Date.now() - boot.current) / 1000);
      setUptime(`${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`);
      setIss(issPosition());
      setDateLabel(
        new Date().toLocaleDateString(en ? "en-GB" : "ja-JP", {
          year: "numeric",
          month: "short",
          day: "numeric",
          weekday: "short",
        }),
      );
    }, 1000);
    setClock(clockNow());
    return () => window.clearInterval(id);
  }, [en]);

  useEffect(() => {
    let dead = false;
    const el = mapEl.current;
    if (!el) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    void import("leaflet").then((mod) => {
      if (dead || !mapEl.current || mapRef.current) return;
      const L = mod.default;
      const map = L.map(mapEl.current, {
        zoomControl: false,
        attributionControl: true,
        zoomSnap: 0.25,
      }).setView([PLACES[0].lat, PLACES[0].lon], 14);
      const imagery = L.tileLayer(ESRI, {
        maxZoom: 19,
        attribution: "Esri World Imagery mosaic — not live video",
      }).addTo(map);
      const osm = L.tileLayer(OSM, { maxZoom: 19, attribution: "© OpenStreetMap" });
      const gibs = L.tileLayer(gibsUrl(utcDay(-1)), {
        maxZoom: 9,
        opacity: 0.9,
        attribution: "NASA GIBS / MODIS Terra",
      });
      const pins = L.layerGroup().addTo(map);
      const issLayer = L.layerGroup().addTo(map);
      mapRef.current = map;
      layerRef.current = { imagery, osm, gibs, pins, iss: issLayer };
      const read = () => {
        const c = map.getCenter();
        setCenter({ lat: c.lat, lon: c.lng, zoom: map.getZoom() });
      };
      map.on("moveend", read);
      read();
      setReady(true);
      window.setTimeout(() => map.invalidateSize(), 160);
    });
    return () => {
      dead = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      link.remove();
    };
  }, []);

  useEffect(() => {
    const pack = layerRef.current;
    const map = mapRef.current;
    if (!pack || !map) return;
    pack.imagery.remove();
    pack.osm.remove();
    pack.gibs.remove();
    if (layer === "imagery") pack.imagery.addTo(map);
    if (layer === "osm") pack.osm.addTo(map);
    if (layer === "gibs") {
      pack.gibs.setUrl(gibsUrl(gibsDay));
      pack.gibs.addTo(map);
    }
  }, [layer, gibsDay, ready]);

  useEffect(() => {
    const pack = layerRef.current;
    if (!pack || !ready) return;
    void import("leaflet").then((mod) => {
      const L = mod.default;
      pack.pins.clearLayers();
      if (!showPins) return;
      const accent = token("--color-accent", "#00d4ff");
      for (const pin of OFFSETS) {
        const lat = center.lat + pin.dlat;
        const lon = center.lon + pin.dlon;
        const km = hav(center.lat, center.lon, lat, lon);
        L.circleMarker([lat, lon], {
          radius: 6,
          color: accent,
          weight: 2,
          fillColor: accent,
          fillOpacity: 0.2,
        })
          .bindTooltip(`${pin.id} · ${km.toFixed(1)} km · exercise pin`, { direction: "top" })
          .addTo(pack.pins);
      }
    });
  }, [center.lat, center.lon, showPins, ready]);

  useEffect(() => {
    const pack = layerRef.current;
    const map = mapRef.current;
    if (!pack || !map || !ready || !iss) return;
    void import("leaflet").then((mod) => {
      const L = mod.default;
      pack.iss.clearLayers();
      const ok = token("--color-ok", "#00ff88");
      L.circleMarker([iss.lat, iss.lon], {
        radius: 5,
        color: ok,
        weight: 2,
        fillOpacity: 0.8,
      })
        .bindTooltip("ISS public orbit model — not live telemetry", { direction: "top" })
        .addTo(pack.iss);
      if (followIss) map.panTo([iss.lat, iss.lon], { animate: true, duration: 0.4 });
    });
  }, [iss, followIss, ready]);

  useEffect(() => {
    let dead = false;
    const lat = Number(center.lat.toFixed(1));
    const lon = Number(center.lon.toFixed(1));
    void readDeskWeather({ data: { lat, lon } })
      .then((row) => {
        if (!dead) setWx(row);
      })
      .catch(() => {
        if (!dead) {
          setWx({
            mode: "demo",
            temp: null,
            humidity: null,
            cloud: null,
            precip: null,
            wind: null,
            dir: null,
            visKm: null,
            time: null,
          });
        }
      });
    return () => {
      dead = true;
    };
  }, [center.lat.toFixed(1), center.lon.toFixed(1)]);

  useEffect(() => {
    if (view === "q") return;
    const id = window.setTimeout(() => mapRef.current?.invalidateSize(), 80);
    return () => window.clearTimeout(id);
  }, [view]);

  function flyTo(lat: number, lon: number, name: string) {
    setPlace(name);
    setFollowIss(false);
    mapRef.current?.flyTo([lat, lon], 14, { duration: 0.8 });
    pushLog(`${name} へ移動。公開モザイク。`);
    setView("map");
  }

  function zoom(dir: 1 | -1) {
    if (dir > 0) mapRef.current?.zoomIn();
    else mapRef.current?.zoomOut();
  }

  function recordPin() {
    const line = `${place} ${fmtCoord(center.lat, center.lon)} z${center.zoom}`;
    setSaved((rows) => [line, ...rows].slice(0, 8));
    pushLog("観測点をこの画面に記録。サーバへは送らない。");
  }

  async function copyCoord() {
    const text = `${SECTION_NAME} ${fmtCoord(center.lat, center.lon)} desk ${DESK_ID}`;
    try {
      await navigator.clipboard.writeText(text);
      pushLog("座標をコピーした。");
    } catch {
      pushLog("コピーは使えなかった。");
    }
  }

  const pins = OFFSETS.map((pin) => {
    const lat = center.lat + pin.dlat;
    const lon = center.lon + pin.dlon;
    return { ...pin, lat, lon, km: hav(center.lat, center.lon, lat, lon) };
  });
  const cloud = wx?.cloud ?? null;
  const quality = cloud == null ? "—" : cloud < 30 ? "CLEAR" : cloud < 65 ? "BROKEN" : "CLOUDY";
  const qualityBars = cloud == null ? 0 : cloud < 30 ? 2 : cloud < 65 ? 3 : 5;
  const showMap = view === "desk" || view === "map";
  const filtered = PLACES.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return p.name.includes(query.trim()) || p.en.toLowerCase().includes(q);
  });

  if (view === "q") {
    return (
      <div className="flex h-full flex-col bg-bg">
        <button
          type="button"
          onClick={() => setView("desk")}
          className="shrink-0 border-b border-border px-3 py-2 text-left font-mono text-xs text-accent"
        >
          ← {SECTION_NAME}
        </button>
        <div className="min-h-0 flex-1">
          <QConsole />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-x-hidden overflow-y-auto bg-bg text-fg lg:flex lg:flex-col lg:overflow-hidden">
      <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-surface px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-md border border-accent/50 text-accent">
            <Shield className="size-4" />
          </span>
          <div className="leading-tight">
            <div className="font-mono text-xs font-semibold tracking-widest text-fg">{SECTION_NAME}</div>
            <div className="font-mono text-[10px] tracking-wide text-dim">
              {en ? "POLICE SATELLITE DESK · PUBLIC MOSAIC" : "警察衛星指令 · 公開モザイク"}
            </div>
          </div>
        </div>
        <div className="font-mono text-center leading-tight">
          <div className="text-sm tabular text-fg" suppressHydrationWarning>
            {clock}
          </div>
          <div className="text-[10px] text-muted" suppressHydrationWarning>
            {dateLabel} JST
          </div>
        </div>
        <Stat k={en ? "STATUS" : "状態"} v={en ? "EXERCISE" : "演習"} ok />
        <Stat k={en ? "PUBLIC SAT" : "公開衛星"} v="ISS 1" />
        <Stat k={en ? "UP" : "稼働"} v={uptime} />
        <Stat k={en ? "NOTICES" : "通知"} v="3" warn />
        <div className="ml-auto flex items-center gap-2 font-mono">
          <div className="text-right leading-tight">
            <div className="text-[10px] text-accent">
              {en ? "POLICE NO." : "警察番号"} {POLICE_NO}
            </div>
            <div className="text-xs text-fg">{DESK_ID}</div>
            <div className="text-[10px] text-muted">SECTION 6</div>
          </div>
        </div>
      </header>

      <div className="border-b border-border bg-bg px-3 py-1 font-mono text-[10px] text-warn">
        {en
          ? "Simulation UI. Imagery is a dated public mosaic, not live satellite video. 110 is the emergency number. The desk id is not used to locate a phone, person, home, or vehicle."
          : "演習画面です。映像は日付つき公開モザイクで、ライブ衛星映像ではありません。警察番号110は緊急通報先。デスクIDは電話・人物・自宅・車両の位置取得に使いません。"}
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-border px-2 py-1 lg:hidden">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            className={`shrink-0 rounded-sm border px-2 py-2 font-mono text-[10px] ${
              view === item.id ? "border-accent text-accent" : "border-border text-dim"
            }`}
          >
            {en ? item.en : item.ja}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <nav className="hidden w-44 shrink-0 flex-col border-r border-border bg-surface lg:flex">
          {NAV.map((item) => {
            const Icon = item.icon;
            const on = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={`flex items-center gap-2 border-l-2 px-3 py-2 text-left font-mono text-[11px] ${
                  on ? "border-accent bg-accent/10 text-accent" : "border-transparent text-dim hover:text-fg"
                }`}
              >
                <Icon className="size-3.5" />
                <span>
                  <span className="block">{en ? item.en : item.ja}</span>
                  <span className="block text-[9px] text-muted">{en ? item.ja : item.en}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className={showMap ? "flex min-h-[48vh] flex-1 flex-col lg:min-h-0" : "hidden"}>
            <div className="flex items-center justify-between gap-2 border-b border-border px-2 py-1 font-mono text-[10px]">
              <span className="text-dim">{en ? "PUBLIC IMAGERY" : "公開画像"}</span>
              <span className="rounded-sm border border-warn/50 px-1.5 py-0.5 text-warn">NOT LIVE</span>
              <span className="ml-auto text-fg tabular">{fmtCoord(center.lat, center.lon)}</span>
            </div>
            <div className="relative min-h-[42vh] flex-1">
              <div ref={mapEl} className="trinity-map absolute inset-0" />
              {showReticle ? (
                <div className="pointer-events-none absolute inset-0 z-[500]">
                  <div className="absolute top-3 left-3 w-12 rounded-sm border border-border bg-bg/85 py-1 text-center font-mono text-[10px] leading-none text-fg">
                    <div className="pb-1">N</div>
                    <div className="flex items-center justify-between px-1">
                      <span>W</span>
                      <span className="text-danger">+</span>
                      <span>E</span>
                    </div>
                    <div className="pt-1">S</div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 size-40 -translate-1/2">
                    <div className="absolute inset-0 rounded-full border border-danger/80" />
                    <div className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-danger/70" />
                    <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-danger/70" />
                    <div className="absolute top-1/2 left-1/2 size-8 -translate-1/2 border-2 border-danger" />
                  </div>
                  <div className="absolute top-[calc(50%+5.5rem)] left-1/2 -translate-x-1/2 rounded-sm bg-danger px-1.5 py-0.5 font-mono text-[10px] text-bg">
                    {en ? "OBSERVATION" : "観測点"}
                  </div>
                </div>
              ) : null}
              <div className="absolute bottom-8 left-2 z-[500] flex flex-col gap-1">
                <button type="button" onClick={() => zoom(1)} className="grid size-11 place-items-center rounded-sm border border-border bg-bg/85 text-fg" aria-label="zoom in">
                  <Plus className="size-4" />
                </button>
                <button type="button" onClick={() => zoom(-1)} className="grid size-11 place-items-center rounded-sm border border-border bg-bg/85 text-fg" aria-label="zoom out">
                  <Minus className="size-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 border-t border-border bg-surface px-2 py-1.5">
              <Tool
                label={followIss ? "ISS ON" : "ISS"}
                onClick={() => {
                  setFollowIss((v) => !v);
                  pushLog(followIss ? "ISS追従を止めた。" : "公開ISS簡易軌道を追従。実操縦ではない。");
                }}
              />
              <Tool label={en ? "RETICLE" : "照準"} onClick={() => setShowReticle((v) => !v)} />
              <Tool label={en ? "PINS" : "ピン"} onClick={() => setShowPins((v) => !v)} />
              <Tool
                label={layer === "imagery" ? "SAT" : layer === "osm" ? "MAP" : "GIBS"}
                onClick={() => {
                  const next: LayerName = layer === "imagery" ? "osm" : layer === "osm" ? "gibs" : "imagery";
                  setLayer(next);
                  pushLog(`レイヤ ${next}`);
                }}
              />
              <Tool label={en ? "COPY" : "写す"} onClick={() => void copyCoord()} />
              <Tool label={en ? "SAVE" : "記録"} onClick={recordPin} />
              <Tool
                label={en ? "FULL" : "全画面"}
                onClick={() => {
                  const node = mapEl.current?.parentElement;
                  if (!node) return;
                  if (document.fullscreenElement) void document.exitFullscreen();
                  else void node.requestFullscreen();
                }}
              />
            </div>
          </div>

          {!showMap ? (
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {view === "assets" ? <Assets pins={pins} issLat={iss?.lat ?? null} issLon={iss?.lon ?? null} en={en} /> : null}
              {view === "alerts" ? <Alerts en={en} wx={wx} gibsDay={gibsDay} /> : null}
              {view === "sats" ? <Sats en={en} issLat={iss?.lat ?? null} issLon={iss?.lon ?? null} alt={iss?.altKm ?? null} /> : null}
              {view === "archive" ? (
                <ArchiveDays
                  en={en}
                  active={gibsDay}
                  saved={saved}
                  onPick={(day) => {
                    setGibsDay(day);
                    setLayer("gibs");
                    setView("map");
                    pushLog(`GIBS ${day} を表示。取得日でありライブではない。`);
                  }}
                />
              ) : null}
              {view === "intel" ? <Intel en={en} wx={wx} /> : null}
              {view === "comms" ? <Comms logs={logs} en={en} /> : null}
              {view === "settings" ? (
                <SettingsDesk
                  en={en}
                  place={place}
                  query={query}
                  setQuery={setQuery}
                  places={filtered}
                  onPick={(p) => flyTo(p.lat, p.lon, en ? p.en : p.name)}
                />
              ) : null}
            </div>
          ) : null}
        </div>

        {view === "desk" ? (
          <aside className="max-h-[70vh] w-full shrink-0 overflow-y-auto border-t border-border bg-surface lg:max-h-full lg:min-h-0 lg:w-72 lg:border-t-0 lg:border-l">
            <Panel title={en ? "DESK" : "指令デスク"}>
              <div className="font-mono text-[10px] text-muted">TRINITY-HEX-6</div>
              <div className="mt-1 font-mono text-xs text-fg">{place}</div>
              <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[10px]">
                <Mini k={en ? "POLICE NO." : "警察番号"} v={POLICE_NO} />
                <Mini k="DESK ID" v={DESK_ID} />
              </div>
              <p className="mt-2 font-mono text-[10px] leading-relaxed text-dim">
                {en
                  ? "Relative exercise pins sit around the map center. They are not units, suspects, or vehicles."
                  : "周囲のピンは地図中心からの演習配置です。部隊・容疑者・車両ではありません。"}
              </p>
              <button
                type="button"
                onClick={() => setView("settings")}
                className="mt-2 w-full rounded-sm border border-accent/40 py-2 font-mono text-[10px] text-accent"
              >
                {en ? "DESK DETAILS" : "デスク詳細"}
              </button>
            </Panel>
            <Panel title={en ? "EXERCISE PINS" : "演習ピン"}>
              <ul className="space-y-1 font-mono text-[10px]">
                {pins.map((pin) => (
                  <li key={pin.id} className="flex justify-between text-dim">
                    <span className="text-fg">{pin.id}</span>
                    <span>{pin.km.toFixed(1)} km</span>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title={en ? "PUBLIC SATELLITE" : "公開衛星"}>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span>ISS</span>
                <span className="text-ok">{en ? "ORBIT MODEL" : "簡易軌道"}</span>
              </div>
              <div className="mt-1 font-mono text-[10px] text-dim tabular">
                {iss ? `${fmtCoord(iss.lat, iss.lon)} · ${iss.altKm} km` : "—"}
              </div>
              <p className="mt-1 font-mono text-[10px] text-muted">
                {en ? "Period model, not a live feed and not tasked." : "周期モデルです。ライブ映像でも任務衛星でもありません。"}
              </p>
            </Panel>
            <Panel title={en ? "IMAGE QUALITY" : "画像の状態"}>
              <div className="font-mono text-lg text-accent">{quality}</div>
              <div className="mt-1 flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`h-1.5 flex-1 ${i < qualityBars ? "bg-accent" : "bg-border"}`} />
                ))}
              </div>
              <p className="mt-1 font-mono text-[10px] text-dim">
                {cloud == null
                  ? en
                    ? "Cloud cover unavailable."
                    : "雲量は未取得。"
                  : en
                    ? `Open-Meteo cloud ${cloud}% — not a threat score.`
                    : `Open-Meteo 雲量 ${cloud}%。脅威スコアではありません。`}
              </p>
            </Panel>
            <Panel title={en ? "WEATHER GRID" : "気象グリッド"}>
              <WeatherBlock wx={wx} en={en} />
            </Panel>
          </aside>
        ) : null}
      </div>

      {view === "desk" ? (
        <footer className="grid shrink-0 gap-px border-t border-border bg-border lg:grid-cols-3">
          <FooterCol title={en ? "NOTICES" : "通知"}>
            <Alerts en={en} wx={wx} gibsDay={gibsDay} compact />
          </FooterCol>
          <FooterCol title={en ? "MOSAIC MODES" : "モザイク"}>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["imagery", "Esri", "bg-raised"],
                  ["osm", "OSM", "bg-panel"],
                  ["gibs", "GIBS", "bg-accent/20"],
                ] as const
              ).map(([id, label, tone]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setLayer(id);
                    pushLog(`モザイク ${label}`);
                  }}
                  className={`rounded-sm border p-2 text-left font-mono text-[10px] ${
                    layer === id ? "border-accent text-accent" : "border-border text-dim"
                  }`}
                >
                  <span className={`mb-1 block h-8 rounded-sm ${tone}`} />
                  {label}
                  <span className="mt-0.5 block text-[9px] text-warn">NOT LIVE</span>
                </button>
              ))}
            </div>
          </FooterCol>
          <FooterCol title={en ? "DESK LOG" : "指令ログ"}>
            <Comms logs={logs.slice(0, 4)} en={en} compact />
          </FooterCol>
        </footer>
      ) : null}
    </div>
  );
}

function Stat({ k, v, ok, warn }: { k: string; v: string; ok?: boolean; warn?: boolean }) {
  return (
    <div className="hidden font-mono leading-tight sm:block">
      <div className="text-[9px] tracking-widest text-muted">{k}</div>
      <div className={`text-[11px] ${ok ? "text-ok" : warn ? "text-warn" : "text-fg"}`}>{v}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-border px-3 py-2">
      <h2 className="mb-1 font-mono text-[10px] tracking-widest text-accent">{title}</h2>
      {children}
    </section>
  );
}

function Mini({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-sm border border-border px-2 py-1">
      <div className="text-muted">{k}</div>
      <div className="text-fg">{v}</div>
    </div>
  );
}

function Tool({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-sm border border-border bg-bg px-2 py-2 font-mono text-[10px] text-dim hover:text-accent">
      {label}
    </button>
  );
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-surface px-3 py-2">
      <h2 className="mb-1 font-mono text-[10px] tracking-widest text-accent">{title}</h2>
      {children}
    </section>
  );
}

function WeatherBlock({ wx, en }: { wx: Wx | null; en: boolean }) {
  if (!wx) return <p className="font-mono text-[10px] text-muted">{en ? "Reading grid…" : "グリッド取得中…"}</p>;
  if (wx.mode === "demo") {
    return (
      <p className="font-mono text-[10px] text-warn">
        {en ? "Demo Data — Open-Meteo did not return. No invented weather." : "Demo Data — Open-Meteo未取得。数値は作っていません。"}
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
      <Mini k="TEMP" v={wx.temp == null ? "—" : `${wx.temp.toFixed(0)}°C`} />
      <Mini k="CLOUD" v={wx.cloud == null ? "—" : `${wx.cloud}%`} />
      <Mini k="HUMID" v={wx.humidity == null ? "—" : `${wx.humidity}%`} />
      <Mini k="WIND" v={wx.wind == null ? "—" : `${wx.wind.toFixed(0)} km/h ${wx.dir == null ? "" : compass(wx.dir)}`} />
      <Mini k="RAIN" v={wx.precip == null ? "—" : `${wx.precip} mm`} />
      <Mini k="VIS" v={wx.visKm == null ? "—" : `${wx.visKm.toFixed(0)} km`} />
      <p className="col-span-2 text-muted">Open-Meteo {wx.time ?? ""} JST</p>
    </div>
  );
}

function Alerts({ en, wx, gibsDay, compact }: { en: boolean; wx: Wx | null; gibsDay: string; compact?: boolean }) {
  const rows = [
    { lv: "INFO", text: en ? "Mosaic is not live video." : "モザイクはライブ映像ではない。" },
    {
      lv: wx?.mode === "demo" ? "DEMO" : "WX",
      text: wx?.mode === "demo" ? (en ? "Weather fetch failed." : "気象の取得に失敗。") : en ? "Weather grid is public." : "気象は公開グリッド。",
    },
    { lv: "GIBS", text: `${en ? "Scene date" : "撮影日の目安"} ${gibsDay}` },
    { lv: "DESK", text: en ? `${DESK_ID} is a desk id, not a track.` : `${DESK_ID} はデスクID。追跡しない。` },
  ];
  const list = compact ? rows.slice(0, 3) : rows;
  return (
    <ul className="space-y-1 font-mono text-[10px]">
      {list.map((row, i) => (
        <li key={row.lv + row.text} className="flex justify-between gap-2">
          <span className="log-slash log-type" style={{ animationDelay: `${i * 55}ms` }}>{row.text}</span>
          <span className="shrink-0 text-warn">{row.lv}</span>
        </li>
      ))}
    </ul>
  );
}

function Assets({
  pins,
  issLat,
  issLon,
  en,
}: {
  pins: { id: string; lat: number; lon: number; km: number }[];
  issLat: number | null;
  issLon: number | null;
  en: boolean;
}) {
  return (
    <div className="space-y-3">
      <h2 className="font-mono text-xs tracking-widest text-accent">{en ? "EXERCISE PINS" : "演習ピン"}</h2>
      <p className="font-mono text-[10px] text-dim">
        {en ? "Offsets from the observation point. Not deployed units." : "観測点からの相対位置です。実配備ではありません。"}
      </p>
      <ul className="divide-y divide-border border border-border font-mono text-[11px]">
        {pins.map((pin) => (
          <li key={pin.id} className="flex items-center justify-between px-2 py-2">
            <span>{pin.id}</span>
            <span className="text-dim tabular">{fmtCoord(pin.lat, pin.lon)}</span>
            <span className="text-accent">{pin.km.toFixed(1)} km</span>
          </li>
        ))}
        <li className="flex items-center justify-between px-2 py-2">
          <span>ISS</span>
          <span className="text-dim tabular">{issLat == null || issLon == null ? "—" : fmtCoord(issLat, issLon)}</span>
          <span className="text-ok">{en ? "MODEL" : "モデル"}</span>
        </li>
      </ul>
    </div>
  );
}

function Sats({ en, issLat, issLon, alt }: { en: boolean; issLat: number | null; issLon: number | null; alt: number | null }) {
  return (
    <div className="space-y-2">
      <h2 className="font-mono text-xs tracking-widest text-accent">{en ? "SATELLITES" : "衛星"}</h2>
      <p className="font-mono text-[10px] text-dim">
        {en
          ? "Only the ISS row is a public orbit model. Other rows in the reference art are not reproduced as live birds."
          : "実データがあるのはISSの公開周期モデルだけです。参考画像の架空衛星はオンライン扱いしません。"}
      </p>
      <div className="border border-border p-3 font-mono text-[11px]">
        <div className="flex justify-between">
          <span>ISS / ZARYA class model</span>
          <span className="text-ok">{en ? "MODEL" : "モデル"}</span>
        </div>
        <div className="mt-1 text-dim tabular">
          {issLat == null || issLon == null ? "—" : fmtCoord(issLat, issLon)} · alt {alt ?? "—"} km
        </div>
      </div>
    </div>
  );
}

function ArchiveDays({
  en,
  active,
  saved,
  onPick,
}: {
  en: boolean;
  active: string;
  saved: string[];
  onPick: (day: string) => void;
}) {
  const days = Array.from({ length: 8 }, (_, i) => utcDay(-1 - i));
  return (
    <div className="space-y-3">
      <h2 className="font-mono text-xs tracking-widest text-accent">{en ? "GIBS DATES" : "GIBSの日付"}</h2>
      <p className="font-mono text-[10px] text-dim">
        {en ? "Each row is an acquisition day, not a recording of a person." : "各行は観測日です。人物の録画ではありません。"}
      </p>
      <ul className="grid gap-1 sm:grid-cols-2">
        {days.map((day) => (
          <li key={day}>
            <button
              type="button"
              onClick={() => onPick(day)}
              className={`w-full rounded-sm border px-2 py-2 text-left font-mono text-[11px] ${
                day === active ? "border-accent text-accent" : "border-border text-dim"
              }`}
            >
              MODIS Terra · {day}
            </button>
          </li>
        ))}
      </ul>
      <h3 className="font-mono text-[10px] tracking-widest text-muted">{en ? "LOCAL PINS" : "手元の記録"}</h3>
      {saved.length === 0 ? (
        <p className="font-mono text-[10px] text-muted">{en ? "None yet." : "まだありません。"}</p>
      ) : (
        <ul className="font-mono text-[10px] text-dim">
          {saved.map((row) => (
            <li key={row}>{row}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Intel({ en, wx }: { en: boolean; wx: Wx | null }) {
  return (
    <div className="space-y-2 font-mono text-[11px]">
      <h2 className="text-xs tracking-widest text-accent">{en ? "ANALYSIS" : "解析"}</h2>
      <p className="text-dim">
        {en
          ? "Cloud class is a local rule on Open-Meteo. NVIDIA Earth-2 is not connected and is not claimed."
          : "雲の区分はOpen-Meteoへのローカル規則です。NVIDIA Earth-2は未接続で、接続済みとは書きません。"}
      </p>
      <div className="border border-border p-3">
        <div>adapter: local-rule · bound: false</div>
        <div>earth-2: not bound</div>
        <div>source: {wx?.mode === "public" ? "Open-Meteo" : "Demo Data"}</div>
        <div>cloud: {wx?.cloud == null ? "—" : `${wx.cloud}%`}</div>
        <div>precip: {wx?.precip == null ? "—" : `${wx.precip} mm`}</div>
      </div>
      <Link to="/earth" className="inline-block text-accent">
        {en ? "Open Earth Intelligence →" : "Earth Intelligence を開く →"}
      </Link>
    </div>
  );
}

function Comms({ logs, en, compact }: { logs: LogLine[]; en: boolean; compact?: boolean }) {
  return (
    <div>
      {compact ? null : <h2 className="mb-2 font-mono text-xs tracking-widest text-accent">{en ? "LOG" : "ログ"}</h2>}
      <ul className="space-y-1 font-mono text-[10px]">
        {logs.map((row, i) => (
          <li key={`${row.t}-${i}`} className="flex gap-2">
            <span className="text-muted tabular">{row.t}</span>
            <span className="log-slash log-type" style={{ animationDelay: `${i * 55}ms` }}>{row.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SettingsDesk({
  en,
  place,
  query,
  setQuery,
  places,
  onPick,
}: {
  en: boolean;
  place: string;
  query: string;
  setQuery: (v: string) => void;
  places: readonly { name: string; en: string; lat: number; lon: number }[];
  onPick: (p: { name: string; en: string; lat: number; lon: number }) => void;
}) {
  return (
    <div className="space-y-3 font-mono text-[11px]">
      <h2 className="text-xs tracking-widest text-accent">{SECTION_NAME}</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        <Mini k={en ? "PAGE" : "ページ名"} v="TRINITY HEX SECTION 6" />
        <Mini k={en ? "POLICE NO." : "警察番号"} v={POLICE_NO} />
        <Mini k="DESK ID" v={DESK_ID} />
        <Mini k={en ? "PLACE" : "観測点"} v={place} />
      </div>
      <p className="text-dim leading-relaxed">
        {en
          ? "Registered on this desk as a project identifier. Calling 110 reaches emergency services in Japan. This page does not place that call and does not query the number."
          : "このデスクにプロジェクト識別子として登録しています。110は日本の緊急通報です。この画面は発信せず、番号から位置も引きません。"}
      </p>
      <label className="block text-[10px] text-muted" htmlFor="trinity-place">
        {en ? "Public places only" : "公開の地点だけ"}
      </label>
      <input
        id="trinity-place"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={en ? "Tokyo, Osaka…" : "東京、大阪…"}
        className="w-full rounded-sm border border-border bg-bg px-2 py-2 text-fg outline-none"
      />
      <ul className="grid gap-1 sm:grid-cols-2">
        {places.map((p) => (
          <li key={p.name}>
            <button type="button" onClick={() => onPick(p)} className="w-full rounded-sm border border-border px-2 py-2 text-left text-dim hover:text-accent">
              {en ? p.en : p.name}
            </button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3 text-accent">
        <Link to="/earth">Earth</Link>
        <Link to="/international">{en ? "Charter" : "綱領"}</Link>
        <Link to="/library">{en ? "Library" : "図書"}</Link>
        <Link to="/pay">Pay</Link>
      </div>
    </div>
  );
}
