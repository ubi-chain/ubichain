export type PayoutBank = { id: string; ja: string; en: string; kind: "net" | "mega" | "regional" };

export const PAYOUT_BANKS: PayoutBank[] = [
  { id: "aujibun", ja: "auじぶん銀行", en: "au Jibun Bank", kind: "net" },
  { id: "sbi", ja: "住信SBIネット銀行", en: "SBI Sumishin Net Bank", kind: "net" },
  { id: "rakuten", ja: "楽天銀行", en: "Rakuten Bank", kind: "net" },
  { id: "paypay", ja: "PayPay銀行", en: "PayPay Bank", kind: "net" },
  { id: "sony", ja: "ソニー銀行", en: "Sony Bank", kind: "net" },
  { id: "mufg", ja: "三菱UFJ銀行", en: "MUFG Bank", kind: "mega" },
  { id: "smbc", ja: "三井住友銀行", en: "SMBC", kind: "mega" },
  { id: "mizuho", ja: "みずほ銀行", en: "Mizuho Bank", kind: "mega" },
  { id: "resona", ja: "りそな銀行", en: "Resona Bank", kind: "mega" },
  { id: "saitama", ja: "埼玉りそな銀行", en: "Saitama Resona", kind: "regional" },
  { id: "yokohama", ja: "横浜銀行", en: "Bank of Yokohama", kind: "regional" },
  { id: "chiba", ja: "千葉銀行", en: "Chiba Bank", kind: "regional" },
  { id: "shizuoka", ja: "静岡銀行", en: "Shizuoka Bank", kind: "regional" },
  { id: "fukuoka", ja: "福岡銀行", en: "Bank of Fukuoka", kind: "regional" },
];

export type Payout = {
  id: string;
  bankId: string;
  bankJa: string;
  last4: string;
  yen: number;
  at: string;
  status: "受付";
};

const KEY = "ubichain.payouts.v1";

export function readPayouts(): Payout[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const rows = raw ? (JSON.parse(raw) as Payout[]) : [];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

export function savePayout(row: Payout) {
  const next = [row, ...readPayouts()].slice(0, 20);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
