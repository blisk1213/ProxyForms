import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default {
  schema: './apps/web/src/db/schema/index.ts',
  out: './apps/web/src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://proxyforms:proxyforms_dev_password@localhost:5432/proxyforms',
  },
  verbose: true,
  strict: true,
} satisfies Config;
