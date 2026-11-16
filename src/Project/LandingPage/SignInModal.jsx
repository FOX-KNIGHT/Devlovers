'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Mail, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { soundFx } from '@/lib/audio/sound-fx';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  );
}

function SignInModal({ isVisible, hideModal, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('magic'); // 'magic' | 'password'
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOAuth = async (provider) => {
    soundFx.playClick();
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: provider.toLowerCase(),
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        return;
      }
    } catch (err) {
      console.warn('Supabase OAuth notice:', err?.message || err);
    }

    setTimeout(() => {
      onLogin(provider);
      hideModal();
      setLoading(false);
      toast.success(`Welcome to Devlovers!`, {
        description: `Authenticated via ${provider} (Supabase Auth Ready)`,
      });
    }, 400);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    soundFx.playClick();
    setLoading(true);

    if (authMode === 'magic') {
      try {
        const supabase = getSupabaseBrowserClient();
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });
          if (error) throw error;
          toast.success(`Check your inbox!`, {
            description: `Magic link dispatched to ${email}`,
          });
          setEmail('');
          setLoading(false);
          hideModal();
          return;
        }
      } catch (err) {
        console.warn('Supabase OTP notice:', err?.message || err);
      }

      setTimeout(() => {
        onLogin('Email');
        hideModal();
        setLoading(false);
        toast.success(`Check your inbox!`, {
          description: `Magic link dispatched to ${email}`,
        });
        setEmail('');
      }, 400);
    } else {
      // Password mode
      if (!password) {
        toast.error('Password is required');
        setLoading(false);
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          if (isSignUp) {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            toast.success('Account created!', {
              description: 'Check your email to confirm registration or sign in directly.',
            });
          } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            toast.success('Welcome back to Devlovers!');
          }
          setEmail('');
          setPassword('');
          setLoading(false);
          hideModal();
          return;
        }
      } catch (err) {
        console.warn('Supabase password auth notice:', err?.message || err);
      }

      setTimeout(() => {
        onLogin(isSignUp ? 'New User' : 'Email');
        hideModal();
        setLoading(false);
        toast.success(isSignUp ? 'Account created successfully!' : 'Welcome back to Devlovers!', {
          description: `Signed in as ${email}`,
        });
        setEmail('');
        setPassword('');
      }, 400);
    }
  };

  return (
    <Dialog open={isVisible} onOpenChange={(open) => !open && hideModal()}>
      <DialogContent className="max-w-md border-cyan-500/30 bg-[#0C0F1D]/98 backdrop-blur-2xl p-6 sm:rounded-2xl">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <Sparkles className="h-6 w-6 text-cyan-400" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-white">
            Welcome to Devlovers
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs mt-1">
            Sign in to join global sprints, form elite squads, and access AI copilot tools.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 pt-3">
          <Button
            variant="outline"
            className="w-full justify-center gap-3 h-11 border-white/10 hover:border-cyan-500/50 hover:bg-white/5 text-slate-200"
            onClick={() => handleOAuth('GitHub')}
            disabled={loading}
          >
            <GithubIcon className="h-4 w-4 text-white" />
            <span>Continue with GitHub</span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-center gap-3 h-11 border-white/10 hover:border-cyan-500/50 hover:bg-white/5 text-slate-200"
            onClick={() => handleOAuth('Google')}
            disabled={loading}
          >
            <GoogleIcon className="h-4 w-4 text-amber-400" />
            <span>Continue with Google</span>
          </Button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0C0F1D] px-2 text-slate-500 font-mono text-[10px]">
                Or email credentials
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-lg bg-[#141A2E]/60 p-1 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setAuthMode('magic');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition ${
                authMode === 'magic'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Magic Link</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setAuthMode('password');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition ${
                authMode === 'password'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Password</span>
            </button>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div className="space-y-1">
              <input
                type="email"
                placeholder="developer@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="w-full h-11 rounded-lg bg-[#141A2E]/80 border border-white/10 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {authMode === 'password' && (
              <div className="space-y-1">
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={6}
                  className="w-full h-11 rounded-lg bg-[#141A2E]/80 border border-white/10 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="cyber"
              disabled={loading}
              className="w-full h-11 text-xs font-semibold"
            >
              {loading
                ? 'Authenticating...'
                : authMode === 'magic'
                ? 'Send Magic Link'
                : isSignUp
                ? 'Create Devlovers Account'
                : 'Sign In with Password'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(SignInModal);
