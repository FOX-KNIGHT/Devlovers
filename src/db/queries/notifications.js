import { db, isLiveDatabase } from '../client.js';
import { notifications } from '../schema/index.js';
import { eq, desc } from 'drizzle-orm';
import data from '../../Project/LandingPage/data.js';

let mockNotifications = [...data.notifications];

export async function getNotifications(userId) {
  if (!isLiveDatabase()) {
    return mockNotifications;
  }

  try {
    const query = db.select().from(notifications).orderBy(desc(notifications.createdAt));
    if (userId) {
      return await query.where(eq(notifications.userId, userId));
    }
    return await query;
  } catch (error) {
    console.warn('DB getNotifications error, using mock fallback:', error.message);
    return mockNotifications;
  }
}

export async function createNotification({ userId, message, category = 'system', time = 'Just now', link = null }) {
  const newItem = {
    id: `notif-${Date.now()}`,
    userId,
    message,
    category,
    time,
    unread: true,
    link,
    createdAt: new Date().toISOString(),
  };

  if (!isLiveDatabase()) {
    mockNotifications.unshift(newItem);
    return newItem;
  }

  try {
    const [inserted] = await db
      .insert(notifications)
      .values({ userId, message, category, time, link, unread: true })
      .returning();
    return inserted;
  } catch (error) {
    console.warn('DB createNotification error, using mock fallback:', error.message);
    mockNotifications.unshift(newItem);
    return newItem;
  }
}

export async function markNotificationRead(id) {
  if (!isLiveDatabase()) {
    mockNotifications = mockNotifications.map((n) =>
      String(n.id) === String(id) ? { ...n, unread: false } : n
    );
    return { success: true };
  }

  try {
    await db
      .update(notifications)
      .set({ unread: false })
      .where(eq(notifications.id, id));
    return { success: true };
  } catch (error) {
    console.warn('DB markNotificationRead error, using mock fallback:', error.message);
    mockNotifications = mockNotifications.map((n) =>
      String(n.id) === String(id) ? { ...n, unread: false } : n
    );
    return { success: true };
  }
}

export async function markAllNotificationsRead(userId) {
  if (!isLiveDatabase()) {
    mockNotifications = mockNotifications.map((n) => ({ ...n, unread: false }));
    return { success: true };
  }

  try {
    const q = db.update(notifications).set({ unread: false });
    if (userId) {
      await q.where(eq(notifications.userId, userId));
    } else {
      await q;
    }
    return { success: true };
  } catch (error) {
    console.warn('DB markAllNotificationsRead error, using mock fallback:', error.message);
    mockNotifications = mockNotifications.map((n) => ({ ...n, unread: false }));
    return { success: true };
  }
}
