import { pgTable, text, timestamp, uuid, boolean, integer, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { blogs } from './blogs';
import { users } from './users';
import { postTags } from './post-tags';
import { postAuthors } from './post-authors';

/**
 * Posts table - blog content
 * Stores individual blog posts with Tiptap JSON content
 */
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  blogId: uuid('blog_id').notNull().references(() => blogs.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  excerpt: text('excerpt').notNull().default(''),
  content: json('content'), // Tiptap JSON
  htmlContent: text('html_content'), // Rendered HTML
  coverImage: text('cover_image'),
  categoryId: integer('category_id'),
  published: boolean('published').notNull().default(false),
  publishedAt: timestamp('published_at', { mode: 'string' }),
  deleted: boolean('deleted').notNull().default(false),
  meta: json('meta'),
  metadata: json('metadata'), // Array of metadata objects
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// Relations
export const postsRelations = relations(posts, ({ one, many }) => ({
  blog: one(blogs, {
    fields: [posts.blogId],
    references: [blogs.id],
  }),
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  postTags: many(postTags),
  postAuthors: many(postAuthors),
}));

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
