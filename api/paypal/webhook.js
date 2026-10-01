const { getToken } = require('@vercel/connect');

const PAYPAL_VERIFY_URL = 'https://api-m.paypal.com/v1/notifications/verify-webhook-signature';
const requiredHeaders = [
  'paypal-auth-algo',
  'paypal-cert-url',
  'paypal-transmission-id',
  'paypal-transmission-sig',
  'paypal-transmission-time',
];

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const event = req.body;
  if (!event || typeof event !== 'object' || typeof event.event_type !== 'string') {
    return res.status(400).json({ error: 'invalid_paypal_event' });
  }

  const missing = requiredHeaders.filter((name) => !req.headers[name]);
  if (missing.length || !process.env.PAYPAL_WEBHOOK_ID) {
    return res.status(401).json({ error: 'unverified_paypal_event' });
  }

  try {
    const token = await getToken('paypal/ietfubi-com', { subject: { type: 'app' } });
    const verification = await fetch(PAYPAL_VERIFY_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_algo: req.headers['paypal-auth-algo'],
        cert_url: req.headers['paypal-cert-url'],
        transmission_id: req.headers['paypal-transmission-id'],
        transmission_sig: req.headers['paypal-transmission-sig'],
        transmission_time: req.headers['paypal-transmission-time'],
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: event,
      }),
    });
    const result = await verification.json();
    if (!verification.ok || result.verification_status !== 'SUCCESS') {
      console.warn('PayPal webhook rejected', { status: verification.status, eventType: event.event_type });
      return res.status(401).json({ error: 'unverified_paypal_event' });
    }

    console.info('PayPal webhook verified', { eventType: event.event_type, eventId: event.id || null });
    return res.status(202).json({ received: true });
  } catch (error) {
    console.error('PayPal webhook verification failed', { message: error instanceof Error ? error.message : 'unknown_error' });
    return res.status(503).json({ error: 'webhook_verification_unavailable' });
  }
};
