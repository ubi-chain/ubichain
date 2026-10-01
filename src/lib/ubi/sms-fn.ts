import { createServerFn } from "@tanstack/react-start";
import { isJpMobile, toE164, type SmsSendResult, type SmsVerifyResult } from "./sms";

const RATE_MS = 60 * 60 * 1000;
const RATE_MAX = 6;
const hits = new Map<string, number[]>();

function env(key: string) {
  return process.env[key]?.trim() || undefined;
}

function allow(key: string) {
  const now = Date.now();
  const prev = (hits.get(key) ?? []).filter((time) => now - time < RATE_MS);
  if (prev.length >= RATE_MAX) return false;
  hits.set(key, [...prev, now]);
  return true;
}

function twilioConfig() {
  const accountSid = env("TWILIO_ACCOUNT_SID");
  const authToken = env("TWILIO_AUTH_TOKEN");
  const serviceSid = env("TWILIO_VERIFY_SERVICE_SID");
  return accountSid && authToken && serviceSid ? { accountSid, authToken, serviceSid } : null;
}

function twilioAuth(accountSid: string, authToken: string) {
  return `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`;
}

export const sendSmsAuth = createServerFn({ method: "POST" })
  .validator((input: { phone: string }) => ({ phone: String(input.phone ?? "").slice(0, 24) }))
  .handler(async ({ data }): Promise<SmsSendResult> => {
    const e164 = toE164(data.phone);
    if (!e164 || !isJpMobile(data.phone)) return { ok: false, error: "日本の携帯電話番号を入力してください" };
    if (!allow(`sms:${e164}`)) return { ok: false, error: "送信回数の上限です。1時間後に再試行してください" };
    const config = twilioConfig();
    if (!config) return { ok: false, error: "SMS認証は現在設定されていません" };
    const response = await fetch(`https://verify.twilio.com/v2/Services/${config.serviceSid}/Verifications`, {
      method: "POST",
      headers: { Authorization: twilioAuth(config.accountSid, config.authToken), "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ To: e164, Channel: "sms" }),
    });
    if (!response.ok) return { ok: false, error: "SMSを送信できませんでした。時間をおいて再試行してください" };
    return { ok: true, e164, via: "gateway", expiresSec: 600, sender: "UBICHAIN" };
  });

export const verifySmsAuth = createServerFn({ method: "POST" })
  .validator((input: { phone: string; code: string }) => ({
    phone: String(input.phone ?? "").slice(0, 24),
    code: String(input.code ?? "").replace(/\D/g, "").slice(0, 8),
  }))
  .handler(async ({ data }): Promise<SmsVerifyResult> => {
    const e164 = toE164(data.phone);
    const config = twilioConfig();
    if (!e164 || data.code.length !== 6 || !config) return { ok: false, error: "認証コードが一致しません" };
    const response = await fetch(`https://verify.twilio.com/v2/Services/${config.serviceSid}/VerificationCheck`, {
      method: "POST",
      headers: { Authorization: twilioAuth(config.accountSid, config.authToken), "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ To: e164, Code: data.code }),
    });
    if (!response.ok) return { ok: false, error: "認証コードが一致しません。有効期限を確認してください" };
    const result = (await response.json()) as { status?: string };
    return result.status === "approved" ? { ok: true } : { ok: false, error: "認証コードが一致しません。有効期限を確認してください" };
  });
