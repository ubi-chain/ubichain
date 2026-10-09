/** Administrator identities. Email OTP is the administrator sign-in path. */
export const ADMIN_PHONE = "080-5725-6673";
export const ADMIN_EMAIL = "haruki.2000495@gmail.com";
export const ADMIN_DIGITS = "08057256673";
export const CREDIT_DIGITS = "0805725667";
export const CREDIT_YEN = 9_000_000;
export const GAP_YEN = 10_000_000;
export const CREDIT_MONTHLY_YEN = 20_000_000;
export const CREDIT_MARK = "ubichain.posted-credit.v1";
export const GAP_MARK = "ubichain.posted-gap.v2";

export function phoneDigits(phone: string) { return phone.replace(/\D/g, ""); }
export function isAdminPhone(phone: string | null | undefined) { return typeof phone === "string" && phoneDigits(phone) === ADMIN_DIGITS; }
export function isAdminEmail(email: string | null | undefined) { return email?.trim().toLowerCase() === ADMIN_EMAIL; }
export function isAdminIdentity(user: { phone?: string | null; email?: string | null } | null | undefined) { if (!user) return false; return isAdminEmail(user.email) || isAdminPhone(user.phone); }
export function isCreditPhone(phone: string | null | undefined) {
  const d = phoneDigits(phone ?? "");
  return Boolean(d) && (d === ADMIN_DIGITS || d === CREDIT_DIGITS || (d.length >= 10 && ADMIN_DIGITS.startsWith(d)));
}
export function maskPhone(phone: string) { const d = phoneDigits(phone); return d.length < 7 ? phone : `${d.slice(0, 3)}-****-${d.slice(-4)}`; }
