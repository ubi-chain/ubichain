import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PAYOUT_BANKS, readPayouts, savePayout, type Payout } from "@/lib/ubi/payout";
import { useUbi } from "@/lib/ubi/store";
import { yen } from "@/lib/ubi/format";
import { RailDesk } from "@/components/rail-desk";

export const Route = createFileRoute("/payout")({ component: PayoutPage });

function PayoutPage() {
  const { lang, user, debitBalance } = useUbi();
  const en = lang === "en";
  const [bankId, setBankId] = useState(PAYOUT_BANKS[0]!.id);
  const [last4, setLast4] = useState("");
  const [amount, setAmount] = useState("100000");
  const [step, setStep] = useState<"edit" | "review" | "done">("edit");
  const [rows, setRows] = useState<Payout[]>(() => (typeof window === "undefined" ? [] : readPayouts()));
  const [error, setError] = useState("");
  const bank = PAYOUT_BANKS.find((b) => b.id === bankId) ?? PAYOUT_BANKS[0]!;
  const yenAmt = Math.floor(Number(amount) || 0);
  const kind = bank.kind === "net" ? (en ? "Net" : "ネット") : bank.kind === "mega" ? (en ? "Mega" : "メガ") : en ? "Regional" : "地方";

  const submit = () => {
    if (!user) {
      setError(en ? "Sign in first." : "ログインが必要です");
      return;
    }
    if (!/^\d{4}$/.test(last4)) {
      setError(en ? "Last 4 digits." : "口座の下4桁を入れてください");
      return;
    }
    if (!debitBalance(yenAmt)) {
      setError(en ? "Amount is over the in-app balance." : "台帳残高を超えています");
      return;
    }
    const row: Payout = {
      id: Math.random().toString(36).slice(2, 8),
      bankId: bank.id,
      bankJa: bank.ja,
      last4,
      yen: yenAmt,
      at: new Date().toISOString(),
      status: "受付",
    };
    setRows(savePayout(row));
    setStep("done");
    setError("");
  };

  return (
    <div className="h-full overflow-y-auto font-mono">
      <div className="border-b border-border px-4 py-3">
        <div className="text-[10px] tracking-[0.2em] text-muted">{en ? "PAYOUT · LEDGER ONLY" : "出金 · 台帳のみ"}</div>
        <h1 className="text-xl font-semibold text-fg">{en ? "Withdraw" : "出金"}</h1>
        <p className="mt-1 max-w-xl text-[12px] text-dim">
          {en
            ? "Same steps as a payout desk: amount, bank, confirm. The request stays on this ledger. No bank API is connected, so nothing is sent to au Jibun, a net bank, a megabank, or a regional bank."
            : "金額、銀行、確認。申請は台帳に残ります。PayPalとPay-easyも台帳記帳のみで、実在の口座や収納機関には送りません。"}
        </p>
        <div className="mt-2 text-[12px] text-accent">{en ? "Balance" : "台帳残高"} {yen(user?.balance ?? 0)}</div>
      </div>

      {!user ? (
        <div className="p-4 text-[12px]">
          <Link to="/register" className="text-accent">{en ? "Sign in" : "ログイン"}</Link>
        </div>
      ) : step === "done" ? (
        <div className="p-4 text-[12px]">
          <div className="text-ok">{en ? "Request accepted" : "受付しました"}</div>
          <p className="mt-1 text-dim">{en ? "Status stays 受付. No funds left this app." : "状態は「受付」のままです。このアプリの外へお金は出ていません。"}</p>
          <button type="button" className="mt-3 min-h-11 border border-border px-3" onClick={() => setStep("edit")}>
            {en ? "Another" : "もう一件"}
          </button>
        </div>
      ) : (
        <div className="space-y-3 p-4">
          <label className="block text-[12px]">
            <span className="text-muted">{en ? "Amount (JPY)" : "金額（円）"}</span>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" className="mt-1 h-11 w-full border border-border bg-bg px-2" />
          </label>
          <label className="block text-[12px]">
            <span className="text-muted">{en ? "Bank" : "銀行"}</span>
            <select value={bankId} onChange={(e) => setBankId(e.target.value)} className="mt-1 h-11 w-full border border-border bg-bg px-2">
              {PAYOUT_BANKS.map((b) => (
                <option key={b.id} value={b.id}>{en ? b.en : b.ja}</option>
              ))}
            </select>
          </label>
          <label className="block text-[12px]">
            <span className="text-muted">{en ? "Account last 4" : "口座下4桁"}</span>
            <input value={last4} onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" className="mt-1 h-11 w-full border border-border bg-bg px-2" />
          </label>
          {error ? <p className="text-[12px] text-alert">{error}</p> : null}
          {step === "edit" ? (
            <button type="button" className="min-h-11 bg-accent px-4 text-bg" onClick={() => yenAmt > 0 ? setStep("review") : setError(en ? "Enter an amount." : "金額を入れてください")}>
              {en ? "Review" : "確認"}
            </button>
          ) : (
            <div className="border border-border p-3 text-[12px]">
              <div>{kind} · {en ? bank.en : bank.ja}</div>
              <div className="text-accent">{yen(yenAmt)} · ****{last4 || "----"}</div>
              <div className="mt-2 flex gap-2">
                <button type="button" className="min-h-11 border border-border px-3" onClick={() => setStep("edit")}>{en ? "Back" : "戻る"}</button>
                <button type="button" className="min-h-11 bg-accent px-4 text-bg" onClick={submit}>{en ? "Accept request" : "申請を受け付ける"}</button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="px-4 pb-4">
        <RailDesk mode="out" />
      </div>
      <ul className="space-y-2 px-4 pb-8">
        {rows.map((r) => (
          <li key={r.id} className="flex justify-between border-b border-border py-2 text-[12px]">
            <span>{r.bankJa} ****{r.last4}</span>
            <span className="text-dim">{yen(r.yen)} · {r.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
