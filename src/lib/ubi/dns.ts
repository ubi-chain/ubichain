export const IETF_ORIGIN = "ietfubi.com";
export const IETF_WWW = "www.ietfubi.com";
/** Grok custom-domain apex. DNS-only. Not a mail host. */
export const GROK_APEX_A = "64.239.109.1";
export const FREE_ORIGIN = "ubichain.is-a.dev";
export const PAGES_ORIGIN = "ubi-chain.github.io";
export const PAID_ORIGIN = "ubi-chain.com";
export const OZ_ORIGIN = "oz.ubi-chain.com";
/** Intended production host — free subdomain CNAME to Vercel. */
export const ZONE_ORIGIN = FREE_ORIGIN;
export const ZONE_SERIAL = 2026091501;
export const ZONE_APPLIED_AT = "2026-09-15T09:26:00+09:00";
export const DATABASE_REPO = "ubi-chain/ubichain";
export const DATABASE_PATH = "dns/database.json";
export const DATABASE_URL = `https://github.com/${DATABASE_REPO}/blob/main/${DATABASE_PATH}`;
export const REGISTRATION_PATH = "dns/registration.json";
export const DEPLOY_PROJECT_ID = "01a09e40-0d69-7a91-93b9-ddd106ad2da9";
export const GITHUB_LOGIN = "ubi-chain";
export const VERCEL_LOGIN_VIA = "github";
export const PAGES_URL = `https://${PAGES_ORIGIN}`;
export const ISA_COMPARE_URL = "https://github.com/is-a-dev/register/compare/main...ubi-chain:add-ubichain?expand=1";
export const ISA_FILE_URL = "https://github.com/ubi-chain/register/blob/add-ubichain/domains/ubichain.json";
export const ISA_FORK = "ubi-chain/register";
export const ISA_BRANCH = "add-ubichain";

export const NAMESERVERS = ["ns1.vercel-dns.com", "ns2.vercel-dns.com"] as const;

/** Vercel anycast — apex A for custom domains */
export const APEX_A = "10.0.1.2";
export const CNAME_TARGET = "cname.vercel-dns.com";
export const VC_DOMAIN_VERIFY = "vc-domain-verify=ubi-chain.com,a867d92e04fd510123b0";
export const VERCEL_TXT_HOST = `_vercel.${PAID_ORIGIN}`;
export const VERCEL_BUY_URL = "https://vercel.com/domains/search?q=ubi-chain.com";
export const COM_PRICE_USD = "11.25";
export const SOA_MNAME = "ns1.vercel-dns.com.";
export const SOA_RNAME = "hostmaster.ubi-chain.com.";

export type DnsType = "A" | "AAAA" | "CNAME" | "NS" | "TXT" | "CAA" | "MX" | "SOA";

export type DnsRecord = {
  id: string;
  host: string;
  type: DnsType;
  value: string;
  ttl: number;
  purposeJa: string;
  purposeEn: string;
};

export const FREE_RECORDS: DnsRecord[] = [
  {
    id: "free-cname",
    host: "@",
    type: "CNAME",
    value: CNAME_TARGET + ".",
    ttl: 3600,
    purposeJa: "無料ホストを Vercel へ接続",
    purposeEn: "Free hostname → Vercel",
  },
];

const SUBS = [
  { host: "www", ja: "www を本番へ", en: "www → production" },
  { host: "pay", ja: "Pay サブドメイン", en: "Pay subdomain" },
  { host: "banks", ja: "銀行入金（地方・メガ）", en: "Bank intake (regional + mega)" },
  { host: "news", ja: "ニュース", en: "News" },
  { host: "international", ja: "国際労働者協会", en: "IWA" },
  { host: "ai", ja: "AI ガイド", en: "AI guide" },
  { host: "infra", ja: "インフラ決済", en: "Infrastructure rail" },
  { host: "monitor", ja: "監視センター", en: "AML monitor" },
  { host: "me", ja: "マイページ", en: "My page" },
  { host: "app", ja: "PWA エイリアス", en: "PWA alias" },
  { host: "dns", ja: "ゾーンデータベース", en: "Zone database" },
];

export const ZONE_RECORDS: DnsRecord[] = [
  {
    id: "soa",
    host: "@",
    type: "SOA",
    value: `${SOA_MNAME} ${SOA_RNAME} ${ZONE_SERIAL} 86400 7200 604800 300`,
    ttl: 86400,
    purposeJa: "ゾーン権限とシリアル",
    purposeEn: "Zone authority and serial",
  },
  {
    id: "ns1",
    host: "@",
    type: "NS",
    value: NAMESERVERS[0] + ".",
    ttl: 86400,
    purposeJa: "権威ネームサーバー 1",
    purposeEn: "Authoritative nameserver 1",
  },
  {
    id: "ns2",
    host: "@",
    type: "NS",
    value: NAMESERVERS[1] + ".",
    ttl: 86400,
    purposeJa: "権威ネームサーバー 2",
    purposeEn: "Authoritative nameserver 2",
  },
  {
    id: "apex-a",
    host: "@",
    type: "A",
    value: APEX_A,
    ttl: 3600,
    purposeJa: "apex を本番ホストへ（HTTPS / PWA）",
    purposeEn: "Apex to production host (HTTPS / PWA)",
  },
  ...SUBS.map((s) => ({
    id: `sub-${s.host}`,
    host: s.host,
    type: "CNAME" as const,
    value: CNAME_TARGET + ".",
    ttl: 3600,
    purposeJa: s.ja,
    purposeEn: s.en,
  })),
  {
    id: "wildcard",
    host: "*",
    type: "CNAME",
    value: CNAME_TARGET + ".",
    ttl: 3600,
    purposeJa: "その他サブドメインを本番へ",
    purposeEn: "Catch-all subdomains",
  },
  {
    id: "caa",
    host: "@",
    type: "CAA",
    value: '0 issue "letsencrypt.org"',
    ttl: 3600,
    purposeJa: "TLS 証明書の発行元",
    purposeEn: "TLS certificate issuer",
  },
  {
    id: "vercel-verify",
    host: "_vercel",
    type: "TXT",
    value: `"${VC_DOMAIN_VERIFY}"`,
    ttl: 60,
    purposeJa: "Vercel ドメイン所有確認（.com）",
    purposeEn: "Vercel domain ownership verify (.com)",
  },
  {
    id: "spf",
    host: "@",
    type: "TXT",
    value: '"v=spf1 -all"',
    ttl: 3600,
    purposeJa: "このドメインからメールを出さない",
    purposeEn: "No mail from this domain",
  },
  {
    id: "dmarc",
    host: "_dmarc",
    type: "TXT",
    value: '"v=DMARC1; p=reject; adkim=s; aspf=s"',
    ttl: 3600,
    purposeJa: "なりすましメールを拒否",
    purposeEn: "Reject spoofed mail",
  },
];

export function fqdn(host: string, origin = ZONE_ORIGIN) {
  if (host === "@" || host === "") return origin;
  return `${host}.${origin}`;
}

export function panelHost(host: string) {
  return host === "@" ? "@" : host;
}

export function panelValue(record: DnsRecord) {
  if (record.type === "TXT" || record.type === "CAA" || record.type === "SOA") return record.value;
  return record.value.replace(/\.$/, "");
}

export function toBindZone(records: DnsRecord[], serial = ZONE_SERIAL, origin = PAID_ORIGIN) {
  const lines = [
    `; ${origin} — UBICHAIN stability-guarantee zone`,
    `; serial ${serial}  applied ${ZONE_APPLIED_AT}`,
    `$ORIGIN ${origin}.`,
    `$TTL 3600`,
    "",
    `@                86400  IN SOA    ${SOA_MNAME} hostmaster.${origin}. (`,
    `                                 ${serial} ; serial`,
    `                                 86400      ; refresh`,
    `                                 7200       ; retry`,
    `                                 604800     ; expire`,
    `                                 300 )      ; minimum`,
  ];
  for (const r of records) {
    if (r.type === "SOA") continue;
    const owner = r.host === "@" ? "@" : r.host;
    lines.push(`${owner.padEnd(16)} ${String(r.ttl).padEnd(6)} IN ${r.type.padEnd(6)} ${r.value}`);
  }
  return lines.join("\n") + "\n";
}

export function registrarRows(records: DnsRecord[]) {
  return records.filter((r) => r.type !== "NS" && r.type !== "SOA");
}

export function toRegistrarTsv(records: DnsRecord[]) {
  const rows = ["ホスト名\tTYPE\tTTL\tVALUE"];
  for (const r of registrarRows(records)) {
    rows.push(`${panelHost(r.host)}\t${r.type}\t${r.ttl}\t${panelValue(r)}`);
  }
  return rows.join("\n") + "\n";
}

export type ZoneDatabase = {
  origin: string;
  class: "IN";
  serial: number;
  appliedAt: string;
  registry: "pending-delegation" | "live" | "pr-ready";
  registered: boolean;
  registrar: "vercel" | "is-a.dev";
  nameservers: string[];
  apex: { type: "A" | "CNAME"; value: string };
  cname: string;
  free: { origin: string; pages: string; status: string };
  paid: { origin: string; status: string };
  records: Array<{
    host: string;
    fqdn: string;
    type: DnsType;
    value: string;
    ttl: number;
    purposeJa: string;
    purposeEn: string;
  }>;
};

export function toZoneDatabase(
  records: DnsRecord[],
  serial = ZONE_SERIAL,
  appliedAt = ZONE_APPLIED_AT,
  origin = ZONE_ORIGIN,
): ZoneDatabase {
  const isFree = origin === FREE_ORIGIN;
  return {
    origin,
    class: "IN",
    serial,
    appliedAt,
    registry: isFree ? "pr-ready" : "pending-delegation",
    registered: isFree,
    registrar: isFree ? "is-a.dev" : "vercel",
    nameservers: [...NAMESERVERS],
    apex: isFree ? { type: "CNAME", value: CNAME_TARGET } : { type: "A", value: APEX_A },
    cname: CNAME_TARGET,
    free: { origin: FREE_ORIGIN, pages: PAGES_ORIGIN, status: "pages-live · is-a.dev pr-ready" },
    paid: { origin: PAID_ORIGIN, status: "unregistered-nxdomain" },
    records: records.map((r) => ({
      host: r.host,
      fqdn: fqdn(r.host, origin),
      type: r.type,
      value: r.value,
      ttl: r.ttl,
      purposeJa: r.purposeJa,
      purposeEn: r.purposeEn,
    })),
  };
}

export function toDatabaseJson(
  records: DnsRecord[],
  serial = ZONE_SERIAL,
  appliedAt = ZONE_APPLIED_AT,
  origin = ZONE_ORIGIN,
) {
  return JSON.stringify(toZoneDatabase(records, serial, appliedAt, origin), null, 2) + "\n";
}

export function toRegistrationJson(serial = ZONE_SERIAL, appliedAt = ZONE_APPLIED_AT) {
  return (
    JSON.stringify(
      {
        domain: FREE_ORIGIN,
        registered: true,
        registeredAt: appliedAt,
        source: "is-a.dev + github pages",
        registrar: "is-a.dev",
        loginVia: VERCEL_LOGIN_VIA,
        githubLogin: GITHUB_LOGIN,
        githubRepo: DATABASE_REPO,
        projectId: DEPLOY_PROJECT_ID,
        vercel: {
          cname: CNAME_TARGET,
          nameservers: [...NAMESERVERS],
          loginVia: VERCEL_LOGIN_VIA,
          addDomain: FREE_ORIGIN,
        },
        pages: { origin: PAGES_ORIGIN, url: PAGES_URL, status: "live" },
        isADev: {
          origin: FREE_ORIGIN,
          file: ISA_FILE_URL,
          fork: ISA_FORK,
          branch: ISA_BRANCH,
          compare: ISA_COMPARE_URL,
          status: "pr-ready",
        },
        paid: {
          origin: PAID_ORIGIN,
          registered: false,
          status: "unregistered-nxdomain",
          reason: ".com is not free",
          verify: { host: "_vercel", type: "TXT", value: VC_DOMAIN_VERIFY },
        },
        serial,
        status: "free-live",
      },
      null,
      2,
    ) + "\n"
  );
}

export function toIsADevJson() {
  return (
    JSON.stringify(
      {
        owner: {
          username: GITHUB_LOGIN,
          email: "haruki.2000495@gmail.com",
        },
        records: {
          CNAME: CNAME_TARGET,
        },
      },
      null,
      2,
    ) + "\n"
  );
}
