import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server.js';

const PROTECTED_ROUTES = ['/dashboard', '/squads/create', '/admin', '/submit'];

export function applySecurityHeaders(response) {
  if (!response?.headers) return response;
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()');
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://images.unsplash.com https://avatars.githubusercontent.com https://lh3.googleusercontent.com",
      "connect-src 'self' https://* wss://*",
      "media-src 'self' blob: data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
  );
  return response;
}

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let user = null;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const userRes = await supabase.auth.getUser();
    user = userRes.data?.user;
  } else {
    // Check for session cookie or dev mock cookie
    const allCookies = typeof request.cookies?.getAll === 'function' ? request.cookies.getAll() : [];
    const hasAuthCookie = allCookies.some((c) =>
      (c.name?.includes('sb-') && c.name?.includes('-auth-token')) || c.name === 'devlovers_mock_session'
    );
    if (hasAuthCookie) {
      user = { id: 'mock-user-id', email: 'dev@devlovers.org' };
    }
  }

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone ? request.nextUrl.clone() : new URL(request.url);
    url.pathname = '/';
    url.searchParams.set('auth', 'required');
    url.searchParams.set('redirect_to', request.nextUrl.pathname);
    const redirectResponse = NextResponse.redirect(url);
    return applySecurityHeaders(redirectResponse);
  }

  return applySecurityHeaders(supabaseResponse);
}
