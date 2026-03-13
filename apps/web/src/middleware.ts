import { NextRequest, NextResponse } from 'next/server';

const AUTH_PAGES = ['/login', '/signup', '/two-factor'];
const PROTECTED_PAGES = ['/dashboard', '/onboarding'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('better-auth.session_token');

  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));
  const isProtectedPage = PROTECTED_PAGES.some((p) => pathname.startsWith(p));

  if (isProtectedPage && !sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPage && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For dashboard/onboarding: check isOnboarded to route correctly
  if (
    sessionToken &&
    (pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding'))
  ) {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/auth/get-session`, {
        headers: { cookie: request.headers.get('cookie') ?? '' },
      });

      if (res.ok) {
        const session = await res.json();
        const isOnboarded = session?.user?.isOnboarded;

        if (!isOnboarded && pathname.startsWith('/dashboard')) {
          return NextResponse.redirect(new URL('/onboarding', request.url));
        }

        if (isOnboarded && pathname.startsWith('/onboarding')) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
    } catch {
      // API unreachable — let the page handle it
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/signup',
    '/two-factor',
    '/dashboard/:path*',
    '/onboarding',
  ],
};
