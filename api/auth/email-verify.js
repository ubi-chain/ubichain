const crypto = require('node:crypto');
const { setSession } = require('./_session');

const ADMIN_EMAIL = 'haruki.2000495@gmail.com';
const WINDOW_MS = 10 * 60 * 1000;

function codeFor(secret, window) {
  const bytes = crypto.createHmac('sha256', secret).update(`${ADMIN_EMAIL}:${window}`).digest();
  return String(bytes.readUInt32BE(0) % 1_000_000).padStart(6, '0');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const code = String(req.body?.code || '').replace(/\D/g, '');
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) return res.status(503).json({ error: 'email_not_configured' });
  if (code.length !== 6) return res.status(400).json({ error: 'invalid_code' });
  const current = Math.floor(Date.now() / WINDOW_MS);
  if (code !== codeFor(secret, current) && code !== codeFor(secret, current - 1)) return res.status(401).json({ error: 'invalid_code' });
  setSession(res, ADMIN_EMAIL);
  return res.status(200).json({ ok: true });
};
