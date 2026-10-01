/** Variable-rate payment gap. Ledger relief only — not a loan origination. */
export function monthlyPayment(principal: number, annualRate: number, years: number) {
  const n = Math.max(1, years * 12);
  const r = annualRate / 12;
  if (r <= 0) return principal / n;
  const pow = (1 + r) ** n;
  return (principal * r * pow) / (pow - 1);
}

export type MortgageBook = {
  id: string;
  ja: string;
  en: string;
  principal: number;
  rate: number;
  years: number;
};

export const MORTGAGE_BOOKS: MortgageBook[] = [
  { id: "mufg", ja: "三菱UFJ 変動", en: "MUFG variable", principal: 32_000_000, rate: 0.0045, years: 28 },
  { id: "smbc", ja: "三井住友 変動", en: "SMBC variable", principal: 28_500_000, rate: 0.0048, years: 30 },
  { id: "mizuho", ja: "みずほ 変動", en: "Mizuho variable", principal: 24_000_000, rate: 0.0052, years: 25 },
  { id: "resona", ja: "りそな 変動", en: "Resona variable", principal: 18_000_000, rate: 0.0055, years: 32 },
  { id: "regional", ja: "地方銀行 変動", en: "Regional variable", principal: 22_000_000, rate: 0.0068, years: 30 },
];

export function reliefGap(book: MortgageBook, shock = 0.01) {
  const now = monthlyPayment(book.principal, book.rate, book.years);
  const next = monthlyPayment(book.principal, book.rate + shock, book.years);
  return { now, next, gap: Math.max(0, next - now) };
}
