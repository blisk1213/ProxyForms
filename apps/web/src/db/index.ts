import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Disable prefetch as it's not supported for "Transaction" pool mode
const connectionString = process.env.DATABASE_URL || 'postgresql://proxyforms:proxyforms_dev_password@localhost:5432/proxyforms';

// Create the connection
const client = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create Drizzle instance
export const db = drizzle(client, { schema });

// Export types
export type Database = typeof db;
export * from './schema';
