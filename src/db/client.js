import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

let dbInstance = null;
let isConnected = false;

const connectionString = process.env.DATABASE_URL;

if (connectionString) {
  try {
    const client = postgres(connectionString, {
      max: process.env.NODE_ENV === 'production' ? 10 : 2,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    dbInstance = drizzle(client, { schema });
    isConnected = true;
  } catch (error) {
    console.warn('⚠️ PostgreSQL connection failed, falling back to local memory store:', error.message);
  }
}

export const db = dbInstance;
export const isLiveDatabase = () => isConnected && dbInstance !== null;
export { schema };
