import { pgTable, timestamp, uuid, serial } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { posts } from './posts';
import { tags } from './tags';
import { blogs } from './blogs';

/**
 * Post Tags junction table - many-to-many relationship
 */
export const postTags = pgTable('post_tags', {
  id: serial('id').primaryKey(),
  blogId: uuid('blog_id').notNull().references(() => blogs.id, { onDelete: 'cascade' }),
  postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

// Relations
export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
  blog: one(blogs, {
    fields: [postTags.blogId],
    references: [blogs.id],
  }),
}));

export type PostTag = typeof postTags.$inferSelect;
export type NewPostTag = typeof postTags.$inferInsert;
