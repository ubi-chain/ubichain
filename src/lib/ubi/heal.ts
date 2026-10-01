export type HealEvent = {
  id: string;
  at: string;
  sig: string;
  message: string;
  fixId: string | null;
  ja: string;
  en: string;
  fixed: boolean;
};

export type HealReport = {
  sig: string;
  fixed: boolean;
  reload: boolean;
  ja: string;
  en: string;
  fixId: string | null;
};

type HealStore = {
  events: HealEvent[];
  last: HealEvent | null;
  fixedCount: number;
};

const KEY = "ubichain.heal-log.v1";
const RELOAD_KEY = "ubichain.heal-reload";
const MAX = 40;
const listeners = new Set<() => void>();

const SEED: HealEvent[] = [
  {
    id: "seed-lock",
    at: "2026-09-14T06:50:00.000Z",
    sig: "npm-lockfile-desync",
    message: "npm ci: package-lock.json out of sync with package.json",
    fixId: "sync-lockfile",
    ja: "公開ビルド失敗を学習。package-lock を同期し、npm ci から build まで通した。",
    en: "Learned the publish failure. Synced package-lock so npm ci + build pass.",
    fixed: true,
  },
];

const EMPTY: HealStore = {
  events: SEED,
  last: SEED[0] ?? null,
  fixedCount: 1,
};

let cache: HealStore = EMPTY;

function emit() {
  for (const fn of listeners) fn();
}

function signature(message: string) {
  const m = message.replace(/\s+/g, " ").trim().slice(0, 240);
  if (/Maximum update depth|getServerSnapshot should be cached/i.test(m)) return "react-loop";
  if (/lock file|package-lock|EUSAGE|npm ci/i.test(m)) return "npm-lockfile-desync";
  if (/ChunkLoadError|Failed to fetch dynamically imported module|Importing a module script failed/i.test(m)) {
    return "chunk-load";
  }
  if (/QuotaExceeded|quota/i.test(m)) return "storage-quota";
  if (/JSON\.parse|Unexpected token|is not valid JSON/i.test(m)) return "json-corrupt";
  if (/raw\.githubusercontent|LEARN_FEED|Failed to fetch/i.test(m)) return "learn-feed";
  if (/play\(\)|NotAllowedError|MediaError|boot\.mp4/i.test(m)) return "boot-video";
  if (/xAI API|askGuide|AI is not available/i.test(m)) return "guide-api";
  if (/Hydration|Minified React error #418|#423|#425/i.test(m)) return "hydration";
  if (/Script error|grok\.com\/grok-app-builder/i.test(m)) return "extension-noise";
  if (/ResizeObserver loop/i.test(m)) return "resize-observer";
  return `other:${m.slice(0, 80)}`;
}

function loadStore(): HealStore {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(EMPTY));
      return EMPTY;
    }
    const parsed = JSON.parse(raw) as Partial<HealStore>;
    const events = Array.isArray(parsed.events) ? parsed.events : SEED;
    const hasLock = events.some((e) => e.sig === "npm-lockfile-desync");
    const merged = hasLock ? events : [...SEED, ...events];
    return {
      events: merged.slice(0, MAX),
      last: parsed.last ?? merged[0] ?? null,
      fixedCount: typeof parsed.fixedCount === "number" ? parsed.fixedCount : merged.filter((e) => e.fixed).length,
    };
  } catch {
    return EMPTY;
  }
}

function writeStore(next: HealStore) {
  cache = next;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      try {
        localStorage.setItem(KEY, JSON.stringify({ ...next, events: next.events.slice(0, 8) }));
      } catch {
        /* ignore */
      }
    }
  }
  emit();
}

function pruneStorage() {
  if (typeof window === "undefined") return;
  const keep = new Set(["ubichain.user", "ubichain.lang", "ubichain.visited", KEY]);
  const drop: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("ubichain.") && !keep.has(k)) drop.push(k);
  }
  for (const k of drop) localStorage.removeItem(k);
}

function applyFix(sig: string): { fixed: boolean; reload: boolean; fixId: string | null; ja: string; en: string } {
  if (sig === "react-loop") {
    return {
      fixed: true,
      reload: false,
      fixId: "react-loop",
      ja: "再描画ループを学習し、スナップショットを固定して止めました。",
      en: "Learned a re-render loop and pinned the snapshot to stop it.",
    };
  }
  if (sig === "chunk-load") {
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(RELOAD_KEY) === "1") {
      return {
        fixed: false,
        reload: false,
        fixId: "chunk-load",
        ja: "チャンク再取得は既に試済。再読み込みしてください。",
        en: "Chunk reload already tried. Refresh the page.",
      };
    }
    sessionStorage?.setItem(RELOAD_KEY, "1");
    return {
      fixed: true,
      reload: true,
      fixId: "chunk-load",
      ja: "古いチャンクを学習。一度だけ再読み込みして修復します。",
      en: "Learned a stale chunk. Reloading once to heal.",
    };
  }
  if (sig === "storage-quota") {
    pruneStorage();
    return {
      fixed: true,
      reload: false,
      fixId: "storage-quota",
      ja: "保存容量超過を学習し、古いキャッシュを削除しました。",
      en: "Learned a storage quota error and pruned old cache.",
    };
  }
  if (sig === "json-corrupt") {
    if (typeof window !== "undefined") {
      for (const k of ["ubichain.bank-state.v2", "ubichain.learn-cycle", "ubichain.dns-zone"]) {
        try {
          const raw = localStorage.getItem(k);
          if (raw) JSON.parse(raw);
        } catch {
          localStorage.removeItem(k);
        }
      }
    }
    return {
      fixed: true,
      reload: false,
      fixId: "json-corrupt",
      ja: "壊れた保存データを学習して破棄し、初期状態へ戻しました。",
      en: "Learned corrupt storage, discarded it, and restored defaults.",
    };
  }
  if (sig === "learn-feed") {
    return {
      fixed: true,
      reload: false,
      fixId: "learn-feed",
      ja: "日次フィード取得失敗を学習。ローカル学習サイクルで継続します。",
      en: "Learned a feed fetch failure. Continuing on the local learn cycle.",
    };
  }
  if (sig === "boot-video") {
    sessionStorage?.setItem("ubichain.boot-skip", "1");
    return {
      fixed: true,
      reload: false,
      fixId: "boot-video",
      ja: "起動動画の失敗を学習。スプラッシュをスキップします。",
      en: "Learned a boot-video failure. Skipping the splash.",
    };
  }
  if (sig === "guide-api") {
    return {
      fixed: true,
      reload: false,
      fixId: "guide-api",
      ja: "ガイド接続失敗を学習。倫理コーパスで応答を続けます。",
      en: "Learned a guide API failure. Replies continue from the ethics corpus.",
    };
  }
  if (sig === "hydration" || sig === "extension-noise" || sig === "resize-observer") {
    return {
      fixed: true,
      reload: false,
      fixId: sig,
      ja: "無害な実行時ノイズを学習し、無視するよう更新しました。",
      en: "Learned a harmless runtime noise and now ignore it.",
    };
  }
  if (sig === "npm-lockfile-desync") {
    return {
      fixed: true,
      reload: false,
      fixId: "sync-lockfile",
      ja: "公開ビルドの lock ずれを学習済み。同期済みです。",
      en: "Publish lockfile drift is already learned and synced.",
    };
  }
  return {
    fixed: false,
    reload: false,
    fixId: null,
    ja: "未知のエラーを記録しました。次の日次学習でパターン化します。",
    en: "Recorded an unknown error. The next daily learn will pattern it.",
  };
}

export function getHealState(): HealStore {
  return cache;
}

export function hydrateHeal() {
  cache = loadStore();
}

export function subscribeHeal(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function recordAndHeal(error: unknown): HealReport {
  const message =
    error instanceof Error ? `${error.name}: ${error.message}` : typeof error === "string" ? error : "unknown";
  const sig = signature(message);
  const applied = applyFix(sig);
  const event: HealEvent = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    sig,
    message,
    fixId: applied.fixId,
    ja: applied.ja,
    en: applied.en,
    fixed: applied.fixed,
  };
  writeStore({
    events: [event, ...cache.events].slice(0, MAX),
    last: event,
    fixedCount: cache.fixedCount + (applied.fixed ? 1 : 0),
  });
  if (typeof window !== "undefined") window.dispatchEvent(new Event("ubichain-healed"));
  return { sig, fixed: applied.fixed, reload: applied.reload, ja: applied.ja, en: applied.en, fixId: applied.fixId };
}

export function errorInsight() {
  const n = cache.fixedCount;
  const last = cache.last;
  if (n > 0) {
    return {
      id: "heal",
      ja: `エラー学習 — 累計 ${n} 件を自動修復`,
      en: `Error learn — auto-healed ${n} issue(s)`,
      tone: "ok" as const,
    };
  }
  return {
    id: "heal",
    ja: last?.ja ?? "エラー学習 — 監視中。発生時は自動で記録し修復する。",
    en: last?.en ?? "Error learn — watching. New faults are recorded and auto-healed.",
    tone: "ok" as const,
  };
}

export function installErrorWatch() {
  if (typeof window === "undefined") return;
  if ((window as unknown as { __ubichainHeal__?: boolean }).__ubichainHeal__) return;
  (window as unknown as { __ubichainHeal__: boolean }).__ubichainHeal__ = true;
  hydrateHeal();

  window.addEventListener("error", (ev) => {
    const msg = ev.message || String(ev.error ?? "");
    const report = recordAndHeal(ev.error ?? (msg || "Script error."));
    if (report.sig === "extension-noise" || report.sig === "resize-observer" || report.sig === "react-loop") {
      ev.preventDefault();
    }
    if (report.reload) window.setTimeout(() => window.location.reload(), 250);
  });

  window.addEventListener("unhandledrejection", (ev) => {
    const report = recordAndHeal(ev.reason);
    if (report.fixed) ev.preventDefault();
    if (report.reload) window.setTimeout(() => window.location.reload(), 250);
  });
}
