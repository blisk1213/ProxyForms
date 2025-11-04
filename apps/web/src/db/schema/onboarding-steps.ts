import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

/**
 * Onboarding steps table
 * Tracks user progress through the onboarding process
 */
export const onboardingSteps = pgTable('onboarding_steps', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  hasBlog: boolean('has_blog').notNull().default(false),
  hasPublishedPost: boolean('has_published_post').notNull().default(false),
  hasIntegratedApi: boolean('has_integrated_api').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

// Relations
export const onboardingStepsRelations = relations(onboardingSteps, ({ one }) => ({
  user: one(users, {
    fields: [onboardingSteps.userId],
    references: [users.id],
  }),
}));

export type OnboardingStep = typeof onboardingSteps.$inferSelect;
export type NewOnboardingStep = typeof onboardingSteps.$inferInsert;
