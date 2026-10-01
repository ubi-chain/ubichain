const crypto = require('node:crypto');

const ADMIN_EMAIL = 'haruki.2000495@gmail.com';
const WINDOW_MS = 10 * 60 * 1000;
const attempts = [];

function config() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const secret = process.env.AUTH_SESSION_SECRET;
  return apiKey && from && secret ? { apiKey, from, secret } : null;
}

function codeFor(secret, window) {
  const bytes = crypto.createHmac('sha256', secret).update(`${ADMIN_EMAIL}:${window}`).digest();
  return String(bytes.readUInt32BE(0) % 1_000_000).padStart(6, '0');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const now = Date.now();
  while (attempts.length && now - attempts[0] >= WINDOW_MS) attempts.shift();
  if (attempts.length >= 3) return res.status(429).json({ error: 'rate_limited' });
  const current = config();
  if (!current) return res.status(503).json({ error: 'email_not_configured' });
  const code = codeFor(current.secret, Math.floor(now / WINDOW_MS));
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${current.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: current.from,
      to: [ADMIN_EMAIL],
      subject: 'UBICHAIN 管理者認証コード',
      text: `認証コード: ${code}\n有効期限: 10分\nこのコードを共有しないでください。`,
    }),
  });
  if (!response.ok) return res.status(502).json({ error: 'email_delivery_failed' });
  attempts.push(now);
  return res.status(200).json({ ok: true });
};
