export type City = {
  nameJa: string;
  nameEn: string;
  code: string;
  lon: number;
  lat: number;
  povertyIndex: number;
  population: number;
  ubiRecipients: number;
  avgIncome: number;
  gdpPerCapita: number;
  tz: string;
};

export const CITIES: City[] = [
  { nameJa: "東京", nameEn: "Tokyo", code: "JP", lon: 139.7, lat: 35.7, povertyIndex: 0.08, population: 126, ubiRecipients: 45_000, avgIncome: 4200, gdpPerCapita: 42_000, tz: "Asia/Tokyo" },
  { nameJa: "ニューヨーク", nameEn: "New York", code: "US", lon: -74, lat: 40.7, povertyIndex: 0.15, population: 331, ubiRecipients: 82_000, avgIncome: 5800, gdpPerCapita: 65_000, tz: "America/New_York" },
  { nameJa: "ロンドン", nameEn: "London", code: "GB", lon: -0.1, lat: 51.5, povertyIndex: 0.18, population: 67, ubiRecipients: 28_000, avgIncome: 4900, gdpPerCapita: 46_000, tz: "Europe/London" },
  { nameJa: "パリ", nameEn: "Paris", code: "FR", lon: 2.3, lat: 48.9, povertyIndex: 0.14, population: 67, ubiRecipients: 22_000, avgIncome: 4700, gdpPerCapita: 44_000, tz: "Europe/Paris" },
  { nameJa: "ベルリン", nameEn: "Berlin", code: "DE", lon: 13.4, lat: 52.5, povertyIndex: 0.13, population: 83, ubiRecipients: 19_000, avgIncome: 4600, gdpPerCapita: 48_000, tz: "Europe/Berlin" },
  { nameJa: "モスクワ", nameEn: "Moscow", code: "RU", lon: 37.6, lat: 55.8, povertyIndex: 0.22, population: 145, ubiRecipients: 31_000, avgIncome: 1800, gdpPerCapita: 11_000, tz: "Europe/Moscow" },
  { nameJa: "北京", nameEn: "Beijing", code: "CN", lon: 116.4, lat: 39.9, povertyIndex: 0.25, population: 1440, ubiRecipients: 245_000, avgIncome: 1650, gdpPerCapita: 12_000, tz: "Asia/Shanghai" },
  { nameJa: "ムンバイ", nameEn: "Mumbai", code: "IN", lon: 72.8, lat: 19.1, povertyIndex: 0.65, population: 1380, ubiRecipients: 420_000, avgIncome: 620, gdpPerCapita: 2100, tz: "Asia/Kolkata" },
  { nameJa: "ラゴス", nameEn: "Lagos", code: "NG", lon: 3.4, lat: 6.5, povertyIndex: 0.82, population: 214, ubiRecipients: 156_000, avgIncome: 450, gdpPerCapita: 2200, tz: "Africa/Lagos" },
  { nameJa: "カイロ", nameEn: "Cairo", code: "EG", lon: 31.2, lat: 30.1, povertyIndex: 0.72, population: 100, ubiRecipients: 68_000, avgIncome: 390, gdpPerCapita: 3500, tz: "Africa/Cairo" },
  { nameJa: "ナイロビ", nameEn: "Nairobi", code: "KE", lon: 36.8, lat: -1.3, povertyIndex: 0.78, population: 54, ubiRecipients: 38_000, avgIncome: 320, gdpPerCapita: 1700, tz: "Africa/Nairobi" },
  { nameJa: "ヨハネスブルグ", nameEn: "Johannesburg", code: "ZA", lon: 28, lat: -26.2, povertyIndex: 0.68, population: 60, ubiRecipients: 34_000, avgIncome: 520, gdpPerCapita: 5700, tz: "Africa/Johannesburg" },
  { nameJa: "サンパウロ", nameEn: "São Paulo", code: "BR", lon: -46.6, lat: -23.5, povertyIndex: 0.55, population: 213, ubiRecipients: 98_000, avgIncome: 880, gdpPerCapita: 8700, tz: "America/Sao_Paulo" },
  { nameJa: "メキシコシティ", nameEn: "Mexico City", code: "MX", lon: -99.1, lat: 19.4, povertyIndex: 0.48, population: 130, ubiRecipients: 54_000, avgIncome: 1050, gdpPerCapita: 9500, tz: "America/Mexico_City" },
  { nameJa: "バンコク", nameEn: "Bangkok", code: "TH", lon: 100.5, lat: 13.8, povertyIndex: 0.38, population: 70, ubiRecipients: 24_000, avgIncome: 780, gdpPerCapita: 7800, tz: "Asia/Bangkok" },
  { nameJa: "シドニー", nameEn: "Sydney", code: "AU", lon: 151.2, lat: -33.9, povertyIndex: 0.12, population: 25, ubiRecipients: 8500, avgIncome: 5100, gdpPerCapita: 54_000, tz: "Australia/Sydney" },
  { nameJa: "ダッカ", nameEn: "Dhaka", code: "BD", lon: 90.4, lat: 23.7, povertyIndex: 0.88, population: 168, ubiRecipients: 128_000, avgIncome: 210, gdpPerCapita: 2100, tz: "Asia/Dhaka" },
  { nameJa: "カラチ", nameEn: "Karachi", code: "PK", lon: 67, lat: 24.9, povertyIndex: 0.8, population: 220, ubiRecipients: 145_000, avgIncome: 280, gdpPerCapita: 1300, tz: "Asia/Karachi" },
  { nameJa: "ドバイ", nameEn: "Dubai", code: "AE", lon: 55.3, lat: 25.2, povertyIndex: 0.05, population: 10, ubiRecipients: 1200, avgIncome: 8900, gdpPerCapita: 43_000, tz: "Asia/Dubai" },
  { nameJa: "シンガポール", nameEn: "Singapore", code: "SG", lon: 103.8, lat: 1.3, povertyIndex: 0.06, population: 5.8, ubiRecipients: 1800, avgIncome: 6400, gdpPerCapita: 65_000, tz: "Asia/Singapore" },
  { nameJa: "ダルエスサラーム", nameEn: "Dar es Salaam", code: "TZ", lon: 39.3, lat: -6.8, povertyIndex: 0.85, population: 62, ubiRecipients: 44_000, avgIncome: 180, gdpPerCapita: 1080, tz: "Africa/Dar_es_Salaam" },
  { nameJa: "ボゴタ", nameEn: "Bogotá", code: "CO", lon: -74.1, lat: 4.7, povertyIndex: 0.52, population: 51, ubiRecipients: 22_000, avgIncome: 650, gdpPerCapita: 6200, tz: "America/Bogota" },
  { nameJa: "ソウル", nameEn: "Seoul", code: "KR", lon: 126.9, lat: 37.6, povertyIndex: 0.1, population: 52, ubiRecipients: 18_000, avgIncome: 3800, gdpPerCapita: 31_000, tz: "Asia/Seoul" },
  { nameJa: "イスタンブール", nameEn: "Istanbul", code: "TR", lon: 29, lat: 41, povertyIndex: 0.32, population: 84, ubiRecipients: 28_000, avgIncome: 1200, gdpPerCapita: 9500, tz: "Europe/Istanbul" },
  { nameJa: "テヘラン", nameEn: "Tehran", code: "IR", lon: 51.4, lat: 35.7, povertyIndex: 0.45, population: 85, ubiRecipients: 32_000, avgIncome: 590, gdpPerCapita: 5600, tz: "Asia/Tehran" },
  { nameJa: "ジャカルタ", nameEn: "Jakarta", code: "ID", lon: 106.8, lat: -6.2, povertyIndex: 0.42, population: 273, ubiRecipients: 88_000, avgIncome: 540, gdpPerCapita: 4800, tz: "Asia/Jakarta" },
  { nameJa: "マニラ", nameEn: "Manila", code: "PH", lon: 121, lat: 14.6, povertyIndex: 0.44, population: 114, ubiRecipients: 41_000, avgIncome: 610, gdpPerCapita: 3900, tz: "Asia/Manila" },
  { nameJa: "ハノイ", nameEn: "Hanoi", code: "VN", lon: 105.8, lat: 21, povertyIndex: 0.36, population: 98, ubiRecipients: 29_000, avgIncome: 520, gdpPerCapita: 4300, tz: "Asia/Ho_Chi_Minh" },
  { nameJa: "ローマ", nameEn: "Rome", code: "IT", lon: 12.5, lat: 41.9, povertyIndex: 0.16, population: 59, ubiRecipients: 14_000, avgIncome: 4100, gdpPerCapita: 35_000, tz: "Europe/Rome" },
  { nameJa: "マドリード", nameEn: "Madrid", code: "ES", lon: -3.7, lat: 40.4, povertyIndex: 0.17, population: 47, ubiRecipients: 12_000, avgIncome: 3900, gdpPerCapita: 31_000, tz: "Europe/Madrid" },
  { nameJa: "トロント", nameEn: "Toronto", code: "CA", lon: -79.4, lat: 43.7, povertyIndex: 0.11, population: 38, ubiRecipients: 9_200, avgIncome: 4700, gdpPerCapita: 52_000, tz: "America/Toronto" },
];

export const CURRENCY: Record<string, string> = {
  JP: "JPY",
  US: "USD",
  GB: "GBP",
  FR: "EUR",
  DE: "EUR",
  RU: "RUB",
  CN: "CNY",
  IN: "INR",
  NG: "NGN",
  EG: "EGP",
  KE: "KES",
  ZA: "ZAR",
  BR: "BRL",
  MX: "MXN",
  TH: "THB",
  AU: "AUD",
  BD: "BDT",
  PK: "PKR",
  TZ: "TZS",
  AE: "AED",
  SG: "SGD",
  CO: "COP",
  KR: "KRW",
  TR: "TRY",
  IR: "IRR",
  ID: "IDR",
  PH: "PHP",
  VN: "VND",
  IT: "EUR",
  ES: "EUR",
  CA: "CAD",
};

export const CLOCKS = [
  { labelJa: "東京", labelEn: "Tokyo", tz: "Asia/Tokyo" },
  { labelJa: "ニューヨーク", labelEn: "New York", tz: "America/New_York" },
  { labelJa: "ロンドン", labelEn: "London", tz: "Europe/London" },
  { labelJa: "北京", labelEn: "Beijing", tz: "Asia/Shanghai" },
] as const;

export function cityName(city: City, lang: string) {
  return lang === "en" ? city.nameEn : city.nameJa;
}

export function povertyColor(index: number) {
  if (index < 0.2) return "#00ff88";
  if (index < 0.4) return "#88ff00";
  if (index < 0.6) return "#ffcc00";
  if (index < 0.75) return "#ff8800";
  return "#ff3366";
}

export function txColor(type: string) {
  switch (type) {
    case "labor":
      return "#00ff88";
    case "bank":
      return "#5eead4";
    case "suspicious":
      return "#ff3366";
    case "theft":
      return "#ff0044";
    case "refund":
      return "#ffcc00";
    default:
      return "#00d4ff";
  }
}

export function project(lon: number, lat: number, w: number, h: number): [number, number] {
  return [((lon + 180) / 360) * w, ((90 - lat) / 180) * h];
}

export function cityIndexByCode(code: string) {
  const i = CITIES.findIndex((c) => c.code === code);
  return i < 0 ? 0 : i;
}

export function highPovertyIndex(except = -1) {
  let best = 0;
  let score = -1;
  CITIES.forEach((c, i) => {
    if (i === except) return;
    if (c.povertyIndex > score) {
      score = c.povertyIndex;
      best = i;
    }
  });
  return best;
}
