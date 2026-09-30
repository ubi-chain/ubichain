import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';

async function getUser() {
  const token = (await cookies()).get('ubichain_session')?.value;
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload.email;
  } catch {
    return null;
  }
}

export default async function MyPage() {
  const email = await getUser();
  if (!email) redirect('/login');
  return <main><h1>マイページ</h1><p>{email} としてログインしています。</p><p>このページは認証済みセッションで保護されています。</p><form action="/api/auth/logout" method="post"><button type="submit">ログアウト</button></form></main>;
}
