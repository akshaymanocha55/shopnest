/**
 * Route protection (Next.js 16 "proxy", formerly middleware).
 * Guests are redirected away from cart/checkout/account/order pages, and logged-in users
 * are redirected away from login/signup. The refresh token cookie is decrypted and its
 * signature + expiry verified, so a hand-crafted cookie does not get through.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_ROUTES, COOKIE_KEYS, PROTECTED_ROUTES, REDIRECT_PARAM, ROUTES } from '@/constants';
import { decrypt } from '@/lib/crypto';
import { verifyToken } from '@/lib/token';

const matches = (pathname: string, routes: readonly string[]) =>
  routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const refreshToken = await decrypt<string>(request.cookies.get(COOKIE_KEYS.refreshToken)?.value);
  return Boolean(await verifyToken(refreshToken, 'refresh'));
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProtected = matches(pathname, PROTECTED_ROUTES);
  const isAuthPage = matches(pathname, AUTH_ROUTES);
  if (!isProtected && !isAuthPage) return NextResponse.next();

  const loggedIn = await hasValidSession(request);

  if (isProtected && !loggedIn) {
    const loginUrl = new URL(ROUTES.login, request.url);
    loginUrl.searchParams.set(REDIRECT_PARAM, `${pathname}${search}`);
    const response = NextResponse.redirect(loginUrl);
    // Clear stale/invalid cookies so the client does not think it is logged in.
    Object.values(COOKIE_KEYS).forEach((name) => response.cookies.delete(name));
    return response;
  }

  if (isAuthPage && loggedIn) {
    const target = request.nextUrl.searchParams.get(REDIRECT_PARAM);
    const safeTarget = target?.startsWith('/') && !target.startsWith('//') ? target : ROUTES.home;
    return NextResponse.redirect(new URL(safeTarget, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/cart/:path*',
    '/checkout/:path*',
    '/order-confirmation/:path*',
    '/account/:path*',
    '/login',
    '/signup',
  ],
};
