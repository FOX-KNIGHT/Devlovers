import { NextResponse } from 'next/server.js';
import { createClient } from '../../../lib/supabase/server.js';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') || '/';

  if (token_hash && type) {
    const supabase = await createClient();
    if (!supabase.isMock && supabase.auth) {
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${origin}/?auth_error=verification_failed`);
}
