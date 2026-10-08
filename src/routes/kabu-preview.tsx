import { createFileRoute } from "@tanstack/react-router";
import { KABU_CONNECTION, KABU_PREVIEW } from "@/lib/ubi/kabu-preview";

export const Route = createFileRoute("/kabu-preview")({ component: KabuPreview });

function KabuPreview() {
  return (
    <section className="h-full overflow-y-auto p-4 font-mono text-sm">
      <h1 className="text-xl text-accent">証券API照会 · 接続準備</h1>
      <p role="status" className="mt-3 border border-accent p-3">
        デモデータのみ。実口座は未接続。売買・送金・資金受入れはできません。
      </p>
      <dl className="mt-4 space-y-2">
        <div><dt>接続状態</dt><dd>{KABU_CONNECTION.connected ? "接続済み" : "未接続（デモ）"}</dd></div>
        <div><dt>架空の取引余力</dt><dd>¥{KABU_PREVIEW.buyingPowerYen.toLocaleString("ja-JP")}</dd></div>
      </dl>
      <h2 className="mt-5 text-accent">架空の保有残高</h2>
      <ul>{KABU_PREVIEW.positions.map((p) => <li key={p.symbol}>{p.name} · {p.quantity}株</li>)}</ul>
      <h2 className="mt-5 text-accent">架空の約定情報</h2>
      <ul>{KABU_PREVIEW.orders.map((o) => <li key={o.id}>{o.id} · {o.status}</li>)}</ul>
      <p className="mt-5 text-muted">金融機関の利用条件を確認するまで、認証情報の入力・API通信は実装しません。</p>
    </section>
  );
}
