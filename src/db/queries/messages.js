import { db, isLiveDatabase } from '../client.js';
import { conversations, conversationMembers, messages } from '../schema/index.js';
import { eq, desc } from 'drizzle-orm';

// In-memory mock conversations for offline fallback
let mockConversations = [
  {
    id: 'conv-1',
    createdAt: new Date().toISOString(),
    members: ['user-1', 'user-2'],
  },
];

let mockMessages = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-1',
    body: 'Hey squad! Are we ready to ship the final demo video?',
    createdAt: new Date().toISOString(),
  },
];

export async function getConversationMessages(conversationId) {
  if (!isLiveDatabase()) {
    return mockMessages.filter((m) => m.conversationId === conversationId);
  }

  try {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt));
  } catch (error) {
    console.warn('DB getConversationMessages error, using mock fallback:', error.message);
    return mockMessages.filter((m) => m.conversationId === conversationId);
  }
}

export async function sendMessage({ conversationId, senderId, body }) {
  if (!isLiveDatabase()) {
    const newMsg = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId,
      body,
      createdAt: new Date().toISOString(),
    };
    mockMessages.push(newMsg);
    return newMsg;
  }

  try {
    const [inserted] = await db
      .insert(messages)
      .values({ conversationId, senderId, body })
      .returning();
    return inserted;
  } catch (error) {
    console.warn('DB sendMessage error, using mock fallback:', error.message);
    const newMsg = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId,
      body,
      createdAt: new Date().toISOString(),
    };
    mockMessages.push(newMsg);
    return newMsg;
  }
}

export async function createConversation({ memberIds = [] }) {
  const convId = `conv-${Date.now()}`;
  if (!isLiveDatabase()) {
    const conv = {
      id: convId,
      createdAt: new Date().toISOString(),
      members: memberIds,
    };
    mockConversations.push(conv);
    return conv;
  }

  try {
    const [conv] = await db.insert(conversations).values({}).returning();
    if (memberIds.length > 0) {
      await db.insert(conversationMembers).values(
        memberIds.map((userId) => ({
          conversationId: conv.id,
          userId,
        }))
      );
    }
    return conv;
  } catch (error) {
    console.warn('DB createConversation error, using mock fallback:', error.message);
    const conv = {
      id: convId,
      createdAt: new Date().toISOString(),
      members: memberIds,
    };
    mockConversations.push(conv);
    return conv;
  }
}
