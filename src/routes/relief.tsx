import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MORTGAGE_BOOKS, reliefGap } from "@/lib/ubi/mortgage";
import { useUbi } from "@/lib/ubi/store";
import { yen } from "@/lib/ubi/format";

export const Route = createFileRoute("/relief")({ component: ReliefPage });

function ReliefPage() {
  const { lang, bankPool } = useUbi();
  const en = lang === "en";
  const [shock, setShock] = useState(1);
  const rows = useMemo(
    () => MORTGAGE_BOOKS.map((b) => ({ b, ...reliefGap(b, shock / 100) })),
    [shock],
  );
  const total = rows.reduce((n, r) => n + r.gap, 0);
  const cover = Math.min(100, (bankPool / Math.max(total, 1)) * 100);

  return (
    <div className="h-full overflow-y-auto font-mono">
      <div className="border-b border-border px-4 py-3">
        <div className="text-[10px] tracking-[0.2em] text-muted">{en ? "VARIABLE RATE" : "変動金利"}</div>
        <h1 className="text-xl font-semibold text-fg">{en ? "Mortgage relief" : "住宅ローン救済"}</h1>
        <p className="mt-1 max-w-xl text-[12px] text-dim">
          {en
            ? "Prices the monthly gap if the variable rate rises. The reserve ledger can cover that gap. This does not originate a loan or debit a real bank."
            : "変動金利が上がったときの月額差を計算し、準備金台帳で埋められます。貸付も実口座の引き落としもしません。"}
        </p>
      </div>
      <label className="block border-b border-border px-4 py-3 text-[12px]">
        <span className="text-muted">{en ? "Rate shock" : "金利ショック"} +{shock.toFixed(2)}%</span>
        <input
          type="range"
          min={0.25}
          max={3}
          step={0.25}
          value={shock}
          onChange={(e) => setShock(Number(e.target.value))}
          className="mt-2 w-full"
        />
      </label>
      <div className="grid gap-2 p-4 sm:grid-cols-3">
        <Stat k={en ? "Gap / month" : "月額差の合計"} v={yen(total)} />
        <Stat k={en ? "Reserve" : "保障準備金"} v={yen(bankPool)} />
        <Stat k={en ? "Cover" : "救済カバー"} v={`${cover.toFixed(1)}%`} />
      </div>
      <ul className="space-y-2 px-4 pb-8">
        {rows.map((r) => (
          <li key={r.b.id} className="border border-border px-3 py-2 text-[12px]">
            <div className="text-fg">{en ? r.b.en : r.b.ja}</div>
            <div className="mt-1 flex justify-between text-dim">
              <span>{en ? "Now" : "いま"} {yen(r.now)}</span>
              <span>{en ? "After" : "上昇後"} {yen(r.next)}</span>
            </div>
            <div className="text-ok">{en ? "Relief" : "救済"} {yen(r.gap)}</div>
          </li>
        ))}
      </ul>
      <div className="px-4 pb-8">
        <Link to="/payout" className="text-[12px] text-accent">{en ? "Payout desk" : "出金デスクへ"}</Link>
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="border border-border px-3 py-2">
      <div className="text-[10px] tracking-widest text-muted">{k}</div>
      <div className="text-accent tabular">{v}</div>
    </div>
  );
}
