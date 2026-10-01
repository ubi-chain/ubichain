import { Share, Plus, X, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { t, type Lang } from "@/lib/ubi/i18n";

const INSTALL_HREF = "/?install=1&platform=ios";

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isPhone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;
}

export function IosInstallBanner({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (sessionStorage.getItem("ubichain.install-dismiss") === "1") return;
    if (!isPhone()) return;
    setShow(true);
  }, []);

  const goProxy = () => {
    window.location.assign(INSTALL_HREF);
  };

  if (!show) return null;

  return (
    <>
      <div className="pointer-events-auto flex items-center gap-2 border-b border-border bg-surface px-3 py-2 font-mono text-[11px] text-fg">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-bg text-accent ring-1 ring-accent/40">
          <Smartphone className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-semibold tracking-wide">{t(lang, "install_title")}</div>
          <div className="truncate text-muted">{t(lang, "install_body")}</div>
        </div>
        <button type="button" onClick={goProxy} className="h-11 shrink-0 rounded-sm bg-accent px-3 text-[11px] font-semibold text-bg">
          {t(lang, "install_cta")}
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-11 shrink-0 px-2 text-dim"
        >
          {lang === "en" ? "How" : lang === "fr" ? "Aide" : "手順"}
        </button>
        <button
          type="button"
          aria-label="dismiss"
          className="grid size-11 shrink-0 place-items-center text-muted"
          onClick={() => {
            sessionStorage.setItem("ubichain.install-dismiss", "1");
            setShow(false);
          }}
        >
          <X className="size-4" />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg/70 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-sm rounded-sm border border-border bg-surface p-5 font-mono">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide text-fg">{t(lang, "install_title")}</h2>
              <button type="button" onClick={() => setOpen(false)} className="grid size-11 place-items-center text-muted">
                <X className="size-4" />
              </button>
            </div>
            <ol className="space-y-3 text-[12px] leading-relaxed text-dim">
              <li className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-panel text-accent">1</span>
                <span>
                  {lang === "en"
                    ? "Open the site-app proxy (Home Screen install page)."
                    : lang === "fr"
                      ? "Ouvrez la page d'installation (application site)."
                      : "サイトアプリの代理ページを開きます。"}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-panel text-accent">
                  <Share className="size-4" />
                </span>
                <span>
                  {lang === "en"
                    ? "Safari: Share → Add to Home Screen. Chrome: menu → Add to Home Screen."
                    : "Safari は共有 → ホーム画面に追加。Chrome はメニュー → ホーム画面に追加。"}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-panel text-accent">
                  <Plus className="size-4" />
                </span>
                <span>
                  {lang === "en"
                    ? "UBICHAIN launches full-screen like a built-in app. No App Store login."
                    : "ホーム画面の UBICHAIN は純正アプリと同じ全画面です。パスワードは使いません。"}
                </span>
              </li>
            </ol>
            <button type="button" onClick={goProxy} className="mt-5 h-11 w-full rounded-sm bg-accent text-[12px] font-semibold text-bg">
              {t(lang, "install_cta")}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
