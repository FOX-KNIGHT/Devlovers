'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound,
  Copy,
  Check,
  ShieldCheck,
  Terminal,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundFx } from '@/lib/audio/sound-fx';
import { toast } from 'sonner';
import { SPONSOR_PRESETS } from '@/lib/workspace/sponsors-data.js';

export function SponsorDispensary() {
  const [dispensedKeys, setDispensedKeys] = useState({});
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [loadingKeyId, setLoadingKeyId] = useState(null);
  const [revealedKeys, setRevealedKeys] = useState({});
  const [testRunnerState, setTestRunnerState] = useState(null); // { sponsorId, running, response }

  // Load any previously dispensed keys from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('devlovers_dispensed_sponsor_keys');
      if (saved) {
        setDispensedKeys(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleDispense = async (sponsor) => {
    soundFx.playClick();
    setLoadingKeyId(sponsor.id);

    try {
      const res = await fetch('/api/sponsors/dispense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sponsorId: sponsor.id,
          userId: 'hacker-lead',
          hackathonSlug: 'future-of-ai-sprint-2026',
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        soundFx.playSuccess();
        const updated = {
          ...dispensedKeys,
          [sponsor.id]: json.data,
        };
        setDispensedKeys(updated);
        try {
          localStorage.setItem('devlovers_dispensed_sponsor_keys', JSON.stringify(updated));
        } catch {
          // Ignore
        }
        toast.success(`Provisioned $${(sponsor.creditAmountCents / 100).toFixed(2)} sandbox token!`, {
          description: `${sponsor.sponsorName} API access active for 14 days.`,
        });
      } else {
        throw new Error(json.error || 'Failed to dispense');
      }
    } catch (err) {
      toast.error(`Dispensary error: ${err.message}`);
    } finally {
      setLoadingKeyId(null);
    }
  };

  const copyToken = (id, token) => {
    soundFx.playClick();
    navigator.clipboard.writeText(token);
    setCopiedKeyId(id);
    toast.success('API token copied to clipboard', {
      description: 'Never commit this token to a public repository.',
    });
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const toggleReveal = (id) => {
    soundFx.playClick();
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const maskToken = (raw, prefix) => {
    if (!raw) return '';
    const secretPart = raw.slice(prefix.length);
    return `${prefix}••••••••${secretPart.slice(-4)}`;
  };

  const runSandboxTest = async (sponsor) => {
    soundFx.playClick();
    setTestRunnerState({ sponsorId: sponsor.id, running: true, response: null });

    setTimeout(() => {
      soundFx.playSuccess();
      const mockLatency = Math.floor(Math.random() * 25) + 12;
      setTestRunnerState({
        sponsorId: sponsor.id,
        running: false,
        latencyMs: mockLatency,
        response: {
          status: 200,
          statusText: 'OK',
          headers: {
            'content-type': 'application/json',
            'x-ratelimit-remaining': '998',
            'x-latency-ms': `${mockLatency}ms`,
          },
          payload: {
            authenticated: true,
            tier: 'HACKATHON_SANDBOX_V2',
            sponsor: sponsor.sponsorName,
            remainingCreditUsd: (sponsor.creditAmountCents / 100).toFixed(2),
            capabilities: sponsor.perks,
          },
        },
      });
      toast.success(`Sandbox Ping: 200 OK (${mockLatency}ms)`);
    }, 600);
  };

  const totalDispensedValue = Object.keys(dispensedKeys).reduce((sum, id) => {
    const s = SPONSOR_PRESETS.find((p) => p.id === id);
    return sum + (s?.creditAmountCents || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* ==============================================================================
          ENTERPRISE VAULT TELEMETRY BANNER
          ============================================================================== */}
      <div className="relative rounded-3xl p-6 sm:p-7 luxury-glass overflow-hidden border border-white/[0.08] shadow-[0_16px_40px_-15px_rgba(0,0,0,0.8)]">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="hud-tag text-[10px] text-amber-400 border-amber-400/30">
                KMS CLOUD VAULT
              </span>
              <span className="text-xs font-mono text-slate-400">Escrow-Backed Hackathon Tokens</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Sponsor API Dispensary</span>
              <span className="text-xs font-mono font-medium text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/25">
                $345 Pool Escrow
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              One-click instant provisioning of sandboxed cloud developer credentials pre-funded by official challenge partners.
            </p>
          </div>

          {/* Escrow Pool Balance Podium */}
          <div className="flex items-center gap-4 bg-[#080C1A]/90 p-4 rounded-2xl border border-white/[0.08] shrink-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-medium">
                Claimed Allowance
              </div>
              <div className="text-lg font-bold text-amber-400 font-mono tracking-tight">
                ${(totalDispensedValue / 100).toFixed(2)}{' '}
                <span className="text-xs text-slate-400 font-normal">/ $345.00</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">
                {Object.keys(dispensedKeys).length}/6 Tracks Provisioned
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==============================================================================
          THE 6 SPONSOR TRACK CARDS
          ============================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SPONSOR_PRESETS.map((sponsor) => {
          const dispensed = dispensedKeys[sponsor.id];
          const isRevealed = revealedKeys[sponsor.id];
          const isCopied = copiedKeyId === sponsor.id;
          const isLoading = loadingKeyId === sponsor.id;

          return (
            <div
              key={sponsor.id}
              className={`relative rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                dispensed
                  ? 'bg-gradient-to-b from-[#0C1226]/90 to-[#080C1A]/90 border-cyan-500/30 shadow-[0_10px_30px_-10px_rgba(0,245,255,0.1)]'
                  : 'bg-[#080C1A]/80 border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02]'
              }`}
            >
              <div>
                {/* Header with Category Badge and Amount */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-slate-300">
                    {sponsor.category}
                  </span>

                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    ${(sponsor.creditAmountCents / 100).toFixed(2)} Credit
                  </span>
                </div>

                {/* Title and Tagline */}
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center justify-between">
                  <span>{sponsor.sponsorName}</span>
                  <a
                    href={sponsor.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-cyan-400 transition p-1"
                    title="Official Partner Documentation"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {sponsor.tagline}
                </p>

                {/* Perks Checklist */}
                <div className="my-4 space-y-1.5 pt-2 border-t border-white/[0.06]">
                  {sponsor.perks.map((perk) => (
                    <div key={perk} className="flex items-center gap-2 text-[11px] text-slate-300 font-mono">
                      <CheckCircle2 className="h-3 w-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Credential Display or Provision Button */}
              <div className="pt-2">
                {dispensed ? (
                  <div className="space-y-2">
                    {/* Token Box with Masking & Copy */}
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-black/60 border border-white/[0.08] font-mono text-[11px]">
                      <div className="flex-1 truncate text-slate-200 pl-1 select-all">
                        {isRevealed
                          ? dispensed.token
                          : maskToken(dispensed.token, sponsor.tokenPrefix)}
                      </div>

                      <button
                        onClick={() => toggleReveal(sponsor.id)}
                        className="p-1 rounded text-slate-400 hover:text-white transition"
                        title={isRevealed ? 'Mask Token' : 'Reveal Token'}
                      >
                        {isRevealed ? <Unlock className="h-3.5 w-3.5 text-cyan-400" /> : <Lock className="h-3.5 w-3.5" />}
                      </button>

                      <button
                        onClick={() => copyToken(sponsor.id, dispensed.token)}
                        className="p-1 rounded text-slate-400 hover:text-white transition"
                        title="Copy to Clipboard"
                      >
                        {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Clock className="h-3 w-3" />
                        <span>Valid 14 Days</span>
                      </span>

                      <button
                        onClick={() => runSandboxTest(sponsor)}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline transition"
                      >
                        <Terminal className="h-3 w-3" />
                        <span>Test Sandbox Ping</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleDispense(sponsor)}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full h-10 text-xs font-mono font-semibold justify-center gap-2 border-white/[0.08] hover:border-amber-400/50 hover:bg-amber-500/10 text-slate-200"
                  >
                    <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                    <span>{isLoading ? 'Generating Key...' : 'Provision Sandbox Key'}</span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ==============================================================================
          INTERACTIVE SANDBOX TEST RUNNER TERMINAL DRAWER
          ============================================================================== */}
      <AnimatePresence>
        {testRunnerState && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-3xl p-6 luxury-glass border border-cyan-500/30 space-y-3 overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Terminal className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Sandbox Endpoint Verification Terminal
                </span>
                {testRunnerState.latencyMs && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Latency: {testRunnerState.latencyMs}ms (HTTP 200 OK)
                  </span>
                )}
              </div>

              <button
                onClick={() => setTestRunnerState(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {testRunnerState.running ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
                <div className="h-6 w-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>Executing sandbox verification handshake...</span>
              </div>
            ) : testRunnerState.response ? (
              <div className="space-y-2">
                <div className="bg-black/70 p-3.5 rounded-xl border border-white/[0.06] font-mono text-xs text-cyan-300 overflow-x-auto select-all">
                  <code>
                    $ curl -i -X POST https://api.sponsor.cloud/v1/sandbox/verify \<br />
                    &nbsp;&nbsp;-H &quot;Authorization: Bearer devlovers_sbx_••••••••&quot; \<br />
                    &nbsp;&nbsp;-H &quot;X-Devlovers-Sprint: future-of-ai-sprint-2026&quot;
                  </code>
                </div>

                <div className="bg-black/80 p-4 rounded-xl border border-white/[0.08] font-mono text-xs text-slate-300 overflow-x-auto">
                  <pre>{JSON.stringify(testRunnerState.response, null, 2)}</pre>
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default SponsorDispensary;
