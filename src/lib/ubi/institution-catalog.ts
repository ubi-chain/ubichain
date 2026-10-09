/** Public facts only. No guessed hosts, paths, or token URLs. */

export type Capability = {
  id: string;
  institution: "mufg" | "kabu";
  name: string;
  kind: "read" | "not-implemented";
  source: string;
  note: string;
};

export const CONFIRMED: Capability[] = [
  {
    id: "accounts_trial_v2",
    institution: "mufg",
    name: "個人API 口座",
    kind: "read",
    source: "https://developer.portal.bk.mufg.jp/btmu/openapitrial/api_list",
    note: "三菱UFJダイレクトに登録した口座の残高や入出金明細等の照会。trial 一覧に名称あり。",
  },
  {
    id: "accounts_trial_v1",
    institution: "mufg",
    name: "法人API 口座",
    kind: "read",
    source: "https://developer.portal.bk.mufg.jp/btmu/openapitrial/api_list",
    note: "BizSTATIONに登録した口座の残高・入出金明細の照会。trial 一覧に名称あり。",
  },
  {
    id: "kabu-orders",
    institution: "kabu",
    name: "注文一覧照会",
    kind: "read",
    source: "https://kabu.com/api/kabucom_api.html",
    note: "発注済注文の一覧・詳細。期間指定、有効注文のみ。公開ページに項目名あり。",
  },
  {
    id: "kabu-executions",
    institution: "kabu",
    name: "約定一覧照会",
    kind: "read",
    source: "https://kabu.com/api/kabucom_api.html",
    note: "約定結果の一覧・詳細。公開ページに項目名あり。",
  },
  {
    id: "kabu-positions",
    institution: "kabu",
    name: "建玉一覧照会",
    kind: "read",
    source: "https://kabu.com/api/kabucom_api.html",
    note: "未決済建玉の一覧・詳細。商品種別ごと。公開ページに項目名あり。",
  },
];

export const NOT_IMPLEMENTED: Capability[] = [
  {
    id: "mufg-transfer",
    institution: "mufg",
    name: "振込・総合振込・給与振込・口座振替",
    kind: "not-implemented",
    source: "https://developer.portal.bk.mufg.jp/btmu/openapitrial/api_list",
    note: "一覧にあるが照会ではない。このアプリでは実装しない。",
  },
  {
    id: "kabu-orders-write",
    institution: "kabu",
    name: "注文執行・訂正・取消",
    kind: "not-implemented",
    source: "https://kabu.com/api/kabucom_api.html",
    note: "公開ページにあるが発注機能。このアプリでは実装しない。",
  },
  {
    id: "kabu-cash",
    institution: "kabu",
    name: "証券の現金残高",
    kind: "not-implemented",
    source: "https://kabu.com/api/kabucom_api.html",
    note: "公開ページに残高照会APIの名称が無い。エンドポイントは推測しない。",
  },
];

export const UNKNOWNS = [
  "MUFG trial 一覧ページに、利用資格・契約手続き・認証方式（customers / userinfo 以外）・検証環境の有無・エンドポイントURLは無い。",
  "customers_trial_v3 と userinfo_trial_v1 のみ OpenID Connect 対応と書かれている。トークンURLはページに無い。",
  "kabu.com の公開ページは、法人の第三者向けAPI。個人口座は申し込めないと明記。仕様書は審査通過後に送付。",
  "kabu.com の公開ページに、エンドポイントURL、詳細な認証フロー、サンドボックス、レート制限は無い。OAuth 2.0 とAPIパスワード設定の記載はある。",
  "どちらの公開ページにも、このアプリ用のクライアント契約があるとは書いていない。",
];

export type DemoRow = { label: string; value: string; hint: string };

export function demoInquiry(): { bank: DemoRow[]; securities: DemoRow[] } {
  return {
    bank: [
      { label: "接続", value: "デモ／未接続", hint: "三菱UFJのAPIは呼んでいない" },
      { label: "残高", value: "¥0", hint: "架空。accounts_trial_v2 / v1 の項目イメージ" },
      { label: "入出金", value: "0件", hint: "架空の空明細。実口座の履歴ではない" },
    ],
    securities: [
      { label: "接続", value: "デモ／未接続", hint: "kabu.com のAPIは呼んでいない" },
      { label: "注文", value: "0件", hint: "注文一覧照会の項目イメージ。架空" },
      { label: "約定", value: "0件", hint: "約定一覧照会の項目イメージ。架空" },
      { label: "建玉", value: "0件", hint: "建玉一覧照会の項目イメージ。架空" },
      { label: "現金残高", value: "未実装", hint: "公開ページに照会APIの名称が無い" },
    ],
  };
}
