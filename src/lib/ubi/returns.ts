import { ADMIN_PHONE } from "./admin";

export type EntityKind = "kosha" | "gongsi" | "iinkai";
export type HazardKind = "war" | "conflict" | "disaster";

export type RiskEntity = {
  id: string;
  kind: EntityKind;
  ja: string;
  en: string;
  home: string;
  failRisk: number;
  capital: number;
};

export type HazardCountry = {
  code: string;
  ja: string;
  en: string;
  hazard: HazardKind;
  weight: number;
};

export type ReturnFlow = {
  id: string;
  entityId: string;
  entityJa: string;
  entityEn: string;
  kind: EntityKind;
  toCode: string;
  toJa: string;
  toEn: string;
  hazard: HazardKind;
  amountJpy: number;
  at: string;
  by: string;
};

export const RISK_ENTITIES: RiskEntity[] = [
  { id: "jhsc", kind: "kosha", ja: "地方住宅供給公社", en: "Prefectural housing corp", home: "JP", failRisk: 0.61, capital: 84_000_000_000 },
  { id: "ldc", kind: "kosha", ja: "土地開発公社", en: "Land development corp", home: "JP", failRisk: 0.72, capital: 126_000_000_000 },
  { id: "rhc", kind: "kosha", ja: "道路整備公社", en: "Road maintenance corp", home: "JP", failRisk: 0.48, capital: 58_000_000_000 },
  { id: "lgfv", kind: "gongsi", ja: "地方融資平台公司", en: "Local financing vehicle", home: "CN", failRisk: 0.78, capital: 410_000_000_000 },
  { id: "soc", kind: "gongsi", ja: "地方国有建設公司", en: "Local state builder", home: "CN", failRisk: 0.55, capital: 190_000_000_000 },
  { id: "hkc", kind: "gongsi", ja: "投資控股公司", en: "Investment holding co.", home: "HK", failRisk: 0.41, capital: 72_000_000_000 },
  { id: "rec", kind: "iinkai", ja: "復興委員会", en: "Reconstruction committee", home: "JP", failRisk: 0.36, capital: 44_000_000_000 },
  { id: "devc", kind: "iinkai", ja: "地域開発委員会", en: "Regional development committee", home: "KR", failRisk: 0.33, capital: 29_000_000_000 },
  { id: "irc", kind: "iinkai", ja: "国際復興委員会", en: "International reconstruction committee", home: "CH", failRisk: 0.29, capital: 61_000_000_000 },
];

export const HAZARD_COUNTRIES: HazardCountry[] = [
  { code: "UA", ja: "ウクライナ", en: "Ukraine", hazard: "war", weight: 1 },
  { code: "PS", ja: "パレスチナ", en: "Palestine", hazard: "war", weight: 0.96 },
  { code: "SD", ja: "スーダン", en: "Sudan", hazard: "war", weight: 0.94 },
  { code: "SS", ja: "南スーダン", en: "South Sudan", hazard: "war", weight: 0.9 },
  { code: "YE", ja: "イエメン", en: "Yemen", hazard: "war", weight: 0.92 },
  { code: "SY", ja: "シリア", en: "Syria", hazard: "war", weight: 0.88 },
  { code: "MM", ja: "ミャンマー", en: "Myanmar", hazard: "conflict", weight: 0.84 },
  { code: "CD", ja: "コンゴ民主共和国", en: "DR Congo", hazard: "conflict", weight: 0.82 },
  { code: "AF", ja: "アフガニスタン", en: "Afghanistan", hazard: "conflict", weight: 0.86 },
  { code: "SO", ja: "ソマリア", en: "Somalia", hazard: "conflict", weight: 0.8 },
  { code: "ET", ja: "エチオピア", en: "Ethiopia", hazard: "conflict", weight: 0.74 },
  { code: "LB", ja: "レバノン", en: "Lebanon", hazard: "conflict", weight: 0.72 },
  { code: "HT", ja: "ハイチ", en: "Haiti", hazard: "disaster", weight: 0.78 },
  { code: "BD", ja: "バングラデシュ", en: "Bangladesh", hazard: "disaster", weight: 0.7 },
  { code: "PH", ja: "フィリピン", en: "Philippines", hazard: "disaster", weight: 0.66 },
  { code: "PK", ja: "パキスタン", en: "Pakistan", hazard: "disaster", weight: 0.68 },
  { code: "TR", ja: "トルコ", en: "Türkiye", hazard: "disaster", weight: 0.62 },
  { code: "JP", ja: "日本", en: "Japan", hazard: "disaster", weight: 0.5 },
];

const KIND_JA: Record<EntityKind, string> = { kosha: "公社", gongsi: "公司", iinkai: "委員会" };
const KIND_EN: Record<EntityKind, string> = { kosha: "public corp", gongsi: "company", iinkai: "committee" };
const HAZARD_JA: Record<HazardKind, string> = { war: "戦争", conflict: "紛争", disaster: "災害" };
const HAZARD_EN: Record<HazardKind, string> = { war: "war", conflict: "conflict", disaster: "disaster" };

export function kindLabel(kind: EntityKind, lang: string) {
  return lang === "en" ? KIND_EN[kind] : KIND_JA[kind];
}

export function hazardLabel(kind: HazardKind, lang: string) {
  return lang === "en" ? HAZARD_EN[kind] : HAZARD_JA[kind];
}

function pickWeighted<T extends { weight?: number; failRisk?: number }>(rows: T[], rand: number) {
  const weights = rows.map((row) => row.weight ?? row.failRisk ?? 1);
  const sum = weights.reduce((s, w) => s + w, 0);
  let x = rand * sum;
  for (let i = 0; i < rows.length; i++) {
    x -= weights[i];
    if (x <= 0) return rows[i];
  }
  return rows[rows.length - 1];
}

export function nextReturn(now = new Date()): ReturnFlow {
  const entity = pickWeighted(RISK_ENTITIES, Math.random());
  const dest = pickWeighted(HAZARD_COUNTRIES, Math.random());
  const warBoost = dest.hazard === "war" ? 2.4 : dest.hazard === "conflict" ? 1.6 : 1;
  const amount = Math.floor((18_000_000 + Math.random() * 220_000_000) * entity.failRisk * warBoost);
  return {
    id: `${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    entityId: entity.id,
    entityJa: entity.ja,
    entityEn: entity.en,
    kind: entity.kind,
    toCode: dest.code,
    toJa: dest.ja,
    toEn: dest.en,
    hazard: dest.hazard,
    amountJpy: amount,
    at: now.toISOString(),
    by: ADMIN_PHONE,
  };
}

export function returnInsight(cycle: number) {
  const dest = HAZARD_COUNTRIES[cycle % HAZARD_COUNTRIES.length];
  const entity = RISK_ENTITIES[cycle % RISK_ENTITIES.length];
  return {
    id: "return",
    ja: `管理者回線の方針で学習。倒産リスクの${KIND_JA[entity.kind]}（${entity.ja}）から${HAZARD_JA[dest.hazard]}国・${dest.ja}へ優先返還`,
    en: `Admin-line policy trained. Insolvency capital from ${entity.en} returns first to ${HAZARD_EN[dest.hazard]}-risk ${dest.en}`,
    tone: dest.hazard === "war" ? ("alert" as const) : dest.hazard === "conflict" ? ("warn" as const) : ("ok" as const),
  };
}
