import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { drawMap } from "@/components/q-console";
import { issPosition, type IssFix } from "@/lib/ubi/iss";

const BOOT = ["/boot", "/map", "/iss", "/honeycomb"];

function hexLine(fix: IssFix, seq: number) {
  const lat = Math.round(fix.lat * 100) & 0xffff;
  const lon = Math.round(fix.lon * 100) & 0xffff;
  const alt = Math.round(fix.altKm) & 0xffff;
  const words = [seq & 0xffff, 0x1550, lat, lon, alt, (seq * 17) & 0xffff];
  return (
    "/" +
    words
      .map((w) => w.toString(16).padStart(4, "0"))
      .join(" ")
      .toUpperCase()
  );
}

function drawHexField(canvas: HTMLCanvasElement, t: number, reduced: boolean) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  if (w < 2 || h < 2) return;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const size = w < 700 ? 16 : 22;
  const ox = w - (w < 700 ? 28 : 250);
  const oy = h - (w < 700 ? 120 : 160);
  const cols = Math.ceil(w / (size * 1.5)) + 2;
  const rows = Math.ceil(h / (size * Math.sqrt(3))) + 2;

  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const x = col * size * 1.5;
      const y = row * size * Math.sqrt(3) + (col % 2 ? size * 0.866 : 0);
      const dist = Math.hypot(x - ox, y - oy);
      const keep = dist < 220 || ((col * 17 + row * 13) & 7) === 0;
      if (!keep) continue;
      const delay = reduced ? 0 : Math.min(dist, 520) * 2.2;
      const p = reduced ? 1 : Math.max(0, Math.min(1, (t - delay) / 420));
      if (p <= 0) continue;
      const ease = 1 - (1 - p) ** 3;
      const r = size * 0.46 * ease;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 6 + (i * Math.PI) / 3;
        const px = x + Math.cos(a) * r;
        const py = y + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(0, 212, 255, ${0.16 + ease * 0.55})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

export function CuiHex() {
  const mapRef = useRef<HTMLCanvasElement>(null);
  const hexRef = useRef<HTMLCanvasElement>(null);
  const [title, setTitle] = useState("/");
  const [done, setDone] = useState<string[]>([]);
  const [live, setLive] = useState("");
  const queue = useRef<string[]>([...BOOT]);
  const built = useRef("");
  const titleDone = useRef(false);

  useEffect(() => {
    let fix = issPosition();
    const paint = () => {
      const canvas = mapRef.current;
      if (canvas) drawMap(canvas, fix);
    };
    paint();
    const id = window.setInterval(() => {
      fix = issPosition();
      paint();
      const line = hexLine(fix, Math.floor(performance.now() / 1000));
      if (!queue.current.includes(line)) queue.current.push(line);
    }, 1000);
    const onResize = () => paint();
    window.addEventListener("resize", onResize);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      titleDone.current = true;
      setTitle("/cuiHEX");
      setDone(BOOT);
      setLive(hexLine(issPosition(), 1));
      return;
    }
    const id = window.setInterval(() => {
      if (!titleDone.current) {
        const full = "/cuiHEX";
        const next = full.slice(0, Math.max(built.current.length, 1) + 1);
        built.current = next;
        setTitle(next);
        if (next === full) {
          titleDone.current = true;
          built.current = "/";
          setLive("/");
        }
        return;
      }
      const line = queue.current[0];
      if (!line) return;
      if (!line.startsWith(built.current)) built.current = "/";
      if (built.current.length < line.length) {
        built.current = line.slice(0, built.current.length + 1);
        setLive(built.current);
        return;
      }
      queue.current.shift();
      setDone((rows) => [...rows, line].slice(-6));
      built.current = "/";
      setLive("/");
    }, 28);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const canvas = hexRef.current;
    if (!canvas) return;
    let frame = 0;
    const started = performance.now();
    const loop = (now: number) => {
      drawHexField(canvas, reduced ? 9999 : now - started, reduced);
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-bg text-fg">
      <canvas
        ref={mapRef}
        className="absolute inset-0 h-full w-full"
        aria-label="public ISS map"
      />
      <canvas
        ref={hexRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <section className="cui-hex-panel absolute right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 z-10 font-mono sm:left-auto sm:w-[min(28rem,46vw)]">
        <h1 className="pointer-events-none text-sm tracking-[0.28em] text-accent">
          {title}
        </h1>
        <ul className="mt-2 space-y-1 text-[12px] leading-relaxed text-fg">
          {done.map((row) => (
            <li key={row} className="truncate">
              {row}
            </li>
          ))}
          <li className="pointer-events-none truncate text-accent">
            {live}
            <span className="cui-caret" />
          </li>
        </ul>
        <Link
          to="/register"
          className="mt-4 inline-flex min-h-11 items-center rounded-sm border border-accent/60 bg-accent/10 px-4 text-[12px] tracking-widest text-accent hover:bg-accent/20"
        >
          登録・ログイン →
        </Link>
      </section>
    </div>
  );
}
