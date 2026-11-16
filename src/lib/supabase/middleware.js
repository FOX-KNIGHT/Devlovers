import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server.js';

const PROTECTED_ROUTES = ['/dashboard', '/squads/create', '/admin', '/submit'];

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
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
