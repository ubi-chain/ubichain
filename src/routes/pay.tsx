import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RefreshCw, Nfc, QrCode, Building2 } from "lucide-react";
import { useUbi } from "@/lib/ubi/store";
import { yen } from "@/lib/ubi/format";
import { DonorRailPanel } from "@/components/donor-rail";
import { RailDesk } from "@/components/rail-desk";

export const Route = createFileRoute("/pay")({ component: PayPage });

function PayPage() {
  const { lang, user, donorBatches, pulseDonorRail } = useUbi();
  const [code, setCode] = useState("482917");
  const [tab, setTab] = useState<"code" | "qr" | "nfc">("qr");
  const matrix = useMemo(() => qrMatrix(code), [code]);
  const balance = user?.balance ?? 1_240_000;
  const monthly = user?.monthlyUbi ?? 17400;

  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-border px-4 py-3">
        <div className="font-mono text-[10px] tracking-[0.2em] text-muted">サブドメイン: pay.ubi-chain.com</div>
        <h1 className="font-mono text-xl font-semibold text-fg">
          {lang === "en" ? "One-time pay" : "ワンタイム決済"}
        </h1>
        <p className="font-mono text-[11px] text-dim">
          {lang === "en" ? "QR · PayPal · Pay-easy" : "QR・PayPal・Pay-easy"}
        </p>
      </div>
      <DonorRailPanel lang={lang} batches={donorBatches} onPulse={pulseDonorRail} />

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
                {id === "qr" ? "QR" : id === "code" ? (lang === "en" ? "Code" : "コード") : "NFC"}
              </button>
            ))}
          </div>

          {tab === "qr" ? (
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-md bg-fg p-3">
                <QrGrid matrix={matrix} />
              </div>
              <div className="font-mono text-[11px] text-muted">
                {lang === "en" ? "Valid 5 minutes · single use" : "有効期限5分 · 1回限り"}
              </div>
            </div>
          ) : null}

          {tab === "code" ? (
            <div className="text-center">
              <div className="font-mono text-[11px] tracking-[0.3em] text-muted">
                {lang === "en" ? "ONE-TIME CODE" : "ワンタイムコード"}
              </div>
              <div className="my-3 font-mono text-4xl tracking-[0.35em] text-accent tabular">{code}</div>
              <p className="font-mono text-[11px] text-danger">
                {lang === "en" ? "Do not share this code." : "このコードは他人に教えないでください"}
              </p>
            </div>
          ) : null}

          {tab === "nfc" ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="grid size-20 place-items-center rounded-full border border-accent/40 bg-accent/10 text-accent">
                <Nfc className="size-9" />
              </div>
              <div className="font-mono text-sm text-fg">
                {lang === "en" ? "Hold phone to infrastructure terminal" : "スマホをインフラ端末にタッチ"}
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
            <div className="text-[10px] tracking-widest text-muted">{lang === "en" ? "BALANCE" : "残高"}</div>
            <div className="text-2xl tabular text-accent">{yen(balance)}</div>
            <div className="mt-1 text-[11px] text-dim">
              {lang === "en" ? "Monthly UBI" : "月額UBI"} {yen(monthly)}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4 font-mono text-[12px]">
            <div className="mb-2 text-[10px] tracking-widest text-muted">
              {lang === "en" ? "WALLETS" : "連携"}
            </div>
            <Row icon={<Building2 className="size-4" />} label="PayPal" value={lang === "en" ? "Ledger" : "台帳"} />
            <Row icon={<QrCode className="size-4" />} label="Pay-easy" value={lang === "en" ? "Dummy slip" : "ダミー伝票"} />
            <Row
              icon={<Building2 className="size-4" />}
              label={lang === "en" ? "Banks" : "銀行入金"}
              value={user?.bankDeposited ? yen(user.bankDeposited) : lang === "en" ? "Open" : "受付中"}
            />
          </div>

          <div className="rounded-lg border border-border bg-panel p-4 font-mono text-[11px] leading-relaxed text-dim">
            {lang === "en"
              ? "Current phase is a stability guarantee. Capital still sits in banks — megabanks can fail too. Deposit from a regional bank or a megabank into the public reserve."
              : "現行は経済の安定保障です。資本はまだ銀行にあります。メガバンクも倒産しうるので、地方銀行・メガバンクの両方から保障準備金へ入金できます。"}
            <Link to="/banks" className="mt-2 block text-accent">
              {lang === "en" ? "Deposit from a bank →" : "銀行から入金する →"}
            </Link>
          </div>
          <RailDesk mode="in" />
        </section>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-border py-2 last:border-0">
      <span className="text-accent">{icon}</span>
      <span className="flex-1 text-fg">{label}</span>
      <span className="text-ok">{value}</span>
    </div>
  );
}

function makeCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function qrMatrix(seed: string) {
  const n = 21;
  const cells: boolean[][] = Array.from({ length: n }, () => Array.from({ length: n }, () => false));
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i);
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
      if ((x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8)) continue;
      cells[y][x] = rand() > 0.52;
    }
  }
  return cells;
}

function QrGrid({ matrix }: { matrix: boolean[][] }) {
  const n = matrix.length;
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="size-[220px]" shapeRendering="crispEdges" aria-hidden>
      <rect width={n} height={n} fill="#f5f5f0" />
      {matrix.map((row, y) =>
        row.map((on, x) => (on ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#020408" /> : null)),
      )}
    </svg>
  );
}
