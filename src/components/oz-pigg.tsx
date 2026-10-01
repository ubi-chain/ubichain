import {
  ACTIONS,
  CATALOG,
  CLOTHES,
  DANCES,
  FLOORS,
  LIVE_WORLDS,
  ROOM_PRESETS,
  ROOMS,
  SIGN_GLYPH,
  STAMPS,
  TILE_H,
  TILE_W,
  WALL_H,
  WALLPAPERS,
  WORLD_CAP,
  isoLeft,
  isoTop,
  jankenGlyph,
  roomCap,
  type ClothId,
  type FurnKind,
  type MoyouNote,
  type OzAvatar,
  type OzBubble,
  type OzDance,
  type OzDecor,
  type OzFacing,
  type OzGender,
  type OzItem,
  type OzJanken,
  type OzPose,
  type OzRoomId,
  type OzScale,
} from "@/lib/ubi/oz";
import { tx, type Lang } from "@/lib/ubi/i18n";

const SKIN = ["#f3d4b8", "#e8c19a", "#c9926c", "#8d5a3b", "#5a3824"];

export function honnyaku(text: string) {
  const jp = /[\u3040-\u30ff\u4e00-\u9faf]/.test(text);
  if (jp) return { main: text, sub: "EN · auto" };
  return { main: text, sub: "JA · 自動" };
}

export function PiggAvatar({
  avatar,
  facing,
  pose,
  name,
  you,
  bubble,
  bubbleKind,
  template,
  scale,
  dance,
  sign,
  janken,
  onClick,
}: {
  avatar: OzAvatar;
  facing?: OzFacing;
  pose?: OzPose;
  name?: string;
  you?: boolean;
  bubble?: string;
  bubbleKind?: OzBubble;
  template?: boolean;
  scale?: OzScale;
  dance?: OzDance;
  sign?: number;
  janken?: OzJanken;
  onClick?: () => void;
}) {
  const skin = SKIN[avatar.skin] ?? SKIN[2];
  const cloth = avatar.gender === "f" ? "var(--color-oz-f)" : "var(--color-oz-m)";
  const blank = template || avatar.face === 0;
  const back = facing === "nw" || facing === "ne";
  const shoe = avatar.shoes === 1 ? "#f4f4f0" : avatar.shoes === 2 ? "var(--color-warn)" : "#1a1a1a";
  const cap = avatar.hat === 1 ? "var(--color-accent)" : avatar.hat === 2 ? "var(--color-warn)" : cloth;
  const torso = blank ? "var(--color-muted)" : avatar.top === 2 ? cloth : cloth;
  const kind = bubbleKind ?? "plain";
  const shown =
    kind === "janken"
      ? jankenGlyph(janken)
      : kind === "sign"
        ? (SIGN_GLYPH[sign ?? 0] ?? String(sign ?? 0))
        : (bubble ?? "");
  const tr = honnyaku(shown);
  const body = (
    <div className="flex flex-col items-center">
      {shown ? (
        <div className={`oz-bubble oz-bubble-${kind} mb-1 max-w-28 px-1.5 py-0.5 text-center font-mono text-[8px] leading-tight text-ink`}>
          <div>{tr.main}</div>
          {kind === "plain" || kind === "panda" || kind === "cloud" ? <div className="text-[7px] opacity-60">{tr.sub}</div> : null}
        </div>
      ) : pose === "sleep" ? (
        <div className="oz-zzz mb-1 font-mono text-[9px] text-dim">ZzZ</div>
      ) : null}
      {name ? <span className={`mb-0.5 font-mono text-[8px] ${you ? "text-accent" : "text-dim"}`}>{name}</span> : null}
      <div
        className="oz-chibi-wrap"
        data-face={facing ?? "se"}
        data-pose={pose ?? "idle"}
        data-shorts={avatar.shorts ? "1" : "0"}
        data-scale={scale ?? "norm"}
        data-dance={dance ?? "dance"}
      >
        <div className="oz-chibi">
          {avatar.ponytail && avatar.gender === "f" ? <div className="oz-ponytail" /> : null}
          {avatar.cap ? <div className="oz-cap" style={{ background: cap }} /> : null}
          {avatar.headset ? <div className="oz-headset" /> : null}
          <div className="oz-head" style={{ background: skin }}>
            {blank || back || pose === "sleep" ? null : (
              <>
                <i className="oz-eye l" />
                <i className="oz-eye r" />
              </>
            )}
          </div>
          <div className="oz-arm l" style={{ background: cloth }}>
            <i className="oz-hand" style={{ background: skin }} />
          </div>
          <div className="oz-arm r" style={{ background: cloth }}>
            <i className="oz-hand" style={{ background: skin }} />
          </div>
          <div className="oz-torso" data-shirt={blank ? "0" : String(avatar.top)} data-sport={blank ? "0" : "1"} style={{ background: torso }} />
          <div className="oz-leg l" style={{ background: avatar.shorts ? cloth : "#3a4a58" }} />
          <div className="oz-leg r" style={{ background: avatar.shorts ? cloth : "#3a4a58" }} />
          <div className="oz-shoe l" style={{ background: shoe }} />
          <div className="oz-shoe r" style={{ background: shoe }} />
        </div>
      </div>
    </div>
  );
  if (!onClick) return body;
  return (
    <button type="button" onClick={onClick} className="pointer-events-auto bg-transparent p-0">
      {body}
    </button>
  );
}

export function FurnSprite({ kind, label }: { kind: FurnKind | "bridge" | "gate"; label?: string }) {
  const cls =
    kind === "bed"
      ? "oz-furn-bed"
      : kind === "chair"
        ? "oz-furn-chair"
        : kind === "desk"
          ? "oz-furn-desk"
          : kind === "table"
            ? "oz-furn-table"
            : kind === "cube"
              ? "oz-furn-cube"
              : kind === "basket"
                ? "oz-furn-basket"
                : kind === "plant"
                  ? "oz-furn-plant"
                  : kind === "lamp"
                    ? "oz-furn-lamp"
                    : kind === "shelf"
                      ? "oz-furn-shelf"
                      : kind === "radio"
                        ? "oz-furn-radio"
                        : kind === "window"
                          ? "oz-furn-window"
                          : kind === "door"
                            ? "oz-furn-door"
                            : kind === "gate"
                              ? "oz-furn-gate"
                              : "oz-furn-bridge";
  return <span className={cls} title={label} />;
}

export function IsoWalls({
  cols,
  rows,
  paper,
  doorAt,
  showLabels,
}: {
  cols: number;
  rows: number;
  paper: string;
  doorAt: number;
  showLabels?: boolean;
}) {
  const bl = { x: isoLeft(0, 0, cols) + TILE_W / 2, y: isoTop(0, 0) + WALL_H };
  const br = { x: isoLeft(cols - 1, 0, cols) + TILE_W / 2, y: isoTop(cols - 1, 0) + WALL_H };
  const fl = { x: isoLeft(0, rows - 1, cols) + TILE_W / 2, y: isoTop(0, rows - 1) + WALL_H };
  const door = {
    x: isoLeft(Math.min(doorAt, cols - 1), 0, cols) + TILE_W / 2 - 8,
    y: isoTop(Math.min(doorAt, cols - 1), 0) + 18,
  };
  const win = { x: bl.x - 18, y: bl.y - WALL_H + 22 };
  return (
    <>
      <div
        className="oz-wall-l"
        style={{
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          background: paper,
          clipPath: `polygon(${bl.x}px ${bl.y - WALL_H}px, ${fl.x}px ${fl.y - WALL_H}px, ${fl.x}px ${fl.y}px, ${bl.x}px ${bl.y}px)`,
          opacity: 0.92,
        }}
      />
      <div
        className="oz-wall-r"
        style={{
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          background: paper,
          clipPath: `polygon(${bl.x}px ${bl.y - WALL_H}px, ${br.x}px ${br.y - WALL_H}px, ${br.x}px ${br.y}px, ${bl.x}px ${bl.y}px)`,
          opacity: 0.78,
        }}
      />
      <div className="pointer-events-none absolute border-2 border-accent/70 bg-accent/15" style={{ left: win.x, top: win.y, width: 22, height: 16 }} />
      <div className="pointer-events-none absolute bg-warn" style={{ left: door.x, top: door.y, width: 16, height: 32, boxShadow: "inset -3px 0 0 #0002" }} />
      {showLabels ? (
        <>
          <span className="pointer-events-none absolute font-mono text-[9px] text-ink/70" style={{ left: (bl.x + fl.x) / 2 - 10, top: (bl.y + fl.y) / 2 - 40 }}>
            カベ
          </span>
          <span className="pointer-events-none absolute font-mono text-[9px] text-ink/70" style={{ left: (bl.x + br.x) / 2 - 10, top: (bl.y + br.y) / 2 - 48 }}>
            カベ
          </span>
        </>
      ) : null}
    </>
  );
}

export function StretchHandle({
  cols,
  rows,
  lang,
  onStretch,
}: {
  cols: number;
  rows: number;
  lang: Lang;
  onStretch: (dc: number, dr: number) => void;
}) {
  const tip = { x: isoLeft(0, rows - 1, cols) + TILE_W / 2, y: isoTop(0, rows - 1) + WALL_H + TILE_H };
  return (
    <div className="oz-stretch" style={{ left: Math.max(8, tip.x - 70), top: tip.y + 4 }}>
      <button type="button" onClick={() => onStretch(-1, -1)} className="h-9 min-w-9 border border-border bg-surface px-2 font-mono text-[10px] text-fg">
        −
      </button>
      <span className="grid h-9 place-items-center px-2 font-mono text-[9px] text-muted">
        {cols}×{rows} · {roomCap(cols, rows)}/{WORLD_CAP}
      </span>
      <button type="button" onClick={() => onStretch(1, 1)} className="h-9 min-w-9 border border-border bg-surface px-2 font-mono text-[10px] text-fg">
        +
      </button>
      <span className="hidden h-9 items-center font-mono text-[9px] text-dim sm:grid">
        {tx(lang, { ja: "伸ばし", en: "Stretch", fr: "Étendre" })}
      </span>
    </div>
  );
}

export function ClothGlyph({ id }: { id: ClothId }) {
  if (id === "headset") return <span className="block h-6 w-10 rounded-t-full border-2 border-fg" />;
  if (id === "cap") return <span className="block h-4 w-10 rounded-t-full bg-accent" />;
  if (id === "shirt") {
    return (
      <span className="relative block h-8 w-8 bg-oz-m">
        <i className="absolute top-2 left-2 size-1 rounded-full bg-paper" />
        <i className="absolute top-4 left-2 size-1 rounded-full bg-paper" />
        <i className="absolute top-6 left-2 size-1 rounded-full bg-paper" />
      </span>
    );
  }
  if (id === "tee") return <span className="block h-7 w-8 bg-oz-f" />;
  if (id === "shorts") return <span className="block h-5 w-8 bg-oz-m" />;
  return <span className="block h-4 w-8 rounded-r-sm bg-paper" />;
}

export function MoyouShop({
  lang,
  admin,
  picked,
  paper,
  floor,
  doorAt,
  cols,
  avatar,
  onPick,
  onPaper,
  onFloor,
  onDoor,
  onClose,
  onGenerate,
  onUpload,
  onWear,
  notes,
  onSaveNote,
  onLoadNote,
  onPreset,
}: {
  lang: Lang;
  admin: boolean;
  picked: FurnKind;
  paper: string;
  floor: string;
  doorAt: number;
  cols: number;
  avatar: OzAvatar;
  onPick: (k: FurnKind) => void;
  onPaper: (id: string) => void;
  onFloor: (id: string) => void;
  onDoor: (n: number) => void;
  onClose: () => void;
  onGenerate: () => void;
  onUpload: (file: File) => void;
  onWear: (id: ClothId, yen: number, mint: boolean) => void;
  notes?: MoyouNote[];
  onSaveNote?: () => void;
  onLoadNote?: (i: number) => void;
  onPreset?: (cols: number, rows: number) => void;
}) {
  return (
    <div className="oz-shop">
      <div className="flex h-11 items-center border-b border-ink/15 px-3">
        <span className="font-mono text-[10px] tracking-[0.16em] text-ink">{tx(lang, { ja: "もようがえ", en: "Shop", fr: "Boutique" })}</span>
        <span className="ml-2 font-mono text-[10px] text-ink/50">{tx(lang, { ja: "ブラウザ風", en: "browser", fr: "navigateur" })}</span>
        <button type="button" onClick={onClose} className="ml-auto grid size-9 place-items-center font-mono text-[18px] text-ink" aria-label="close">
          ×
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3 text-ink">
        <div className="mb-2 font-mono text-[10px] text-ink/60">{tx(lang, { ja: "家具 · クリックでリスト", en: "Furniture · tap for list", fr: "Meubles" })}</div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {CATALOG.filter((c) => c.shop === "furn").map((row) => (
            <button
              key={row.kind}
              type="button"
              onClick={() => onPick(row.kind)}
              className={`flex h-16 flex-col items-center justify-center gap-1 border font-mono text-[9px] ${picked === row.kind ? "border-accent text-accent" : "border-ink/20 text-ink/70"}`}
            >
              <FurnSprite kind={row.kind} />
              {tx(lang, { ja: row.ja, en: row.en, fr: row.fr })}
            </button>
          ))}
        </div>
        {onPreset ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {ROOM_PRESETS.map((p) => (
              <button key={p.cols} type="button" onClick={() => onPreset(p.cols, p.rows)} className="h-11 border border-ink/20 px-3 font-mono text-[10px] text-ink">
                {lang === "en" ? p.en : p.ja}
              </button>
            ))}
          </div>
        ) : null}
        {onSaveNote ? (
          <div className="mt-3">
            <div className="mb-1 font-mono text-[10px] text-ink/60">{tx(lang, { ja: "もようがえ帳（3冊）", en: "Decor notebook (3)", fr: "Carnet déco (3)" })}</div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onSaveNote} className="h-11 bg-ink px-3 font-mono text-[10px] text-paper">
                {tx(lang, { ja: "今の部屋を保存", en: "Save this room", fr: "Sauver la pièce" })}
              </button>
              {(notes ?? []).map((n, i) => (
                <button key={`${n.name}-${i}`} type="button" onClick={() => onLoadNote?.(i)} className="h-11 border border-ink/20 px-3 font-mono text-[10px] text-ink">
                  {n.name || `#${i + 1}`}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <div className="mt-4 mb-2 font-mono text-[10px] text-ink/60">{tx(lang, { ja: "服（高い着は口座へテスト入金）", en: "Clothes · expensive items credit your account", fr: "Vêtements" })}</div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {CLOTHES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onWear(c.id, c.yen, c.mint)}
              className="flex h-20 flex-col items-center justify-center gap-1 border border-ink/20 font-mono text-[9px] text-ink"
            >
              <ClothGlyph id={c.id} />
              {tx(lang, { ja: c.ja, en: c.en, fr: c.fr })}
              <span className={c.mint ? "text-ok" : "text-ink/50"}>¥{c.yen}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 flex justify-center">
          <PiggAvatar avatar={avatar} facing="se" pose="idle" template={avatar.face === 0} />
        </div>
        <div className="mt-4 mb-2 font-mono text-[10px] text-ink/60">{tx(lang, { ja: "壁・床（ロール）· ドア位置", en: "Wall / floor rolls · door", fr: "Murs / sols · porte" })}</div>
        <div className="flex flex-wrap gap-2">
          {WALLPAPERS.map((w) => (
            <button key={w.id} type="button" onClick={() => onPaper(w.id)} className={`h-11 px-3 font-mono text-[10px] ${paper === w.id ? "bg-accent text-bg" : "border border-ink/20 text-ink"}`}>
              {lang === "en" ? w.en : w.ja}
            </button>
          ))}
          {FLOORS.map((f) => (
            <button key={f.id} type="button" onClick={() => onFloor(f.id)} className={`h-11 px-3 font-mono text-[10px] ${floor === f.id ? "bg-accent text-bg" : "border border-ink/20 text-ink"}`}>
              {lang === "en" ? f.en : f.ja}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="font-mono text-[10px] text-ink/60">{tx(lang, { ja: "ドア", en: "Door", fr: "Porte" })}</span>
          <input type="range" min={0} max={Math.max(0, cols - 1)} value={Math.min(doorAt, cols - 1)} onChange={(e) => onDoor(Number(e.target.value))} className="h-11 flex-1" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <label className="grid h-11 cursor-pointer place-items-center border border-ink/20 px-3 font-mono text-[10px] text-ink">
            {tx(lang, { ja: "アップロード → 四面体化", en: "Upload → tetrahedralize", fr: "Importer → tétraèdre" })}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(f);
              }}
            />
          </label>
          {admin ? (
            <button type="button" onClick={onGenerate} className="h-11 bg-accent px-3 font-mono text-[10px] font-semibold text-bg">
              {tx(lang, { ja: "AI生成（口座へテスト振替）", en: "AI generate (test credit)", fr: "IA (crédit test)" })}
            </button>
          ) : (
            <p className="font-mono text-[10px] text-ink/50">{tx(lang, { ja: "メインワールドの生成は管理者のみ。自分の部屋では服を変えられます。", en: "Main-world generate is admin only. Clothes work in your room.", fr: "Génération du monde : admin. Vêtements OK chez vous." })}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function GenderPick({ gender, onPick, lang }: { gender: OzGender; onPick: (g: OzGender) => void; lang: Lang }) {
  return (
    <div className="flex gap-2">
      <button type="button" onClick={() => onPick("m")} className={`h-11 flex-1 font-mono text-[11px] ${gender === "m" ? "bg-oz-m text-bg" : "border border-border text-fg"}`}>
        {tx(lang, { ja: "男性・青", en: "Male · blue", fr: "Homme · bleu" })}
      </button>
      <button type="button" onClick={() => onPick("f")} className={`h-11 flex-1 font-mono text-[11px] ${gender === "f" ? "bg-oz-f text-bg" : "border border-border text-fg"}`}>
        {tx(lang, { ja: "女性・ピンク", en: "Female · pink", fr: "Femme · rose" })}
      </button>
    </div>
  );
}

export function JapanWorldList({
  lang,
  here,
  occupancy,
  onGo,
}: {
  lang: Lang;
  here: OzRoomId;
  occupancy: Partial<Record<OzRoomId, number>>;
  onGo: (id: OzRoomId) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative mx-3 mt-2 h-44 shrink-0 overflow-hidden rounded-sm border border-border bg-panel">
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
          <path d="M72 8c6 2 10 8 8 14-2 4-8 6-6 12 4 2 8-2 12 2 2 6-6 8-4 14 3 4 10 2 8 9-3 6-14 4-12 12 2 5 10 6 6 12-8 4-16-2-22 2-4 4 0 10-8 10-6 0-8-8-14-8-7 1-6 10-14 8-6-2-8-10-4-14 3-3 10-1 10-8 0-6-8-6-6-12 2-5 10-4 12-10 1-5-6-7-4-12 3-6 12-2 16-8 3-4-2-10 6-12 4-1 10 2 12 1z" fill="color-mix(in oklab, var(--color-accent) 18%, var(--color-raised))" stroke="var(--color-accent)" strokeWidth="0.6" />
          <circle cx="28" cy="90" r="3" fill="color-mix(in oklab, var(--color-bank) 50%, var(--color-raised))" />
        </svg>
        {LIVE_WORLDS.filter((id) => ROOMS[id].pin).map((id) => {
          const pin = ROOMS[id].pin!;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onGo(id)}
              className={`absolute h-6 min-w-6 -translate-x-1/2 -translate-y-1/2 px-1 font-mono text-[8px] ${here === id ? "bg-accent text-bg" : "bg-surface/90 text-fg"}`}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            >
              {lang === "en" ? ROOMS[id].en : ROOMS[id].ja}
            </button>
          );
        })}
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto p-2">
        {LIVE_WORLDS.map((id) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => onGo(id)}
              className={`flex h-10 w-full items-center justify-between px-2 font-mono text-[11px] ${here === id ? "bg-accent/15 text-accent" : "text-fg"}`}
            >
              <span>{tx(lang, { ja: ROOMS[id].ja, en: ROOMS[id].en, fr: ROOMS[id].fr })}</span>
              <span className="text-[10px] text-muted">
                {occupancy[id] ?? 0}/{WORLD_CAP}
              </span>
            </button>
          </li>
        ))}
        <li className="flex h-10 items-center justify-between px-2 font-mono text-[11px] text-alert">
          <span>{tx(lang, { ja: ROOMS.outer.ja, en: ROOMS.outer.en, fr: ROOMS.outer.fr })}</span>
          <span>{tx(lang, { ja: "閉鎖", en: "sealed", fr: "scellé" })}</span>
        </li>
      </ul>
    </div>
  );
}

export function StampTray({ lang, onStamp }: { lang: Lang; onStamp: (text: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-1 p-2">
      {STAMPS.map((s) => (
        <button key={s.id} type="button" onClick={() => onStamp(tx(lang, { ja: s.ja, en: s.en, fr: s.fr }))} className="h-11 border border-border bg-panel font-mono text-[11px] text-fg">
          {tx(lang, { ja: s.ja, en: s.en, fr: s.fr })}
        </button>
      ))}
    </div>
  );
}

export function FriendsLocked({ lang }: { lang: Lang }) {
  return (
    <div className="grid h-full place-items-center p-6 text-center font-mono text-[11px] text-muted">
      {tx(lang, { ja: "フレンドリストは未公開です。", en: "Friend list is unreleased.", fr: "Liste d'amis encore fermée." })}
    </div>
  );
}

export function ActionMenu({
  lang,
  scale,
  dance,
  onAct,
  onDance,
  onClose,
}: {
  lang: Lang;
  scale: OzScale;
  dance: OzDance;
  onAct: (id: (typeof ACTIONS)[number]["id"]) => void;
  onDance: (id: OzDance) => void;
  onClose: () => void;
}) {
  return (
    <div className="oz-act">
      <div className="mb-1 flex items-center justify-between px-1">
        <span className="font-mono text-[9px] tracking-[0.16em] text-muted">{tx(lang, { ja: "動作", en: "Actions", fr: "Actions" })}</span>
        <button type="button" onClick={onClose} className="grid size-9 place-items-center font-mono text-[12px] text-dim">
          ×
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {ACTIONS.map((a) => (
          <button key={a.id} type="button" onClick={() => onAct(a.id)} className="h-11 border border-border bg-surface px-2 font-mono text-[10px] text-fg">
            {tx(lang, { ja: a.ja, en: a.en, fr: a.fr })}
            {a.id === "mini" && scale === "mini" ? " · on" : ""}
          </button>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1">
        {DANCES.map((d) => (
          <button key={d.id} type="button" onClick={() => onDance(d.id)} className={`h-9 font-mono text-[9px] ${dance === d.id ? "bg-accent text-bg" : "border border-border text-dim"}`}>
            {lang === "en" ? d.en : d.ja}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ActTray({
  lang,
  onAct,
}: {
  lang: Lang;
  onAct: (id: (typeof ACTIONS)[number]["id"]) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1 p-2">
      {ACTIONS.map((a) => (
        <button key={a.id} type="button" onClick={() => onAct(a.id)} className="h-11 border border-border bg-panel font-mono text-[11px] text-fg">
          {tx(lang, { ja: a.ja, en: a.en, fr: a.fr })}
        </button>
      ))}
      <p className="col-span-2 mt-1 font-mono text-[10px] leading-relaxed text-muted">
        {tx(lang, {
          ja: ":sit :idle :wave :dance pogo :moon :mini :panda :cloud :janken :sign 11 。壁抜け・ユニコード崩しは無効。",
          en: ":sit :idle :wave :dance pogo :moon :mini :panda :cloud :janken :sign 11. Clips and crash glyphs stay off.",
          fr: ":sit :idle :wave :moon :mini. Clips et glyphes cassés désactivés.",
        })}
      </p>
    </div>
  );
}

export function KitayoBoard({
  lang,
  visits,
  likes,
  ame,
  lineage,
}: {
  lang: Lang;
  visits: number;
  likes: number;
  ame: number;
  lineage: "pigg" | "pico" | "habbo" | "mars";
}) {
  const title =
    lineage === "mars"
      ? tx(lang, { ja: "火星 · 賛ボード", en: "Mars · like board", fr: "Mars · tableau" })
      : lineage === "pico"
        ? tx(lang, { ja: "Pico · Gummies", en: "Pico · Gummies", fr: "Pico · Gummies" })
        : lineage === "habbo"
          ? tx(lang, { ja: "Habbo · credits", en: "Habbo · credits", fr: "Habbo · crédits" })
          : tx(lang, { ja: "ピグ · アメ", en: "Pigg · Ame", fr: "Pigg · Ame" });
  return (
    <div className="pointer-events-none absolute top-2 left-2 z-10 rounded-sm border border-border bg-surface/90 px-2 py-1 font-mono text-[10px] text-fg">
      <div className="text-muted">{title}</div>
      <div>
        {tx(lang, { ja: "きたよ", en: "visits", fr: "visites" })} {visits} · {lineage === "mars" ? tx(lang, { ja: "賛", en: "likes", fr: "likes" }) : tx(lang, { ja: "グッピグ", en: "Guppigg", fr: "Guppigg" })} {likes} · {ame}
        {lineage === "pico" ? " G" : lineage === "mars" ? tx(lang, { ja: " 豆", en: " beans", fr: " fèves" }) : tx(lang, { ja: " アメ", en: " Ame", fr: " Ame" })}
      </div>
    </div>
  );
}

export function npcAvatar(n: { hue: number; hat: number; body: number; gender: OzGender }): OzAvatar {
  return {
    hue: n.hue,
    hat: n.hat,
    body: n.body,
    gender: n.gender,
    skin: 2,
    cap: true,
    headset: false,
    shoes: 1,
    top: n.gender === "f" ? 1 : 2,
    face: 1,
    shorts: true,
    ponytail: n.gender === "f",
  };
}

export type OzPanel = "chat" | "worlds" | "stamps" | "friends" | "ops" | "act";
