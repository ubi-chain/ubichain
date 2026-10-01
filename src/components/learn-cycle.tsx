import { Brain } from "lucide-react";
import { useEffect, useState } from "react";
import { isPulseDay, msUntilNextPulse, type LearnCycle } from "@/lib/ubi/learn";
import type { Lang } from "@/lib/ubi/i18n";

function formatRemain(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h === 0) return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function LearnCyclePanel({ lang, cycle, compact }: { lang: Lang; cycle: LearnCycle; compact?: boolean }) {
  const en = lang === "en";
  const [remain, setRemain] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setRemain(msUntilNextPulse());
    tick();
    const id = setInterval(tick, isPulseDay() ? 1000 : 30_000);
    return () => clearInterval(id);
  }, []);
  const tone = (t: LearnCycle["insights"][number]["tone"]) =>
    t === "alert" ? "text-danger" : t === "warn" ? "text-alert" : "text-ok";

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 font-mono text-[10px] text-accent">
        <Brain className="size-3" />
        {en ? `CYCLE ${cycle.cycle}` : `サイクル ${cycle.cycle}`}
        <span className="text-muted">
          {isPulseDay() ? (en ? `p${cycle.pulse ?? 0}` : `p${cycle.pulse ?? 0}`) : en ? "learned" : "学習済"}
        </span>
      </div>
    );
  }

  return (
    <section className="border-b border-border p-3">
      <div className="mb-1 flex items-center justify-between font-mono">
        <div className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-muted">
          <Brain className="size-3 text-accent" />
          {isPulseDay() ? (en ? "30-MIN UPDATE" : "30分更新") : en ? "DAILY LEARN" : "日次学習"}
        </div>
        <span className="text-[10px] tabular text-dim" suppressHydrationWarning>
          {en ? "next" : "次回"} {remain == null ? "--:--" : formatRemain(remain)}
        </span>
      </div>
      <div className="font-mono text-[13px] font-semibold text-accent">
        {en ? `Cycle ${cycle.cycle}` : `サイクル ${cycle.cycle}`} · v{cycle.version ?? `1.${cycle.cycle}.0`}
      </div>
      <ul className="mt-2 space-y-1.5">
        {cycle.insights.map((row, i) => (
          <li key={`${row.id}-${i}`} className={`font-mono text-[10px] leading-relaxed ${tone(row.tone)}`}>
            {en ? row.en : row.ja}
          </li>
        ))}
      </ul>
    </section>
  );
}
