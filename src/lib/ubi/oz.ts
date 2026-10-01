export type OzRoomId =
  | "plaza"
  | "yoyogi"
  | "shibuya"
  | "asakusa"
  | "village"
  | "pico"
  | "parlor"
  | "study"
  | "kyoto"
  | "osaka"
  | "sapporo"
  | "okinawa"
  | "kanazawa"
  | "home"
  | "orbit"
  | "mars"
  | "outer";

export type OzPos = { x: number; y: number };
export type OzFacing = "se" | "sw" | "ne" | "nw";
export type OzPose = "idle" | "walk" | "sit" | "dance" | "sleep" | "wave" | "moon" | "kiss" | "janken";
export type OzGender = "m" | "f";
export type OzBubble = "plain" | "panda" | "cloud" | "janken" | "sign";
export type OzScale = "norm" | "mini";
export type OzDance = "dance" | "pogo" | "duck" | "rollie";
export type OzJanken = "goo" | "choki" | "paa";
export type OzAvatar = {
  hue: number;
  hat: number;
  body: number;
  gender: OzGender;
  skin: number;
  cap: boolean;
  headset: boolean;
  shoes: number;
  top: number;
  face: number;
  shorts: boolean;
  ponytail: boolean;
};
export type OzGuest = {
  name: string;
  avatar: OzAvatar;
  room: OzRoomId;
  pos: OzPos;
  facing: OzFacing;
  pose: OzPose;
  bubble?: string;
  bubbleKind?: OzBubble;
  scale?: OzScale;
  dance?: OzDance;
  sign?: number;
  janken?: OzJanken;
};
export type FurnKind = "desk" | "plant" | "radio" | "shelf" | "table" | "lamp" | "bed" | "chair" | "window" | "door" | "basket" | "cube";
export type OzItem = {
  id: string;
  x: number;
  y: number;
  kind: FurnKind | "bridge" | "gate";
  to?: OzRoomId;
  href?: string;
  placed?: boolean;
  sit?: boolean;
};
export type OzDecor = {
  paper: string;
  floor: string;
  doorAt: number;
  cols: number;
  rows: number;
};

export const COLS = 9;
export const ROWS = 7;
export const HOME_COLS = 5;
export const HOME_ROWS = 5;
export const MIN_GRID = 3;
export const MAX_GRID = 12;
export const MAX_PLACED = 12;
export const TILE_W = 64;
export const TILE_H = 32;
export const WALL_H = 86;
export const WORLD_CAP = 15;
export const WORLD_N = 17;

export const WORLD_IDS: OzRoomId[] = [
  "plaza",
  "yoyogi",
  "shibuya",
  "asakusa",
  "village",
  "pico",
  "parlor",
  "study",
  "kyoto",
  "osaka",
  "sapporo",
  "okinawa",
  "kanazawa",
  "home",
  "orbit",
  "mars",
  "outer",
];

export const LIVE_WORLDS: OzRoomId[] = WORLD_IDS.filter((id) => id !== "outer");

const liveSizes: Partial<Record<OzRoomId, { cols: number; rows: number }>> = {};

export function defaultGrid(id: OzRoomId): { cols: number; rows: number } {
  if (id === "home" || id === "pico") return { cols: HOME_COLS, rows: HOME_ROWS };
  if (id === "mars") return { cols: 5, rows: 5 };
  return { cols: COLS, rows: ROWS };
}

export function roomSize(id: OzRoomId): { cols: number; rows: number } {
  return liveSizes[id] ?? defaultGrid(id);
}

export function syncLiveSize(decor: Record<OzRoomId, OzDecor>) {
  for (const id of WORLD_IDS) {
    const d = decor[id];
    liveSizes[id] = { cols: d.cols, rows: d.rows };
  }
}

export function roomCap(cols: number, rows: number) {
  return Math.min(WORLD_CAP, Math.max(4, Math.floor((cols * rows) / 3)));
}

export function isoLeft(x: number, y: number, cols = COLS) {
  const ox = ((cols - 1) * TILE_W) / 2;
  return (x - y) * (TILE_W / 2) + ox;
}

export function isoTop(x: number, y: number) {
  return (x + y) * (TILE_H / 2);
}

export function facingFromDelta(dx: number, dy: number): OzFacing {
  if (dx > 0) return "se";
  if (dx < 0) return "sw";
  if (dy < 0) return "ne";
  return "nw";
}

export const CATALOG: { kind: FurnKind; ja: string; en: string; fr: string; shop: "furn" | "wall" }[] = [
  { kind: "bed", ja: "ベッド", en: "Bed", fr: "Lit", shop: "furn" },
  { kind: "chair", ja: "いす", en: "Chair", fr: "Chaise", shop: "furn" },
  { kind: "desk", ja: "机", en: "Desk", fr: "Bureau", shop: "furn" },
  { kind: "table", ja: "テーブル", en: "Table", fr: "Table", shop: "furn" },
  { kind: "lamp", ja: "ランプ", en: "Lamp", fr: "Lampe", shop: "furn" },
  { kind: "shelf", ja: "本棚", en: "Bookshelf", fr: "Étagère", shop: "furn" },
  { kind: "plant", ja: "観葉", en: "Plant", fr: "Plante", shop: "furn" },
  { kind: "radio", ja: "ラジオ", en: "Radio", fr: "Radio", shop: "furn" },
  { kind: "basket", ja: "カゴ", en: "Basket", fr: "Panier", shop: "furn" },
  { kind: "cube", ja: "キューブ", en: "Cube", fr: "Cube", shop: "furn" },
  { kind: "window", ja: "窓", en: "Window", fr: "Fenêtre", shop: "wall" },
  { kind: "door", ja: "ドア", en: "Door", fr: "Porte", shop: "wall" },
];

export const CLOTHES = [
  { id: "headset", ja: "ヘッドセット", en: "Headset", fr: "Casque", yen: 2400, mint: true },
  { id: "cap", ja: "キャップ", en: "Cap", fr: "Casquette", yen: 800, mint: false },
  { id: "shirt", ja: "シャツ", en: "Shirt", fr: "Chemise", yen: 1200, mint: false },
  { id: "tee", ja: "Tシャツ", en: "Tee", fr: "T-shirt", yen: 400, mint: false },
  { id: "shorts", ja: "ショートパンツ", en: "Shorts", fr: "Short", yen: 600, mint: false },
  { id: "sneakers", ja: "スニーカー", en: "Sneakers", fr: "Baskets", yen: 1800, mint: true },
] as const;

export type ClothId = (typeof CLOTHES)[number]["id"];

export const STAMPS = [
  { id: "hi", ja: "こんにちは", en: "hello", fr: "bonjour" },
  { id: "kitayo", ja: "きたよ", en: "I'm here", fr: "j'arrive" },
  { id: "yoroshiku", ja: "よろしく", en: "regards", fr: "enchanté" },
  { id: "dance", ja: "おどろう", en: "dance", fr: "dansons" },
  { id: "sleep", ja: "おやすみ", en: "night", fr: "bonne nuit" },
  { id: "thanks", ja: "ありがとう", en: "thanks", fr: "merci" },
] as const;

export const WALLPAPERS = [
  { id: "sky", ja: "晴空", en: "Sky", css: "linear-gradient(180deg, #8ec8e8 0%, #d7eef8 70%, #f2f7fb 100%)" },
  { id: "night", ja: "夜空", en: "Night", css: "linear-gradient(180deg, #0a2038, #1a3a55)" },
  { id: "wood", ja: "ロール", en: "Roll", css: "repeating-linear-gradient(90deg, #c4a07a 0 10px, #d8b48c 10px 20px)" },
] as const;

export const FLOORS = [
  { id: "check", ja: "市松", en: "Check" },
  { id: "tatami", ja: "畳", en: "Tatami" },
  { id: "tile", ja: "タイル", en: "Tile" },
] as const;

function gate(to: OzRoomId, x = 0, y = 2): OzItem {
  return { id: `g-${to}`, x, y, kind: "gate", to };
}

function district(
  ja: string,
  en: string,
  fr: string,
  floor: string,
  items: OzItem[],
  locked?: boolean,
): { ja: string; en: string; fr: string; floor: string; items: OzItem[]; locked?: boolean } {
  return { ja, en, fr, floor, items, locked };
}

export const ROOMS: Record<
  OzRoomId,
  {
    ja: string;
    en: string;
    fr: string;
    locked?: boolean;
    floor: string;
    items: OzItem[];
    pin?: { x: number; y: number };
  }
> = {
  plaza: district("広場", "Plaza", "Place", "var(--color-raised)", [
    { id: "lamp", x: 1, y: 1, kind: "lamp" },
    { id: "plant", x: 7, y: 1, kind: "plant" },
    { id: "bridge", x: 4, y: 0, kind: "bridge", to: "orbit" },
    { id: "table", x: 2, y: 5, kind: "table", to: "parlor" },
    { id: "home", x: 0, y: 5, kind: "door", to: "home" },
    { id: "gate", x: 8, y: 3, kind: "gate", to: "village" },
    { id: "radio", x: 6, y: 5, kind: "radio", href: "/live" },
  ]),
  yoyogi: district("代々木", "Yoyogi", "Yoyogi", "var(--color-ok)", [
    { id: "p1", x: 1, y: 1, kind: "plant" },
    { id: "p2", x: 3, y: 2, kind: "plant" },
    { id: "p3", x: 6, y: 1, kind: "plant" },
    { id: "lampy", x: 7, y: 4, kind: "lamp" },
    gate("plaza", 0, 3),
  ]),
  shibuya: district("渋谷", "Shibuya", "Shibuya", "var(--color-panel)", [
    { id: "lamp1", x: 2, y: 1, kind: "lamp" },
    { id: "lamp2", x: 6, y: 1, kind: "lamp" },
    { id: "radio-s", x: 4, y: 4, kind: "radio", href: "/live" },
    gate("plaza", 0, 3),
  ]),
  asakusa: district("浅草", "Asakusa", "Asakusa", "var(--color-warn)", [
    { id: "lantern", x: 4, y: 1, kind: "lamp" },
    { id: "plant-a", x: 1, y: 4, kind: "plant" },
    { id: "plant-b", x: 7, y: 4, kind: "plant" },
    gate("plaza", 0, 3),
  ]),
  village: district("村", "Village", "Village", "var(--color-panel)", [
    { id: "shop1", x: 1, y: 2, kind: "shelf" },
    { id: "shop2", x: 2, y: 2, kind: "desk" },
    { id: "lampv", x: 6, y: 1, kind: "lamp" },
    { id: "plantv", x: 7, y: 5, kind: "plant" },
    { id: "pico-gate", x: 8, y: 3, kind: "gate", to: "pico" },
    { id: "back", x: 0, y: 3, kind: "bridge", to: "plaza" },
  ]),
  pico: district("Pico", "Pico", "Pico", "var(--color-paper)", [
    { id: "p-plant", x: 0, y: 0, kind: "plant" },
    { id: "p-lamp", x: 4, y: 0, kind: "lamp" },
    { id: "p-table", x: 2, y: 2, kind: "table" },
    { id: "p-chair", x: 1, y: 2, kind: "chair", sit: true },
    { id: "p-cube", x: 3, y: 3, kind: "cube" },
    { id: "p-back", x: 0, y: 2, kind: "bridge", to: "village" },
  ]),
  parlor: district("遊戯", "Parlor", "Salon", "var(--color-grid)", [
    { id: "hana", x: 2, y: 3, kind: "table" },
    { id: "trump", x: 6, y: 3, kind: "table" },
    { id: "plant", x: 8, y: 1, kind: "plant" },
    { id: "bridge", x: 0, y: 3, kind: "bridge", to: "plaza" },
  ]),
  study: district("書庫", "Study", "Étude", "var(--color-surface)", [
    { id: "shelf", x: 1, y: 2, kind: "shelf", href: "/library" },
    { id: "shelf2", x: 2, y: 2, kind: "shelf", href: "/library" },
    { id: "desk", x: 6, y: 4, kind: "desk" },
    { id: "chair-s", x: 5, y: 4, kind: "chair", sit: true },
    { id: "lamp", x: 7, y: 1, kind: "lamp" },
    { id: "bridge", x: 4, y: 6, kind: "bridge", to: "plaza" },
  ]),
  kyoto: district("京都", "Kyoto", "Kyoto", "var(--color-paper)", [
    { id: "k-plant", x: 2, y: 1, kind: "plant" },
    { id: "k-shelf", x: 6, y: 2, kind: "shelf" },
    { id: "k-lamp", x: 4, y: 4, kind: "lamp" },
    gate("plaza", 0, 3),
  ]),
  osaka: district("大阪", "Osaka", "Osaka", "var(--color-raised)", [
    { id: "o-table", x: 3, y: 3, kind: "table" },
    { id: "o-lamp", x: 6, y: 1, kind: "lamp" },
    { id: "o-chair", x: 2, y: 3, kind: "chair", sit: true },
    gate("plaza", 0, 3),
  ]),
  sapporo: district("札幌", "Sapporo", "Sapporo", "var(--color-fg)", [
    { id: "s-lamp", x: 4, y: 1, kind: "lamp" },
    { id: "s-plant", x: 1, y: 4, kind: "plant" },
    gate("plaza", 0, 3),
  ]),
  okinawa: district("沖縄", "Okinawa", "Okinawa", "var(--color-bank)", [
    { id: "ok-plant", x: 2, y: 2, kind: "plant" },
    { id: "ok-plant2", x: 6, y: 3, kind: "plant" },
    { id: "ok-lamp", x: 4, y: 1, kind: "lamp" },
    gate("plaza", 0, 3),
  ]),
  kanazawa: district("金沢", "Kanazawa", "Kanazawa", "var(--color-paper)", [
    { id: "ka-desk", x: 4, y: 3, kind: "desk" },
    { id: "ka-chair", x: 3, y: 3, kind: "chair", sit: true },
    { id: "ka-plant", x: 7, y: 1, kind: "plant" },
    gate("plaza", 0, 3),
  ]),
  home: district("自分の部屋", "My room", "Ma chambre", "var(--color-paper)", [
    { id: "h-bed", x: 0, y: 3, kind: "bed", sit: true },
    { id: "h-desk", x: 3, y: 1, kind: "desk" },
    { id: "h-chair", x: 2, y: 1, kind: "chair", sit: true },
    { id: "h-lamp", x: 4, y: 0, kind: "lamp" },
    { id: "h-out", x: 4, y: 4, kind: "door", to: "plaza" },
  ]),
  orbit: district("軌道", "Orbit", "Orbite", "var(--color-bg)", [{ id: "down", x: 4, y: 6, kind: "bridge", to: "plaza" }]),
  mars: district("火星", "Mars", "Mars", "var(--color-danger)", [
    { id: "m-cube", x: 2, y: 2, kind: "cube" },
    { id: "m-lamp", x: 4, y: 0, kind: "lamp" },
    gate("plaza", 0, 2),
  ]),
  outer: district(
    "外区（閉鎖）",
    "Outer district (sealed)",
    "District extérieur (scellé)",
    "var(--color-bg)",
    [{ id: "gate", x: 0, y: 3, kind: "gate", to: "plaza" }],
    true,
  ),
};

ROOMS.plaza.pin = { x: 70, y: 54 };
ROOMS.yoyogi.pin = { x: 58, y: 46 };
ROOMS.shibuya.pin = { x: 76, y: 62 };
ROOMS.asakusa.pin = { x: 90, y: 44 };
ROOMS.village.pin = { x: 50, y: 56 };
ROOMS.kyoto.pin = { x: 40, y: 64 };
ROOMS.osaka.pin = { x: 36, y: 72 };
ROOMS.sapporo.pin = { x: 78, y: 14 };
ROOMS.okinawa.pin = { x: 24, y: 90 };
ROOMS.kanazawa.pin = { x: 32, y: 50 };

export function defaultDecor(id: OzRoomId): OzDecor {
  const { cols, rows } = defaultGrid(id);
  const paper = id === "home" || id === "pico" || id === "kyoto" || id === "okinawa" ? "sky" : id === "mars" || id === "orbit" || id === "outer" ? "night" : "wood";
  const floor = id === "home" || id === "kyoto" ? "tatami" : id === "pico" ? "tile" : "check";
  return { paper, floor, doorAt: Math.min(2, cols - 1), cols, rows };
}

export function emptyLayout(): Record<OzRoomId, OzItem[]> {
  return {
    plaza: [],
    yoyogi: [],
    shibuya: [],
    asakusa: [],
    village: [],
    pico: [],
    parlor: [],
    study: [],
    kyoto: [],
    osaka: [],
    sapporo: [],
    okinawa: [],
    kanazawa: [],
    home: [],
    orbit: [],
    mars: [],
    outer: [],
  };
}

export function emptyDecor(): Record<OzRoomId, OzDecor> {
  const out = {} as Record<OzRoomId, OzDecor>;
  for (const id of WORLD_IDS) out[id] = defaultDecor(id);
  return out;
}

const LAYOUT_KEY = "ubichain.oz.layout.v1";
const DECOR_KEY = "ubichain.oz.decor.v1";

export function readLayout(): Record<OzRoomId, OzItem[]> {
  const base = emptyLayout();
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<Record<OzRoomId, OzItem[]>>;
    for (const id of WORLD_IDS) {
      const rows = parsed[id];
      if (Array.isArray(rows)) base[id] = rows.filter((it) => it && Number.isFinite(it.x) && Number.isFinite(it.y)).slice(0, MAX_PLACED);
    }
    return base;
  } catch {
    return base;
  }
}

export function writeLayout(layout: Record<OzRoomId, OzItem[]>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
}

export function readDecor(): Record<OzRoomId, OzDecor> {
  const base = emptyDecor();
  if (typeof window === "undefined") {
    syncLiveSize(base);
    return base;
  }
  try {
    const raw = localStorage.getItem(DECOR_KEY);
    if (!raw) {
      syncLiveSize(base);
      return base;
    }
    const parsed = JSON.parse(raw) as Partial<Record<OzRoomId, Partial<OzDecor>>>;
    for (const id of WORLD_IDS) {
      const row = parsed[id];
      if (!row) continue;
      const def = defaultDecor(id);
      const cols = Number.isFinite(row.cols) ? Math.max(MIN_GRID, Math.min(MAX_GRID, row.cols as number)) : def.cols;
      const rows = Number.isFinite(row.rows) ? Math.max(MIN_GRID, Math.min(MAX_GRID, row.rows as number)) : def.rows;
      base[id] = {
        paper: typeof row.paper === "string" ? row.paper : def.paper,
        floor: typeof row.floor === "string" ? row.floor : def.floor,
        doorAt: Number.isFinite(row.doorAt) ? Math.max(0, Math.min(cols - 1, row.doorAt as number)) : def.doorAt,
        cols,
        rows,
      };
    }
  } catch {
    /* keep defaults */
  }
  syncLiveSize(base);
  return base;
}

export function writeDecor(decor: Record<OzRoomId, OzDecor>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DECOR_KEY, JSON.stringify(decor));
  syncLiveSize(decor);
}

export function stretchRoom(decor: OzDecor, dCols: number, dRows: number): OzDecor {
  const cols = Math.max(MIN_GRID, Math.min(MAX_GRID, decor.cols + dCols));
  const rows = Math.max(MIN_GRID, Math.min(MAX_GRID, decor.rows + dRows));
  return { ...decor, cols, rows, doorAt: Math.min(decor.doorAt, cols - 1) };
}

const SITTABLE = new Set<OzItem["kind"]>(["bed", "chair"]);

export function blocked(room: OzRoomId, x: number, y: number, extra: OzItem[] = []) {
  const hit = (it: OzItem) => it.x === x && it.y === y && !SITTABLE.has(it.kind) && it.kind !== "window";
  return ROOMS[room].items.some(hit) || extra.some(hit);
}

export function clampPos(x: number, y: number, room: OzRoomId = "plaza"): OzPos {
  const { cols, rows } = roomSize(room);
  return { x: Math.max(0, Math.min(cols - 1, x)), y: Math.max(0, Math.min(rows - 1, y)) };
}

export function hydrateAvatar(raw?: Partial<OzAvatar> | null): OzAvatar {
  const gender: OzGender = raw?.gender === "f" ? "f" : "m";
  return {
    hue: Number.isFinite(raw?.hue) ? (raw!.hue as number) : gender === "f" ? 330 : 210,
    hat: Number.isFinite(raw?.hat) ? (raw!.hat as number) : 1,
    body: Number.isFinite(raw?.body) ? (raw!.body as number) : 0,
    gender,
    skin: Number.isFinite(raw?.skin) ? Math.max(0, Math.min(4, raw!.skin as number)) : 2,
    cap: raw?.cap !== false,
    headset: Boolean(raw?.headset),
    shoes: Number.isFinite(raw?.shoes) ? (raw!.shoes as number) : 1,
    top: Number.isFinite(raw?.top) ? (raw!.top as number) : gender === "f" ? 1 : 2,
    face: Number.isFinite(raw?.face) ? (raw!.face as number) : 1,
    shorts: raw?.shorts !== false,
    ponytail: gender === "f" ? raw?.ponytail !== false : Boolean(raw?.ponytail),
  };
}

export function omakase(gender: OzGender = Math.random() > 0.5 ? "f" : "m"): OzAvatar {
  return hydrateAvatar({
    gender,
    hue: gender === "f" ? 330 : 210,
    hat: Math.floor(Math.random() * 3),
    body: Math.floor(Math.random() * 3),
    skin: Math.floor(Math.random() * 5),
    cap: Math.random() > 0.35,
    headset: Math.random() > 0.55,
    shoes: Math.floor(Math.random() * 3),
    top: 1 + Math.floor(Math.random() * 2),
    face: 1 + Math.floor(Math.random() * 3),
    shorts: Math.random() > 0.4,
    ponytail: gender === "f",
  });
}

export function templateAvatar(gender: OzGender = "m"): OzAvatar {
  return hydrateAvatar({
    gender,
    cap: true,
    headset: false,
    face: 0,
    top: 0,
    shoes: 1,
    skin: 2,
    shorts: true,
    ponytail: gender === "f",
  });
}

export function wearCloth(avatar: OzAvatar, id: ClothId): OzAvatar {
  if (id === "headset") return { ...avatar, headset: !avatar.headset, face: Math.max(1, avatar.face) };
  if (id === "cap") return { ...avatar, cap: !avatar.cap, hat: avatar.cap ? 0 : 1, face: Math.max(1, avatar.face) };
  if (id === "shirt") return { ...avatar, top: 2, face: Math.max(1, avatar.face) };
  if (id === "tee") return { ...avatar, top: 1, face: Math.max(1, avatar.face) };
  if (id === "shorts") return { ...avatar, shorts: !avatar.shorts, face: Math.max(1, avatar.face) };
  return { ...avatar, shoes: avatar.shoes === 1 ? 2 : 1, face: Math.max(1, avatar.face) };
}

const KEY = "ubichain.oz.v1";

export function readGuest(): OzGuest | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const g = JSON.parse(raw) as OzGuest;
    if (!g?.name) return null;
    if (!ROOMS[g.room]) g.room = "plaza";
    g.avatar = hydrateAvatar(g.avatar);
    g.facing = g.facing ?? "se";
    g.pose = g.pose ?? "idle";
    g.bubbleKind = g.bubbleKind ?? "plain";
    g.scale = g.scale === "mini" ? "mini" : "norm";
    g.dance = g.dance ?? "dance";
    const { cols, rows } = roomSize(g.room);
    g.pos = { x: Math.min(g.pos?.x ?? 2, cols - 1), y: Math.min(g.pos?.y ?? 2, rows - 1) };
    return g;
  } catch {
    return null;
  }
}

export function writeGuest(g: OzGuest) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(g));
}

export const CHANNELS = [
  { id: "JP", ja: "日本", en: "Japan", fr: "Japon" },
  { id: "EN", ja: "英語", en: "English", fr: "Anglais" },
  { id: "FR", ja: "フランス", en: "France", fr: "France" },
  { id: "ES", ja: "スペイン", en: "Spain", fr: "Espagne" },
  { id: "TH", ja: "タイ", en: "Thai", fr: "Thaï" },
  { id: "CN", ja: "中国", en: "China", fr: "Chine" },
  { id: "UA", ja: "ウクライナ", en: "Ukraine", fr: "Ukraine" },
] as const;

export const OZ_BOT = [
  {
    ja: "こちらはOZ。ピグ公式のもようがえ、Habboのコロンコマンド、Picoの言語ラウンジ、火星の賛を2011年の遊び方で回しています。壁抜けやユニコード崩しは入れません。",
    en: "OZ runs 2011 Pigg décor, Habbo colon-commands, Pico language lounges, and Mars likes. Wall-clips and crash glyphs stay out.",
    fr: "OZ reprend Pigg 2011, les commandes Habbo, Pico et Mars. Pas de clips ni de glyphes de crash.",
  },
  {
    ja: "頭上メニュー：立つ・座る・寝る・手を振る・ダンス・ムーンウォーク・ミニマム。吹き出しはパンダ・モヤモヤ・ジャンケン。",
    en: "Overhead menu: stand, sit, sleep, wave, dance, moonwalk, mini. Bubbles: panda, cloud, janken.",
    fr: "Menu : debout, assis, sommeil, salut, danse, moonwalk, mini. Bulles panda / nuage / janken.",
  },
  {
    ja: ":sit :idle :wave :dance :moon :mini :panda :cloud :janken :sign 11 。きたよとグッピグでアメが貯まります。",
    en: ":sit :idle :wave :dance :moon :mini :panda :cloud :janken :sign 11. Kitayo and Guppigg earn Ame.",
    fr: ":sit :idle :wave :dance :moon :mini. Kitayo et Guppigg donnent des Ame.",
  },
  {
    ja: "火星は賛ボード。PicoはEN/ES/THラウンジ。もようがえ帳に部屋を3つ保存できます。8×8と12×12は公式サイズです。",
    en: "Mars has a like board. Pico is the EN/ES/TH lounge. Save 3 notebooks. 8×8 and 12×12 are official sizes.",
    fr: "Mars a un tableau de likes. Pico : salon EN/ES/TH. 3 carnets. Tailles 8×8 et 12×12.",
  },
];

export const ACTIONS: { id: OzPose | "mini" | "plain" | "panda" | "cloud"; ja: string; en: string; fr: string }[] = [
  { id: "idle", ja: "立つ", en: "Stand", fr: "Debout" },
  { id: "sit", ja: "座る", en: "Sit", fr: "Assis" },
  { id: "sleep", ja: "寝る", en: "Sleep", fr: "Dormir" },
  { id: "wave", ja: "振る", en: "Wave", fr: "Saluer" },
  { id: "dance", ja: "ダンス", en: "Dance", fr: "Danser" },
  { id: "moon", ja: "ムーン", en: "Moonwalk", fr: "Moonwalk" },
  { id: "kiss", ja: "キス", en: "Kiss", fr: "Bisou" },
  { id: "janken", ja: "ジャンケン", en: "Janken", fr: "Janken" },
  { id: "mini", ja: "ミニマム", en: "Mini", fr: "Mini" },
  { id: "panda", ja: "パンダ", en: "Panda", fr: "Panda" },
  { id: "cloud", ja: "モヤモヤ", en: "Cloud", fr: "Nuage" },
];

export const DANCES: { id: OzDance; ja: string; en: string }[] = [
  { id: "dance", ja: "ダンス", en: "Dance" },
  { id: "pogo", ja: "ポゴ", en: "Pogo Mogo" },
  { id: "duck", ja: "ダック", en: "Duck Funk" },
  { id: "rollie", ja: "ローリー", en: "The Rollie" },
];

export const SIGN_GLYPH = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "H", "X", "!", "O", ":)", "R", "Y"] as const;

export const ROOM_PRESETS = [
  { cols: 5, rows: 5, ja: "5×5 初期", en: "5×5 start" },
  { cols: 8, rows: 8, ja: "8×8 公式", en: "8×8 official" },
  { cols: 12, rows: 12, ja: "12×12 拡張", en: "12×12 expand" },
] as const;

export type OzChatCmd = {
  pose?: OzPose;
  scale?: OzScale;
  bubbleKind?: OzBubble;
  dance?: OzDance;
  sign?: number;
  janken?: OzJanken;
  kitayo?: boolean;
  guppigg?: boolean;
  help?: boolean;
  text: string;
};

export function parseOzChat(raw: string): OzChatCmd {
  const t = raw.trim();
  const low = t.toLowerCase();
  if (low === ":help" || t === "コマンド") return { help: true, text: "" };
  if (low === ":sit" || t === "座る") return { pose: "sit", text: "" };
  if (low === ":stand" || t === "立つ") return { pose: "idle", text: "" };
  if (low === ":idle" || t === "寝る" || t === "おやすみ") return { pose: "sleep", text: "ZzZ" };
  if (low === "o/" || low === ":wave" || t === "振る") return { pose: "wave", text: "" };
  if (low === ":kiss") return { pose: "kiss", text: "" };
  if (low === ":moon" || low === ":moonwalk" || t === "ムーンウォーク") return { pose: "moon", text: "" };
  if (low === ":mini" || low === ":minimam" || t === "ミニマム") return { scale: "mini", text: "" };
  if (low === ":maxi" || t === "デカマム") return { scale: "norm", text: "" };
  if (low === ":panda" || t === "パンダ") return { bubbleKind: "panda", text: t.startsWith(":") ? "" : t };
  if (low === ":cloud" || low === ":moya" || t === "モヤモヤ") return { bubbleKind: "cloud", text: "" };
  if (low === ":janken" || t === "ジャンケン") {
    const hands: OzJanken[] = ["goo", "choki", "paa"];
    return { pose: "janken", bubbleKind: "janken", janken: hands[Math.floor(Math.random() * 3)], text: "" };
  }
  const dance = low.match(/^:dance(?:\s+(pogo|duck|rollie|habnam))?$/);
  if (dance) {
    const kind = (dance[1] === "pogo" ? "pogo" : dance[1] === "duck" ? "duck" : dance[1] === "rollie" || dance[1] === "habnam" ? "rollie" : "dance") as OzDance;
    return { pose: "dance", dance: kind, text: "" };
  }
  const sign = low.match(/^:sign\s+(\d{1,2})$/);
  if (sign) {
    const n = Math.max(0, Math.min(17, Number(sign[1])));
    return { pose: "idle", bubbleKind: "sign", sign: n, text: SIGN_GLYPH[n] ?? String(n) };
  }
  if (t === "きたよ" || low === ":kitayo") return { kitayo: true, text: "きたよ" };
  if (t === "グッピグ" || t === "賛" || low === ":guppigg") return { guppigg: true, text: "グッピグ" };
  if (t.startsWith("🐼") || t.startsWith("パンダ ")) return { bubbleKind: "panda", text: t.replace(/^🐼\s?/, "").replace(/^パンダ\s/, "") };
  return { text: t };
}

export function jankenGlyph(hand: OzJanken | undefined) {
  if (hand === "choki") return "チョキ";
  if (hand === "paa") return "パー";
  return "グー";
}

export type AmeWallet = {
  ame: number;
  day: string;
  login: boolean;
  dress: boolean;
  guppigg: number;
  kitayo: number;
  likes: Record<string, number>;
  visits: Partial<Record<OzRoomId, number>>;
};

const AME_KEY = "ubichain.oz.ame.v1";
const NOTE_KEY = "ubichain.oz.note.v1";

function todayJst(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function defaultAme(): AmeWallet {
  return { ame: 0, day: "", login: false, dress: false, guppigg: 0, kitayo: 0, likes: {}, visits: {} };
}

export function readAme(): AmeWallet {
  const base = defaultAme();
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(AME_KEY);
    if (!raw) return base;
    const p = JSON.parse(raw) as Partial<AmeWallet>;
    return {
      ame: Number.isFinite(p.ame) ? Math.max(0, p.ame as number) : 0,
      day: typeof p.day === "string" ? p.day : "",
      login: Boolean(p.login),
      dress: Boolean(p.dress),
      guppigg: Number.isFinite(p.guppigg) ? (p.guppigg as number) : 0,
      kitayo: Number.isFinite(p.kitayo) ? (p.kitayo as number) : 0,
      likes: p.likes && typeof p.likes === "object" ? p.likes : {},
      visits: p.visits && typeof p.visits === "object" ? p.visits : {},
    };
  } catch {
    return base;
  }
}

export function writeAme(w: AmeWallet) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AME_KEY, JSON.stringify(w));
}

export function rollAmeDay(w: AmeWallet, now = new Date()): AmeWallet {
  const day = todayJst(now);
  if (w.day === day) return w;
  return { ...w, day, login: false, dress: false, guppigg: 0, kitayo: 0 };
}

export function creditLogin(w: AmeWallet): AmeWallet {
  const rolled = rollAmeDay(w);
  if (rolled.login) return rolled;
  return { ...rolled, login: true, ame: rolled.ame + 5 };
}

export function creditDress(w: AmeWallet): AmeWallet {
  const rolled = rollAmeDay(w);
  if (rolled.dress) return { ...rolled, ame: rolled.ame + 0 };
  return { ...rolled, dress: true, ame: rolled.ame + 3 };
}

export function creditGuppigg(w: AmeWallet, who: string): { next: AmeWallet; gained: number } {
  const rolled = rollAmeDay(w);
  if (rolled.guppigg >= 20) return { next: rolled, gained: 0 };
  const likes = { ...rolled.likes, [who]: (rolled.likes[who] ?? 0) + 1 };
  return { next: { ...rolled, guppigg: rolled.guppigg + 1, ame: rolled.ame + 1, likes }, gained: 1 };
}

export function creditKitayo(w: AmeWallet, room: OzRoomId): { next: AmeWallet; gained: number } {
  const rolled = rollAmeDay(w);
  const already = (rolled.visits[room] ?? 0) > 0;
  const visits = { ...rolled.visits, [room]: (rolled.visits[room] ?? 0) + 1 };
  if (already || rolled.kitayo >= 20) return { next: { ...rolled, visits }, gained: 0 };
  return { next: { ...rolled, kitayo: rolled.kitayo + 1, ame: rolled.ame + 1, visits }, gained: 1 };
}

export type MoyouNote = {
  name: string;
  layout: OzItem[];
  decor: OzDecor;
};

export function readNotes(): MoyouNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MoyouNote[];
    return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
  } catch {
    return [];
  }
}

export function writeNotes(notes: MoyouNote[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTE_KEY, JSON.stringify(notes.slice(0, 3)));
}

export function lineageOf(id: OzRoomId): "pigg" | "pico" | "habbo" | "mars" {
  if (id === "pico") return "pico";
  if (id === "mars") return "mars";
  if (id === "parlor" || id === "study") return "habbo";
  return "pigg";
}
