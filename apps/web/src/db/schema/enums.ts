import { pgEnum } from 'drizzle-orm/pg-core';

// Blog sorting options
export const blogSortOrderEnum = pgEnum('blog_sort_order', ['latest', 'oldest', 'alphabetical']);

// Media upload status
export const mediaStatusEnum = pgEnum('media_status', ['pending', 'uploaded', 'failed']);

// Subscription status (Stripe)
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'trialing',
  'unpaid',
]);
