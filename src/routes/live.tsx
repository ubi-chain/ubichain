import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DeskFrame } from "@/components/desk-frame";
import { segmentAt } from "@/lib/ubi/broadcast";
import { tx } from "@/lib/ubi/i18n";
import { useUbi } from "@/lib/ubi/store";

export const Route = createFileRoute("/live")({ component: LivePage });

function LivePage() {
  const lang = useUbi((s) => s.lang);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const { seg, index, next } = segmentAt(now);
  const remain = Math.ceil(next / 1000);

  return (
    <DeskFrame
      lang={lang}
      kicker={tx(lang, { ja: "共産主義者通信委員会 · 生放送", en: "Communist Correspondence Committee · live", fr: "Comité de correspondance · direct" })}
      title={tx(lang, { ja: "放送", en: "Broadcast", fr: "Diffusion" })}
      lede={tx(lang, {
        ja: "ブリュッセル拠点。フランス語でも読めます。私的な予定は扱いません。",
        en: "Based in Brussels. Readable in French. No private schedules.",
        fr: "Basé à Bruxelles. Lisible en français. Pas d'agendas privés.",
      })}
    >
      <div className="p-4">
        <div className="overflow-hidden rounded-sm border border-border bg-bg">
          <div className="flex items-center justify-between border-b border-border bg-surface px-3 py-2 text-[10px] tracking-widest">
            <span className="text-danger">LIVE</span>
            <span className="text-muted">
              {index + 1}/5 · {remain}s
            </span>
          </div>
          <div className="relative aspect-video bg-panel">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  "repeating-linear-gradient(180deg, transparent 0 3px, color-mix(in oklab, var(--color-accent) 12%, transparent) 3px 4px)",
              }}
            />
            <div className="absolute inset-0 flex flex-col justify-end p-4">
              <div className="text-[10px] tracking-[0.2em] text-accent">
                {tx(lang, { ja: seg.topicJa, en: seg.topicEn, fr: seg.topicFr })}
              </div>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-fg">
                {tx(lang, { ja: seg.ja, en: seg.en, fr: seg.fr })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DeskFrame>
  );
}
