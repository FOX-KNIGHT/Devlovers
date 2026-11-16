import { db, schema, isLiveDatabase } from '../client.js';
import { eq, desc, asc, and, gte } from 'drizzle-orm';
import data from '../../Project/LandingPage/data.js';

/**
 * Fetch list of hackathons with filtering and sorting
 */
export async function getHackathons(options = {}) {
  const { filter = 'all', sort = 'Newest', category = null, limit = 50, offset = 0 } = options;

  if (isLiveDatabase()) {
    try {
      const conditions = [];

      if (filter === 'upcoming') {
        conditions.push(eq(schema.hackathons.status, 'UPCOMING'));
      } else if (filter === 'ongoing') {
        conditions.push(eq(schema.hackathons.status, 'ACTIVE'));
      } else if (filter === 'prize') {
        conditions.push(gte(schema.hackathons.prizePoolCents, 2500000));
      }

      if (category && category !== 'all') {
        conditions.push(eq(schema.hackathons.category, category));
      }

      let orderBy = desc(schema.hackathons.createdAt);
      if (sort === 'Oldest') {
        orderBy = asc(schema.hackathons.createdAt);
      } else if (sort === 'High Bounty') {
        orderBy = desc(schema.hackathons.prizePoolCents);
      } else if (sort === 'Deadline Soon') {
        orderBy = asc(schema.hackathons.endsAt);
      }

      const results = await db.query.hackathons.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy,
        limit,
        offset,
        with: {
          squads: true,
          sponsorCredits: true,
        },
      });

      return results;
    } catch (err) {
      console.warn('Database query failed, falling back to local dataset:', err.message);
    }
  }

  // High-fidelity fallback from validated dataset
  let results = [...data.feedPosts];

  if (filter === 'upcoming') {
    results = results.filter((p) => p.status === 'UPCOMING');
  } else if (filter === 'ongoing') {
    results = results.filter((p) => p.status === 'ACTIVE' || p.status === 'ongoing');
  } else if (filter === 'remote') {
    results = results.filter((p) => p.tags?.some((t) => t.toLowerCase().includes('remote')));
  } else if (filter === 'prize') {
    results = results.filter((p) => (p.prize_cents || 0) >= 2500000);
  }

  if (category && category !== 'all') {
    results = results.filter((p) => p.category?.includes(category));
  }

  if (sort === 'High Bounty') {
    results.sort((a, b) => (b.prize_cents || 0) - (a.prize_cents || 0));
  } else if (sort === 'Deadline Soon') {
    results.sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
  }

  return results.slice(offset, offset + limit);
}

/**
 * Fetch a single hackathon by slug
 */
export async function getHackathonBySlug(slug) {
  if (!slug) return null;

  if (isLiveDatabase()) {
    try {
      const result = await db.query.hackathons.findFirst({
        where: eq(schema.hackathons.slug, slug),
        with: {
          squads: {
            with: {
              members: {
                with: {
                  user: true,
                },
              },
            },
          },
          submissions: true,
          sponsorCredits: true,
        },
      });
      if (result) return result;
    } catch (err) {
      console.warn('DB lookup by slug failed, checking fallback:', err.message);
    }
  }

  // Fallback matching slug, id, or common squad aliases
  const aliasMap = {
    'hackathon-alpha': 'future-of-ai-sprint-2026',
    'hackathon-beta': 'sustainable-web-challenge-2026',
    'climate-action-hack': 'mobile-app-marathon-2026',
    'global-tech-sprint': 'blockchain-innovation-summit-2027',
  };
  const targetSlug = aliasMap[slug] || slug;

  return data.feedPosts.find((p) => p.slug === targetSlug || p.slug === slug || p.id === Number(slug)) || null;
}

/**
 * Create a new hackathon
 */
export async function createHackathon(hackathonData) {
  if (isLiveDatabase()) {
    const [inserted] = await db.insert(schema.hackathons).values(hackathonData).returning();
    return inserted;
  }

  const newHackathon = {
    id: data.feedPosts.length + 1,
    ...hackathonData,
    createdAt: new Date().toISOString(),
  };
  return newHackathon;
}
