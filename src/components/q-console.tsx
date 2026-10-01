import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IetfDnsPanel } from "@/components/ietf-dns";
import { project } from "@/lib/ubi/cities";
import { issFootprint, issPosition, issTrack, type IssFix } from "@/lib/ubi/iss";
import type { Lang } from "@/lib/ubi/i18n";
import { useUbi } from "@/lib/ubi/store";

const LINKS = [
  { to: "/dns", ja: "DNS", en: "DNS" },
  { to: "/pay", ja: "Pay", en: "Pay" },
  { to: "/banks", ja: "入金", en: "Banks" },
  { to: "/international", ja: "綱領", en: "Charter" },
  { to: "/library", ja: "図書", en: "Library" },
  { to: "/live", ja: "放送", en: "Live" },
  { to: "/relief", ja: "救済", en: "Relief" },
  { to: "/payout", ja: "出金", en: "Payout" },
  { to: "/xrp", ja: "XRP", en: "XRP" },
  { to: "/earth", ja: "衛星", en: "Earth" },
  { to: "/news", ja: "ニュース", en: "News" },
  { to: "/me", ja: "マイページ", en: "Me" },
] as const;

function landDots() {
  const boxes: [number, number, number, number][] = [
    [-10, 60, 35, 70],
    [-18, 50, -35, 37],
    [25, 180, 5, 75],
    [100, 155, -45, -10],
    [-170, -50, 15, 72],
    [-80, -35, -55, 12],
  ];
  let seed = 14014;
  const rand = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) | 0;
    return ((seed >>> 0) % 1000) / 1000;
  };
  const out: [number, number][] = [];
  for (const [lon0, lon1, lat0, lat1] of boxes) {
    for (let lon = lon0; lon <= lon1; lon += 3.2) {
      for (let lat = lat0; lat <= lat1; lat += 2.8) {
        if (rand() < 0.62) out.push([lon, lat]);
      }
    }
  }
  return out;
}

const LAND = landDots();

function fmt(n: number, digits: number) {
  const sign = n < 0 ? "-" : "+";
  return sign + Math.abs(n).toFixed(digits);
}

function hexLine(fix: IssFix, seq: number) {
  const lat = Math.round(fix.lat * 100) & 0xffff;
  const lon = Math.round(fix.lon * 100) & 0xffff;
  const alt = Math.round(fix.altKm) & 0xffff;
  const words = [seq & 0xffff, 0x1550, lat, lon, alt, (seq * 17) & 0xffff];
  return words.map((w) => w.toString(16).padStart(4, "0")).join(" ").toUpperCase();
}

function drawMap(canvas: HTMLCanvasElement, fix: IssFix) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  if (w < 2 || h < 2) return;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#020408";
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "#123848";
  ctx.lineWidth = 1;
  const cols = 18;
  const rows = 10;
  for (let i = 0; i <= cols; i++) {
    const x = (i / cols) * w;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let i = 0; i <= rows; i++) {
    const y = (i / rows) * h;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#0c3044";
  for (const [lon, lat] of LAND) {
    const [x, y] = project(lon, lat, w, h);
    ctx.fillRect(x, y, 2.2, 2.2);
  }

  const track = issTrack();
  ctx.beginPath();
  ctx.strokeStyle = "#00d4ff55";
  ctx.lineWidth = 1.25;
  let prev: number | null = null;
  for (const p of track) {
    const [x, y] = project(p.lon, p.lat, w, h);
    if (prev !== null && Math.abs(p.lon - prev) > 40) {
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (prev === null) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
    prev = p.lon;
  }
  ctx.stroke();

  const ring = issFootprint(fix);
  ctx.beginPath();
  ctx.fillStyle = "#00d4ff18";
  ctx.strokeStyle = "#00d4ff";
  ctx.lineWidth = 1.4;
  let open = false;
  let lastLon: number | null = null;
  const flush = () => {
    if (!open) return;
    ctx.stroke();
    ctx.beginPath();
    open = false;
  };
  for (const p of ring) {
    const [x, y] = project(p.lon, p.lat, w, h);
    if (lastLon !== null && Math.abs(p.lon - lastLon) > 35) flush();
    if (!open) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      open = true;
    } else ctx.lineTo(x, y);
    lastLon = p.lon;
  }
  flush();

  const [ix, iy] = project(fix.lon, fix.lat, w, h);
  ctx.strokeStyle = "#00d4ff66";
  ctx.beginPath();
  ctx.arc(ix, iy, 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#00d4ff";
  ctx.beginPath();
  ctx.moveTo(ix, iy - 7);
  ctx.lineTo(ix + 5, iy);
  ctx.lineTo(ix, iy + 7);
  ctx.lineTo(ix - 5, iy);
  ctx.closePath();
  ctx.fill();
  ctx.font = "11px IBM Plex Mono, ui-monospace, monospace";
  ctx.fillStyle = "#c8e6f0";
  ctx.fillText("ISS", ix + 10, iy - 8);
}

export function QConsole() {
  const lang = useUbi((s) => s.lang);
  const setLang = useUbi((s) => s.setLang);
  const user = useUbi((s) => s.user);
  const en = lang === "en";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fix, setFix] = useState<IssFix | null>(null);
  const [seq, setSeq] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [menu, setMenu] = useState(false);
  const [dnsOpen, setDnsOpen] = useState(false);

  useEffect(() => {
    const paint = () => {
      const next = issPosition();
      setFix(next);
      setSeq((n) => n + 1);
      const canvas = canvasRef.current;
      if (canvas) drawMap(canvas, next);
    };
    paint();
    const id = window.setInterval(paint, 1000);
    const onResize = () => {
      const canvas = canvasRef.current;
      if (canvas) drawMap(canvas, issPosition());
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const line = !fix
      ? ""
      : en
        ? `EPHEMERIS ${fmt(fix.lat, 2)} ${fmt(fix.lon, 2)} ALT ${fix.altKm.toFixed(0)}  NO-UPLINK`
        : `公開軌道 ${fmt(fix.lat, 2)} ${fmt(fix.lon, 2)} 高度 ${fix.altKm.toFixed(0)}  操縦なし`;
    if (!line) return;
    setLog((rows) => [line, ...rows].slice(0, 8));
  }, [seq, en, fix]);

  const cycleLabel = "0011";

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg text-fg">
      <header className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="min-w-0 leading-tight">
          <div className="font-mono text-[10px] tracking-[0.28em] text-accent">IETFUBI</div>
          <div className="truncate font-mono text-[11px] text-dim">
            {en ? "PUBLIC ISS POSITION · SIMULATION" : "公開ISS位置 · シミュレーション"}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <div className="flex overflow-hidden border border-border font-mono text-[10px]">
            {(["ja", "en", "zh", "fr"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l as Lang)}
                className={`min-h-11 px-2 uppercase ${lang === l ? "bg-accent/15 text-accent" : "text-muted"}`}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setMenu(true)}
            className="grid size-11 place-items-center text-dim"
            aria-label={en ? "Menu" : "メニュー"}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(220px,1fr)_168px] lg:grid-cols-[220px_minmax(0,1fr)_280px] lg:grid-rows-[minmax(0,1fr)]">
        <aside className="border-b border-border px-3 py-2 lg:border-r lg:border-b-0">
          <div className="font-mono text-[10px] tracking-[0.22em] text-accent">ASSET</div>
          <dl className="mt-2 grid grid-cols-3 gap-2 lg:grid-cols-1">
            <Stat k="LAT" v={fix ? fmt(fix.lat, 3) : "—"} />
            <Stat k="LON" v={fix ? fmt(fix.lon, 3) : "—"} />
            <Stat k="ALT" v={fix ? `${fix.altKm.toFixed(0)} km` : "—"} />
          </dl>
          <Link to="/earth" className="mt-2 block border border-border bg-panel px-2 py-1.5">
            <div className="font-mono text-[9px] tracking-[0.18em] text-muted">{en ? "ORBITAL DESK" : "軌道デスク"}</div>
            <div className="font-mono text-[11px] text-accent">{en ? "Public ephemeris" : "公開軌道を開く"}</div>
            <div className="font-mono text-[9px] text-muted">{en ? "Not a locator. Not live video." : "位置特定ではない。生中継ではない。"}</div>
          </Link>
          <p className="mt-2 hidden font-mono text-[10px] leading-relaxed text-muted lg:block">
            {en
              ? "One public geometric model of the ISS. No command uplink, no intercept, no target tracking."
              : "ISS の公開幾何モデルが1機だけです。操縦アップリンク、傍受、対象追跡はしません。"}
          </p>
        </aside>

        <div className="relative min-h-[240px] lg:min-h-0">
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          <div className="pointer-events-none absolute bottom-2 left-2 font-mono text-[10px] tracking-[0.16em] text-accent">
            {en ? "FOOTPRINT · HORIZON ONLY" : "フットプリント · 地平圏のみ"}
          </div>
        </div>

        <aside className="grid min-h-0 grid-cols-2 overflow-hidden border-t border-border lg:grid-cols-1 lg:grid-rows-2 lg:border-t-0 lg:border-l">
          <div className="min-h-0 overflow-hidden border-b border-border px-3 py-2">
            <div className="font-mono text-[10px] tracking-[0.22em] text-accent">COMMS</div>
            <ul className="mt-1 space-y-1 overflow-hidden">
              {log.map((row, i) => (
                <li key={`${row}-${i}`} className="truncate font-mono text-[10px] text-dim">
                  {row}
                </li>
              ))}
            </ul>
          </div>
          <div className="min-h-0 overflow-hidden px-3 py-2">
            <div className="font-mono text-[10px] tracking-[0.22em] text-accent">HEX</div>
            <p className="mt-1 font-mono text-[10px] text-muted">{en ? "LOCAL PACK · NOT A CAPTURE" : "ローカルパック · 傍受ではない"}</p>
            <div className="mt-1 space-y-1">
              {fix
                ? Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="truncate font-mono text-[11px] text-fg">
                      {hexLine(fix, seq + i)}
                    </div>
                  ))
                : null}
            </div>
          </div>
        </aside>
      </div>

      <footer className="flex shrink-0 items-end justify-between gap-3 border-t border-accent/40 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div>
          <div className="font-mono text-[10px] tracking-[0.28em] text-muted">CYCLE</div>
          <div className="font-mono text-3xl leading-none text-accent tabular">{cycleLabel}</div>
        </div>
        <button
          type="button"
          onClick={() => setDnsOpen(true)}
          className="min-h-11 max-w-[60%] border border-border px-3 text-left font-mono text-[10px] text-dim"
        >
          <span className="block tracking-[0.16em] text-alert">ietfubi.com</span>
          {en ? "VERIFY PENDING · DNS GUIDE" : "検証保留 · DNS案内"}
        </button>
      </footer>

      {dnsOpen ? (
        <div className="fixed inset-0 z-40 bg-bg/80" onClick={() => setDnsOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 max-h-[86%] overflow-y-auto border-t border-accent/40 bg-bg p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex justify-end">
              <button type="button" onClick={() => setDnsOpen(false)} className="grid size-11 place-items-center text-dim" aria-label={en ? "Close" : "閉じる"}>
                <X className="size-5" />
              </button>
            </div>
            <IetfDnsPanel lang={lang} />
          </div>
        </div>
      ) : null}

      {menu ? (
        <div className="fixed inset-0 z-40 bg-bg/80" onClick={() => setMenu(false)}>
          <div className="absolute top-0 right-0 flex h-full w-[min(100%,280px)] flex-col border-l border-border bg-bg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="font-mono text-[10px] tracking-[0.22em] text-accent">DESK</span>
              <button type="button" onClick={() => setMenu(false)} className="grid size-11 place-items-center text-dim" aria-label={en ? "Close" : "閉じる"}>
                <X className="size-5" />
              </button>
            </div>
            {user ? (
              LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenu(false)}
                  className="border-t border-border px-4 py-3 font-mono text-[13px] text-fg"
                >
                  {en ? item.en : item.ja}
                </Link>
              ))
            ) : (
              <Link to="/register" onClick={() => setMenu(false)} className="border-t border-border px-4 py-3 font-mono text-[13px] text-accent">
                {en ? "Sign in" : "ログイン"}
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="border border-border bg-panel px-2 py-1.5">
      <div className="font-mono text-[9px] tracking-[0.18em] text-muted">{k}</div>
      <div className="font-mono text-sm text-accent tabular">{v}</div>
    </div>
  );
}
