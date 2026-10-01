import { megaSlots, type BankTier } from "./banks";
import { ethicsInsight } from "./ethics";
import { errorInsight, recordAndHeal } from "./heal";
import { returnInsight } from "./returns";
import type { NewsItem } from "./news";

export const LEARN_LAUNCH = "2026-09-14";
/** One raise for the public-ISS console cycle. Not a command cycle. */
export const CYCLE_RAISE = 1;
export const LEARN_FEED = "https://raw.githubusercontent.com/ubi-chain/ubichain/main/learn/today.json";

export type LearnInsight = {
  id: string;
  ja: string;
  en: string;
  tone: "ok" | "warn" | "alert";
};

export type LearnCycle = {
  day: string;
  cycle: number;
  pulse: number;
  version: string;
  appliedAt: string;
  inequalityBias: number;
  ubiDelta: number;
  usersDelta: number;
  megaBias: number;
  regionalBias: number;
  insights: LearnInsight[];
  news: NewsItem[];
};

export function jstDay(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function cycleNumber(day: string) {
  const t0 = Date.parse(`${LEARN_LAUNCH}T00:00:00+09:00`);
  const t = Date.parse(`${day}T00:00:00+09:00`);
  if (!Number.isFinite(t) || !Number.isFinite(t0)) return 1;
  return Math.max(1, Math.floor((t - t0) / 86_400_000) + 1 + CYCLE_RAISE);
}

export const PULSE_DAY = "2026-09-14";
export const PULSE_MS = 30 * 60 * 1000;

export function msUntilNextJstMidnight(now = new Date()) {
  const day = jstDay(now);
  const next = Date.parse(`${day}T00:00:00+09:00`) + 86_400_000;
  return Math.max(0, next - now.getTime());
}

export function isPulseDay(now = new Date()) {
  return jstDay(now) === PULSE_DAY;
}

export function pulseIndex(now = new Date()) {
  if (!isPulseDay(now)) return 0;
  const start = Date.parse(`${PULSE_DAY}T00:00:00+09:00`);
  return Math.max(0, Math.min(47, Math.floor((now.getTime() - start) / PULSE_MS)));
}

export function msUntilNextPulse(now = new Date()) {
  if (!isPulseDay(now)) return msUntilNextJstMidnight(now);
  const start = Date.parse(`${PULSE_DAY}T00:00:00+09:00`);
  const next = start + (pulseIndex(now) + 1) * PULSE_MS;
  return Math.max(0, next - now.getTime());
}

export function pulseVersion(cycle: number, pulse: number, now = new Date()) {
  if (isPulseDay(now)) return `1.${cycle}.${pulse}`;
  return `1.${cycle}.0`;
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function unit(n: number) {
  return (n % 1000) / 1000;
}

export function buildLocalCycle(day = jstDay(), now = new Date()): LearnCycle {
  const cycle = cycleNumber(day);
  const pulse = pulseIndex(now);
  const h = hash(`ubichain-learn-${day}-p${pulse}`);
  const mega = megaSlots();
  const pick = mega[h % mega.length];
  const bankJa = pick?.bank.nameJa ?? "メガバンク";
  const bankEn = pick?.bank.nameEn ?? "a megabank";
  const failShift = ((h % 17) - 8) / 100;
  const ineq = ((h >> 8) % 21) / 1000 - 0.01;
  const megaBias = ((h >> 3) % 9) / 400 - 0.01;
  const regionalBias = ((h >> 11) % 7) / 500 - 0.004;
  const inflowPct = 2 + (h % 7);
  const insights: LearnInsight[] = [
    {
      id: "mega",
      ja: `${bankJa}の倒産確率を再推定（${failShift >= 0 ? "+" : ""}${(failShift * 100).toFixed(1)}pt）`,
      en: `Re-scored insolvency for ${bankEn} (${failShift >= 0 ? "+" : ""}${(failShift * 100).toFixed(1)}pt)`,
      tone: failShift > 0.03 ? "alert" : failShift < -0.02 ? "ok" : "warn",
    },
    {
      id: "flow",
      ja: `地方・メガの入金フローを学習。保障準備金へ +${inflowPct}%`,
      en: `Learned bank inflows. Guarantee reserve +${inflowPct}%`,
      tone: "ok",
    },
    {
      id: "gap",
      ja: `格差指数を日次学習（バイアス ${ineq >= 0 ? "+" : ""}${(ineq * 100).toFixed(2)}pt）`,
      en: `Inequality model updated (${ineq >= 0 ? "+" : ""}${(ineq * 100).toFixed(2)}pt)`,
      tone: ineq > 0.005 ? "warn" : "ok",
    },
    {
      id: "pulse",
      ja: isPulseDay(now)
        ? `本日は30分更新。パルス ${pulse}/47 · 次回まで ${Math.ceil(msUntilNextPulse(now) / 60000)} 分`
        : "通常は日次更新。本日の30分パルスは終了",
      en: isPulseDay(now)
        ? `Today: 30-min updates. Pulse ${pulse}/47 · next in ${Math.ceil(msUntilNextPulse(now) / 60000)} min`
        : "Daily cadence. Today's 30-min pulse window is over",
      tone: "ok" as const,
    },
    ethicsInsight(cycle),
    {
      id: "qcycle",
      ja: "新サイクルUI。公開ISS位置の幾何シミュレーションのみ。操縦・傍受・対象追跡はしない。",
      en: "New cycle UI. Public ISS geometry only. No command, intercept, or target track.",
      tone: "ok" as const,
    },
    {
      id: "iii",
      ja: "第三インターナショナル2026を学習。1919のコミンテルンは消さない。法は国家を超えて人の最低線を残す。",
      en: "Trained Third International 2026. The 1919 Comintern is not erased. Law keeps a floor of dignity beyond the state.",
      tone: "ok" as const,
    },
    {
      id: "oz",
      ja: "変動金利の返済増を台帳の救済枠で埋める。貸付はしない。",
      en: "The variable-rate payment gap is covered on the ledger. No loan is originated.",
      tone: "ok" as const,
    },
    errorInsight(),
    returnInsight(cycle),
  ];
  const news: NewsItem[] = [
    {
      id: 9000 + cycle,
      title: `Daily learn cycle ${cycle} — stability model refreshed`,
      titleJa: `日次学習サイクル ${cycle} — 安定保障モデルを更新`,
      region: "北本",
      regionEn: "Kitamoto",
      flag: "JP",
      category: "経済",
      summary: `Overnight training re-estimated megabank fail risk and regional inflows. ${bankEn} moved ${failShift >= 0 ? "+" : ""}${(failShift * 100).toFixed(1)}pt.`,
      summaryJa: `夜間学習でメガバンク倒産確率と地方入金を再推定。${bankJa}は ${failShift >= 0 ? "+" : ""}${(failShift * 100).toFixed(1)}pt。`,
      time: "本日学習",
      urgent: true,
    },
    {
      id: 8000 + cycle,
      title: "Guarantee reserve reweighted from yesterday's bank deposits",
      titleJa: "前日の銀行入金から保障準備金を再配分",
      region: pick?.country.nameEn ?? "Tokyo",
      regionEn: pick?.country.nameEn ?? "Tokyo",
      flag: pick?.country.code ?? "JP",
      category: "UBI",
      summary: `Cycle ${cycle} shifted UBI float from bank-held capital into the public reserve after the daily learn pass.`,
      summaryJa: `サイクル ${cycle} の学習で、銀行内資本から公共の保障準備金へ UBI 原資を寄せた。`,
      time: "本日学習",
    },
    {
      id: 7000 + cycle,
      title: "Insolvency return for emergency and disaster support",
      titleJa: "倒産リスクの公社・公司・委員会から緊急支援・災害対応へ返還",
      region: "北本",
      regionEn: "Kitamoto",
      flag: "JP",
      category: "UBI",
      summary: "Admin-line policy: capital trapped in failing public corps, companies, and committees is prioritized for emergency and disaster support.",
      summaryJa: "管理者回線の方針。倒産しうる公社・公司・委員会に滞留した資本を、緊急支援・災害対応へ優先返還する。",
      time: "本日学習",
      urgent: true,
    },
  ];
  return {
    day,
    cycle,
    pulse,
    version: pulseVersion(cycle, pulse, now),
    appliedAt: isPulseDay(now) ? now.toISOString() : `${day}T00:05:00+09:00`,
    inequalityBias: ineq,
    ubiDelta: Math.floor(36_000_000 + unit(h) * 28_000_000),
    usersDelta: 980 + (h % 900),
    megaBias,
    regionalBias,
    insights,
    news,
  };
}

export function mergeRemoteCycle(local: LearnCycle, remote: Partial<LearnCycle> | null): LearnCycle {
  if (!remote || remote.day !== local.day) return local;
  const insights = remote.insights?.length ? [...remote.insights] : [...local.insights];
  if (!insights.some((row) => row.id === "ethics")) {
    const ethics = local.insights.find((row) => row.id === "ethics");
    if (ethics) insights.push(ethics);
  }
  if (!insights.some((row) => row.id === "heal")) {
    const heal = local.insights.find((row) => row.id === "heal");
    if (heal) insights.push(heal);
  }
  if (!insights.some((row) => row.id === "pulse")) {
    const pulseRow = local.insights.find((row) => row.id === "pulse");
    if (pulseRow) insights.push(pulseRow);
  }
  if (!insights.some((row) => row.id === "return")) {
    const ret = local.insights.find((row) => row.id === "return");
    if (ret) insights.push(ret);
  }
  if (!insights.some((row) => row.id === "iii")) {
    const iii = local.insights.find((row) => row.id === "iii");
    if (iii) insights.push(iii);
  }
  if (!insights.some((row) => row.id === "oz")) {
    const oz = local.insights.find((row) => row.id === "oz");
    if (oz) insights.push(oz);
  }
  return {
    ...local,
    ...remote,
    day: local.day,
    cycle: local.cycle,
    pulse: typeof remote.pulse === "number" ? remote.pulse : local.pulse,
    version: remote.version || local.version,
    insights,
    news: remote.news?.length ? remote.news : local.news,
  };
}

export function economyForCycle(cycle: LearnCycle) {
  return {
    totalUbi: 12_847_200_000 + cycle.cycle * cycle.ubiDelta,
    totalUsers: 2_341_890 + cycle.cycle * cycle.usersDelta,
    inequalityIndex: Math.max(0.2, Math.min(0.88, 0.423 + cycle.inequalityBias + (cycle.cycle - 1) * 0.0012)),
  };
}

export function stressBias(tier: BankTier, cycle: LearnCycle) {
  return tier === "mega" ? cycle.megaBias : cycle.regionalBias;
}

export async function fetchRemoteCycle(day: string): Promise<Partial<LearnCycle> | null> {
  try {
    const res = await fetch(`${LEARN_FEED}?d=${day}`, { cache: "no-store" });
    if (!res.ok) {
      recordAndHeal(`LEARN_FEED ${res.status}`);
      return null;
    }
    return (await res.json()) as Partial<LearnCycle>;
  } catch (err) {
    recordAndHeal(err);
    return null;
  }
}
