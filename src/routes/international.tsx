import { createFileRoute, Link } from "@tanstack/react-router";
import { DeskFrame } from "@/components/desk-frame";
import { useUbi } from "@/lib/ubi/store";
import { HAZARD_COUNTRIES, hazardLabel, kindLabel } from "@/lib/ubi/returns";
import { compactYen } from "@/lib/ubi/format";
import { isAdminPhone, maskPhone } from "@/lib/ubi/admin";
import { APPLIED_TASKS, LAW_ARTICLES, MANIFESTO_SMS, SKIPPED_PRIVATE, TIMELINE, manifestoSmsHref } from "@/lib/ubi/iii";
import { CHARTER } from "@/lib/ubi/charter";
import { tx } from "@/lib/ubi/i18n";

export const Route = createFileRoute("/international")({ component: InternationalPage });

function InternationalPage() {
  const { lang, user } = useUbi();
  const admin = isAdminPhone(user?.phone);
  return (
    <DeskFrame
      lang={lang}
      kicker={tx(lang, { ja: "新インターナショナル · 共栄科学社会主義", en: "New International · co-prosperity scientific socialism", fr: "Nouvelle Internationale · socialisme scientifique de coprospérité" })}
      title={tx(lang, { ja: "公約", en: "Program", fr: "Programme" })}
      lede={tx(lang, {
        ja: "前文、十五章、終章。固定された教義ではありません。科学的方法と民主的議論で不断に検証します。",
        en: "Preamble, fifteen chapters, and a close. Not a fixed dogma. Continually verified by scientific method and democratic debate.",
        fr: "Préambule, quinze chapitres, clôture. Pas un dogme fixe. Vérifié sans relâche par la méthode scientifique et le débat démocratique.",
      })}
    >
      <div className="flex flex-wrap gap-4 border-b border-border px-4 py-3 text-[11px]">
        <Meta k={lang === "en" ? "Members" : lang === "fr" ? "Membres" : "加盟"} v="94" />
        <Meta k={lang === "en" ? "Founded" : lang === "fr" ? "Fondée" : "設立"} v="2026" />
        <Meta k={lang === "en" ? "Charter" : lang === "fr" ? "Charte" : "公約"} v="15" />
      </div>

      <section className="border-b border-border px-4 py-4">
        <div className="text-[10px] tracking-[0.2em] text-muted">
          {tx(lang, { ja: "第三インターナショナル 2026", en: "THIRD INTERNATIONAL 2026", fr: "TROISIÈME INTERNATIONALE 2026" })}
        </div>
        <ol className="mt-3 space-y-3">
          {TIMELINE.map((row) => (
            <li key={row.year} className="grid grid-cols-[5.5rem_1fr] gap-3 text-[12px]">
              <span className="tabular text-accent">{row.year}</span>
              <span className="text-dim">{tx(lang, { ja: row.ja, en: row.en, fr: row.fr })}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-b border-border px-4 py-4">
        <div className="text-[10px] tracking-[0.2em] text-muted">
          {tx(lang, { ja: "法と国家 → 国際法", en: "RIGHT AND STATE → INTERNATIONAL LAW", fr: "DROIT ET ÉTAT → DROIT INTERNATIONAL" })}
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {LAW_ARTICLES.map((a) => (
            <article key={a.id} className="rounded-sm border border-border bg-surface p-3">
              <div className="text-[10px] text-accent">Art. {a.id}</div>
              <p className="mt-1 text-[12px] leading-relaxed text-dim">{tx(lang, { ja: a.ja, en: a.en, fr: a.fr })}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-b border-border px-4 py-4">
        <div className="text-[10px] tracking-[0.2em] text-muted">
          {tx(lang, { ja: "先天・後天の福祉", en: "CONGENITAL / ACQUIRED CARE", fr: "SOIN CONGÉNITAL / ACQUIS" })}
        </div>
        <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-dim">
          {tx(lang, {
            ja: "障害の有無は例外ではなく定番です。共同体リスクのある人への福祉送金を厚くします。家計の学習はケアを切りません。",
            en: "Disability is ordinary, not an exception. Remittances thicken for community risk. Household learning never cuts care.",
            fr: "Le handicap est ordinaire, pas une exception. Les virements s'épaississent. Le budget ne coupe jamais le soin.",
          })}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <article className="rounded-sm border border-border bg-surface p-3">
            <div className="text-[10px] text-accent">{tx(lang, { ja: "先天", en: "Congenital", fr: "Congénital" })}</div>
            <p className="mt-1 text-[12px] text-dim">
              {tx(lang, { ja: "生まれついての条件を、申請の特例にしない。", en: "A condition from birth is not a special petition.", fr: "Une condition de naissance n'est pas une requête spéciale." })}
            </p>
          </article>
          <article className="rounded-sm border border-border bg-surface p-3">
            <div className="text-[10px] text-accent">{tx(lang, { ja: "後天", en: "Acquired", fr: "Acquis" })}</div>
            <p className="mt-1 text-[12px] text-dim">
              {tx(lang, { ja: "途中で負った条件も同じ定番。ケアの最低線は残す。", en: "A condition acquired later is the same ordinary. The care floor stays.", fr: "Une condition acquise plus tard reste ordinaire. Le plancher de soin demeure." })}
            </p>
          </article>
        </div>
        <Link to="/ledger" className="mt-3 inline-flex h-11 items-center text-[12px] text-accent">
          {tx(lang, { ja: "家計でケアの最低線を残す →", en: "Keep the care floor in the ledger →", fr: "Garder le plancher de soin →" })}
        </Link>
      </section>

      <section className="border-b border-border px-4 py-4">
        <div className="text-[10px] tracking-[0.2em] text-muted">
          {tx(lang, { ja: "公約SMS · 宣言の応用", en: "PLEDGE SMS · FROM THE MANIFESTO", fr: "SMS D'ENGAGEMENT · MANIFESTE" })}
        </div>
        <p className="mt-2 max-w-2xl font-serif text-[14px] leading-relaxed text-fg">
          {lang === "fr" ? MANIFESTO_SMS.fr : lang === "en" ? MANIFESTO_SMS.en : MANIFESTO_SMS.ja}
        </p>
        {user ? (
          <SmsPledge phone={user.phone} lang={lang === "fr" ? "fr" : lang === "en" ? "en" : "ja"} />
        ) : (
          <Link to="/register" className="mt-3 inline-flex h-11 items-center border border-accent px-4 text-[12px] text-accent">
            {tx(lang, { ja: "SMS送信認証のあと、公約を送る", en: "After SMS auth, send the pledge", fr: "Après l'auth SMS, envoyer l'engagement" })}
          </Link>
        )}
      </section>

      <section className="border-b border-border px-4 py-4 text-[11px]">
        <div className="text-[10px] tracking-[0.2em] text-muted">
          {tx(lang, { ja: "手帳から適用 / 私的予定は除外", en: "FROM THE NOTEBOOK / PRIVATE SCHEDULE SKIPPED", fr: "DU CARNET / AGENDA PRIVÉ EXCLU" })}
        </div>
        <ul className="mt-2 space-y-1 text-dim">
          {APPLIED_TASKS.map((row) => (
            <li key={row.en}>· {lang === "en" || lang === "fr" ? row.en : row.ja}</li>
          ))}
        </ul>
        <div className="mt-3 text-[10px] tracking-widest text-muted">
          {tx(lang, { ja: "除外（実行しない）", en: "SKIPPED", fr: "EXCLU" })}
        </div>
        <ul className="mt-1 space-y-1 text-muted">
          {SKIPPED_PRIVATE.map((row) => (
            <li key={row.en}>· {lang === "en" || lang === "fr" ? row.en : row.ja}</li>
          ))}
        </ul>
      </section>

      <div className="mx-auto max-w-2xl space-y-8 px-4 py-6">
        {CHARTER.map((block) => (
          <article key={block.id}>
            <h2 className="font-mono text-[10px] tracking-[0.2em] text-accent">{tx(lang, block.title)}</h2>
            <div className="mt-3 space-y-3">
              {block.paras.map((p) => (
                <p key={p.ja} className="text-[13px] leading-relaxed text-fg">
                  {tx(lang, p)}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>

      <ReturnRail lang={lang} />

      <div className="px-4 pb-8">
        {user ? (
          <div className="rounded-lg border border-ok/40 bg-ok/10 px-4 py-3 text-[12px] text-ok">
            {lang === "en" ? "Registered member" : "党員登録済み"} · {user.memberId}
            {admin ? (lang === "en" ? ` · admin ${maskPhone(user.phone)}` : ` · 管理者 ${maskPhone(user.phone)}`) : ""}
          </div>
        ) : (
          <Link
            to="/register"
            className="inline-flex rounded-md bg-accent px-5 py-2.5 text-[12px] font-semibold text-bg"
          >
            {lang === "en" ? "Join as a member" : "党員として参加する"}
          </Link>
        )}
      </div>
    </DeskFrame>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-muted">{k}</div>
      <div className="text-fg">{v}</div>
    </div>
  );
}

function SmsPledge({ phone, lang }: { phone: string; lang: "ja" | "en" | "fr" }) {
  const hrefs = manifestoSmsHref(phone, lang);
  if (!hrefs) return null;
  const open = () => {
    const ua = navigator.userAgent;
    window.location.href = /Android/i.test(ua) ? hrefs.android : hrefs.ios;
  };
  return (
    <button type="button" onClick={open} className="mt-3 h-11 rounded-sm bg-accent px-4 text-[12px] font-semibold text-bg">
      {lang === "en" ? "Send pledge via carrier SMS" : lang === "fr" ? "Envoyer l'engagement par SMS" : "キャリアSMSで公約を送る"}
    </button>
  );
}

function ReturnRail({ lang }: { lang: string }) {
  const flows = useUbi((s) => s.returns);
  const en = lang === "en";
  return (
    <div className="border-t border-border px-4 py-4">
      <div className="text-[10px] tracking-[0.2em] text-muted">{en ? "INSOLVENCY RETURN" : "倒産資本の分散返還"}</div>
      <h2 className="mt-1 text-[15px] font-semibold text-fg">
        {en ? "Failing corps return first to war, conflict, disaster" : "公社・公司・委員会 → 戦争・紛争・災害国"}
      </h2>
      <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-dim">
        {en
          ? "The admin line trained the model: capital trapped in insolvent public corps, companies, and committees is returned, with extra weight for countries under war, then conflict, then disaster."
          : "管理者回線で学習した方針です。倒産リスクのある公社・公司・委員会に滞留した資本を分散返還し、戦争、次いで紛争、災害の国を厚くします。"}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {HAZARD_COUNTRIES.map((c) => (
          <span
            key={c.code}
            className={`rounded-sm border px-2 py-1 text-[10px] ${
              c.hazard === "war"
                ? "border-danger/50 text-danger"
                : c.hazard === "conflict"
                  ? "border-alert/50 text-alert"
                  : "border-accent/40 text-accent"
            }`}
          >
            {en ? c.en : c.ja} · {hazardLabel(c.hazard, lang)}
          </span>
        ))}
      </div>
      <div className="mt-3 overflow-hidden rounded-lg border border-border">
        {flows.length === 0 ? (
          <div className="px-3 py-4 text-[11px] text-muted">{en ? "Waiting for the next return tick…" : "次の返還ティックを待っています…"}</div>
        ) : (
          flows.slice(0, 8).map((row) => (
            <div key={row.id} className="flex items-baseline justify-between gap-3 border-b border-border px-3 py-2 text-[11px] last:border-b-0">
              <div className="min-w-0">
                <span className="text-dim">{kindLabel(row.kind, lang)}</span>{" "}
                <span className="text-fg">{en ? row.entityEn : row.entityJa}</span>
                <span className="text-muted"> → </span>
                <span className={row.hazard === "war" ? "text-danger" : "text-accent"}>
                  {en ? row.toEn : row.toJa}
                </span>
              </div>
              <span className="shrink-0 tabular text-ok">{compactYen(row.amountJpy, lang)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
