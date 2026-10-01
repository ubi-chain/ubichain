import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { tx, type Lang } from "@/lib/ubi/i18n";

export const DESK_LINKS = [
  { to: "/library", ja: "図書", en: "Library", fr: "Livres" },
  { to: "/live", ja: "放送", en: "Broadcast", fr: "Direct" },
  { to: "/ledger", ja: "家計", en: "Ledger", fr: "Budget" },
  { to: "/international", ja: "公約", en: "Program", fr: "Charte" },
  { to: "/relief", ja: "救済", en: "Relief", fr: "Relais" },
  { to: "/payout", ja: "出金", en: "Payout", fr: "Retrait" },
  { to: "/earth", ja: "衛星", en: "Earth", fr: "Terre" },
] as const;

export function DeskFrame({
  lang,
  kicker,
  title,
  lede,
  children,
  fill,
}: {
  lang: Lang;
  kicker: string;
  title: string;
  lede?: string;
  children: ReactNode;
  fill?: boolean;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex h-full min-h-0 flex-col font-mono">
      <div className="border-b border-border px-4 py-3">
        <div className="text-[10px] tracking-[0.2em] text-muted">{kicker}</div>
        <h1 className="text-xl font-semibold text-fg">{title}</h1>
        {lede ? <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-dim">{lede}</p> : null}
      </div>
      <nav className="flex gap-1 overflow-x-auto border-b border-border px-2 py-1">
        {DESK_LINKS.map((item) => {
          const active = path.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`grid h-9 shrink-0 place-items-center px-3 text-[10px] ${
                active ? "bg-accent/15 text-accent" : "text-muted"
              }`}
            >
              {tx(lang, { ja: item.ja, en: item.en, fr: item.fr })}
            </Link>
          );
        })}
      </nav>
      <div className={fill ? "min-h-0 flex-1 overflow-hidden" : "min-h-0 flex-1 overflow-y-auto"}>{children}</div>
    </div>
  );
}
