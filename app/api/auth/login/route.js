import { Magic } from '@magic-sdk/admin';
import { SignJWT } from 'jose';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const authorization = request.headers.get('authorization');
  const secret = process.env.AUTH_SESSION_SECRET;
  const magicSecret = process.env.MAGIC_SECRET_KEY;
  if (!authorization || !secret || !magicSecret) return NextResponse.json({ error: 'Authentication is not configured.' }, { status: 503 });

  try {
    const magic = new Magic(magicSecret);
    const didToken = magic.utils.parseAuthorizationHeader(authorization);
    await magic.token.validate(didToken);
    const metadata = await magic.users.getMetadataByToken(didToken);
    if (!metadata.email) throw new Error('Missing email');
    const session = await new SignJWT({ email: metadata.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(secret));
    const response = NextResponse.json({ authenticated: true });
    response.cookies.set('ubichain_session', session, { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch {
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 401 });
  }
}
