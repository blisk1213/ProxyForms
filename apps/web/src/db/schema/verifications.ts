import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

/**
 * Verifications table for better-auth
 * Stores email verification tokens and password reset tokens
 */
export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(), // email address
  value: text('value').notNull(), // verification token
  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;
