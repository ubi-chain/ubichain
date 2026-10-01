import { smsComposeUrl, toE164 } from "./sms";

export const III_FOUNDED = "2026";

export const TIMELINE = [
  {
    year: "1846-02",
    ja: "パリ共産主義者通信委員会。ブリュッセルを拠点に、フランス政府も読める通信として開く。",
    en: "Communist Correspondence Committee, Paris/Brussels. Opened so the French government can read it.",
    fr: "Comité de correspondance communiste (Paris/Bruxelles). Ouvert pour que le gouvernement français puisse le lire.",
  },
  {
    year: "1864–1876",
    ja: "第一インターナショナル（国際労働者協会）結成。",
    en: "First International (IWA) founded.",
    fr: "Première Internationale (AIT) fondée.",
  },
  {
    year: "1889–1914",
    ja: "第二インターナショナル結成。",
    en: "Second International founded.",
    fr: "Deuxième Internationale fondée.",
  },
  {
    year: "1919–1943",
    ja: "歴史上の第三インターナショナル（コミンテルン）。2026の結成はその再構成であり、1919を消さない。",
    en: "Historical Third International (Comintern). The 2026 founding is a reconstitution — it does not erase 1919.",
    fr: "Troisième Internationale historique (Komintern). 2026 est une reconstitution, pas un effacement de 1919.",
  },
  {
    year: "2026",
    ja: "第三インターナショナル再結成。新インターナショナルの公約は共栄科学社会主義。UBICHAINは国民所得保障の章を運用する。",
    en: "2026 Third International reconstituted. The New International's program is co-prosperity scientific socialism. UBICHAIN is the income-guarantee chapter in operation.",
    fr: "2026 Troisième Internationale reconstituée. Le programme de la Nouvelle Internationale est le socialisme scientifique de coprospérité.",
  },
] as const;

export const LAW_ARTICLES = [
  {
    id: "1",
    ja: "法は国家の内部で終わるものではない。人が国境をまたいでも尊厳の最低線は続く。",
    en: "Law does not end at the state. A floor of dignity follows the person across borders.",
    fr: "Le droit ne s'arrête pas à l'État. Un plancher de dignité suit la personne au-delà des frontières.",
  },
  {
    id: "2",
    ja: "国家は倫理的理念の現実である（ヘーゲル）。国際法はその現実が衝突したときに、人を目的として残すための約束である。",
    en: "The state is the actuality of the ethical idea (Hegel). International law is the promise that, when those actualities collide, the person remains an end.",
    fr: "L'État est l'effectivité de l'idée éthique (Hegel). Le droit international promet que, lorsque ces effectivités s'entrechoquent, la personne reste une fin.",
  },
  {
    id: "3",
    ja: "戦争・紛争・災害の法域では、倒産しうる公社・公司・委員会の資本を、先に人へ返す。",
    en: "In jurisdictions of war, conflict, or disaster, capital sitting in insolvent public corps, companies, and committees returns to people first.",
    fr: "En guerre, conflit ou désastre, le capital des corps publics, sociétés et comités insolvables revient d'abord aux personnes.",
  },
  {
    id: "4",
    ja: "先天も後天も、障害の有無は例外ではなく定番である。共同体リスクのある人への福祉送金を厚くする。",
    en: "Disability — congenital or acquired — is ordinary, not an exception. Welfare remittances thicken for people carrying community risk.",
    fr: "Le handicap — congénital ou acquis — est ordinaire, pas une exception. Les virements sociaux s'épaississent pour le risque communautaire.",
  },
] as const;

/** Public-domain English (1888 Moore) + original Japanese paraphrase — not a copyrighted translation. */
export const MANIFESTO_SMS = {
  ja: "【新インターナショナル公約】共栄科学社会主義。自由・民主主義・法の支配・尊厳・連帯。国民所得保障は段階的に。憲章を読む。",
  en: "[New International program] Co-prosperity scientific socialism. Freedom, democracy, rule of law, dignity, solidarity. Income guarantee by steps. Read the charter.",
  fr: "[Programme Nouvelle Internationale] Socialisme scientifique de coprospérité. Liberté, démocratie, État de droit, dignité, solidarité. Lisez la charte.",
};

export function manifestoSmsHref(phone: string, lang: "ja" | "en" | "fr") {
  const e164 = toE164(phone);
  if (!e164) return null;
  const body = lang === "fr" ? MANIFESTO_SMS.fr : lang === "en" ? MANIFESTO_SMS.en : MANIFESTO_SMS.ja;
  return smsComposeUrl(e164, body);
}

export const SKIPPED_PRIVATE = [
  { ja: "NHKへの連絡", en: "Contacting NHK" },
  { ja: "衆議院・参議院への連絡", en: "Contacting the Diet" },
  { ja: "JR・ANAへの連絡", en: "Contacting JR / ANA" },
  { ja: "在日大使・個人への連絡", en: "Contacting ambassadors or private persons" },
  { ja: "私的な移動・外交の予定", en: "Private travel and diplomacy" },
] as const;

export const APPLIED_TASKS = [
  { ja: "新インターナショナル公約（前文・十五章・終章）", en: "New International program (preamble, 15 chapters, close)" },
  { ja: "公約SMS（宣言の応用）", en: "Pledge SMS from the Manifesto" },
  { ja: "Kindle風・国際共産図書公司", en: "Kindle-style library company" },
  { ja: "法と国家から国際法", en: "International law from right and state" },
  { ja: "OZワールド（広場・村・Pico・軌道、夜間メンテ）", en: "OZ world (plaza, village, Pico, orbit, nightly repair)" },
  { ja: "社会課題の委員会放送", en: "Committee broadcast on social issues" },
  { ja: "家計チャートと赤字回避学習", en: "Living-cost chart + deficit learning" },
  { ja: "フランス語、敬語AI、フォークボイス", en: "French, honorific AI, folk voice" },
  { ja: "花札・トランプ、航空パス（アプリ内）", en: "Hanafuda, cards, in-app air pass" },
  { ja: "02の模様替え（テーブル・ランプ・本棚・観葉・ラジオ）", en: "02 redecoration (table, lamp, shelf, plant, radio)" },
  { ja: "先天・後天の福祉は定番。ケアは切らない", en: "Congenital/acquired welfare is ordinary. Care is never cut" },
] as const;
