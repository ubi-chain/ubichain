import { createServerFn } from "@tanstack/react-start";
import { getToken } from "@vercel/connect";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

const CONNECTOR = "paypal/ietfubi-com";
const API = "https://api-m.paypal.com";

type PaypalOrder = {
  id: string;
  status: string;
  links?: Array<{ rel: string; href: string }>;
};

type StartResult =
  { ok: true; approvalUrl: string } | { ok: false; error: string };
type CaptureResult =
  { ok: true; status: "completed" | "pending" } | { ok: false; error: string };

function amount(input: unknown) {
  const value = Number(input);
  return Number.isSafeInteger(value) && value >= 100 && value <= 1_000_000
    ? value
    : null;
}

function checkoutOrigin(fallback: string) {
  const deployedHost = process.env.VERCEL_URL?.trim();
  if (deployedHost) return new URL(`https://${deployedHost}`);
  const local = new URL(fallback);
  if (
    local.protocol !== "http:" ||
    !["localhost", "127.0.0.1"].includes(local.hostname)
  ) {
    throw new Error("invalid_origin");
  }
  return local;
}

async function paypal(path: string, init: RequestInit): Promise<PaypalOrder> {
  const token = await getToken(CONNECTOR, { subject: { type: "app" } });
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": crypto.randomUUID(),
      ...init.headers,
    },
  });
  const body = (await res.json().catch(() => null)) as PaypalOrder | null;
  if (!res.ok || !body?.id) throw new Error(`paypal_${res.status}`);
  return body;
}

export const startPaypalCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { amountJpy: unknown; origin: unknown }) => ({
    amountJpy: amount(input.amountJpy),
    origin: String(input.origin ?? "").slice(0, 200),
  }))
  .handler(async ({ data, context }): Promise<StartResult> => {
    if (!data.amountJpy)
      return {
        ok: false,
        error: "金額は100円から1,000,000円で入力してください",
      };
    let origin: URL;
    try {
      origin = checkoutOrigin(data.origin);
    } catch {
      return { ok: false, error: "決済の開始元を確認できませんでした" };
    }

    try {
      const order = await paypal("/v2/checkout/orders", {
        method: "POST",
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            { amount: { currency_code: "JPY", value: String(data.amountJpy) } },
          ],
          application_context: {
            return_url: `${origin.origin}/pay?paypal=return`,
            cancel_url: `${origin.origin}/pay?paypal=cancelled`,
            user_action: "PAY_NOW",
          },
        }),
      });
      const approvalUrl = order.links?.find(
        (link) => link.rel === "approve",
      )?.href;
      if (!approvalUrl)
        return { ok: false, error: "PayPalの承認画面を準備できませんでした" };
      const sql = await getSql();
      await sql.query(
        "INSERT INTO paypal_orders (order_id, user_id, amount_jpy, status) VALUES ($1, $2, $3, 'CREATED')",
        [order.id, context.userId, data.amountJpy],
      );
      return { ok: true, approvalUrl };
    } catch {
      return {
        ok: false,
        error: "PayPal決済を開始できませんでした。接続設定を確認してください",
      };
    }
  });

export const capturePaypalCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { orderId: unknown }) => ({
    orderId: String(input.orderId ?? "").slice(0, 127),
  }))
  .handler(async ({ data, context }): Promise<CaptureResult> => {
    if (!/^[A-Za-z0-9-]{6,127}$/.test(data.orderId))
      return { ok: false, error: "PayPal注文を確認できませんでした" };
    const sql = await getSql();
    const rows = await sql.query<{
      status: "CREATED" | "COMPLETED" | "FAILED";
    }>(
      "SELECT status FROM paypal_orders WHERE order_id = $1 AND user_id = $2",
      [data.orderId, context.userId],
    );
    const row = rows[0];
    if (!row) return { ok: false, error: "この注文へのアクセス権がありません" };
    if (row.status === "COMPLETED") return { ok: true, status: "completed" };

    try {
      const order = await paypal(
        `/v2/checkout/orders/${encodeURIComponent(data.orderId)}/capture`,
        {
          method: "POST",
          body: "{}",
        },
      );
      if (order.status === "COMPLETED") {
        await sql.query(
          "UPDATE paypal_orders SET status = 'COMPLETED', captured_at = CURRENT_TIMESTAMP WHERE order_id = $1",
          [data.orderId],
        );
        return { ok: true, status: "completed" };
      }
      return { ok: true, status: "pending" };
    } catch {
      await sql.query(
        "UPDATE paypal_orders SET status = 'FAILED' WHERE order_id = $1",
        [data.orderId],
      );
      return { ok: false, error: "PayPal決済を確定できませんでした" };
    }
  });
