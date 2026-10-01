import { useState } from "react";
import { useUbi } from "@/lib/ubi/store";
import { yen } from "@/lib/ubi/format";

type Rail = "paypal" | "payeasy";
type Move = {
  id: string;
  rail: Rail;
  dir: "in" | "out";
  yen: number;
  ref: string;
  at: string;
  status: "台帳のみ";
};

const KEY = "ietfubi.rails.v1";

function readMoves(): Move[] {
  if (typeof window === "undefined") return [];
  try {
    const rows = JSON.parse(localStorage.getItem(KEY) || "[]") as Move[];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function saveMove(row: Move) {
  const next = [row, ...readMoves()].slice(0, 20);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

function slip() {
  const digits = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");
  return { agency: "00000", customer: digits(11), confirm: digits(6) };
}

export function RailDesk({ mode }: { mode: "in" | "out" }) {
  const { lang, user, creditBalance, debitBalance } = useUbi();
  const en = lang === "en";
  const [rail, setRail] = useState<Rail>("paypal");
  const [amount, setAmount] = useState("10000");
  const [ref, setRef] = useState("");
  const [note, setNote] = useState("");
  const [rows, setRows] = useState<Move[]>(() => (typeof window === "undefined" ? [] : readMoves()));
  const yenAmt = Math.floor(Number(amount) || 0);
  const inbound = mode === "in";

  const submit = () => {
    if (!user) {
      setNote(en ? "Sign in first. Nothing is sent to PayPal or Pay-easy." : "ログインが必要です。PayPalにもPay-easyにも送りません。");
      return;
    }
    if (yenAmt < 1 || yenAmt > 100_000_000) {
      setNote(en ? "Amount must be 1 to 100,000,000 yen." : "金額は1円から1億円までです。");
      return;
    }
    if (rail === "paypal" && !/^[^\s@]+@[^\s@]+$/.test(ref)) {
      setNote(en ? "Enter a PayPal email. It stays on this device." : "PayPalのメールを入れてください。この端末だけに残します。");
      return;
    }
    const label = rail === "paypal" ? ref.trim() : ref.replace(/\D/g, "").slice(0, 11) || slip().customer;
    const ok = inbound ? creditBalance(yenAmt) : debitBalance(yenAmt);
    if (!ok) {
      setNote(inbound ? (en ? "Could not post." : "記帳できませんでした。") : en ? "Over the in-app balance." : "台帳残高を超えています。");
      return;
    }
    const row: Move = {
      id: Math.random().toString(36).slice(2, 8),
      rail,
      dir: mode,
      yen: yenAmt,
      ref: label,
      at: new Date().toISOString(),
      status: "台帳のみ",
    };
    setRows(saveMove(row));
    setNote(
      rail === "payeasy"
        ? en
          ? `Posted on the ledger only. Dummy Pay-easy slip ${slip().agency} is not payable at a store.`
          : `台帳に記帳しました。収納機関番号 00000 はダミーで、コンビニでは払えません。`
        : en
          ? "Posted on the ledger only. PayPal was not contacted."
          : "台帳に記帳しました。PayPalには送信していません。",
    );
  };

  const mine = rows.filter((r) => r.dir === mode);

  return (
    <section className="rounded-lg border border-border bg-surface p-4 font-mono text-[12px]">
      <div className="text-[10px] tracking-widest text-muted">{inbound ? (en ? "DEPOSIT · LEDGER" : "入金 · 台帳") : en ? "PAYOUT · LEDGER" : "出金 · 台帳"}</div>
      <h2 className="mt-1 text-base text-fg">PayPal / Pay-easy</h2>
      <p className="mt-1 text-[11px] leading-relaxed text-dim">
        {en
          ? "In-app ledger only. No PayPal API and no real Pay-easy institution. A store cannot collect these numbers."
          : "アプリ内台帳だけです。PayPal APIも、実在のPay-easy収納機関も接続していません。この番号はコンビニで使えません。"}
      </p>
      <div className="mt-3 flex gap-2">
        {(["paypal", "payeasy"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setRail(id)}
            className={`min-h-11 flex-1 border ${rail === id ? "border-accent text-accent" : "border-border text-dim"}`}
          >
            {id === "paypal" ? "PayPal" : "Pay-easy"}
          </button>
        ))}
      </div>
      <label className="mt-3 block">
        <span className="text-muted">{en ? "Amount (JPY)" : "金額（円）"}</span>
        <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" className="mt-1 h-11 w-full border border-border bg-bg px-2" />
      </label>
      <label className="mt-3 block">
        <span className="text-muted">{rail === "paypal" ? (en ? "PayPal email" : "PayPalメール") : en ? "Customer number (optional)" : "お客様番号（任意）"}</span>
        <input
          value={ref}
          onChange={(e) => setRef(e.target.value.slice(0, 80))}
          inputMode={rail === "payeasy" ? "numeric" : "email"}
          className="mt-1 h-11 w-full border border-border bg-bg px-2"
        />
      </label>
      {rail === "payeasy" ? (
        <p className="mt-2 text-[11px] text-warn">{en ? "Agency number 00000 is a dummy slip." : "収納機関番号 00000 は台帳用のダミーです。"}</p>
      ) : null}
      <button type="button" onClick={submit} className="mt-3 min-h-11 bg-accent px-4 text-bg">
        {inbound ? (en ? "Post deposit" : "入金を記帳") : en ? "Post withdrawal" : "出金を記帳"}
      </button>
      {note ? <p className="mt-2 text-[11px] text-dim">{note}</p> : null}
      <ul className="mt-3 space-y-1">
        {mine.map((row) => (
          <li key={row.id} className="flex justify-between gap-2 border-b border-border py-1 text-[11px]">
            <span className="truncate">{row.rail === "paypal" ? "PayPal" : "Pay-easy"} · {row.ref}</span>
            <span className="shrink-0 text-dim">{inbound ? "+" : "−"}{yen(row.yen)} · {row.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
