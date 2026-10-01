import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Building2, Landmark, ShieldCheck, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
  BANK_COUNTRIES,
  bankFailRisk,
  bankName,
  bankTier,
  countryName,
  depositPresets,
  failRiskTone,
  fxToJpy,
  regionName,
  toJpy,
  type BankTier,
  type RegionalBank,
} from "@/lib/ubi/banks";
import { compactYen, money, yen } from "@/lib/ubi/format";
import { useUbi, type BankDeposit } from "@/lib/ubi/store";
import { DonorRailPanel } from "@/components/donor-rail";

export const Route = createFileRoute("/banks")({ component: BanksPage });

const TONE: Record<ReturnType<typeof failRiskTone>, string> = {
  ok: "text-ok",
  warn: "text-warn",
  alert: "text-alert",
  danger: "text-danger",
};

function kindLabel(tier: BankTier, en: boolean) {
  return tier === "mega" ? (en ? "Megabank" : "メガバンク") : en ? "Regional" : "地方銀行";
}

function BanksPage() {
  const {
    lang,
    user,
    linkedBanks,
    deposits,
    bankPool,
    bankCapital,
    liveInflows,
    bankStress,
    linkBank,
    depositFromBank,
    pulseDonorRail,
    donorBatches,
    totalUbi,
  } = useUbi();
  const [countryCode, setCountryCode] = useState("JP");
  const [tierFilter, setTierFilter] = useState<"all" | BankTier>("all");
  const [bankId, setBankId] = useState(BANK_COUNTRIES[0].banks[0].id);
  const [last4, setLast4] = useState("");
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("50000");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<BankDeposit | null>(null);

  const country = BANK_COUNTRIES.find((c) => c.code === countryCode) ?? BANK_COUNTRIES[0];
  const visibleBanks = useMemo(() => {
    if (tierFilter === "all") return country.banks;
    return country.banks.filter((b) => bankTier(b) === tierFilter);
  }, [country, tierFilter]);
  const presets = useMemo(() => depositPresets(country.currency), [country.currency]);
  const coverage = Math.min(99.9, (bankPool / Math.max(totalUbi, 1)) * 100);
  const localAmount = Number(amount) || 0;
  const jpyAmount = toJpy(localAmount, country.currency);
  const selectedAccount = linkedBanks.find((b) => b.id === accountId) ?? linkedBanks.find((b) => b.bankId === bankId);
  const ranked = [...BANK_COUNTRIES].sort((a, b) => b.capitalJpy - a.capitalJpy).slice(0, 8);
  const maxCapital = ranked[0]?.capitalJpy || 1;
  const en = lang === "en";
  const watch = bankStress.filter((s) => s.failRisk >= 0.38).slice(0, 8);
  const hottest = bankStress[0];

  const pickFirst = (code: string, filter: "all" | BankTier) => {
    const next = BANK_COUNTRIES.find((c) => c.code === code);
    if (!next) return;
    const list = filter === "all" ? next.banks : next.banks.filter((b) => bankTier(b) === filter);
    const first = list[0] ?? next.banks[0];
    if (first) setBankId(first.id);
  };

  const onCountry = (code: string) => {
    setCountryCode(code);
    const next = BANK_COUNTRIES.find((c) => c.code === code);
    if (next) setAmount(String(depositPresets(next.currency)[1]));
    pickFirst(code, tierFilter);
    setError("");
  };

  const onFilter = (filter: "all" | BankTier) => {
    setTierFilter(filter);
    pickFirst(countryCode, filter);
  };

  const submit = () => {
    let account = selectedAccount && selectedAccount.bankId === bankId ? selectedAccount : null;
    if (!account) {
      account = linkBank({ countryCode, bankId, last4 });
      if (!account) {
        setError(en ? "Enter the last 4 digits of the bank account." : "口座の下4桁を入力してください");
        return;
      }
      setAccountId(account.id);
    }
    const rec = depositFromBank(account.id, localAmount);
    if (!rec) {
      setError(en ? "Enter a deposit amount." : "入金額を入力してください");
      return;
    }
    setError("");
    setReceipt(rec);
  };

  return (
    <div className="h-full overflow-y-auto font-mono">
      <div className="border-b border-border px-4 py-3">
        <div className="text-[10px] tracking-[0.2em] text-muted">PHASE 1 · STABILITY GUARANTEE</div>
        <h1 className="text-xl font-semibold text-fg">{en ? "Economic stability guarantee" : "経済の安定保障"}</h1>
        <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-dim">
          {en
            ? "Megabanks can fail too — Lehman, SVB, Credit Suisse. UBICHAIN does not seize capital. Regional banks and megabanks both deposit into a public reserve that pays UBI and absorbs insolvency shocks."
            : "メガバンクも倒産します。リーマン、SVB、クレディスイスは規模では免れませんでした。UBICHAINは資本を奪いません。地方銀行とメガバンクの両方から入金を受け、公共の安定保障準備金がUBI支給と倒産ショックを吸収します。"}
        </p>
      </div>
      <DonorRailPanel lang={lang} batches={donorBatches} onPulse={pulseDonorRail} />

      <div className="grid grid-cols-2 gap-2 border-b border-border p-3 md:grid-cols-4">
        <Kpi label={en ? "Guarantee pool" : "保障準備金"} value={compactYen(bankPool, lang)} accent />
        <Kpi label={en ? "Still in banks" : "銀行内資本"} value={compactYen(bankCapital, lang)} />
        <Kpi label={en ? "Coverage" : "保障率"} value={`${coverage.toFixed(1)}%`} />
        <Kpi
          label={en ? "Highest mega risk" : "最高倒産リスク"}
          value={hottest ? `${Math.round(hottest.failRisk * 100)}%` : "—"}
          tone={hottest ? failRiskTone(hottest.failRisk) : undefined}
        />
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="rounded-lg border border-border bg-surface p-4">
          <div className="mb-3 flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted">
            <Building2 className="size-3.5 text-accent" />
            {en ? "DEPOSIT FROM A BANK" : "銀行から入金"}
          </div>

          <div className="flex gap-1.5">
            {(
              [
                ["all", en ? "All" : "全て"],
                ["mega", en ? "Megabanks" : "メガバンク"],
                ["regional", en ? "Regional" : "地方銀行"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => onFilter(key)}
                className={`h-11 rounded-md border px-3 text-[11px] ${
                  tierFilter === key ? "border-accent bg-accent/10 text-accent" : "border-border text-dim"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-3 text-[10px] tracking-widest text-muted">{en ? "COUNTRY" : "国"}</div>
          <div className="mt-1 flex gap-1.5 overflow-x-auto pb-1">
            {BANK_COUNTRIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => onCountry(c.code)}
                className={`h-11 shrink-0 rounded-md border px-3 text-[11px] ${
                  countryCode === c.code ? "border-accent bg-accent/10 text-accent" : "border-border text-dim"
                }`}
              >
                {c.code} {countryName(c, lang)}
              </button>
            ))}
          </div>

          <div className="mt-3 text-[10px] tracking-widest text-muted">{en ? "BANK" : "銀行"}</div>
          <div className="mt-1 grid max-h-52 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
            {visibleBanks.length === 0 ? (
              <p className="col-span-full py-4 text-[12px] text-muted">
                {en ? "No banks in this filter." : "この絞り込みに銀行がありません。"}
              </p>
            ) : (
              visibleBanks.map((b) => <BankPick key={b.id} bank={b} active={bankId === b.id} en={en} lang={lang} onPick={setBankId} />)
            )}
          </div>

          <label className="mt-3 block text-[10px] tracking-widest text-muted">
            {en ? "ACCOUNT LAST 4" : "口座 下4桁"}
            <input
              value={last4}
              onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              placeholder="1234"
              className="mt-1 h-11 w-full rounded-md border border-border bg-panel px-3 text-[14px] tracking-[0.3em] text-fg outline-none focus:border-accent"
            />
          </label>

          <div className="mt-4 border-t border-border pt-4">
            <div className="text-[10px] tracking-widest text-muted">
              {en ? `AMOUNT (${country.currency})` : `入金額（${country.currency}）`}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {presets.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setAmount(String(n))}
                  className={`h-11 rounded-md border px-3 text-[11px] ${
                    Number(amount) === n ? "border-accent bg-accent/10 text-accent" : "border-border text-dim"
                  }`}
                >
                  {money(n, country.currency)}
                </button>
              ))}
            </div>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              inputMode="decimal"
              className="mt-2 h-11 w-full rounded-md border border-border bg-panel px-3 text-[14px] tabular text-fg outline-none focus:border-accent"
            />
            <div className="mt-2 flex items-center justify-between text-[11px] text-dim">
              <span>{en ? "Into guarantee (JPY)" : "保障準備金へ（円換算）"}</span>
              <span className="tabular text-accent">{yen(jpyAmount)}</span>
            </div>
            {country.currency !== "JPY" ? (
              <div className="mt-1 text-[10px] text-muted">
                1 {country.currency} = {fxToJpy(country.currency).toLocaleString()} JPY
              </div>
            ) : null}

            {linkedBanks.length > 0 ? (
              <select
                value={selectedAccount?.id ?? ""}
                onChange={(e) => setAccountId(e.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-border bg-panel px-3 text-[12px] text-fg outline-none focus:border-accent"
              >
                {linkedBanks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {kindLabel(b.tier, en)} · {(en ? b.bankNameEn : b.bankNameJa) + " ···" + b.last4}
                  </option>
                ))}
              </select>
            ) : null}

            <button
              type="button"
              onClick={submit}
              className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent text-[13px] font-semibold text-bg"
            >
              {en ? "Deposit into stability guarantee" : "安定保障へ入金"}
              <ArrowRight className="size-4" />
            </button>
          </div>

          {error ? <p className="mt-3 text-[12px] text-danger">{error}</p> : null}

          {!user ? (
            <p className="mt-3 text-[11px] text-muted">
              {en ? "SMS register to attach deposits to your member card." : "SMS登録すると入金が党員カードに紐づきます。"}{" "}
              <Link to="/register" className="text-accent">
                {en ? "Register" : "登録"}
              </Link>
            </p>
          ) : (
            <p className="mt-3 text-[11px] text-dim">
              {en ? "UBI balance" : "UBI残高"} {yen(user.balance)}
            </p>
          )}
        </section>

        <div className="space-y-3">
          <section className="rounded-lg border border-danger/40 bg-surface p-4">
            <div className="mb-2 flex items-center gap-2 text-[10px] tracking-[0.2em] text-danger">
              <AlertTriangle className="size-3.5" />
              {en ? "MEGABANK INSOLVENCY WATCH" : "メガバンク 倒産ウォッチ"}
            </div>
            <p className="mb-3 text-[11px] leading-relaxed text-dim">
              {en
                ? "Too big to fail is not too big to go bankrupt. Deposits already in the guarantee stay if a SIFI collapses."
                : "大きすぎて潰せない、は倒産しないという意味ではありません。保障準備金へ移した預金は、メガバンクが倒れても残ります。"}
            </p>
            {watch.map((row) => {
              const tone = failRiskTone(row.failRisk);
              return (
                <div key={row.bankId} className="border-b border-border py-1.5 last:border-0">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="truncate text-fg">
                      {row.countryCode} · {en ? row.bankNameEn : row.bankNameJa}
                    </span>
                    <span className={`tabular ${TONE[tone]}`}>{Math.round(row.failRisk * 100)}%</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-panel">
                    <div
                      className={`h-full ${
                        tone === "danger" ? "bg-danger" : tone === "alert" ? "bg-alert" : "bg-warn"
                      }`}
                      style={{ width: `${Math.min(100, row.failRisk * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </section>

          <section className="rounded-lg border border-border bg-surface p-4">
            <div className="mb-2 flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted">
              <ShieldCheck className="size-3.5 text-ok" />
              {en ? "WHY MEGABANKS TOO" : "なぜメガバンクも対象か"}
            </div>
            <p className="text-[12px] leading-relaxed text-dim">
              {en
                ? "Until capital leaves the banking system, a UBI rail that ignores banks cannot fund itself. Regional books and mega books both sit on the same insolvency cliff. Both wire into the guarantee; the guarantee issues UBI. Abolishing banks is later — stability is now."
                : "資本が銀行にある限り、銀行を無視したUBIは資金源を持ちません。地方銀行もメガバンクも同じ倒産の崖にいます。両方から保障へ送金し、保障がUBIを出す。銀行廃止は先の話。いまの役割は安定保障です。"}
            </p>
          </section>

          <section className="rounded-lg border border-border bg-surface p-4">
            <div className="mb-2 text-[10px] tracking-[0.2em] text-muted">
              {en ? "CAPITAL STILL IN BANKS" : "資本が残る国"}
            </div>
            {ranked.map((c) => (
              <div key={c.code} className="py-1.5">
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="text-fg">
                    {c.code} {countryName(c, lang)}
                  </span>
                  <span className="tabular text-dim">{compactYen(c.capitalJpy, lang)}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-panel">
                  <div className="h-full bg-accent/70" style={{ width: `${(c.capitalJpy / maxCapital) * 100}%` }} />
                </div>
              </div>
            ))}
          </section>

          <section className="rounded-lg border border-border bg-surface p-4">
            <div className="mb-2 text-[10px] tracking-[0.2em] text-muted">{en ? "LINKED ACCOUNTS" : "連携口座"}</div>
            {linkedBanks.length === 0 ? (
              <p className="text-[12px] text-muted">{en ? "No bank linked yet." : "まだ銀行は未連携です。"}</p>
            ) : (
              linkedBanks.map((b) => (
                <div key={b.id} className="flex items-center justify-between border-b border-border py-2 text-[12px] last:border-0">
                  <span className="text-fg">
                    <span className="mr-2 text-[10px] text-muted">{kindLabel(b.tier, en)}</span>
                    {en ? b.bankNameEn : b.bankNameJa}
                  </span>
                  <span className="text-dim">···{b.last4}</span>
                </div>
              ))
            )}
          </section>

          <section className="rounded-lg border border-border bg-surface p-4">
            <div className="mb-2 text-[10px] tracking-[0.2em] text-muted">{en ? "YOUR DEPOSITS" : "入金履歴"}</div>
            {deposits.length === 0 ? (
              <p className="text-[12px] text-muted">{en ? "No deposits yet." : "入金はまだありません。"}</p>
            ) : (
              deposits.slice(0, 8).map((d) => (
                <div key={d.id} className="flex items-center justify-between border-b border-border py-2 text-[12px] last:border-0">
                  <span className="truncate text-fg">{en ? d.bankNameEn : d.bankNameJa}</span>
                  <span className="tabular text-ok">+{yen(d.amount)}</span>
                </div>
              ))
            )}
          </section>

          <section className="rounded-lg border border-border bg-panel p-4">
            <div className="mb-2 flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted">
              <Landmark className="size-3.5 text-accent" />
              {en ? "LIVE BANK INFLOWS" : "銀行 ライブ入金"}
            </div>
            {(liveInflows.length ? liveInflows : []).slice(0, 10).map((row) => (
              <div key={row.id} className="flex items-center justify-between py-1.5 text-[11px]">
                <span className="truncate text-dim">
                  {row.countryCode} · {row.tier === "mega" ? (en ? "MEGA" : "メガ") : (en ? "REG" : "地方")} ·{" "}
                  {en ? row.bankNameEn : row.bankNameJa}
                </span>
                <span className="tabular text-accent">{yen(row.amountJpy)}</span>
              </div>
            ))}
            {liveInflows.length === 0 ? (
              <p className="text-[12px] text-muted">{en ? "Waiting for bank inflows…" : "銀行からの入金を待機中…"}</p>
            ) : null}
          </section>
        </div>
      </div>

      {receipt ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-bg/75 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-[0_0_40px_rgba(0,212,255,0.08)]">
            <div className="text-[10px] tracking-[0.25em] text-ok">{en ? "DEPOSIT RECEIPT" : "安定保障 入金票"}</div>
            <h2 className="mt-1 text-lg font-semibold text-fg">
              {en ? "Funds moved into the reserve." : "保障準備金へ入金しました"}
            </h2>
            <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-2 text-[12px]">
              <dt className="text-muted">{en ? "Bank" : "銀行"}</dt>
              <dd className="text-fg">{en ? receipt.bankNameEn : receipt.bankNameJa}</dd>
              <dt className="text-muted">{en ? "Kind" : "区分"}</dt>
              <dd className="text-fg">{kindLabel(receipt.tier, en)}</dd>
              <dt className="text-muted">{en ? "Local amount" : "現地通貨"}</dt>
              <dd className="tabular text-fg">{money(receipt.localAmount, receipt.currency)}</dd>
              <dt className="text-muted">{en ? "Reserve credit" : "準備金計上"}</dt>
              <dd className="tabular text-accent">{yen(receipt.amount)}</dd>
              <dt className="text-muted">{en ? "Destination" : "行き先"}</dt>
              <dd className="text-ok">{en ? "Public stability guarantee" : "公共の安定保障準備金"}</dd>
            </dl>
            <p className="mt-3 text-[11px] leading-relaxed text-dim">
              {en
                ? "Capital stays a deposit, not a seizure. If this bank fails, the reserve still pays UBI."
                : "資本は接収ではなく入金です。この銀行が倒産しても、準備金がUBIを支払い続けます。"}
            </p>
            <button
              type="button"
              onClick={() => setReceipt(null)}
              className="mt-4 h-11 w-full rounded-md bg-accent text-[13px] font-semibold text-bg"
            >
              {en ? "Continue" : "続ける"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BankPick({
  bank,
  active,
  en,
  lang,
  onPick,
}: {
  bank: RegionalBank;
  active: boolean;
  en: boolean;
  lang: string;
  onPick: (id: string) => void;
}) {
  const tier = bankTier(bank);
  const risk = bankFailRisk(bank);
  const tone = failRiskTone(risk);
  return (
    <button
      type="button"
      onClick={() => onPick(bank.id)}
      className={`rounded-md border px-3 py-2.5 text-left ${active ? "border-accent bg-accent/10" : "border-border bg-panel"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`text-[12px] ${active ? "text-accent" : "text-fg"}`}>{bankName(bank, lang)}</div>
        {tier === "mega" ? (
          <span className={`shrink-0 text-[9px] tracking-widest ${TONE[tone]}`}>{Math.round(risk * 100)}%</span>
        ) : null}
      </div>
      <div className="mt-0.5 flex items-center justify-between text-[10px] text-muted">
        <span>{regionName(bank, lang)}</span>
        {tier === "mega" ? <span className={TONE[tone]}>{en ? "fail risk" : "倒産リスク"}</span> : null}
      </div>
    </button>
  );
}

function Kpi({
  label,
  value,
  accent,
  tone,
}: {
  label: string;
  value: string;
  accent?: boolean;
  tone?: ReturnType<typeof failRiskTone>;
}) {
  const color = tone ? TONE[tone] : accent ? "text-accent" : "text-fg";
  return (
    <div className="rounded-md border border-border bg-panel px-2 py-2">
      <div className="text-[9px] tracking-widest text-muted">{label}</div>
      <div className={`text-sm tabular ${color}`}>{value}</div>
    </div>
  );
}