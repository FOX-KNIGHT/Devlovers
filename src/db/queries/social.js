import { db, schema, isLiveDatabase } from '../client.js';
import { eq, and, desc } from 'drizzle-orm';

export async function toggleLike({ userId, hackathonId }) {
  if (isLiveDatabase() && userId && hackathonId) {
    try {
      const existing = await db.query.likes.findFirst({
        where: and(
          eq(schema.likes.userId, userId),
          eq(schema.likes.hackathonId, hackathonId)
        ),
      });

      if (existing) {
        await db.delete(schema.likes).where(eq(schema.likes.id, existing.id));
        return { liked: false };
      } else {
        await db.insert(schema.likes).values({ userId, hackathonId });
        return { liked: true };
      }
    } catch (err) {
      console.warn('DB toggleLike error, using fallback:', err.message);
    }
  }

  return { liked: true, mock: true };
}

export async function getHackathonComments(hackathonId) {
  if (isLiveDatabase() && hackathonId) {
    try {
      const comments = await db.query.comments.findMany({
        where: eq(schema.comments.hackathonId, hackathonId),
        orderBy: desc(schema.comments.createdAt),
        with: {
          user: true,
          replies: {
            with: {
              user: true,
            },
          },
        },
      });
      return comments;
    } catch (err) {
      console.warn('DB getHackathonComments error:', err.message);
    }
  }

  return [];
}

export async function addComment({ hackathonId, userId, parentId = null, body }) {
  if (isLiveDatabase() && hackathonId && userId && body) {
    try {
      const [inserted] = await db
        .insert(schema.comments)
        .values({
          hackathonId,
          userId,
          parentId,
          body,
        })
        .returning();
      return inserted;
    } catch (err) {
      console.warn('DB addComment error:', err.message);
    }
  }

  return {
    id: `comment-${Date.now()}`,
    hackathonId,
    userId,
    parentId,
    body,
    createdAt: new Date().toISOString(),
  };
}

export async function toggleBookmark({ userId, hackathonId }) {
  if (isLiveDatabase() && userId && hackathonId) {
    try {
      const existing = await db.query.bookmarks.findFirst({
        where: and(
          eq(schema.bookmarks.userId, userId),
          eq(schema.bookmarks.hackathonId, hackathonId)
        ),
      });

      if (existing) {
        await db.delete(schema.bookmarks).where(eq(schema.bookmarks.id, existing.id));
        return { bookmarked: false };
      } else {
        await db.insert(schema.bookmarks).values({ userId, hackathonId });
        return { bookmarked: true };
      }
    } catch (err) {
      console.warn('DB toggleBookmark error:', err.message);
    }
  }

  return { bookmarked: true, mock: true };
}
