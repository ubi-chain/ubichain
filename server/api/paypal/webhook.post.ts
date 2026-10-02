import { defineEventHandler, getHeader, readBody, setResponseStatus } from "h3";
import { getToken } from "@vercel/connect";
import { getSql } from "@/lib/db";

const CONNECTOR = "paypal/ietfubi-com";
const VERIFY_URL =
  "https://api-m.paypal.com/v1/notifications/verify-webhook-signature";

type PaypalEvent = {
  event_type?: string;
  resource?: { supplementary_data?: { related_ids?: { order_id?: string } } };
};

export default defineEventHandler(async (event) => {
  const paypalEvent = (await readBody(event)) as PaypalEvent | undefined;
  const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim();
  const header = (name: string) => getHeader(event, name) ?? undefined;
  const required = [
    "paypal-auth-algo",
    "paypal-cert-url",
    "paypal-transmission-id",
    "paypal-transmission-sig",
    "paypal-transmission-time",
  ];
  if (
    !paypalEvent?.event_type ||
    !webhookId ||
    required.some((name) => !header(name))
  ) {
    setResponseStatus(event, 401);
    return { error: "unverified_paypal_event" };
  }

  try {
    const token = await getToken(CONNECTOR, { subject: { type: "app" } });
    const verification = await fetch(VERIFY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: header("paypal-auth-algo"),
        cert_url: header("paypal-cert-url"),
        transmission_id: header("paypal-transmission-id"),
        transmission_sig: header("paypal-transmission-sig"),
        transmission_time: header("paypal-transmission-time"),
        webhook_id: webhookId,
        webhook_event: paypalEvent,
      }),
    });
    const result = (await verification.json().catch(() => null)) as {
      verification_status?: string;
    } | null;
    if (!verification.ok || result?.verification_status !== "SUCCESS") {
      setResponseStatus(event, 401);
      return { error: "unverified_paypal_event" };
    }

    const orderId =
      paypalEvent.resource?.supplementary_data?.related_ids?.order_id;
    if (paypalEvent.event_type === "PAYMENT.CAPTURE.COMPLETED" && orderId) {
      const sql = await getSql();
      await sql.query(
        "UPDATE paypal_orders SET status = 'COMPLETED', captured_at = CURRENT_TIMESTAMP WHERE order_id = $1",
        [orderId],
      );
    }
    setResponseStatus(event, 202);
    return { received: true };
  } catch {
    setResponseStatus(event, 503);
    return { error: "webhook_verification_unavailable" };
  }
});
