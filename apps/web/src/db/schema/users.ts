import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { blogs } from './blogs';
import { posts } from './posts';
import { subscriptions } from './subscriptions';
import { onboardingSteps } from './onboarding-steps';

/**
 * Users table - synced from Clerk via webhooks
 * Stores user information from Clerk authentication
 */
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  blogs: many(blogs),
  posts: many(posts),
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
  onboardingStep: one(onboardingSteps, {
    fields: [users.id],
    references: [onboardingSteps.userId],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
