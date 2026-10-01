export type Segment = {
  id: string;
  topicJa: string;
  topicEn: string;
  topicFr: string;
  ja: string;
  en: string;
  fr: string;
};

export const SEGMENTS: Segment[] = [
  {
    id: "poverty",
    topicJa: "貧困は制度の失敗",
    topicEn: "Poverty is institutional",
    topicFr: "La pauvreté est institutionnelle",
    ja: "通信委員会より。貧困を個人の怠惰に還元しません。保障準備金は、集中した銀行資本の衝撃を公共で受けます。",
    en: "From the Correspondence Committee. Poverty is not laziness. The reserve takes the shock of concentrated bank capital in public.",
    fr: "Comité de correspondance. La pauvreté n'est pas de la paresse. La réserve porte en public le choc du capital bancaire concentré.",
  },
  {
    id: "care",
    topicJa: "先天・後天の福祉",
    topicEn: "Congenital and acquired care",
    topicFr: "Soin congénital et acquis",
    ja: "障害の有無は定番です。先天候も後天候も、共同体リスクのある人への福祉送金を厚くします。",
    en: "Disability is ordinary. Congenital or acquired, remittances thicken for people carrying community risk.",
    fr: "Le handicap est ordinaire. Congénital ou acquis, les virements s'épaississent pour le risque communautaire.",
  },
  {
    id: "letters",
    topicJa: "文芸学を培う",
    topicEn: "Cultivate letters",
    topicFr: "Cultiver les lettres",
    ja: "全人類が文芸を培う。図書公司はマルクス、エンゲルス、ヘーゲルと親友の書を、所有のトロフィーではなく読むものとして置きます。",
    en: "All humanity cultivates letters. The library company keeps Marx, Engels, Hegel and friends as things to read, not trophies.",
    fr: "L'humanité cultive les lettres. La maison garde Marx, Engels, Hegel comme lectures, non comme trophées.",
  },
  {
    id: "banks",
    topicJa: "メガバンクも倒産する",
    topicEn: "Megabanks fail too",
    topicFr: "Les mégabanques font aussi faillite",
    ja: "地方銀行もメガバンクも、保障準備金へ入金します。倒産のとき残るのは、先に公共へ移した資金です。",
    en: "Regional banks and megabanks both deposit into the reserve. What survives failure is what was already moved into public hands.",
    fr: "Banques régionales et mégabanques versent dans la réserve. Ce qui survit, c'est ce qui était déjà public.",
  },
  {
    id: "law",
    topicJa: "国際法の樹立",
    topicEn: "Founding international law",
    topicFr: "Fonder le droit international",
    ja: "法と国家から国際法を樹立する。人を目的として残す。緊急支援・災害対応を先にする。",
    en: "From right and the state, international law. The person remains an end. Emergency and disaster support come first.",
    fr: "Du droit et de l'État, le droit international. La personne reste une fin. Le soutien d'urgence et la réponse aux catastrophes d'abord.",
  },
];

export function segmentAt(now = Date.now()) {
  const i = Math.floor(now / 40_000) % SEGMENTS.length;
  const next = 40_000 - (now % 40_000);
  return { seg: SEGMENTS[i]!, index: i, next };
}
