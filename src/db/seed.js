import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';
import data from '../Project/LandingPage/data.js';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:5432/devlovers';

export async function runSeed() {
  console.log('🌱 Starting Devlovers database seed...');

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    // 1. Seed Users
    console.log('Inserting seed users...');
    const seedUsers = [
      {
        username: 'elena_ai',
        email: 'elena@devlovers.com',
        fullName: 'Elena Rostova',
        bio: 'Autonomous Agent Architect & ML Researcher',
        skills: ['Python', 'PyTorch', 'Agentic Systems'],
        githubHandle: 'elenarostova',
        role: 'USER',
      },
      {
        username: 'marcus_chen',
        email: 'marcus@devlovers.com',
        fullName: 'Marcus Chen',
        bio: 'Rust Core Engineer & WebAssembly Enthusiast',
        skills: ['Rust', 'WebAssembly', 'Distributed Systems'],
        githubHandle: 'marcuschen',
        role: 'USER',
      },
      {
        username: 'sophia_thorne',
        email: 'sophia@devlovers.com',
        fullName: 'Sophia Thorne',
        bio: 'Zero-Knowledge Cryptographer & Solidity Auditor',
        skills: ['Solidity', 'ZKP', 'Foundry'],
        githubHandle: 'sophiathorne',
        role: 'USER',
      },
      {
        username: 'judge_prime',
        email: 'judge@devlovers.com',
        fullName: 'Dr. Aris Thorne',
        bio: 'Chief Judge & Verification Arbiter',
        skills: ['Code Auditing', 'Evaluation', 'Security'],
        githubHandle: 'aristhorne',
        role: 'JUDGE',
      },
    ];

    const insertedUsers = [];
    for (const u of seedUsers) {
      const [user] = await db
        .insert(schema.users)
        .values(u)
        .onConflictDoUpdate({
          target: schema.users.username,
          set: { fullName: u.fullName, bio: u.bio, skills: u.skills },
        })
        .returning();
      insertedUsers.push(user);
    }
    console.log(`✅ Seeded ${insertedUsers.length} users`);

    // 2. Seed Hackathons
    console.log('Inserting hackathons...');
    for (const p of data.feedPosts) {
      await db
        .insert(schema.hackathons)
        .values({
          slug: p.slug,
          title: p.title,
          description: p.description,
          hostedBy: p.hostedBy,
          prizePoolCents: p.prize_cents || 2500000,
          currency: p.currency || 'USD',
          status: p.status === 'UPCOMING' ? 'UPCOMING' : 'ACTIVE',
          category: p.category?.split(' ')[0] || 'general',
          startsAt: new Date(p.starts_at || Date.now()),
          endsAt: new Date(p.deadline || Date.now() + 86400000 * 7),
          timezone: 'UTC',
          verifiedCommits: Boolean(p.verified_commits),
          participantsCount: parseInt(p.participants?.replace(/[^0-9]/g, '') || '100', 10),
          tags: p.tags || [],
          techStack: p.tech_stack || [],
          criteriaWeights: p.criteria_scores || { innovation: 35, technical_depth: 30, execution: 20, impact: 15 },
        })
        .onConflictDoUpdate({
          target: schema.hackathons.slug,
          set: {
            title: p.title,
            description: p.description,
            prizePoolCents: p.prize_cents || 2500000,
            status: p.status === 'UPCOMING' ? 'UPCOMING' : 'ACTIVE',
          },
        });
    }
    console.log(`✅ Seeded ${data.feedPosts.length} hackathons`);

    console.log('🎉 Database seed completed successfully!');
  } catch (err) {
    console.error('❌ Database seed error:', err);
    throw err;
  } finally {
    await client.end();
  }
}

if (process.argv[1]?.endsWith('seed.js')) {
  runSeed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
