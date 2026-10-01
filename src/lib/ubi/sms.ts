export function toE164(phone: string) {
  let d = phone.replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("810") && d.length >= 12) d = d.slice(2);
  if (d.startsWith("81") && d.length >= 11) return `+${d}`;
  if (d.startsWith("0") && d.length >= 10 && d.length <= 11) return `+81${d.slice(1)}`;
  if (d.length >= 10 && d.length <= 15) return `+${d}`;
  return null;
}

export function isJpMobile(phone: string) {
  const e164 = toE164(phone);
  if (!e164) return false;
  return /^\+81[6-9]0\d{8}$/.test(e164);
}

export function smsComposeUrl(e164: string, body: string) {
  const n = e164.replace(/^\+/, "");
  return {
    ios: `sms:+${n}&body=${encodeURIComponent(body)}`,
    android: `sms:+${n}?body=${encodeURIComponent(body)}`,
  };
}

export type SmsSendResult =
  | {
      ok: true;
      e164: string;
      via: "gateway" | "sim";
      smsUrl?: string;
      androidUrl?: string;
      expiresSec: number;
      sender: string;
    }
  | { ok: false; error: string };

export type SmsVerifyResult = { ok: true } | { ok: false; error: string };
