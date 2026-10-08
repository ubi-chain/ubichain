import { create } from "zustand";
import { detectLang, type Lang } from "./i18n";
import { memberIdFromPhone } from "./format";
import {
  allBankSlots,
  bankFailRisk,
  bankTier,
  findBank,
  INITIAL_BANK_CAPITAL,
  INITIAL_BANK_POOL,
  megaSlots,
  toJpy,
  type BankTier,
} from "./banks";
import { ZONE_APPLIED_AT, ZONE_SERIAL } from "./dns";
import { INITIAL_ISS, issPosition, visibleStation, type IssReplica } from "./iss";
import { INITIAL_XSAT, xsatSnapshot, type XSatEdge } from "./xsat";
import { nextReturn, type ReturnFlow } from "./returns";
import { isAdminPhone, isCreditPhone, phoneDigits, ADMIN_PHONE, GAP_MARK, GAP_YEN, CREDIT_MONTHLY_YEN } from "./admin";
import { buildDonorBatch, DONOR_BATCH_YEN, DONOR_DIGITS, type DonorBatch } from "./donor-rail";
import { readSeenVersion, writeSeenVersion } from "./maintain";
import {
  buildLocalCycle,
  economyForCycle,
  fetchRemoteCycle,
  isPulseDay,
  jstDay,
  cycleNumber,
  mergeRemoteCycle,
  pulseIndex,
  stressBias,
  type LearnCycle,
} from "./learn";

export type UbiUser = {
  name: string;
  phone: string;
  memberId: string;
  registeredAt: string;
  monthlyUbi: number;
  balance: number;
  bankDeposited: number;
};

export type LinkedBank = {
  id: string;
  countryCode: string;
  bankId: string;
  bankNameJa: string;
  bankNameEn: string;
  last4: string;
  currency: string;
  tier: BankTier;
};

export type BankDeposit = {
  id: string;
  accountId: string;
  bankNameJa: string;
  bankNameEn: string;
  countryCode: string;
  amount: number;
  localAmount: number;
  currency: string;
  at: string;
  tier: BankTier;
};

export type LiveInflow = {
  id: string;
  countryCode: string;
  bankNameJa: string;
  bankNameEn: string;
  amountJpy: number;
  currency: string;
  tier: BankTier;
};

export type BankStress = {
  bankId: string;
  countryCode: string;
  bankNameJa: string;
  bankNameEn: string;
  tier: BankTier;
  failRisk: number;
};

export type TxType = "ubi" | "labor" | "suspicious" | "theft" | "refund" | "bank";

export type LiveTx = {
  id: string;
  type: TxType;
  from: string;
  to: string;
  amount: number;
  currency: string;
  time: Date;
  flagged: boolean;
  fromIdx: number;
  toIdx: number;
};

type UbiState = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  user: UbiUser | null;
  login: (user: Omit<UbiUser, "memberId" | "registeredAt" | "balance" | "bankDeposited"> & Partial<UbiUser>) => void;
  logout: () => void;
  isFirstVisit: boolean;
  setFirstVisitDone: () => void;
  hydrate: () => void;
  totalUbi: number;
  totalUsers: number;
  flaggedCount: number;
  syncVersion: number;
  triggerSync: () => void;
  macroSlideActive: boolean;
  inequalityIndex: number;
  tickEconomy: () => void;
  linkedBanks: LinkedBank[];
  deposits: BankDeposit[];
  bankPool: number;
  bankCapital: number;
  liveInflows: LiveInflow[];
  bankStress: BankStress[];
  donorBatches: DonorBatch[];
  pulseDonorRail: () => DonorBatch;
  mintTestYen: (yen: number) => void;
  linkBank: (input: { countryCode: string; bankId: string; last4: string }) => LinkedBank | null;
  depositFromBank: (accountId: string, localAmount: number) => BankDeposit | null;
  debitBalance: (yen: number) => boolean;
  creditBalance: (yen: number) => boolean;
  dnsCommitted: boolean;
  dnsSerial: number;
  dnsCommittedAt: string;
  domainRegistered: boolean;
  domainRegisteredAt: string;
  commitDnsZone: () => void;
  registerDomain: () => void;
  learn: LearnCycle;
  applyDailyLearn: (remote?: Partial<LearnCycle> | null) => void;
  seenVersion: string;
  dismissMaintenance: (version: string) => void;
  iss: IssReplica;
  xsat: XSatEdge;
  returns: ReturnFlow[];
};

const USER_KEY = "ubichain.user";
const LANG_KEY = "ubichain.lang";
const VISIT_KEY = "ubichain.visited";
const BANK_KEY = "ubichain.bank-state.v2";
const DNS_KEY = "ubichain.dns-zone";
const LEARN_KEY = "ubichain.learn-cycle";
const DONOR_KEY = "ubichain.donor.v1";

function readUser(): UbiUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UbiUser;
    return { ...parsed, bankDeposited: parsed.bankDeposited ?? 0 };
  } catch {
    return null;
  }
}

function readLang(): Lang {
  if (typeof window === "undefined") return "ja";
  const saved = localStorage.getItem(LANG_KEY);
  if (saved === "ja" || saved === "en" || saved === "zh" || saved === "fr") return saved;
  return detectLang();
}

function persistUser(user: UbiUser | null) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

function postedCredit(existing: UbiUser | null): UbiUser | null {
  if (typeof window === "undefined" || !existing || !isCreditPhone(existing.phone)) return existing;
  const gapDone = localStorage.getItem(GAP_MARK) === "1";
  const user: UbiUser = {
    ...existing,
    phone: ADMIN_PHONE,
    monthlyUbi: CREDIT_MONTHLY_YEN,
    balance: gapDone ? existing.balance : existing.balance + GAP_YEN,
    bankDeposited: gapDone ? existing.bankDeposited : (existing.bankDeposited ?? 0) + GAP_YEN,
  };
  localStorage.setItem(GAP_MARK, "1");
  persistUser(user);
  return user;
}

type BankPersist = {
  linkedBanks: LinkedBank[];
  deposits: BankDeposit[];
  bankPool: number;
  bankCapital: number;
};

function persistBanks(state: BankPersist) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BANK_KEY, JSON.stringify(state));
}

function hydrateTier(bankId: string, fallback?: BankTier): BankTier {
  return findBank(bankId) ? bankTier(findBank(bankId)!.bank) : (fallback ?? "regional");
}

function readBanks(): BankPersist {
  if (typeof window === "undefined") {
    return { linkedBanks: [], deposits: [], bankPool: INITIAL_BANK_POOL, bankCapital: INITIAL_BANK_CAPITAL };
  }
  try {
    const raw = localStorage.getItem(BANK_KEY);
    if (!raw) return { linkedBanks: [], deposits: [], bankPool: INITIAL_BANK_POOL, bankCapital: INITIAL_BANK_CAPITAL };
    const parsed = JSON.parse(raw) as Partial<BankPersist>;
    return {
      linkedBanks: (parsed.linkedBanks ?? []).map((b) => ({
        ...b,
        currency: b.currency ?? findBank(b.bankId)?.country.currency ?? "JPY",
        tier: b.tier ?? hydrateTier(b.bankId),
      })),
      deposits: (parsed.deposits ?? []).map((d) => ({
        ...d,
        localAmount: d.localAmount ?? d.amount,
        currency: d.currency ?? "JPY",
        tier: d.tier ?? "regional",
      })),
      bankPool: parsed.bankPool ?? INITIAL_BANK_POOL,
      bankCapital: parsed.bankCapital ?? INITIAL_BANK_CAPITAL,
    };
  } catch {
    return { linkedBanks: [], deposits: [], bankPool: INITIAL_BANK_POOL, bankCapital: INITIAL_BANK_CAPITAL };
  }
}

type DnsPersist = {
  committed: boolean;
  serial: number;
  committedAt: string;
  registered: boolean;
  registeredAt: string;
};

function persistDns(state: DnsPersist) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DNS_KEY, JSON.stringify(state));
}

function readDonor(): DonorBatch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DONOR_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DonorBatch[];
    return Array.isArray(parsed) ? parsed.slice(0, 40) : [];
  } catch {
    return [];
  }
}

function persistDonor(batches: DonorBatch[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DONOR_KEY, JSON.stringify(batches.slice(0, 40)));
}

function readDns(): DnsPersist {
  if (typeof window === "undefined") {
    return {
      committed: true,
      serial: ZONE_SERIAL,
      committedAt: ZONE_APPLIED_AT,
      registered: true,
      registeredAt: ZONE_APPLIED_AT,
    };
  }
  try {
    const raw = localStorage.getItem(DNS_KEY);
    if (!raw) {
      return {
        committed: true,
        serial: ZONE_SERIAL,
        committedAt: ZONE_APPLIED_AT,
        registered: true,
        registeredAt: ZONE_APPLIED_AT,
      };
    }
    const parsed = JSON.parse(raw) as Partial<DnsPersist>;
    return {
      committed: parsed.committed ?? true,
      serial: parsed.serial ?? ZONE_SERIAL,
      committedAt: parsed.committedAt ?? ZONE_APPLIED_AT,
      registered: parsed.registered ?? true,
      registeredAt: parsed.registeredAt ?? parsed.committedAt ?? ZONE_APPLIED_AT,
    };
  } catch {
    return {
      committed: true,
      serial: ZONE_SERIAL,
      committedAt: ZONE_APPLIED_AT,
      registered: true,
      registeredAt: ZONE_APPLIED_AT,
    };
  }
}

function persistLearn(cycle: LearnCycle) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LEARN_KEY, JSON.stringify(cycle));
}

function readLearn(): LearnCycle {
  const fresh = buildLocalCycle(jstDay());
  if (typeof window === "undefined") return fresh;
  try {
    const raw = localStorage.getItem(LEARN_KEY);
    if (!raw) return fresh;
    const parsed = JSON.parse(raw) as Partial<LearnCycle>;
    if (parsed.day === fresh.day) return mergeRemoteCycle(fresh, parsed);
  } catch {
    /* ignore */
  }
  return fresh;
}

function withLearn(cycle: LearnCycle, stress: BankStress[]) {
  const eco = economyForCycle(cycle);
  return {
    learn: cycle,
    totalUbi: eco.totalUbi,
    totalUsers: eco.totalUsers,
    inequalityIndex: eco.inequalityIndex,
    bankStress: stress.map((row) => ({
      ...row,
      failRisk: Math.max(0.12, Math.min(0.92, row.failRisk + stressBias(row.tier, cycle))),
    })),
  };
}

function seedStress(): BankStress[] {
  return megaSlots()
    .map(({ country, bank }) => ({
      bankId: bank.id,
      countryCode: country.code,
      bankNameJa: bank.nameJa,
      bankNameEn: bank.nameEn,
      tier: bankTier(bank),
      failRisk: bankFailRisk(bank),
    }))
    .sort((a, b) => b.failRisk - a.failRisk);
}

const INITIAL_LEARN = buildLocalCycle(jstDay());

export const useUbi = create<UbiState>((set, get) => ({
  lang: "ja",
  setLang: (lang) => {
    if (typeof window !== "undefined") localStorage.setItem(LANG_KEY, lang);
    set({ lang });
  },
  user: null,
  login: (partial) => {
    const credit = isCreditPhone(partial.phone);
    const prev = readUser();
    const same = prev && phoneDigits(partial.phone) === phoneDigits(prev.phone);
    const gapDone = typeof window !== "undefined" && localStorage.getItem(GAP_MARK) === "1";
    const baseBal = same ? prev!.balance : (partial.balance ?? (credit ? 0 : 1_240_000));
    const baseDep = same ? (prev!.bankDeposited ?? 0) : (partial.bankDeposited ?? 0);
    const user: UbiUser = {
      name: partial.name || (isAdminPhone(partial.phone) ? "管理者" : "田中 太郎"),
      phone: credit ? ADMIN_PHONE : partial.phone,
      memberId: partial.memberId || memberIdFromPhone(partial.phone),
      registeredAt: partial.registeredAt || new Date().toISOString().slice(0, 10),
      monthlyUbi: credit ? CREDIT_MONTHLY_YEN : (partial.monthlyUbi ?? 17400),
      balance: credit && !gapDone ? baseBal + GAP_YEN : baseBal,
      bankDeposited: credit && !gapDone ? baseDep + GAP_YEN : baseDep,
    };
    if (credit && typeof window !== "undefined") localStorage.setItem(GAP_MARK, "1");
    persistUser(user);
    set({ user });
  },
  logout: () => {
    persistUser(null);
    set({ user: null });
  },
  isFirstVisit: false,
  setFirstVisitDone: () => {
    if (typeof window !== "undefined") localStorage.setItem(VISIT_KEY, "1");
    set({ isFirstVisit: false });
  },
  hydrate: () => {
    const banks = readBanks();
    const dns = readDns();
    const learn = readLearn();
    if (typeof window !== "undefined" && !localStorage.getItem(DNS_KEY)) persistDns(dns);
    persistLearn(learn);
    const user = postedCredit(readUser());
    let deposits = banks.deposits;
    if (user && isCreditPhone(user.phone) && !deposits.some((d) => d.id === "posted-gap")) {
      deposits = [
        {
          id: "posted-gap",
          accountId: "admin-line",
          bankNameJa: "過不足入金",
          bankNameEn: "Gap credit",
          countryCode: "JP",
          amount: GAP_YEN,
          localAmount: GAP_YEN,
          currency: "JPY",
          at: "2026-09-28T09:00:00+09:00",
          tier: "regional" as const,
        },
        ...deposits,
      ].slice(0, 80);
      persistBanks({ ...banks, deposits });
    }
    set({
      lang: readLang(),
      user,
      isFirstVisit: typeof window === "undefined" ? false : localStorage.getItem(VISIT_KEY) !== "1",
      linkedBanks: banks.linkedBanks,
      deposits,
      bankPool: banks.bankPool,
      bankCapital: banks.bankCapital,
      donorBatches: readDonor(),
      dnsCommitted: dns.committed,
      dnsSerial: dns.serial,
      dnsCommittedAt: dns.committedAt,
      domainRegistered: dns.registered,
      domainRegisteredAt: dns.registeredAt,
      seenVersion: readSeenVersion(),
      ...withLearn(learn, seedStress()),
    });
    if (typeof window !== "undefined") {
      void fetchRemoteCycle(learn.day).then((remote) => {
        if (remote) get().applyDailyLearn(remote);
      });
    }
  },
  totalUbi: economyForCycle(INITIAL_LEARN).totalUbi,
  totalUsers: economyForCycle(INITIAL_LEARN).totalUsers,
  flaggedCount: 7,
  syncVersion: 1,
  triggerSync: () => set({ syncVersion: get().syncVersion + 1 }),
  macroSlideActive: false,
  inequalityIndex: economyForCycle(INITIAL_LEARN).inequalityIndex,
  linkedBanks: [],
  deposits: [],
  bankPool: INITIAL_BANK_POOL,
  bankCapital: INITIAL_BANK_CAPITAL,
  liveInflows: [],
  bankStress: withLearn(INITIAL_LEARN, seedStress()).bankStress,
  donorBatches: [],
  pulseDonorRail: () => {
    const batch = buildDonorBatch();
    const donorBatches = [batch, ...get().donorBatches].slice(0, 40);
    persistDonor(donorBatches);
    const bankPool = get().bankPool + DONOR_BATCH_YEN;
    persistBanks({
      linkedBanks: get().linkedBanks,
      deposits: get().deposits,
      bankPool,
      bankCapital: get().bankCapital,
    });
    const inflow = {
      id: batch.id,
      countryCode: "JP",
      bankNameJa: `出金 ${DONOR_DIGITS}`,
      bankNameEn: `source ${DONOR_DIGITS}`,
      amountJpy: DONOR_BATCH_YEN,
      currency: "JPY" as const,
      tier: "regional" as const,
    };
    set((s) => ({
      donorBatches,
      bankPool,
      liveInflows: [inflow, ...s.liveInflows].slice(0, 16),
      totalUbi: s.totalUbi + Math.floor(DONOR_BATCH_YEN * 0.4),
    }));
    return batch;
  },
  mintTestYen: (yen) => {
    if (!Number.isFinite(yen) || yen <= 0) return;
    const user = get().user;
    if (!user) return;
    const next = { ...user, balance: user.balance + yen };
    persistUser(next);
    set({ user: next, bankPool: get().bankPool + yen });
  },
  dnsCommitted: true,
  dnsSerial: ZONE_SERIAL,
  dnsCommittedAt: ZONE_APPLIED_AT,
  domainRegistered: true,
  domainRegisteredAt: ZONE_APPLIED_AT,
  learn: INITIAL_LEARN,
  seenVersion: "",
  dismissMaintenance: (version) => {
    writeSeenVersion(version);
    set({ seenVersion: version });
  },
  iss: INITIAL_ISS,
  xsat: INITIAL_XSAT,
  returns: [],
  applyDailyLearn: (remote) => {
    const day = jstDay();
    const local = buildLocalCycle(day);
    const cycle = mergeRemoteCycle(local, remote ?? null);
    persistLearn(cycle);
    set({
      ...withLearn(cycle, seedStress()),
      syncVersion: get().syncVersion + 1,
    });
  },
  tickEconomy: () => {
    const day = jstDay();
    if (get().learn.day !== day || get().learn.cycle !== cycleNumber(day)) get().applyDailyLearn();
    else if (isPulseDay() && (get().learn.pulse ?? -1) !== pulseIndex()) get().applyDailyLearn();
    set((s) => {
      const nextIneq = Math.max(0.2, Math.min(0.9, s.inequalityIndex + (Math.random() - 0.48) * 0.003));
      const slots = allBankSlots();
      const pick = slots[Math.floor(Math.random() * slots.length)];
      const mega = bankTier(pick.bank) === "mega";
      const amountJpy = mega
        ? Math.floor(180_000 + Math.random() * 2_400_000)
        : Math.floor(24_000 + Math.random() * 260_000);
      const inflow: LiveInflow = {
        id: Math.random().toString(36).slice(2, 10),
        countryCode: pick.country.code,
        bankNameJa: pick.bank.nameJa,
        bankNameEn: pick.bank.nameEn,
        amountJpy,
        currency: pick.country.currency,
        tier: bankTier(pick.bank),
      };
      const walked = (s.bankStress.length ? s.bankStress : seedStress()).map((row) => ({
        ...row,
        failRisk: Math.max(0.12, Math.min(0.92, row.failRisk + (Math.random() - 0.47) * 0.012)),
      }));
      walked.sort((a, b) => b.failRisk - a.failRisk);
      const fix = issPosition();
      const station = visibleStation(fix);
      const due = !s.iss.lastSync || Date.now() - Date.parse(s.iss.lastSync) > 90_000;
      const snap = station && due;
      const flow = nextReturn();
      return {
        totalUbi: s.totalUbi + Math.floor(Math.random() * 50_000 + 10_000) + Math.floor(flow.amountJpy * 0.0004),
        totalUsers: s.totalUsers + Math.floor(Math.random() * 3),
        flaggedCount: Math.max(0, s.flaggedCount + (Math.random() > 0.7 ? 1 : Math.random() > 0.8 ? -1 : 0)),
        inequalityIndex: nextIneq,
        macroSlideActive: nextIneq > 0.75 ? true : nextIneq < 0.65 ? false : s.macroSlideActive,
        bankPool: s.bankPool + amountJpy + Math.floor(flow.amountJpy * 0.12),
        bankCapital: Math.max(1_000_000_000_000, s.bankCapital - amountJpy),
        liveInflows: [inflow, ...s.liveInflows].slice(0, 16),
        bankStress: walked,
        iss: {
          role: "replica" as const,
          lat: fix.lat,
          lon: fix.lon,
          altKm: fix.altKm,
          inView: Boolean(station),
          stationId: station?.id ?? null,
          lastSync: snap ? new Date().toISOString() : s.iss.lastSync,
          cycle: snap ? s.learn.cycle : s.iss.cycle,
          version: snap ? s.learn.version : s.iss.version,
          bankPool: snap ? s.bankPool + amountJpy : s.iss.bankPool,
        },
        xsat: xsatSnapshot(new Date(), s.learn.version),
        returns: [flow, ...s.returns].slice(0, 24),
      };
    });
  },
  linkBank: ({ countryCode, bankId, last4 }) => {
    const found = findBank(bankId);
    if (!found || last4.replace(/\D/g, "").length < 4) return null;
    const digits = last4.replace(/\D/g, "").slice(-4);
    const existing = get().linkedBanks.find((b) => b.bankId === bankId && b.last4 === digits);
    if (existing) return existing;
    const account: LinkedBank = {
      id: `${bankId}-${digits}-${Math.random().toString(36).slice(2, 6)}`,
      countryCode,
      bankId,
      bankNameJa: found.bank.nameJa,
      bankNameEn: found.bank.nameEn,
      last4: digits,
      currency: found.country.currency,
      tier: bankTier(found.bank),
    };
    const linkedBanks = [account, ...get().linkedBanks];
    persistBanks({
      linkedBanks,
      deposits: get().deposits,
      bankPool: get().bankPool,
      bankCapital: get().bankCapital,
    });
    set({ linkedBanks });
    return account;
  },
  depositFromBank: (accountId, localAmount) => {
    if (!Number.isFinite(localAmount) || localAmount <= 0 || localAmount > 1_000_000_000_000) return null;
    const account = get().linkedBanks.find((b) => b.id === accountId);
    if (!account) return null;
    const amount = toJpy(localAmount, account.currency);
    if (amount <= 0) return null;
    const deposit: BankDeposit = {
      id: Math.random().toString(36).slice(2),
      accountId,
      bankNameJa: account.bankNameJa,
      bankNameEn: account.bankNameEn,
      countryCode: account.countryCode,
      amount,
      localAmount,
      currency: account.currency,
      at: new Date().toISOString(),
      tier: account.tier,
    };
    const deposits = [deposit, ...get().deposits].slice(0, 80);
    const bankPool = get().bankPool + amount;
    const bankCapital = Math.max(0, get().bankCapital - amount);
    const user = get().user
      ? {
          ...get().user!,
          balance: get().user!.balance + amount,
          bankDeposited: (get().user!.bankDeposited ?? 0) + amount,
        }
      : null;
    if (user) persistUser(user);
    persistBanks({
      linkedBanks: get().linkedBanks,
      deposits,
      bankPool,
      bankCapital,
    });
    const inflow: LiveInflow = {
      id: deposit.id,
      countryCode: account.countryCode,
      bankNameJa: account.bankNameJa,
      bankNameEn: account.bankNameEn,
      amountJpy: amount,
      currency: account.currency,
      tier: account.tier,
    };
    set((s) => ({
      deposits,
      bankPool,
      bankCapital,
      user,
      inequalityIndex: Math.max(0.2, s.inequalityIndex - 0.006),
      liveInflows: [inflow, ...s.liveInflows].slice(0, 16),
    }));
    return deposit;
  },
  debitBalance: (yen) => {
    const user = get().user;
    if (!user || !Number.isFinite(yen) || yen <= 0 || yen > user.balance) return false;
    const next = { ...user, balance: user.balance - yen };
    persistUser(next);
    set({ user: next });
    return true;
  },
  creditBalance: (amount) => {
    const user = get().user;
    if (!user || !Number.isFinite(amount) || amount <= 0 || amount > 100_000_000) return false;
    const next = {
      ...user,
      balance: user.balance + amount,
      bankDeposited: (user.bankDeposited ?? 0) + amount,
    };
    persistUser(next);
    set({ user: next });
    return true;
  },
  commitDnsZone: () => {
    const committedAt = new Date().toISOString();
    persistDns({
      committed: true,
      serial: ZONE_SERIAL,
      committedAt,
      registered: true,
      registeredAt: get().domainRegisteredAt || committedAt,
    });
    set({
      dnsCommitted: true,
      dnsSerial: ZONE_SERIAL,
      dnsCommittedAt: committedAt,
      domainRegistered: true,
    });
  },
  registerDomain: () => {
    const at = new Date().toISOString();
    persistDns({
      committed: true,
      serial: ZONE_SERIAL,
      committedAt: at,
      registered: true,
      registeredAt: at,
    });
    set({
      dnsCommitted: true,
      dnsSerial: ZONE_SERIAL,
      dnsCommittedAt: at,
      domainRegistered: true,
      domainRegisteredAt: at,
    });
  },
}));

// Financial simulation shutdown: preserve identity and non-financial demos.
// Old local demo balances are not real receipts and must never be restored.
function clearSimulatedFunds(state: UbiState): Partial<UbiState> {
  return {
    totalUbi: 0,
    bankPool: 0,
    bankCapital: 0,
    deposits: [],
    donorBatches: [],
    liveInflows: [],
    returns: [],
    user: state.user ? { ...state.user, balance: 0, monthlyUbi: 0, bankDeposited: 0 } : null,
    iss: { ...state.iss, bankPool: 0 },
  };
}
const originalHydrate = useUbi.getState().hydrate;
useUbi.setState({
  ...clearSimulatedFunds(useUbi.getState()),
  hydrate: () => {
    originalHydrate();
    useUbi.setState(clearSimulatedFunds(useUbi.getState()));
  },
  tickEconomy: () => {},
  pulseDonorRail: () => { throw new Error("Financial simulation disabled"); },
  mintTestYen: () => {},
  depositFromBank: () => null,
  debitBalance: () => false,
  creditBalance: () => false,
});
let clearingFunds = false;
useUbi.subscribe((state) => {
  if (clearingFunds) return;
  clearingFunds = true;
  try {
    useUbi.setState(clearSimulatedFunds(state));
    if (typeof window !== "undefined") {
      persistUser(useUbi.getState().user);
      persistBanks({ linkedBanks: state.linkedBanks, deposits: [], bankPool: 0, bankCapital: 0 });
      persistDonor([]);
    }
  } finally {
    clearingFunds = false;
  }
});
