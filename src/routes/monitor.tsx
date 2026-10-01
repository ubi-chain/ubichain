import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { CITIES, povertyColor } from "@/lib/ubi/cities";
import { compactNumber } from "@/lib/ubi/format";
import { useUbi } from "@/lib/ubi/store";

export const Route = createFileRoute("/monitor")({ component: MonitorPage });

const CASES = [
  { id: "M-2041", typeJa: "構造的送金", typeEn: "Structuring", region: "ベルリン", amount: 531_900_000, currency: "EUR", risk: 0.94, noteJa: "送金を小口に分割して追跡を回避", noteEn: "Split transfers to evade tracing" },
  { id: "M-2044", typeJa: "スマーフィング", typeEn: "Smurfing", region: "メキシコシティ", amount: 84_400_000, currency: "MXN", risk: 0.81, noteJa: "複数の人物を使った資金分散", noteEn: "Many mules dispersing funds" },
  { id: "M-2050", typeJa: "シェルカンパニー", typeEn: "Shell company", region: "テヘラン", amount: 328_800_000, currency: "USD", risk: 0.88, noteJa: "ペーパーカンパニーを通じた資金洗浄", noteEn: "Laundering via paper companies" },
  { id: "M-2056", typeJa: "詐欺", typeEn: "Fraud", region: "ダッカ", amount: 2_400_000, currency: "BDT", risk: 0.73, noteJa: "重複登録・身元詐称によるUBI不正受給", noteEn: "Duplicate identity UBI claims" },
  { id: "M-2061", typeJa: "レイヤリング", typeEn: "Layering", region: "シンガポール", amount: 12_200_000, currency: "SGD", risk: 0.69, noteJa: "複数国を経由した資金の階層化", noteEn: "Hopping jurisdictions to layer funds" },
  { id: "M-2068", typeJa: "ミキシング", typeEn: "Mixing", region: "ロンドン", amount: 4_800_000, currency: "GBP", risk: 0.64, noteJa: "複数の取引を混合して追跡困難化", noteEn: "Mixing legs to break the trail" },
  { id: "M-2074", typeJa: "メガバンク連鎖倒産", typeEn: "Mega contagion", region: "東京", amount: 18_400_000_000_000, currency: "JPY", risk: 0.47, noteJa: "みずほ・三菱UFJ・三井住友のCDS急騰。メガ3行の連鎖倒産シナリオを監視", noteEn: "CDS spike across Mizuho, MUFG, SMBC. Three-megabank contagion on watch" },
  { id: "M-2079", typeJa: "システミック倒産", typeEn: "Systemic insolvency", region: "フランクフルト", amount: 94_200_000_000, currency: "EUR", risk: 0.58, noteJa: "ドイツ銀行の資金繰り悪化が欧州メガへ波及する恐れ", noteEn: "Deutsche Bank liquidity stress may jump to European SIFIs" },
];

function MonitorPage() {
  const { lang, flaggedCount } = useUbi();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const open = CASES.filter((c) => !done[c.id]);
  const suspect = open.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="flex h-full min-h-0 font-mono">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-border px-4 py-3">
          <div className="text-[10px] tracking-[0.2em] text-muted">{lang === "en" ? "AML CENTER" : "不正資金監視センター"}</div>
          <h1 className="text-xl font-semibold text-fg">{lang === "en" ? "Surveillance" : "監視システム"}</h1>
        </div>
        <div className="grid grid-cols-3 gap-2 border-b border-border p-3">
          <Kpi label={lang === "en" ? "Open" : "要調査"} value={String(open.length || flaggedCount)} />
          <Kpi label={lang === "en" ? "Flagged value" : "疑念額"} value={compactNumber(suspect)} />
          <Kpi label={lang === "en" ? "Model" : "モデル"} value="v4.2" />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {open.length === 0 ? (
            <div className="p-8 text-center text-[12px] text-muted">{lang === "en" ? "No open cases" : "要調査案件なし"}</div>
          ) : (
            open.map((c) => (
              <article key={c.id} className="border-b border-border px-4 py-3">
                <div className="flex items-center gap-2 text-[10px]">
                  <ShieldAlert className="size-3.5 text-danger" />
                  <span className="text-danger">{lang === "en" ? c.typeEn : c.typeJa}</span>
                  <span className="text-muted">{c.region}</span>
                  <span className="ml-auto tabular text-fg">
                    {compactNumber(c.amount)} {c.currency}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-dim">{lang === "en" ? c.noteEn : c.noteJa}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-panel">
                    <div className="h-full bg-danger" style={{ width: `${c.risk * 100}%` }} />
                  </div>
                  <span className="text-[10px] tabular text-alert">{Math.round(c.risk * 100)}%</span>
                  <button
                    type="button"
                    onClick={() => setDone((d) => ({ ...d, [c.id]: true }))}
                    className="rounded-sm border border-border px-2 py-1 text-[10px] text-dim hover:text-ok"
                  >
                    {lang === "en" ? "Mark resolved" : "解決済みとしてマーク"}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
      <aside className="hidden w-[240px] shrink-0 flex-col border-l border-border bg-surface p-3 md:flex">
        <div className="mb-2 text-[10px] tracking-[0.2em] text-muted">{lang === "en" ? "RISK MAP" : "リスクヒートマップ"}</div>
        <div className="grid grid-cols-5 gap-1">
          {CITIES.slice(0, 25).map((c) => (
            <div
              key={c.code}
              title={`${c.nameJa} ${(c.povertyIndex * 100).toFixed(0)}%`}
              className="aspect-square rounded-sm"
              style={{ background: povertyColor(c.povertyIndex) }}
            />
          ))}
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-muted">
          {lang === "en"
            ? "Heat is poverty-weighted. High-poverty nodes attract more AML sampling."
            : "色は貧困加重。高貧困ノードほどAMLサンプリングが厚い。"}
        </p>
      </aside>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-panel px-2 py-2">
      <div className="text-[9px] tracking-widest text-muted">{label}</div>
      <div className="text-sm tabular text-fg">{value}</div>
    </div>
  );
}
