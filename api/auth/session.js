const { verifySession } = require('./_session');
module.exports = function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  const session = verifySession(req);
  return res.status(200).json({ authenticated: Boolean(session), phone: session?.phone || null });
};
