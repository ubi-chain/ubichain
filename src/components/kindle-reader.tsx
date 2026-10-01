import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { BOOKS, type ShelfBook } from "@/lib/ubi/library";
import { tx, type Lang } from "@/lib/ubi/i18n";
import { speakFolk } from "@/lib/ubi/voice-fn";
import { speakLocal, stopSpeak } from "@/lib/ubi/voice";

export function KindleReader({ lang }: { lang: Lang }) {
  const [bookId, setBookId] = useState(BOOKS[0]!.id);
  const [page, setPage] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const book = BOOKS.find((b) => b.id === bookId) ?? BOOKS[0]!;
  const leaf = book.pages[Math.min(page, book.pages.length - 1)]!;
  const body = tx(lang, { ja: leaf.ja, en: leaf.en, fr: leaf.fr });
  const title = tx(lang, { ja: book.titleJa, en: book.titleEn, fr: book.titleFr });

  const note = tx(lang, { ja: book.noteJa, en: book.noteEn, fr: book.noteEn });

  const progress = useMemo(() => ((page + 1) / book.pages.length) * 100, [page, book.pages.length]);

  const openBook = (b: ShelfBook) => {
    stopAll();
    setBookId(b.id);
    setPage(0);
  };

  const stopAll = () => {
    stopSpeak();
    audioRef.current?.pause();
    audioRef.current = null;
    setSpeaking(false);
  };

  const readAloud = async () => {
    if (speaking) {
      stopAll();
      return;
    }
    setSpeaking(true);
    try {
      const res = await speakFolk({ data: { text: body, lang } });
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
    speakLocal(body, lang);
    window.setTimeout(() => setSpeaking(false), Math.min(20_000, body.length * 80));
  };

  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      <aside className="shrink-0 overflow-y-auto border-b border-border md:w-56 md:border-r md:border-b-0">
        <div className="px-3 py-2 font-mono text-[10px] tracking-[0.2em] text-muted">
          {tx(lang, { ja: "書架", en: "SHELF", fr: "RAYON" })}
        </div>
        {BOOKS.map((b) => {
          const active = b.id === book.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => openBook(b)}
              className={`block w-full border-l-2 px-3 py-2 text-left ${
                active ? "border-accent bg-accent/10 text-accent" : "border-transparent text-dim hover:text-fg"
              }`}
            >
              <div className="font-mono text-[12px] leading-snug">
                {tx(lang, { ja: b.titleJa, en: b.titleEn, fr: b.titleFr })}
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-muted">
                {tx(lang, { ja: b.authorJa, en: b.authorEn })} · {b.year}
              </div>
            </button>
          );
        })}
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-paper text-ink">
        <div className="flex items-center justify-between gap-2 border-b border-ink/15 px-4 py-2">
          <div>
            <div className="font-serif text-sm">{title}</div>
            <div className="font-mono text-[10px] text-ink/50">
              {tx(lang, { ja: book.authorJa, en: book.authorEn })} · {page + 1}/{book.pages.length}
            </div>
          </div>
          <button
            type="button"
            onClick={() => void readAloud()}
            className="grid size-11 place-items-center rounded-sm border border-ink/20 text-ink"
            aria-label={tx(lang, { ja: "読み上げ", en: "Read aloud", fr: "Lire" })}
          >
            {speaking ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
          <p className="mx-auto max-w-[36rem] font-serif text-[17px] leading-[1.7]">{body}</p>
          <p className="mx-auto mt-8 max-w-[36rem] font-mono text-[10px] leading-relaxed text-ink/45">{note}</p>
        </div>
        <div className="border-t border-ink/15 px-4 py-2">
          <div className="h-0.5 bg-ink/10">
            <div className="h-full bg-ink/60" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => {
                stopAll();
                setPage((p) => Math.max(0, p - 1));
              }}
              className="flex h-11 items-center gap-1 px-2 disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
              {tx(lang, { ja: "前のページ", en: "Prev", fr: "Préc." })}
            </button>
            <button
              type="button"
              disabled={page >= book.pages.length - 1}
              onClick={() => {
                stopAll();
                setPage((p) => Math.min(book.pages.length - 1, p + 1));
              }}
              className="flex h-11 items-center gap-1 px-2 disabled:opacity-30"
            >
              {tx(lang, { ja: "次のページ", en: "Next", fr: "Suiv." })}
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
