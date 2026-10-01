/** Local quote for display. Not an exchange, not an order, not a market intervention. */
export function xrpJpy(now = Date.now()) {
  return 82 + Math.sin(now / 9000) * 3.5;
}

export function yenToXrp(yen: number, now = Date.now()) {
  const px = xrpJpy(now);
  return { px, xrp: yen / px };
}
