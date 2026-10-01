import { ADMIN_DIGITS, ADMIN_PHONE } from "./admin";
import { smsComposeUrl } from "./sms";

export const DONOR_PHONE = ADMIN_PHONE;
export const DONOR_DIGITS = ADMIN_DIGITS;
export const DONOR_E164 = "+818057256673";

export type AffiliateId = "banks" | "pay" | "infra" | "ledger" | "international" | "live";

export type Affiliate = {
  id: AffiliateId;
  path: string;
  ja: string;
  en: string;
  yen: number;
};

/** Services on this site that receive the donor pulse. */
export const AFFILIATES: Affiliate[] = [
  { id: "banks", path: "/banks", ja: "保障準備金", en: "Reserve", yen: 40_000 },
  { id: "pay", path: "/pay", ja: "Pay", en: "Pay", yen: 12_000 },
  { id: "infra", path: "/infra", ja: "インフラ", en: "Infra", yen: 8_000 },
  { id: "ledger", path: "/ledger", ja: "家計", en: "Ledger", yen: 6_000 },
  { id: "international", path: "/international", ja: "公約", en: "Program", yen: 3_000 },
  { id: "live", path: "/live", ja: "放送", en: "Broadcast", yen: 2_000 },
];

export const DONOR_BATCH_YEN = AFFILIATES.reduce((n, a) => n + a.yen, 0);

export type DonorLeg = {
  to: AffiliateId;
  yen: number;
  ja: string;
  path: string;
};

export type DonorBatch = {
  id: string;
  from: typeof DONOR_DIGITS;
  at: string;
  yen: number;
  legs: DonorLeg[];
};

export function buildDonorBatch(now = new Date()): DonorBatch {
  return {
    id: `d-${now.getTime().toString(36)}`,
    from: DONOR_DIGITS,
    at: now.toISOString(),
    yen: DONOR_BATCH_YEN,
    legs: AFFILIATES.map((a) => ({ to: a.id, yen: a.yen, ja: a.ja, path: a.path })),
  };
}

export function donorSmsBody(batch: DonorBatch) {
  const lines = batch.legs.map((l) => `${l.ja} ¥${l.yen.toLocaleString("ja-JP")}`).join(" / ");
  return `【UBICHAIN振込】${DONOR_PHONE}→提携サービス 合計¥${batch.yen.toLocaleString("ja-JP")}。${lines}。台帳のみ。実口座は動かしません。`;
}

export function donorSmsHref(batch: DonorBatch) {
  return smsComposeUrl(DONOR_E164, donorSmsBody(batch));
}
