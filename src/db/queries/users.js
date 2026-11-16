import { db, schema, isLiveDatabase } from '../client.js';
import { eq } from 'drizzle-orm';

export async function getUserById(id) {
  if (isLiveDatabase() && id) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, id),
        with: {
          createdSquads: true,
          squadMemberships: true,
        },
      });
      if (user) return user;
    } catch (err) {
      console.warn('DB getUserById error:', err.message);
    }
  }

  return {
    id: id || 'user-mock-1',
    username: 'developer',
    email: 'dev@devlovers.com',
    fullName: 'Elite Developer',
    role: 'USER',
  };
}

export async function getUserByUsername(username) {
  if (isLiveDatabase() && username) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.username, username),
      });
      if (user) return user;
    } catch (err) {
      console.warn('DB getUserByUsername error:', err.message);
    }
  }

  return null;
}

export async function createUser(userData) {
  if (isLiveDatabase() && userData) {
    try {
      const [inserted] = await db.insert(schema.users).values(userData).returning();
      return inserted;
    } catch (err) {
      console.warn('DB createUser error:', err.message);
    }
  }

  return {
    id: `user-${Date.now()}`,
    ...userData,
    createdAt: new Date().toISOString(),
  };
}
