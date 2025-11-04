# ProxyForms Complete Database Schema Guide

## 📊 Database Overview

ProxyForms uses **PostgreSQL 17** with **Drizzle ORM** for type-safe database operations.

### Database Statistics
- **Total Tables:** 14
- **Total Columns:** ~95
- **Foreign Keys:** 15+
- **Enums:** 3
- **Migrations:** Auto-generated via Drizzle Kit

## 🗂️ Complete Schema Reference

### 1. Users Table

**Purpose:** Stores user data synced from Clerk authentication

```typescript
// apps/web/src/db/schema/users.ts
export const users = pgTable('users', {
  id: text('id').primaryKey(),              // Clerk user ID
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

**Relationships:**
- One-to-many with `blogs`
- One-to-many with `posts`
- One-to-one with `subscriptions`

### 2. Blogs Table

**Purpose:** Main content containers for blog sites

```typescript
// apps/web/src/db/schema/blogs.ts
export const blogs = pgTable('blogs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  emoji: text('emoji').notNull().default('📝'),
  slug: text('slug'),
  theme: text('theme').notNull().default('default'),
  twitter: text('twitter').notNull().default(''),
  instagram: text('instagram').notNull().default(''),
  website: text('website').notNull().default(''),
  accessToken: text('access_token'),         // API access token
  active: boolean('active').notNull().default(true),
  order: blogSortOrderEnum('order').notNull().default('latest'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

**Relationships:**
- Belongs to `users`
- One-to-many with `posts`, `categories`, `tags`, `authors`, `blog_images`, `api_keys`, `webhooks`

### 3. Posts Table

**Purpose:** Individual blog posts with rich content

```typescript
// apps/web/src/db/schema/posts.ts
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  blogId: uuid('blog_id').notNull().references(() => blogs.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  excerpt: text('excerpt').notNull().default(''),
  content: json('content'),                  // Tiptap JSON format
  htmlContent: text('html_content'),         // Rendered HTML
  coverImage: text('cover_image'),
  categoryId: integer('category_id'),
  published: boolean('published').notNull().default(false),
  publishedAt: timestamp('published_at'),
  deleted: boolean('deleted').notNull().default(false),
  meta: json('meta'),
  metadata: json('metadata'),                // Array of metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

**Relationships:**
- Belongs to `blogs` and `users`
- Many-to-many with `tags` (via `post_tags`)
- Many-to-many with `authors` (via `post_authors`)

### 4. Categories Table

**Purpose:** Organize posts into categories

```typescript
// apps/web/src/db/schema/categories.ts
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  blogId: uuid('blog_id').notNull().references(() => blogs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

**Relationships:**
- Belongs to `blogs`

### 5. Tags Table

**Purpose:** Flexible post tagging system

```typescript
// apps/web/src/db/schema/tags.ts
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  blogId: uuid('blog_id').notNull().references(() => blogs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

**Relationships:**
- Belongs to `blogs`
- Many-to-many with `posts` (via `post_tags`)

### 6. Authors Table

**Purpose:** Content authors (separate from users for guest authors)

```typescript
// apps/web/src/db/schema/authors.ts
export const authors = pgTable('authors', {
  id: serial('id').primaryKey(),
  blogId: uuid('blog_id').notNull().references(() => blogs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  bio: text('bio'),
  imageUrl: text('image_url'),
  twitter: text('twitter'),
  website: text('website'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

**Relationships:**
- Belongs to `blogs`
- Many-to-many with `posts` (via `post_authors`)

### 7. Post Tags Junction Table

**Purpose:** Many-to-many relationship between posts and tags

```typescript
// apps/web/src/db/schema/post-tags.ts
export const postTags = pgTable('post_tags', {
  id: serial('id').primaryKey(),
  blogId: uuid('blog_id').notNull().references(() => blogs.id, { onDelete: 'cascade' }),
  postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

### 8. Post Authors Junction Table

**Purpose:** Many-to-many relationship between posts and authors

```typescript
// apps/web/src/db/schema/post-authors.ts
export const postAuthors = pgTable('post_authors', {
  id: serial('id').primaryKey(),
  blogId: uuid('blog_id').notNull().references(() => blogs.id, { onDelete: 'cascade' }),
  postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  authorId: integer('author_id').notNull().references(() => authors.id, { onDelete: 'cascade' }),
});
```

### 9. Blog Images Table

**Purpose:** Track uploaded media files

```typescript
// apps/web/src/db/schema/media.ts
export const blogImages = pgTable('blog_images', {
  id: serial('id').primaryKey(),
  blogId: uuid('blog_id').notNull().references(() => blogs.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url'),
  contentType: text('content_type'),
  sizeInBytes: integer('size_in_bytes').notNull(),
  isVideo: boolean('is_video').default(false),
  uploadStatus: mediaStatusEnum('upload_status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

**Relationships:**
- Belongs to `blogs`

### 10. Subscriptions Table

**Purpose:** Track Stripe subscriptions

```typescript
// apps/web/src/db/schema/subscriptions.ts
export const subscriptions = pgTable('subscriptions', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  stripeSubscriptionId: text('stripe_subscription_id').notNull(),
  status: subscriptionStatusEnum('status').notNull(),
  plan: text('plan'),
  subscription: json('subscription'),       // Full Stripe object
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

**Relationships:**
- Belongs to `users` (one-to-one)

### 11. Prices Table

**Purpose:** Store Stripe price objects

```typescript
export const prices = pgTable('prices', {
  id: serial('id').primaryKey(),
  stripePriceId: text('stripe_price_id').notNull().unique(),
  price: json('price').notNull(),           // Full Stripe price object
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

### 12. Products Table

**Purpose:** Store Stripe product objects

```typescript
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  stripeProductId: text('stripe_product_id').notNull().unique(),
  product: json('product').notNull(),       // Full Stripe product object
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

### 13. API Keys Table

**Purpose:** Authentication for public API

```typescript
// apps/web/src/db/schema/api-keys.ts
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  blogId: uuid('blog_id').notNull().references(() => blogs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  key: text('key').notNull().unique(),
  active: boolean('active').notNull().default(true),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at'),
});
```

**Relationships:**
- Belongs to `blogs`

### 14. Webhooks Table

**Purpose:** Webhook event configuration

```typescript
// apps/web/src/db/schema/webhooks.ts
export const webhooks = pgTable('webhooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  blogId: uuid('blog_id').notNull().references(() => blogs.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  events: json('events').notNull().$type<string[]>(),
  active: boolean('active').notNull().default(true),
  secret: text('secret').notNull(),
  lastTriggeredAt: timestamp('last_triggered_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

**Relationships:**
- Belongs to `blogs`

## 🔗 Entity Relationship Diagram

```
users
  ├─→ blogs (one-to-many)
  │    ├─→ posts (one-to-many)
  │    │    ├─→ post_tags ─→ tags (many-to-many)
  │    │    └─→ post_authors ─→ authors (many-to-many)
  │    ├─→ categories (one-to-many)
  │    ├─→ tags (one-to-many)
  │    ├─→ authors (one-to-many)
  │    ├─→ blog_images (one-to-many)
  │    ├─→ api_keys (one-to-many)
  │    └─→ webhooks (one-to-many)
  ├─→ posts (one-to-many)
  └─→ subscriptions (one-to-one)
```

## 📝 Custom Enums

### Blog Sort Order
```typescript
export const blogSortOrderEnum = pgEnum('blog_sort_order', [
  'latest',
  'oldest',
  'alphabetical'
]);
```

### Media Status
```typescript
export const mediaStatusEnum = pgEnum('media_status', [
  'pending',
  'uploaded',
  'failed'
]);
```

### Subscription Status
```typescript
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'trialing',
  'unpaid',
]);
```

## 🚀 Usage Examples

### Query Examples

```typescript
import { db } from '@/db';
import { blogs, posts, users } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// Get all blogs for a user
const userBlogs = await db
  .select()
  .from(blogs)
  .where(eq(blogs.userId, userId));

// Get published posts with relations
const publishedPosts = await db
  .select()
  .from(posts)
  .where(and(
    eq(posts.blogId, blogId),
    eq(posts.published, true),
    eq(posts.deleted, false)
  ))
  .orderBy(desc(posts.publishedAt))
  .limit(10);

// Get post with tags and authors
const postWithRelations = await db.query.posts.findFirst({
  where: eq(posts.id, postId),
  with: {
    postTags: {
      with: {
        tag: true
      }
    },
    postAuthors: {
      with: {
        author: true
      }
    }
  }
});
```

### Insert Examples

```typescript
// Create a blog
const newBlog = await db.insert(blogs).values({
  userId: 'clerk_user_id',
  title: 'My Blog',
  description: 'A blog about tech',
  emoji: '💻',
  slug: 'my-blog'
}).returning();

// Create a post
const newPost = await db.insert(posts).values({
  blogId: blog.id,
  userId: userId,
  title: 'Hello World',
  slug: 'hello-world',
  content: tiptapJSON,
  htmlContent: '<p>Hello World</p>',
  published: true,
  publishedAt: new Date().toISOString()
}).returning();

// Add tags to post
await db.insert(postTags).values([
  { blogId: blog.id, postId: post.id, tagId: tag1.id },
  { blogId: blog.id, postId: post.id, tagId: tag2.id }
]);
```

### Update Examples

```typescript
// Update blog
await db.update(blogs)
  .set({
    title: 'Updated Title',
    updatedAt: new Date().toISOString()
  })
  .where(eq(blogs.id, blogId));

// Publish a post
await db.update(posts)
  .set({
    published: true,
    publishedAt: new Date().toISOString()
  })
  .where(eq(posts.id, postId));
```

### Delete Examples

```typescript
// Soft delete a post
await db.update(posts)
  .set({ deleted: true })
  .where(eq(posts.id, postId));

// Hard delete (cascades to related records)
await db.delete(blogs)
  .where(eq(blogs.id, blogId));
```

## 🛠️ Setup Commands

```bash
# Generate migrations
bun run db:generate

# Push schema to database
bun run db:push

# Run migrations
bun run db:migrate

# Open Drizzle Studio
bun run db:studio

# Reset database (WARNING: deletes all data)
bun run db:reset

# Using helper scripts
./scripts/setup-database.sh      # Full setup
./scripts/reset-database.sh      # Reset and start fresh
```

## 📦 File Structure

```
apps/web/src/db/
├── index.ts                    # Database client
├── schema/
│   ├── index.ts               # Export all schemas
│   ├── enums.ts               # PostgreSQL enums
│   ├── users.ts               # Users table
│   ├── blogs.ts               # Blogs table
│   ├── posts.ts               # Posts table
│   ├── categories.ts          # Categories table
│   ├── tags.ts                # Tags table
│   ├── authors.ts             # Authors table
│   ├── post-tags.ts           # Post-Tags junction
│   ├── post-authors.ts        # Post-Authors junction
│   ├── media.ts               # Blog images
│   ├── subscriptions.ts       # Subscriptions, prices, products
│   ├── api-keys.ts            # API keys
│   └── webhooks.ts            # Webhooks
└── migrations/
    ├── 0000_initial.sql       # Initial migration
    ├── 0001_api_webhooks.sql  # API & webhooks
    └── meta/                  # Migration metadata
```

## 🔒 Security Features

1. **Cascading Deletes** - Automatic cleanup of related data
2. **Foreign Key Constraints** - Data integrity enforcement
3. **Unique Constraints** - Prevent duplicates (emails, API keys, etc.)
4. **Default Values** - Safe defaults for new records
5. **Timestamps** - Track creation and updates
6. **Soft Deletes** - Posts can be recovered

## 📊 Performance Considerations

### Indexes
- Automatic indexes on primary keys
- Automatic indexes on foreign keys
- Unique indexes on email, slug, API keys

### Connection Pooling
```typescript
// apps/web/src/db/index.ts
const client = postgres(connectionString, {
  max: 10,              // Max connections
  idle_timeout: 20,     // Idle timeout
  connect_timeout: 10,  // Connect timeout
});
```

### Query Optimization Tips
1. Use `.select()` to only fetch needed columns
2. Use `.limit()` for pagination
3. Use indexes for frequently queried columns
4. Use relations for efficient joins
5. Cache frequently accessed data (Redis)

## 🎯 Next Steps

1. ✅ Schema created and migrations generated
2. ✅ Database client configured
3. ⏳ Push schema to database (requires Docker)
4. ⏳ Replace Supabase queries with Drizzle
5. ⏳ Test all CRUD operations
6. ⏳ Set up production database

## 📚 Resources

- [Drizzle ORM Docs](https://orm.drizzle.team)
- [PostgreSQL Docs](https://www.postgresql.org/docs/17/)
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Detailed setup guide
