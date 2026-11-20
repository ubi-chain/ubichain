import { LoveSession } from './session.mjs';

const $ = (id) => document.getElementById(id);
const session = new LoveSession(navigator.geolocation);
const categories = { daily: '暮らし', relationship: '恋愛・人間関係', money: '金銭相談・制度案内' };
const roles = { seek: '相談したい', offer: '支えたい', mutual: '相互に話したい' };
function list(id, values, empty) {
  $(id).replaceChildren(...(values.length ? values : [empty]).map((text) => {
    const item = document.createElement('li');
    item.textContent = text;
    return item;
  }));
}
function render() {
  $('state').textContent = session.active ? 'ローカル受信中・外部サービス未接続' : '停止中';
  $('profile-fields').disabled = !session.active;
  $('message-fields').disabled = !session.active;
  $('location-consent').disabled = !session.active;
  $('location-start').disabled = !session.active || !$('location-consent').checked;
  $('start').disabled = session.active || !$('session-consent').checked;
  list('profiles', session.profiles.map((p) => `参加条件 ${p.id}：${categories[p.category]} / ${roles[p.role]}`), '参加条件はありません');
  list('matches', session.matches().map(([a, b]) => `参加条件 ${a} と ${b} が一致しました（ローカル照合のみ・未接続）`), '一致する条件はありません');
  list('messages', session.messages, 'メッセージはありません');
  const p = session.location;
  $('location').textContent = session.locationStatus + (p ? ` / 緯度 ${p.latitude.toFixed(3)} / 経度 ${p.longitude.toFixed(3)} / 精度 約${Math.round(p.accuracy)}m` : '');
}
function act(fn) {
  try { $('feedback').textContent = fn() || ''; }
  catch (error) { $('feedback').textContent = error.message; }
  render();
}
function stop() {
  session.stop();
  for (const id of ['session-consent', 'profile-consent', 'adult', 'location-consent']) $(id).checked = false;
  for (const id of ['message', 'command']) $(id).value = '';
  render();
}
$('session-consent').addEventListener('change', () => {
  if (!$('session-consent').checked) stop();
  render();
});
$('start').addEventListener('click', () => act(() => {
  session.start($('session-consent').checked);
  return 'ローカル受信を開始しました。外部には送信しません';
}));
$('stop').addEventListener('click', () => act(() => { stop(); return '受信・位置取得を停止し、データを削除しました'; }));
$('profile-form').addEventListener('submit', (event) => {
  event.preventDefault();
  act(() => {
    session.addProfile({ category: $('category').value, role: $('role').value, consent: $('profile-consent').checked, adult: $('adult').checked });
    $('profile-consent').checked = false;
    $('adult').checked = false;
    return 'ローカル参加条件を追加しました。利用者との接続は行っていません';
  });
});
$('message-form').addEventListener('submit', (event) => {
  event.preventDefault();
  act(() => { session.receive($('message').value); $('message').value = ''; return 'この画面にのみ受信しました'; });
});
$('location-consent').addEventListener('change', () => {
  if (!$('location-consent').checked) session.stopLocation();
  render();
});
$('location-start').addEventListener('click', () => act(() => session.shareLocation($('location-consent').checked, render)));
$('location-stop').addEventListener('click', () => act(() => {
  session.stopLocation();
  $('location-consent').checked = false;
  return '位置取得を停止し、座標を削除しました';
}));
$('command-form').addEventListener('submit', (event) => {
  event.preventDefault();
  act(() => {
    const command = $('command').value.trim();
    const message = session.command(command, $('session-consent').checked);
    if (command === '/stop catch msg') stop();
    $('command').value = '';
    return message;
  });
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { stop(); $('feedback').textContent = '画面が非表示になったため停止し、データを削除しました'; }
});
window.addEventListener('pagehide', stop);
render();
