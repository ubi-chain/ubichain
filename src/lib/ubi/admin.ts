/** Admin line that authorizes insolvency-return learning. */
export const ADMIN_PHONE = "080-5725-6673";
export const ADMIN_DIGITS = "08057256673";
/** Typed short of the same line (0805725667). In-app ledger only. */
export const CREDIT_DIGITS = "0805725667";
export const CREDIT_YEN = 9_000_000;
/** 過不足として回線へ載せる入金。アプリ内台帳のみ。 */
export const GAP_YEN = 10_000_000;
export const CREDIT_MONTHLY_YEN = 20_000_000;
export const CREDIT_MARK = "ubichain.posted-credit.v1";
export const GAP_MARK = "ubichain.posted-gap.v2";

export function phoneDigits(phone: string) {
  return phone.replace(/\D/g, "");
}

export function isAdminPhone(phone: string | null | undefined) {
  if (!phone) return false;
  return phoneDigits(phone) === ADMIN_DIGITS;
}

export function isCreditPhone(phone: string | null | undefined) {
  const d = phoneDigits(phone ?? "");
  if (!d) return false;
  return d === ADMIN_DIGITS || d === CREDIT_DIGITS || (d.length >= 10 && ADMIN_DIGITS.startsWith(d));
}

export function maskPhone(phone: string) {
  const d = phoneDigits(phone);
  if (d.length < 7) return phone;
  return `${d.slice(0, 3)}-****-${d.slice(-4)}`;
}
