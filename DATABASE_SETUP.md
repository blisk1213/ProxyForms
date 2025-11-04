# ProxyForms Database Setup Guide

This guide covers setting up the PostgreSQL database with Drizzle ORM.

## Database Schema Overview

The ProxyForms database consists of **14 tables** organized as follows:

### Core Tables
1. **users** - Clerk user data (synced via webhooks)
2. **blogs** - Blog containers (each user can have multiple blogs)
3. **posts** - Blog posts with Tiptap JSON content
4. **categories** - Post categories
5. **tags** - Post tags
6. **authors** - Content authors (separate from users for guest authors)

### Junction Tables
7. **post_tags** - Many-to-many relationship between posts and tags
8. **post_authors** - Many-to-many relationship between posts and authors

### Media & Assets
9. **blog_images** - Uploaded images and videos

### Payments (Stripe)
10. **subscriptions** - User subscriptions
11. **prices** - Stripe price objects
12. **products** - Stripe product objects

### API & Webhooks
13. **api_keys** - API authentication keys
14. **webhooks** - Webhook configurations

## Database Enums

```sql
-- Blog sorting options
CREATE TYPE blog_sort_order AS ENUM ('latest', 'oldest', 'alphabetical');

-- Media upload status
CREATE TYPE media_status AS ENUM ('pending', 'uploaded', 'failed');

-- Subscription status
CREATE TYPE subscription_status AS ENUM (
  'active',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'trialing',
  'unpaid'
);
```

## Prerequisites

1. **Docker & Docker Compose** installed
2. **Bun** package manager installed
3. **PostgreSQL 17** (via Docker)

## Quick Start

### 1. Start Docker Services

```bash
# Start PostgreSQL, Redis, and MinIO
bun run docker:up

# Or start just the database
bun run db:start
```

### 2. Verify Database Connection

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Test connection
docker exec -it proxyforms-postgres psql -U proxyforms -d proxyforms -c "SELECT version();"
```

### 3. Push Schema to Database

```bash
# Push schema (recommended for development)
bun run db:push

# Or run migrations (recommended for production)
bun run db:migrate
```

### 4. Verify Schema

```bash
# List all tables
docker exec -it proxyforms-postgres psql -U proxyforms -d proxyforms -c "\dt"

# Describe a specific table
docker exec -it proxyforms-postgres psql -U proxyforms -d proxyforms -c "\d users"
```

## Commands Reference

### Development Commands

```bash
# Generate new migrations after schema changes
bun run db:generate

# Push schema to database (no migration files)
bun run db:push

# Run pending migrations
bun run db:migrate

# Open Drizzle Studio (database GUI)
bun run db:studio

# Reset database (WARNING: deletes all data)
bun run db:reset
```

### Docker Commands

```bash
# Start all services
bun run docker:up

# Stop all services
bun run docker:down

# View logs
bun run docker:logs

# Start only database services
bun run db:start

# Stop database services
bun run db:stop
```

## Schema Files Structure

```
apps/web/src/db/
├── index.ts                 # Database client export
├── schema/
│   ├── index.ts            # Export all schemas
│   ├── enums.ts            # PostgreSQL enums
│   ├── users.ts            # Users table
│   ├── blogs.ts            # Blogs table
│   ├── posts.ts            # Posts table
│   ├── categories.ts       # Categories table
│   ├── tags.ts             # Tags table
│   ├── authors.ts          # Authors table
│   ├── post-tags.ts        # Post-Tags junction
│   ├── post-authors.ts     # Post-Authors junction
│   ├── media.ts            # Blog images
│   ├── subscriptions.ts    # Stripe subscriptions
│   ├── api-keys.ts         # API keys
│   └── webhooks.ts         # Webhooks
└── migrations/
    ├── 0000_initial.sql    # Initial migration
    ├── 0001_api_webhooks.sql # API keys and webhooks
    └── meta/               # Migration metadata
```

## Drizzle Configuration

Located at `/drizzle.config.ts`:

```typescript
export default {
  schema: './apps/web/src/db/schema/index.ts',
  out: './apps/web/src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://...',
  },
  verbose: true,
  strict: true,
} satisfies Config;
```

## Environment Variables

Required in `.env`:

```bash
# PostgreSQL connection string
DATABASE_URL=postgresql://proxyforms:proxyforms_dev_password@localhost:5432/proxyforms
```

## Schema Highlights

### Foreign Key Relationships

All tables have proper foreign key constraints with cascading deletes:

```sql
-- Example: Posts cascade delete when blog is deleted
"blog_id" uuid NOT NULL REFERENCES "blogs"("id") ON DELETE cascade

-- Example: Users cannot be deleted if they have blogs
"user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade
```

### Timestamps

All tables include:
- `created_at` - Automatically set on creation
- `updated_at` - Some tables track updates

### Default Values

Strategic defaults are set:
```sql
-- Blogs
active: true
emoji: '📝'
order: 'latest'

-- Posts
published: false
deleted: false

-- API Keys
active: true
```

## Drizzle Studio

Drizzle Studio provides a web-based database GUI:

```bash
# Start Drizzle Studio
bun run db:studio
```

Then open: http://localhost:4983

Features:
- Browse all tables
- Run queries
- Edit data
- View relationships
- Export data

## Migration Workflow

### Development Workflow

1. **Modify Schema**
   ```bash
   # Edit files in apps/web/src/db/schema/
   ```

2. **Generate Migration**
   ```bash
   bun run db:generate
   ```

3. **Review Migration**
   ```bash
   # Check generated SQL in apps/web/src/db/migrations/
   ```

4. **Apply Migration**
   ```bash
   bun run db:push  # For dev
   # OR
   bun run db:migrate  # For production
   ```

### Production Workflow

1. **Generate migrations locally**
2. **Test migrations in staging**
3. **Commit migration files to git**
4. **Deploy and run migrations in production**

```bash
# In production environment
DATABASE_URL=postgresql://... bun run db:migrate
```

## Common Issues & Solutions

### Issue: "Connection refused"

**Solution:** Start PostgreSQL container
```bash
bun run docker:up
```

### Issue: "Migration already applied"

**Solution:** Check migration history
```bash
docker exec -it proxyforms-postgres psql -U proxyforms -d proxyforms -c "SELECT * FROM drizzle.__drizzle_migrations;"
```

### Issue: "Column already exists"

**Solution:** Run `db:push` in development or create a new migration

### Issue: "Permission denied"

**Solution:** Check database credentials in `.env`

## Database Backup & Restore

### Backup

```bash
# Backup entire database
docker exec proxyforms-postgres pg_dump -U proxyforms proxyforms > backup.sql

# Backup specific table
docker exec proxyforms-postgres pg_dump -U proxyforms -t posts proxyforms > posts_backup.sql
```

### Restore

```bash
# Restore from backup
docker exec -i proxyforms-postgres psql -U proxyforms proxyforms < backup.sql
```

## Performance Optimization

### Indexes

Currently, Drizzle auto-generates indexes for:
- Primary keys
- Foreign keys
- Unique constraints

For custom indexes, add to schema:

```typescript
import { index } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  // ... columns
}, (table) => ({
  slugIdx: index('slug_idx').on(table.slug),
  publishedAtIdx: index('published_at_idx').on(table.publishedAt),
}));
```

### Connection Pooling

Configured in `apps/web/src/db/index.ts`:

```typescript
const client = postgres(connectionString, {
  max: 10,              // Maximum connections
  idle_timeout: 20,     // Idle connection timeout
  connect_timeout: 10,  // Connection timeout
});
```

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Use strong passwords** - Especially in production
3. **Limit database access** - Only allow necessary IPs
4. **Regular backups** - Automate daily backups
5. **Monitor connections** - Watch for connection leaks
6. **Use SSL in production** - Add `?sslmode=require` to connection string

## Next Steps

After setting up the database:

1. ✅ Verify all tables are created
2. ✅ Test database connections
3. ✅ Run Drizzle Studio to explore
4. ✅ Set up Clerk webhook to sync users
5. ✅ Create sample data for testing
6. ✅ Set up database backups

## Useful SQL Queries

### Check Table Sizes

```sql
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Count Records in All Tables

```sql
SELECT
  schemaname,
  tablename,
  n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;
```

### View Active Connections

```sql
SELECT
  pid,
  usename,
  application_name,
  client_addr,
  state
FROM pg_stat_activity
WHERE datname = 'proxyforms';
```

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [PostgreSQL 17 Documentation](https://www.postgresql.org/docs/17/)
- [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview)
- [Drizzle Kit CLI](https://orm.drizzle.team/kit-docs/overview)
