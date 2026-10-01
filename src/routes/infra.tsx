import { createFileRoute } from "@tanstack/react-router";
import { Activity, Database, Droplets, GraduationCap, HeartPulse, RadioTower, Satellite, Train, Wifi, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useUbi } from "@/lib/ubi/store";
import { yen } from "@/lib/ubi/format";
import { stationName } from "@/lib/ubi/iss";

export const Route = createFileRoute("/infra")({ component: InfraPage });

const SECTORS = [
  { id: "power", icon: Zap, ja: "電力", en: "Power", spend: 4280, status: "完了" },
  { id: "water", icon: Droplets, ja: "水道", en: "Water", spend: 1860, status: "完了" },
  { id: "transit", icon: Train, ja: "交通", en: "Transit", spend: 9640, status: "送金中" },
  { id: "health", icon: HeartPulse, ja: "医療", en: "Health", spend: 3120, status: "完了" },
  { id: "net", icon: Wifi, ja: "通信", en: "Network", spend: 2410, status: "保留" },
  { id: "edu", icon: GraduationCap, ja: "教育", en: "Education", spend: 1540, status: "完了" },
];

function InfraPage() {
  const { lang } = useUbi();
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPulse((n) => n + 1), 1800);
    return () => clearInterval(id);
  }, []);
  const total = SECTORS.reduce((s, x) => s + x.spend, 0);

  return (
    <div className="h-full overflow-y-auto font-mono">
      <div className="border-b border-border px-4 py-3">
        <div className="text-[10px] tracking-[0.2em] text-muted">{lang === "en" ? "INFRASTRUCTURE RAIL" : "インフラ決済可視化"}</div>
        <h1 className="text-xl font-semibold text-fg">
          {lang === "en" ? "Live payment flow" : "リアルタイム決済フロー"}
        </h1>
        <p className="text-[11px] text-dim">
          {lang === "en"
            ? "All infrastructure charges auto-debit from UBI. Receipts issue in real time."
            : "全インフラ支払いはUBI残高から自動引き落とし。領収書はリアルタイム発行。"}
        </p>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTORS.map((s, i) => {
          const Icon = s.icon;
          const live = (s.spend + ((pulse + i) % 5) * 20) % (s.spend + 80);
          return (
            <article key={s.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="mb-3 flex items-center gap-2 text-accent">
                <Icon className="size-4" />
                <span className="text-[12px] text-fg">{lang === "en" ? s.en : s.ja}</span>
                <span className="ml-auto text-[10px] text-muted">{statusLabel(s.status, lang)}</span>
              </div>
              <div className="text-lg tabular text-accent">{yen(s.spend)}</div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-panel">
                <div className="h-full bg-accent" style={{ width: `${40 + ((pulse + i) % 50)}%` }} />
              </div>
              <div className="mt-2 flex items-center gap-1 text-[10px] text-muted">
                <Activity className="size-3 text-ok" />
                {lang === "en" ? "flow" : "フロー"} {yen(live)}
              </div>
            </article>
          );
        })}
      </div>

      <div className="px-4 pb-8">
        <div className="rounded-lg border border-border bg-panel p-4">
          <div className="text-[10px] tracking-widest text-muted">{lang === "en" ? "SECTOR SPEND · THIS MONTH" : "セクター別支出 · 今月"}</div>
          <div className="text-2xl tabular text-fg">{yen(total)}</div>
        </div>
        <IssReplicaPanel lang={lang} />
        <XSatEdgePanel lang={lang} />
        <StarlinkProposal lang={lang} />
        <StackPanel lang={lang} />
      </div>
    </div>
  );
}

function IssReplicaPanel({ lang }: { lang: string }) {
  const iss = useUbi((s) => s.iss);
  const en = lang === "en";
  return (
    <div className="mt-3 rounded-lg border border-accent/30 bg-surface p-4">
      <div className="mb-2 flex items-center gap-2 text-accent">
        <Satellite className="size-4" />
        <span className="text-[10px] tracking-[0.2em]">{en ? "DATA PLANE" : "データプレーン"}</span>
      </div>
      <h2 className="text-sm font-semibold text-fg">
        {en ? "ISS holds a replica, not the primary" : "ISSは複製。主系は地上"}
      </h2>
      <p className="mt-1 text-[11px] leading-relaxed text-dim">
        {en
          ? "Primary writes stay on Earth (device ledger + nightly learn). The station is a delay-tolerant snapshot so the guarantee floor survives a terrestrial bank or DNS failure. TDRS windows, radiation, and the ~2030 deorbit make ISS a bad place for live Postgres."
          : "書き込みの主系は地上（端末台帳と夜間学習）に置く。ISSは遅延耐性のスナップショットで、地上の銀行やDNSが落ちても保障の最低線を残す。TDRSの隙間、放射線、2030年前後の落下予定があるので、ISSに生のPostgresを置くべきではない。"}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
        <div className="rounded-md border border-border bg-panel p-2">
          <dt className="text-muted">{en ? "Primary" : "主系"}</dt>
          <dd className="mt-0.5 text-fg">{en ? "Terrestrial · read/write" : "地上 · 読み書き"}</dd>
        </div>
        <div className="rounded-md border border-border bg-panel p-2">
          <dt className="text-muted">{en ? "ISS replica" : "ISS 複製"}</dt>
          <dd className="mt-0.5 text-accent">{en ? "Read-only snapshot" : "読み取り専用"}</dd>
        </div>
        <div className="rounded-md border border-border bg-panel p-2">
          <dt className="text-muted">AOS</dt>
          <dd className="mt-0.5 text-fg">{iss.inView ? stationName(iss.stationId, lang) : en ? "waiting" : "待ち"}</dd>
        </div>
        <div className="rounded-md border border-border bg-panel p-2">
          <dt className="text-muted">{en ? "Last snapshot" : "最終複製"}</dt>
          <dd className="mt-0.5 tabular text-fg">
            {iss.lastSync ? iss.lastSync.slice(11, 19) : "—"} · v{iss.version}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function XSatEdgePanel({ lang }: { lang: string }) {
  const xsat = useUbi((s) => s.xsat);
  const en = lang === "en";
  return (
    <div className="mt-3 rounded-lg border border-alert/30 bg-surface p-4">
      <div className="mb-2 flex items-center gap-2 text-alert">
        <Satellite className="size-4" />
        <span className="text-[10px] tracking-[0.2em]">{en ? "X ORBITAL MESH" : "X軌道メッシュ"}</span>
      </div>
      <h2 className="text-sm font-semibold text-fg">
        {en ? "AI1 is edge inference, not the server of record" : "AI1は推論エッジ。台帳サーバーではない"}
      </h2>
      <p className="mt-1 text-[11px] leading-relaxed text-dim">
        {en
          ? "SpaceX/xAI AI1 (~600 km, 120 kW, 70 m arrays) is a good place to run learn cycles and SMS-auth HMACs off the grid. It is a bad place for the guarantee ledger: first birds are targeted around end of 2027, laser handoff breaks serial writes, radiation bit-flips accounts, and no court can say which country hosts the database. Primary stays on Earth. ISS keeps the delay-tolerant snapshot. X mesh caches inference."
          : "SpaceX/xAI の AI1（約600km、120kW、翼70m）は、学習サイクルやSMS署名を地上グリッドの外で回すには向く。保障台帳の主サーバーには向かない。初号機は2027年末目標、レーザー引き継ぎは逐次書き込みを壊し、放射線は口座をビット反転させ、どの国のDBかも言えない。主系は地上。ISSは遅延耐性の複製。Xメッシュは推論キャッシュ。"}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
        <div className="rounded-md border border-border bg-panel p-2">
          <dt className="text-muted">{en ? "Role" : "役割"}</dt>
          <dd className="mt-0.5 text-alert">{en ? "Edge · read cache" : "エッジ · 読み取りキャッシュ"}</dd>
        </div>
        <div className="rounded-md border border-border bg-panel p-2">
          <dt className="text-muted">{en ? "First launch" : "初号機"}</dt>
          <dd className="mt-0.5 text-fg">~2027-12</dd>
        </div>
        <div className="rounded-md border border-border bg-panel p-2">
          <dt className="text-muted">{en ? "Over Japan" : "日本上空"}</dt>
          <dd className="mt-0.5 tabular text-fg">
            {xsat.inView}/{xsat.birds}
          </dd>
        </div>
        <div className="rounded-md border border-border bg-panel p-2">
          <dt className="text-muted">{en ? "Status" : "状態"}</dt>
          <dd className="mt-0.5 text-fg">{en ? "Design orbit" : "設計軌道"}</dd>
        </div>
      </dl>
    </div>
  );
}

function StarlinkProposal({ lang }: { lang: string }) {
  const en = lang === "en";
  const fr = lang === "fr";
  return (
    <div className="mt-3 rounded-lg border border-border bg-surface p-4">
      <div className="mb-2 flex items-center gap-2 text-dim">
        <RadioTower className="size-4" />
        <span className="text-[10px] tracking-[0.2em]">{en ? "PROPOSAL" : fr ? "PROPOSITION" : "提案"}</span>
      </div>
      <h2 className="text-sm font-semibold text-fg">
        {en ? "Starlink after the SIM settles" : fr ? "Starlink, une fois la SIM posée" : "StarlinkはSIMが落ち着いてから"}
      </h2>
      <p className="mt-1 text-[11px] leading-relaxed text-dim">
        {en
          ? "Not connected. The guarantee rides the carrier SIM and terrestrial net first. Starlink is a later path if ground links fail — not a substitute for SMS send-auth, and not a live satellite ledger."
          : fr
            ? "Pas branché. La garantie passe d'abord par la SIM et le réseau terrestre. Starlink viendrait si le sol tombe — pas un substitut à l'auth SMS, pas un grand livre orbital."
            : "未接続です。保障はまずキャリアSIMと地上網です。Starlinkは地上リンクが落ちたときの後段であり、SMS送信認証の代用でも、衛星台帳でもありません。"}
      </p>
    </div>
  );
}

function StackPanel({ lang }: { lang: string }) {
  const en = lang === "en";
  const fr = lang === "fr";
  const rows = [
    { k: "GitHub", ja: "既存ホスト ubi-chain.github.io", en: "Existing host ubi-chain.github.io", fr: "Hôte existant ubi-chain.github.io" },
    { k: "Twilio", ja: "キャリアSMS送信認証", en: "Carrier SMS send-auth", fr: "Auth SMS opérateur" },
    { k: "Vercel", ja: "接続済み。こちらから新規リクエストは出さない", en: "Connected. No new request from here", fr: "Connecté. Pas de nouvelle demande d'ici" },
    { k: "Grok / xAI", ja: "倫理会話とフォーク読み上げ（利用者起動）", en: "Ethics chat + folk read-aloud (user-started)", fr: "Chat éthique + lecture (démarrée par vous)" },
    { k: "Figma", ja: "既存のデザイン源", en: "Existing design source", fr: "Source de design existante" },
    { k: "MongoDB", ja: "提案のみ。台帳は端末。Neonは未使用", en: "Proposal only. Ledger on-device. Neon unused", fr: "Proposition seulement. Grand livre local. Neon inutilisé" },
  ];
  return (
    <div className="mt-3 rounded-lg border border-border bg-surface p-4">
      <div className="mb-2 flex items-center gap-2 text-accent">
        <Database className="size-4" />
        <span className="text-[10px] tracking-[0.2em]">{en ? "STACK" : fr ? "PILE" : "既存スタック"}</span>
      </div>
      <ul className="space-y-2 text-[12px]">
        {rows.map((r) => (
          <li key={r.k} className="flex justify-between gap-3 border-b border-border/80 py-1 last:border-0">
            <span className="text-fg">{r.k}</span>
            <span className="text-right text-dim">{en ? r.en : fr ? r.fr : r.ja}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function statusLabel(s: string, lang: string) {
  if (lang !== "en") return s;
  if (s === "完了") return "Settled";
  if (s === "送金中") return "Sending";
  return "Held";
}
