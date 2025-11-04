import { pgTable, text, timestamp, uuid, serial } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { blogs } from './blogs';
import { postAuthors } from './post-authors';

/**
 * Authors table - content creators
 * Separate from users to allow guest/external authors
 */
export const authors = pgTable('authors', {
  id: serial('id').primaryKey(),
  blogId: uuid('blog_id').notNull().references(() => blogs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  bio: text('bio'),
  imageUrl: text('image_url'),
  twitter: text('twitter'),
  website: text('website'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// Relations
export const authorsRelations = relations(authors, ({ one, many }) => ({
  blog: one(blogs, {
    fields: [authors.blogId],
    references: [blogs.id],
  }),
  postAuthors: many(postAuthors),
}));

export type Author = typeof authors.$inferSelect;
export type NewAuthor = typeof authors.$inferInsert;
