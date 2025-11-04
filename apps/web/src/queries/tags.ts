import { db, tags, postTags } from "@/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eq, and, sql } from "drizzle-orm";

export const tagKeys = {
  tags: (blogId: string) => ["tags", blogId],
  postTags: (postId: string) => ["postTags", postId],
  tag: (tagId: string) => ["tags", tagId],
};

export function useTagsWithUsageQuery(
  { blogId }: { blogId: string },
  {
    enabled,
  }: {
    enabled: boolean;
  }
) {
  return useQuery({
    queryKey: tagKeys.tags(blogId),
    enabled: !!blogId && enabled,
    queryFn: async () => {
      // Query tags with post count
      const data = await db
        .select({
          tag_id: tags.id,
          blog_id: tags.blogId,
          tag_name: tags.name,
          slug: tags.slug,
          created_at: tags.createdAt,
          updated_at: tags.updatedAt,
          post_count: sql<number>`count(${postTags.id})`.as('post_count'),
        })
        .from(tags)
        .leftJoin(postTags, eq(postTags.tagId, tags.id))
        .where(eq(tags.blogId, blogId))
        .groupBy(tags.id, tags.blogId, tags.name, tags.slug, tags.createdAt, tags.updatedAt);

      return data;
    },
  });
}

export function useDeleteTagMutation(blogId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tagId: string) => {
      await db
        .delete(tags)
        .where(and(eq(tags.id, tagId), eq(tags.blogId, blogId)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.tags(blogId) });
    },
  });
}

export function useUpdateTagMutation(blogId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tag: { id: string; name: string; slug: string }) => {
      await db
        .update(tags)
        .set({
          name: tag.name,
          slug: tag.slug,
          updatedAt: sql`now()`,
        })
        .where(eq(tags.id, tag.id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.tags(blogId) });
    },
  });
}

export function usePostTags({
  post_id,
  blog_id,
}: {
  post_id: string;
  blog_id: string;
}) {
  return useQuery({
    queryKey: tagKeys.postTags(post_id),
    enabled: !!post_id && !!blog_id,
    queryFn: async () => {
      const data = await db
        .select({
          tags: {
            id: tags.id,
            name: tags.name,
            slug: tags.slug,
          },
        })
        .from(postTags)
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .where(and(eq(postTags.postId, post_id), eq(tags.blogId, blog_id)));

      return data;
    },
  });
}
