/**
 * PayPal events are delivered through the Vercel Connect trigger configured
 * for this exact path. No payment action is performed from a webhook.
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const event = req.body;
  if (!event || typeof event !== 'object' || typeof event.event_type !== 'string') {
    return res.status(400).json({ error: 'invalid_paypal_event' });
  }

  // Intentionally acknowledge only. Order capture, refunds, payouts, and
  // storage must be implemented behind authenticated server-side controls.
  return res.status(202).json({ received: true, eventType: event.event_type });
};
