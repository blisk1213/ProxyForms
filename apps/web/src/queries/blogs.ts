import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "@/db";
import { blogs } from "@/db/schema/blogs";
import { eq, asc } from "drizzle-orm";
import { useUser } from "@clerk/nextjs";

export const keys = {
  blogs: () => ["blogs"],
  blog: (blogId: string) => ["blog", blogId],
};

export const useBlogQuery = (blogId: string) =>
  useQuery({
    queryKey: keys.blog(blogId),
    queryFn: async () => {
      const result = await db
        .select({
          id: blogs.id,
          title: blogs.title,
          emoji: blogs.emoji,
          description: blogs.description,
          createdAt: blogs.createdAt,
          slug: blogs.slug,
          theme: blogs.theme,
          twitter: blogs.twitter,
          instagram: blogs.instagram,
          website: blogs.website,
        })
        .from(blogs)
        .where(eq(blogs.id, blogId))
        .limit(1);
      return result[0] || null;
    },
    enabled: !!blogId && blogId !== "demo",
  });

export const useBlogsQuery = ({ enabled }: { enabled: boolean }) =>
  useQuery({
    enabled,
    queryKey: keys.blogs(),
    queryFn: async () => {
      const data = await db
        .select()
        .from(blogs)
        .orderBy(asc(blogs.createdAt));
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

export const useCreateBlogMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (newBlog: {
      title: string;
      description: string;
      emoji: string;
      // slug: string;
    }) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      const result = await db.insert(blogs).values({
        ...newBlog,
        userId: user.id,
      }).returning();
      return { data: result[0], error: null };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.blogs() });
    },
  });
};

export const useUpdateBlogMutation = (opts?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      blogData: { id: string } & Partial<{
        title: string;
        description: string;
        emoji: string;
        theme: string;
        accessToken: string;
      }>
    ) => {
      const { id, ...updateData } = blogData;
      const result = await db
        .update(blogs)
        .set(updateData)
        .where(eq(blogs.id, id))
        .returning();
      return result[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.blogs() });
      opts?.onSuccess?.();
    },
  });
};

export const useDeleteBlogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blogId: string) => {
      await db.delete(blogs).where(eq(blogs.id, blogId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.blogs() });
    },
  });
};
