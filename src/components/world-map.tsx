import { useCallback, useEffect, useRef, useState } from "react";
import {
  CITIES,
  cityName,
  povertyColor,
  project,
  txColor,
  type City,
} from "@/lib/ubi/cities";
import type { LiveTx, TxType } from "@/lib/ubi/store";
import { compactNumber } from "@/lib/ubi/format";
import { t, type Lang } from "@/lib/ubi/i18n";
import { BANK_COUNTRIES } from "@/lib/ubi/banks";
import { issPosition, issTrack, stationName } from "@/lib/ubi/iss";
import { AI1_ALT_KM, xsatMesh, xsatOverJapan } from "@/lib/ubi/xsat";
import { useUbi } from "@/lib/ubi/store";
import { Link } from "@tanstack/react-router";

type LandDot = [number, number];

function seededLand(): LandDot[] {
  const boxes: [number, number, number, number][] = [
    [-10, 60, 35, 70],
    [-25, 50, -35, 37],
    [25, 180, 5, 75],
    [100, 155, -45, -10],
    [-170, -50, 10, 75],
    [-80, -35, -55, 12],
    [120, 150, 30, 45],
  ];
  let seed = 2030;
  const rand = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) | 0;
    return ((seed >>> 0) % 1000) / 1000;
  };
  const out: LandDot[] = [];
  for (const [lon0, lon1, lat0, lat1] of boxes) {
    for (let lon = lon0; lon <= lon1; lon += 4) {
      for (let lat = lat0; lat <= lat1; lat += 3.5) {
        if (rand() < 0.52) out.push([lon + (rand() - 0.5) * 2, lat + (rand() - 0.5) * 2]);
      }
    }
  }
  return out;
}

const LAND = seededLand();

type Arc = {
  fx: number;
  fy: number;
  tx: number;
  ty: number;
  t: number;
  speed: number;
  color: string;
  type: TxType;
};

type Props = {
  lang: Lang;
  txs: LiveTx[];
  onSpawnArc?: (tx: LiveTx) => void;
};

export function WorldMap({ lang, txs }: Props) {
  const iss = useUbi((s) => s.iss);
  const xsat = useUbi((s) => s.xsat);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const arcs = useRef<Arc[]>([]);
  const cityPts = useRef<{ x: number; y: number; r: number; maxR: number; color: string }[]>([]);
  const frame = useRef(0);
  const pan = useRef({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [satellite, setSatellite] = useState(false);
  const [povertyOn, setPovertyOn] = useState(true);
  const [selected, setSelected] = useState<City | null>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const layout = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cityPts.current = CITIES.map((c) => {
      const [x, y] = project(c.lon, c.lat, w, h);
      return { x, y, r: 2, maxR: 10 + c.ubiRecipients / 12_000, color: povertyColor(c.povertyIndex) };
    });
  }, []);

  useEffect(() => {
    layout();
    window.addEventListener("resize", layout);
    return () => window.removeEventListener("resize", layout);
  }, [layout]);

  useEffect(() => {
    const latest = txs[0];
    if (!latest) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const [fx, fy] = project(CITIES[latest.fromIdx].lon, CITIES[latest.fromIdx].lat, canvas.offsetWidth, canvas.offsetHeight);
    const [tx, ty] = project(CITIES[latest.toIdx].lon, CITIES[latest.toIdx].lat, canvas.offsetWidth, canvas.offsetHeight);
    arcs.current.push({
      fx,
      fy,
      tx,
      ty,
      t: 0,
      speed: 0.003 + Math.random() * 0.005,
      color: txColor(latest.type),
      type: latest.type,
    });
    if (arcs.current.length > 48) arcs.current.splice(0, arcs.current.length - 48);
  }, [txs]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const draw = () => {
      frame.current += 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.save();
      ctx.translate(pan.current.x, pan.current.y);
      ctx.scale(zoom, zoom);
      if (satellite) {
        ctx.fillStyle = "#050d08";
        ctx.fillRect(-pan.current.x / zoom, -pan.current.y / zoom, w / zoom, h / zoom);
      } else {
        ctx.fillStyle = "#020408";
        ctx.fillRect(-pan.current.x / zoom, -pan.current.y / zoom, w / zoom, h / zoom);
      }

      ctx.strokeStyle = satellite ? "#0a2a14" : "#0a2030";
      ctx.lineWidth = 1 / zoom;
      for (let lon = -180; lon <= 180; lon += 30) {
        const [x] = project(lon, 0, w, h);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        const [, y] = project(0, lat, w, h);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const landFill = satellite ? "#0a2a14" : "#071018";
      const landStroke = satellite ? "#1a4a2a" : "#123040";
      ctx.fillStyle = landFill;
      ctx.strokeStyle = landStroke;
      ctx.lineWidth = 0.6 / zoom;
      for (const [lon, lat] of LAND) {
        const [x, y] = project(lon, lat, w, h);
        ctx.beginPath();
        ctx.arc(x, y, satellite ? 1.8 : 1.35, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const arc of arcs.current) {
        arc.t += arc.speed;
        const t = Math.min(1, arc.t);
        const mx = (arc.fx + arc.tx) / 2;
        const my = (arc.fy + arc.ty) / 2 - Math.hypot(arc.tx - arc.fx, arc.ty - arc.fy) * 0.22;
        ctx.beginPath();
        ctx.moveTo(arc.fx, arc.fy);
        ctx.quadraticCurveTo(mx, my, arc.tx, arc.ty);
        ctx.strokeStyle = arc.color + "55";
        ctx.lineWidth = 1.4 / zoom;
        ctx.stroke();
        const p = t;
        const ax = (1 - p) * (1 - p) * arc.fx + 2 * (1 - p) * p * mx + p * p * arc.tx;
        const ay = (1 - p) * (1 - p) * arc.fy + 2 * (1 - p) * p * my + p * p * arc.ty;
        ctx.fillStyle = arc.color;
        ctx.beginPath();
        ctx.arc(ax, ay, 2.2 / zoom, 0, Math.PI * 2);
        ctx.fill();
      }
      arcs.current = arcs.current.filter((a) => a.t < 1.15);

      cityPts.current.forEach((pt, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(frame.current * 0.04 + i);
        const r = 2.4 + pulse * 2.2;
        if (povertyOn) {
          ctx.fillStyle = pt.color + "22";
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.maxR * (0.55 + pulse * 0.25), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = povertyOn ? pt.color : "#00d4ff";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r / zoom, 0, Math.PI * 2);
        ctx.fill();
      });

      const track = issTrack();
      ctx.beginPath();
      ctx.strokeStyle = "#00d4ff44";
      ctx.lineWidth = 1 / zoom;
      let lastLon: number | null = null;
      for (const p of track) {
        const [x, y] = project(p.lon, p.lat, w, h);
        if (lastLon !== null && Math.abs(p.lon - lastLon) > 80) {
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x, y);
        } else if (lastLon === null) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        lastLon = p.lon;
      }
      ctx.stroke();

      const fix = issPosition();
      const [ix, iy] = project(fix.lon, fix.lat, w, h);
      ctx.fillStyle = "#00d4ff";
      ctx.beginPath();
      ctx.moveTo(ix, iy - 5 / zoom);
      ctx.lineTo(ix + 4 / zoom, iy);
      ctx.lineTo(ix, iy + 5 / zoom);
      ctx.lineTo(ix - 4 / zoom, iy);
      ctx.closePath();
      ctx.fill();
      ctx.font = `${10 / zoom}px ui-monospace, monospace`;
      ctx.fillStyle = "#7ee8ff";
      ctx.fillText("ISS", ix + 6 / zoom, iy - 4 / zoom);

      const mesh = xsatMesh();
      const over = new Set(xsatOverJapan(mesh).map((s) => s.id));
      for (const sat of mesh) {
        const [sx, sy] = project(sat.lon, sat.lat, w, h);
        const hot = over.has(sat.id);
        ctx.fillStyle = hot ? "#f5c542" : "#f5c54288";
        ctx.beginPath();
        ctx.arc(sx, sy, (hot ? 2.4 : 1.5) / zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [zoom, satellite, povertyOn]);

  const pickCity = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left - pan.current.x) / zoom;
    const y = (clientY - rect.top - pan.current.y) / zoom;
    let best: City | null = null;
    let bestD = 16 / zoom;
    cityPts.current.forEach((pt, i) => {
      const d = Math.hypot(pt.x - x, pt.y - y);
      if (d < bestD) {
        bestD = d;
        best = CITIES[i];
      }
    });
    setSelected(best);
  };

  return (
    <div ref={wrapRef} className="relative h-full min-h-0 w-full overflow-hidden bg-bg">
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none"
        onPointerDown={(e) => {
          (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, px: pan.current.x, py: pan.current.y };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          pan.current = {
            x: drag.current.px + (e.clientX - drag.current.x),
            y: drag.current.py + (e.clientY - drag.current.y),
          };
        }}
        onPointerUp={(e) => {
          if (!drag.current) return;
          const moved = Math.hypot(e.clientX - drag.current.x, e.clientY - drag.current.y);
          drag.current = null;
          if (moved < 6) pickCity(e.clientX, e.clientY);
        }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-bg/80 to-transparent" />

      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 font-mono text-[10px] tracking-wide">
        <button
          type="button"
          onClick={() => setSatellite((v) => !v)}
          className="rounded-sm border border-border bg-surface/90 px-2 py-1.5 text-dim backdrop-blur-sm hover:text-accent"
        >
          {satellite ? t(lang, "satellite") : t(lang, "normal_map")}
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(3.2, z + 0.25))}
          className="rounded-sm border border-border bg-surface/90 px-2 py-1.5 text-dim hover:text-accent"
          aria-label={t(lang, "zoom_in")}
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.7, z - 0.25))}
          className="rounded-sm border border-border bg-surface/90 px-2 py-1.5 text-dim hover:text-accent"
          aria-label={t(lang, "zoom_out")}
        >
          −
        </button>
        <button
          type="button"
          onClick={() => {
            setZoom(1);
            pan.current = { x: 0, y: 0 };
          }}
          className="rounded-sm border border-border bg-surface/90 px-2 py-1.5 text-dim hover:text-accent"
        >
          ↺
        </button>
        <button
          type="button"
          onClick={() => setPovertyOn((v) => !v)}
          className={`rounded-sm border px-2 py-1.5 backdrop-blur-sm ${
            povertyOn ? "border-accent/60 bg-accent/10 text-accent" : "border-border bg-surface/90 text-dim"
          }`}
        >
          {t(lang, "poverty_map")}
        </button>
        <span className="rounded-sm border border-border bg-surface/90 px-2 py-1.5 text-muted tabular">
          ×{zoom.toFixed(1)}
        </span>
      </div>

      <div className="absolute bottom-3 left-3 z-10 flex gap-3 font-mono text-[9px] text-muted">
        <span className="flex items-center gap-1">
          <i className="inline-block size-1.5 rounded-full bg-accent" /> UBI
        </span>
        <span className="flex items-center gap-1">
          <i className="inline-block size-1.5 rounded-full bg-bank" /> {lang === "en" ? "Bank" : "入金"}
        </span>
        <span className="flex items-center gap-1">
          <i className="inline-block size-1.5 rounded-full bg-labor" /> {lang === "en" ? "Labor" : "労働"}
        </span>
        <span className="flex items-center gap-1">
          <i className="inline-block size-1.5 rounded-full bg-danger" /> {lang === "en" ? "Flagged" : "不審"}
        </span>
        <span className="flex items-center gap-1 text-accent">
          ◆ ISS
        </span>
        <span className="flex items-center gap-1 text-alert">
          ● X AI1
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10 max-w-[220px] rounded-md border border-accent/30 bg-surface/90 p-2 font-mono text-[10px] backdrop-blur-sm">
        <div className="tracking-[0.16em] text-muted">{lang === "en" ? "ORBITAL REPLICA" : "軌道複製（ISS）"}</div>
        <div className="mt-0.5 tabular text-accent">
          {iss.lat.toFixed(1)}° {iss.lon.toFixed(1)}° · {iss.altKm}km
        </div>
        <div className={iss.inView ? "text-ok" : "text-dim"}>
          {iss.inView
            ? lang === "en"
              ? `AOS ${stationName(iss.stationId, lang)} · snapshot`
              : `AOS ${stationName(iss.stationId, lang)} · スナップショット`
            : lang === "en"
              ? "LOS · delay-tolerant, not primary"
              : "LOS · 遅延耐性。主系ではない"}
        </div>
        <div className="mt-2 tracking-[0.16em] text-muted">{lang === "en" ? "X AI1 EDGE" : "X軌道エッジ"}</div>
        <div className="tabular text-alert">
          {AI1_ALT_KM}km · {xsat.inView}/{xsat.birds} {lang === "en" ? "over JP" : "日本上空"}
        </div>
        <div className="text-dim">
          {lang === "en"
            ? "Design orbit · first launch ~2027-12 · not the ledger"
            : "設計軌道 · 初号機 2027-12頃 · 台帳ではない"}
        </div>
      </div>

      {selected ? (
        <div className="absolute top-14 right-3 z-10 w-[220px] rounded-md border border-border bg-surface/95 p-3 font-mono shadow-[0_0_0_1px_rgba(0,212,255,0.08)] backdrop-blur-md">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <div className="text-sm font-semibold text-fg">{cityName(selected, lang)}</div>
              <div className="text-[10px] tracking-widest text-muted">{selected.code}</div>
            </div>
            <button type="button" className="text-muted hover:text-fg" onClick={() => setSelected(null)}>
              ×
            </button>
          </div>
          <dl className="grid grid-cols-[1fr_auto] gap-y-1 text-[10px]">
            <dt className="text-muted">{lang === "en" ? "Poverty" : "貧困指数"}</dt>
            <dd className="tabular" style={{ color: povertyColor(selected.povertyIndex) }}>
              {(selected.povertyIndex * 100).toFixed(0)}%
            </dd>
            <dt className="text-muted">{lang === "en" ? "Recipients" : "受給"}</dt>
            <dd className="tabular text-accent">{compactNumber(selected.ubiRecipients)}</dd>
            <dt className="text-muted">{lang === "en" ? "Income" : "月収"}</dt>
            <dd className="tabular text-dim">${selected.avgIncome.toLocaleString()}</dd>
            <dt className="text-muted">GDP/cap</dt>
            <dd className="tabular text-dim">${compactNumber(selected.gdpPerCapita)}</dd>
          </dl>
          {BANK_COUNTRIES.some((c) => c.code === selected.code) ? (
            <Link to="/banks" className="mt-3 block text-[11px] text-accent">
              {lang === "en" ? "Deposit from this country's banks →" : "この国の銀行から入金 →"}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
