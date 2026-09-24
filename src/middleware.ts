import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/types/locale';

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.includes('.')
  );
}

function getLocaleFromPathname(pathname: string): string | null {
  const segments = pathname.split('/');
  if (segments.length >= 2 && SUPPORTED_LOCALES.includes(segments[1] as typeof SUPPORTED_LOCALES[number])) {
    return segments[1];
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // Admin pages (except the login page itself) require a session cookie.
  // This is a presence check only — the cookie value is verified
  // server-side in pages and API handlers. Missing cookie → login.
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (pathname !== '/admin/login' && !request.cookies.get('mp_admin_session')?.value) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const locale = getLocaleFromPathname(pathname);

  if (!locale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|robots.txt|sitemap.xml).*)'],
};
