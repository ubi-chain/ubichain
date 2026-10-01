import { jstDay } from "./learn";
import { emptyLayout, LIVE_WORLDS, WORLD_IDS, WORLD_N, type OzGender, type OzRoomId } from "./oz";

export const OZ_VERSION = "oz-1.2.0";
export const OZ_WINDOW_JST = "00:05 JST";
const OPS_KEY = "ubichain.oz.ops.v1";

export type OzPatch = { at: string; ja: string; en: string; fr: string };
export type OzOps = {
  version: string;
  lastRepairDay: string;
  health: Record<OzRoomId, number>;
  patches: OzPatch[];
};

function seedHealth(): Record<OzRoomId, number> {
  const health = {} as Record<OzRoomId, number>;
  for (const id of WORLD_IDS) health[id] = id === "outer" ? 12 : 90 + ((id.charCodeAt(0) + id.length) % 9);
  health.plaza = 96;
  health.home = 99;
  health.pico = 98;
  health.mars = 84;
  health.outer = 12;
  return health;
}

export function defaultOps(): OzOps {
  return {
    version: OZ_VERSION,
    lastRepairDay: "",
    health: seedHealth(),
    patches: [
      {
        at: "2026-09-16T00:05:00+09:00",
        ja: `OZ 1.2。2011年ピグ公式・裏技の正規動作、Habboコロン、Pico言語、火星の賛。壁抜けは入れない。`,
        en: `OZ 1.2. 2011 Pigg official + legal tricks, Habbo colons, Pico languages, Mars likes. No wall-clips.`,
        fr: `OZ 1.2. Pigg 2011, commandes Habbo, Pico, Mars. Pas de clips.`,
      },
    ],
  };
}

export function readOps(): OzOps {
  const base = defaultOps();
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(OPS_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<OzOps>;
    const health = { ...seedHealth(), ...(parsed.health ?? {}) };
    for (const id of Object.keys(emptyLayout()) as OzRoomId[]) {
      const n = health[id];
      health[id] = Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : seedHealth()[id];
    }
    return {
      version: OZ_VERSION,
      lastRepairDay: parsed.lastRepairDay ?? "",
      health,
      patches: Array.isArray(parsed.patches) ? parsed.patches.slice(0, 12) : base.patches,
    };
  } catch {
    return base;
  }
}

export function writeOps(ops: OzOps) {
  if (typeof window === "undefined") return;
  localStorage.setItem(OPS_KEY, JSON.stringify(ops));
}

export function worldHealth(ops: OzOps) {
  const sum = LIVE_WORLDS.reduce((n, id) => n + (ops.health[id] ?? 0), 0);
  return Math.round(sum / LIVE_WORLDS.length);
}

export function applyNightlyRepair(ops: OzOps, now = new Date()): OzOps {
  const day = jstDay(now);
  if (ops.lastRepairDay === day) return ops;
  const health = { ...ops.health };
  for (const id of WORLD_IDS) {
    if (id === "outer") continue;
    health[id] = Math.min(100, (health[id] ?? 80) + 6);
  }
  const patch: OzPatch = {
    at: now.toISOString(),
    ja: `${day} 0:05 JST の夜間メンテ。${WORLD_N}区画の床と家具を直した。外区は閉鎖のまま。`,
    en: `${day} 00:05 JST nightly repair. ${WORLD_N} districts patched. Outer stays sealed.`,
    fr: `Maintenance ${day} 00:05 JST. ${WORLD_N} districts repris. L'extérieur reste scellé.`,
  };
  const next: OzOps = {
    version: OZ_VERSION,
    lastRepairDay: day,
    health,
    patches: [patch, ...ops.patches].slice(0, 12),
  };
  writeOps(next);
  return next;
}

export type OzNpc = {
  id: string;
  name: string;
  hue: number;
  hat: number;
  body: number;
  gender: OzGender;
  room: OzRoomId;
  pos: { x: number; y: number };
};

export const OZ_NPCS: OzNpc[] = [
  { id: "mira", name: "Mira", hue: 188, hat: 1, body: 1, gender: "f", room: "plaza", pos: { x: 2, y: 3 } },
  { id: "ren", name: "Ren", hue: 32, hat: 0, body: 0, gender: "m", room: "village", pos: { x: 5, y: 4 } },
  { id: "nou", name: "Nou", hue: 152, hat: 2, body: 2, gender: "m", room: "pico", pos: { x: 3, y: 2 } },
  { id: "mia", name: "Mia", hue: 280, hat: 1, body: 1, gender: "f", room: "pico", pos: { x: 1, y: 3 } },
  { id: "aoi", name: "Aoi", hue: 330, hat: 1, body: 0, gender: "f", room: "yoyogi", pos: { x: 4, y: 3 } },
  { id: "ken", name: "Ken", hue: 210, hat: 1, body: 1, gender: "m", room: "shibuya", pos: { x: 3, y: 4 } },
  { id: "hana", name: "Hana", hue: 12, hat: 2, body: 1, gender: "f", room: "asakusa", pos: { x: 5, y: 2 } },
  { id: "yuki", name: "Yuki", hue: 200, hat: 0, body: 2, gender: "f", room: "sapporo", pos: { x: 3, y: 3 } },
  { id: "lin", name: "Lin", hue: 12, hat: 2, body: 0, gender: "f", room: "mars", pos: { x: 1, y: 2 } },
  { id: "wei", name: "Wei", hue: 40, hat: 0, body: 1, gender: "m", room: "mars", pos: { x: 3, y: 3 } },
  { id: "sul", name: "Sul", hue: 24, hat: 1, body: 2, gender: "m", room: "parlor", pos: { x: 4, y: 2 } },
];

export const OZ_DISTRICTS: {
  id: OzRoomId;
  ja: string;
  en: string;
  fr: string;
  ring: number;
}[] = [
  { id: "plaza", ja: "広場", en: "Plaza", fr: "Place", ring: 0 },
  { id: "yoyogi", ja: "代々木", en: "Yoyogi", fr: "Yoyogi", ring: 1 },
  { id: "shibuya", ja: "渋谷", en: "Shibuya", fr: "Shibuya", ring: 1 },
  { id: "asakusa", ja: "浅草", en: "Asakusa", fr: "Asakusa", ring: 1 },
  { id: "village", ja: "村", en: "Village", fr: "Village", ring: 1 },
  { id: "pico", ja: "Pico", en: "Pico", fr: "Pico", ring: 1 },
  { id: "parlor", ja: "遊戯", en: "Parlor", fr: "Salon", ring: 1 },
  { id: "home", ja: "自分の部屋", en: "My room", fr: "Chambre", ring: 1 },
  { id: "study", ja: "書庫", en: "Study", fr: "Étude", ring: 2 },
  { id: "kyoto", ja: "京都", en: "Kyoto", fr: "Kyoto", ring: 2 },
  { id: "osaka", ja: "大阪", en: "Osaka", fr: "Osaka", ring: 2 },
  { id: "sapporo", ja: "札幌", en: "Sapporo", fr: "Sapporo", ring: 2 },
  { id: "kanazawa", ja: "金沢", en: "Kanazawa", fr: "Kanazawa", ring: 2 },
  { id: "okinawa", ja: "沖縄", en: "Okinawa", fr: "Okinawa", ring: 2 },
  { id: "orbit", ja: "軌道", en: "Orbit", fr: "Orbite", ring: 2 },
  { id: "mars", ja: "火星", en: "Mars", fr: "Mars", ring: 3 },
  { id: "outer", ja: "外区", en: "Outer", fr: "Extérieur", ring: 3 },
];
