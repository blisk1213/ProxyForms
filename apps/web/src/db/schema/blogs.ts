import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { posts } from './posts';
import { categories } from './categories';
import { tags } from './tags';
import { authors } from './authors';
import { blogImages } from './media';
import { blogSortOrderEnum } from './enums';

/**
 * Blogs table - main content container
 * Each user can have multiple blogs
 */
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
  accessToken: text('access_token'), // API access token
  active: boolean('active').notNull().default(true),
  order: blogSortOrderEnum('order').notNull().default('latest'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// Relations
export const blogsRelations = relations(blogs, ({ one, many }) => ({
  user: one(users, {
    fields: [blogs.userId],
    references: [users.id],
  }),
  posts: many(posts),
  categories: many(categories),
  tags: many(tags),
  authors: many(authors),
  images: many(blogImages),
}));

export type Blog = typeof blogs.$inferSelect;
export type NewBlog = typeof blogs.$inferInsert;
