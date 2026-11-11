import test from 'node:test';
import assert from 'node:assert/strict';
import { LoveSession } from '../public/love/session.mjs';

test('explicit session consent, no automatic reception, bounds', () => {
  const s = new LoveSession();
  assert.equal(s.active, false);
  assert.throws(() => s.receive('test'));
  assert.throws(() => s.start(false));
  s.start(true);
  s.receive(' hello ');
  assert.deepEqual(s.messages, ['hello']);
  assert.throws(() => s.receive(' '));
  assert.throws(() => s.receive('x'.repeat(1001)));
});
test('match only opted-in adults in compatible categories and roles', () => {
  const s = new LoveSession(); s.start(true);
  const p = { category: 'relationship', role: 'mutual', consent: true, adult: true };
  assert.throws(() => s.addProfile({ ...p, consent: false }));
  assert.throws(() => s.addProfile({ ...p, adult: false }));
  assert.throws(() => s.addProfile({ ...p, category: 'invalid' }));
  s.addProfile(p); s.addProfile(p);
  s.addProfile({ ...p, category: 'money', role: 'seek' });
  s.addProfile({ ...p, category: 'money', role: 'seek' });
  s.addProfile({ ...p, category: 'money', role: 'offer' });
  assert.deepEqual(s.matches(), [[1, 2], [3, 5], [4, 5]]);
});
test('phone and IP targeting rejected, commands require consent, stop wipes everything', () => {
  const s = new LoveSession();
  assert.throws(() => s.command('/catch msg', false));
  assert.throws(() => s.command('/catch msg 192.0.2.1', true));
  assert.throws(() => s.command('/catch msg +0000000000', true));
  s.command('/catch msg', true); s.receive('test');
  s.addProfile({ category: 'daily', role: 'mutual', consent: true, adult: true });
  s.command('/stop catch msg');
  assert.equal(s.active, false);
  assert.deepEqual(s.messages, []); assert.deepEqual(s.profiles, []);
  assert.throws(() => s.receive('late message'));
});
test('location is opt-in, cleared on stop, late callbacks ignored after restart', () => {
  let success; let failure; const cleared = [];
  const s = new LoveSession({
    watchPosition(ok, err) { success = ok; failure = err; return 0; },
    clearWatch(id) { cleared.push(id); },
  });
  assert.throws(() => s.shareLocation(true));
  s.start(true); assert.throws(() => s.shareLocation(false));
  assert.equal(s.watch, null);
  s.shareLocation(true);
  const position = { coords: { latitude: 1, longitude: 2, accuracy: 10 } };
  success(position); assert.equal(s.location.latitude, 1);
  s.stop(); assert.deepEqual(cleared, [0]); assert.equal(s.location, null);
  s.start(true); success(position); assert.equal(s.location, null);
  failure(); assert.equal(s.locationStatus, '位置情報は取得していません');
  s.shareLocation(true); failure();
  assert.equal(s.watch, null); assert.equal(s.location, null);
  assert.match(s.locationStatus, /取得できません/);
});
test('unsupported geolocation never blocks message features', () => {
  const s = new LoveSession(); s.start(true);
  assert.throws(() => s.shareLocation(true));
  s.receive('no location needed'); assert.equal(s.messages.length, 1);
  s.stop(); s.stop(); assert.equal(s.active, false);
});
