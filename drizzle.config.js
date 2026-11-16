import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:5432/devlovers',
  },
  verbose: true,
  strict: true,
});
