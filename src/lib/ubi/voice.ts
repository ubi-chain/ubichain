import type { Lang } from "./i18n";

export function speakLocal(text: string, lang: Lang) {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.slice(0, 900));
  u.lang = lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : lang === "zh" ? "zh-CN" : "ja-JP";
  u.rate = 0.96;
  u.pitch = 0.92;
  window.speechSynthesis.speak(u);
  return true;
}

export function stopSpeak() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}
