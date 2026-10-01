import { createServerFn } from "@tanstack/react-start";
import { isAdminPhone } from "./admin";
import { isJpMobile, smsComposeUrl, toE164, type SmsSendResult, type SmsVerifyResult } from "./sms";

const WINDOW_MS = 180_000;
const RATE_MS = 60 * 60 * 1000;
const RATE_MAX = 6;
const hits = new Map<string, number[]>();

function env(key: string) {
  return process.env[key]?.trim() || undefined;
}

function secret() {
  return env("SMS_HMAC_SECRET") || env("TWILIO_AUTH_TOKEN") || env("GROK_PROJECT_ID") || "ubi-chain.com/sms-auth/2026";
}

function windowIndex(at = Date.now()) {
  return Math.floor(at / WINDOW_MS);
}

async function otpAt(e164: string, win: number) {
  const { createHmac } = await import("node:crypto");
  const h = createHmac("sha256", secret()).update(`ubichain:${e164}:${win}`).digest();
  const n = h.readUInt32BE(0) % 1_000_000;
  return String(n).padStart(6, "0");
}

function allowPhone(e164: string) {
  const now = Date.now();
  const prev = (hits.get(e164) ?? []).filter((t) => now - t < RATE_MS);
  if (prev.length >= RATE_MAX) {
    hits.set(e164, prev);
    return false;
  }
  prev.push(now);
  hits.set(e164, prev);
  return true;
}

function hostFromOrigin(origin: string) {
  try {
    const h = new URL(origin).hostname;
    if (h && h !== "localhost" && !h.startsWith("127.")) return h;
  } catch {
    /* ignore */
  }
  return "ubi-chain.com";
}

function messageBody(code: string, host: string, admin: boolean) {
  const who = admin ? "管理者回線" : "UBICHAIN";
  return `【${who}】認証コードは ${code} です。有効3分。他人に転送しないでください。\n\n@${host} #${code}`;
}

async function gatewaySend(to: string, body: string) {
  const sid = env("TWILIO_ACCOUNT_SID");
  const token = env("TWILIO_AUTH_TOKEN");
  const from = env("TWILIO_FROM") || env("SMS_FROM");
  if (sid && token && from) {
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }),
    });
    if (res.ok) return "gateway" as const;
  }
  const hook = env("SMS_HOOK_URL");
  if (hook) {
    const res = await fetch(hook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env("SMS_HOOK_TOKEN") ? { Authorization: `Bearer ${env("SMS_HOOK_TOKEN")}` } : {}),
      },
      body: JSON.stringify({ to, body, from: env("SMS_FROM") || "UBICHAIN", sender: "UBICHAIN" }),
    });
    if (res.ok) return "gateway" as const;
  }
  return null;
}

export const sendSmsAuth = createServerFn({ method: "POST" })
  .validator((input: { phone: string; origin?: string }) => ({
    phone: String(input.phone ?? "").slice(0, 24),
    origin: String(input.origin ?? "").slice(0, 180),
  }))
  .handler(async ({ data }): Promise<SmsSendResult> => {
    const e164 = toE164(data.phone);
    if (!e164 || !isJpMobile(data.phone)) {
      return { ok: false, error: "日本の携帯電話番号を入力してください" };
    }
    if (!allowPhone(e164)) {
      return { ok: false, error: "送信回数の上限です。1時間後に再試行してください" };
    }
    const code = await otpAt(e164, windowIndex());
    const body = messageBody(code, hostFromOrigin(data.origin), isAdminPhone(data.phone));
    try {
      const via = await gatewaySend(e164, body);
      if (via === "gateway") {
        return { ok: true, e164, via: "gateway", expiresSec: 180, sender: "UBICHAIN" };
      }
    } catch {
      /* SIM fallback */
    }
    const urls = smsComposeUrl(e164, body);
    return {
      ok: true,
      e164,
      via: "sim",
      smsUrl: urls.ios,
      androidUrl: urls.android,
      expiresSec: 180,
      sender: "SIM",
    };
  });

export const verifySmsAuth = createServerFn({ method: "POST" })
  .validator((input: { phone: string; code: string }) => ({
    phone: String(input.phone ?? "").slice(0, 24),
    code: String(input.code ?? "").replace(/\D/g, "").slice(0, 8),
  }))
  .handler(async ({ data }): Promise<SmsVerifyResult> => {
    const e164 = toE164(data.phone);
    if (!e164 || data.code.length !== 6) return { ok: false, error: "認証コードが一致しません" };
    const win = windowIndex();
    const ok = data.code === (await otpAt(e164, win)) || data.code === (await otpAt(e164, win - 1));
    return ok ? { ok: true } : { ok: false, error: "認証コードが一致しません。有効は3分です" };
  });
