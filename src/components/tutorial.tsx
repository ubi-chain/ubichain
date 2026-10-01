import { useState } from "react";
import { t, type Lang } from "@/lib/ubi/i18n";

const STEPS = [
  {
    ja: "ホームではリアルタイムの世界地図が表示されます。色は貧困指数、アークは UBI・労働・不審フローです。",
    en: "Home shows a live world map. Color is poverty; arcs are UBI, labor, and flagged flows.",
    zh: "首页显示实时世界地图。颜色代表贫困指数，弧线是 UBI、劳动与可疑资金流。",
  },
  {
    ja: "登録は電話番号から。資本はまだ銀行に集中しており、メガバンクも倒産するので、地方銀行とメガバンクの両方から安定保障へ入金します。銀行廃止ではなく、いまは経済の安定保障です。",
    en: "Register by phone. Capital still sits in banks — megabanks can fail too — so you deposit from regional banks and megabanks into the stability guarantee. Not bank abolition — stability, now.",
    zh: "先用电话注册。资本仍集中在银行，大型银行也会破产，因此地方银行与大型银行都向稳定保障准备金入金。现在不是废除银行，而是经济稳定保障。",
  },
  {
    ja: "Pay では QR・バーコード・タッチ決済が使えます。残高は UBI から自動引き落としです。",
    en: "Pay supports QR, barcode, and tap-to-pay. Charges draw from your UBI balance.",
    zh: "支付页支持二维码、条码和触控支付。费用从 UBI 余额自动扣除。",
  },
  {
    ja: "iPhone では Safari の共有 → ホーム画面に追加で、純正アプリと同じ全画面になります。準備ができました。各ページはナビから移動できます。",
    en: "On iPhone, Safari Share → Add to Home Screen opens UBICHAIN full-screen like a built-in app. Use the nav to move between pages.",
    zh: "在 iPhone 上，用 Safari 分享 → 添加到主屏幕，即可像原生应用一样全屏打开。请从导航切换页面。",
  },
];

export function Tutorial({ lang, onDone }: { lang: Lang; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const copy = STEPS[step];
  const body = lang === "en" ? copy.en : lang === "zh" ? copy.zh : copy.ja;
  const last = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-bg/75 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-5 font-mono shadow-[0_0_40px_rgba(0,212,255,0.08)]">
        <div className="mb-1 text-[10px] tracking-[0.25em] text-accent">UBICHAIN / GUIDE</div>
        <h2 className="mb-3 text-lg font-semibold text-fg">{t(lang, "tutorial_title")}</h2>
        {step === 0 ? <p className="mb-3 text-[12px] text-dim">{t(lang, "tutorial_ai")}</p> : null}
        <p className="min-h-16 text-[13px] leading-relaxed text-fg">{body}</p>
        <div className="mt-5 flex items-center gap-2">
          <div className="flex flex-1 gap-1">
            {STEPS.map((_, i) => (
              <i key={i} className={`h-0.5 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-border"}`} />
            ))}
          </div>
          <button type="button" onClick={onDone} className="px-2 text-[11px] text-muted hover:text-fg">
            {t(lang, "skip")}
          </button>
          <button
            type="button"
            onClick={() => (last ? onDone() : setStep((s) => s + 1))}
            className="rounded-md bg-accent px-4 py-2 text-[12px] font-semibold text-bg"
          >
            {last ? t(lang, "start") : t(lang, "next")}
          </button>
        </div>
      </div>
    </div>
  );
}
