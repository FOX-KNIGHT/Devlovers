import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:5432/devlovers';

export async function runMigrations() {
  console.log('🚀 Running database migrations from ./drizzle...');
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ All migrations applied successfully!');
  } catch (err) {
    console.error('❌ Migration execution error:', err.message);
    throw err;
  } finally {
    await client.end();
  }
}

if (process.argv[1]?.endsWith('migrate.js')) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
