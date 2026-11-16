import { createBrowserClient } from '@supabase/ssr';

let supabaseClient = null;

// Mock auth client when credentials are not configured
function createMockClient() {
  let currentSession = null;
  const listeners = [];

  return {
    isMock: true,
    auth: {
      async getSession() {
        return { data: { session: currentSession }, error: null };
      },
      async getUser() {
        return { data: { user: currentSession?.user || null }, error: null };
      },
      async signInWithOAuth({ provider, options }) {
        currentSession = {
          user: {
            id: `usr-${provider}-${Date.now()}`,
            email: `${provider.toLowerCase()}_user@devlovers.com`,
            user_metadata: {
              full_name: `${provider} Developer`,
              avatar_url: `https://avatars.githubusercontent.com/u/${Date.now()}?v=4`,
              provider,
            },
          },
          access_token: 'mock-access-token',
        };
        listeners.forEach((cb) => cb('SIGNED_IN', currentSession));
        return { data: { url: options?.redirectTo || '/' }, error: null };
      },
      async signInWithOtp({ email: _email } = {}) {
        return { data: { user: null, session: null }, error: null };
      },
      async signOut() {
        currentSession = null;
        listeners.forEach((cb) => cb('SIGNED_OUT', null));
        return { error: null };
      },
      onAuthStateChange(callback) {
        listeners.push(callback);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                const idx = listeners.indexOf(callback);
                if (idx !== -1) listeners.splice(idx, 1);
              },
            },
          },
        };
      },
    },
  };
}

export function getSupabaseBrowserClient() {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    supabaseClient = createMockClient();
    return supabaseClient;
  }

  supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

export const supabase = getSupabaseBrowserClient();
