import { pgTable, text, timestamp, uuid, serial, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { blogs } from './blogs';
import { mediaStatusEnum } from './enums';

/**
 * Blog Images table - media file tracking
 */
export const blogImages = pgTable('blog_images', {
  id: serial('id').primaryKey(),
  blogId: uuid('blog_id').notNull().references(() => blogs.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url'),
  contentType: text('content_type'),
  sizeInBytes: integer('size_in_bytes').notNull(),
  isVideo: boolean('is_video').default(false),
  uploadStatus: mediaStatusEnum('upload_status').notNull().default('pending'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

// Relations
export const blogImagesRelations = relations(blogImages, ({ one }) => ({
  blog: one(blogs, {
    fields: [blogImages.blogId],
    references: [blogs.id],
  }),
}));

export type BlogImage = typeof blogImages.$inferSelect;
export type NewBlogImage = typeof blogImages.$inferInsert;
