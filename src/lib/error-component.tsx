import type { ErrorComponentProps } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { recordAndHeal, type HealReport } from "@/lib/ubi/heal";

export function AppErrorComponent({ error, reset }: ErrorComponentProps) {
  const [report, setReport] = useState<HealReport | null>(null);

  useEffect(() => {
    const next = recordAndHeal(error);
    setReport(next);
    if (next.reload) {
      const id = window.setTimeout(() => window.location.reload(), 400);
      return () => window.clearTimeout(id);
    }
  }, [error]);

  const title = report?.fixed ? "自動修復しました" : "エラーを学習しました";
  const body = report?.ja ?? (error instanceof Error ? error.message : "予期しないエラーです。");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg">
      <span className={report?.fixed ? "text-ok" : "text-danger"} aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="font-mono text-lg font-semibold">{title}</h1>
      <p className="max-w-md font-mono text-sm break-words text-muted">{body}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-2 h-11 rounded-md bg-accent px-4 font-mono text-[12px] font-semibold text-bg"
      >
        再試行
      </button>
    </main>
  );
}
