import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MORTGAGE_BOOKS, reliefGap } from "@/lib/ubi/mortgage";
import { xrpJpy, yenToXrp } from "@/lib/ubi/xrp";
import { yen } from "@/lib/ubi/format";
import { useUbi } from "@/lib/ubi/store";

export const Route = createFileRoute("/xrp")({ component: XrpPage });

function XrpPage() {
  const { lang } = useUbi();
  const en = lang === "en";
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const gap = MORTGAGE_BOOKS.reduce((n, b) => n + reliefGap(b, 0.01).gap, 0);
  const q = yenToXrp(gap, now || Date.now());

  return (
    <div className="h-full overflow-y-auto font-mono">
      <div className="border-b border-border px-4 py-3">
        <div className="text-[10px] tracking-[0.2em] text-muted">XRP</div>
        <h1 className="text-xl font-semibold text-fg">{en ? "XRP corridor" : "XRP回廊"}</h1>
        <p className="mt-1 max-w-xl text-[12px] text-dim">
          {en
            ? "A local price converts the mortgage-relief gap into XRP units so the flow is readable. This desk does not place an order and does not intervene in the Ripple market."
            : "住宅ローン救済の月額差を、手元の価格でXRP個数に換算して流れを見えるようにしています。発注しません。リップルの相場には介入しません。"}
        </p>
      </div>
      <div className="grid gap-2 p-4 sm:grid-cols-3">
        <Stat k={en ? "Local quote" : "手元の価格"} v={now ? `¥${q.px.toFixed(2)}` : "—"} />
        <Stat k={en ? "Relief gap" : "救済の月額差"} v={yen(gap)} />
        <Stat k="XRP" v={now ? q.xrp.toFixed(2) : "—"} />
      </div>
      <p className="px-4 pb-8 text-[11px] text-muted">
        {en ? "Quote is a sine wave around ¥82. Not a market feed." : "価格は¥82前後のサイン波です。市場の配信ではありません。"}
      </p>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="border border-border px-3 py-2">
      <div className="text-[10px] tracking-widest text-muted">{k}</div>
      <div className="text-lg text-accent tabular">{v}</div>
    </div>
  );
}
