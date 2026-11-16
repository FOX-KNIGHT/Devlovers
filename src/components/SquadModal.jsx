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
import { Users, ShieldCheck, Plus, Sparkles, Send } from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-fx';
import { saveOfflineDraft } from '@/lib/storage/offline-drafts';
import data from '@/Project/LandingPage/data.js';
import { toast } from 'sonner';

export function SquadModal({ open, onOpenChange, post }) {
  const [joinedSquads, setJoinedSquads] = useState({});
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [squadName, setSquadName] = useState('');
  const [pitch, setPitch] = useState('');
  const [rolesInput, setRolesInput] = useState('');

  const relevantSquads = React.useMemo(() => {
    const all = data.squads || [];
    if (post?.hackathonId) {
      const filtered = all.filter((s) => s.hackathonId === post.hackathonId);
      if (filtered.length > 0) return filtered;
    }
    return all;
  }, [post?.hackathonId]);

  const handleJoinSquad = (squad) => {
    soundFx.playSuccess();
    setJoinedSquads((prev) => ({ ...prev, [squad.id]: true }));
    saveOfflineDraft(`squad_join_${squad.id}`, {
      squadId: squad.id,
      squadName: squad.name,
      hackathonTitle: post?.title,
      timestamp: new Date().toISOString(),
    });
    toast.success(`Request sent to join ${squad.name}!`, {
      description: 'Squad leader notified. Application draft saved offline.',
    });
  };

  const handleCreateSquad = (e) => {
    e.preventDefault();
    if (!squadName.trim()) return;

    soundFx.playSuccess();
    saveOfflineDraft(`my_squad_${post?.id || 'global'}`, {
      name: squadName,
      pitch,
      rolesNeeded: rolesInput.split(',').map((r) => r.trim()).filter(Boolean),
      hackathonTitle: post?.title,
      createdAt: new Date().toISOString(),
    });

    toast.success(`Squad "${squadName}" draft created!`, {
      description: 'Listed in squad matchmaking directory (saved locally).',
    });

    setSquadName('');
    setPitch('');
    setRolesInput('');
    setIsCreatingDraft(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-cyan-500/30 bg-[#0C0F1D]/98 backdrop-blur-2xl p-6 sm:rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Users className="h-4 w-4" />
            </div>
            <DialogTitle className="text-xl font-bold text-white tracking-tight">
              Squad Matchmaker & Teammates
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-400">
            Sprint: <strong className="text-cyan-300">{post?.title || 'Active Hackathon'}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Action Toggle */}
        <div className="flex items-center gap-2 pt-2 pb-3 border-b border-white/5">
          <Button
            size="sm"
            variant={!isCreatingDraft ? 'cyber' : 'outline'}
            onClick={() => setIsCreatingDraft(false)}
            className="text-xs h-8 font-semibold"
          >
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Open Squads ({relevantSquads.length})
          </Button>
          <Button
            size="sm"
            variant={isCreatingDraft ? 'cyber' : 'outline'}
            onClick={() => setIsCreatingDraft(true)}
            className="text-xs h-8 font-semibold"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Form New Squad
          </Button>
        </div>

        {/* Open Squads List */}
        {!isCreatingDraft ? (
          <div className="space-y-3 pt-3">
            {relevantSquads.map((squad) => {
              const hasJoined = joinedSquads[squad.id];

              return (
                <div
                  key={squad.id}
                  className="rounded-xl border border-white/10 bg-[#141A2E]/50 p-4 hover:border-cyan-500/30 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {squad.name}
                        <span className="hud-tag text-[9px] text-emerald-400 border-emerald-500/30">
                          {squad.compatibility} MATCH
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Led by <strong className="text-slate-300">{squad.leader}</strong> • {squad.membersCount}/{squad.maxMembers} devs
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant={hasJoined ? 'secondary' : 'cyber'}
                      onClick={() => handleJoinSquad(squad)}
                      disabled={hasJoined}
                      className="text-xs h-8 shrink-0 font-medium"
                    >
                      {hasJoined ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Requested
                        </span>
                      ) : (
                        'Join Squad'
                      )}
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] uppercase font-mono text-slate-500 mr-1">
                      Seeking:
                    </span>
                    {squad.rolesNeeded.map((role, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#0C0F1D] text-[10px] font-mono text-cyan-300 border border-cyan-500/20"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Form New Squad */
          <form onSubmit={handleCreateSquad} className="space-y-3 pt-3">
            <div>
              <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Squad Name
              </label>
              <input
                type="text"
                placeholder="e.g. CyberVanguard Collective"
                value={squadName}
                onChange={(e) => setSquadName(e.target.value)}
                required
                className="w-full h-9 rounded-lg bg-[#141A2E]/80 border border-white/10 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Mission & Project Pitch
              </label>
              <textarea
                placeholder="What are you building? Architecture, tech stack, and goals..."
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                rows={3}
                className="w-full rounded-lg bg-[#141A2E]/80 border border-white/10 p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Open Roles Needed (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Frontend Specialist, PyTorch / CUDA, Smart Contract Auditor"
                value={rolesInput}
                onChange={(e) => setRolesInput(e.target.value)}
                className="w-full h-9 rounded-lg bg-[#141A2E]/80 border border-white/10 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <Button type="submit" variant="cyber" className="w-full h-9 text-xs font-semibold">
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Publish Squad Recruitment Draft
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
