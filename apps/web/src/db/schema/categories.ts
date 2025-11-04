import { pgTable, text, timestamp, uuid, serial } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { blogs } from './blogs';

/**
 * Categories table - post categorization
 */
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  blogId: uuid('blog_id').notNull().references(() => blogs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

// Relations
export const categoriesRelations = relations(categories, ({ one }) => ({
  blog: one(blogs, {
    fields: [categories.blogId],
    references: [blogs.id],
  }),
}));

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
