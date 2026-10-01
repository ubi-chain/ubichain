import { createFileRoute } from "@tanstack/react-router";
import { Copy, Database, Globe, ShieldCheck, CheckCircle2, Github, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CNAME_TARGET,
  COM_PRICE_USD,
  DATABASE_REPO,
  FREE_ORIGIN,
  FREE_RECORDS,
  GITHUB_LOGIN,
  ISA_COMPARE_URL,
  ISA_FILE_URL,
  NAMESERVERS,
  PAGES_ORIGIN,
  PAGES_URL,
  PAID_ORIGIN,
  VC_DOMAIN_VERIFY,
  VERCEL_BUY_URL,
  VERCEL_TXT_HOST,
  ZONE_APPLIED_AT,
  ZONE_ORIGIN,
  ZONE_RECORDS,
  ZONE_SERIAL,
  fqdn,
  panelHost,
  panelValue,
  registrarRows,
  toBindZone,
  toDatabaseJson,
  toIsADevJson,
  toRegistrationJson,
  toRegistrarTsv,
  type DnsRecord,
} from "@/lib/ubi/dns";
import { useUbi } from "@/lib/ubi/store";
import { IetfDnsPanel } from "@/components/ietf-dns";

export const Route = createFileRoute("/dns")({ component: DnsPage });

type LiveStatus = "unknown" | "nxdomain" | "live" | "mismatch" | "available";
type PaidStatus = "unknown" | "nxdomain" | "txt-missing" | "txt-live" | "live";

function DnsPage() {
  const {
    lang,
    dnsSerial,
    dnsCommittedAt,
    commitDnsZone,
    domainRegisteredAt,
    registerDomain,
  } = useUbi();
  const en = lang === "en";
  const [copied, setCopied] = useState("");
  const [liveA, setLiveA] = useState<string[]>([]);
  const [liveNs, setLiveNs] = useState<string[]>([]);
  const [liveCname, setLiveCname] = useState<string[]>([]);
  const [pagesA, setPagesA] = useState<string[]>([]);
  const [status, setStatus] = useState<LiveStatus>("unknown");
  const [pagesStatus, setPagesStatus] = useState<LiveStatus>("unknown");
  const [paidStatus, setPaidStatus] = useState<PaidStatus>("unknown");
  const [vercelTxt, setVercelTxt] = useState<string[]>([]);
  const [paidCode, setPaidCode] = useState<number | null>(null);
  const [receipt, setReceipt] = useState<"zone" | "register" | null>(null);
  const [tick, setTick] = useState(0);
  const serial = dnsSerial || ZONE_SERIAL;
  const zone = useMemo(() => toBindZone(ZONE_RECORDS, serial, PAID_ORIGIN), [serial]);
  const tsv = useMemo(() => toRegistrarTsv(ZONE_RECORDS), []);
  const dbJson = useMemo(
    () => toDatabaseJson(FREE_RECORDS, serial, dnsCommittedAt || ZONE_APPLIED_AT, FREE_ORIGIN),
    [serial, dnsCommittedAt],
  );
  const regJson = useMemo(
    () => toRegistrationJson(serial, domainRegisteredAt || ZONE_APPLIED_AT),
    [serial, domainRegisteredAt],
  );
  const isaJson = useMemo(() => toIsADevJson(), []);
  const table = registrarRows(ZONE_RECORDS);

  useEffect(() => {
    let gone = false;
    const load = async () => {
      try {
        const [aRes, nsRes, cnameRes, pagesRes, txtRes] = await Promise.all([
          fetch(`https://dns.google/resolve?name=${PAID_ORIGIN}&type=A`).then((r) => r.json()),
          fetch(`https://dns.google/resolve?name=${PAID_ORIGIN}&type=NS`).then((r) => r.json()),
          fetch(`https://dns.google/resolve?name=${FREE_ORIGIN}&type=CNAME`).then((r) => r.json()),
          fetch(`https://dns.google/resolve?name=${PAGES_ORIGIN}&type=A`).then((r) => r.json()),
          fetch(`https://dns.google/resolve?name=${VERCEL_TXT_HOST}&type=TXT`).then((r) => r.json()),
        ]);
        if (gone) return;
        const a = answers(aRes);
        const ns = answers(nsRes).map((s) => s.replace(/\.$/, "").toLowerCase());
        const cname = answers(cnameRes).map((s) => s.replace(/\.$/, "").toLowerCase());
        const pages = answers(pagesRes);
        const txt = answers(txtRes).map((s) => s.replace(/^"|"$/g, ""));
        setLiveA(a);
        setLiveNs(ns);
        setLiveCname(cname);
        setPagesA(pages);
        setVercelTxt(txt);
        setPaidCode(typeof aRes.Status === "number" ? aRes.Status : null);
        if (cname.some((v) => v.includes("vercel-dns"))) setStatus("live");
        else if (cname.length) setStatus("mismatch");
        else setStatus("available");
        setPagesStatus(pages.length ? "live" : "nxdomain");
        if (aRes.Status === 3) setPaidStatus("nxdomain");
        else if (a.length && ns.some((v) => v.includes("vercel-dns"))) setPaidStatus("live");
        else if (txt.some((v) => v.includes("vc-domain-verify"))) setPaidStatus("txt-live");
        else setPaidStatus("txt-missing");
      } catch {
        if (!gone) {
          setStatus("unknown");
          setPagesStatus("unknown");
          setPaidStatus("unknown");
        }
      }
    };
    void load();
    return () => {
      gone = true;
    };
  }, [tick]);

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(""), 1600);
    } catch {
      setCopied("");
    }
  };

  const rewrite = () => {
    commitDnsZone();
    setReceipt("zone");
  };

  const register = () => {
    registerDomain();
    setReceipt("register");
  };

  const cnameLive = liveCname.some((v) => v.includes("vercel-dns"));

  return (
    <div className="h-full overflow-y-auto font-mono">
      <div className="border-b border-border p-3">
        <IetfDnsPanel lang={lang} />
      </div>
      <div className="border-b border-border px-4 py-3">
        <div className="text-[10px] tracking-[0.2em] text-muted">ZONE DATABASE · {ZONE_ORIGIN}</div>
        <h1 className="text-xl font-semibold text-fg">{en ? "Free domain + Vercel" : "無料ドメイン + Vercel"}</h1>
        <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-dim">
          {en
            ? `${PAGES_ORIGIN} is live now. ${FREE_ORIGIN} is the free Vercel CNAME (is-a.dev). ${PAID_ORIGIN} is a paid .com and is still NXDOMAIN.`
            : `${PAGES_ORIGIN} は公開済み。${FREE_ORIGIN} が無料の Vercel 接続ホスト（is-a.dev）。${PAID_ORIGIN} は有料の .com で、まだ NXDOMAIN です。`}
        </p>
      </div>

      <div className="border-b border-alert/40 bg-alert/10 px-4 py-4">
        <div className="text-[10px] tracking-[0.2em] text-alert">
          {en ? "VERCEL VERIFY · STUCK PENDING" : "Vercel 検証 · 保留のまま止まっている"}
        </div>
        <h2 className="mt-1 text-lg font-semibold text-fg">{PAID_ORIGIN}</h2>
        <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-dim">
          {en
            ? paidStatus === "nxdomain"
              ? "Not DNS lag. The name is unregistered (NXDOMAIN, Google Status 3). Vercel is waiting for a TXT that cannot exist until you buy the domain."
              : paidStatus === "txt-live"
                ? "TXT is public. Click Refresh on Vercel. If it stays pending, nameservers are not Vercel yet."
                : "Verification cannot complete until the registrar publishes _vercel TXT."
            : paidStatus === "nxdomain"
              ? "DNSの遅れではありません。この名前は未登録です（NXDOMAIN、Google Status 3）。Vercel は TXT を待っていますが、買うまで置く場所がありません。"
              : paidStatus === "txt-live"
                ? "TXT は公開されています。Vercel の Refresh を押してください。まだ保留なら、ネームサーバーが Vercel ではありません。"
                : "レジストラが _vercel の TXT を公開するまで、検証は終わりません。"}
        </p>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
          <dt className="text-muted">{en ? "Live DNS" : "公開DNS"}</dt>
          <dd className="text-alert">
            {paidStatus === "nxdomain" ? "NXDOMAIN" : paidStatus.toUpperCase()}
            {paidCode != null ? ` · Status ${paidCode}` : ""}
            {liveA[0] ? ` · A ${liveA[0]}` : ""}
          </dd>
          <dt className="text-muted">TXT</dt>
          <dd className="break-all text-dim">{vercelTxt[0] ?? (en ? "none — cannot publish on an unregistered name" : "なし — 未登録名には置けない")}</dd>
          <dt className="text-muted">{en ? "Needed" : "必要な値"}</dt>
          <dd className="break-all text-fg">
            {VERCEL_TXT_HOST} → {VC_DOMAIN_VERIFY}
          </dd>
          <dt className="text-muted">{en ? "Price" : "価格"}</dt>
          <dd className="text-fg">${COM_PRICE_USD} / {en ? "year" : "年"} · Vercel</dd>
        </dl>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTick((n) => n + 1)}
            className="h-11 px-4 font-mono text-[12px] text-accent"
          >
            {en ? "Re-probe DNS" : "DNSを再確認"}
          </button>
          <button
            type="button"
            onClick={() => copy("vctxt", VC_DOMAIN_VERIFY)}
            className="h-11 px-4 font-mono text-[12px] text-fg"
          >
            {copied === "vctxt" ? (en ? "Copied TXT" : "TXTをコピーした") : en ? "Copy TXT" : "TXTをコピー"}
          </button>
          <a
            href={VERCEL_BUY_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center px-4 font-mono text-[12px] text-accent"
          >
            {en ? "Open Vercel domain buy" : "Vercel でドメインを買う"}
          </a>
        </div>
        <p className="mt-3 max-w-2xl text-[11px] text-muted">
          {en
            ? "Buying is not free and is not done from here. After purchase, either set nameservers to ns1/ns2.vercel-dns.com, or publish the TXT above, then Refresh on Vercel. Until then, use ubi-chain.github.io."
            : "購入は無料ではなく、こちらからは実行しません。購入後は ns1/ns2.vercel-dns.com にするか、上の TXT を公開して Vercel の Refresh。それまでは ubi-chain.github.io を使います。"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 border-b border-border p-3 md:grid-cols-4">
        <Kpi label={en ? "Free origin" : "無料ホスト"} value={FREE_ORIGIN} accent />
        <Kpi label={en ? "Pages (live)" : "Pages（公開）"} value={PAGES_ORIGIN} accent={pagesStatus === "live"} />
        <Kpi label={en ? "Serial" : "シリアル"} value={String(serial)} />
        <Kpi
          label={en ? "Vercel CNAME" : "Vercel CNAME"}
          value={cnameLive ? (en ? "Live" : "公開済") : en ? "Queued" : "申請中"}
          accent={cnameLive}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-panel px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-ok">
            <CheckCircle2 className="size-3.5" />
            {pagesStatus === "live"
              ? en
                ? `Free host live at ${PAGES_ORIGIN}`
                : `${PAGES_ORIGIN} で無料ホスト公開中`
              : en
                ? `Free host queued · serial ${serial}`
                : `無料ホスト申請中 · シリアル ${serial}`}
          </div>
          <div className="mt-0.5 text-[10px] text-muted">
            {FREE_ORIGIN} CNAME {liveCname[0] ?? (en ? "not public yet" : "未公開")} · {PAID_ORIGIN}{" "}
            {liveA[0] ?? "NXDOMAIN"}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={ISA_COMPARE_URL}
            target="_blank"
            rel="noreferrer"
            onClick={register}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md bg-accent px-4 text-[12px] font-semibold text-bg"
          >
            <ExternalLink className="size-3.5" />
            {en ? "Open is-a.dev PR" : "is-a.dev の PR を開く"}
          </a>
          <button
            type="button"
            onClick={rewrite}
            className="h-11 shrink-0 rounded-md border border-accent/40 bg-accent/10 px-4 text-[12px] text-accent"
          >
            {en ? "Rewrite database" : "データベースに再書き込み"}
          </button>
        </div>
      </div>

      <div className="border-b border-accent/30 bg-accent/5 px-4 py-3">
        <div className="text-[10px] tracking-[0.2em] text-accent">{en ? "VERCEL LINK" : "Vercel 連携"}</div>
        <div className="mt-1 break-all font-mono text-[12px] text-fg">
          {FREE_ORIGIN} CNAME {CNAME_TARGET}
        </div>
        <p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-dim">
          {en
            ? "is-a.dev merge publishes that CNAME. Then in Vercel (GitHub login ubi-chain) add domain ubichain.is-a.dev so TLS attaches. No .com purchase."
            : "is-a.dev がマージするとこの CNAME が公開されます。そのあと Vercel（GitHub ログイン ubi-chain）で ubichain.is-a.dev を追加すると TLS が付きます。.com の購入は不要です。"}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => copy("cname", `${FREE_ORIGIN} CNAME ${CNAME_TARGET}`)}
            className="flex h-11 items-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-3 text-[12px] text-accent"
          >
            <Copy className="size-3.5" />
            {copied === "cname" ? (en ? "Copied CNAME" : "CNAMEをコピーした") : en ? "Copy CNAME" : "CNAMEをコピー"}
          </button>
          <a
            href={PAGES_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-3 text-[12px] text-dim"
          >
            <ExternalLink className="size-3.5" />
            {PAGES_ORIGIN}
          </a>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-lg border border-border bg-surface p-4">
          <div className="mb-3 flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted">
            <Database className="size-3.5 text-accent" />
            {en ? "FREE HOST → VERCEL" : "無料ホスト → VERCEL"}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-[11px]">
              <thead className="text-[10px] tracking-widest text-muted">
                <tr>
                  <th className="pb-2 font-normal">HOST</th>
                  <th className="pb-2 font-normal">TYPE</th>
                  <th className="pb-2 font-normal">VALUE</th>
                  <th className="pb-2 font-normal">TTL</th>
                </tr>
              </thead>
              <tbody>
                {FREE_RECORDS.map((r) => (
                  <tr key={r.id} className="border-t border-border bg-accent/10">
                    <td className="py-2 text-fg">{fqdn(r.host, FREE_ORIGIN)}</td>
                    <td className="py-2 text-accent">{r.type}</td>
                    <td className="py-2 break-all text-dim">{r.value}</td>
                    <td className="py-2 tabular text-muted">{r.ttl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("isa", isaJson)}
              className="flex h-11 items-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-3 text-[12px] text-accent"
            >
              <Copy className="size-3.5" />
              {copied === "isa" ? (en ? "Copied JSON" : "JSONをコピーした") : en ? "Copy is-a.dev JSON" : "is-a.dev JSONをコピー"}
            </button>
            <button
              type="button"
              onClick={() => copy("json", dbJson)}
              className="flex h-11 items-center gap-2 rounded-md border border-border px-3 text-[12px] text-dim"
            >
              <Copy className="size-3.5" />
              {copied === "json" ? (en ? "Copied JSON" : "JSONをコピーした") : en ? "Copy JSON database" : "JSONデータベースをコピー"}
            </button>
            <button
              type="button"
              onClick={() => copy("reg", regJson)}
              className="flex h-11 items-center gap-2 rounded-md border border-border px-3 text-[12px] text-dim"
            >
              <Copy className="size-3.5" />
              {copied === "reg" ? (en ? "Copied registration" : "登録票をコピーした") : en ? "Copy registration" : "登録票をコピー"}
            </button>
          </div>
        </section>

        <div className="space-y-3">
          <section className="rounded-lg border border-accent/30 bg-surface p-4">
            <div className="mb-2 flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted">
              <Github className="size-3.5 text-accent" />
              {en ? "GITHUB → VERCEL" : "GITHUB → VERCEL"}
            </div>
            <p className="mb-3 text-[12px] leading-relaxed text-dim">
              {en
                ? "Vercel signs in with GitHub ubi-chain. After the is-a.dev merge, add ubichain.is-a.dev on the Vercel project."
                : "Vercel は GitHub（ubi-chain）でログインします。is-a.dev マージ後、Vercel プロジェクトに ubichain.is-a.dev を追加します。"}
            </p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-[12px]">
              <dt className="text-muted">GitHub</dt>
              <dd className="text-fg">{GITHUB_LOGIN}</dd>
              <dt className="text-muted">{en ? "Repo" : "リポジトリ"}</dt>
              <dd className="text-fg">{DATABASE_REPO}</dd>
              <dt className="text-muted">is-a.dev</dt>
              <dd className="truncate text-accent">
                <a href={ISA_FILE_URL} target="_blank" rel="noreferrer">
                  domains/ubichain.json
                </a>
              </dd>
              <dt className="text-muted">Pages</dt>
              <dd className="text-ok">{pagesStatus === "live" ? (en ? "Live" : "公開中") : "…"}</dd>
            </dl>
          </section>

          <section className="rounded-lg border border-border bg-surface p-4">
            <div className="mb-2 flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted">
              <Globe className="size-3.5 text-accent" />
              {en ? "LIVE HOSTS" : "公開ホスト"}
            </div>
            <HostRow
              name={PAGES_ORIGIN}
              value={pagesA[0] ?? "…"}
              ok={pagesStatus === "live"}
              copied={copied}
              onCopy={copy}
              langEn={en}
            />
            <HostRow
              name={FREE_ORIGIN}
              value={liveCname[0] ?? (en ? "waiting merge" : "マージ待ち")}
              ok={cnameLive}
              copied={copied}
              onCopy={copy}
              langEn={en}
            />
            <HostRow name={PAID_ORIGIN} value={liveA[0] ?? "NXDOMAIN"} ok={false} copied={copied} onCopy={copy} langEn={en} />
          </section>

          <section className="rounded-lg border border-border bg-surface p-4">
            <div className="mb-2 flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted">
              <ShieldCheck className="size-3.5 text-ok" />
              {en ? "PAID .COM (NOT FREE)" : "有料 .COM（無料ではない）"}
            </div>
            <p className="mb-3 text-[12px] leading-relaxed text-dim">
              {en
                ? `${PAID_ORIGIN} is unregistered. A .com costs money. Nameservers below only apply after you buy it.`
                : `${PAID_ORIGIN} は未登録です。.com は有料です。下のネームサーバーは購入後にだけ使います。`}
            </p>
            {NAMESERVERS.map((ns) => (
              <div key={ns} className="mb-1.5 flex min-h-11 items-center justify-between rounded-md border border-border bg-panel px-3 py-2 text-[12px]">
                <span className="text-fg">{ns}</span>
                <button type="button" className="text-accent" onClick={() => copy(ns, ns)}>
                  {copied === ns ? (en ? "Copied" : "済") : en ? "Copy" : "コピー"}
                </button>
              </div>
            ))}
            <div className="mt-2 text-[10px] text-muted">
              _vercel.{PAID_ORIGIN} TXT {VC_DOMAIN_VERIFY}
            </div>
            {table.slice(0, 3).map((r) => (
              <RecordRow key={r.id} record={r} langEn={en} copied={copied} onCopy={copy} />
            ))}
            <button
              type="button"
              onClick={() => copy("tsv", tsv)}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-border text-[12px] text-dim"
            >
              <Copy className="size-3.5" />
              {copied === "tsv" ? (en ? "Copied table" : "表をコピーした") : en ? "Copy .com table" : ".com 表をコピー"}
            </button>
            <button
              type="button"
              onClick={() => copy("zone", zone)}
              className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-border text-[12px] text-dim"
            >
              <Copy className="size-3.5" />
              {copied === "zone" ? (en ? "Copied zone" : "ゾーンをコピーした") : en ? "Copy BIND zone" : "BIND ゾーンをコピー"}
            </button>
          </section>

          <section className="rounded-lg border border-border bg-panel p-4 text-[12px] leading-relaxed text-dim">
            {en
              ? "Safari Share → Add to Home Screen works on the live free host. After Vercel TLS, use ubichain.is-a.dev as the iPhone full-screen app."
              : "Safari の共有 → ホーム画面に追加は、いま公開中の無料ホストで使えます。Vercel の TLS が付いたら ubichain.is-a.dev が iPhone の全画面アプリになります。"}
            {liveNs.length ? (
              <div className="mt-2 text-[11px] text-muted">
                {en ? "Resolver NS" : "現在の NS"} {liveNs.join(" · ") || "—"}
              </div>
            ) : (
              <div className="mt-2 text-[11px] text-alert">
                {en
                  ? `${PAID_ORIGIN} is still NXDOMAIN. Use ${PAGES_ORIGIN} today.`
                  : `${PAID_ORIGIN} はまだ NXDOMAIN です。今日は ${PAGES_ORIGIN} を使います。`}
              </div>
            )}
          </section>
        </div>
      </div>

      {receipt ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-bg/75 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-[0_0_40px_rgba(0,212,255,0.08)]">
            <div className="text-[10px] tracking-[0.25em] text-ok">
              {receipt === "register" ? (en ? "FREE DOMAIN" : "無料ドメイン") : en ? "ZONE COMMIT" : "ゾーンデータベース書き込み"}
            </div>
            <h2 className="mt-1 text-lg font-semibold text-fg">
              {receipt === "register"
                ? en
                  ? "ubichain.is-a.dev queued for Vercel."
                  : "ubichain.is-a.dev を Vercel 向けに申請しました"
                : en
                  ? "DNS written to the domain database."
                  : "DNSをドメインデータベースへ書き込みました"}
            </h2>
            <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-2 text-[12px]">
              <dt className="text-muted">{en ? "Free origin" : "無料ホスト"}</dt>
              <dd className="text-fg">{FREE_ORIGIN}</dd>
              <dt className="text-muted">Pages</dt>
              <dd className="text-ok">{PAGES_ORIGIN}</dd>
              <dt className="text-muted">{en ? "Serial" : "シリアル"}</dt>
              <dd className="tabular text-accent">{serial}</dd>
              <dt className="text-muted">Vercel</dt>
              <dd className="text-ok">CNAME {CNAME_TARGET}</dd>
              <dt className="text-muted">{PAID_ORIGIN}</dt>
              <dd className="text-alert">NXDOMAIN</dd>
            </dl>
            <p className="mt-3 text-[11px] leading-relaxed text-dim">
              {en
                ? "Finish by opening the is-a.dev pull request from GitHub (ubi-chain). Merge publishes the CNAME."
                : "GitHub（ubi-chain）から is-a.dev のプルリクエストを開いて完了します。マージで CNAME が公開されます。"}
            </p>
            <a
              href={ISA_COMPARE_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex h-11 w-full items-center justify-center rounded-md bg-accent text-[13px] font-semibold text-bg"
            >
              {en ? "Open pull request" : "プルリクエストを開く"}
            </a>
            <button
              type="button"
              onClick={() => setReceipt(null)}
              className="mt-2 h-11 w-full rounded-md border border-border text-[13px] text-dim"
            >
              {en ? "Continue" : "続ける"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function answers(json: { Answer?: { data?: string }[]; Status?: number }) {
  return (json.Answer ?? []).map((a) => String(a.data ?? "").trim()).filter(Boolean);
}

function HostRow({
  name,
  value,
  ok,
  copied,
  onCopy,
  langEn,
}: {
  name: string;
  value: string;
  ok: boolean;
  copied: string;
  onCopy: (label: string, text: string) => void;
  langEn: boolean;
}) {
  return (
    <div className="mb-1.5 flex min-h-11 items-center justify-between gap-2 rounded-md border border-border bg-panel px-3 py-2 text-[12px]">
      <div className="min-w-0">
        <div className="truncate text-fg">{name}</div>
        <div className={`truncate text-[10px] ${ok ? "text-ok" : "text-muted"}`}>{value}</div>
      </div>
      <button type="button" className="shrink-0 text-accent" onClick={() => onCopy(name, name)}>
        {copied === name ? (langEn ? "Copied" : "済") : langEn ? "Copy" : "コピー"}
      </button>
    </div>
  );
}

function RecordRow({
  record,
  langEn,
  copied,
  onCopy,
}: {
  record: DnsRecord;
  langEn: boolean;
  copied: string;
  onCopy: (label: string, text: string) => void;
}) {
  const line = `${panelHost(record.host)}\t${record.type}\t${panelValue(record)}`;
  return (
    <div className="border-b border-border py-2 last:border-0">
      <div className="flex min-h-11 items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[11px] text-fg">
            {record.host} <span className="text-accent">{record.type}</span> {panelValue(record)}
          </div>
          <div className="text-[10px] text-muted">{langEn ? record.purposeEn : record.purposeJa}</div>
        </div>
        <button type="button" className="shrink-0 text-[11px] text-accent" onClick={() => onCopy(record.id, line)}>
          {copied === record.id ? (langEn ? "Copied" : "済") : langEn ? "Copy" : "コピー"}
        </button>
      </div>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-panel px-2 py-2">
      <div className="text-[9px] tracking-widest text-muted">{label}</div>
      <div className={`truncate text-sm tabular ${accent ? "text-accent" : "text-fg"}`}>{value}</div>
    </div>
  );
}
