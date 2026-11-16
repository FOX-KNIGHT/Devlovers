import test from 'node:test';
import assert from 'node:assert/strict';
import { getHackathons, getHackathonBySlug, createHackathon } from '../src/db/queries/hackathons.js';
import { getSquadsByHackathonSlug, createSquad } from '../src/db/queries/squads.js';
import { getGlobalLeaderboard } from '../src/db/queries/leaderboard.js';
import { getSubmissionsByHackathonSlug, createSubmission } from '../src/db/queries/submissions.js';
import { toggleLike, addComment, toggleBookmark } from '../src/db/queries/social.js';
import { getUserById, createUser } from '../src/db/queries/users.js';
import { submitEvaluation, calculateZScores } from '../src/db/queries/evaluations.js';
import { createConversation, sendMessage, getConversationMessages } from '../src/db/queries/messages.js';
import { logAuditEvent, getAuditLogs } from '../src/db/queries/audit.js';
import {
  getNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
} from '../src/db/queries/notifications.js';
import {
  registerUserForHackathon,
  getHackathonRegistrations,
  isUserRegistered,
} from '../src/db/queries/registrations.js';

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

  await t.test('social queries handle likes, comments, and bookmarks', async () => {
    const likeRes = await toggleLike({ userId: 'user-1', hackathonId: 'h-1' });
    assert.ok(typeof likeRes.liked === 'boolean');

    const comment = await addComment({
      hackathonId: 'h-1',
      userId: 'user-1',
      body: 'Stunning sprint challenge!',
    });
    assert.ok(comment.id);
    assert.equal(comment.body, 'Stunning sprint challenge!');

    const bookmarkRes = await toggleBookmark({ userId: 'user-1', hackathonId: 'h-1' });
    assert.ok(typeof bookmarkRes.bookmarked === 'boolean');
  });

  await t.test('user queries manage user accounts', async () => {
    const user = await getUserById('user-1');
    assert.ok(user);
    assert.ok(user.username);

    const newUser = await createUser({
      username: 'agent_coder',
      email: 'agent@devlovers.com',
      fullName: 'Agent Coder',
    });
    assert.ok(newUser.id);
    assert.equal(newUser.username, 'agent_coder');
  });

  await t.test('evaluations calculate z-scores for scoring normalization', async () => {
    const evalResult = await submitEvaluation({
      submissionId: 'sub-1',
      judgeId: 'judge-1',
      criteriaScores: { innovation: 30, technical_depth: 30 },
      rawScore: 92,
      feedback: 'Excellent execution',
    });
    assert.ok(evalResult.id);
    assert.equal(evalResult.rawScore, 92);

    const scores = [
      { id: 1, rawScore: 80 },
      { id: 2, rawScore: 90 },
      { id: 3, rawScore: 100 },
    ];
    const normalized = calculateZScores(scores);
    assert.equal(normalized.length, 3);
    assert.ok(normalized[0].zScore < 0, 'below mean should have negative z-score');
    assert.equal(normalized[1].zScore, 0, 'mean should have 0 z-score');
    assert.ok(normalized[2].zScore > 0, 'above mean should have positive z-score');
  });

  await t.test('direct message queries support conversations and messages', async () => {
    const conv = await createConversation({ memberIds: ['user-1', 'user-2'] });
    assert.ok(conv.id);

    const msg = await sendMessage({
      conversationId: conv.id,
      senderId: 'user-1',
      body: 'Let us build something incredible!',
    });
    assert.ok(msg.id);
    assert.equal(msg.body, 'Let us build something incredible!');

    const history = await getConversationMessages(conv.id);
    assert.ok(Array.isArray(history));
    assert.ok(history.length >= 1);
  });

  await t.test('audit logging captures platform events and actor actions', async () => {
    const log = await logAuditEvent({
      actorId: 'user-admin',
      action: 'APPROVE_SUBMISSION',
      target: 'sub-1',
      metadata: { reason: 'Meets all rubric standards' },
    });
    assert.ok(log.id);
    assert.equal(log.action, 'APPROVE_SUBMISSION');

    const recentLogs = await getAuditLogs(10);
    assert.ok(Array.isArray(recentLogs));
    assert.ok(recentLogs.length >= 1);
  });

  await t.test('notifications queries manage notifications and read states', async () => {
    const list = await getNotifications();
    assert.ok(Array.isArray(list));
    assert.ok(list.length > 0);

    const newNotif = await createNotification({
      userId: 'user-1',
      message: 'Sprint review completed',
      category: 'feedback',
    });
    assert.ok(newNotif.id);
    assert.equal(newNotif.unread, true);

    const markRes = await markNotificationRead(newNotif.id);
    assert.equal(markRes.success, true);

    const markAllRes = await markAllNotificationsRead();
    assert.equal(markAllRes.success, true);
  });

  await t.test('registrations queries manage participant registrations', async () => {
    const reg = await registerUserForHackathon({ hackathonId: '1', userId: 'user-2' });
    assert.ok(reg.id);
    assert.equal(reg.hackathonId, '1');

    const regs = await getHackathonRegistrations('1');
    assert.ok(Array.isArray(regs));
    assert.ok(regs.length >= 1);

    const isReg = await isUserRegistered({ hackathonId: '1', userId: 'user-2' });
    assert.equal(isReg, true);
  });
});
