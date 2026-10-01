export type SpendCat = {
  id: string;
  ja: string;
  en: string;
  fr: string;
  amount: number;
};

const KEY = "ubichain.ledger.v1";

export const DEFAULT_CATS: SpendCat[] = [
  { id: "rent", ja: "住居", en: "Rent", fr: "Loyer", amount: 62000 },
  { id: "food", ja: "食", en: "Food", fr: "Alimentation", amount: 28000 },
  { id: "transit", ja: "交通", en: "Transit", fr: "Transport", amount: 9640 },
  { id: "care", ja: "ケア・福祉", en: "Care / welfare", fr: "Soin / social", amount: 12000 },
  { id: "study", ja: "学習・文芸", en: "Study / letters", fr: "Étude / lettres", amount: 3500 },
  { id: "rest", ja: "その他", en: "Rest", fr: "Reste", amount: 8000 },
];

export type LedgerState = {
  income: number;
  cats: SpendCat[];
  learned: number;
  welfare: "none" | "congenital" | "acquired";
};

export function loadLedger(income = 17400): LedgerState {
  if (typeof window === "undefined") return { income, cats: DEFAULT_CATS, learned: 0, welfare: "none" };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as LedgerState;
      if (Array.isArray(s.cats) && s.cats.length) {
        return { ...s, income: s.income || income, welfare: s.welfare === "congenital" || s.welfare === "acquired" ? s.welfare : "none" };
      }
    }
  } catch {
    /* ignore */
  }
  return { income, cats: DEFAULT_CATS.map((c) => ({ ...c })), learned: 0, welfare: "none" };
}

export function saveLedger(s: LedgerState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function totalSpend(cats: SpendCat[]) {
  return cats.reduce((s, c) => s + c.amount, 0);
}

/** Shrink non-care categories so next period is not a deficit. Never cut care. Thicken care if congenital/acquired. */
export function avoidDeficit(state: LedgerState): LedgerState {
  const floor = state.welfare === "none" ? 0 : 18_000;
  const cats0 = state.cats.map((c) => (c.id === "care" ? { ...c, amount: Math.max(c.amount, floor) } : c));
  const spend = totalSpend(cats0);
  if (spend <= state.income) return { ...state, cats: cats0, learned: state.learned + 1 };
  const overflow = spend - state.income;
  const flexible = cats0.filter((c) => c.id !== "care");
  const flexSum = flexible.reduce((s, c) => s + c.amount, 0) || 1;
  const cats = cats0.map((c) => {
    if (c.id === "care") return c;
    const cut = Math.floor((c.amount / flexSum) * overflow);
    return { ...c, amount: Math.max(0, c.amount - cut) };
  });
  return { ...state, cats, learned: state.learned + 1 };
}
