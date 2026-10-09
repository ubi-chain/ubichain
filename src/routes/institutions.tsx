import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CONFIRMED, NOT_IMPLEMENTED, UNKNOWNS } from "@/lib/ubi/institution-catalog";
import { readInstitutionDesk, type InstitutionDesk } from "@/lib/ubi/institution-inquiry";
import { tx } from "@/lib/ubi/i18n";
import { useUbi } from "@/lib/ubi/store";

export const Route = createFileRoute("/institutions")({ component: InstitutionsPage });

function InstitutionsPage() {
  const { lang, user } = useUbi();
  const [consent, setConsent] = useState(false);
  const [desk, setDesk] = useState<InstitutionDesk | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load(nextConsent: boolean) {
    setBusy(true);
    setError("");
    try {
      const result = await readInstitutionDesk({ data: { consent: nextConsent } });
      setDesk(result);
    } catch {
      setDesk(null);
      setError(tx(lang, { ja: "アプリのログインが必要です。銀行のパスワードは受け取りません。", en: "App sign-in is required. A bank password is not accepted.", fr: "Connexion à l'app requise. Aucun mot de passe bancaire.", zh: "需要登录应用。不接收银行密码。" }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto font-mono">
      <div className="border-b border-border px-4 py-3">
        <div className="text-[10px] tracking-[0.2em] text-accent">DEMO / UNCONNECTED</div>
        <h1 className="text-xl font-semibold text-fg">
          {tx(lang, { ja: "銀行・証券の照会", en: "Bank and brokerage inquiry", fr: "Consultation banque et courtage", zh: "银行与证券查询" })}
        </h1>
        <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-dim">
          {tx(lang, {
            ja: "デモ／未接続。実口座にはつながっていません。送金・発注・自動売買はありません。照会結果はAIへ送りません。",
            en: "Demo / not connected. No live account. No transfers, orders, or automated trading. Inquiry results are not sent to AI.",
            fr: "Démo / non connecté. Aucun compte réel. Pas de virement ni d'ordre. Rien n'est envoyé à l'IA.",
            zh: "演示／未连接。没有真实账户。不转账、不下单。结果不会发给AI。",
          })}
        </p>
      </div>

      <section className="grid gap-2 border-b border-border px-4 py-4 sm:grid-cols-3">
        <Stat k={tx(lang, { ja: "アプリ", en: "App", fr: "App", zh: "应用" })} v={user ? tx(lang, { ja: "ログイン済み", en: "Signed in", fr: "Connecté", zh: "已登录" }) : tx(lang, { ja: "未ログイン", en: "Signed out", fr: "Déconnecté", zh: "未登录" })} />
        <Stat k={tx(lang, { ja: "三菱UFJ銀行", en: "MUFG Bank", fr: "Banque MUFG", zh: "三菱UFJ银行" })} v={tx(lang, { ja: "未接続", en: "Not connected", fr: "Non connecté", zh: "未连接" })} />
        <Stat k={tx(lang, { ja: "eスマート証券", en: "eSmart Securities", fr: "eSmart Securities", zh: "eSmart证券" })} v={tx(lang, { ja: "未接続", en: "Not connected", fr: "Non connecté", zh: "未连接" })} />
      </section>

      <section className="border-b border-border px-4 py-4">
        <p className="text-[12px] text-dim">
          {tx(lang, {
            ja: "サイト内のSMSログインだけです。銀行・証券のパスワード欄はありません。",
            en: "Only this site's SMS sign-in. There is no bank or brokerage password field.",
            fr: "Seule la connexion SMS du site. Pas de champ de mot de passe bancaire.",
            zh: "只有本站短信登录。没有银行或证券密码栏。",
          })}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/register" className="inline-flex h-11 items-center border border-accent px-3 text-[12px] text-accent">
            {tx(lang, { ja: "ログイン", en: "Sign in", fr: "Connexion", zh: "登录" })}
          </Link>
          <button type="button" disabled={busy} onClick={() => load(false)} className="h-11 border border-border px-3 text-[12px] text-fg disabled:opacity-60">
            {tx(lang, { ja: "接続状況", en: "Status", fr: "État", zh: "连接状态" })}
          </button>
        </div>
        <label className="mt-4 flex items-start gap-2 text-[12px] text-fg">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
          <span>
            {tx(lang, {
              ja: "デモ照会をこの画面に出すことに同意する。AIへは送らない。実残高ではない。",
              en: "I agree to show the demo inquiry on this screen only. Not sent to AI. Not a live balance.",
              fr: "J'accepte l'affichage de la démo ici seulement. Pas d'envoi à l'IA. Pas un solde réel.",
              zh: "同意仅在此画面显示演示查询。不发给AI。不是真实余额。",
            })}
          </span>
        </label>
        <button
          type="button"
          disabled={!consent || busy}
          onClick={() => load(true)}
          className="mt-3 h-11 bg-accent px-3 text-[12px] text-bg disabled:opacity-40"
        >
          {tx(lang, { ja: "デモ照会を表示", en: "Show demo inquiry", fr: "Afficher la démo", zh: "显示演示查询" })}
        </button>
        {error ? <p className="mt-3 text-[12px] text-danger">{error}</p> : null}
      </section>

      {desk ? (
        <section className="border-b border-border px-4 py-4">
          <p className="text-[11px] tracking-[0.16em] text-accent">
            {desk.mode === "demo" ? "デモ／未接続" : desk.mode} · {desk.bank} · {desk.securities} · AI {desk.sentToAi ? "sent" : "not sent"}
          </p>
          <p className="mt-2 max-w-2xl text-[12px] text-dim">{desk.note}</p>
          <p className="mt-2 text-[11px] text-muted">
            MUFG slot {desk.mufgSlot ? "present" : "empty"} · kabu slot {desk.kabuSlot ? "present" : "empty"}
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Rows title={tx(lang, { ja: "銀行（架空）", en: "Bank (fictional)", fr: "Banque (fictif)", zh: "银行（虚构）" })} rows={desk.bankRows} />
            <Rows title={tx(lang, { ja: "証券（架空）", en: "Securities (fictional)", fr: "Titres (fictif)", zh: "证券（虚构）" })} rows={desk.securitiesRows} />
          </div>
          <h2 className="mt-4 text-[11px] tracking-[0.16em] text-muted">
            {tx(lang, { ja: "この利用者の操作履歴", en: "This user's audit", fr: "Journal de cet utilisateur", zh: "此用户的操作记录" })}
          </h2>
          <ul className="mt-2 space-y-1 text-[11px] text-dim">
            {desk.audit.map((row) => (
              <li key={`${row.at}-${row.action}`}>{row.at} · {row.action}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="px-4 py-4">
        <h2 className="text-[11px] tracking-[0.16em] text-muted">
          {tx(lang, { ja: "公開ページで確認できた照会", en: "Reads named on the public pages", fr: "Lectures nommées publiquement", zh: "公开页面已写明的查询" })}
        </h2>
        <ul className="mt-2 space-y-2 text-[12px]">
          {CONFIRMED.map((item) => (
            <li key={item.id} className="border border-border px-3 py-2">
              <div className="text-fg">{item.name}</div>
              <div className="text-dim">{item.note}</div>
            </li>
          ))}
        </ul>
        <h2 className="mt-4 text-[11px] tracking-[0.16em] text-muted">
          {tx(lang, { ja: "実装しないもの", en: "Not implemented", fr: "Non implémenté", zh: "不实现" })}
        </h2>
        <ul className="mt-2 space-y-2 text-[12px]">
          {NOT_IMPLEMENTED.map((item) => (
            <li key={item.id} className="border border-border px-3 py-2 text-dim">{item.name} — {item.note}</li>
          ))}
        </ul>
        <h2 className="mt-4 text-[11px] tracking-[0.16em] text-muted">
          {tx(lang, { ja: "公開ページでは不明", en: "Unknown on the public pages", fr: "Inconnu sur les pages publiques", zh: "公开页面未说明" })}
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-dim">
          {UNKNOWNS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="border border-border px-3 py-2">
      <div className="text-[10px] tracking-widest text-muted">{k}</div>
      <div className="text-fg">{v}</div>
    </div>
  );
}

function Rows({ title, rows }: { title: string; rows: { label: string; value: string; hint: string }[] }) {
  return (
    <div>
      <h2 className="text-[11px] tracking-[0.16em] text-muted">{title}</h2>
      {rows.length === 0 ? <p className="mt-2 text-[12px] text-dim">—</p> : null}
      <ul className="mt-2 space-y-2">
        {rows.map((row) => (
          <li key={row.label} className="border border-border px-3 py-2">
            <div className="flex justify-between gap-3 text-fg"><span>{row.label}</span><span>{row.value}</span></div>
            <div className="text-[11px] text-dim">{row.hint}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
