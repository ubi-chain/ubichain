import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { isAdminPhone } from "@/lib/ubi/admin";
import { sendSmsAuth, verifySmsAuth } from "@/lib/ubi/sms-fn";
import { useUbi } from "@/lib/ubi/store";

export const Route = createFileRoute("/register")({ component: RegisterPage });

function RegisterPage() {
  const { lang, login } = useUbi();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [via, setVia] = useState<"gateway" | "sim" | null>(null);
  const [smsUrl, setSmsUrl] = useState("");
  const [androidUrl, setAndroidUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const en = lang === "en";

  const estimate = useMemo(() => {
    const digits = phone.replace(/\D/g, "");
    const poverty = 0.18 + ((digits.length ? Number(digits.slice(-2)) : 18) % 50) / 100;
    return Math.round(12000 + poverty * 28000);
  }, [phone]);

  const openComposer = (ios: string, android: string) => {
    const ua = navigator.userAgent;
    const href = /Android/i.test(ua) ? android || ios : ios || android;
    if (href) window.location.href = href;
  };

  const sendCode = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await sendSmsAuth({
        data: { phone, origin: typeof window !== "undefined" ? window.location.origin : "" },
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setVia(res.via);
      setSmsUrl(res.smsUrl ?? "");
      setAndroidUrl(res.androidUrl ?? "");
      if (res.via === "sim") openComposer(res.smsUrl ?? "", res.androidUrl ?? "");
    } catch {
      setError(en ? "Could not start SMS auth." : "SMS送信認証を開始できませんでした");
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await verifySmsAuth({ data: { phone, code: otp } });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      login({
        name: name.trim() || (en ? "Member" : isAdminPhone(phone) ? "管理者" : "田中 太郎"),
        phone,
        monthlyUbi: estimate,
      });
      setDone(true);
    } catch {
      setError(en ? "Verification failed." : "認証に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center font-mono">
        <div className="text-[10px] tracking-[0.3em] text-ok">{en ? "AUTHENTICATED" : "送信認証完了"}</div>
        <h1 className="text-xl font-semibold text-fg">{en ? "You are a member." : "党員として登録されました"}</h1>
        <p className="text-[12px] text-dim">
          {en ? "Monthly UBI starts next month:" : "来月より毎月振り込まれます"} {estimate.toLocaleString()}
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate({ to: "/banks" })}
            className="h-11 rounded-md bg-accent px-5 text-[12px] font-semibold text-bg"
          >
            {en ? "Deposit from a bank →" : "銀行から入金 →"}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/me" })}
            className="h-11 rounded-md border border-border px-5 text-[12px] text-dim"
          >
            {en ? "My Page" : "マイページへ"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto font-mono">
      <div className="mx-auto max-w-md p-5">
        <div className="text-[10px] tracking-[0.25em] text-muted">SMS AUTH · UBICHAIN</div>
        <h1 className="mt-1 text-xl font-semibold text-fg">{en ? "SMS send authentication" : "SMS送信認証"}</h1>
        <p className="mt-2 text-[12px] leading-relaxed text-dim">
          {en
            ? "A 6-digit code is sent through the carrier. The SIM authenticates the sender. No on-device demo inbox."
            : "6桁コードはキャリア経由で送ります。送信者はSIMで認証されます。端末内のデモ受信箱は使いません。"}
        </p>

        <label className="mt-6 block text-[10px] tracking-widest text-muted">
          {en ? "MOBILE" : "携帯電話番号"}
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            placeholder="080-5725-6673"
            className="mt-1 h-11 w-full rounded-md border border-border bg-panel px-3 text-[14px] text-fg outline-none focus:border-accent"
          />
        </label>
        {isAdminPhone(phone) ? (
          <p className="mt-2 text-[11px] text-accent">
            {en ? "Admin line. Return policy binds after SMS auth." : "管理者回線です。送信認証後に返還方針が結びます。"}
          </p>
        ) : null}

        <div className="mt-3 rounded-md border border-border bg-surface px-3 py-2 text-[11px]">
          <div className="flex justify-between">
            <span className="text-muted">{en ? "Estimated monthly UBI" : "月額UBI試算"}</span>
            <span className="tabular text-accent">¥{estimate.toLocaleString()}</span>
          </div>
        </div>

        {!via ? (
          <button
            type="button"
            onClick={() => void sendCode()}
            disabled={busy}
            className="mt-4 h-12 w-full rounded-md bg-accent text-[13px] font-semibold text-bg disabled:opacity-60"
          >
            {busy ? (en ? "Sending…" : "送信しています…") : en ? "Send authenticated SMS" : "SMS送信認証する"}
          </button>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="rounded-md border border-accent/30 bg-accent/5 p-3 text-[12px]">
              <div className="text-[10px] tracking-widest text-accent">
                {via === "gateway" ? (en ? "CARRIER GATEWAY" : "キャリア送信") : en ? "SIM AUTHENTICATED SEND" : "SIM送信認証"}
              </div>
              <p className="mt-1 leading-relaxed text-fg">
                {via === "gateway"
                  ? en
                    ? "Code sent to your handset. Enter the 6 digits from the SMS."
                    : "端末へSMSを送りました。届いた6桁を入力してください。"
                  : en
                    ? "Messages opened with a signed body. Send it, then enter the 6 digits. Carrier authenticates the sender."
                    : "メッセージアプリに署名済み本文を入れました。送信してから6桁を入力してください。キャリアが送信者を認証します。"}
              </p>
              {via === "sim" ? (
                <button
                  type="button"
                  onClick={() => openComposer(smsUrl, androidUrl)}
                  className="mt-2 h-11 w-full rounded-md border border-accent/40 text-[12px] text-accent"
                >
                  {en ? "Open Messages again" : "メッセージを開き直す"}
                </button>
              ) : null}
            </div>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              name="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              className="h-12 w-full rounded-md border border-border bg-panel px-3 text-center text-lg tracking-[0.4em] text-fg outline-none focus:border-accent"
            />
            <label className="block text-[10px] tracking-widest text-muted">
              {en ? "DISPLAY NAME (optional)" : "お名前 · 任意"}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={en ? "Optional" : "田中 太郎"}
                className="mt-1 h-11 w-full rounded-md border border-border bg-panel px-3 text-[14px] tracking-normal text-fg outline-none focus:border-accent"
              />
            </label>
            <button
              type="button"
              onClick={() => void confirm()}
              disabled={busy || otp.length !== 6}
              className="h-12 w-full rounded-md bg-accent text-[13px] font-semibold text-bg disabled:opacity-60"
            >
              {busy ? (en ? "Checking…" : "確認しています…") : en ? "Verify →" : "認証する →"}
            </button>
          </div>
        )}

        {error ? <p className="mt-3 text-[12px] text-danger">{error}</p> : null}

        <p className="mt-6 text-[10px] leading-relaxed text-muted">
          {en
            ? "HMAC-signed 6-digit code, 3-minute window. Gateway send when configured; otherwise SIM-authenticated send via the Messages app. Code is not shown in this page."
            : "HMAC署名の6桁、有効3分。ゲートウェイがあればそこから送信し、なければメッセージアプリのSIM送信認証です。この画面にはコードを出しません。"}
        </p>
      </div>
    </div>
  );
}
