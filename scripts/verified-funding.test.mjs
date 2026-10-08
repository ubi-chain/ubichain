import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
test('verified funding displays zero, independent of simulated store', () => {
  const shell = read('src/components/app-shell.tsx');
  assert.doesNotMatch(shell, /compactNumber\(totalUbi\)/);
  assert.match(shell, /補正予算（受領確認済み）" value="¥0"/);
  assert.match(shell, /total_ubi.*給付実績.*value="¥0"/);
  const html = read('index.html');
  assert.doesNotMatch(html, /¥12\.8B/);
  assert.match(html, /UBI総額（給付実績）.*¥0/);
});
