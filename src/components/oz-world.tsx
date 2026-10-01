import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CHANNELS,
  OZ_BOT,
  ROOMS,
  TILE_H,
  TILE_W,
  WALL_H,
  WALLPAPERS,
  WORLD_CAP,
  WORLD_N,
  blocked,
  clampPos,
  creditDress,
  creditGuppigg,
  creditKitayo,
  creditLogin,
  facingFromDelta,
  isoLeft,
  isoTop,
  jankenGlyph,
  lineageOf,
  omakase,
  parseOzChat,
  readAme,
  readDecor,
  readGuest,
  readLayout,
  readNotes,
  roomCap,
  roomSize,
  stretchRoom,
  templateAvatar,
  wearCloth,
  writeAme,
  writeDecor,
  writeGuest,
  writeLayout,
  writeNotes,
  type AmeWallet,
  type ClothId,
  type FurnKind,
  type OzDance,
  type OzDecor,
  type OzGender,
  type OzGuest,
  type OzItem,
  type OzPose,
  type OzRoomId,
} from "@/lib/ubi/oz";
import { applyNightlyRepair, OZ_DISTRICTS, OZ_NPCS, OZ_VERSION, OZ_WINDOW_JST, readOps, worldHealth, type OzNpc, type OzOps } from "@/lib/ubi/oz-ops";
import { firstLifeName, guardSnap, makePacket, pathStep, receiveOz, type GuardSnap } from "@/lib/ubi/oz-guard";
import { OZ_ORIGIN } from "@/lib/ubi/host";
import { hanaDeck, hanaLabel, hanaScore, type HanaCard } from "@/lib/ubi/cards";
import { tx, type Lang } from "@/lib/ubi/i18n";
import {
  ActTray,
  ActionMenu,
  FriendsLocked,
  FurnSprite,
  GenderPick,
  IsoWalls,
  JapanWorldList,
  KitayoBoard,
  MoyouShop,
  PiggAvatar,
  StampTray,
  StretchHandle,
  npcAvatar,
  type OzPanel,
} from "@/components/oz-pigg";

type Chat = { id: string; who: string; channel: string; text: string };

export function OzWorld({
  lang,
  memberName,
  admin = false,
  onMint,
}: {
  lang: Lang;
  memberName?: string;
  admin?: boolean;
  onMint?: (yen: number) => void;
}) {
  const navigate = useNavigate();
  const [guest, setGuest] = useState<OzGuest | null>(null);
  const [draft, setDraft] = useState(memberName ?? "");
  const [gender, setGender] = useState<OzGender>("m");
  const poseTimer = useRef(0);
  const [chat, setChat] = useState<Chat[]>([]);
  const [msg, setMsg] = useState("");
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]["id"]>("JP");
  const [game, setGame] = useState<"none" | "hana">("none");
  const [decorate, setDecorate] = useState(false);
  const [picked, setPicked] = useState<FurnKind>("plant");
  const [layout, setLayout] = useState(readLayout);
  const [decor, setDecor] = useState<Record<OzRoomId, OzDecor>>(readDecor);
  const [ops, setOps] = useState<OzOps>(readOps);
  const [npcs, setNpcs] = useState<OzNpc[]>(OZ_NPCS);
  const [panel, setPanel] = useState<OzPanel>("chat");
  const [namePop, setNamePop] = useState(false);
  const [guard, setGuard] = useState<GuardSnap>(guardSnap);
  const [ame, setAme] = useState<AmeWallet>(readAme);
  const [notes, setNotes] = useState(readNotes);
  const [menu, setMenu] = useState(false);
  const [targetNpc, setTargetNpc] = useState<string | null>(null);
  const guestRef = useRef<OzGuest | null>(null);
  const layoutRef = useRef(layout);
  guestRef.current = guest;
  layoutRef.current = layout;

  useEffect(() => {
    const d = readDecor();
    setDecor(d);
    setLayout(readLayout());
    setOps(applyNightlyRepair(readOps()));
    const g = readGuest();
    if (g) setGuest(g);
    else if (memberName) {
      const res = receiveOz(makePacket("enter", { name: memberName }), {
        room: "plaza",
        pos: { x: 4, y: 4 },
        extra: [],
        name: memberName,
      });
      setGuard(guardSnap());
      if (!res.ok) return;
      const created: OzGuest = { name: memberName, avatar: omakase(gender), room: "plaza", pos: { x: 4, y: 4 }, facing: "se", pose: "idle", scale: "norm", bubbleKind: "plain", dance: "dance" };
      writeGuest(created);
      setGuest(created);
    }
    setNotes(readNotes());
    const nextAme = creditLogin(readAme());
    writeAme(nextAme);
    setAme(nextAme);
  }, [memberName]);

  useEffect(() => {
    let raf = 0;
    let acc = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.1, (t - last) / 1000);
      last = t;
      acc += dt;
      if (acc >= 1.8) {
        acc = 0;
        setNpcs((list) =>
          list.map((n) => {
            const dx = Math.floor(Math.random() * 3) - 1;
            const dy = Math.floor(Math.random() * 3) - 1;
            if (!dx && !dy) return n;
            const pos = clampPos(n.pos.x + dx, n.pos.y + dy, n.room);
            if (blocked(n.room, pos.x, pos.y)) return n;
            return { ...n, pos };
          }),
        );
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const enter = () => {
    const name = draft.trim().slice(0, 24);
    if (!name) return;
    const res = receiveOz(makePacket("enter", { name }), {
      room: "plaza",
      pos: { x: 4, y: 4 },
      extra: [],
      name,
    });
    setGuard(guardSnap());
    if (!res.ok) return;
    const created: OzGuest = { name: res.apply.op === "enter" ? res.apply.name : name, avatar: omakase(gender), room: "plaza", pos: { x: 4, y: 4 }, facing: "se", pose: "idle", scale: "norm", bubbleKind: "plain", dance: "dance" };
    writeGuest(created);
    setGuest(created);
    const nextAme = creditLogin(readAme());
    writeAme(nextAme);
    setAme(nextAme);
  };

  if (!guest) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="font-mono text-[10px] tracking-[0.2em] text-muted">
          OZ · {OZ_ORIGIN} · {WORLD_N}{tx(lang, { ja: "ワールド", en: " worlds", fr: " mondes" })} · {WORLD_CAP}
          {tx(lang, { ja: "人収容", en: " cap", fr: " cap" })}
        </div>
        <PiggAvatar avatar={templateAvatar(gender)} template name={tx(lang, { ja: "AI生成テンプレ", en: "AI template", fr: "Modèle IA" })} />
        <h1 className="text-xl font-semibold">
          {tx(lang, { ja: "ログインしていなければ、名前を出します", en: "If you are not signed in, this form appears", fr: "Sans session, ce formulaire apparaît" })}
        </h1>
        <p className="max-w-sm text-[12px] text-dim">
          {tx(lang, {
            ja: "2011年のピグ公式・裏技の正規動作、Habboのコロン、Picoの言語ラウンジ、火星の賛。パスワードは使いません。壁抜けは無効です。",
            en: "2011 Pigg official moves, Habbo colons, Pico lounges, Mars likes. No password. No wall-clips.",
            fr: "Gestes Pigg 2011, commandes Habbo, Pico, Mars. Pas de mot de passe ni de clip.",
          })}
        </p>
        {guard.lastDrop?.reason === "clone" ? (
          <p className="max-w-sm text-[12px] text-alert">
            {tx(lang, {
              ja: `二つ目はペルソナ・ノン・グラータです。一つ目「${firstLifeName() ?? ""}」は生活安全のためBANしません。`,
              en: `A second identity is persona non grata. The first account is not banned.`,
              fr: `La seconde identité est persona non grata. Le premier compte n'est pas banni.`,
            })}
          </p>
        ) : null}
        <label className="w-full max-w-xs text-left">
          <span className="font-mono text-[10px] tracking-widest text-muted">ID</span>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={tx(lang, { ja: "表示名", en: "Display name", fr: "Nom affiché" })}
            className="mt-1 h-11 w-full rounded-sm border border-border bg-panel px-3 text-sm text-fg"
          />
        </label>
        <div className="w-full max-w-xs">
          <GenderPick gender={gender} onPick={setGender} lang={lang} />
        </div>
        <button type="button" onClick={enter} className="h-11 w-full max-w-xs rounded-sm bg-accent font-semibold text-bg">
          {tx(lang, { ja: "OZに入る", en: "Enter OZ", fr: "Entrer dans OZ" })}
        </button>
      </div>
    );
  }

  const room = ROOMS[guest.room];
  const save = (next: OzGuest) => {
    writeGuest(next);
    setGuest(next);
  };

  const applyAct = (id: string, g = guest) => {
    if (!g) return;
    if (id === "mini") {
      save({ ...g, scale: g.scale === "mini" ? "norm" : "mini" });
      return;
    }
    if (id === "panda" || id === "cloud" || id === "plain") {
      save({ ...g, bubbleKind: id === "plain" ? "plain" : id, bubble: g.bubble || (id === "panda" ? "…" : "・・・") });
      return;
    }
    const pose = id as OzPose;
    const hand = (["goo", "choki", "paa"] as const)[Math.floor(Math.random() * 3)];
    save({
      ...g,
      pose,
      janken: pose === "janken" ? hand : g.janken,
      bubbleKind: pose === "janken" ? "janken" : g.bubbleKind,
      bubble: pose === "janken" ? jankenGlyph(hand) : pose === "sleep" ? "ZzZ" : g.bubble,
    });
  };

  const applyDance = (id: OzDance, g = guest) => {
    if (!g) return;
    save({ ...g, pose: "dance", dance: id });
  };

  const extra = layout[guest.room] ?? [];
  const ctxOf = (g: OzGuest) => ({
    room: g.room,
    pos: g.pos,
    extra: layoutRef.current[g.room] ?? [],
    name: g.name,
  });

  const saveLayout = (next: typeof layout) => {
    writeLayout(next);
    setLayout(next);
  };

  const saveDecor = (next: Record<OzRoomId, OzDecor>) => {
    writeDecor(next);
    setDecor(next);
  };

  const hereDecor = decor[guest.room];
  const paper = hereDecor.paper;
  const floor = hereDecor.floor;
  const doorAt = hereDecor.doorAt;

  const move = (dx: number, dy: number) => {
    const g = guestRef.current;
    if (!g) return;
    const pos = clampPos(g.pos.x + dx, g.pos.y + dy, g.room);
    const res = receiveOz(makePacket("move", pos), ctxOf(g));
    setGuard(guardSnap());
    if (!res.ok || res.apply.op !== "move") return;
    const facing = facingFromDelta(dx, dy);
    save({ ...g, pos: { x: res.apply.x, y: res.apply.y }, facing, pose: "walk" });
    window.clearTimeout(poseTimer.current);
    poseTimer.current = window.setTimeout(() => {
      const cur = guestRef.current;
      if (cur) save({ ...cur, pose: cur.pose === "walk" ? "idle" : cur.pose });
    }, 280);
  };

  const go = (id: OzRoomId) => {
    const g = guestRef.current ?? guest;
    const res = receiveOz(makePacket("warp", { to: id }), ctxOf(g));
    setGuard(guardSnap());
    if (!res.ok) {
      if (res.reason === "locked") {
        setChat((c) =>
          [
            {
              id: Math.random().toString(36).slice(2),
              who: "OZ",
              channel,
              text: tx(lang, {
                ja: "外区は閉鎖です。別の星と連絡が取れた場合に備え、経済学はここに置いてあります。今は入れません。",
                en: "The outer district is sealed. The economics is stored here in case contact is ever made. You cannot enter now.",
                fr: "Le district extérieur est scellé. L'économie y attend un contact. Pas d'entrée maintenant.",
              }),
            },
            ...c,
          ].slice(0, 40),
        );
      }
      return;
    }
    if (res.apply.op !== "warp") return;
    setGame("none");
    const { cols, rows } = roomSize(res.apply.to);
    save({ ...g, room: res.apply.to, pos: { x: Math.floor(cols / 2), y: Math.floor(rows / 2) }, pose: "idle" });
    const kit = creditKitayo(readAme(), res.apply.to);
    writeAme(kit.next);
    setAme(kit.next);
    if (kit.gained) {
      setChat((c) =>
        [
          {
            id: Math.random().toString(36).slice(2),
            who: "OZ",
            channel,
            text: tx(lang, { ja: `きたよ +1アメ（${kit.next.ame}）`, en: `Kitayo +1 Ame (${kit.next.ame})`, fr: `Kitayo +1 Ame (${kit.next.ame})` }),
          },
          ...c,
        ].slice(0, 40),
      );
    }
  };

  const send = () => {
    const text = msg.trim();
    if (!text) return;
    const g = guestRef.current ?? guest;
    const cmd = parseOzChat(text);
    if (cmd.help) {
      setMsg("");
      setPanel("act");
      return;
    }
    if (cmd.pose || cmd.scale || cmd.bubbleKind || cmd.dance || cmd.sign != null) {
      save({
        ...g,
        pose: cmd.pose ?? g.pose,
        scale: cmd.scale ?? g.scale,
        bubbleKind: cmd.bubbleKind ?? g.bubbleKind,
        dance: cmd.dance ?? g.dance,
        sign: cmd.sign ?? g.sign,
        janken: cmd.janken ?? g.janken,
        bubble: cmd.text || (cmd.pose === "janken" ? jankenGlyph(cmd.janken) : cmd.pose === "sleep" ? "ZzZ" : g.bubble),
      });
      if (!cmd.text && !cmd.kitayo && !cmd.guppigg) {
        setMsg("");
        return;
      }
    }
    if (cmd.guppigg) {
      const npc = npcs.find((n) => n.room === g.room) ?? (targetNpc ? npcs.find((n) => n.id === targetNpc) : undefined);
      if (npc) {
        const like = creditGuppigg(readAme(), npc.id);
        writeAme(like.next);
        setAme(like.next);
      }
    }
    const payload = cmd.text || text;
    const res = receiveOz(makePacket("chat", { text: payload, channel }), ctxOf(g));
    setGuard(guardSnap());
    if (!res.ok || res.apply.op !== "chat") return;
    setMsg("");
    const mine: Chat = { id: Math.random().toString(36).slice(2), who: g.name, channel: res.apply.channel, text: res.apply.text };
    const bot = OZ_BOT[Math.floor(Math.random() * OZ_BOT.length)]!;
    const reply: Chat = {
      id: Math.random().toString(36).slice(2) + "b",
      who: "OZ",
      channel: res.apply.channel,
      text: tx(lang, { ja: bot.ja, en: bot.en, fr: bot.fr }),
    };
    setChat((c) => [reply, mine, ...c].slice(0, 40));
    save({
      ...(guestRef.current ?? g),
      bubble: res.apply.text,
      bubbleKind: cmd.bubbleKind ?? (guestRef.current ?? g).bubbleKind,
    });
    setNamePop(true);
    window.setTimeout(() => setNamePop(false), 1800);
  };

  const wear = (id: ClothId, yen: number, mint: boolean) => {
    save({ ...guest, avatar: wearCloth(guest.avatar, id) });
    if (mint) onMint?.(yen);
    const next = creditDress(readAme());
    writeAme(next);
    setAme(next);
  };

  const health = worldHealth(ops);
  const occ: Partial<Record<OzRoomId, number>> = {};
  for (const n of npcs) occ[n.room] = (occ[n.room] ?? 0) + 1;
  occ[guest.room] = (occ[guest.room] ?? 0) + 1;
  const hereCap = roomCap(hereDecor.cols, hereDecor.rows);
  const canStretch = guest.room !== "outer";

  const openDecorate = () => {
    setDecorate(true);
    setPanel("chat");
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col lg:flex-row">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] text-muted">
              OZ · {OZ_VERSION} · {guest.name} · {occ[guest.room] ?? 1}/{hereCap} · {ame.ame}
              {lineageOf(guest.room) === "pico" ? "G" : lineageOf(guest.room) === "mars" ? tx(lang, { ja: "豆", en: "b", fr: "f" }) : tx(lang, { ja: "アメ", en: "Ame", fr: "Ame" })}
            </div>
            <div className="text-sm font-semibold">
              {tx(lang, { ja: "エリア", en: "Area", fr: "Zone" })} · {tx(lang, { ja: room.ja, en: room.en, fr: room.fr })}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="hidden font-mono text-[10px] text-ok sm:inline">{health}%</span>
            <span className="font-mono text-[10px] text-muted">
              {hereDecor.cols}×{hereDecor.rows}
            </span>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-bg">
          {guest.room === "orbit" ? (
            <OrbitMap lang={lang} health={ops.health} here={guest.room} onGo={go} />
          ) : (
            <RoomGrid
              guest={guest}
              lang={lang}
              extra={extra}
              npcs={npcs.filter((n) => n.room === guest.room)}
              decorate={decorate}
              paper={paper}
              floor={floor}
              doorAt={doorAt}
              onTile={(x, y) => {
                if (decorate) {
                  const hit = extra.find((it) => it.x === x && it.y === y);
                  if (hit?.placed) {
                    const res = receiveOz(makePacket("unplace", { id: hit.id }), ctxOf(guest));
                    setGuard(guardSnap());
                    if (res.ok && res.apply.op === "unplace") {
                      const dropId = res.apply.id;
                      saveLayout({ ...layout, [guest.room]: extra.filter((it) => it.id !== dropId) });
                    }
                    return;
                  }
                  const res = receiveOz(makePacket("place", { x, y, kind: picked }), ctxOf(guest));
                  setGuard(guardSnap());
                  if (!res.ok || res.apply.op !== "place") return;
                  saveLayout({ ...layout, [guest.room]: [...extra, res.apply.item] });
                  return;
                }
                const man = Math.abs(x - guest.pos.x) + Math.abs(y - guest.pos.y);
                const dest = man === 1 ? { x, y } : pathStep(guest.pos, { x, y }, guest.room, extra);
                if (!dest) return;
                const res = receiveOz(makePacket("move", dest), ctxOf(guest));
                setGuard(guardSnap());
                if (!res.ok || res.apply.op !== "move") return;
                const facing = facingFromDelta(res.apply.x - guest.pos.x, res.apply.y - guest.pos.y);
                save({ ...guest, pos: { x: res.apply.x, y: res.apply.y }, facing, pose: "walk" });
              }}
              onItem={go}
              onHref={(href) => {
                if (href === "/library") void navigate({ to: "/library" });
                else if (href === "/live") void navigate({ to: "/live" });
              }}
              onTable={() => setGame("hana")}
              onSit={(x, y) => save({ ...guest, pos: { x, y }, pose: "sit" })}
              onYou={() => setMenu((v) => !v)}
              onNpc={(id) => {
                setTargetNpc(id);
                const like = creditGuppigg(readAme(), id);
                writeAme(like.next);
                setAme(like.next);
                const n = npcs.find((row) => row.id === id);
                setChat((c) =>
                  [
                    {
                      id: Math.random().toString(36).slice(2),
                      who: guest.name,
                      channel,
                      text: tx(lang, {
                        ja: `${n?.name ?? id} に${guest.room === "mars" ? "賛" : "グッピグ"} +${like.gained}アメ`,
                        en: `${guest.room === "mars" ? "Like" : "Guppigg"} ${n?.name ?? id} +${like.gained} Ame`,
                        fr: `${n?.name ?? id} +${like.gained} Ame`,
                      }),
                    },
                    ...c,
                  ].slice(0, 40),
                );
              }}
              onPick={(id) => {
                if (!decorate) return;
                const res = receiveOz(makePacket("unplace", { id }), ctxOf(guest));
                setGuard(guardSnap());
                if (res.ok && res.apply.op === "unplace") {
                  const dropId = res.apply.id;
                  saveLayout({ ...layout, [guest.room]: extra.filter((it) => it.id !== dropId) });
                }
              }}
              onStretch={
                canStretch
                  ? (dc, dr) => {
                      const next = { ...decor, [guest.room]: stretchRoom(hereDecor, dc, dr) };
                      saveDecor(next);
                      save({ ...guest, pos: clampPos(guest.pos.x, guest.pos.y, guest.room) });
                    }
                  : undefined
              }
            />
          )}
          {decorate ? (
            <MoyouShop
              lang={lang}
              admin={admin || guest.room === "home"}
              picked={picked}
              paper={paper}
              floor={floor}
              doorAt={doorAt}
              cols={hereDecor.cols}
              avatar={guest.avatar}
              onPick={setPicked}
              onPaper={(id) => saveDecor({ ...decor, [guest.room]: { ...hereDecor, paper: id } })}
              onFloor={(id) => saveDecor({ ...decor, [guest.room]: { ...hereDecor, floor: id } })}
              onDoor={(n) => saveDecor({ ...decor, [guest.room]: { ...hereDecor, doorAt: n } })}
              onClose={() => setDecorate(false)}
              onGenerate={() => {
                save({ ...guest, avatar: omakase(guest.avatar.gender) });
                onMint?.(500);
              }}
              onUpload={() => {
                saveLayout({
                  ...layout,
                  [guest.room]: [
                    ...extra,
                    { id: `up-${Date.now().toString(36)}`, x: guest.pos.x, y: Math.min(guest.pos.y + 1, roomSize(guest.room).rows - 1), kind: "cube", placed: true },
                  ].slice(0, 12),
                });
              }}
              onWear={wear}
              notes={notes}
              onSaveNote={() => {
                const slot = { name: `${room.ja} ${hereDecor.cols}x${hereDecor.rows}`, layout: extra, decor: hereDecor };
                const next = [slot, ...notes.filter((_, i) => i < 2)];
                writeNotes(next);
                setNotes(next);
              }}
              onLoadNote={(i) => {
                const n = notes[i];
                if (!n) return;
                saveLayout({ ...layout, [guest.room]: n.layout });
                saveDecor({ ...decor, [guest.room]: n.decor });
                save({ ...guest, pos: clampPos(guest.pos.x, guest.pos.y, guest.room) });
              }}
              onPreset={(cols, rows) => {
                const next = { ...decor, [guest.room]: { ...hereDecor, cols, rows, doorAt: Math.min(hereDecor.doorAt, cols - 1) } };
                saveDecor(next);
                save({ ...guest, pos: clampPos(guest.pos.x, guest.pos.y, guest.room) });
              }}
            />
          ) : (
            <Dpad onMove={move} posRef={guestRef} />
          )}
          <KitayoBoard
            lang={lang}
            visits={ame.visits[guest.room] ?? 0}
            likes={Object.values(ame.likes).reduce((n, v) => n + v, 0)}
            ame={ame.ame}
            lineage={lineageOf(guest.room)}
          />
          {menu && !decorate ? (
            <ActionMenu
              lang={lang}
              scale={guest.scale ?? "norm"}
              dance={guest.dance ?? "dance"}
              onAct={(id) => {
                applyAct(id);
                setMenu(false);
              }}
              onDance={(id) => {
                applyDance(id);
                setMenu(false);
              }}
              onClose={() => setMenu(false)}
            />
          ) : null}
        </div>

        <div className="oz-dock">
          <DockBtn active={panel === "worlds"} onClick={() => setPanel(panel === "worlds" ? "chat" : "worlds")} label={tx(lang, { ja: "ワールド", en: "Worlds", fr: "Mondes" })} />
          <DockBtn active={panel === "chat"} onClick={() => setPanel("chat")} label={tx(lang, { ja: "チャット", en: "Chat", fr: "Chat" })} />
          <DockBtn active={panel === "stamps"} onClick={() => setPanel(panel === "stamps" ? "chat" : "stamps")} label={tx(lang, { ja: "スタンプ", en: "Stamps", fr: "Tampons" })} />
          <DockBtn active={panel === "act"} onClick={() => setPanel(panel === "act" ? "chat" : "act")} label={tx(lang, { ja: "動作", en: "Act", fr: "Acte" })} />
          <DockBtn
            active={decorate}
            onClick={() => {
              if (decorate) setDecorate(false);
              else openDecorate();
            }}
            label={tx(lang, { ja: "もようがえ", en: "Decor", fr: "Déco" })}
          />
          <DockBtn active={false} onClick={() => go("home")} label={tx(lang, { ja: "自分の部屋", en: "My room", fr: "Chambre" })} />
          <DockBtn active={panel === "friends"} onClick={() => setPanel(panel === "friends" ? "chat" : "friends")} label={tx(lang, { ja: "フレンド", en: "Friends", fr: "Amis" })} />
          {!decorate ? (
            <DockBtn active={panel === "ops"} onClick={() => setPanel(panel === "ops" ? "chat" : "ops")} label={tx(lang, { ja: "運用", en: "Ops", fr: "Ops" })} />
          ) : null}
          <button type="button" onClick={() => applyAct(guest.pose === "dance" ? "idle" : "dance")} className="h-11 shrink-0 px-3 font-mono text-[10px] text-fg">
            {tx(lang, { ja: "ダンス", en: "Dance", fr: "Danse" })}
          </button>
          {guest.room === "parlor" ? (
            <button type="button" onClick={() => setGame("hana")} className="h-11 shrink-0 px-3 font-mono text-[10px] text-fg">
              {tx(lang, { ja: "花札", en: "Hanafuda", fr: "Hanafuda" })}
            </button>
          ) : null}
          <Link to="/library" className="ml-auto grid h-11 shrink-0 place-items-center px-3 font-mono text-[10px] text-dim">
            {tx(lang, { ja: "図書", en: "Library", fr: "Livres" })}
          </Link>
        </div>
      </div>

      <aside className="flex h-52 shrink-0 flex-col border-t border-border lg:h-auto lg:w-80 lg:border-t-0 lg:border-l">
        {decorate ? (
          <div className="flex h-full flex-col justify-center p-4 font-mono text-[11px] text-muted">
            {tx(lang, { ja: "もようがえ中。運営ボタンは出しません。", en: "Decorating. Ops stays hidden.", fr: "Déco. Ops masqué." })}
          </div>
        ) : panel === "ops" ? (
          <OpsPanel lang={lang} ops={ops} guard={guard} onRepair={() => setOps(applyNightlyRepair({ ...ops, lastRepairDay: "" }))} onClose={() => setPanel("chat")} />
        ) : panel === "worlds" ? (
          <JapanWorldList lang={lang} here={guest.room} occupancy={occ} onGo={go} />
        ) : panel === "stamps" ? (
          <StampTray
            lang={lang}
            onStamp={(text) => {
              setMsg(text);
              setPanel("chat");
            }}
          />
        ) : panel === "act" ? (
          <ActTray lang={lang} onAct={(id) => applyAct(id)} />
        ) : panel === "friends" ? (
          <FriendsLocked lang={lang} />
        ) : (
          <>
            <div className="flex gap-1 overflow-x-auto border-b border-border p-2">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setChannel(ch.id)}
                  className={`h-8 px-2 font-mono text-[10px] ${channel === ch.id ? "bg-accent/15 text-accent" : "text-muted"}`}
                >
                  {ch.id}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2 font-mono text-[11px]">
              {chat.length === 0 ? (
                <p className="text-muted">
                  {tx(lang, { ja: "他国の部屋と敬語で話します。", en: "Talk across countries, with courtesy.", fr: "Parler entre pays, avec courtoisie." })}
                </p>
              ) : (
                chat.map((c) => (
                  <div key={c.id} className="mb-2">
                    <span className="text-muted">
                      {c.channel}/{c.who}
                    </span>
                    <div className="text-fg">{c.text}</div>
                  </div>
                ))
              )}
            </div>
            <form
              className="relative flex gap-1 border-t border-border p-2"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                className="h-10 min-w-0 flex-1 rounded-sm border border-border bg-panel px-2 text-[12px]"
                placeholder={tx(lang, { ja: "発言 / :sit :wave", en: "Say / :sit :wave", fr: "Dire / :sit" })}
              />
              <button type="submit" className="h-10 px-3 text-[12px] text-accent">
                {tx(lang, { ja: "送る", en: "Send", fr: "Envoyer" })}
              </button>
              {namePop ? (
                <div className="absolute -top-8 left-2 rounded-sm bg-paper px-2 py-1 font-mono text-[10px] text-ink">
                  {guest.name}
                </div>
              ) : null}
            </form>
          </>
        )}
      </aside>

      {game !== "none" ? (
        <div className="absolute inset-0 z-20 flex items-end bg-bg/70 p-3 md:items-center md:justify-center" onClick={() => setGame("none")}>
          <div className="max-h-[80%] w-full max-w-lg overflow-y-auto rounded-md border border-border bg-surface p-3" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex justify-between">
              <span className="font-mono text-[10px] tracking-widest text-muted">
                {tx(lang, { ja: "花札 · 運", en: "Hanafuda · chance", fr: "Hanafuda · chance" })}
              </span>
              <button type="button" onClick={() => setGame("none")} className="text-[11px] text-muted">
                {tx(lang, { ja: "閉じる", en: "Close", fr: "Fermer" })}
              </button>
            </div>
            <Hanafuda lang={lang} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DockBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className={`h-11 shrink-0 px-3 font-mono text-[10px] ${active ? "bg-accent/15 text-accent" : "text-fg"}`}>
      {label}
    </button>
  );
}

function OpsPanel({
  lang,
  ops,
  guard,
  onRepair,
  onClose,
}: {
  lang: Lang;
  ops: OzOps;
  guard: GuardSnap;
  onRepair: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-3 font-mono text-[11px]">
      <div className="mb-2 flex items-center justify-between">
        <span className="tracking-[0.2em] text-muted">{tx(lang, { ja: "運用", en: "OPS", fr: "OPS" })}</span>
        <button type="button" onClick={onClose} className="text-dim">
          {tx(lang, { ja: "戻る", en: "Back", fr: "Retour" })}
        </button>
      </div>
      <p className="text-dim">
        {OZ_ORIGIN} · {tx(lang, { ja: `次回メンテ ${OZ_WINDOW_JST}`, en: `Next window ${OZ_WINDOW_JST}`, fr: `Prochaine fenêtre ${OZ_WINDOW_JST}` })}
      </p>
      <p className="mt-1 text-ok">
        {tx(lang, { ja: `健全度 ${worldHealth(ops)}%`, en: `Health ${worldHealth(ops)}%`, fr: `Santé ${worldHealth(ops)}%` })}
      </p>
      <p className="mt-2 text-[10px] leading-relaxed text-dim">
        {tx(lang, {
          ja: `受信 通${guard.accepted} 落${guard.dropped}${guard.lastDrop ? ` · 直前 ${guard.lastDrop.reason}` : ""} · PNG ${guard.personaNonGrata}`,
          en: `Rx ok ${guard.accepted} drop ${guard.dropped}${guard.lastDrop ? ` · last ${guard.lastDrop.reason}` : ""} · PNG ${guard.personaNonGrata}`,
          fr: `Rx ok ${guard.accepted} rejet ${guard.dropped}${guard.lastDrop ? ` · ${guard.lastDrop.reason}` : ""} · PNG ${guard.personaNonGrata}`,
        })}
      </p>
      {guard.firstName ? (
        <p className="mt-1 text-[10px] text-muted">
          {tx(lang, {
            ja: `一つ目 ${guard.firstName} はBANしません`,
            en: `First account ${guard.firstName} is not banned`,
            fr: `Premier compte ${guard.firstName} : pas de ban`,
          })}
        </p>
      ) : null}
      <ul className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto">
        {OZ_DISTRICTS.map((d) => (
          <li key={d.id} className="flex justify-between text-fg">
            <span>{tx(lang, { ja: d.ja, en: d.en, fr: d.fr })}</span>
            <span className={d.id === "outer" ? "text-alert" : "text-ok"}>{ops.health[d.id] ?? 0}%</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] leading-relaxed text-muted">{ops.patches[0] ? tx(lang, { ja: ops.patches[0].ja, en: ops.patches[0].en, fr: ops.patches[0].fr }) : ""}</p>
      <button type="button" onClick={onRepair} className="mt-2 h-11 w-full bg-accent font-semibold text-bg">
        {tx(lang, { ja: "今夜のメンテを今やる", en: "Run tonight's repair now", fr: "Lancer la réparation de cette nuit" })}
      </button>
    </div>
  );
}

function OrbitMap({
  lang,
  health,
  here,
  onGo,
}: {
  lang: Lang;
  health: Record<OzRoomId, number>;
  here: OzRoomId;
  onGo: (id: OzRoomId) => void;
}) {
  return (
    <div className="absolute inset-0 grid place-items-center p-4">
      <div className="relative size-[min(100%,22rem)]">
        <div className="absolute inset-[18%] rounded-full border border-accent/30" />
        <div className="absolute inset-[34%] rounded-full border border-border" />
        <div className="absolute inset-[48%] grid place-items-center rounded-full border border-accent/50 bg-surface font-mono text-[10px] tracking-[0.2em] text-accent">
          OZ
        </div>
        {OZ_DISTRICTS.map((d, i) => {
          const angle = (i / OZ_DISTRICTS.length) * Math.PI * 2 - Math.PI / 2;
          const r = 42 + d.ring * 4;
          const left = 50 + Math.cos(angle) * r;
          const top = 50 + Math.sin(angle) * r;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onGo(d.id)}
              className={`absolute h-11 min-w-16 -translate-x-1/2 -translate-y-1/2 px-2 font-mono text-[10px] ${
                here === d.id ? "bg-accent text-bg" : d.id === "outer" ? "border border-alert text-alert" : "border border-border bg-panel text-fg"
              }`}
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              {tx(lang, { ja: d.ja, en: d.en, fr: d.fr })}
              <span className="mt-0.5 block text-[9px] opacity-70">{health[d.id] ?? 0}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RoomGrid({
  guest,
  lang,
  extra,
  npcs,
  decorate,
  paper,
  floor,
  doorAt,
  onTile,
  onItem,
  onHref,
  onTable,
  onSit,
  onPick,
  onStretch,
  onYou,
  onNpc,
}: {
  guest: OzGuest;
  lang: Lang;
  extra: OzItem[];
  npcs: OzNpc[];
  decorate: boolean;
  paper: string;
  floor: string;
  doorAt: number;
  onTile: (x: number, y: number) => void;
  onItem: (id: OzRoomId) => void;
  onHref: (href: string) => void;
  onTable: (id: string) => void;
  onSit: (x: number, y: number) => void;
  onPick: (id: string) => void;
  onStretch?: (dc: number, dr: number) => void;
  onYou?: () => void;
  onNpc?: (id: string) => void;
}) {
  const room = ROOMS[guest.room];
  const { cols, rows } = roomSize(guest.room);
  const cells = useMemo(() => Array.from({ length: cols * rows }, (_, i) => ({ x: i % cols, y: Math.floor(i / cols) })), [cols, rows]);
  const items = [...room.items, ...extra];
  const stageW = isoLeft(cols - 1, 0, cols) + TILE_W;
  const stageH = isoTop(cols - 1, rows - 1) + TILE_H + WALL_H + 56;
  const wall = WALLPAPERS.find((w) => w.id === paper)?.css ?? WALLPAPERS[0].css;
  const floorCls = floor === "tatami" ? "tatami" : floor === "tile" ? "tile" : "";
  return (
    <div className="absolute inset-0 overflow-auto">
      <div className="relative mx-auto" style={{ width: stageW, height: stageH, minHeight: "100%" }}>
        <IsoWalls cols={cols} rows={rows} paper={wall} doorAt={doorAt} showLabels={decorate} />
        {cells.map((c) => (
          <button
            key={`${c.x}-${c.y}`}
            type="button"
            onClick={() => onTile(c.x, c.y)}
            aria-label={`${c.x},${c.y}`}
            className={`oz-tile absolute ${floorCls}`}
            style={{
              left: isoLeft(c.x, c.y, cols),
              top: isoTop(c.x, c.y) + WALL_H,
              width: TILE_W,
              height: TILE_H,
              background:
                floor === "tatami" || floor === "tile"
                  ? undefined
                  : (c.x + c.y) % 2 === 0
                    ? "color-mix(in oklab, var(--color-accent) 16%, var(--color-raised))"
                    : room.floor,
              zIndex: c.x + c.y,
            }}
          />
        ))}
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={() => {
              if (decorate && it.placed) {
                onPick(it.id);
                return;
              }
              if (!decorate && (it.kind === "chair" || it.kind === "bed" || it.sit)) {
                onSit(it.x, it.y);
                return;
              }
              if (it.to) onItem(it.to);
              else if (it.href) onHref(it.href);
              else if (it.kind === "table") onTable(it.id);
            }}
            className="absolute grid place-items-end"
            style={{
              left: isoLeft(it.x, it.y, cols) + 8,
              top: isoTop(it.x, it.y) + WALL_H - (it.kind === "desk" || it.kind === "chair" ? 10 : 4),
              width: TILE_W - 16,
              height: TILE_H + (it.kind === "desk" || it.kind === "chair" ? 18 : 12),
              zIndex: it.x + it.y + 20,
            }}
          >
            <FurnSprite kind={it.kind} label={furnLabel(it.kind, lang)} />
          </button>
        ))}
        {npcs.map((n) => (
          <div
            key={n.id}
            className="absolute flex justify-center"
            style={{
              left: isoLeft(n.pos.x, n.pos.y, cols) - 4,
              top: isoTop(n.pos.x, n.pos.y) + WALL_H - 52,
              width: TILE_W + 8,
              zIndex: n.pos.x + n.pos.y + 40,
              transition: "left 180ms cubic-bezier(0.22,1,0.36,1), top 180ms cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <PiggAvatar avatar={npcAvatar(n)} name={n.name} onClick={onNpc ? () => onNpc(n.id) : undefined} />
          </div>
        ))}
        <div
          className="absolute flex justify-center"
          style={{
            left: isoLeft(guest.pos.x, guest.pos.y, cols) - 4,
            top: isoTop(guest.pos.x, guest.pos.y) + WALL_H - (guest.pose === "sit" || guest.pose === "sleep" ? 32 : 52),
            width: TILE_W + 8,
            zIndex: guest.pos.x + guest.pos.y + 40,
            transition: "left 180ms cubic-bezier(0.22,1,0.36,1), top 180ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <PiggAvatar
            avatar={guest.avatar}
            facing={guest.facing}
            pose={guest.pose}
            name={guest.name}
            you
            bubble={guest.bubble}
            bubbleKind={guest.bubbleKind}
            scale={guest.scale}
            dance={guest.dance}
            sign={guest.sign}
            janken={guest.janken}
            onClick={onYou}
          />
        </div>
        {onStretch ? <StretchHandle cols={cols} rows={rows} lang={lang} onStretch={onStretch} /> : null}
      </div>
    </div>
  );
}

function furnLabel(kind: OzItem["kind"], lang: Lang) {
  if (kind === "shelf") return tx(lang, { ja: "書", en: "Bk", fr: "Lv" });
  if (kind === "radio") return "ON";
  if (kind === "table") return tx(lang, { ja: "札", en: "Play", fr: "Jeu" });
  if (kind === "bridge") return tx(lang, { ja: "橋", en: "Br", fr: "Pont" });
  if (kind === "gate") return tx(lang, { ja: "門", en: "Gate", fr: "Porte" });
  if (kind === "desk") return tx(lang, { ja: "机", en: "Dk", fr: "Bu" });
  if (kind === "bed") return tx(lang, { ja: "寝", en: "Bed", fr: "Lit" });
  if (kind === "chair") return tx(lang, { ja: "椅", en: "Sit", fr: "Ass" });
  if (kind === "cube") return "■";
  return "";
}

function Dpad({ onMove, posRef }: { onMove: (dx: number, dy: number) => void; posRef: { current: OzGuest | null } }) {
  const keys = useRef(new Set<string>());
  useEffect(() => {
    const apply = (code: string) => {
      if (code === "ArrowLeft" || code === "KeyA") onMove(-1, 0);
      if (code === "ArrowRight" || code === "KeyD") onMove(1, 0);
      if (code === "ArrowUp" || code === "KeyW") onMove(0, -1);
      if (code === "ArrowDown" || code === "KeyS") onMove(0, 1);
    };
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      apply(e.code);
    };
    window.addEventListener("keydown", onKey);
    const probe = {
      getPos: () => posRef.current?.pos ?? { x: 0, y: 0 },
      setKeys: (codes: string[]) => {
        keys.current = new Set(codes);
        for (const c of codes) apply(c);
      },
    };
    (window as Window & { __ozWalkTest?: typeof probe }).__ozWalkTest = probe;
    return () => {
      window.removeEventListener("keydown", onKey);
      delete (window as Window & { __ozWalkTest?: typeof probe }).__ozWalkTest;
    };
  }, [onMove, posRef]);
  const Btn = ({ dx, dy, label }: { dx: number; dy: number; label: string }) => (
    <button type="button" onClick={() => onMove(dx, dy)} className="grid size-11 place-items-center rounded-sm border border-border bg-surface/90 text-[11px] text-fg">
      {label}
    </button>
  );
  return (
    <div className="absolute right-3 bottom-3 grid grid-cols-3 gap-1">
      <div />
      <Btn dx={0} dy={-1} label="W" />
      <div />
      <Btn dx={-1} dy={0} label="A" />
      <div />
      <Btn dx={1} dy={0} label="D" />
      <div />
      <Btn dx={0} dy={1} label="S" />
      <div />
    </div>
  );
}

function Hanafuda({ lang }: { lang: Lang }) {
  const [hand, setHand] = useState<HanaCard[]>([]);
  const [field, setField] = useState<HanaCard[]>([]);
  const [taken, setTaken] = useState<HanaCard[]>([]);
  const [opp, setOpp] = useState<HanaCard[]>([]);
  const [over, setOver] = useState(false);

  const deal = () => {
    const d = hanaDeck();
    setHand(d.slice(0, 8));
    setField(d.slice(8, 16));
    setTaken([]);
    setOpp([]);
    setOver(false);
  };

  useEffect(() => {
    deal();
  }, []);

  const play = (card: HanaCard) => {
    if (over) return;
    const match = field.find((f) => f.month === card.month);
    let nextField = field.filter((f) => f.id !== match?.id);
    let nextTaken = taken;
    if (match) nextTaken = [...taken, card, match];
    else nextField = [...nextField, card];
    const nextHand = hand.filter((c) => c.id !== card.id);
    const hidden = hanaDeck()
      .filter((c) => ![...nextHand, ...nextField, ...nextTaken, ...opp].some((x) => x.id === c.id))
      .slice(0, 8);
    const aiPlay = hidden[0] ? pickFrom(hidden, nextField) : null;
    let field2 = nextField;
    let opp2 = opp;
    if (aiPlay) {
      const m = field2.find((f) => f.month === aiPlay.month);
      if (m) {
        field2 = field2.filter((f) => f.id !== m.id);
        opp2 = [...opp, aiPlay, m];
      } else field2 = [...field2, aiPlay];
    }
    setHand(nextHand);
    setField(field2);
    setTaken(nextTaken);
    setOpp(opp2);
    if (nextHand.length === 0) setOver(true);
  };

  const you = hanaScore(taken);
  const they = hanaScore(opp);

  return (
    <div className="font-mono text-[11px]">
      <div className="mb-2 flex justify-between text-dim">
        <span>
          {tx(lang, { ja: "あなた", en: "You", fr: "Vous" })} {you}
        </span>
        <span>
          {tx(lang, { ja: "相手", en: "House", fr: "Maison" })} {they}
        </span>
      </div>
      <div className="mb-2 flex flex-wrap gap-1">
        {field.map((c) => (
          <HanaTile key={c.id} card={c} lang={lang} />
        ))}
      </div>
      <div className="mb-2 text-muted">{tx(lang, { ja: "手札（月が同じ札を場に出して取る）", en: "Hand — play a matching month", fr: "Main — jouer le même mois" })}</div>
      <div className="flex flex-wrap gap-1">
        {hand.map((c) => (
          <button key={c.id} type="button" onClick={() => play(c)} className="rounded-sm">
            <HanaTile card={c} lang={lang} active />
          </button>
        ))}
      </div>
      {over ? (
        <div className="mt-3 flex items-center justify-between">
          <span className={you >= they ? "text-ok" : "text-danger"}>
            {you >= they
              ? tx(lang, { ja: "勝ち", en: "Win", fr: "Victoire" })
              : tx(lang, { ja: "負け", en: "Loss", fr: "Défaite" })}
          </span>
          <button type="button" onClick={deal} className="h-10 px-3 text-accent">
            {tx(lang, { ja: "もう一度", en: "Again", fr: "Encore" })}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function pickFrom(hidden: HanaCard[], field: HanaCard[]) {
  const match = hidden.find((c) => field.some((f) => f.month === c.month));
  return match ?? hidden[0]!;
}

function HanaTile({ card, lang, active }: { card: HanaCard; lang: Lang; active?: boolean }) {
  return (
    <div className={`grid h-14 w-10 place-items-center rounded-sm border ${active ? "border-accent bg-panel" : "border-border bg-raised"}`}>
      <div className="text-[10px] text-accent">{hanaLabel(card.month, lang)}</div>
      <div className="text-[9px] text-muted">{card.kind}</div>
    </div>
  );
}

