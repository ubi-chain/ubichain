export type Suit = "s" | "h" | "d" | "c";
export type TrumpCard = { suit: Suit; rank: number };

const SUITS: Suit[] = ["s", "h", "d", "c"];

export function fisherYates<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]!;
    a[i] = a[j]!;
    a[j] = t;
  }
  return a;
}

export function makeDeck(): TrumpCard[] {
  const d: TrumpCard[] = [];
  for (const s of SUITS) for (let r = 2; r <= 14; r++) d.push({ suit: s, rank: r });
  return fisherYates(d);
}

export function rankLabel(r: number) {
  if (r === 14) return "A";
  if (r === 13) return "K";
  if (r === 12) return "Q";
  if (r === 11) return "J";
  return String(r);
}

export const MONTHS = [
  { m: 1, ja: "松", en: "Pine" },
  { m: 2, ja: "梅", en: "Plum" },
  { m: 3, ja: "桜", en: "Cherry" },
  { m: 4, ja: "藤", en: "Wisteria" },
  { m: 5, ja: "菖蒲", en: "Iris" },
  { m: 6, ja: "牡丹", en: "Peony" },
  { m: 7, ja: "萩", en: "Bush clover" },
  { m: 8, ja: "芒", en: "Pampas" },
  { m: 9, ja: "菊", en: "Chrys." },
  { m: 10, ja: "紅葉", en: "Maple" },
  { m: 11, ja: "柳", en: "Willow" },
  { m: 12, ja: "桐", en: "Paulownia" },
] as const;

export type HanaKind = "hikari" | "tane" | "tan" | "kasu";
export type HanaCard = { id: string; month: number; kind: HanaKind };

const KIND_CYCLE: HanaKind[] = ["hikari", "tane", "tan", "kasu"];

export function hanaDeck(): HanaCard[] {
  const d: HanaCard[] = [];
  for (const row of MONTHS) {
    for (let i = 0; i < 4; i++) {
      d.push({ id: `${row.m}-${i}`, month: row.m, kind: KIND_CYCLE[i]! });
    }
  }
  return fisherYates(d);
}

export function hanaScore(cards: HanaCard[]) {
  return cards.reduce((s, c) => s + (c.kind === "hikari" ? 20 : c.kind === "tane" ? 10 : c.kind === "tan" ? 5 : 1), 0);
}

export function hanaLabel(month: number, lang: string) {
  const row = MONTHS.find((m) => m.m === month);
  if (!row) return String(month);
  return lang === "en" || lang === "fr" ? row.en : row.ja;
}
