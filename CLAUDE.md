# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ProxyForms** (formerly Zenblog) is a headless CMS web application designed for blogging. It serves both as a full-featured web application for creating and managing blog content, and provides a public API with TypeScript SDK for consuming blog content from external applications.

**Key Purpose**: A simple, affordable alternative to complex headless CMS solutions, allowing users to create multiple blogs, write posts with a rich text editor, and serve content via API to their own websites.

## Tech Stack

- **Runtime**: Bun (>=1.0.0)
- **Language**: TypeScript
- **Framework**: Next.js 14 with **hybrid App Router + Pages Router**
- **Database**: PostgreSQL 17 (Drizzle ORM)
- **Caching**: Redis 7
- **Storage**: MinIO (S3-compatible)
- **Auth**: Clerk
- **Payments**: Stripe
- **Email**: Resend
- **Monorepo**: Turborepo
- **UI**: Tailwind CSS, Radix UI primitives
- **Editor**: Tiptap with custom extensions
- **API Framework**: Hono (for public API routes)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query) + SWR

## Monorepo Structure

```
apps/
  web/              # Main Next.js application
packages/
  zenblog/          # TypeScript SDK (published as 'proxyforms' on npm)
  types/            # Shared TypeScript types
  code-block-sugar-high/  # Code syntax highlighting
  hash/             # Hashing utilities
```

## Common Commands

### Development
```bash
# Start all workspaces in dev mode
bun run dev

# Start specific workspace
bun run dev:web          # Web app on port 8082 with Stripe webhook
bun run dev:docs         # Documentation site
bun run dev:api          # API server

# Development with Stripe webhooks
bun run start            # Runs dev + stripe:webhook concurrently
```

### Building
```bash
# Build all workspaces
bun run build

# Build specific workspace
bun run build:web
bun run build:proxyforms    # SDK package
```

### Testing
```bash
bun test                 # Run Vitest tests
```

### Docker Services
```bash
bun run docker:up        # Start all Docker services (PostgreSQL, Redis, MinIO)
bun run docker:down      # Stop all Docker services
bun run docker:logs      # View logs from all services
```

### Database (PostgreSQL + Drizzle)
```bash
bun run db:start         # Start database services (PostgreSQL, Redis, MinIO)
bun run db:stop          # Stop database services
bun run db:reset         # Reset all data and restart services
bun run db:generate      # Generate Drizzle migrations
bun run db:migrate       # Run migrations
bun run db:push          # Push schema changes to database
bun run db:studio        # Open Drizzle Studio (database GUI)
```

### Stripe
```bash
bun run stripe:webhook   # Listen to Stripe webhooks (forwards to localhost:8082)
bun run stripe:event     # Trigger test payment event
bun run stripe:sync      # Sync Stripe data
```

### Code Quality
```bash
bun run format           # Format with Prettier
```

## Architecture & Key Concepts

### Hybrid Next.js Architecture

The web app uses **BOTH App Router and Pages Router simultaneously**:

- **App Router** (`/app`):
  - API routes using Hono framework
  - Public blog rendering (`/pub/[subdomain]`)
  - Marketing pages (docs, legal, free tools)
  - Forms functionality

- **Pages Router** (`/src/pages`):
  - Dashboard and blog management
  - Post editor
  - Analytics/insights
  - Settings and configuration

This hybrid approach allows gradual migration while maintaining functionality.

### Multi-Tenancy via Subdomains

- Middleware intercepts requests and rewrites `subdomain.proxyforms.com` to `/pub/[subdomain]`
- Each blog gets its own custom subdomain
- Invalid subdomains (www, localhost, etc.) filtered in middleware (`src/middleware.ts`)

### Web Application Structure (`apps/web`)

```
apps/web/
  app/                        # App Router
    api/
      public/                 # Public Hono API (external consumption)
      [...route]/             # Internal API routes
    pub/[subdomain]/          # Blog rendering by subdomain
    (blog)/                   # Marketing pages
    (docs)/                   # Documentation
    ui/                       # App Router UI components
  src/
    pages/                    # Pages Router (dashboard, editor)
    components/               # React components by feature
      Editor/                 # Tiptap editor
      Blogs/                  # Blog management UI
      Content/                # Content rendering
      ui/                     # Shared UI components
    db/
      schema/                 # Drizzle schemas by domain (blogs.ts, posts.ts, etc.)
      migrations/             # Database migrations
    lib/
      server/                 # Server utilities
      client/                 # Client utilities
      cache/                  # Redis caching layer
      storage/                # MinIO/S3 operations
      ai/                     # AI integration
    queries/                  # Database queries (separated from components)
    hooks/                    # React hooks
    middleware.ts             # Auth + subdomain routing
```

### Database Architecture

- **Schema Organization**: Separate files by domain entity (`blogs.ts`, `posts.ts`, `authors.ts`, etc.)
- **Database Views**: Optimized views like `posts_v10` denormalize data for read performance
- **Write vs Read**: Separate operations - views for reads, tables for writes
- **Type Safety**: `typeof table.$inferSelect` for type inference
- **Relations**: Defined using Drizzle relations API

### Caching Strategy (Redis)

Cache-aside pattern with `cacheGetOrSet()` utility:
- Automatic cache population on miss
- Different TTLs per content type:
  - Blogs: 5-30 minutes
  - Other data: 1 minute to 1 month
- Cache invalidation on content updates
- Non-blocking cache writes

### API Architecture

**Two API Layers:**

1. **Public API** (`/api/public`): Hono-based REST API
   - For external consumption of blog content
   - OpenAPI/Swagger documentation via Scalar
   - CORS enabled for cross-origin requests
   - Redis caching on all responses
   - Endpoints: posts, categories, tags, authors

2. **Private API** (`/api/[...route]`): Internal app API
   - Used by web application
   - Not publicly documented

### Storage (MinIO)

- S3-compatible object storage for images and media
- Pre-signed URLs for secure uploads
- AWS SDK for S3 operations
- Separate buckets for different content types
- Storage operations in `src/lib/storage/`

### ProxyForms SDK (`packages/zenblog`)

Published as `proxyforms` on npm:

```typescript
import { createProxyFormsClient } from 'proxyforms'

const client = createProxyFormsClient({ blogId: 'xxx' })

// API methods
await client.posts.list()
await client.posts.get({ slug: 'my-post' })
await client.categories.list()
await client.tags.list()
await client.authors.list()
await client.authors.get({ slug: 'author' })
```

Build with `bun run build:proxyforms`

### Content Storage & Rendering

- **Editor Format**: Tiptap JSON (structured content)
- **Delivery Format**: HTML rendering for public consumption
- **Media**: MinIO storage with pre-signed URLs
- **Images**: Optimization on upload
- **Code Highlighting**: Custom Sugar High integration

### Authentication (Clerk)

- Clerk middleware protects routes in `middleware.ts`
- Public route matcher for unauthenticated access
- Webhook integration for user lifecycle events
- User data synced to local database

### Payments (Stripe)

- Subscription management
- Webhook endpoint: `/api/webhooks/stripe`
- Local development: `bun run stripe:webhook` for webhook forwarding
- Test events: `bun run stripe:event`

## Development Workflow

### Initial Setup

1. Install dependencies: `bun install`
2. Copy environment file: `cp .env.example .env` and configure
3. Start Docker services: `bun run docker:up`
4. Run migrations: `bun run db:push`
5. Start dev server: `bun run dev:web` or `bun run start` (with Stripe webhooks)

### Daily Development

- **Web app**: http://localhost:8082
- **MinIO Console**: http://localhost:9001
- **Database GUI**: `bun run db:studio`

### Common Workflows

**Adding a Database Table:**
1. Create schema in `apps/web/src/db/schema/[entity].ts`
2. Export from `apps/web/src/db/schema/index.ts`
3. Generate migration: `bun run db:generate`
4. Apply: `bun run db:migrate` or `bun run db:push` (direct push)

**Creating a Component:**
- Place in feature directory: `apps/web/src/components/[Feature]/`
- Use Tailwind for styling
- Import UI primitives from `@/components/ui` or `/app/ui`
- Colocate hooks if component-specific

**API Development:**
- Public API: Use Hono in `/app/api/public`
- Apply Redis caching for read operations
- Follow RESTful conventions
- Include OpenAPI documentation

**Testing Stripe:**
1. `bun run stripe:webhook` (start listener)
2. `bun run stripe:event` (trigger test event)
3. Check handler in `/api/webhooks/stripe`

## Key Patterns & Conventions

### Database Queries
- Separate queries from components in `/src/queries`
- Use Drizzle query builder for type safety
- Leverage views for complex joins

### Component Organization
- Feature-based in `/src/components`
- UI primitives in `/src/components/ui` and `/app/ui`
- Editor components in `/src/components/Editor`

### Workspace Dependencies
Reference packages using workspace protocol:
```json
{
  "dependencies": {
    "@proxyforms/types": "*"
  }
}
```

### Environment Variables
- Uses `@t3-oss/env-nextjs` for compile-time validation
- Separate client/server schemas
- Type-safe access via `env.VARIABLE_NAME`

## Important Files

- `turbo.json` - Build caching and task dependencies
- `drizzle.config.ts` - Database configuration
- `docker-compose.yml` - Service definitions (PostgreSQL, Redis, MinIO)
- `apps/web/src/middleware.ts` - Auth and subdomain routing
- `apps/web/next.config.mjs` - Next.js configuration
- `.env.example` - Required environment variables

## Notes

- Project formerly called "Zenblog", now "ProxyForms" (both names appear in codebase)
- App runs on port **8082** by default
- Use **Bun** for all package management and runtime
- Docker services must be running for local development
- Turborepo caching speeds up builds - use `--filter` for specific packages
- Under active development, not yet accepting external contributions
