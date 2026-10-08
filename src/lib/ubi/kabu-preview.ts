/** Local fixtures only. No credentials, networking, trading or transfers. */
export const KABU_CONNECTION = {
  mode: "demo",
  connected: false,
  tradingEnabled: false,
  transfersEnabled: false,
} as const;

export const KABU_PREVIEW = {
  buyingPowerYen: 100000,
  positions: [{ symbol: "DEMO", name: "架空銘柄 / Demo security", quantity: 10 }],
  orders: [{ id: "DEMO-001", status: "架空約定 / Demo fill" }],
} as const;
