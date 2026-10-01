import { createServerFn } from "@tanstack/react-start";

const MAX = 500;
const WINDOW_MS = 60_000;
const MAX_PER = 6;
const hits: number[] = [];

function allow() {
  const now = Date.now();
  while (hits.length && now - hits[0]! > WINDOW_MS) hits.shift();
  if (hits.length >= MAX_PER) return false;
  hits.push(now);
  return true;
}

export const speakFolk = createServerFn({ method: "POST" })
  .validator((input: { text: string; lang: string }) => ({
    text: String(input.text ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX),
    lang: String(input.lang ?? "ja").slice(0, 8),
  }))
  .handler(async ({ data }): Promise<{ ok: true; b64: string } | { ok: false; error: string }> => {
    if (!data.text) return { ok: false, error: "empty" };
    if (!allow()) return { ok: false, error: "rate" };
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "unavailable" };
    try {
      const res = await fetch("https://api.x.ai/v1/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          text: data.text,
          voice_id: "eve",
          language: data.lang === "en" ? "en" : data.lang === "fr" ? "fr" : "ja",
        }),
      });
      if (!res.ok) return { ok: false, error: `tts ${res.status}` };
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength > 900_000) return { ok: false, error: "too large" };
      return { ok: true, b64: buf.toString("base64") };
    } catch {
      return { ok: false, error: "network" };
    }
  });
