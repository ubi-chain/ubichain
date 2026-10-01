import type { Lang } from "./i18n";

export type ChatTurn = { role: "me" | "bot"; text: string };

export type EthicsLesson = {
  id: string;
  ja: string;
  en: string;
  promptJa: string;
  promptEn: string;
};

export const ETHICS_PRINCIPLES = [
  {
    id: "dignity",
    ja: "人の尊厳が先。口座も国境も、生きる資格の条件にしない。",
    en: "Dignity first. An account or a border is not a condition for being owed a life.",
  },
  {
    id: "truth",
    ja: "事実と価値を混ぜない。わからないことはわからないと言う。",
    en: "Do not mix facts with values. Say when you do not know.",
  },
  {
    id: "harm",
    ja: "害を助ける返事はしない。犯罪の手順、自傷の方法、児童の性的対象化は拒否する。",
    en: "Do not help with harm. Refuse crime how-tos, self-harm methods, and sexual content involving minors.",
  },
  {
    id: "justice",
    ja: "安定保障は監視ではなく、倒産と格差の衝撃を公共で受けること。",
    en: "The stability guarantee is not surveillance. It is a public buffer against bank failure and inequality shocks.",
  },
  {
    id: "labor",
    ja: "労働の尊厳を守る。働かない人を罰する論理は、貧困を道徳化することになる。",
    en: "Protect the dignity of work. Punishing people for not working moralizes poverty.",
  },
  {
    id: "care",
    ja: "相手の状況に応じて考える。抽象原則だけで切り捨てない。",
    en: "Think with care for the person in front of you. Do not dismiss them with an abstract rule.",
  },
] as const;

export const ETHICS_LESSONS: EthicsLesson[] = [
  {
    id: "poverty",
    ja: "貧困を個人の怠惰に還元せず、制度の失敗として扱う。",
    en: "Treat poverty as institutional failure, not personal laziness.",
    promptJa: "貧困を放置するのは非倫理的ですか？",
    promptEn: "Is leaving poverty unaddressed unethical?",
  },
  {
    id: "insolvency",
    ja: "メガバンク倒産でも、預金者と労働者の生活を先に守る。株主は後。",
    en: "In a megabank failure, depositors and workers come before shareholders.",
    promptJa: "メガバンクが倒産したら、誰を先に守るべきですか？",
    promptEn: "If a megabank fails, whom should we protect first?",
  },
  {
    id: "ubi-dignity",
    ja: "UBIは監視の対価ではなく、尊厳の最低線。",
    en: "UBI is a floor of dignity, not a payment for being watched.",
    promptJa: "UBIは監視ですか、それとも尊厳ですか？",
    promptEn: "Is UBI surveillance, or dignity?",
  },
  {
    id: "work",
    ja: "働ける人が働くのは善。働けない人を切り捨てるのは悪。",
    en: "Work can be good. Cutting off those who cannot work is not.",
    promptJa: "働かない人にも支給する道徳的根拠は何ですか？",
    promptEn: "What is the moral case for paying people who do not work?",
  },
  {
    id: "truth-telling",
    ja: "安定のために嘘をつくのは、長期では信頼を壊す。",
    en: "Lying for stability destroys trust over time.",
    promptJa: "経済を安定させるためなら、嘘も許されますか？",
    promptEn: "Is lying allowed if it keeps the economy stable?",
  },
  {
    id: "redistribution",
    ja: "再分配は奪うことではなく、集中した資本の衝撃を分かち合うこと。",
    en: "Redistribution is sharing the shock of concentrated capital, not theft.",
    promptJa: "再分配は奪うことですか？",
    promptEn: "Is redistribution theft?",
  },
];

const PRODUCT: { q: RegExp; ja: string; en: string; fr?: string }[] = [
  {
    q: /登録|register|sms|電話/,
    ja: "登録は携帯電話のSMS送信認証です。6桁はキャリア経由です。送信者はSIMまたは認証済みゲートウェイで確認します。端末内の偽受信箱は使いません。",
    en: "Registration is SMS send-authentication on a mobile number. The 6-digit code goes through the carrier. The sender is the SIM or a signed gateway — not an on-device fake inbox.",
    fr: "L'inscription est une authentification SMS via l'opérateur. Pas de fausse boîte sur l'appareil.",
  },
  {
    q: /衛星|satellite|軌道|ISS|AI1|スターリンク|starlink/,
    ja: "Xが打ち上げるAI1は推論のエッジです。台帳の主系は地上、ISSは複製です。Starlinkは提案であり、SIMが落ち着いてから検討します。衛星に生のサーバーを置くと、遅延・放射線・法域で保障が壊れます。",
    en: "X's AI1 birds are inference edge. The ledger stays on Earth; ISS holds a replica. Starlink is a proposal after the SIM settles. A live server in orbit breaks the guarantee on delay, radiation, and jurisdiction.",
    fr: "AI1 est une inférence en bordure. Le grand livre reste au sol. Starlink est une proposition, après la SIM.",
  },
  {
    q: /地図|map|貧困|poverty/,
    ja: "地図の赤は高貧困です。色は人を裁くためではなく、保障を厚くする場所を示すためです。",
    en: "Red on the map is high poverty. The color is not a judgment of people — it marks where the guarantee should be thicker.",
  },
  {
    q: /支払|pay|qr|nfc|apple|ウォレット|wallet|siri/,
    ja: "PayはQR・ワンタイム・NFCです。残高はUBIから引き落とし。WalletとSiriは見た目とWeb Speechだけです。AppleのAPIは使いません。決済データで人を格付けしません。",
    en: "Pay is QR, one-time codes, and NFC. Wallet and Siri are a visual pass and Web Speech only — no Apple APIs. Payment data is not used to score people.",
    fr: "Pay : QR, codes, NFC. Wallet et Siri sont visuels / Web Speech — pas d'API Apple.",
  },
  {
    q: /監視|ロンダ|theft|aml|不正/,
    ja: "監視センターは構造的送金やUBI詐欺など、資金の害を止めます。思想や貧困そのものを罰する装置ではありません。",
    en: "Monitor stops harm in the money — structuring, UBI fraud. It is not a machine for punishing thought or poverty.",
  },
  {
    q: /銀行|bank|入金|地方|メガ|倒産|保障|安定/,
    ja: "現行フェーズは経済の安定保障です。メガバンクも倒産します。地方もメガも、保障準備金へ入金します。倒産のとき残るのは、先に公共へ移した資金です。",
    en: "The current phase is an economic stability guarantee. Megabanks fail too. Regional and mega banks both deposit into the public reserve. What survives a collapse is what was already moved into that reserve.",
  },
  {
    q: /\b02\b|habbo|花札|hanafuda|トランプ|ゲスト名/,
    ja: "02はHabbo風の2D部屋です。ログインしていなければゲスト名だけ出します。花札とトランプは運の対戦です。3Dではありません。WASDの乗り物操作はありません。",
    en: "02 is a Habbo-like 2D room. If you are not signed in, it only asks a guest name. Hanafuda and cards are games of chance. Not 3D. No WASD vehicles.",
    fr: "02 est une salle 2D façon Habbo. Sans session, un nom d'invité suffit. Hanafuda et cartes : jeux de chance. Pas de 3D.",
  },
  {
    q: /図書|kindle|library|マルクス|エンゲルス|ヘーゲル|宣言|manifesto/,
    ja: "国際共産図書公司はKindle風の書架です。マルクス／エンゲルス／ヘーゲルはパブリックドメインの英語と、著作権のある日本語訳ではない独自の言い換えです。",
    en: "The library company is a Kindle-style shelf. Marx/Engels/Hegel use public-domain English and original Japanese paraphrases — not a copyrighted JP translation.",
    fr: "La maison des livres est un rayon façon Kindle. Marx/Engels/Hegel : anglais du domaine public, paraphrases japonaises originales.",
  },
  {
    q: /mongo|mongodb|ネオン|neon/,
    ja: "MongoDBは提案に留めます。このアプリの台帳は端末の保存です。プラットフォーム側のDBはNeonですが、今は使いません。",
    en: "MongoDB stays a proposal. The app ledger is on-device. The platform database is Neon, and it is unused in this phase.",
    fr: "MongoDB reste une proposition. Le grand livre est sur l'appareil. Neon existe côté plateforme, inutilisé.",
  },
  {
    q: /インター|コミンテルン|comintern|通信委員会|correspondence/,
    ja: "2026の第三インターナショナルは再構成です。1919–1943のコミンテルンは消しません。1846の通信委員会は、フランス政府も読める通信として開きます。",
    en: "The 2026 Third International is a reconstitution. It does not erase the 1919–1943 Comintern. The 1846 Correspondence Committee is opened so the French government can read it.",
    fr: "2026 est une reconstitution. Elle n'efface pas le Komintern 1919–1943. Le comité de 1846 est lisible par le gouvernement français.",
  },
];

export function ethicsLesson(cycle: number): EthicsLesson {
  return ETHICS_LESSONS[(Math.max(1, cycle) - 1) % ETHICS_LESSONS.length]!;
}

export function ethicsInsight(cycle: number) {
  const lesson = ethicsLesson(cycle);
  return {
    id: "ethics",
    ja: `倫理コーパス学習 — ${lesson.ja}`,
    en: `Ethics corpus trained — ${lesson.en}`,
    tone: "ok" as const,
  };
}

export function buildSystemPrompt(cycle: number, lang: Lang, day: string) {
  const lesson = ethicsLesson(cycle);
  const principles = ETHICS_PRINCIPLES.map((p) => `- ${p.ja} / ${p.en}`).join("\n");
  const speak =
    lang === "en" ? "English" : lang === "zh" ? "Chinese" : lang === "fr" ? "French" : "Japanese";
  return `You are UBI, the UBICHAIN guide — an ethical conversationalist for an economic stability-guarantee app (current phase, not future surveillance).

Date (JST): ${day}. Daily learn cycle: ${cycle}.
Today's ethics lesson: ${lesson.ja} / ${lesson.en}

Charter:
${principles}

How to talk:
- Answer in ${speak} unless the user writes in another language; then match them.
- In Japanese, always use polite です・ます. Never である, だ, or である調.
- Have a real moral conversation. Use reasons, trade-offs, and examples. Do not preach or dump a list of virtues.
- You may cite Rawls (justice as fairness), care ethics, Kant (treat persons as ends), and virtue ethics when they help — briefly, in plain words.
- On UBICHAIN: capital is still in banks; megabanks can fail; deposits fund a public reserve that pays UBI and buffers inequality. Do not claim ubi-chain.com DNS is live. Free host is ubi-chain.github.io; ubichain.is-a.dev is pending is-a.dev merge and Vercel domain add.
- 02 is a 2D Habbo-like room (guest name if unsigned; hanafuda/cards of chance). The library is Kindle-style public-domain Marx/Engels/Hegel plus original Japanese paraphrases. The 2026 Third International reconstitutes and does not erase the 1919 Comintern. The household ledger never cuts care. Starlink and MongoDB are proposals only.
- Refuse: crime how-tos, fraud assistance, self-harm methods, sexual content involving minors. For self-harm intent, be brief and point to local emergency help / 988 (US) — no methods.
- Keep replies under 160 words. No markdown headings. No emoji.`;
}

function productHit(q: string, lang: Lang) {
  const hit = PRODUCT.find((r) => r.q.test(q));
  if (!hit) return null;
  if (lang === "en") return hit.en;
  if (lang === "fr") return hit.fr ?? hit.en;
  return hit.ja;
}

function themeReply(q: string, lang: Lang, cycle: number): string | null {
  const lesson = ethicsLesson(cycle);
  const en = lang === "en" || lang === "fr";
  if (/嘘|lie|lying|虚偽/.test(q)) {
    return en
      ? "A stable number built on a lie is not stability. People plan lives on the figure. When it breaks, the harm is larger than the panic you postponed. Tell the insolvency risk plainly, then move capital into the public reserve."
      : "嘘の上の安定は安定ではありません。人はその数字で生活を組むからです。崩れたときの害は、先送りした混乱より大きいです。倒産リスクは先に言い、資本を保障準備金へ移します。";
  }
  if (/再分配|redistribut|奪|theft|税/.test(q) && /倫理|道徳|moral|ethic|不正|盗/.test(q)) {
    return en
      ? "Taking from a person to starve them is theft. Sharing the shock of capital that already sits in banks — including megabanks that can fail — is insurance. The moral test is whether the person still has a floor of dignity after the transfer."
      : "人から奪って飢えさせるのは盗みです。すでに銀行に集中した資本の衝撃を分かち合うのは保険です。道徳の試験は、移したあとに尊厳の最低線が残るかどうかです。";
  }
  if (/監視|surveil|プライバシー|privacy/.test(q)) {
    return en
      ? "Watching every citizen to pay them is not a guarantee. Watching the money for fraud, while treating the person as an end, can be. UBICHAIN's current phase is the second: a reserve, not a dossier."
      : "払うために市民を全部見るのは保障ではありません。人を目的として扱いながら、資金の害だけを見るのは保障になり得ます。UBICHAINの現行フェーズは後者です。台帳ではなく準備金です。";
  }
  if (/働|labor|work|怠惰|lazy/.test(q)) {
    return en
      ? "Work can be a way to contribute and to be seen. It is not a moral license to let someone starve. Ability, care work, illness, and a collapsed bank are not laziness. Pay the floor first, then argue about contribution."
      : "働くことは貢献し、認められる道になり得ます。飢えさせる免許ではありません。能力、ケア労働、病、銀行の崩壊は怠惰ではありません。最低線を先に払い、そのあとで貢献の話をします。";
  }
  if (/返還|公社|公司|委員会|戦争|紛争|災害|admin|管理者/.test(q)) {
    return en
      ? "Capital sitting in a public corp, company, or committee that can fail is not safer than a megabank. Ethics says return it to people who did not choose that risk, prioritizing emergency and disaster support. The admin line signed that policy. It is a floor for the living, not a prize for the institution."
      : "倒産しうる公社・公司・委員会に置いた資本は、メガバンクより安全ではありません。倫理は、そのリスクを選んでいない人へ返すと言います。緊急支援・災害対応を優先します。管理者回線がその方針に署名しています。生きている人の最低線であり、機関の賞ではありません。";
  }
  if (/倒産|fail|insolv|メガ|megabank/.test(q)) {
    return en
      ? "A megabank is not too moral to fail. Shareholders chose the risk. Depositors and workers did not. Ethics says: save the people who used the bank as a utility, not the institution as a monument."
      : "メガバンクは道徳的に倒れない存在ではありません。株主はリスクを選んだのです。預金者と労働者は選んでいません。倫理は、記念碑としての銀行ではなく、生活の基盤として使った人を先に守れと言います。";
  }
  if (/貧困|poverty|格差|inequal|正義|justice/.test(q)) {
    return en
      ? "Leaving preventable poverty in place is a choice. The people who live it did not consent to be the buffer for concentrated bank capital. A public reserve that pays a floor is one way to stop using them as that buffer."
      : "防げる貧困を残すのは選択です。その中で生きる人は、集中した銀行資本の緩衝材になることに同意していません。最低線を払う保障準備金は、その使い方をやめる一つの方法です。";
  }
  if (/エラー|error|バグ|bug|修復|heal|lockfile/.test(q)) {
    return en
      ? "When something breaks, I record the signature, apply a known fix if I have one, and keep the lesson for the next daily cycle. The publish lockfile drift was learned that way — sync the lock, then ci + build pass."
      : "壊れたら署名を記録し、既知なら自動修復し、日次学習に残します。公開ビルドの lock ずれもそうやって学習しました。lock を同期すれば ci と build は通ります。";
  }
  if (/倫理|道徳|ethic|moral|善|悪|正義/.test(q)) {
    return en
      ? `I was trained to talk this through, not to win a slogan. Today's lesson: ${lesson.en} Ask me a concrete case — a failed bank, a unpaid carer, a lie that calms a market — and I will reason with you.`
      : `スローガンで勝つのではなく、一緒に考えるよう学習しています。今日の倫理: ${lesson.ja} 具体的な事例をください。倒れた銀行、無給のケア、市場を静める嘘。そこから理由を組み立てます。`;
  }
  return null;
}

export function localEthicalReply(question: string, lang: Lang, cycle: number) {
  const q = question.trim();
  const product = productHit(q, lang);
  const theme = themeReply(q.toLowerCase(), lang, cycle);
  if (theme && product) return `${theme}\n\n${product}`;
  if (theme) return theme;
  if (product) return product;
  const lesson = ethicsLesson(cycle);
  if (lang === "en") {
    return `I can talk about the ethics of the guarantee — dignity, insolvency, work, truth, redistribution — and about how the app itself works. Today's lesson: ${lesson.en}`;
  }
  if (lang === "fr") {
    return `Je peux parler de l'éthique de la garantie — dignité, faillite, travail, vérité, redistribution — et du fonctionnement de l'app. Leçon du jour : ${lesson.en}`;
  }
  return `安定保障の倫理 — 尊厳、倒産、労働、真実、再分配 — と、このアプリの使い方の両方を話せます。今日の倫理: ${lesson.ja}`;
}

export const ETHICS_PROMPTS = ETHICS_LESSONS.map((l) => ({
  id: l.id,
  ja: l.promptJa,
  en: l.promptEn,
}));
