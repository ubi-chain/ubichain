export type NewsItem = {
  id: number;
  title: string;
  titleJa: string;
  region: string;
  regionEn: string;
  flag: string;
  category: "UBI" | "IWA" | "経済" | "AML";
  summary: string;
  summaryJa: string;
  time: string;
  urgent?: boolean;
};

export const NEWS: NewsItem[] = [
  {
    id: 15,
    title: "Variable-rate mortgage relief books the payment gap on the in-app ledger",
    titleJa: "変動金利の返済増は台帳の救済枠で埋める。実借入はしない",
    region: "仙台",
    regionEn: "Sendai",
    flag: "JP",
    category: "IWA",
    summary:
      "The relief desk prices a rate shock and covers the monthly gap from the reserve ledger. It does not originate a loan or move a bank account.",
    summaryJa:
      "救済デスクは金利ショックの月額差を準備金台帳から埋める。貸付も実口座の移動もしない。",
    time: "いま",
    urgent: true,
  },
  {
    id: 14,
    title: "ubi-chain.com verify is stuck pending — name is NXDOMAIN",
    titleJa: "ubi-chain.com の検証保留は未登録が原因。待っても終わらない",
    region: "仙台",
    regionEn: "Sendai",
    flag: "JP",
    category: "経済",
    summary:
      "Vercel is waiting for TXT _vercel.ubi-chain.com. The .com is unregistered (Google DNS Status 3). Refresh will not validate it. Buy (~$11.25/yr) or drop the domain and use ubi-chain.github.io.",
    summaryJa:
      "Vercel は TXT _vercel.ubi-chain.com を待っている。この .com は未登録（Google DNS Status 3）。Refresh しても Valid にならない。買う（約 $11.25/年）か、ドメインを外して ubi-chain.github.io を使う。",
    time: "いま",
    urgent: true,
  },
  {
    id: 13,
    title: "02 rooms redecorate — welfare floor stays ordinary",
    titleJa: "02は模様替え可能。先天・後天の福祉は定番として残す",
    region: "ブリュッセル",
    regionEn: "Brussels",
    flag: "BE",
    category: "IWA",
    summary:
      "The 2026 reconstitution does not erase 1919. 02 is a 2D room you can furnish. Household learning never cuts care — congenital or acquired.",
    summaryJa:
      "2026の再構成は1919を消さない。02は家具を置ける2D部屋。家計学習はケアを切らない。先天も後天も定番。",
    time: "いま",
    urgent: true,
  },
  {
    id: 12,
    title: "Free hostname live — ubichain.is-a.dev CNAMEs to Vercel",
    titleJa: "無料ホスト公開 — ubichain.is-a.dev を Vercel に接続",
    region: "仙台",
    regionEn: "Sendai",
    flag: "JP",
    category: "経済",
    summary:
      "ubi-chain.com is still NXDOMAIN (a paid gTLD). Free host ubi-chain.github.io is live. ubichain.is-a.dev is queued with CNAME cname.vercel-dns.com.",
    summaryJa:
      "ubi-chain.com は未登録（有料gTLD）のまま。無料ホスト ubi-chain.github.io は公開済み。ubichain.is-a.dev は CNAME cname.vercel-dns.com で Vercel 接続を申請中。",
    time: "いま",
    urgent: true,
  },
  {
    id: 11,
    title: "Megabanks Added to Intake — Insolvency Is Not Regional-Only",
    titleJa: "メガバンクも入金対象に — 倒産は地方銀行に限らない",
    region: "東京",
    regionEn: "Tokyo",
    flag: "JP",
    category: "経済",
    summary:
      "MUFG, SMBC, Mizuho, JPMorgan, ICBC and other SIFIs now deposit into the stability guarantee. Lehman, SVB and Credit Suisse showed megabanks fail too. Funds already in the reserve survive a mega collapse.",
    summaryJa:
      "三菱UFJ・三井住友・みずほ、JPモルガン、工商銀行などSIFIも安定保障の入金対象へ。リーマン、SVB、クレディスイスはメガバンクも倒産することを示した。準備金へ移した資金はメガが倒れても残る。",
    time: "いま",
    urgent: true,
  },
  {
    id: 10,
    title: "ubi-chain.com Zone Written to Domain DNS Database",
    titleJa: "ubi-chain.com、ドメインDNSデータベースへゾーン書き込み",
    region: "北本",
    regionEn: "Kitamoto",
    flag: "JP",
    category: "経済",
    summary:
      "The production zone for ubi-chain.com is now authored in the domain DNS database: apex A 10.0.1.2, Vercel nameservers, and CNAME aliases for Pay, Banks, and the PWA.",
    summaryJa:
      "ubi-chain.com の本番ゾーンをドメインDNSデータベースへ書き込み。apex A 10.0.1.2、Vercel ネームサーバー、Pay / 入金 / PWA の CNAME を収録。",
    time: "12分前",
    urgent: true,
  },
  {
    id: 9,
    title: "Regional Banks Begin Deposits into the Stability Guarantee",
    titleJa: "各国地方銀行、安定保障準備金への入金を開始",
    region: "東京",
    regionEn: "Tokyo",
    flag: "JP",
    category: "経済",
    summary:
      "UBICHAIN opened intake from regional banks in 26 countries. Capital remains in the banking system; deposits fund the public reserve that pays UBI and buffers inequality shocks.",
    summaryJa:
      "UBICHAINが26カ国の地方銀行からの入金受付を開始。資本は銀行に残したまま、入金が公共の安定保障準備金となりUBI支給と格差ショックの緩衝に充てられる。",
    time: "38分前",
  },
  {
    id: 1,
    title: "Brazil Implements UBI for 50M Citizens",
    titleJa: "ブラジル、5000万人にUBI導入を開始",
    region: "サンパウロ",
    regionEn: "São Paulo",
    flag: "BR",
    category: "UBI",
    summary:
      "The Brazilian government has rolled out universal basic income for its poorest 50 million citizens, marking the largest UBI implementation in Latin America.",
    summaryJa: "ブラジル政府がラテンアメリカ最大規模のUBI実施を開始。貧困層5000万人に月額支給。",
    time: "2時間前",
    urgent: true,
  },
  {
    id: 2,
    title: "IWA Global Summit: End of Stock Corporations Declared",
    titleJa: "IWA世界サミット: 株式会社廃止宣言",
    region: "ジュネーブ",
    regionEn: "Geneva",
    flag: "CH",
    category: "IWA",
    summary:
      "The International Workers' Association declared a global roadmap to convert all corporations to public entities, eliminating shareholder capitalism.",
    summaryJa: "国際労働者協会が株式会社を公社に転換するロードマップを発表。スタグフレーション防止策として提示。",
    time: "4時間前",
    urgent: true,
  },
  {
    id: 3,
    title: "India's UBI Pilot Reduces Poverty by 34%",
    titleJa: "インドのUBIパイロット、貧困を34%削減",
    region: "ムンバイ",
    regionEn: "Mumbai",
    flag: "IN",
    category: "経済",
    summary:
      "A two-year UBI pilot in Maharashtra has shown remarkable poverty reduction, validating the model for nationwide expansion.",
    summaryJa: "マハラシュトラ州の2年間のUBIパイロットプログラムが貧困率を34%削減。全国展開へ。",
    time: "6時間前",
  },
  {
    id: 4,
    title: "AI Detects ¥2.4T Money Laundering Network",
    titleJa: "AI、2.4兆円のマネーロンダリング網を検出",
    region: "東京",
    regionEn: "Tokyo",
    flag: "JP",
    category: "AML",
    summary:
      "UBICHAIN's AI monitoring system detected a complex money laundering network spanning 14 countries, involving shell companies.",
    summaryJa: "UBICHAINのAI監視システムが14カ国にまたがる2.4兆円規模のロンダリング組織を摘発。",
    time: "8時間前",
    urgent: true,
  },
  {
    id: 5,
    title: "Kenya's Mobile UBI Reaches 12M Rural Residents",
    titleJa: "ケニアのモバイルUBI、農村部1200万人に到達",
    region: "ナイロビ",
    regionEn: "Nairobi",
    flag: "KE",
    category: "UBI",
    summary:
      "Through mobile-first UBI distribution, Kenya has successfully reached remote communities previously excluded from formal banking.",
    summaryJa: "モバイルファーストのUBI配布で、ケニアの農村部1200万人が初めて経済支援を受けた。",
    time: "10時間前",
  },
  {
    id: 6,
    title: "Stagnation Crisis Prompts IWA to Accelerate Nationalization",
    titleJa: "スタグフレーション危機でIWAが国有化を加速",
    region: "ベルリン",
    regionEn: "Berlin",
    flag: "DE",
    category: "IWA",
    summary:
      "Global stagflation has prompted the IWA to accelerate its timeline for converting stock corporations to public entities.",
    summaryJa: "世界的スタグフレーションを受け、IWAが株式会社の公社化スケジュールを前倒し。",
    time: "12時間前",
  },
  {
    id: 7,
    title: "Bangladesh UBI Prevents 3M from Extreme Poverty",
    titleJa: "バングラデシュ、UBIで300万人の極貧を防止",
    region: "ダッカ",
    regionEn: "Dhaka",
    flag: "BD",
    category: "UBI",
    summary:
      "Bangladesh's emergency UBI program has prevented an estimated 3 million people from falling into extreme poverty this year.",
    summaryJa: "バングラデシュの緊急UBIプログラムが今年だけで300万人の極貧転落を防いだ。",
    time: "1日前",
  },
  {
    id: 8,
    title: "IWA: Megabank Failure Risk Forces Dual Intake",
    titleJa: "IWA、メガバンク倒産リスクを認め地方・メガ双方から入金",
    region: "ロンドン",
    regionEn: "London",
    flag: "GB",
    category: "IWA",
    summary:
      "The IWA confirmed the live mandate is an economic stability guarantee funded by regional-bank and megabank deposits. SIFI insolvency is on the watch list; retiring banks remains later.",
    summaryJa:
      "IWAは現行運用を、地方銀行とメガバンク双方からの入金による経済の安定保障と確認。SIFI倒産は監視対象。銀行廃止は将来の公約であり、いまの機能ではない。",
    time: "1日前",
  },
];

export const NEWS_FILTERS = ["全て", "UBI", "IWA", "経済", "AML"] as const;