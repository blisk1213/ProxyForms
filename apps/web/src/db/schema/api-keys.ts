import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { blogs } from './blogs';

/**
 * API Keys table - for public API authentication
 */
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  blogId: uuid('blog_id').notNull().references(() => blogs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  key: text('key').notNull().unique(),
  active: boolean('active').notNull().default(true),
  lastUsedAt: timestamp('last_used_at', { mode: 'string' }),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { mode: 'string' }),
});

// Relations
export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  blog: one(blogs, {
    fields: [apiKeys.blogId],
    references: [blogs.id],
  }),
}));

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
