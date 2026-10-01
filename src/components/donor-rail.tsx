import { Link } from "@tanstack/react-router";
import { AFFILIATES, DONOR_BATCH_YEN, DONOR_PHONE, donorSmsHref, type DonorBatch } from "@/lib/ubi/donor-rail";
import { yen } from "@/lib/ubi/format";
import { tx, type Lang } from "@/lib/ubi/i18n";

export function DonorRailPanel({
  lang,
  batches,
  onPulse,
}: {
  lang: Lang;
  batches: DonorBatch[];
  onPulse: () => DonorBatch | null;
}) {
  const latest = batches[0];
  const hrefs = donorSmsHref(latest ?? { id: "preview", from: "08057256673", at: "", yen: DONOR_BATCH_YEN, legs: AFFILIATES.map((a) => ({ to: a.id, yen: a.yen, ja: a.ja, path: a.path })) });

  return (
    <section className="border-b border-border px-4 py-4">
      <div className="font-mono text-[10px] tracking-[0.2em] text-accent">
        {tx(lang, { ja: "出金元", en: "SOURCE", fr: "SOURCE" })} · {DONOR_PHONE}
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-dim">
        {tx(lang, {
          ja: "提携サービスへの振込は、この番号から台帳へ入ります。実口座は動かしません。控えはSMSです。",
          en: "Affiliated services are credited on the ledger from this number. No real bank moves. SMS is the receipt.",
          fr: "Les services affiliés sont crédités au grand livre depuis ce numéro. Pas de virement réel. SMS = reçu.",
        })}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {AFFILIATES.map((a) => (
          <Link key={a.id} to={a.path} className="flex h-11 items-center justify-between border border-border bg-surface px-3 font-mono text-[11px] text-fg">
            <span>{lang === "en" ? a.en : a.ja}</span>
            <span className="text-accent">{yen(a.yen)}</span>
          </Link>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="h-11 bg-accent px-4 font-mono text-[12px] font-semibold text-bg"
          onClick={() => onPulse()}
        >
          {tx(lang, { ja: "この番号から振り込む", en: "Pulse from this number", fr: "Virer depuis ce numéro" })}
        </button>
        <a href={hrefs.ios} className="grid h-11 place-items-center border border-accent px-4 font-mono text-[12px] text-accent">
          {tx(lang, { ja: "SMS控え", en: "SMS receipt", fr: "Reçu SMS" })}
        </a>
      </div>
      {latest ? (
        <p className="mt-3 font-mono text-[11px] text-ok">
          {new Date(latest.at).toLocaleString("ja-JP")} · {yen(latest.yen)} · {latest.legs.length}
          {tx(lang, { ja: "件", en: " legs", fr: " legs" })}
        </p>
      ) : null}
    </section>
  );
}
