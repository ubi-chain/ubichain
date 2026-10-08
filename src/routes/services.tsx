import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useUbi } from "@/lib/ubi/store";

export const Route = createFileRoute("/services")({ component: ServicesPage });

const ZONES = [
  { name: "北圃", color: "#3dd6c6", note: "収穫 10月下旬" },
  { name: "東圃", color: "#7CFF6B", note: "降水 多" },
  { name: "南圃", color: "#E6C35C", note: "乾燥" },
  { name: "西圃", color: "#6AA8FF", note: "標準" },
];

function ServicesPage() {
  const { lang, user } = useUbi();
  const en = lang === "en";
  if (!user) {
    return (
      <div className="p-4 font-mono text-[12px]">
        <p>{en ? "Sign in to open the free desks." : "無償デスクはログイン後に開きます。"}</p>
        <Link to="/register" className="mt-3 inline-block text-accent">{en ? "Sign in" : "ログイン"}</Link>
      </div>
    );
  }
  return (
    <div className="h-full overflow-y-auto font-mono">
      <div className="border-b border-border px-4 py-3">
        <div className="text-[10px] tracking-[0.2em] text-muted">{en ? "FREE · SIGNED IN" : "無償 · ログイン済み"}</div>
        <h1 className="text-xl text-fg">{en ? "Desks" : "デスク"}</h1>
      </div>
      <HyperMedic en={en} />
      <HyperOats en={en} />
      <HyperBuild en={en} />
      <IpDial en={en} />
    </div>
  );
}

const STAGES = [
  ["body", "全身", "Body"],
  ["layer", "MRI/CT", "MRI/CT"],
  ["k", "k空間", "k-space"],
  ["seg", "分割", "Segment"],
  ["plan", "計画", "Plans"],
  ["review", "執刀医", "Surgeon"],
] as const;

function HyperMedic({ en }: { en: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<(typeof STAGES)[number][0]>("body");
  const [layer, setLayer] = useState<"mri" | "ct">("mri");
  const [plan, setPlan] = useState<"a" | "b">("a");
  const [review, setReview] = useState<"open" | "held">("open");
  const [note, setNote] = useState("");
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let frame = 0;
    let dead = false;
    const start = performance.now();
    const loop = (now: number) => {
      if (dead) return;
      const ctx = el.getContext("2d");
      if (!ctx) return;
      const w = (el.width = el.clientWidth * 2);
      const h = (el.height = el.clientHeight * 2);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#020408";
      ctx.fillRect(0, 0, w, h);
      const t = (now - start) / 1000;
      if (stage === "k") {
        ctx.strokeStyle = "rgba(94,231,255,0.35)";
        for (let i = 0; i < 18; i++) {
          ctx.beginPath();
          ctx.moveTo(0, (i / 18) * h);
          ctx.lineTo(w, (i / 18) * h);
          ctx.stroke();
        }
        for (let k = 1; k < 8; k++) {
          const amp = (1 / k) * h * 0.28;
          ctx.strokeStyle = k === 1 ? "#5ee7ff" : "rgba(94,231,255,0.45)";
          ctx.beginPath();
          for (let x = 0; x < w; x += 4) {
            const y = h * 0.5 + Math.sin((x / w) * Math.PI * 2 * k + t) * amp;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else {
        ctx.strokeStyle = layer === "ct" ? "#d7e2ea" : "#5ee7ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(w * 0.5, h * 0.48, w * 0.16, h * 0.38, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.16, w * 0.07, 0, Math.PI * 2);
        ctx.stroke();
        if (stage === "seg" || stage === "plan") {
          ctx.fillStyle = plan === "a" ? "rgba(94,231,255,0.25)" : "rgba(230,195,92,0.28)";
          ctx.beginPath();
          ctx.ellipse(w * 0.46, h * 0.42, w * 0.05, h * 0.07, -0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(255,120,120,0.35)";
          ctx.beginPath();
          ctx.moveTo(w * 0.42, h * 0.5);
          ctx.bezierCurveTo(w * 0.5, h * 0.36, w * 0.62, h * 0.55, w * 0.48, h * 0.66);
          ctx.stroke();
        }
      }
      ctx.fillStyle = "#9ec9d4";
      ctx.font = "22px ui-monospace, monospace";
      ctx.fillText(stage === "k" ? "k-space demo" : layer === "ct" ? "CT layer demo" : "MRI layer demo", 16, 28);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      dead = true;
      cancelAnimationFrame(frame);
    };
  }, [stage, layer, plan]);
  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    const bmp = await createImageBitmap(file);
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(bmp, 0, 0, 64, 64);
    const row = ctx.getImageData(0, 32, 64, 1).data;
    const samples = Array.from({ length: 32 }, (_, i) => row[i * 4] ?? 0);
    const spec = samples.map((_, k) => {
      let re = 0;
      let im = 0;
      for (let n = 0; n < samples.length; n++) {
        const ang = (2 * Math.PI * k * n) / samples.length;
        re += samples[n]! * Math.cos(ang);
        im -= samples[n]! * Math.sin(ang);
      }
      return Math.hypot(re, im);
    });
    const peak = spec.indexOf(Math.max(...spec));
    setNote(en ? `Image-row bin ${peak}. Not anatomy, not a lesion.` : `画像の行の山 ${peak}。解剖でも病巣でもない。`);
  };
  return (
    <section className="border-b border-border px-4 py-4">
      <div className="text-[10px] tracking-[0.18em] text-warn">SIMULATION · RESEARCH · SURGEON DECIDES</div>
      <h2 className="text-accent">HYPER MEDIC</h2>
      <p className="mt-1 max-w-xl text-[12px] text-dim">
        {en
          ? "Whole-body digital twin desk for visualization and pre-op comparison. It does not operate, diagnose, or decide. A qualified surgeon owns the operation."
          : "全身のデジタルツインは可視化と比較だけ。手術はしない。診断も最終判断もしない。執刀と決定は有資格の執刀医。"}
      </p>
      <div className="mt-3 flex gap-1 overflow-x-auto">
        {STAGES.map(([id, ja, label]) => (
          <button key={id} type="button" onClick={() => setStage(id)} className={`min-h-11 shrink-0 border px-2 text-[11px] ${stage === id ? "border-accent text-accent" : "border-border text-dim"}`}>
            {en ? label : ja}
          </button>
        ))}
      </div>
      <canvas ref={canvas} className="mt-3 h-48 w-full border border-accent/40 bg-bg" />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="border border-border p-2 text-[12px]">
          <div className="text-muted">{en ? "Layer" : "層"}</div>
          <div className="mt-1 flex gap-2">
            {(["mri", "ct"] as const).map((id) => (
              <button key={id} type="button" onClick={() => setLayer(id)} className={`min-h-11 flex-1 border ${layer === id ? "border-accent text-accent" : "border-border text-dim"}`}>
                {id.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="mt-2 text-dim">{en ? "Demo slices. No DICOM is loaded." : "デモ断面。DICOMは読んでいない。"}</p>
        </div>
        <div className="border border-border p-2 text-[12px]">
          <div className="text-muted">{en ? "Approach" : "到達"}</div>
          <div className="mt-1 flex gap-2">
            {(["a", "b"] as const).map((id) => (
              <button key={id} type="button" onClick={() => setPlan(id)} className={`min-h-11 flex-1 border ${plan === id ? "border-accent text-accent" : "border-border text-dim"}`}>
                {id === "a" ? (en ? "Anterior" : "前方") : en ? "Lateral" : "側方"}
              </button>
            ))}
          </div>
          <p className="mt-2 text-dim">{en ? "Comparison only. Not an outcome." : "比較だけ。成績ではない。"}</p>
        </div>
      </div>
      <div className="mt-2 border border-border p-2 text-[12px]">
        <div className="text-fg">{en ? "Surgeon review" : "執刀医の確認"} · {review === "held" ? (en ? "held for a person" : "人が保留") : en ? "not approved" : "未承認"}</div>
        <button type="button" className="mt-2 min-h-11 border border-accent px-3 text-accent" onClick={() => setReview("held")}>
          {en ? "Hold for surgeon" : "執刀医待ちにする"}
        </button>
        <p className="mt-2 text-dim">{en ? "This button does not approve or perform surgery." : "このボタンは承認も執刀もしない。"}</p>
      </div>
      <p className="mt-3 text-[11px] text-dim">
        {en ? "Textbook 1H shifts on a demo axis. Not a hospital file." : "教科書の水素シフトをデモ軸に載せただけ。病院ファイルではない。"}
      </p>
      <ul className="mt-2 space-y-1 text-[12px] text-fg">
        <li>H₂O · 4.7 ppm</li>
        <li>fat CH₂ · 1.3 ppm</li>
      </ul>
      <label className="mt-3 block text-[12px] text-dim">
        {en ? "Photo (local spectrum)" : "写真（端末内のスペクトル）"}
        <input type="file" accept="image/*" className="mt-1 block text-fg" onChange={(e) => void onPhoto(e.target.files?.[0])} />
      </label>
      {note ? <p className="mt-2 text-[12px] text-accent">{note}</p> : null}
    </section>
  );
}

function HyperOats({ en }: { en: boolean }) {
  return (
    <section className="border-b border-border px-4 py-4">
      <h2 className="text-accent">HYPER OATS</h2>
      <p className="mt-1 max-w-xl text-[12px] text-dim">
        {en
          ? "Named color zones for a field. Timing notes are labels, not a live satellite feed and not a forecast product."
          : "圃場を色と名札で分ける。時期のメモはラベルであり、ライブ衛星でも予報商品でもない。"}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {ZONES.map((z) => (
          <div key={z.name} className="border border-border p-3" style={{ boxShadow: `inset 4px 0 0 ${z.color}` }}>
            <div className="text-[12px] text-fg">{z.name}</div>
            <div className="text-[11px] text-dim">{z.note}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HyperBuild({ en }: { en: boolean }) {
  const [tier, setTier] = useState("中");
  const [slot, setSlot] = useState("");
  return (
    <section className="px-4 py-4">
      <h2 className="text-accent">HYPER CONSTRUCTION</h2>
      <p className="mt-1 max-w-xl text-[12px] text-dim">
        {en
          ? "Assign a contract desk id across small, mid, and large firms. The id stays in this browser. No contract is filed."
          : "小・中・大の接続先番号を割り当てる。番号はこのブラウザだけ。契約の提出はしない。"}
      </p>
      <div className="mt-3 flex gap-2">
        {["小", "中", "大"].map((t) => (
          <button key={t} type="button" onClick={() => setTier(t)} className={`min-h-11 flex-1 border ${tier === t ? "border-accent text-accent" : "border-border text-dim"}`}>
            {t}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="mt-3 min-h-11 bg-accent px-4 text-bg"
        onClick={() => setSlot(`${tier}-${Math.random().toString(36).slice(2, 6)}`)}
      >
        {en ? "Assign" : "割り当てる"}
      </button>
      {slot ? <p className="mt-2 text-[12px] text-fg">{slot}</p> : null}
    </section>
  );
}

const DIAL = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function IpDial({ en }: { en: boolean }) {
  const [digits, setDigits] = useState("");
  const [state, setState] = useState("");
  const tap = (mark: string) => {
    const n = DIAL.indexOf(mark) + 1;
    const face = n === 10 ? "0" : n === 11 ? "*" : n === 12 ? "#" : String(n);
    setDigits((d) => (d + face).slice(0, 16));
  };
  return (
    <section className="border-t border-border px-4 py-4">
      <h2 className="text-accent">{en ? "IP DESK" : "IP デスク"}</h2>
      <p className="mt-1 max-w-xl text-[12px] text-dim">
        {en
          ? "A roman dial on this page. It does not place a call, record audio, or read a MAC address."
          : "このページのローマ数字ダイヤル。電話はつながらない。録音もしない。MACも見ない。"}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {DIAL.map((mark) => (
          <button key={mark} type="button" onClick={() => tap(mark)} className="min-h-11 border border-border text-fg">
            {mark}
          </button>
        ))}
      </div>
      <div className="mt-3 text-[12px] text-accent tabular">{digits || "—"}</div>
      <button
        type="button"
        className="mt-2 min-h-11 border border-accent px-4 text-accent"
        onClick={() =>
          setState(
            en
              ? "Shown here only. No line, no recording."
              : "画面に出しただけ。回線も録音もない。",
          )
        }
      >
        {en ? "Show" : "表示"}
      </button>
      {state ? <p className="mt-2 text-[12px] text-fg">{state}</p> : null}
    </section>
  );
}
