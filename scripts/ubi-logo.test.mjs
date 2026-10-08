import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
test('UBI logo uses a horizontal beam and equally positioned pans', () => {
  const logo = read('public/ubi-logo.svg');
  assert.match(logo, /M32 44h96/);
  assert.match(logo, /M16 75q16 24 32 0M112 75q16 24 32 0/);
  assert.match(logo, />UBI<\/text>/);
  assert.equal(read('public/favicon.svg'), logo);
});
test('boot screen no longer loads old video or poster', () => {
  const boot = read('src/components/boot-splash.tsx');
  assert.doesNotMatch(boot, /<video|boot\.mp4|boot-poster/);
  for (const file of ['boot-splash', 'app-shell', 'cui-hex']) {
    assert.match(read(`src/components/${file}.tsx`), /\/ubi-logo\.svg/);
  }
});
