import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Fingerprint, Plane, ShieldCheck, Smartphone, Wallet } from "lucide-react";
import { useUbi } from "@/lib/ubi/store";
import { ADMIN_PHONE, isAdminIdentity, maskPhone } from "@/lib/ubi/admin";
import { TrinityHex } from "@/components/trinity-hex";

export const Route = createFileRoute("/me")({ component: MePage });

function MePage() {
  const { lang, user, logout } = useUbi();
  const admin = isAdminIdentity(user);
  const [pane, setPane] = useState<"desk" | "book">("book");
  useEffect(() => {
    if (admin) setPane("desk");
  }, [admin]);
  if (!user) {
    return (
      <div className="h-full overflow-y-auto font-mono">
        <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-sm text-fg">{lang === "en" ? "Sign in to open My Page." : lang === "fr" ? "Connectez-vous pour ouvrir Ma page." : "ログインが必要です"}</p>
          <p className="max-w-sm text-[12px] text-dim">
            {lang === "en"
              ? "Create an account with SMS to access your profile."
              : lang === "fr"
                ? "Créez un compte par SMS pour le profil."
                : "アカウントにログインして、マイページにアクセスしてください。"}
          </p>
          <Link to="/register" className="rounded-md bg-accent px-4 py-2 text-[12px] font-semibold text-bg">
            {lang === "en" ? "SMS send-auth" : lang === "fr" ? "Auth SMS" : "SMS送信認証"}
          </Link>
        </div>
        <div className="px-4 pb-8">
          <AirPass name="GUEST" memberId="UBI-GUEST" lang={lang} />
        </div>
      </div>
    );
  }



  return (
    <div className="flex h-full flex-col font-mono">
      <div className="shrink-0 border-b border-border px-4 py-4">
        <div className="text-[10px] tracking-[0.2em] text-muted">
          {admin ? (lang === "en" ? "ADMIN LINE" : "管理者回線") : lang === "en" ? "MEMBER" : "認証済み党員"}
        </div>
        <h1 className="text-xl font-semibold text-fg">{user.name}</h1>
        <div className="mt-1 text-[11px] text-dim">
          {user.memberId} · {admin ? (user.email ?? user.phone) : maskPhone(user.phone)}
        </div>
        {admin ? (
          <div className="mt-3 flex gap-2 text-[11px]">
            <button type="button" onClick={() => setPane("desk")} className={`min-h-11 flex-1 border ${pane === "desk" ? "border-accent text-accent" : "border-border text-dim"}`}>
              {lang === "en" ? "POLICE DESK" : "警察指令"}
            </button>
            <button type="button" onClick={() => setPane("book")} className={`min-h-11 flex-1 border ${pane === "book" ? "border-accent text-accent" : "border-border text-dim"}`}>
              {lang === "en" ? "LEDGER" : "台帳"}
            </button>
          </div>
        ) : null}
      </div>

      {admin && pane === "desk" ? (
        <div className="min-h-0 flex-1">
          <TrinityHex />
        </div>
      ) : (
      <div className="min-h-0 flex-1 overflow-y-auto">

      {admin ? (
        <div className="border-b border-accent/30 bg-accent/5 px-4 py-3 font-mono text-[11px] leading-relaxed text-dim">
          {lang === "en"
            ? `Admin ${ADMIN_PHONE}: insolvency capital in public corps, companies, and committees is returned first to countries under war, conflict, or disaster.`
            : `管理者 ${ADMIN_PHONE}：倒産リスクのある公社・公司・委員会の資本は、戦争・紛争・災害リスクの国へ優先して分散返還されます。`}
          <div className="mt-2 text-[10px] tracking-widest text-accent">
            {lang === "en" ? "SMS SEND-AUTH ON THIS LINE" : "この回線はSMS送信認証済み"}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 p-4 md:grid-cols-2">
        <section className="rounded-lg border border-border bg-surface p-4">
          <div className="text-[10px] tracking-widest text-muted">{lang === "en" ? "CARD" : "カード"}</div>
          <div className="mt-3 rounded-xl bg-linear-to-br from-raised to-bg p-4 ring-1 ring-accent/30">
            <div className="text-[10px] tracking-[0.3em] text-accent">IETFUBI</div>
            <div className="mt-6 text-lg">{user.name}</div>
            <div className="mt-1 text-[11px] text-dim">{user.memberId}</div>
          </div>
          <div className="mt-3 text-[11px] text-dim">{lang === "en" ? "Verified account" : "認証済みアカウント"}</div>
        </section>



        <section className="rounded-lg border border-border bg-surface p-4 md:col-span-2">
          <div className="mb-3 text-[10px] tracking-widest text-muted">{lang === "en" ? "SECURITY" : "セキュリティ"}</div>
          <ul className="grid gap-2 text-[12px] sm:grid-cols-2">
            <Li icon={<ShieldCheck className="size-4" />} t={lang === "en" ? "Identity verified" : "本人確認完了"} />
            <Li icon={<Fingerprint className="size-4" />} t={lang === "en" ? "Biometrics on" : "生体認証 指紋"} />
            <Li icon={<Wallet className="size-4" />} t={lang === "en" ? "Wallet visual" : lang === "fr" ? "Wallet visuel" : "見た目のウォレット"} />
            <Li icon={<Smartphone className="size-4" />} t={lang === "en" ? "Touch pay ready" : lang === "fr" ? "Paiement tactile" : "タッチ決済 有効"} />
            <Li icon={<Plane className="size-4" />} t={lang === "en" ? "In-app air pass" : lang === "fr" ? "Passe aérien in-app" : "アプリ内航空パス"} />
          </ul>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            {lang === "en"
              ? "Device, location, and behavior patterns double-lock theft. AES-256-GCM in transit."
              : "位置情報・デバイス情報・行動パターンを分析し、不正アクセスや資金盗難を二重に防止します。"}
          </p>
          <button type="button" onClick={logout} className="mt-4 text-[11px] text-danger hover:underline">
            {lang === "en" ? "Log out" : lang === "fr" ? "Se déconnecter" : "ログアウト"}
          </button>
        </section>

        <AirPass name={user.name} memberId={user.memberId} lang={lang} />
      </div>
      </div>
      )}
    </div>
  );
}

function Li({ icon, t }: { icon: ReactNode; t: string }) {
  return (
    <li className="flex items-center gap-2 rounded-sm border border-border bg-panel px-3 py-2 text-ok">
      {icon}
      <span className="text-fg">{t}</span>
    </li>
  );
}

function AirPass({ name, memberId, lang }: { name: string; memberId: string; lang: string }) {
  const en = lang === "en";
  const fr = lang === "fr";
  return (
    <section className="rounded-lg border border-border bg-surface p-4 md:col-span-2">
      <div className="mb-3 text-[10px] tracking-widest text-muted">AIR PASS · WALLET · VISUAL</div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-sm border border-accent/40 bg-panel p-4">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-accent">
            <Plane className="size-3.5" />
            IETFUBI AIR
          </div>
          <div className="mt-5 text-lg text-fg">{name}</div>
          <div className="font-mono text-[11px] text-dim">{memberId}</div>
          <div className="mt-5 flex items-end justify-between font-mono text-[13px]">
            <div>
              <div className="text-[9px] tracking-widest text-muted">FROM</div>
              <div className="text-fg">SDJ</div>
            </div>
            <span className="text-accent">→</span>
            <div className="text-right">
              <div className="text-[9px] tracking-widest text-muted">TO</div>
              <div className="text-fg">BRU</div>
            </div>
          </div>
          <p className="mt-4 text-[10px] leading-relaxed text-muted">
            {en
              ? "In-app literary pass to the Brussels correspondence desk. Not an ICAO travel document. Not a ticket with any airline."
              : fr
                ? "Passe littéraire in-app vers le bureau de Bruxelles. Pas un document ICAO. Pas un billet d'une compagnie."
                : "ブリュッセル通信委員会へのアプリ内文芸パスです。ICAOの渡航文書ではありません。実在の航空会社の切符でもありません。"}
          </p>
        </div>
        <div className="rounded-sm bg-fg p-4 text-bg">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.3em]">
            <Wallet className="size-3.5" />
            WALLET
          </div>
          <div className="mt-5 text-lg">{name}</div>
          <div className="font-mono text-[11px] opacity-70">{memberId}</div>
          <div className="mt-4 text-[12px]">{en ? "Stability guarantee" : fr ? "Garantie de stabilité" : "経済の安定保障"}</div>
          <p className="mt-4 text-[10px] leading-relaxed opacity-70">
            {en
              ? "Visual pass only. No Apple Wallet API, no Siri API. Read-aloud uses Web Speech or xAI TTS when you tap."
              : fr
                ? "Passe visuel seulement. Pas d'API Apple Wallet ni Siri. La lecture : Web Speech ou TTS xAI, sur tap."
                : "見た目のパスです。Apple Wallet も Siri のAPIも使いません。読み上げはタップしたときだけ Web Speech または xAI TTS です。"}
          </p>
        </div>
      </div>
    </section>
  );
}
