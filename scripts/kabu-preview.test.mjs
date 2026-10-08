import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
test('preparation contains no network, secrets or trading implementation', () => {
  const fixture = read('src/lib/ubi/kabu-preview.ts');
  const page = read('src/routes/kabu-preview.tsx');
  assert.match(fixture, /connected: false/);
  assert.match(fixture, /tradingEnabled: false/);
  assert.match(fixture, /transfersEnabled: false/);
  assert.doesNotMatch(fixture + page, /fetch\s*\(|XMLHttpRequest|WebSocket|sendorder|X-API-KEY|type="password"/);
  assert.match(page, /デモデータのみ/);
  assert.match(read('src/routeTree.gen.ts'), /kabu-preview/);
});
