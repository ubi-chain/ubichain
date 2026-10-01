import { Wrench } from "lucide-react";
import { appVersion, maintenanceNotes, writeSeenVersion } from "@/lib/ubi/maintain";
import { useUbi } from "@/lib/ubi/store";

export function MaintenanceUpdate() {
  const { lang, learn, seenVersion, dismissMaintenance, triggerSync } = useUbi();
  const version = appVersion(learn.cycle);
  if (seenVersion === version) return null;
  const en = lang === "en";
  const notes = maintenanceNotes(learn);

  const apply = () => {
    writeSeenVersion(version);
    dismissMaintenance(version);
    triggerSync();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-bg/70 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-xl border border-accent/40 bg-surface p-5 font-mono">
        <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted">
          <Wrench className="size-3.5 text-accent" />
          {en ? "MAINTENANCE UPDATE" : "メンテナンス更新"}
        </div>
        <h2 className="mt-2 text-lg font-semibold text-fg">
          {en ? `UBICHAIN ${version}` : `UBICHAIN ${version} を適用`}
        </h2>
        <p className="mt-1 text-[11px] leading-relaxed text-dim">
          {en
            ? `Nightly maintenance (00:05 JST) trained the model. Today also pulses every 30 minutes. Cycle ${learn.cycle} · ${learn.day}`
            : `夜間メンテナンス（0:05 JST）に加え、本日は30分ごとに更新します。サイクル ${learn.cycle} · ${learn.day}`}
        </p>
        <ul className="mt-3 space-y-1.5 text-[11px] leading-relaxed text-fg">
          {notes.slice(0, 5).map((row, i) => (
            <li key={`${row.id}-${i}`} className="border-l-2 border-accent/50 pl-2 text-dim">
              {en ? row.en : row.ja}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={apply}
          className="mt-4 h-11 w-full rounded-md bg-accent text-[12px] font-semibold text-bg"
        >
          {en ? "Apply update" : "アップデートを適用"}
        </button>
      </div>
    </div>
  );
}
