import { useEffect, useRef, useState } from "react";
import { t, type Lang } from "@/lib/ubi/i18n";

export function BootSplash({ lang, onDone }: { lang: Lang; onDone: () => void }) {
  const [fade, setFade] = useState(false);
  const done = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
    if (reduced && videoRef.current) {
      videoRef.current.pause();
    }
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
      <video
        ref={videoRef}
        className="absolute inset-0 size-full object-cover"
        src="/boot.mp4?v=3"
        poster="/boot-poster.jpg?v=3"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={(e) => {
          if (e.currentTarget.currentTime < 1.5) return;
          finish();
        }}
        onError={() => finish()}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[38%] bg-linear-to-b from-bg from-55% to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-bg/55" />
      <img
        src="/loading-emblem.png"
        alt=""
        aria-hidden="true"
        className="boot-emblem pointer-events-none absolute left-1/2 top-[42%] w-[min(76vw,34rem)] -translate-x-1/2 -translate-y-1/2 object-contain"
      />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-20">
        <div className="grid size-12 place-items-center rounded-xl bg-bg font-mono text-xl font-bold text-accent ring-1 ring-accent/50">
          I
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