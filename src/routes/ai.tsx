import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Send, Volume2, VolumeX } from "lucide-react";
import { askGuide } from "@/lib/ubi/ask-guide";
import { ETHICS_PROMPTS, ethicsLesson, type ChatTurn } from "@/lib/ubi/ethics";
import { tx } from "@/lib/ubi/i18n";
import { useUbi } from "@/lib/ubi/store";
import { speakFolk } from "@/lib/ubi/voice-fn";
import { speakLocal, stopSpeak } from "@/lib/ubi/voice";

export const Route = createFileRoute("/ai")({ component: AiPage });

function AiPage() {
  const { lang, learn } = useUbi();
  const lesson = ethicsLesson(learn.cycle);
  const west = lang === "en" || lang === "fr";
  const hello = tx(lang, {
    ja: `こんにちは。AIガイドのUBIです。です・ますでお話しします。今日の倫理: ${lesson.ja}`,
    en: `Hello. I'm UBI — trained each day for ethical conversation, not just app help. Today's lesson: ${lesson.en}`,
    fr: `Bonjour. Je suis UBI. Conversation éthique, pas seulement l'aide. Leçon du jour : ${lesson.en}`,
  });
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [source, setSource] = useState<"live" | "corpus" | null>(null);
  const [messages, setMessages] = useState<ChatTurn[]>([{ role: "bot", text: hello }]);
  const [speaking, setSpeaking] = useState(false);
  const lock = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const chips = useMemo(() => {
    const today = ETHICS_PROMPTS.find((p) => p.id === lesson.id);
    const rest = ETHICS_PROMPTS.filter((p) => p.id !== lesson.id).slice(0, 2);
    return today ? [today, ...rest] : rest;
  }, [lesson.id]);

  const stopAll = () => {
    stopSpeak();
    audioRef.current?.pause();
    audioRef.current = null;
    setSpeaking(false);
  };

  const readAloud = async (text: string) => {
    if (speaking) {
      stopAll();
      return;
    }
    setSpeaking(true);
    try {
      const res = await speakFolk({ data: { text, lang } });
      if (res.ok) {
        const audio = new Audio(`data:audio/mpeg;base64,${res.b64}`);
        audioRef.current = audio;
        audio.onended = () => setSpeaking(false);
        await audio.play();
        return;
      }
    } catch {
      /* fall through */
    }
    speakLocal(text, lang);
    window.setTimeout(() => setSpeaking(false), Math.min(20_000, text.length * 80));
  };

  const send = async (raw?: string) => {
    const q = (raw ?? input).trim();
    if (!q || lock.current) return;
    lock.current = true;
    setPending(true);
    setInput("");
    const history = messages.slice(-6);
    setMessages((m) => [...m, { role: "me", text: q }]);
    try {
      const result = await askGuide({
        data: {
          question: q,
          history,
          lang,
          cycle: learn.cycle,
          day: learn.day,
        },
      });
      const text = result.ok
        ? result.text
        : west
          ? "I could not answer just now. Ask again in a moment."
          : "今は答えを返せませんでした。少ししてからもう一度聞いてください。";
      if (result.ok) setSource(result.source);
      setMessages((m) => [...m, { role: "bot", text }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: west
            ? "I could not reach the learned model. Ask again in a moment."
            : "学習モデルに届きませんでした。少ししてからもう一度聞いてください。",
        },
      ]);
    } finally {
      lock.current = false;
      setPending(false);
    }
  };

  const lastBot = [...messages].reverse().find((m) => m.role === "bot")?.text ?? hello;

  return (
    <div className="flex h-full min-h-0 flex-col font-mono">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-2 text-[10px] tracking-[0.2em] text-muted">
          <span>AI GUIDE · ETHICS</span>
          <span className="text-accent">
            {west ? `CYCLE ${learn.cycle} TRAINED` : `サイクル ${learn.cycle} 学習済`}
            {source === "live" ? (west ? " · LIVE" : " · 接続") : source === "corpus" ? (west ? " · CORPUS" : " · コーパス") : ""}
          </span>
        </div>
        <h1 className="text-xl font-semibold text-fg">
          {tx(lang, { ja: "AIガイドのUBI — 倫理会話", en: "UBI — ethical guide", fr: "UBI — guide éthique" })}
        </h1>
        <p className="mt-1 text-[11px] leading-relaxed text-dim">{west ? lesson.en : lesson.ja}</p>
        <p className="mt-1 text-[10px] text-muted">
          {tx(lang, {
            ja: "読み上げはタップしたときだけ。SiriのAPIは使いません。Web Speech または xAI TTS です。",
            en: "Read-aloud starts only when you tap. No Siri API — Web Speech or xAI TTS.",
            fr: "La lecture commence au tap. Pas d'API Siri — Web Speech ou TTS xAI.",
          })}
        </p>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={`${m.role}-${i}`}
            className={`max-w-[36rem] whitespace-pre-wrap rounded-md px-3 py-2 text-[13px] leading-relaxed ${
              m.role === "bot" ? "border border-border bg-surface text-fg" : "ml-auto bg-accent/15 text-accent"
            }`}
          >
            {m.text}
          </div>
        ))}
        {pending ? (
          <div className="max-w-[36rem] rounded-md border border-border bg-surface px-3 py-2 text-[12px] text-muted">
            {west ? "Thinking with today's ethics lesson…" : "今日の倫理レッスンで考えています…"}
          </div>
        ) : null}
      </div>
      <div className="flex gap-2 overflow-x-auto border-t border-border px-3 pt-2">
        <button
          type="button"
          onClick={() => void readAloud(lastBot)}
          className="grid size-11 shrink-0 place-items-center rounded-md border border-border bg-panel text-accent"
          aria-label={speaking ? "stop" : "read aloud"}
        >
          {speaking ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            disabled={pending}
            onClick={() => void send(west ? chip.en : chip.ja)}
            className="h-11 shrink-0 rounded-md border border-border bg-panel px-3 text-[11px] text-dim hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {west ? chip.en : chip.ja}
          </button>
        ))}
      </div>
      <form
        className="flex gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={pending}
          placeholder={tx(lang, { ja: "倫理や道徳について聞く…", en: "Ask a moral question…", fr: "Une question morale…" })}
          className="h-11 flex-1 rounded-md border border-border bg-panel px-3 text-[13px] text-fg outline-none placeholder:text-muted focus:border-accent disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="grid size-11 place-items-center rounded-md bg-accent text-bg disabled:opacity-50"
          aria-label="send"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}