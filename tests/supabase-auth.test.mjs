import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getSupabaseBrowserClient } from '../src/lib/supabase/client.js';
import { updateSession } from '../src/lib/supabase/middleware.js';
import {
  signInWithOAuth,
  signInWithMagicLink,
  signInWithPassword,
  signUpWithPassword,
  signOut,
  getCurrentUser
} from '../src/app/auth/actions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Supabase Auth & Row Level Security (Phase 2)', () => {
  describe('Supabase Browser Client', () => {
    it('initializes browser client with auth interface', () => {
      const client = getSupabaseBrowserClient();
      assert.ok(client, 'Browser client must be defined');
      assert.ok(client.auth, 'Browser client must have an auth namespace');
      assert.strictEqual(typeof client.auth.signInWithOAuth, 'function');
      assert.strictEqual(typeof client.auth.signInWithOtp, 'function');
      assert.strictEqual(typeof client.auth.signOut, 'function');
      assert.strictEqual(typeof client.auth.getSession, 'function');
      assert.strictEqual(typeof client.auth.onAuthStateChange, 'function');
    });

    it('returns consistent client singleton', () => {
      const client1 = getSupabaseBrowserClient();
      const client2 = getSupabaseBrowserClient();
      assert.strictEqual(client1, client2, 'Multiple getSupabaseBrowserClient calls should return the same singleton instance');
    });

    it('mock client methods execute without uncaught errors', async () => {
      const client = getSupabaseBrowserClient();
      const sessionResult = await client.auth.getSession();
      assert.ok(sessionResult);
      assert.ok('data' in sessionResult);

      const otpResult = await client.auth.signInWithOtp({ email: 'dev@devlovers.org' });
      assert.strictEqual(otpResult.error, null);

      const oauthResult = await client.auth.signInWithOAuth({ provider: 'github' });
      assert.strictEqual(oauthResult.error, null);

      const signOutResult = await client.auth.signOut();
      assert.strictEqual(signOutResult.error, null);
    });
  });

  describe('Route Protection & Middleware', () => {
    it('redirects unauthenticated users requesting protected routes', async () => {
      const protectedPaths = ['/dashboard', '/squads/create', '/admin', '/submit'];

      for (const p of protectedPaths) {
        const mockReq = {
          nextUrl: {
            pathname: p,
            searchParams: new URLSearchParams(),
          },
          url: `http://localhost:3000${p}`,
          cookies: {
            getAll: () => [],
            set: () => {},
          },
        };

        const res = await updateSession(mockReq);
        assert.ok(res, `Response should exist for path ${p}`);
        // In unauthenticated mode, updateSession redirects with status 307
        assert.strictEqual(res.status, 307, `Path ${p} should return 307 redirect`);
        const location = res.headers.get('location');
        assert.ok(location.includes('auth=required'), `Redirect location should contain auth=required for ${p}`);
      }
    });

    it('allows public routes to pass through with 200/next response', async () => {
      const publicPaths = ['/', '/api/hackathons', '/sprint/ai-agents-challenge', '/privacy'];

      for (const p of publicPaths) {
        const mockReq = {
          nextUrl: {
            pathname: p,
            searchParams: new URLSearchParams(),
          },
          url: `http://localhost:3000${p}`,
          cookies: {
            getAll: () => [],
            set: () => {},
          },
        };

        const res = await updateSession(mockReq);
        assert.ok(res, `Response should exist for public path ${p}`);
        // Pass-through NextResponse.next() has status 200
        assert.strictEqual(res.status, 200, `Public path ${p} should pass through with status 200`);
      }
    });

    it('allows authenticated session cookie to access protected route', async () => {
      const mockReq = {
        nextUrl: {
          pathname: '/dashboard',
          searchParams: new URLSearchParams(),
        },
        url: 'http://localhost:3000/dashboard',
        cookies: {
          getAll: () => [{ name: 'sb-localhost-auth-token', value: 'mock-jwt-token' }],
          set: () => {},
        },
      };
      const res = await updateSession(mockReq);
      assert.ok(res);
      assert.strictEqual(res.status, 200, 'Authenticated session should pass through to /dashboard with status 200');
    });
  });

  describe('Auth Server Actions', () => {
    it('signInWithOAuth returns auth configuration or redirect URL', async () => {
      const result = await signInWithOAuth('github', 'http://localhost:3000');
      assert.ok(result);
      if (result.success) {
        assert.strictEqual(result.provider, 'github');
      } else {
        assert.ok(result.error);
      }
    });

    it('signInWithMagicLink validates email and handles dispatch', async () => {
      const missingEmail = await signInWithMagicLink('');
      assert.strictEqual(missingEmail.success, false);
      assert.strictEqual(missingEmail.error, 'Email is required');

      const invalidEmail = await signInWithMagicLink('notanemail');
      assert.strictEqual(invalidEmail.success, false);
      assert.strictEqual(invalidEmail.error, 'Valid email address is required');

      const validEmail = await signInWithMagicLink('founder@devlovers.org');
      assert.strictEqual(validEmail.success, true);
    });

    it('signInWithPassword validates required fields and handles authentication', async () => {
      const invalid = await signInWithPassword('', '');
      assert.strictEqual(invalid.success, false);
      assert.strictEqual(invalid.error, 'Email and password are required');

      const valid = await signInWithPassword('dev@devlovers.org', 'hunter2-secure');
      assert.strictEqual(valid.success, true);
      assert.ok(valid.user);
      assert.strictEqual(valid.user.email, 'dev@devlovers.org');
    });

    it('signUpWithPassword validates required fields and handles creation', async () => {
      const invalid = await signUpWithPassword('', '');
      assert.strictEqual(invalid.success, false);
      assert.strictEqual(invalid.error, 'Email and password are required');

      const valid = await signUpWithPassword('newuser@devlovers.org', 'my-strong-password');
      assert.strictEqual(valid.success, true);
    });

    it('signOut executes cleanly and returns success', async () => {
      const result = await signOut();
      assert.strictEqual(result.success, true);
    });

    it('getCurrentUser resolves cleanly without throwing', async () => {
      const user = await getCurrentUser();
      // In offline / mock mode with no cookies, user is null
      assert.strictEqual(user, null);
    });
  });

  describe('PostgreSQL Row Level Security (RLS) SQL Specification', () => {
    const migrationFile = path.join(rootDir, 'drizzle', '0004_rls_policies.sql');

    it('migration file 0004_rls_policies.sql exists and is non-empty', () => {
      assert.ok(fs.existsSync(migrationFile), '0004_rls_policies.sql must exist');
      const sql = fs.readFileSync(migrationFile, 'utf8');
      assert.ok(sql.length > 500, 'Migration file should contain substantial SQL definitions');
    });

    it('enables RLS on all 18 tables', () => {
      const sql = fs.readFileSync(migrationFile, 'utf8');
      const expectedTables = [
        'users',
        'hackathons',
        'tracks',
        'squads',
        'squad_members',
        'submissions',
        'evaluations',
        'bookmarks',
        'comments',
        'likes',
        'sponsor_credits',
        'events',
        'conversations',
        'conversation_members',
        'messages',
        'audit_logs',
        'notifications',
        'hackathon_registrations',
      ];

      for (const table of expectedTables) {
        const regex = new RegExp(`ALTER TABLE (?:public\\.)?${table} ENABLE ROW LEVEL SECURITY;`, 'i');
        assert.ok(regex.test(sql), `Table ${table} must have ENABLE ROW LEVEL SECURITY defined`);
      }
    });

    it('defines security functions (current_user_id, is_admin, is_judge)', () => {
      const sql = fs.readFileSync(migrationFile, 'utf8');
      assert.ok(sql.includes('FUNCTION public.current_user_id()'), 'Must define public.current_user_id() function');
      assert.ok(sql.includes('FUNCTION public.is_admin()'), 'Must define public.is_admin() function');
      assert.ok(sql.includes('FUNCTION public.is_judge()'), 'Must define public.is_judge() function');
    });

    it('contains granular policies for sensitive tables', () => {
      const sql = fs.readFileSync(migrationFile, 'utf8');

      // Blind evaluation policy
      assert.ok(sql.includes('CREATE POLICY "evaluations_read"'), 'Must define evaluations_read policy');
      assert.ok(sql.includes('CREATE POLICY "evaluations_judge_insert"'), 'Must define evaluations_judge_insert policy');

      // Squad & submissions isolation
      assert.ok(sql.includes('CREATE POLICY "submissions_read"'), 'Must define submissions_read policy');
      assert.ok(sql.includes('CREATE POLICY "submissions_squad_insert"'), 'Must define submissions_squad_insert policy');

      // Private messaging isolation
      assert.ok(sql.includes('CREATE POLICY "messages_member_select"'), 'Must define messages_member_select policy');
      assert.ok(sql.includes('CREATE POLICY "messages_member_insert"'), 'Must define messages_member_insert policy');

      // User notifications isolation
      assert.ok(sql.includes('CREATE POLICY "notifications_owner_select"'), 'Must define notifications_owner_select policy');
      assert.ok(sql.includes('CREATE POLICY "notifications_owner_update"'), 'Must define notifications_owner_update policy');
    });

    it('defines policies for social, tracks, and squad memberships', () => {
      const sql = fs.readFileSync(migrationFile, 'utf8');
      assert.ok(sql.includes('CREATE POLICY "comments_public_read"'), 'Must define comments_public_read');
      assert.ok(sql.includes('CREATE POLICY "likes_public_read"'), 'Must define likes_public_read');
      assert.ok(sql.includes('CREATE POLICY "tracks_public_read"'), 'Must define tracks_public_read');
      assert.ok(sql.includes('CREATE POLICY "squad_members_join_insert"'), 'Must define squad_members_join_insert');
      assert.ok(sql.includes('CREATE POLICY "squad_members_leave_delete"'), 'Must define squad_members_leave_delete');
    });
  });
});
