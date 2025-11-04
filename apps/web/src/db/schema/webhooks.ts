import { pgTable, text, timestamp, uuid, boolean, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { blogs } from './blogs';

/**
 * Webhooks table - for webhook event tracking
 */
export const webhooks = pgTable('webhooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  blogId: uuid('blog_id').notNull().references(() => blogs.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  events: json('events').notNull().$type<string[]>(), // Array of event types
  active: boolean('active').notNull().default(true),
  secret: text('secret').notNull(), // Webhook signing secret
  lastTriggeredAt: timestamp('last_triggered_at', { mode: 'string' }),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// Relations
export const webhooksRelations = relations(webhooks, ({ one }) => ({
  blog: one(blogs, {
    fields: [webhooks.blogId],
    references: [blogs.id],
  }),
}));

export type Webhook = typeof webhooks.$inferSelect;
export type NewWebhook = typeof webhooks.$inferInsert;
