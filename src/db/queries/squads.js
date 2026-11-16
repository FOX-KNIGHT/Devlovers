import { db, schema, isLiveDatabase } from '../client.js';
import { eq } from 'drizzle-orm';
import data from '../../Project/LandingPage/data.js';

export async function getSquadsByHackathonSlug(slug) {
  if (isLiveDatabase()) {
    try {
      const hackathon = await db.query.hackathons.findFirst({
        where: eq(schema.hackathons.slug, slug),
        with: {
          squads: {
            with: {
              creator: true,
              members: {
                with: {
                  user: true,
                },
              },
            },
          },
        },
      });
      if (hackathon) return hackathon.squads;
    } catch (err) {
      console.warn('DB squads query failed, using fallback:', err.message);
    }
  }

  // Fallback to data.squads
  const hackathon = data.feedPosts.find((p) => p.slug === slug || p.id === Number(slug));
  if (hackathon && data.squads) {
    return data.squads.filter((s) => s.hackathonId === hackathon.id || s.hackathonSlug === slug);
  }

  return data.squads || [];
}

export async function createSquad(squadData) {
  if (isLiveDatabase()) {
    const [inserted] = await db.insert(schema.squads).values(squadData).returning();
    return inserted;
  }

  return {
    id: `squad-mock-${Date.now()}`,
    ...squadData,
    createdAt: new Date().toISOString(),
  };
}
