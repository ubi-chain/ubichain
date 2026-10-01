export function compactNumber(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return Math.round(value).toString();
}

export function yen(value: number) {
  return `¥${Math.round(value).toLocaleString("ja-JP")}`;
}

export function compactYen(value: number, lang: string) {
  if (lang === "en") return `¥${compactNumber(value)}`;
  const abs = Math.abs(value);
  if (abs >= 1e12) return `¥${(value / 1e12).toFixed(1)}兆`;
  if (abs >= 1e8) return `¥${(value / 1e8).toFixed(1)}億`;
  if (abs >= 1e4) return `¥${(value / 1e4).toFixed(1)}万`;
  return yen(value);
}

export function money(amount: number, currency: string) {
  const zero = new Set(["JPY", "KRW", "VND", "IDR", "CLP"]);
  try {
    return new Intl.NumberFormat(currency === "JPY" ? "ja-JP" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: zero.has(currency) ? 0 : amount >= 100 ? 0 : 2,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  }
}

export function zoneTime(tz: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date());
  } catch {
    return new Date().toLocaleTimeString();
  }
}

export function localZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

export function hhmmss(date = new Date()) {
  return date.toTimeString().slice(0, 8);
}

export function padOtp(n: number) {
  return String(n).padStart(6, "0");
}

export function memberIdFromPhone(phone: string) {
  let h = 0;
  for (let i = 0; i < phone.length; i++) h = (Math.imul(31, h) + phone.charCodeAt(i)) | 0;
  return `UBI-${Math.abs(h).toString(36).toUpperCase().slice(0, 8)}`;
}
