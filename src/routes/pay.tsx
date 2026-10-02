import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Nfc, CircleDollarSign } from "lucide-react";
import { useUbi } from "@/lib/ubi/store";
import { yen } from "@/lib/ubi/format";
import { DonorRailPanel } from "@/components/donor-rail";
import { RailDesk } from "@/components/rail-desk";
import {
  capturePaypalCheckout,
  startPaypalCheckout,
} from "@/lib/ubi/paypal-checkout";

export const Route = createFileRoute("/pay")({ component: PayPage });

function PayPage() {
  const { lang, user, donorBatches, pulseDonorRail } = useUbi();
  const [code, setCode] = useState("482917");
  const [tab, setTab] = useState<"code" | "qr" | "nfc">("qr");
  const [amountJpy, setAmountJpy] = useState("1000");
  const [paypalStatus, setPaypalStatus] = useState("");
  const [paypalBusy, setPaypalBusy] = useState(false);
  const matrix = useMemo(() => qrMatrix(code), [code]);
  const balance = user?.balance ?? 1_240_000;
  const monthly = user?.monthlyUbi ?? 17400;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("paypal") === "cancelled")
      setPaypalStatus(
        lang === "en"
          ? "PayPal checkout was cancelled."
          : "PayPal決済をキャンセルしました。",
      );
    const orderId = params.get("token");
    if (params.get("paypal") !== "return" || !orderId) return;
    setPaypalBusy(true);
    void capturePaypalCheckout({ data: { orderId } }).then((result) => {
      setPaypalStatus(
        result.ok && result.status === "completed"
          ? lang === "en"
            ? "PayPal payment completed."
            : "PayPal決済が完了しました。"
          : result.ok
            ? lang === "en"
              ? "PayPal payment is pending."
              : "PayPal決済を確認中です。"
            : result.error,
      );
      setPaypalBusy(false);
      window.history.replaceState({}, "", "/pay");
    });
  }, [lang]);

  const checkout = async () => {
    if (!user) {
      setPaypalStatus(
        lang === "en"
          ? "Sign in before paying."
          : "決済前にログインしてください。",
      );
      return;
    }
    setPaypalBusy(true);
    setPaypalStatus(
      lang === "en"
        ? "Preparing PayPal checkout…"
        : "PayPal決済を準備しています…",
    );
    const result = await startPaypalCheckout({
      data: { amountJpy: Number(amountJpy), origin: window.location.origin },
    });
    if (result.ok) window.location.assign(result.approvalUrl);
    else {
      setPaypalStatus(result.error);
      setPaypalBusy(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-border px-4 py-3">
        <div className="font-mono text-[10px] tracking-[0.2em] text-muted">
          サブドメイン: pay.ubi-chain.com
        </div>
        <h1 className="font-mono text-xl font-semibold text-fg">
          {lang === "en" ? "One-time pay" : "ワンタイム決済"}
        </h1>
        <p className="font-mono text-[11px] text-dim">
          {lang === "en" ? "QR · PayPal · Pay-easy" : "QR・PayPal・Pay-easy"}
        </p>
      </div>
      <DonorRailPanel
        lang={lang}
        batches={donorBatches}
        onPulse={pulseDonorRail}
      />

      <div className="grid gap-4 p-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-lg border border-border bg-surface p-4">
          <div className="mb-3 flex gap-1 font-mono text-[11px]">
            {(["qr", "code", "nfc"] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-sm px-3 py-1.5 ${tab === id ? "bg-accent/15 text-accent" : "text-muted hover:text-fg"}`}
              >
                {id === "qr"
                  ? "QR"
                  : id === "code"
                    ? lang === "en"
                      ? "Code"
                      : "コード"
                    : "NFC"}
              </button>
            ))}
          </div>

          {tab === "qr" ? (
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-md bg-fg p-3">
                <QrGrid matrix={matrix} />
              </div>
              <div className="font-mono text-[11px] text-muted">
                {lang === "en"
                  ? "Valid 5 minutes · single use"
                  : "有効期限5分 · 1回限り"}
              </div>
            </div>
          ) : null}

          {tab === "code" ? (
            <div className="text-center">
              <div className="font-mono text-[11px] tracking-[0.3em] text-muted">
                {lang === "en" ? "ONE-TIME CODE" : "ワンタイムコード"}
              </div>
              <div className="my-3 font-mono text-4xl tracking-[0.35em] text-accent tabular">
                {code}
              </div>
              <p className="font-mono text-[11px] text-danger">
                {lang === "en"
                  ? "Do not share this code."
                  : "このコードは他人に教えないでください"}
              </p>
            </div>
          ) : null}

          {tab === "nfc" ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="grid size-20 place-items-center rounded-full border border-accent/40 bg-accent/10 text-accent">
                <Nfc className="size-9" />
              </div>
              <div className="font-mono text-sm text-fg">
                {lang === "en"
                  ? "Hold phone to infrastructure terminal"
                  : "スマホをインフラ端末にタッチ"}
              </div>
              <p className="max-w-xs font-mono text-[11px] text-dim">
                {lang === "en"
                  ? "Transit, power, water, medical, education — auto-debit from UBI."
                  : "対応インフラ: 交通 · 電力 · 水道 · 医療 · 教育。支払いはUBI残高より自動引き落とし。"}
              </p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setCode(makeCode())}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-border py-2.5 font-mono text-[12px] text-dim hover:text-accent"
          >
            <RefreshCw className="size-3.5" />
            {lang === "en" ? "Regenerate" : "再生成"}
          </button>
        </section>

        <section className="space-y-3">
          <div className="rounded-lg border border-border bg-surface p-4 font-mono">
            <div className="text-[10px] tracking-widest text-muted">
              {lang === "en" ? "BALANCE" : "残高"}
            </div>
            <div className="text-2xl tabular text-accent">{yen(balance)}</div>
            <div className="mt-1 text-[11px] text-dim">
              {lang === "en" ? "Monthly UBI" : "月額UBI"} {yen(monthly)}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4 font-mono text-[12px]">
            <div className="mb-2 text-[10px] tracking-widest text-muted">
              PAYPAL CHECKOUT
            </div>
            <label className="block text-dim">
              {lang === "en" ? "Amount (JPY)" : "金額（JPY）"}
              <input
                value={amountJpy}
                onChange={(event) =>
                  setAmountJpy(event.target.value.replace(/\D/g, ""))
                }
                inputMode="numeric"
                className="mt-1 h-11 w-full border border-border bg-bg px-2 text-fg"
              />
            </label>
            <button
              type="button"
              disabled={paypalBusy}
              onClick={checkout}
              className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 bg-accent px-3 text-bg disabled:opacity-60"
            >
              <CircleDollarSign className="size-4" />
              {paypalBusy
                ? lang === "en"
                  ? "Processing…"
                  : "処理中…"
                : "PayPal"}
            </button>
            <p className="mt-2 text-[11px] leading-relaxed text-dim">
              {lang === "en"
                ? "Payment is approved in PayPal. Bank account linking, transfers, and withdrawals are not available."
                : "PayPalの承認画面で決済を確定します。銀行口座連携・送金・出金は提供しません。"}
            </p>
            {paypalStatus ? (
              <p className="mt-2 text-[11px] text-ok">{paypalStatus}</p>
            ) : null}
          </div>
          <RailDesk mode="in" />
        </section>
      </div>
    </div>
  );
}

function makeCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function qrMatrix(seed: string) {
  const n = 21;
  const cells: boolean[][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => false),
  );
  let h = 0;
  for (let i = 0; i < seed.length; i++)
    h = Math.imul(31, h) + seed.charCodeAt(i);
  const rand = () => {
    h = (Math.imul(1664525, h) + 1013904223) | 0;
    return (h >>> 0) / 2 ** 32;
  };
  const finder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const inner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        cells[oy + y][ox + x] = edge || inner;
      }
    }
  };
  finder(0, 0);
  finder(n - 7, 0);
  finder(0, n - 7);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (cells[y][x]) continue;
      if ((x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8))
        continue;
      cells[y][x] = rand() > 0.52;
    }
  }
  return cells;
}

function QrGrid({ matrix }: { matrix: boolean[][] }) {
  const n = matrix.length;
  return (
    <svg
      viewBox={`0 0 ${n} ${n}`}
      className="size-[220px]"
      shapeRendering="crispEdges"
      aria-hidden
    >
      <rect width={n} height={n} fill="#f5f5f0" />
      {matrix.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill="#020408"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}
