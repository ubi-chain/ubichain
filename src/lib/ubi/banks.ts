export type BankTier = "mega" | "regional";

export type RegionalBank = {
  id: string;
  nameJa: string;
  nameEn: string;
  regionJa: string;
  regionEn: string;
  tier?: BankTier;
  failRisk?: number;
};

export type BankCountry = {
  code: string;
  nameJa: string;
  nameEn: string;
  currency: string;
  capitalJpy: number;
  banks: RegionalBank[];
};

export const FX_JPY: Record<string, number> = {
  JPY: 1,
  USD: 148,
  EUR: 162,
  GBP: 198,
  CNY: 20.6,
  INR: 1.78,
  BRL: 26.4,
  KES: 1.15,
  NGN: 0.092,
  BDT: 1.22,
  MXN: 7.6,
  KRW: 0.108,
  RUB: 1.62,
  EGP: 3.05,
  ZAR: 8.3,
  THB: 4.35,
  AUD: 98,
  PKR: 0.53,
  CAD: 108,
  IDR: 0.0092,
  PHP: 2.58,
  VND: 0.0059,
  TRY: 4.35,
  COP: 0.036,
  TZS: 0.056,
  PLN: 40.5,
  SEK: 14.2,
  ARS: 0.14,
};

export const INITIAL_BANK_POOL = 12_480_000_000;

export const BANK_COUNTRIES: BankCountry[] = ([
  {
    code: "JP",
    nameJa: "日本",
    nameEn: "Japan",
    currency: "JPY",
    capitalJpy: 72_800_000_000_000,
    banks: [
      { id: "jp-mufg", nameJa: "三菱UFJ銀行", nameEn: "MUFG Bank", regionJa: "メガバンク / 東京", regionEn: "Megabank / Tokyo", tier: "mega", failRisk: 0.41 },
      { id: "jp-smbc", nameJa: "三井住友銀行", nameEn: "SMBC", regionJa: "メガバンク / 東京", regionEn: "Megabank / Tokyo", tier: "mega", failRisk: 0.39 },
      { id: "jp-mizuho", nameJa: "みずほ銀行", nameEn: "Mizuho Bank", regionJa: "メガバンク / 東京", regionEn: "Megabank / Tokyo", tier: "mega", failRisk: 0.47 },
      { id: "jp-resona", nameJa: "りそな銀行", nameEn: "Resona Bank", regionJa: "メガバンク / 大阪", regionEn: "Megabank / Osaka", tier: "mega", failRisk: 0.36 },
      { id: "jp-musashino", nameJa: "武蔵野銀行", nameEn: "Musashino Bank", regionJa: "埼玉", regionEn: "Saitama", failRisk: 0.19 },
      { id: "jp-saitama-resona", nameJa: "埼玉りそな銀行", nameEn: "Saitama Resona Bank", regionJa: "埼玉", regionEn: "Saitama", failRisk: 0.21 },
      { id: "jp-yokohama", nameJa: "横浜銀行", nameEn: "Bank of Yokohama", regionJa: "神奈川", regionEn: "Kanagawa", failRisk: 0.18 },
      { id: "jp-chiba", nameJa: "千葉銀行", nameEn: "Chiba Bank", regionJa: "千葉", regionEn: "Chiba", failRisk: 0.17 },
      { id: "jp-gunma", nameJa: "群馬銀行", nameEn: "Gunma Bank", regionJa: "群馬", regionEn: "Gunma", failRisk: 0.2 },
      { id: "jp-ashikaga", nameJa: "足利銀行", nameEn: "Ashikaga Bank", regionJa: "栃木", regionEn: "Tochigi", failRisk: 0.22 },
      { id: "jp-joyo", nameJa: "常陽銀行", nameEn: "Joyo Bank", regionJa: "茨城", regionEn: "Ibaraki", failRisk: 0.2 },
      { id: "jp-shizuoka", nameJa: "静岡銀行", nameEn: "Shizuoka Bank", regionJa: "静岡", regionEn: "Shizuoka", failRisk: 0.16 },
      { id: "jp-hokkaido", nameJa: "北海道銀行", nameEn: "Hokkaido Bank", regionJa: "北海道", regionEn: "Hokkaido", failRisk: 0.24 },
      { id: "jp-shiga", nameJa: "滋賀銀行", nameEn: "Shiga Bank", regionJa: "滋賀", regionEn: "Shiga", failRisk: 0.18 },
      { id: "jp-hiroshima", nameJa: "広島銀行", nameEn: "Hiroshima Bank", regionJa: "広島", regionEn: "Hiroshima", failRisk: 0.19 },
      { id: "jp-fukuoka", nameJa: "福岡銀行", nameEn: "Bank of Fukuoka", regionJa: "福岡", regionEn: "Fukuoka", failRisk: 0.17 },
      { id: "jp-kyoto", nameJa: "京都銀行", nameEn: "Bank of Kyoto", regionJa: "京都", regionEn: "Kyoto", failRisk: 0.15 },
      { id: "jp-iyo", nameJa: "伊予銀行", nameEn: "Iyo Bank", regionJa: "愛媛", regionEn: "Ehime", failRisk: 0.21 },
      { id: "jp-ryukyu", nameJa: "琉球銀行", nameEn: "Bank of the Ryukyus", regionJa: "沖縄", regionEn: "Okinawa", failRisk: 0.23 },
    ],
  },
  {
    code: "US",
    nameJa: "アメリカ",
    nameEn: "United States",
    currency: "USD",
    capitalJpy: 81_600_000_000_000,
    banks: [
      { id: "us-jpm", nameJa: "JPモルガン・チェース", nameEn: "JPMorgan Chase", regionJa: "メガバンク / NY", regionEn: "Megabank / NY", tier: "mega", failRisk: 0.38 },
      { id: "us-bofa", nameJa: "バンク・オブ・アメリカ", nameEn: "Bank of America", regionJa: "メガバンク / NC", regionEn: "Megabank / NC", tier: "mega", failRisk: 0.4 },
      { id: "us-citi", nameJa: "シティバンク", nameEn: "Citibank", regionJa: "メガバンク / NY", regionEn: "Megabank / NY", tier: "mega", failRisk: 0.44 },
      { id: "us-wells", nameJa: "ウェルズ・ファーゴ", nameEn: "Wells Fargo", regionJa: "メガバンク / CA", regionEn: "Megabank / CA", tier: "mega", failRisk: 0.43 },
      { id: "us-regions", nameJa: "Regions Bank", nameEn: "Regions Bank", regionJa: "南部", regionEn: "South", failRisk: 0.27 },
      { id: "us-fifth-third", nameJa: "Fifth Third Bank", nameEn: "Fifth Third Bank", regionJa: "中西部", regionEn: "Midwest", failRisk: 0.26 },
      { id: "us-huntington", nameJa: "Huntington", nameEn: "Huntington Bank", regionJa: "オハイオ", regionEn: "Ohio", failRisk: 0.25 },
      { id: "us-keybank", nameJa: "KeyBank", nameEn: "KeyBank", regionJa: "北東部", regionEn: "Northeast", failRisk: 0.28 },
      { id: "us-pnc", nameJa: "PNC Bank", nameEn: "PNC Bank", regionJa: "ペンシルベニア", regionEn: "Pennsylvania", failRisk: 0.24 },
      { id: "us-mt", nameJa: "M&T Bank", nameEn: "M&T Bank", regionJa: "ニューヨーク州", regionEn: "New York State", failRisk: 0.23 },
    ],
  },
  {
    code: "CN",
    nameJa: "中国",
    nameEn: "China",
    currency: "CNY",
    capitalJpy: 78_400_000_000_000,
    banks: [
      { id: "cn-icbc", nameJa: "中国工商銀行", nameEn: "ICBC", regionJa: "メガバンク / 北京", regionEn: "Megabank / Beijing", tier: "mega", failRisk: 0.37 },
      { id: "cn-ccb", nameJa: "中国建設銀行", nameEn: "CCB", regionJa: "メガバンク / 北京", regionEn: "Megabank / Beijing", tier: "mega", failRisk: 0.36 },
      { id: "cn-abc", nameJa: "中国農業銀行", nameEn: "ABC", regionJa: "メガバンク / 北京", regionEn: "Megabank / Beijing", tier: "mega", failRisk: 0.39 },
      { id: "cn-boc", nameJa: "中国銀行", nameEn: "Bank of China", regionJa: "メガバンク / 北京", regionEn: "Megabank / Beijing", tier: "mega", failRisk: 0.38 },
      { id: "cn-beijing", nameJa: "北京銀行", nameEn: "Bank of Beijing", regionJa: "北京", regionEn: "Beijing", failRisk: 0.22 },
      { id: "cn-shanghai", nameJa: "上海銀行", nameEn: "Bank of Shanghai", regionJa: "上海", regionEn: "Shanghai", failRisk: 0.21 },
      { id: "cn-jiangsu", nameJa: "江蘇銀行", nameEn: "Bank of Jiangsu", regionJa: "江蘇", regionEn: "Jiangsu", failRisk: 0.23 },
      { id: "cn-ningbo", nameJa: "寧波銀行", nameEn: "Bank of Ningbo", regionJa: "浙江", regionEn: "Zhejiang", failRisk: 0.2 },
    ],
  },
  {
    code: "GB",
    nameJa: "イギリス",
    nameEn: "United Kingdom",
    currency: "GBP",
    capitalJpy: 26_200_000_000_000,
    banks: [
      { id: "gb-hsbc", nameJa: "HSBC", nameEn: "HSBC", regionJa: "メガバンク / ロンドン", regionEn: "Megabank / London", tier: "mega", failRisk: 0.42 },
      { id: "gb-barclays", nameJa: "バークレイズ", nameEn: "Barclays", regionJa: "メガバンク / ロンドン", regionEn: "Megabank / London", tier: "mega", failRisk: 0.45 },
      { id: "gb-lloyds", nameJa: "ロイズ銀行", nameEn: "Lloyds", regionJa: "メガバンク / ロンドン", regionEn: "Megabank / London", tier: "mega", failRisk: 0.34 },
      { id: "gb-natwest", nameJa: "ナットウエスト", nameEn: "NatWest", regionJa: "メガバンク / ロンドン", regionEn: "Megabank / London", tier: "mega", failRisk: 0.35 },
      { id: "gb-nationwide", nameJa: "Nationwide", nameEn: "Nationwide Building Society", regionJa: "全国相互", regionEn: "Mutual", failRisk: 0.18 },
      { id: "gb-tsb", nameJa: "TSB", nameEn: "TSB", regionJa: "スコットランド", regionEn: "Scotland", failRisk: 0.29 },
      { id: "gb-metro", nameJa: "Metro Bank", nameEn: "Metro Bank", regionJa: "ロンドン", regionEn: "London", failRisk: 0.33 },
      { id: "gb-yorkshire", nameJa: "Yorkshire Bank", nameEn: "Yorkshire Bank", regionJa: "ヨークシャー", regionEn: "Yorkshire", failRisk: 0.26 },
    ],
  },
  {
    code: "DE",
    nameJa: "ドイツ",
    nameEn: "Germany",
    currency: "EUR",
    capitalJpy: 22_400_000_000_000,
    banks: [
      { id: "de-db", nameJa: "ドイツ銀行", nameEn: "Deutsche Bank", regionJa: "メガバンク / フランクフルト", regionEn: "Megabank / Frankfurt", tier: "mega", failRisk: 0.58 },
      { id: "de-commerz", nameJa: "コメルツ銀行", nameEn: "Commerzbank", regionJa: "メガバンク / フランクフルト", regionEn: "Megabank / Frankfurt", tier: "mega", failRisk: 0.49 },
      { id: "de-berliner", nameJa: "Berliner Sparkasse", nameEn: "Berliner Sparkasse", regionJa: "ベルリン", regionEn: "Berlin", failRisk: 0.17 },
      { id: "de-haspa", nameJa: "Hamburger Sparkasse", nameEn: "Haspa", regionJa: "ハンブルク", regionEn: "Hamburg", failRisk: 0.16 },
      { id: "de-koeln", nameJa: "Sparkasse KölnBonn", nameEn: "Sparkasse KölnBonn", regionJa: "NRW", regionEn: "NRW", failRisk: 0.18 },
      { id: "de-volksbank", nameJa: "Volksbank", nameEn: "Volksbank", regionJa: "協同組合", regionEn: "Cooperative", failRisk: 0.19 },
    ],
  },
  {
    code: "FR",
    nameJa: "フランス",
    nameEn: "France",
    currency: "EUR",
    capitalJpy: 20_100_000_000_000,
    banks: [
      { id: "fr-bnp", nameJa: "BNPパリバ", nameEn: "BNP Paribas", regionJa: "メガバンク / パリ", regionEn: "Megabank / Paris", tier: "mega", failRisk: 0.37 },
      { id: "fr-sg", nameJa: "ソシエテ・ジェネラル", nameEn: "Société Générale", regionJa: "メガバンク / パリ", regionEn: "Megabank / Paris", tier: "mega", failRisk: 0.41 },
      { id: "fr-ca", nameJa: "Crédit Agricole", nameEn: "Crédit Agricole", regionJa: "メガバンク / 地方金庫", regionEn: "Megabank / Regional caisses", tier: "mega", failRisk: 0.33 },
      { id: "fr-ce", nameJa: "Caisse d'Épargne", nameEn: "Caisse d'Épargne", regionJa: "貯蓄金庫", regionEn: "Savings", failRisk: 0.2 },
      { id: "fr-bp", nameJa: "Banque Populaire", nameEn: "Banque Populaire", regionJa: "人民銀行", regionEn: "Popular banks", failRisk: 0.21 },
    ],
  },
  {
    code: "IN",
    nameJa: "インド",
    nameEn: "India",
    currency: "INR",
    capitalJpy: 16_800_000_000_000,
    banks: [
      { id: "in-sbi", nameJa: "インドステイト銀行", nameEn: "State Bank of India", regionJa: "メガバンク / 全国", regionEn: "Megabank / National", tier: "mega", failRisk: 0.33 },
      { id: "in-hdfc", nameJa: "HDFC銀行", nameEn: "HDFC Bank", regionJa: "メガバンク / ムンバイ", regionEn: "Megabank / Mumbai", tier: "mega", failRisk: 0.31 },
      { id: "in-icici", nameJa: "ICICI銀行", nameEn: "ICICI Bank", regionJa: "メガバンク / ムンバイ", regionEn: "Megabank / Mumbai", tier: "mega", failRisk: 0.32 },
      { id: "in-bob", nameJa: "Bank of Baroda", nameEn: "Bank of Baroda", regionJa: "グジャラート", regionEn: "Gujarat", failRisk: 0.24 },
      { id: "in-canara", nameJa: "Canara Bank", nameEn: "Canara Bank", regionJa: "カルナータカ", regionEn: "Karnataka", failRisk: 0.25 },
      { id: "in-pnb", nameJa: "Punjab National Bank", nameEn: "Punjab National Bank", regionJa: "パンジャブ", regionEn: "Punjab", failRisk: 0.28 },
      { id: "in-union", nameJa: "Union Bank of India", nameEn: "Union Bank of India", regionJa: "マハラシュトラ", regionEn: "Maharashtra", failRisk: 0.26 },
    ],
  },
  {
    code: "BR",
    nameJa: "ブラジル",
    nameEn: "Brazil",
    currency: "BRL",
    capitalJpy: 14_200_000_000_000,
    banks: [
      { id: "br-itau", nameJa: "イタウ", nameEn: "Itaú Unibanco", regionJa: "メガバンク / サンパウロ", regionEn: "Megabank / São Paulo", tier: "mega", failRisk: 0.36 },
      { id: "br-bb", nameJa: "Banco do Brasil", nameEn: "Banco do Brasil", regionJa: "メガバンク / 全国", regionEn: "Megabank / National", tier: "mega", failRisk: 0.34 },
      { id: "br-bradesco", nameJa: "Bradesco", nameEn: "Bradesco", regionJa: "メガバンク / サンパウロ州", regionEn: "Megabank / São Paulo", tier: "mega", failRisk: 0.35 },
      { id: "br-caixa", nameJa: "Caixa", nameEn: "Caixa Econômica", regionJa: "貯蓄", regionEn: "Savings", failRisk: 0.22 },
    ],
  },
  {
    code: "KR",
    nameJa: "韓国",
    nameEn: "Korea",
    currency: "KRW",
    capitalJpy: 11_600_000_000_000,
    banks: [
      { id: "kr-kb", nameJa: "KB国民銀行", nameEn: "KB Kookmin", regionJa: "メガバンク / ソウル", regionEn: "Megabank / Seoul", tier: "mega", failRisk: 0.34 },
      { id: "kr-shinhan", nameJa: "新韓銀行", nameEn: "Shinhan Bank", regionJa: "メガバンク / ソウル", regionEn: "Megabank / Seoul", tier: "mega", failRisk: 0.33 },
      { id: "kr-hana", nameJa: "ハナ銀行", nameEn: "Hana Bank", regionJa: "メガバンク / ソウル", regionEn: "Megabank / Seoul", tier: "mega", failRisk: 0.35 },
      { id: "kr-busan", nameJa: "釜山銀行", nameEn: "Busan Bank", regionJa: "釜山", regionEn: "Busan", failRisk: 0.21 },
      { id: "kr-daegu", nameJa: "大邱銀行", nameEn: "Daegu Bank", regionJa: "大邱", regionEn: "Daegu", failRisk: 0.22 },
      { id: "kr-jeonbuk", nameJa: "全北銀行", nameEn: "Jeonbuk Bank", regionJa: "全北", regionEn: "Jeonbuk", failRisk: 0.24 },
    ],
  },
  {
    code: "ID",
    nameJa: "インドネシア",
    nameEn: "Indonesia",
    currency: "IDR",
    capitalJpy: 8_400_000_000_000,
    banks: [
      { id: "id-mandiri", nameJa: "Bank Mandiri", nameEn: "Bank Mandiri", regionJa: "メガバンク / ジャカルタ", regionEn: "Megabank / Jakarta", tier: "mega", failRisk: 0.31 },
      { id: "id-bca", nameJa: "Bank BCA", nameEn: "BCA", regionJa: "メガバンク / ジャカルタ", regionEn: "Megabank / Jakarta", tier: "mega", failRisk: 0.3 },
      { id: "id-bri", nameJa: "Bank BRI", nameEn: "BRI", regionJa: "メガバンク / ジャカルタ", regionEn: "Megabank / Jakarta", tier: "mega", failRisk: 0.32 },
      { id: "id-jatim", nameJa: "Bank Jatim", nameEn: "Bank Jatim", regionJa: "東ジャワ", regionEn: "East Java", failRisk: 0.23 },
      { id: "id-bjb", nameJa: "Bank BJB", nameEn: "Bank BJB", regionJa: "西ジャワ", regionEn: "West Java", failRisk: 0.22 },
      { id: "id-dki", nameJa: "Bank DKI", nameEn: "Bank DKI", regionJa: "ジャカルタ", regionEn: "Jakarta", failRisk: 0.24 },
    ],
  },
  {
    code: "MX",
    nameJa: "メキシコ",
    nameEn: "Mexico",
    currency: "MXN",
    capitalJpy: 7_200_000_000_000,
    banks: [
      { id: "mx-bbva", nameJa: "BBVAメキシコ", nameEn: "BBVA México", regionJa: "メガバンク / メキシコシティ", regionEn: "Megabank / Mexico City", tier: "mega", failRisk: 0.34 },
      { id: "mx-banamex", nameJa: "Citibanamex", nameEn: "Citibanamex", regionJa: "メガバンク / メキシコシティ", regionEn: "Megabank / Mexico City", tier: "mega", failRisk: 0.4 },
      { id: "mx-banorte", nameJa: "Banorte", nameEn: "Banorte", regionJa: "メガバンク / ヌエボレオン", regionEn: "Megabank / Nuevo León", tier: "mega", failRisk: 0.33 },
      { id: "mx-azteca", nameJa: "Banco Azteca", nameEn: "Banco Azteca", regionJa: "地方店舗網", regionEn: "Retail network", failRisk: 0.27 },
      { id: "mx-bajio", nameJa: "BanBajío", nameEn: "BanBajío", regionJa: "バヒオ", regionEn: "Bajío", failRisk: 0.25 },
    ],
  },
  {
    code: "IT",
    nameJa: "イタリア",
    nameEn: "Italy",
    currency: "EUR",
    capitalJpy: 12_800_000_000_000,
    banks: [
      { id: "it-intesa", nameJa: "インテーザ", nameEn: "Intesa Sanpaolo", regionJa: "メガバンク / ミラノ", regionEn: "Megabank / Milan", tier: "mega", failRisk: 0.39 },
      { id: "it-unicredit", nameJa: "ユニクレジット", nameEn: "UniCredit", regionJa: "メガバンク / ミラノ", regionEn: "Megabank / Milan", tier: "mega", failRisk: 0.46 },
      { id: "it-sondrio", nameJa: "Banca Popolare di Sondrio", nameEn: "Banca Popolare di Sondrio", regionJa: "ロンバルディア", regionEn: "Lombardy", failRisk: 0.22 },
      { id: "it-crediem", nameJa: "Credito Emiliano", nameEn: "Credito Emiliano", regionJa: "エミリア", regionEn: "Emilia", failRisk: 0.21 },
      { id: "it-bpm", nameJa: "Banco BPM", nameEn: "Banco BPM", regionJa: "北部", regionEn: "North", failRisk: 0.28 },
    ],
  },
  {
    code: "ES",
    nameJa: "スペイン",
    nameEn: "Spain",
    currency: "EUR",
    capitalJpy: 11_400_000_000_000,
    banks: [
      { id: "es-santander", nameJa: "サンタンデール", nameEn: "Santander", regionJa: "メガバンク / マドリード", regionEn: "Megabank / Madrid", tier: "mega", failRisk: 0.4 },
      { id: "es-bbva", nameJa: "BBVA", nameEn: "BBVA", regionJa: "メガバンク / マドリード", regionEn: "Megabank / Madrid", tier: "mega", failRisk: 0.38 },
      { id: "es-caixa", nameJa: "カイシャバンク", nameEn: "CaixaBank", regionJa: "メガバンク / バルセロナ", regionEn: "Megabank / Barcelona", tier: "mega", failRisk: 0.36 },
      { id: "es-kutxa", nameJa: "Kutxabank", nameEn: "Kutxabank", regionJa: "バスク", regionEn: "Basque", failRisk: 0.2 },
      { id: "es-ibercaja", nameJa: "Ibercaja", nameEn: "Ibercaja", regionJa: "アラゴン", regionEn: "Aragon", failRisk: 0.21 },
      { id: "es-unicaja", nameJa: "Unicaja", nameEn: "Unicaja", regionJa: "アンダルシア", regionEn: "Andalusia", failRisk: 0.23 },
    ],
  },
  {
    code: "CA",
    nameJa: "カナダ",
    nameEn: "Canada",
    currency: "CAD",
    capitalJpy: 10_200_000_000_000,
    banks: [
      { id: "ca-rbc", nameJa: "カナダロイヤル銀行", nameEn: "RBC", regionJa: "メガバンク / トロント", regionEn: "Megabank / Toronto", tier: "mega", failRisk: 0.28 },
      { id: "ca-td", nameJa: "TD銀行", nameEn: "TD", regionJa: "メガバンク / トロント", regionEn: "Megabank / Toronto", tier: "mega", failRisk: 0.29 },
      { id: "ca-scotia", nameJa: "スコシアバンク", nameEn: "Scotiabank", regionJa: "メガバンク / トロント", regionEn: "Megabank / Toronto", tier: "mega", failRisk: 0.3 },
      { id: "ca-desjardins", nameJa: "Desjardins", nameEn: "Desjardins", regionJa: "ケベック", regionEn: "Quebec", failRisk: 0.16 },
      { id: "ca-atb", nameJa: "ATB Financial", nameEn: "ATB Financial", regionJa: "アルバータ", regionEn: "Alberta", failRisk: 0.2 },
      { id: "ca-vancity", nameJa: "Vancity", nameEn: "Vancity", regionJa: "BC", regionEn: "British Columbia", failRisk: 0.17 },
    ],
  },
  {
    code: "AU",
    nameJa: "オーストラリア",
    nameEn: "Australia",
    currency: "AUD",
    capitalJpy: 9_600_000_000_000,
    banks: [
      { id: "au-cba", nameJa: "コモンウェルス銀行", nameEn: "Commonwealth Bank", regionJa: "メガバンク / シドニー", regionEn: "Megabank / Sydney", tier: "mega", failRisk: 0.31 },
      { id: "au-westpac", nameJa: "ウェストパック", nameEn: "Westpac", regionJa: "メガバンク / シドニー", regionEn: "Megabank / Sydney", tier: "mega", failRisk: 0.33 },
      { id: "au-nab", nameJa: "NAB", nameEn: "NAB", regionJa: "メガバンク / メルボルン", regionEn: "Megabank / Melbourne", tier: "mega", failRisk: 0.32 },
      { id: "au-anz", nameJa: "ANZ", nameEn: "ANZ", regionJa: "メガバンク / メルボルン", regionEn: "Megabank / Melbourne", tier: "mega", failRisk: 0.32 },
      { id: "au-bendigo", nameJa: "Bendigo Bank", nameEn: "Bendigo Bank", regionJa: "ビクトリア", regionEn: "Victoria", failRisk: 0.19 },
      { id: "au-boq", nameJa: "Bank of Queensland", nameEn: "Bank of Queensland", regionJa: "クイーンズランド", regionEn: "Queensland", failRisk: 0.24 },
      { id: "au-suncorp", nameJa: "Suncorp", nameEn: "Suncorp Bank", regionJa: "クイーンズランド", regionEn: "Queensland", failRisk: 0.22 },
    ],
  },
  {
    code: "ZA",
    nameJa: "南アフリカ",
    nameEn: "South Africa",
    currency: "ZAR",
    capitalJpy: 4_200_000_000_000,
    banks: [
      { id: "za-standard", nameJa: "Standard Bank", nameEn: "Standard Bank", regionJa: "メガバンク / ヨハネスブルグ", regionEn: "Megabank / Johannesburg", tier: "mega", failRisk: 0.37 },
      { id: "za-absa", nameJa: "Absa", nameEn: "Absa", regionJa: "メガバンク / ハウテン", regionEn: "Megabank / Gauteng", tier: "mega", failRisk: 0.38 },
      { id: "za-nedbank", nameJa: "Nedbank", nameEn: "Nedbank", regionJa: "メガバンク / ケープ", regionEn: "Megabank / Cape", tier: "mega", failRisk: 0.36 },
    ],
  },
  {
    code: "TR",
    nameJa: "トルコ",
    nameEn: "Turkey",
    currency: "TRY",
    capitalJpy: 3_800_000_000_000,
    banks: [
      { id: "tr-ziraat", nameJa: "Ziraat Bankası", nameEn: "Ziraat Bank", regionJa: "メガバンク / 地方農業", regionEn: "Megabank / Agricultural", tier: "mega", failRisk: 0.44 },
      { id: "tr-halk", nameJa: "Halkbank", nameEn: "Halkbank", regionJa: "メガバンク / 地方商業", regionEn: "Megabank / Provincial", tier: "mega", failRisk: 0.46 },
      { id: "tr-vakif", nameJa: "VakıfBank", nameEn: "VakıfBank", regionJa: "メガバンク / 財団", regionEn: "Megabank / Foundation", tier: "mega", failRisk: 0.43 },
    ],
  },
  {
    code: "TH",
    nameJa: "タイ",
    nameEn: "Thailand",
    currency: "THB",
    capitalJpy: 3_400_000_000_000,
    banks: [
      { id: "th-bbl", nameJa: "バンコック銀行", nameEn: "Bangkok Bank", regionJa: "メガバンク / バンコク", regionEn: "Megabank / Bangkok", tier: "mega", failRisk: 0.3 },
      { id: "th-kbank", nameJa: "カシコン銀行", nameEn: "Kasikornbank", regionJa: "メガバンク / バンコク", regionEn: "Megabank / Bangkok", tier: "mega", failRisk: 0.31 },
      { id: "th-gsb", nameJa: "Government Savings Bank", nameEn: "Government Savings Bank", regionJa: "貯蓄", regionEn: "Savings", failRisk: 0.18 },
      { id: "th-baac", nameJa: "BAAC", nameEn: "BAAC", regionJa: "農業協同", regionEn: "Agriculture", failRisk: 0.22 },
      { id: "th-ghb", nameJa: "GH Bank", nameEn: "GH Bank", regionJa: "住宅", regionEn: "Housing", failRisk: 0.2 },
    ],
  },
  {
    code: "EG",
    nameJa: "エジプト",
    nameEn: "Egypt",
    currency: "EGP",
    capitalJpy: 2_600_000_000_000,
    banks: [
      { id: "eg-nbe", nameJa: "National Bank of Egypt", nameEn: "National Bank of Egypt", regionJa: "メガバンク / 全国", regionEn: "Megabank / National", tier: "mega", failRisk: 0.35 },
      { id: "eg-misr", nameJa: "Banque Misr", nameEn: "Banque Misr", regionJa: "メガバンク / 地方店舗", regionEn: "Megabank / Branches", tier: "mega", failRisk: 0.34 },
      { id: "eg-caire", nameJa: "Banque du Caire", nameEn: "Banque du Caire", regionJa: "カイロ", regionEn: "Cairo", failRisk: 0.28 },
    ],
  },
  {
    code: "KE",
    nameJa: "ケニア",
    nameEn: "Kenya",
    currency: "KES",
    capitalJpy: 1_800_000_000_000,
    banks: [
      { id: "ke-equity", nameJa: "Equity Bank", nameEn: "Equity Bank", regionJa: "メガバンク / 地方支店", regionEn: "Megabank / Counties", tier: "mega", failRisk: 0.32 },
      { id: "ke-kcb", nameJa: "KCB", nameEn: "KCB", regionJa: "メガバンク / 東アフリカ", regionEn: "Megabank / East Africa", tier: "mega", failRisk: 0.33 },
      { id: "ke-coop", nameJa: "Co-operative Bank", nameEn: "Co-operative Bank", regionJa: "協同組合", regionEn: "Cooperative", failRisk: 0.24 },
    ],
  },
  {
    code: "NG",
    nameJa: "ナイジェリア",
    nameEn: "Nigeria",
    currency: "NGN",
    capitalJpy: 2_100_000_000_000,
    banks: [
      { id: "ng-access", nameJa: "Access Bank", nameEn: "Access Bank", regionJa: "メガバンク / 地方網", regionEn: "Megabank / Branch network", tier: "mega", failRisk: 0.39 },
      { id: "ng-zenith", nameJa: "Zenith Bank", nameEn: "Zenith Bank", regionJa: "メガバンク / ラゴス州", regionEn: "Megabank / Lagos State", tier: "mega", failRisk: 0.37 },
      { id: "ng-gtb", nameJa: "GTBank", nameEn: "GTBank", regionJa: "メガバンク / 南西部", regionEn: "Megabank / Southwest", tier: "mega", failRisk: 0.36 },
    ],
  },
  {
    code: "BD",
    nameJa: "バングラデシュ",
    nameEn: "Bangladesh",
    currency: "BDT",
    capitalJpy: 1_400_000_000_000,
    banks: [
      { id: "bd-sonali", nameJa: "Sonali Bank", nameEn: "Sonali Bank", regionJa: "メガバンク / 地方支店", regionEn: "Megabank / Districts", tier: "mega", failRisk: 0.34 },
      { id: "bd-janata", nameJa: "Janata Bank", nameEn: "Janata Bank", regionJa: "地方", regionEn: "Upazila", failRisk: 0.31 },
      { id: "bd-brac", nameJa: "BRAC Bank", nameEn: "BRAC Bank", regionJa: "マイクロ金融", regionEn: "Microfinance", failRisk: 0.22 },
    ],
  },
  {
    code: "PK",
    nameJa: "パキスタン",
    nameEn: "Pakistan",
    currency: "PKR",
    capitalJpy: 1_300_000_000_000,
    banks: [
      { id: "pk-hbl", nameJa: "HBL", nameEn: "Habib Bank", regionJa: "メガバンク / シンド", regionEn: "Megabank / Sindh", tier: "mega", failRisk: 0.38 },
      { id: "pk-ubl", nameJa: "UBL", nameEn: "United Bank", regionJa: "メガバンク / 地方網", regionEn: "Megabank / Provincial", tier: "mega", failRisk: 0.37 },
      { id: "pk-nbp", nameJa: "NBP", nameEn: "National Bank of Pakistan", regionJa: "全国地方", regionEn: "National-regional", failRisk: 0.35 },
    ],
  },
  {
    code: "PH",
    nameJa: "フィリピン",
    nameEn: "Philippines",
    currency: "PHP",
    capitalJpy: 1_500_000_000_000,
    banks: [
      { id: "ph-bdo", nameJa: "BDO", nameEn: "BDO Unibank", regionJa: "メガバンク / マニラ", regionEn: "Megabank / Manila", tier: "mega", failRisk: 0.32 },
      { id: "ph-bpi", nameJa: "BPI", nameEn: "BPI", regionJa: "メガバンク / マニラ", regionEn: "Megabank / Manila", tier: "mega", failRisk: 0.31 },
      { id: "ph-landbank", nameJa: "Land Bank", nameEn: "Land Bank", regionJa: "地方農業", regionEn: "Agriculture", failRisk: 0.23 },
      { id: "ph-rcbc", nameJa: "RCBC", nameEn: "RCBC", regionJa: "地方商業", regionEn: "Commercial", failRisk: 0.26 },
      { id: "ph-eastwest", nameJa: "EastWest Bank", nameEn: "EastWest Bank", regionJa: "地方店舗", regionEn: "Branches", failRisk: 0.27 },
    ],
  },
  {
    code: "VN",
    nameJa: "ベトナム",
    nameEn: "Vietnam",
    currency: "VND",
    capitalJpy: 1_600_000_000_000,
    banks: [
      { id: "vn-vietcombank", nameJa: "ベトコムバンク", nameEn: "Vietcombank", regionJa: "メガバンク / ハノイ", regionEn: "Megabank / Hanoi", tier: "mega", failRisk: 0.3 },
      { id: "vn-agri", nameJa: "Agribank", nameEn: "Agribank", regionJa: "メガバンク / 農業地方", regionEn: "Megabank / Rural", tier: "mega", failRisk: 0.33 },
      { id: "vn-vietin", nameJa: "VietinBank", nameEn: "VietinBank", regionJa: "地方工業", regionEn: "Industry", failRisk: 0.29 },
      { id: "vn-bidv", nameJa: "BIDV", nameEn: "BIDV", regionJa: "投資開発", regionEn: "Development", failRisk: 0.28 },
    ],
  },
  {
    code: "CO",
    nameJa: "コロンビア",
    nameEn: "Colombia",
    currency: "COP",
    capitalJpy: 900_000_000_000,
    banks: [
      { id: "co-bancolombia", nameJa: "Bancolombia", nameEn: "Bancolombia", regionJa: "メガバンク / メデジン", regionEn: "Megabank / Medellín", tier: "mega", failRisk: 0.34 },
      { id: "co-agrario", nameJa: "Banco Agrario", nameEn: "Banco Agrario", regionJa: "地方農業", regionEn: "Rural", failRisk: 0.26 },
      { id: "co-bogota", nameJa: "Banco de Bogotá", nameEn: "Banco de Bogotá", regionJa: "地方網", regionEn: "Network", failRisk: 0.27 },
    ],
  },
  {
    code: "TZ",
    nameJa: "タンザニア",
    nameEn: "Tanzania",
    currency: "TZS",
    capitalJpy: 400_000_000_000,
    banks: [
      { id: "tz-crdb", nameJa: "CRDB", nameEn: "CRDB Bank", regionJa: "メガバンク / 地方支店", regionEn: "Megabank / Regions", tier: "mega", failRisk: 0.31 },
      { id: "tz-nmb", nameJa: "NMB", nameEn: "NMB Bank", regionJa: "地方商業", regionEn: "Commercial", failRisk: 0.28 },
    ],
  },
] as BankCountry[]).filter((c) => c.banks.length > 0);

export const INITIAL_BANK_CAPITAL = BANK_COUNTRIES.reduce((sum, c) => sum + c.capitalJpy, 0);

export function bankTier(bank: RegionalBank): BankTier {
  return bank.tier ?? "regional";
}

export function bankFailRisk(bank: RegionalBank): number {
  if (typeof bank.failRisk === "number") return bank.failRisk;
  return bankTier(bank) === "mega" ? 0.4 : 0.16;
}

export function failRiskTone(risk: number): "ok" | "warn" | "alert" | "danger" {
  if (risk >= 0.5) return "danger";
  if (risk >= 0.38) return "alert";
  if (risk >= 0.28) return "warn";
  return "ok";
}

export function findBank(bankId: string) {
  for (const country of BANK_COUNTRIES) {
    const bank = country.banks.find((b) => b.id === bankId);
    if (bank) return { country, bank };
  }
  return null;
}

export function bankName(bank: RegionalBank, lang: string) {
  return lang === "en" ? bank.nameEn : bank.nameJa;
}

export function countryName(country: BankCountry, lang: string) {
  return lang === "en" ? country.nameEn : country.nameJa;
}

export function regionName(bank: RegionalBank, lang: string) {
  return lang === "en" ? bank.regionEn : bank.regionJa;
}

export function fxToJpy(currency: string) {
  return FX_JPY[currency] ?? 1;
}

export function toJpy(amount: number, currency: string) {
  return Math.round(amount * fxToJpy(currency));
}

export function depositPresets(currency: string): number[] {
  const rate = fxToJpy(currency);
  return [10_000, 50_000, 100_000, 300_000].map((jpy) => {
    const local = jpy / rate;
    if (local >= 10_000) return Math.round(local / 1_000) * 1_000;
    if (local >= 100) return Math.round(local / 10) * 10;
    if (local >= 10) return Math.round(local);
    return Math.round(local * 100) / 100;
  });
}

export function allBankSlots() {
  return BANK_COUNTRIES.flatMap((country) => country.banks.map((bank) => ({ country, bank })));
}

export function megaSlots() {
  return allBankSlots().filter((s) => bankTier(s.bank) === "mega");
}