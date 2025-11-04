import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { posts, postTags, postAuthors } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { postSlug, post: postData, tags, authors, blogId, postId } = req.body;

    // Update post
    await db
      .update(posts)
      .set({
        ...postData,
        meta: postData.meta,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(posts.slug, postSlug));

    // Update tags if provided
    if (tags !== undefined) {
      // Delete existing tags
      await db
        .delete(postTags)
        .where(
          and(
            eq(postTags.postId, postId),
            eq(postTags.blogId, blogId)
          )
        );

      // Insert new tags
      if (tags.length > 0) {
        const newTags = tags.map((tag: { id: string }) => ({
          tagId: tag.id,
          blogId,
          postId,
        }));
        await db.insert(postTags).values(newTags);
      }
    }

    // Update authors if provided
    if (authors !== undefined) {
      // Delete existing authors
      await db
        .delete(postAuthors)
        .where(
          and(
            eq(postAuthors.postId, postId),
            eq(postAuthors.blogId, blogId)
          )
        );

      // Insert new authors
      if (authors.length > 0) {
        const newAuthors = authors.map((authorId: number) => ({
          authorId,
          postId,
          blogId,
        }));
        await db.insert(postAuthors).values(newAuthors);
      }
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error updating post:', error);
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'A post with that slug already exists', code: '23505' });
    }
    return res.status(500).json({ error: 'Failed to update post' });
  }
}
