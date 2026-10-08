import { useEffect, useRef, useState } from "react";
import { t, type Lang } from "@/lib/ubi/i18n";

export function BootSplash({ lang, onDone }: { lang: Lang; onDone: () => void }) {
  const [fade, setFade] = useState(false);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    setFade(true);
    window.setTimeout(onDone, 380);
  };

  useEffect(() => {
    if (sessionStorage.getItem("ubichain.boot-skip") === "1") {
      finish();
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = window.setTimeout(finish, reduced ? 2800 : 7200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div
      data-boot="1"
      className={`fixed inset-0 z-[8000] bg-bg transition-opacity duration-300 ${
        fade ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="IETFUBI"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <img src="/ubi-logo.svg" alt="UBI — 水平な天秤" className="w-48 sm:w-64" width="160" height="160" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[38%] bg-linear-to-b from-bg from-55% to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-bg/55" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-20">
        <div className="grid size-12 place-items-center rounded-xl bg-bg font-mono text-xl font-bold text-accent ring-1 ring-accent/50">
          <img src="/ubi-logo.svg" alt="UBI" width="48" height="48" />
        </div>
        <div className="mt-3 font-mono text-lg font-semibold tracking-[0.28em] text-fg">IETFUBI</div>
        <div className="mt-1 font-mono text-[11px] tracking-widest text-accent">{t(lang, "tagline")}</div>
        <div className="mt-6 h-0.5 w-40 overflow-hidden rounded-full bg-border">
          <div className="boot-bar h-full origin-left bg-accent" />
        </div>
        <button
          type="button"
          onClick={finish}
          className="mt-4 h-11 px-5 font-mono text-[11px] tracking-widest text-muted hover:text-fg"
        >
          {t(lang, "skip")}
        </button>
      </div>
    </div>
  );
}