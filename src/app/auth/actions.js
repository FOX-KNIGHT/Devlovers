'use server';

import { createClient } from '../../lib/supabase/server.js';

export async function signInWithOAuth(provider, origin) {
  const supabase = await createClient();

  if (supabase.isMock) {
    return {
      success: true,
      provider,
      mock: true,
      message: `Signed in via ${provider} (Development Mock)`,
    };
  }

  const baseUrl = origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, url: data?.url, provider };
}

export async function signInWithMagicLink(email) {
  if (!email) {
    return { success: false, error: 'Email is required' };
  }

  if (!email.includes('@')) {
    return { success: false, error: 'Valid email address is required' };
  }

  const supabase = await createClient();

  if (supabase.isMock) {
    return {
      success: true,
      email,
      mock: true,
      message: `Magic link dispatched to ${email} (Development Mock)`,
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${baseUrl}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, message: `Check your inbox at ${email} for your login link!` };
}

export async function signInWithPassword(email, password) {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  const supabase = await createClient();

  if (supabase.isMock) {
    return {
      success: true,
      mock: true,
      user: { email, id: 'user-mock' },
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user };
}

export async function signUpWithPassword(email, password) {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  const supabase = await createClient();

  if (supabase.isMock) {
    return {
      success: true,
      mock: true,
      message: 'Account created (Development Mock)',
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user };
}

export async function signOut() {
  const supabase = await createClient();

  if (!supabase.isMock && supabase.auth) {
    await supabase.auth.signOut();
  }

  return { success: true };
}

export async function getCurrentUser() {
  const supabase = await createClient();
  if (supabase.isMock || !supabase.auth) {
    return null;
  }
  const { data: { user } = {} } = await supabase.auth.getUser();
  return user || null;
}
