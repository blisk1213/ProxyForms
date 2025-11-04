import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { blogs } from './blogs';
import { postTags } from './post-tags';

/**
 * Tags table - flexible post tagging
 */
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  blogId: uuid('blog_id').notNull().references(() => blogs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// Relations
export const tagsRelations = relations(tags, ({ one, many }) => ({
  blog: one(blogs, {
    fields: [tags.blogId],
    references: [blogs.id],
  }),
  postTags: many(postTags),
}));

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
