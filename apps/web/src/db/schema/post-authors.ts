import { pgTable, uuid, serial, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { posts } from './posts';
import { authors } from './authors';
import { blogs } from './blogs';

/**
 * Post Authors junction table - many-to-many relationship
 */
export const postAuthors = pgTable('post_authors', {
  id: serial('id').primaryKey(),
  blogId: uuid('blog_id').notNull().references(() => blogs.id, { onDelete: 'cascade' }),
  postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  authorId: integer('author_id').notNull().references(() => authors.id, { onDelete: 'cascade' }),
});

// Relations
export const postAuthorsRelations = relations(postAuthors, ({ one }) => ({
  post: one(posts, {
    fields: [postAuthors.postId],
    references: [posts.id],
  }),
  author: one(authors, {
    fields: [postAuthors.authorId],
    references: [authors.id],
  }),
  blog: one(blogs, {
    fields: [postAuthors.blogId],
    references: [blogs.id],
  }),
}));

export type PostAuthor = typeof postAuthors.$inferSelect;
export type NewPostAuthor = typeof postAuthors.$inferInsert;
