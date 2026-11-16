import test from 'node:test';
import assert from 'node:assert/strict';
import { getHackathons, getHackathonBySlug, createHackathon } from '../src/db/queries/hackathons.js';
import { getSquadsByHackathonSlug, createSquad } from '../src/db/queries/squads.js';
import { getGlobalLeaderboard } from '../src/db/queries/leaderboard.js';
import { getSubmissionsByHackathonSlug, createSubmission } from '../src/db/queries/submissions.js';

test('database query repositories', async (t) => {
  await t.test('getHackathons returns all hackathons by default', async () => {
    const list = await getHackathons();
    assert.ok(Array.isArray(list), 'should return an array');
    assert.ok(list.length > 0, 'should have seeded hackathons');
    assert.ok(list[0].title, 'first item should have a title');
    assert.ok(typeof list[0].prize_cents === 'number' || typeof list[0].prizePoolCents === 'number');
  });

  await t.test('getHackathons filters by upcoming status', async () => {
    const upcoming = await getHackathons({ filter: 'upcoming' });
    assert.ok(Array.isArray(upcoming));
    for (const h of upcoming) {
      assert.equal(h.status?.toUpperCase(), 'UPCOMING');
    }
  });

  await t.test('getHackathons filters by high prize bounties', async () => {
    const highPrize = await getHackathons({ filter: 'prize' });
    assert.ok(Array.isArray(highPrize));
    for (const h of highPrize) {
      const prize = h.prize_cents || h.prizePoolCents || 0;
      assert.ok(prize >= 2500000, 'should be at least $25k');
    }
  });

  await t.test('getHackathonBySlug finds valid challenge', async () => {
    const sprint = await getHackathonBySlug('future-of-ai-sprint-2026');
    assert.ok(sprint, 'should find sprint by slug');
    assert.equal(sprint.slug, 'future-of-ai-sprint-2026');
    assert.ok(sprint.title.includes('AI'));
  });

  await t.test('getHackathonBySlug returns null for invalid slug', async () => {
    const sprint = await getHackathonBySlug('non-existent-hackathon-xyz');
    assert.equal(sprint, null);
  });

  await t.test('createHackathon produces valid record', async () => {
    const created = await createHackathon({
      slug: 'quantum-computing-summit-2027',
      title: 'Quantum Computing Summit 2027',
      description: 'Quantum circuits and algorithms sprint.',
      hostedBy: 'Qubit Labs',
      prize_cents: 7500000,
    });
    assert.ok(created, 'should create record');
    assert.equal(created.slug, 'quantum-computing-summit-2027');
  });

  await t.test('getSquadsByHackathonSlug returns squad listings', async () => {
    const squads = await getSquadsByHackathonSlug('future-of-ai-sprint-2026');
    assert.ok(Array.isArray(squads));
  });

  await t.test('createSquad produces valid squad record', async () => {
    const squad = await createSquad({
      name: 'Agentic Core',
      tagline: 'Building decentralized agent swarms',
      lookingFor: ['Rust Engineer', 'UI Specialist'],
    });
    assert.ok(squad.id);
    assert.equal(squad.name, 'Agentic Core');
  });

  await t.test('getGlobalLeaderboard returns ranked developers', async () => {
    const leaderboard = await getGlobalLeaderboard({ limit: 5 });
    assert.ok(Array.isArray(leaderboard));
    assert.ok(leaderboard.length <= 5);
    if (leaderboard.length > 0) {
      assert.equal(leaderboard[0].rank, 1);
      assert.ok(leaderboard[0].xp);
      assert.ok(leaderboard[0].name);
    }
  });

  await t.test('createSubmission registers project draft', async () => {
    const sub = await createSubmission({
      title: 'NeuroMesh',
      description: 'Edge-AI distributed telemetry',
      repoUrl: 'https://github.com/devlovers/neuromesh',
    });
    assert.ok(sub.id);
    assert.equal(sub.title, 'NeuroMesh');
    assert.equal(sub.status, 'SUBMITTED');
  });
});
