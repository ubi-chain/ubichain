import { useCallback, useEffect, useState } from "react";
import { GROK_APEX_A, IETF_ORIGIN, IETF_WWW } from "@/lib/ubi/dns";
import type { Lang } from "@/lib/ubi/i18n";

type Lookup = { status: number; answers: string[] };

async function lookup(name: string, type: string): Promise<Lookup> {
  const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`);
  const data = (await res.json()) as { Status?: number; Answer?: { data?: string }[] };
  return {
    status: typeof data.Status === "number" ? data.Status : -1,
    answers: (data.Answer ?? []).map((row) => (row.data ?? "").replace(/\.$/, "")),
  };
}

export type IetfProbe = {
  apexStatus: number;
  apexA: string[];
  wwwA: string[];
  wwwCname: string[];
  mx: string[];
  checkedAt: string;
};

function matched(list: string[]) {
  return list.some((v) => v === GROK_APEX_A);
}

export function IetfDnsPanel({ lang }: { lang: Lang }) {
  const en = lang === "en";
  const [probe, setProbe] = useState<IetfProbe | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const run = useCallback(async () => {
    setBusy(true);
    setError(false);
    try {
      const [apex, wwwA, wwwC, mx] = await Promise.all([
        lookup(IETF_ORIGIN, "A"),
        lookup(IETF_WWW, "A"),
        lookup(IETF_WWW, "CNAME"),
        lookup(IETF_ORIGIN, "MX"),
      ]);
      setProbe({
        apexStatus: apex.status,
        apexA: apex.answers,
        wwwA: wwwA.answers,
        wwwCname: wwwC.answers,
        mx: mx.answers,
        checkedAt: new Date().toISOString(),
      });
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void run();
  }, [run]);

  const apexOk = probe ? matched(probe.apexA) : false;
  const wwwOk = probe ? matched(probe.wwwA) || probe.wwwCname.some((v) => v.toLowerCase() === IETF_ORIGIN) : false;
  const nx = probe?.apexStatus === 3;
  const proxied = probe ? probe.apexA.some((v) => v.startsWith("104.") || v.startsWith("172.6")) && !apexOk : false;

  return (
    <section className="border border-accent/40 bg-bg p-3 text-fg">
      <div className="flex items-center justify-between gap-2">
        <div className="font-mono text-[10px] tracking-[0.22em] text-accent">
          {en ? "CLOUDFLARE · OWNERSHIP" : "CLOUDFLARE · 所有権"}
        </div>
        <button
          type="button"
          onClick={() => void run()}
          disabled={busy}
          className="min-h-11 border border-accent/50 px-3 font-mono text-[11px] text-accent"
        >
          {busy ? (en ? "CHECKING" : "確認中") : en ? "RE-CHECK" : "再検証"}
        </button>
      </div>
      <h2 className="mt-1 font-mono text-lg text-fg">{IETF_ORIGIN}</h2>
      <p className="mt-1 font-mono text-[12px] leading-relaxed text-dim">
        {nx
          ? en
            ? "Still NXDOMAIN. The name is not delegated, so the A record is not public yet. Add it in Cloudflare (grey cloud), then re-check. MX is not changed."
            : "まだ NXDOMAIN です。委任されていないので A レコードは公開されていません。Cloudflare にグレー雲で追加してから再検証してください。MX は変更しません。"
          : apexOk
            ? en
              ? "Apex matches Grok. Next: www, DNS only. HTTPS follows after that name resolves."
              : "apex は Grok のアドレスと一致しました。次は www を DNS only で向けます。解決後に HTTPS で開きます。"
            : proxied
              ? en
                ? "Public DNS shows a proxied address. Turn the cloud grey (DNS only) or verification stays pending."
                : "公開 DNS がプロキシ側のアドレスです。雲をグレー（DNS only）にしないと検証は保留のままです。"
              : en
                ? "Ownership is still pending. The apex A record below is the one Grok is waiting for."
                : "所有権確認は保留中です。Grok が待っているのは下の apex A です。"}
      </p>

      <ol className="mt-3 space-y-2 font-mono text-[12px] leading-relaxed text-fg">
        <li className={apexOk ? "text-ok" : "text-fg"}>
          1. {en ? "Add now. Leave every MX row untouched." : "今追加する。MX の行はすべて触らない。"}
          <dl className="mt-1 grid grid-cols-[5.5rem_1fr] gap-y-1 border border-border bg-panel p-2 text-[11px]">
            <dt className="text-muted">Type</dt>
            <dd>A</dd>
            <dt className="text-muted">Name</dt>
            <dd>@</dd>
            <dt className="text-muted">Value</dt>
            <dd className="text-accent">{GROK_APEX_A}</dd>
            <dt className="text-muted">Proxy</dt>
            <dd>{en ? "DNS only (grey cloud)" : "DNS only（グレー雲）"}</dd>
          </dl>
        </li>
        <li className={wwwOk ? "text-ok" : apexOk ? "text-fg" : "text-muted"}>
          2. {en ? "After the re-check matches, add www. Still no MX." : "再検証が一致してから www。ここでも MX は触らない。"}
          <dl className="mt-1 grid grid-cols-[5.5rem_1fr] gap-y-1 border border-border bg-panel p-2 text-[11px]">
            <dt className="text-muted">Type</dt>
            <dd>CNAME</dd>
            <dt className="text-muted">Name</dt>
            <dd>www</dd>
            <dt className="text-muted">Target</dt>
            <dd className="text-accent">{IETF_ORIGIN}</dd>
            <dt className="text-muted">Proxy</dt>
            <dd>{en ? "DNS only (grey cloud)" : "DNS only（グレー雲）"}</dd>
          </dl>
        </li>
        <li className={wwwOk ? "text-fg" : "text-muted"}>
          3. {en ? "Then open" : "その後に開く"}{" "}
          <span className="text-accent">https://{IETF_WWW}</span>
        </li>
      </ol>

      <dl className="mt-3 grid grid-cols-[5.5rem_1fr] gap-y-1 font-mono text-[11px]">
        <dt className="text-muted">A @</dt>
        <dd className={apexOk ? "text-ok" : "text-alert"}>
          {probe ? (probe.apexA.length ? probe.apexA.join(", ") : nx ? "NXDOMAIN" : "—") : "…"}
        </dd>
        <dt className="text-muted">www</dt>
        <dd className={wwwOk ? "text-ok" : "text-dim"}>
          {probe
            ? probe.wwwCname.length
              ? `CNAME ${probe.wwwCname.join(", ")}`
              : probe.wwwA.length
                ? probe.wwwA.join(", ")
                : "—"
            : "…"}
        </dd>
        <dt className="text-muted">MX</dt>
        <dd className="text-dim">
          {probe ? (probe.mx.length ? probe.mx.join(" · ") : en ? "none · left untouched" : "なし · 未変更") : "…"}
        </dd>
      </dl>
      {error ? (
        <p className="mt-2 font-mono text-[11px] text-alert">
          {en ? "Lookup failed. Try re-check." : "照会に失敗しました。再検証を押してください。"}
        </p>
      ) : null}
    </section>
  );
}
