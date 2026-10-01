import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { NEWS, NEWS_FILTERS, type NewsItem } from "@/lib/ubi/news";
import { useUbi } from "@/lib/ubi/store";

export const Route = createFileRoute("/news")({ component: NewsPage });

function NewsPage() {
  const { lang, learn } = useUbi();
  const feed = [...learn.news, ...NEWS];
  const [filter, setFilter] = useState<(typeof NEWS_FILTERS)[number]>("全て");
  const [active, setActive] = useState<NewsItem | null>(feed[0] ?? NEWS[0]);
  const items = feed.filter((n) => filter === "全て" || n.category === filter);

  return (
    <div className="flex h-full min-h-0 font-mono">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-border px-4 py-3">
          <div className="text-[10px] tracking-[0.2em] text-muted">サブドメイン: news.ubi-chain.com</div>
          <h1 className="text-xl font-semibold text-fg">
            {lang === "en" ? "IWA News Service" : "国際労働者協会新聞"}
          </h1>
          <p className="text-[10px] text-muted">
            {lang === "en"
              ? `International Workers' Association — daily learn cycle ${learn.cycle}`
              : `国際労働者協会 — 日次学習サイクル ${learn.cycle}`}
          </p>
        </div>
        <div className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2">
          {NEWS_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-sm border px-2.5 py-1 text-[10px] ${
                filter === f ? "border-accent bg-accent/10 text-accent" : "border-border text-muted"
              }`}
            >
              {f === "全て" && lang === "en" ? "All" : f}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item)}
              className={`block w-full border-b border-border px-4 py-3 text-left ${
                active?.id === item.id ? "bg-accent/10" : "hover:bg-panel"
              }`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-dim">{item.flag}</span>
                  <Badge cat={item.category} />
                  {item.urgent ? (
                    <span className="bg-danger/15 px-1.5 text-[9px] text-danger" style={{ animation: "pulse-glow 2s infinite" }}>
                      {lang === "en" ? "FLASH" : "速報"}
                    </span>
                  ) : null}
                </div>
                <span className="text-[9px] text-muted">{item.time}</span>
              </div>
              <div className="text-[13px] font-semibold leading-snug text-fg">
                {lang === "en" ? item.title : item.titleJa}
              </div>
              <div className="mt-0.5 text-[10px] text-muted">{lang === "en" ? item.regionEn : item.region}</div>
            </button>
          ))}
        </div>
      </div>

      {active ? (
        <aside className="hidden w-[300px] shrink-0 flex-col border-l border-border bg-surface md:flex">
          <div className="border-b border-border p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs text-dim">{active.flag}</span>
              <Badge cat={active.category} />
            </div>
            <h2 className="text-[15px] font-semibold leading-snug text-fg">
              {lang === "en" ? active.title : active.titleJa}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 text-[12px] leading-relaxed text-dim">
            {lang === "en" ? active.summary : active.summaryJa}
            <div className="mt-4 space-y-1 text-[10px] text-muted">
              <div>
                {lang === "en" ? "Region" : "地域"}: {lang === "en" ? active.regionEn : active.region}
              </div>
              <div>
                {lang === "en" ? "Desk" : "分類"}: {active.category}
              </div>
              <div>
                {lang === "en" ? "Filed" : "掲載"}: {active.time}
              </div>
            </div>
            <p className="mt-6 text-[10px] leading-relaxed text-muted">
              {lang === "en"
                ? "The paper is the official organ of the International Workers' Association, reporting live on inequality, labor, and UBI."
                : "新聞は国際労働者協会の公式報道機関です。世界中の格差・労働・UBI動向をリアルタイムで報道します。"}
            </p>
          </div>
        </aside>
      ) : null}
    </div>
  );
}

function Badge({ cat }: { cat: NewsItem["category"] }) {
  const color = cat === "IWA" ? "text-danger bg-danger/15" : cat === "AML" ? "text-alert bg-alert/15" : "text-accent bg-accent/15";
  return <span className={`px-1.5 text-[9px] ${color}`}>{cat}</span>;
}
