'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  async function signIn(event) {
    event.preventDefault();
    setStatus('ログインリンクを送信しています…');
    try {
      const { Magic } = await import('magic-sdk');
      const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY);
      const didToken = await magic.auth.loginWithMagicLink({ email });
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { Authorization: `Bearer ${didToken}` },
      });
      if (!response.ok) throw new Error('ログインを確認できませんでした。');
      window.location.assign('/mypage');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'ログインに失敗しました。');
    }
  }

  return <main><h1>UBICHAIN ログイン</h1><p>SMSの代わりにメールのログインリンクを使用します。</p><form onSubmit={signIn}><label>メールアドレス<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><button type="submit">ログインリンクを送る</button></form><p role="status">{status}</p><a href="/legacy/">公開ページへ戻る</a></main>;
}
