import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Globe2,
  CreditCard,
  Newspaper,
  Landmark,
  Bot,
  Zap,
  Shield,
  UserRound,
  Menu,
  X,
  Building2,
  Database,
  BookOpen,
  Radio,
  BarChart3,
  HandCoins,
  ArrowDownToLine,
  Coins,
  Satellite,
  FileSearch,
} from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { t, type Lang } from "@/lib/ubi/i18n";
import { useUbi } from "@/lib/ubi/store";
import { compactNumber, zoneTime } from "@/lib/ubi/format";
import { errorInsight, getHealState, hydrateHeal, installErrorWatch, subscribeHeal } from "@/lib/ubi/heal";
import { IosInstallBanner } from "./ios-install";
import { Tutorial } from "./tutorial";
import { BootSplash } from "./boot-splash";
import { LearnCyclePanel } from "./learn-cycle";
import { MaintenanceUpdate } from "./maintenance-update";

const NAV = [
  { to: "/", labelKey: "nav_home" as const, icon: Globe2, match: (p: string) => p === "/" },
  { to: "/pay", labelKey: "nav_pay" as const, icon: CreditCard, match: (p: string) => p.startsWith("/pay") },
  { to: "/banks", labelKey: "nav_banks" as const, icon: Building2, match: (p: string) => p.startsWith("/banks") },
  { to: "/news", labelKey: "nav_news" as const, icon: Newspaper, match: (p: string) => p.startsWith("/news") },
  { to: "/international", labelKey: "nav_international" as const, icon: Landmark, match: (p: string) => p.startsWith("/international") },
  { to: "/ai", labelKey: "nav_ai" as const, icon: Bot, match: (p: string) => p.startsWith("/ai") },
  { to: "/infra", labelKey: "nav_infra" as const, icon: Zap, match: (p: string) => p.startsWith("/infra") },
  { to: "/monitor", labelKey: "nav_monitor" as const, icon: Shield, match: (p: string) => p.startsWith("/monitor") },
  { to: "/dns", labelKey: "nav_dns" as const, icon: Database, match: (p: string) => p.startsWith("/dns") },
  { to: "/relief", labelKey: "nav_relief" as const, icon: HandCoins, match: (p: string) => p.startsWith("/relief") },
  { to: "/payout", labelKey: "nav_payout" as const, icon: ArrowDownToLine, match: (p: string) => p.startsWith("/payout") },
  { to: "/xrp", labelKey: "nav_xrp" as const, icon: Coins, match: (p: string) => p.startsWith("/xrp") },
  { to: "/earth", labelKey: "nav_earth" as const, icon: Satellite, match: (p: string) => p.startsWith("/earth") },
  { to: "/institutions", labelKey: "nav_link" as const, icon: FileSearch, match: (p: string) => p.startsWith("/institutions") },
  { to: "/library", labelKey: "nav_library" as const, icon: BookOpen, match: (p: string) => p.startsWith("/library") },
  { to: "/live", labelKey: "nav_live" as const, icon: Radio, match: (p: string) => p.startsWith("/live") },
  { to: "/ledger", labelKey: "nav_ledger" as const, icon: BarChart3, match: (p: string) => p.startsWith("/ledger") },
];

const TABS = [
  NAV[0]!,
  NAV[1]!,
  NAV[2]!,
  NAV.find((n) => n.to === "/payout")!,
  { to: "/me", labelKey: "nav_mypage" as const, icon: UserRound, match: (p: string) => p.startsWith("/me") },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const {
    lang,
    setLang,
    user,
    logout,
    isFirstVisit,
    setFirstVisitDone,
    hydrate,
    totalUbi,
    totalUsers,
    flaggedCount,
    tickEconomy,
    triggerSync,
    syncVersion,
    macroSlideActive,
    bankPool,
    learn,
  } = useUbi();
  const [menu, setMenu] = useState(false);
  const [clock, setClock] = useState("--:--:--");
  const [synced, setSynced] = useState(false);
  const [booting, setBooting] = useState(true);
  const heal = useSyncExternalStore(subscribeHeal, getHealState, getHealState);

  useEffect(() => {
    hydrateHeal();
    installErrorWatch();
    hydrate();
    const onHeal = () => {
      useUbi.setState((s) => ({
        learn: {
          ...s.learn,
          insights: [...s.learn.insights.filter((row) => row.id !== "heal"), errorInsight()],
        },
      }));
    };
    window.addEventListener("ubichain-healed", onHeal);
    return () => window.removeEventListener("ubichain-healed", onHeal);
  }, [hydrate]);

  useEffect(() => {
    const tick = () => {
      setClock(zoneTime("America/New_York"));
      tickEconomy();
    };
    tick();
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, [tickEconomy]);

  useEffect(() => {
    if (syncVersion > 1) {
      setSynced(true);
      const id = setTimeout(() => setSynced(false), 1800);
      return () => clearTimeout(id);
    }
  }, [syncVersion]);

  const qHome = path === "/";
  const signed = Boolean(user);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg text-fg">
      {qHome ? null : <IosInstallBanner lang={lang} />}

      {qHome ? null : (
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-bg font-mono text-sm font-bold text-accent ring-1 ring-accent/50">
            I
          </span>
          <div className="leading-tight">
            <div className="font-mono text-[13px] font-semibold tracking-[0.18em] text-fg">IETFUBI</div>
            <div className="font-mono text-[9px] tracking-widest text-muted">{t(lang, "tagline")}</div>
          </div>
        </Link>

        <a
          href="/?install=1&platform=ios"
          className="grid h-11 shrink-0 place-items-center px-2 font-mono text-[10px] text-accent md:hidden"
        >
          {lang === "en" ? "App" : lang === "fr" ? "App" : "アプリ"}
        </a>
        <div className="ml-auto hidden items-center gap-4 font-mono text-[10px] md:flex">
          <LearnCyclePanel lang={lang} cycle={learn} compact />
          <span className="text-dim">v{learn.version ?? `1.${learn.cycle}.0`}</span>
          <Stat label={t(lang, "guarantee")} value={`¥${compactNumber(bankPool)}`} accent />
          <Stat label={t(lang, "total_ubi")} value={`¥${compactNumber(totalUbi)}`} />
          <Stat label={t(lang, "alerts")} value={String(flaggedCount)} danger={flaggedCount > 8} />
        </div>

        <div className="ml-auto flex items-center gap-1 font-mono text-[10px] md:ml-2">
          <span className="hidden text-muted sm:inline" suppressHydrationWarning>
            {clock}
          </span>
          <LangSwitch lang={lang} setLang={setLang} />
          {signed ? (
            <>
              <Link to="/me" className="hidden rounded-sm border border-border px-2 py-1 text-dim hover:text-accent sm:inline">
                {user?.name}
              </Link>
              <button type="button" onClick={logout} className="hidden rounded-sm px-2 py-1 text-muted hover:text-danger sm:inline">
                {t(lang, "nav_logout")}
              </button>
            </>
          ) : (
            <Link
              to="/register"
              className="rounded-sm border border-accent/50 bg-accent/10 px-2 py-1 text-accent hover:bg-accent/20"
            >
              {t(lang, "register_btn")}
            </Link>
          )}
          {signed ? (
          <button
            type="button"
            className="rounded-sm p-1.5 text-dim hover:text-fg lg:hidden"
            onClick={() => setMenu(true)}
            aria-label={t(lang, "more")}
          >
            <Menu className="size-5" />
          </button>
          ) : null}
        </div>
      </header>
      )}

      {qHome || !macroSlideActive ? null : (
        <div className="shrink-0 bg-danger/15 px-3 py-1.5 text-center font-mono text-[11px] text-danger" style={{ animation: "pulse-glow 2s infinite" }}>
          {t(lang, "macroSlide")} — {t(lang, "inequality_alert")}
        </div>
      )}

      {qHome || !synced ? null : (
        <div className="shrink-0 bg-ok/10 px-3 py-1 text-center font-mono text-[10px] text-ok">{t(lang, "sync_done")}</div>
      )}

      {heal.last?.fixed && Date.now() - Date.parse(heal.last.at) < 120_000 ? (
        <div className="shrink-0 bg-ok/10 px-3 py-1 text-center font-mono text-[10px] text-ok">
          {lang === "en" ? heal.last.en : heal.last.ja}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        {qHome || !signed ? null : (
        <nav className="hidden w-[212px] shrink-0 flex-col border-r border-border bg-surface lg:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              labelKey={item.labelKey}
              icon={item.icon}
              lang={lang}
              active={item.match(path)}
            />
          ))}
          <NavLink to="/me" labelKey="nav_mypage" icon={UserRound} lang={lang} active={path.startsWith("/me")} />
          <div className="mt-auto space-y-2 border-t border-border p-3 font-mono text-[10px] text-muted">
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-ok" />
              {t(lang, "online")}
            </div>
            <button
              type="button"
              onClick={triggerSync}
              className="w-full rounded-sm border border-border px-2 py-1.5 text-left text-dim hover:text-accent"
            >
              {t(lang, "one_time_update")}
            </button>
            <Link to="/dns" className="tracking-widest text-muted hover:text-accent">
              {t(lang, "domain")}
            </Link>
          </div>
        </nav>
        )}

        <main className="min-h-0 min-w-0 flex-1 overflow-hidden">{children}</main>
      </div>

      {qHome || !signed ? null : (
      <nav className="flex shrink-0 border-t border-border bg-surface pb-[max(0.35rem,env(safe-area-inset-bottom))] lg:hidden">
        {TABS.map((item) => {
          const Icon = item.icon;
          const active = item.match(path);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 font-mono text-[9px] tracking-wide ${
                active ? "text-accent" : "text-muted"
              }`}
            >
              <Icon className="size-5" strokeWidth={active ? 2.2 : 1.7} />
              {t(lang, item.labelKey)}
            </Link>
          );
        })}
      </nav>
      )}

      {menu && signed ? (
        <div className="fixed inset-0 z-40 bg-bg/70 backdrop-blur-sm lg:hidden" onClick={() => setMenu(false)}>
          <div
            className="absolute top-0 right-0 flex h-full w-[78%] max-w-xs flex-col border-l border-border bg-surface pt-[max(0.75rem,env(safe-area-inset-top))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pb-3">
              <span className="font-mono text-xs tracking-[0.2em] text-accent">MENU</span>
              <button type="button" onClick={() => setMenu(false)} className="text-muted">
                <X className="size-5" />
              </button>
            </div>
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                labelKey={item.labelKey}
                icon={item.icon}
                lang={lang}
                active={item.match(path)}
                onClick={() => setMenu(false)}
              />
            ))}
            <NavLink to="/me" labelKey="nav_mypage" icon={UserRound} lang={lang} active={path.startsWith("/me")} onClick={() => setMenu(false)} />
            <div className="mt-auto p-4 font-mono text-[10px] text-muted">
              <div className="mb-2 grid grid-cols-3 gap-2 text-center">
                <Mini label={t(lang, "total_ubi")} value={`¥${compactNumber(totalUbi)}`} />
                <Mini label={t(lang, "members")} value={compactNumber(totalUsers)} />
                <Mini label={t(lang, "alerts")} value={String(flaggedCount)} />
              </div>
              <Link to="/dns" className="text-accent">
                ubichain.is-a.dev
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {qHome || !booting ? null : <BootSplash lang={lang} onDone={() => setBooting(false)} />}
      {qHome || booting || !isFirstVisit ? null : <Tutorial lang={lang} onDone={setFirstVisitDone} />}
      {qHome || booting || isFirstVisit ? null : <MaintenanceUpdate />}
    </div>
  );
}

function NavLink({
  to,
  labelKey,
  icon: Icon,
  lang,
  active,
  onClick,
}: {
  to: string;
  labelKey: (typeof NAV)[number]["labelKey"] | "nav_mypage";
  icon: typeof Globe2;
  lang: Lang;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 border-l-2 px-4 py-3 font-mono text-[12px] ${
        active ? "border-accent bg-accent/10 text-accent" : "border-transparent text-dim hover:bg-panel hover:text-fg"
      }`}
    >
      <Icon className="size-4" />
      {t(lang, labelKey)}
    </Link>
  );
}

function Stat({ label, value, accent, danger }: { label: string; value: string; accent?: boolean; danger?: boolean }) {
  return (
    <div className="text-right leading-tight">
      <div className="tracking-widest text-muted">{label}</div>
      <div className={`text-[13px] tabular ${danger ? "text-danger" : accent ? "text-accent" : "text-fg"}`}>{value}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border p-2">
      <div className="text-muted">{label}</div>
      <div className="text-fg tabular">{value}</div>
    </div>
  );
}

function LangSwitch({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="flex overflow-hidden rounded-sm border border-border">
      {(["ja", "en", "zh", "fr"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={`px-1.5 py-1 uppercase ${lang === l ? "bg-accent/15 text-accent" : "text-muted hover:text-fg"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
