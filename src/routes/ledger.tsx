import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DeskFrame } from "@/components/desk-frame";
import { avoidDeficit, loadLedger, saveLedger, totalSpend } from "@/lib/ubi/ledger";
import { tx } from "@/lib/ubi/i18n";
import { useUbi } from "@/lib/ubi/store";
import { yen } from "@/lib/ubi/format";
import { CREDIT_MONTHLY_YEN, isCreditPhone } from "@/lib/ubi/admin";

export const Route = createFileRoute("/ledger")({ component: LedgerPage });

function LedgerPage() {
  const { lang, user } = useUbi();
  const income0 = user?.monthlyUbi ?? 17400;
  const [state, setState] = useState(() => loadLedger(income0));
  useEffect(() => {
    if (!user || !isCreditPhone(user.phone)) return;
    setState((s) => {
      if (s.income >= CREDIT_MONTHLY_YEN) return s;
      const next = { ...s, income: CREDIT_MONTHLY_YEN };
      saveLedger(next);
      return next;
    });
  }, [user]);
  const spend = totalSpend(state.cats);
  const deficit = spend - state.income;
  const data = useMemo(
    () =>
      state.cats.map((c) => ({
        name: tx(lang, { ja: c.ja, en: c.en, fr: c.fr }),
        yen: c.amount,
      })),
    [state.cats, lang],
  );

  const patch = (id: string, amount: number) => {
    const next = { ...state, cats: state.cats.map((c) => (c.id === id ? { ...c, amount } : c)) };
    saveLedger(next);
    setState(next);
  };

  const learn = () => {
    const next = avoidDeficit({ ...state, income: state.income || income0 });
    saveLedger(next);
    setState(next);
  };

  return (
    <DeskFrame
      lang={lang}
      kicker={tx(lang, { ja: "矩形チャート · 生活費", en: "Rectangular chart · living cost", fr: "Graphique · coût de la vie" })}
      title={tx(lang, { ja: "家計", en: "Ledger", fr: "Budget" })}
      lede={tx(lang, {
        ja: "次期が赤字にならないよう学習します。ケア・福祉は切りません。先天も後天も定番です。",
        en: "It learns so the next period is not a deficit. Care is never cut. Congenital and acquired stay ordinary.",
        fr: "Il apprend pour éviter le déficit. Le soin n'est jamais coupé.",
      })}
    >
      <div className="grid gap-3 p-4 md:grid-cols-3">
        <Stat k={tx(lang, { ja: "収入（UBI）", en: "Income (UBI)", fr: "Revenu (UBI)" })} v={yen(state.income)} />
        <Stat k={tx(lang, { ja: "支出", en: "Spend", fr: "Dépense" })} v={yen(spend)} />
        <Stat k={tx(lang, { ja: "過不足", en: "Gap", fr: "Écart" })} v={yen(state.income - spend)} danger={deficit > 0} />
      </div>

      <div className="h-56 px-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid stroke="color-mix(in oklab, var(--color-fg) 8%, transparent)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "var(--color-dim)", fontSize: 10 }} interval={0} />
            <YAxis tick={{ fill: "var(--color-dim)", fontSize: 10 }} width={48} />
            <Tooltip
              contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", fontSize: 12, color: "var(--color-fg)" }}
              formatter={(v: number) => yen(v)}
            />
            <Bar dataKey="yen" fill="var(--color-accent)" radius={0} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 p-4">
        {state.cats.map((c) => (
          <label key={c.id} className="block">
            <div className="mb-1 flex justify-between text-[11px] text-dim">
              <span>{tx(lang, { ja: c.ja, en: c.en, fr: c.fr })}</span>
              <span className="tabular text-fg">{yen(c.amount)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={c.id === "rent" ? 120000 : 60000}
              step={100}
              value={c.amount}
              onChange={(e) => patch(c.id, Number(e.target.value))}
              className="w-full accent-accent"
            />
          </label>
        ))}
        <button type="button" onClick={learn} className="h-11 w-full rounded-sm bg-accent font-semibold text-bg">
          {tx(lang, {
            ja: deficit > 0 ? "赤字を学習して次期を合わせる" : "黒字を学習に残す",
            en: deficit > 0 ? "Learn: cut next period to the floor" : "Record surplus in the learn cycle",
            fr: deficit > 0 ? "Apprendre : ajuster la période suivante" : "Enregistrer l'excédent",
          })}
        </button>
        <div className="pt-2">
          <div className="mb-2 text-[10px] tracking-widest text-muted">
            {tx(lang, { ja: "福祉は定番", en: "WELFARE IS ORDINARY", fr: "LE SOIN EST ORDINAIRE" })}
          </div>
          <p className="mb-2 text-[11px] text-dim">
            {tx(lang, {
              ja: "先天も後天も例外ではありません。選ぶとケアの最低線を厚くします。学習しても切りません。",
              en: "Congenital or acquired is not an exception. Selecting thickens the care floor. Learning never cuts it.",
              fr: "Congénital ou acquis n'est pas une exception. Cela épaissit le plancher de soin.",
            })}
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "none" as const, ja: "なし", en: "None", fr: "Aucun" },
                { id: "congenital" as const, ja: "先天", en: "Congenital", fr: "Congénital" },
                { id: "acquired" as const, ja: "後天", en: "Acquired", fr: "Acquis" },
              ] as const
            ).map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => {
                  const floor = row.id === "none" ? 0 : 18_000;
                  const cats = state.cats.map((c) => (c.id === "care" ? { ...c, amount: Math.max(c.amount, floor) } : c));
                  const next = { ...state, welfare: row.id, cats };
                  saveLedger(next);
                  setState(next);
                }}
                className={`h-11 px-3 text-[11px] ${state.welfare === row.id ? "bg-accent/15 text-accent" : "border border-border text-dim"}`}
              >
                {tx(lang, { ja: row.ja, en: row.en, fr: row.fr })}
              </button>
            ))}
          </div>
        </div>
        <p className="text-[10px] text-muted">
          {tx(lang, { ja: `学習回数 ${state.learned}`, en: `Learn passes ${state.learned}`, fr: `Passes ${state.learned}` })}
        </p>
      </div>
    </DeskFrame>
  );
}

function Stat({ k, v, danger }: { k: string; v: string; danger?: boolean }) {
  return (
    <div className="rounded-sm border border-border bg-surface p-3">
      <div className="text-[10px] tracking-widest text-muted">{k}</div>
      <div className={`mt-1 text-lg tabular ${danger ? "text-danger" : "text-fg"}`}>{v}</div>
    </div>
  );
}
