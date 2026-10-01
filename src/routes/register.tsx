import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { sendAdminEmailOtp, verifyAdminEmailOtp } from "@/lib/ubi/email-fn";
import { sendSmsAuth, verifySmsAuth } from "@/lib/ubi/sms-fn";
import { useUbi } from "@/lib/ubi/store";

export const Route = createFileRoute("/register")({ component: RegisterPage });
type Method = "sms" | "admin-email";

function RegisterPage() {
  const { lang, login } = useUbi();
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>("sms");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const en = lang === "en";

  const sendCode = async () => {
    setBusy(true); setError("");
    try {
      const res = method === "sms" ? await sendSmsAuth({ data: { phone } }) : await sendAdminEmailOtp({ data: undefined });
      if (!res.ok) return setError(res.error);
      setSent(true);
    } catch { setError(en ? "Could not start authentication." : "認証を開始できませんでした"); }
    finally { setBusy(false); }
  };

  const confirm = async () => {
    setBusy(true); setError("");
    try {
      if (method === "sms") {
        const res = await verifySmsAuth({ data: { phone, code: otp } });
        if (!res.ok) return setError(res.error);
        login({ name: name.trim() || (en ? "Member" : "メンバー"), phone });
      } else {
        const res = await verifyAdminEmailOtp({ data: { code: otp } });
        if (!res.ok) return setError(res.error);
        login({ name: "管理者", phone: "", email: res.email });
      }
      void navigate({ to: "/me" });
    } catch { setError(en ? "Verification failed." : "認証に失敗しました"); }
    finally { setBusy(false); }
  };

  return <div className="h-full overflow-y-auto font-mono"><div className="mx-auto max-w-md p-5">
    <div className="text-[10px] tracking-[0.25em] text-muted">AUTH · UBICHAIN</div>
    <h1 className="mt-1 text-xl font-semibold text-fg">{en ? "Sign in" : "ログイン"}</h1>
    <p className="mt-2 text-[12px] leading-relaxed text-dim">{en ? "Use a one-time code delivered by a verified provider." : "認証サービスが発行したワンタイムコードでログインします。"}</p>
    <div className="mt-5 grid grid-cols-2 gap-2">
      <button type="button" onClick={() => { setMethod("sms"); setSent(false); setError(""); }} className={`h-11 border text-[12px] ${method === "sms" ? "border-accent text-accent" : "border-border text-dim"}`}>{en ? "SMS" : "SMS認証"}</button>
      <button type="button" onClick={() => { setMethod("admin-email"); setSent(false); setError(""); }} className={`h-11 border text-[12px] ${method === "admin-email" ? "border-accent text-accent" : "border-border text-dim"}`}>{en ? "Admin email" : "管理者メール"}</button>
    </div>
    {method === "sms" ? <label className="mt-5 block text-[10px] tracking-widest text-muted">{en ? "MOBILE" : "携帯電話番号"}<input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" autoComplete="tel" placeholder="080-0000-0000" className="mt-1 h-11 w-full rounded-md border border-border bg-panel px-3 text-[14px] text-fg outline-none focus:border-accent" /></label> : <div className="mt-5 rounded-md border border-border bg-surface p-3 text-[12px] leading-relaxed text-dim">{en ? "A one-time code will be sent only to the configured administrator email." : "ワンタイムコードは登録済みの管理者メールアドレスにのみ送信されます。"}</div>}
    {!sent ? <button type="button" onClick={() => void sendCode()} disabled={busy} className="mt-4 h-12 w-full rounded-md bg-accent text-[13px] font-semibold text-bg disabled:opacity-60">{busy ? (en ? "Sending…" : "送信しています…") : (en ? "Send code" : "コードを送信")}</button> : <div className="mt-4 space-y-3"><p className="rounded-md border border-accent/30 bg-accent/5 p-3 text-[12px] text-fg">{method === "sms" ? (en ? "Code sent by SMS. Enter its 6 digits." : "SMSでコードを送信しました。6桁を入力してください。") : (en ? "Code sent to the administrator email." : "管理者メールにコードを送信しました。")}</p><input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" className="h-12 w-full rounded-md border border-border bg-panel px-3 text-center text-lg tracking-[0.4em] text-fg outline-none focus:border-accent" />{method === "sms" ? <label className="block text-[10px] tracking-widest text-muted">{en ? "DISPLAY NAME (optional)" : "お名前・任意"}<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-11 w-full rounded-md border border-border bg-panel px-3 text-[14px] tracking-normal text-fg outline-none focus:border-accent" /></label> : null}<button type="button" onClick={() => void confirm()} disabled={busy || otp.length !== 6} className="h-12 w-full rounded-md bg-accent text-[13px] font-semibold text-bg disabled:opacity-60">{busy ? (en ? "Checking…" : "確認しています…") : (en ? "Verify" : "認証する")}</button></div>}
    {error ? <p className="mt-3 text-[12px] text-danger">{error}</p> : null}
    <p className="mt-6 text-[10px] leading-relaxed text-muted">{en ? "SMS requires Twilio Verify. Administrator email requires a configured Resend sender; no custom domain is required for a verified test recipient." : "SMSにはTwilio Verify、管理者メールにはResendの送信設定が必要です。検証済みテスト宛先なら独自ドメインは不要です。"}</p>
  </div></div>;
}
