// Local-only pilot. No network, storage, telephone or IP interception.
export class LoveSession {
  constructor(geo) {
    this.geo = geo;
    this.active = false;
    this.watch = null;
    this.generation = 0;
    this.profiles = [];
    this.messages = [];
    this.location = null;
    this.locationStatus = '位置情報は取得していません';
  }
  start(consent) {
    if (consent !== true) throw new Error('説明への同意が必要です');
    this.active = true;
  }
  requireActive() {
    if (!this.active) throw new Error('先に説明に同意して受信を開始してください');
  }
  addProfile({ category, role, consent, adult }) {
    this.requireActive();
    if (consent !== true || adult !== true) throw new Error('本人の同意と18歳以上の確認が必要です');
    if (!['daily', 'relationship', 'money'].includes(category) || !['seek', 'offer', 'mutual'].includes(role)) {
      throw new Error('相談分野と参加方法を選んでください');
    }
    if (this.profiles.length >= 20) throw new Error('試作の参加枠は20件までです');
    const profile = { id: this.profiles.length + 1, category, role };
    this.profiles.push(profile);
    return profile;
  }
  matches() {
    return this.profiles.flatMap((a, i) => this.profiles.slice(i + 1)
      .filter((b) => a.category === b.category && (
        (a.role === 'mutual' && b.role === 'mutual') ||
        (a.role === 'seek' && b.role === 'offer') ||
        (a.role === 'offer' && b.role === 'seek')))
      .map((b) => [a.id, b.id]));
  }
  receive(text) {
    this.requireActive();
    const clean = text.trim();
    if (!clean || clean.length > 1000) throw new Error('メッセージは1〜1000文字で入力してください');
    if (this.messages.length >= 50) throw new Error('試作のメッセージ上限は50件です');
    this.messages.push(clean);
  }
  shareLocation(consent, notify = () => {}) {
    this.requireActive();
    if (consent !== true) throw new Error('位置情報の個別同意が必要です');
    if (!this.geo) throw new Error('この端末では位置情報を利用できません');
    this.stopLocation();
    const generation = this.generation;
    this.locationStatus = '端末の許可待ち（外部送信なし）';
    this.watch = this.geo.watchPosition((position) => {
      if (!this.active || generation !== this.generation) return;
      this.location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
      this.locationStatus = 'この画面のみ表示中・外部送信なし';
      notify();
    }, () => {
      if (!this.active || generation !== this.generation) return;
      this.stopLocation();
      this.locationStatus = '位置情報を取得できませんでした。端末の許可をご確認ください';
      notify();
    }, { enableHighAccuracy: false, maximumAge: 0, timeout: 10000 });
  }
  stopLocation() {
    this.generation += 1;
    if (this.watch !== null) this.geo?.clearWatch(this.watch);
    this.watch = null;
    this.location = null;
    this.locationStatus = '位置情報は取得していません';
  }
  stop() {
    this.active = false;
    this.stopLocation();
    this.messages = [];
    this.profiles = [];
  }
  command(text, consent) {
    if (text.trim() === '/catch msg') { this.start(consent); return 'ローカル受信を開始しました'; }
    if (text.trim() === '/stop catch msg') { this.stop(); return '受信・位置取得を停止し、セッションデータを削除しました'; }
    throw new Error('使えるコマンドは /catch msg と /stop catch msg のみです。電話番号・IPによる受信や追跡はできません');
  }
}
