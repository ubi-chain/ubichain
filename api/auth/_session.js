const crypto = require('node:crypto');

const COOKIE = 'ubichain_sms_session';
const MAX_AGE = 60 * 60 * 8;

function secret() {
  return process.env.AUTH_SESSION_SECRET;
}

function encode(payload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

function readCookie(req) {
  const raw = req.headers.cookie || '';
  const item = raw.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE}=`));
  return item ? decodeURIComponent(item.slice(COOKIE.length + 1)) : null;
}

function verifySession(req) {
  if (!secret()) return null;
  const token = readCookie(req);
  if (!token) return null;
  const [value, signature] = token.split('.');
  const expected = value ? sign(value) : '';
  if (!value || !signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(value, 'base64url').toString());
    return data.exp > Date.now() && typeof data.phone === 'string' ? data : null;
  } catch {
    return null;
  }
}

function setSession(res, phone) {
  if (!secret()) throw new Error('AUTH_SESSION_SECRET is not configured');
  const value = encode({ phone, exp: Date.now() + MAX_AGE * 1000 });
  const token = `${value}.${sign(value)}`;
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`);
}

module.exports = { setSession, verifySession };
