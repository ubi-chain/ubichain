import type { LearnCycle } from "./learn";

const SEEN_KEY = "ubichain.seen-version";

export function appVersion(cycle: number) {
  return `1.${Math.max(1, cycle)}.0`;
}

export function readSeenVersion() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(SEEN_KEY) ?? "";
}

export function writeSeenVersion(version: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SEEN_KEY, version);
}

export function nextMaintenanceLabel(lang: "ja" | "en" | "zh") {
  if (lang === "en") return "Tonight 00:05 JST · OZ rooms";
  if (lang === "zh") return "今夜 00:05 JST · OZ";
  return "今夜 0:05 JST · OZ区画";
}

export function maintenanceNotes(cycle: LearnCycle) {
  return cycle.insights.map((row) => ({ id: row.id, ja: row.ja, en: row.en }));
}
