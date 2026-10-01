const recent = new Map();

function validPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (/^0[6-9]0\d{8}$/.test(digits)) return `+81${digits.slice(1)}`;
  if (/^81[6-9]0\d{8}$/.test(digits)) return `+${digits}`;
  return null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const phone = validPhone(req.body?.phone);
  if (!phone) return res.status(400).json({ error: 'invalid_phone' });
  const now = Date.now();
  const attempts = (recent.get(phone) || []).filter((at) => now - at < 60 * 60 * 1000);
  if (attempts.length >= 5) return res.status(429).json({ error: 'rate_limited' });
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const service = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!sid || !token || !service) return res.status(503).json({ error: 'sms_not_configured' });
  const response = await fetch(`https://verify.twilio.com/v2/Services/${service}/Verifications`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ To: phone, Channel: 'sms' }),
  });
  if (!response.ok) return res.status(502).json({ error: 'sms_delivery_failed' });
  recent.set(phone, [...attempts, now]);
  return res.status(200).json({ ok: true });
};
