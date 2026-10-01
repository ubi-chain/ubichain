import { createServerFn } from "@tanstack/react-start";
import { buildSystemPrompt, localEthicalReply, type ChatTurn } from "./ethics";
import type { Lang } from "./i18n";
import { recordAndHeal } from "./heal";

const MAX_TURNS = 6;
const MAX_CHARS = 700;
const MAX_TOKENS = 320;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;

const hits: number[] = [];

function allowCall() {
  const now = Date.now();
  while (hits.length && now - hits[0]! > WINDOW_MS) hits.shift();
  if (hits.length >= MAX_PER_WINDOW) return false;
  hits.push(now);
  return true;
}

function clip(text: string) {
  return text.replace(/\s+/g, " ").trim().slice(0, MAX_CHARS);
}

export type AskGuideResult =
  | { ok: true; text: string; source: "live" | "corpus" }
  | { ok: false; error: string };

async function complete(apiKey: string, body: unknown) {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  return res;
}

export const askGuide = createServerFn({ method: "POST" })
  .validator((input: { question: string; history: ChatTurn[]; lang: Lang; cycle: number; day: string }) => {
    const lang: Lang = input.lang === "en" || input.lang === "zh" || input.lang === "fr" ? input.lang : "ja";
    return {
      question: clip(String(input.question ?? "")),
      history: Array.isArray(input.history) ? input.history.slice(-MAX_TURNS) : [],
      lang,
      cycle: Number.isFinite(input.cycle) ? Math.max(1, Math.floor(input.cycle)) : 1,
      day: String(input.day ?? "").slice(0, 10),
    };
  })
  .handler(async ({ data }): Promise<AskGuideResult> => {
    const fallback = localEthicalReply(data.question, data.lang, data.cycle);
    if (!data.question) return { ok: true, text: fallback, source: "corpus" };

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey || !allowCall()) {
      if (!apiKey) recordAndHeal("AI is not available");
      return { ok: true, text: fallback, source: "corpus" };
    }

    const messages = [
      { role: "system" as const, content: buildSystemPrompt(data.cycle, data.lang, data.day) },
      ...data.history.map((turn) => ({
        role: turn.role === "me" ? ("user" as const) : ("assistant" as const),
        content: clip(turn.text),
      })),
      { role: "user" as const, content: data.question },
    ];

    const payload = {
      model: "grok-4.5",
      messages,
      max_tokens: MAX_TOKENS,
      temperature: 0.4,
    };

    try {
      let res = await complete(apiKey, payload);
      if (!res.ok && res.status >= 500) res = await complete(apiKey, payload);
      if (!res.ok) {
        recordAndHeal(`xAI API error ${res.status}`);
        return { ok: true, text: fallback, source: "corpus" };
      }
      const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = (body.choices?.[0]?.message?.content ?? "").trim().slice(0, 1200);
      if (!text) return { ok: true, text: fallback, source: "corpus" };
      return { ok: true, text, source: "live" };
    } catch (err) {
      recordAndHeal(err);
      return { ok: true, text: fallback, source: "corpus" };
    }
  });
