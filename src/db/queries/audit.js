import { db, isLiveDatabase } from '../client.js';
import { auditLogs } from '../schema/index.js';
import { desc } from 'drizzle-orm';

let mockAuditLogs = [];

export async function logAuditEvent({ actorId, action, target, metadata = {} }) {
  const logItem = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    actorId,
    action,
    target,
    metadata,
    createdAt: new Date().toISOString(),
  };

  if (!isLiveDatabase()) {
    mockAuditLogs.unshift(logItem);
    return logItem;
  }

  try {
    const [inserted] = await db
      .insert(auditLogs)
      .values({ actorId, action, target, metadata })
      .returning();
    return inserted;
  } catch (error) {
    console.warn('DB logAuditEvent error, fallback to memory:', error.message);
    mockAuditLogs.unshift(logItem);
    return logItem;
  }
}

export async function getAuditLogs(limit = 50) {
  if (!isLiveDatabase()) {
    return mockAuditLogs.slice(0, limit);
  }

  try {
    return await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  } catch (error) {
    console.warn('DB getAuditLogs error, fallback to memory:', error.message);
    return mockAuditLogs.slice(0, limit);
  }
}
