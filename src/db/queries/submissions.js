import { db, schema, isLiveDatabase } from '../client.js';
import { eq } from 'drizzle-orm';

export async function getSubmissionsByHackathonSlug(slug) {
  if (isLiveDatabase()) {
    try {
      const hackathon = await db.query.hackathons.findFirst({
        where: eq(schema.hackathons.slug, slug),
        with: {
          submissions: {
            with: {
              squad: true,
              evaluations: true,
            },
          },
        },
      });
      if (hackathon) return hackathon.submissions;
    } catch (err) {
      console.warn('DB submissions query failed:', err.message);
    }
  }

  return [];
}

export async function createSubmission(submissionData) {
  if (isLiveDatabase()) {
    const [inserted] = await db.insert(schema.submissions).values(submissionData).returning();
    return inserted;
  }

  return {
    id: `sub-mock-${Date.now()}`,
    ...submissionData,
    status: 'SUBMITTED',
    createdAt: new Date().toISOString(),
  };
}
