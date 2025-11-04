import { pgTable, text, timestamp, serial, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { subscriptionStatusEnum } from './enums';

/**
 * Subscriptions table - Stripe subscription tracking
 */
export const subscriptions = pgTable('subscriptions', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  stripeSubscriptionId: text('stripe_subscription_id').notNull(),
  status: subscriptionStatusEnum('status').notNull(),
  plan: text('plan'),
  subscription: json('subscription'), // Full Stripe subscription object
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

// Relations
export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

/**
 * Prices table - Stripe price objects
 */
export const prices = pgTable('prices', {
  id: serial('id').primaryKey(),
  stripePriceId: text('stripe_price_id').notNull().unique(),
  price: json('price').notNull(), // Full Stripe price object
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

/**
 * Products table - Stripe product objects
 */
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  stripeProductId: text('stripe_product_id').notNull().unique(),
  product: json('product').notNull(), // Full Stripe product object
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type Price = typeof prices.$inferSelect;
export type NewPrice = typeof prices.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
