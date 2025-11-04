import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { posts, postTags, postAuthors } from '@/db/schema';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { post: postData, tags, authors, blogId } = req.body;

    // Create post
    const [newPost] = await db
      .insert(posts)
      .values({
        ...postData,
        blogId,
        userId,
        meta: postData.meta,
      })
      .returning({ id: posts.id, slug: posts.slug });

    if (!newPost) {
      return res.status(500).json({ error: "Failed to create post" });
    }

    // Create tag associations if any
    if (tags && tags.length > 0) {
      const newTags = tags.map((tag: { id: string }) => ({
        tagId: tag.id,
        blogId,
        postId: newPost.id,
      }));
      await db.insert(postTags).values(newTags);
    }

    // Create author associations if any
    if (authors && authors.length > 0) {
      const newAuthors = authors.map((authorId: number) => ({
        authorId,
        postId: newPost.id,
        blogId,
      }));
      await db.insert(postAuthors).values(newAuthors);
    }

    return res.status(200).json({ data: newPost });
  } catch (error: any) {
    console.error('Error creating post:', error);
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'A post with that slug already exists', code: '23505' });
    }
    return res.status(500).json({ error: 'Failed to create post' });
  }
}
