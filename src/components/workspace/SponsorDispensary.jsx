'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  ExternalLink,
  Terminal,
  Play,
  Sparkles,
  Lock,
  Unlock,
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
        toast.success(`Dispensed $${(sponsor.creditAmountCents / 100).toFixed(2)} sandbox token for ${sponsor.sponsorName}!`);
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
    toast.success('API token copied to clipboard');
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const toggleReveal = (id) => {
    soundFx.playClick();
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const runSandboxTest = async (sponsor) => {
    soundFx.playClick();
    setTestRunnerState({ sponsorId: sponsor.id, running: true, response: null });

    // Simulate real sandbox API response after realistic latency
    setTimeout(() => {
      soundFx.playSuccess();
      const mockResult = {
        status: 200,
        statusText: 'OK',
        sponsor: sponsor.sponsorName,
        tokenPrefix: sponsor.tokenPrefix,
        authenticated: true,
        quotaRemaining: '$' + (sponsor.creditAmountCents / 100).toFixed(2),
        rateLimit: '1,000 req/min',
        latencyMs: Math.floor(Math.random() * 45) + 20,
        timestamp: new Date().toISOString(),
        payload: {
          message: 'Devlovers Sandbox Node Handshake Verified',
          capabilities: sponsor.perks,
          environment: 'hackathon-isolated-vpc',
        },
      };

      setTestRunnerState({
        sponsorId: sponsor.id,
        running: false,
        response: mockResult,
      });
      toast.success(`Sandbox ping to ${sponsor.sponsorName} returned 200 OK!`);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Telemetry Header */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="hud-tag text-[10px] text-amber-400 border-amber-400/40">SPONSOR API DISPENSARY</span>
            <span className="text-xs text-slate-400">Zero-Config Sandbox VPC</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">One-Click Sandboxed API Key Dispensary</h3>
          <p className="text-xs text-slate-400">
            Claim pre-funded hackathon developer credits, provision sandboxed tokens, and test requests live in seconds.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-black/40 px-4 py-2.5 rounded-xl border border-white/10">
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Total Bounties Pool</div>
            <div className="text-sm font-bold text-cyan-400 font-mono">$345.00 USD / Team</div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Active Keys</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">
              {Object.keys(dispensedKeys).length} / {SPONSOR_PRESETS.length} Claimed
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Sponsor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SPONSOR_PRESETS.map((sponsor) => {
          const dispensed = dispensedKeys[sponsor.id];
          const isRevealed = Boolean(revealedKeys[sponsor.id]);
          const isCopied = copiedKeyId === sponsor.id;
          const isLoading = loadingKeyId === sponsor.id;

          return (
            <motion.div
              key={sponsor.id}
              layout
              className={`rounded-2xl p-4.5 border transition-all flex flex-col justify-between ${
                dispensed
                  ? 'bg-amber-500/[0.03] border-amber-500/30 shadow-lg shadow-amber-500/5'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-amber-400 border border-white/5">
                      {sponsor.category}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{sponsor.sponsorName}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ${(sponsor.creditAmountCents / 100).toFixed(0)} Credits
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-3 line-clamp-2">{sponsor.tagline}</p>

                {/* Perks list */}
                <div className="space-y-1 mb-4">
                  {sponsor.perks.map((perk) => (
                    <div key={perk} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                      <Zap className="h-3 w-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Key Display or Dispense Button */}
              <div className="pt-3 border-t border-white/5">
                {dispensed ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <ShieldCheck className="h-3 w-3" />
                        Key Ready (Sandbox)
                      </span>
                      <span>Expires in 14d</span>
                    </div>

                    {/* Key box */}
                    <div className="flex items-center gap-1 bg-black/60 rounded-xl px-2.5 py-1.5 border border-white/10">
                      <Key className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="font-mono text-xs text-white truncate flex-1">
                        {isRevealed
                          ? dispensed.token
                          : `${dispensed.token.substring(0, 14)}••••••••••••`}
                      </span>

                      <button
                        onClick={() => toggleReveal(sponsor.id)}
                        className="p-1 text-slate-400 hover:text-white"
                        title={isRevealed ? 'Mask Token' : 'Reveal Token'}
                      >
                        {isRevealed ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                      </button>

                      <button
                        onClick={() => copyToken(sponsor.id, dispensed.token)}
                        className="p-1 text-slate-400 hover:text-cyan-400"
                        title="Copy to clipboard"
                      >
                        {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runSandboxTest(sponsor, dispensed)}
                        className="text-[11px] h-7 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10 flex-1 gap-1"
                      >
                        <Play className="h-3 w-3" />
                        Test Sandbox Ping
                      </Button>

                      <a
                        href={sponsor.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="h-7 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs"
                        title="Documentation"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleDispense(sponsor)}
                    disabled={isLoading}
                    className="w-full bg-white/5 hover:bg-amber-500/20 hover:text-amber-300 text-slate-200 border border-white/10 text-xs font-semibold h-8 gap-1.5 transition-all"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    {isLoading ? 'Dispensing Credential...' : 'Dispense Sandbox Key'}
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Sandbox Test Runner Console */}
      <AnimatePresence>
        {testRunnerState && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-2xl p-4 bg-black/80 border border-cyan-500/30 font-mono text-xs text-slate-300 space-y-2 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Terminal className="h-4 w-4" />
                <span>SANDBOX TEST RUNNER: {testRunnerState.sponsorId.toUpperCase()}</span>
              </div>
              <button
                onClick={() => setTestRunnerState(null)}
                className="text-slate-500 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            {testRunnerState.running ? (
              <div className="py-4 text-center text-cyan-300 flex items-center justify-center gap-2">
                <span className="animate-spin inline-block h-3 w-3 border-2 border-cyan-400 border-t-transparent rounded-full" />
                Handshaking with sandboxed edge VPC...
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                  <Check className="h-3 w-3" />
                  HTTP 200 OK — Handshake succeeded in {testRunnerState.response?.latencyMs}ms
                </div>
                <pre className="p-3 rounded-xl bg-black/60 border border-white/5 overflow-x-auto text-[11px] text-cyan-300">
                  {JSON.stringify(testRunnerState.response, null, 2)}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
