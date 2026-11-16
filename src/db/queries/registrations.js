import { db, isLiveDatabase } from '../client.js';
import { hackathonRegistrations } from '../schema/index.js';
import { eq, and } from 'drizzle-orm';

let mockRegistrations = [
  { id: 'reg-1', hackathonId: '1', userId: 'user-1', registeredAt: new Date().toISOString() },
];

export async function registerUserForHackathon({ hackathonId, userId }) {
  const newReg = {
    id: `reg-${Date.now()}`,
    hackathonId,
    userId,
    registeredAt: new Date().toISOString(),
  };

  if (!isLiveDatabase()) {
    mockRegistrations.push(newReg);
    return newReg;
  }

  try {
    const [inserted] = await db
      .insert(hackathonRegistrations)
      .values({ hackathonId, userId })
      .returning();
    return inserted;
  } catch (error) {
    console.warn('DB registerUserForHackathon error, using mock fallback:', error.message);
    mockRegistrations.push(newReg);
    return newReg;
  }
}

export async function getHackathonRegistrations(hackathonId) {
  if (!isLiveDatabase()) {
    return mockRegistrations.filter((r) => String(r.hackathonId) === String(hackathonId));
  }

  try {
    return await db
      .select()
      .from(hackathonRegistrations)
      .where(eq(hackathonRegistrations.hackathonId, hackathonId));
  } catch (error) {
    console.warn('DB getHackathonRegistrations error, using mock fallback:', error.message);
    return mockRegistrations.filter((r) => String(r.hackathonId) === String(hackathonId));
  }
}

export async function isUserRegistered({ hackathonId, userId }) {
  if (!isLiveDatabase()) {
    return mockRegistrations.some(
      (r) => String(r.hackathonId) === String(hackathonId) && String(r.userId) === String(userId)
    );
  }

  try {
    const records = await db
      .select()
      .from(hackathonRegistrations)
      .where(
        and(
          eq(hackathonRegistrations.hackathonId, hackathonId),
          eq(hackathonRegistrations.userId, userId)
        )
      );
    return records.length > 0;
  } catch (error) {
    console.warn('DB isUserRegistered error, using mock fallback:', error.message);
    return mockRegistrations.some(
      (r) => String(r.hackathonId) === String(hackathonId) && String(r.userId) === String(userId)
    );
  }
}
