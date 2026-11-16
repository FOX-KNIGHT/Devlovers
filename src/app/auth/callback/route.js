import { NextResponse } from 'next/server.js';
import { createClient } from '../../../lib/supabase/server.js';
import { createUser, getUserById } from '../../../db/queries/users.js';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';

  if (code) {
    const supabase = await createClient();
    if (!supabase.isMock && supabase.auth) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.user) {
        // Sync user into PostgreSQL users table
        try {
          const user = data.user;
          const existing = await getUserById(user.id);
          if (!existing) {
            await createUser({
              id: user.id,
              externalAuthId: user.id,
              email: user.email,
              username: user.user_metadata?.user_name || user.email?.split('@')[0] || `dev_${user.id.slice(0, 8)}`,
              fullName: user.user_metadata?.full_name || 'Anonymous Developer',
              avatarUrl: user.user_metadata?.avatar_url || null,
              role: 'USER',
            });
          }
        } catch (dbErr) {
          console.warn('Failed to sync auth user to db:', dbErr.message);
        }
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return to origin with redirect
  return NextResponse.redirect(`${origin}${next}`);
}
