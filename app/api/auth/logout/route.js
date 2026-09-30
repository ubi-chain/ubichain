import { NextResponse } from 'next/server';

export async function POST(request) {
  const response = NextResponse.redirect(new URL('/login', request.url));
  response.cookies.set('ubichain_session', '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}
