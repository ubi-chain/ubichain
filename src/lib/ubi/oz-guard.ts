import { CATALOG, CHANNELS, LIVE_WORLDS, MAX_PLACED, ROOMS, blocked, clampPos, roomSize, type FurnKind, type OzItem, type OzPos, type OzRoomId } from "./oz";

export const PKT_MAX = 1536;
export const WALK_MS = 110;
export const CLOCK_PAST_MS = 8_000;
export const CLOCK_FUTURE_MS = 4_000;
export const CHAT_MAX = 140;
export const REPLAY_N = 64;

const LIFE_KEY = "ubichain.oz.life.v1";
const KINDS = new Set(CATALOG.map((c) => c.kind));
const CHANNEL_IDS = new Set(CHANNELS.map((c) => c.id));

export type OzOp = "move" | "place" | "unplace" | "warp" | "chat" | "enter";
export type DropReason =
  | "size"
  | "parse"
  | "replay"
  | "clock"
  | "rate"
  | "physics"
  | "blocked"
  | "locked"
  | "quota"
  | "schema"
  | "clone"
  | "flood";

export type OzPacket = { v: 1; id: string; op: OzOp; at: number; body: unknown };

export type GuardCtx = {
  room: OzRoomId;
  pos: OzPos;
  extra: OzItem[];
  name: string;
};

export type OzApply =
  | { op: "move"; x: number; y: number }
  | { op: "place"; item: OzItem }
  | { op: "unplace"; id: string }
  | { op: "warp"; to: OzRoomId }
  | { op: "chat"; text: string; channel: string }
  | { op: "enter"; name: string };

export type OzResult = { ok: true; apply: OzApply } | { ok: false; reason: DropReason; note: string };

export type GuardSnap = {
  accepted: number;
  dropped: number;
  byReason: Partial<Record<DropReason, number>>;
  lastDrop: { reason: DropReason; note: string; at: number } | null;
  firstName: string | null;
  personaNonGrata: number;
};

type Bucket = { tokens: number; cap: number; refillMs: number; last: number };

const buckets: Record<OzOp, Bucket> = {
  move: { tokens: 8, cap: 8, refillMs: 125, last: 0 },
  place: { tokens: 3, cap: 3, refillMs: 400, last: 0 },
  unplace: { tokens: 3, cap: 3, refillMs: 400, last: 0 },
  warp: { tokens: 2, cap: 2, refillMs: 800, last: 0 },
  chat: { tokens: 2, cap: 2, refillMs: 2_000, last: 0 },
  enter: { tokens: 2, cap: 2, refillMs: 1_500, last: 0 },
};

const seen: string[] = [];
let seq = 0;
let lastMoveAt = 0;
let lastChat = "";
let floodHits = 0;
let accepted = 0;
let dropped = 0;
const byReason: Partial<Record<DropReason, number>> = {};
let lastDrop: GuardSnap["lastDrop"] = null;
let personaNonGrata = 0;

function take(op: OzOp, now: number) {
  const b = buckets[op];
  if (!b.last) b.last = now;
  const gained = Math.floor((now - b.last) / b.refillMs);
  if (gained > 0) {
    b.tokens = Math.min(b.cap, b.tokens + gained);
    b.last += gained * b.refillMs;
  }
  if (b.tokens < 1) return false;
  b.tokens -= 1;
  return true;
}

function drop(reason: DropReason, note: string): OzResult {
  dropped += 1;
  byReason[reason] = (byReason[reason] ?? 0) + 1;
  lastDrop = { reason, note, at: Date.now() };
  return { ok: false, reason, note };
}

function readLife(): { name: string; born: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LIFE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as { name?: string; born?: string };
    if (!v.name) return null;
    return { name: v.name, born: v.born ?? "" };
  } catch {
    return null;
  }
}

function writeLife(name: string) {
  if (typeof window === "undefined") return;
  if (readLife()) return;
  localStorage.setItem(LIFE_KEY, JSON.stringify({ name, born: new Date().toISOString() }));
}

export function firstLifeName() {
  return readLife()?.name ?? null;
}

export function packetId() {
  seq += 1;
  return `p${seq.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function makePacket(op: OzOp, body: unknown, now = Date.now()): OzPacket {
  return { v: 1, id: packetId(), op, at: now, body };
}

function asInt(n: unknown) {
  return typeof n === "number" && Number.isInteger(n);
}

function inGrid(x: number, y: number, room: OzRoomId) {
  const { cols, rows } = roomSize(room);
  return x >= 0 && y >= 0 && x < cols && y < rows;
}

export function pathStep(from: OzPos, to: OzPos, room: OzRoomId, extra: OzItem[]): OzPos | null {
  const goal = clampPos(to.x, to.y, room);
  if (from.x === goal.x && from.y === goal.y) return null;
  const opts: OzPos[] = [];
  const dx = Math.sign(goal.x - from.x);
  const dy = Math.sign(goal.y - from.y);
  if (dx) opts.push({ x: from.x + dx, y: from.y });
  if (dy) opts.push({ x: from.x, y: from.y + dy });
  if (!dx && dy === 0) return null;
  for (const p of opts) {
    if (!blocked(room, p.x, p.y, extra)) return p;
  }
  return null;
}

export function receiveOz(raw: unknown, ctx: GuardCtx, now = Date.now()): OzResult {
  let pkt: OzPacket | null = null;
  if (typeof raw === "string") {
    if (raw.length > PKT_MAX) return drop("size", `len ${raw.length}`);
    try {
      pkt = JSON.parse(raw) as OzPacket;
    } catch {
      return drop("parse", "json");
    }
  } else if (raw && typeof raw === "object") {
    pkt = raw as OzPacket;
  }
  if (!pkt || pkt.v !== 1 || typeof pkt.id !== "string" || typeof pkt.op !== "string") {
    return drop("parse", "envelope");
  }
  if (JSON.stringify(pkt).length > PKT_MAX) return drop("size", "payload");
  if (seen.includes(pkt.id)) return drop("replay", pkt.id);
  seen.push(pkt.id);
  if (seen.length > REPLAY_N) seen.shift();
  if (pkt.at - now > CLOCK_FUTURE_MS) return drop("clock", "future");
  if (now - pkt.at > CLOCK_PAST_MS) return drop("clock", "stale");
  if (!take(pkt.op, now)) return drop("rate", pkt.op);

  if (pkt.op === "enter") {
    const name = typeof (pkt.body as { name?: unknown })?.name === "string" ? String((pkt.body as { name: string }).name).trim().slice(0, 24) : "";
    if (!name) return drop("schema", "name");
    const life = readLife();
    if (life && life.name !== name) {
      personaNonGrata += 1;
      return drop("clone", "persona non grata");
    }
    writeLife(name);
    accepted += 1;
    return { ok: true, apply: { op: "enter", name } };
  }

  if (pkt.op === "move") {
    const body = pkt.body as { x?: unknown; y?: unknown };
    if (!asInt(body?.x) || !asInt(body?.y)) return drop("schema", "xy");
    const x = body.x as number;
    const y = body.y as number;
    if (!inGrid(x, y, ctx.room)) return drop("physics", "oob");
    const man = Math.abs(x - ctx.pos.x) + Math.abs(y - ctx.pos.y);
    if (man !== 1) return drop("physics", `teleport ${man}`);
    if (now - lastMoveAt < WALK_MS - 50) return drop("rate", "walk");
    if (ROOMS[ctx.room]?.locked) return drop("locked", ctx.room);
    if (blocked(ctx.room, x, y, ctx.extra)) return drop("blocked", `${x},${y}`);
    lastMoveAt = now;
    accepted += 1;
    return { ok: true, apply: { op: "move", x, y } };
  }

  if (pkt.op === "place") {
    const body = pkt.body as { x?: unknown; y?: unknown; kind?: unknown };
    if (!asInt(body?.x) || !asInt(body?.y) || typeof body?.kind !== "string") return drop("schema", "place");
    const kind = body.kind as FurnKind;
    if (!KINDS.has(kind)) return drop("schema", "kind");
    const x = body.x as number;
    const y = body.y as number;
    if (!inGrid(x, y, ctx.room)) return drop("physics", "oob");
    if (ROOMS[ctx.room]?.locked || ctx.room === "outer") return drop("locked", ctx.room);
    if (ctx.extra.length >= MAX_PLACED) return drop("quota", "furniture");
    if (blocked(ctx.room, x, y, ctx.extra)) return drop("blocked", `${x},${y}`);
    if (ctx.pos.x === x && ctx.pos.y === y) return drop("blocked", "self");
    const href = kind === "radio" ? "/live" : kind === "shelf" ? "/library" : undefined;
    accepted += 1;
    return { ok: true, apply: { op: "place", item: { id: `u-${pkt.id}`, x, y, kind, placed: true, href, sit: kind === "chair" || kind === "bed" } } };
  }

  if (pkt.op === "unplace") {
    const id = typeof (pkt.body as { id?: unknown })?.id === "string" ? (pkt.body as { id: string }).id : "";
    const hit = ctx.extra.find((it) => it.id === id && it.placed);
    if (!hit) return drop("schema", "no item");
    accepted += 1;
    return { ok: true, apply: { op: "unplace", id } };
  }

  if (pkt.op === "warp") {
    const to = (pkt.body as { to?: unknown })?.to;
    if (typeof to !== "string" || !(to in ROOMS)) return drop("schema", "room");
    const dest = to as OzRoomId;
    if (ROOMS[dest].locked || dest === "outer") return drop("locked", dest);
    if (!LIVE_WORLDS.includes(dest)) return drop("locked", dest);
    accepted += 1;
    return { ok: true, apply: { op: "warp", to: dest } };
  }

  if (pkt.op === "chat") {
    const body = pkt.body as { text?: unknown; channel?: unknown };
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    const channel = typeof body?.channel === "string" ? body.channel : "";
    if (!text || text.length > CHAT_MAX) return drop("schema", "text");
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text)) return drop("schema", "ctrl");
    if (!CHANNEL_IDS.has(channel as (typeof CHANNELS)[number]["id"])) return drop("schema", "ch");
    if (text === lastChat) {
      floodHits += 1;
      if (floodHits >= 3) return drop("flood", "repeat");
    } else {
      floodHits = 0;
      lastChat = text;
    }
    accepted += 1;
    return { ok: true, apply: { op: "chat", text, channel } };
  }

  return drop("parse", "op");
}

export function guardSnap(): GuardSnap {
  return {
    accepted,
    dropped,
    byReason: { ...byReason },
    lastDrop,
    firstName: firstLifeName(),
    personaNonGrata,
  };
}

export function resetGuardForTest() {
  seen.length = 0;
  seq = 0;
  lastMoveAt = 0;
  lastChat = "";
  floodHits = 0;
  accepted = 0;
  dropped = 0;
  lastDrop = null;
  personaNonGrata = 0;
  for (const k of Object.keys(byReason) as DropReason[]) delete byReason[k];
  for (const b of Object.values(buckets)) {
    b.tokens = b.cap;
    b.last = 0;
  }
}

if (typeof window !== "undefined") {
  (window as Window & { __ozGuard?: { receive: typeof receiveOz; snap: typeof guardSnap } }).__ozGuard = {
    receive: receiveOz,
    snap: guardSnap,
  };
}
