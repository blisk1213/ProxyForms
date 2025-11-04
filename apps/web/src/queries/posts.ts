import { db, posts, postTags } from "@/db";
import { and, eq, desc } from "drizzle-orm";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/router";

export const usePostsQuery = ({
  pageSize = 10,
  sortBy = "created",
}: { pageSize?: number; sortBy?: "created" | "published" } = {}) => {
  const { query } = useRouter();
  const blogId = (Array.isArray(query.blogId) ? query.blogId[0] : query.blogId) || "";

  return useInfiniteQuery({
    queryKey: ["posts", blogId, sortBy, pageSize],
    enabled: !!blogId && blogId !== "",
    initialPageParam: 0,
    getNextPageParam: (lastPage: any, pages: any) => {
      return lastPage?.length > 0 ? pages.length * pageSize : undefined;
    },
    queryFn: async ({ pageParam = 0 }) => {
      if (!blogId) {
        return [];
      }
      const data = await db
        .select()
        .from(posts)
        .where(
          and(
            eq(posts.blogId, blogId),
            eq(posts.deleted, false)
          )
        )
        .orderBy(desc(sortBy === "created" ? posts.createdAt : posts.publishedAt))
        .limit(pageSize + 1)
        .offset(pageParam);

      return data;
    },
  });
};

export const usePostQuery = (postSlug: string, blogId: string) => {
  return useQuery({
    queryKey: ["post", postSlug],
    queryFn: async () => {
      const [post] = await db
        .select()
        .from(posts)
        .where(
          and(
            eq(posts.slug, postSlug),
            eq(posts.blogId, blogId)
          )
        )
        .limit(1);

      if (!post) {
        throw new Error("Post not found");
      }

      const tagsData = await db
        .select()
        .from(postTags)
        .where(eq(postTags.postId, post.id));

      return {
        data: {
          ...post,
          tags: tagsData,
        },
      };
    },
    enabled: !!postSlug,
  });
};

export const useUpdatePostTagsMutation = ({ blog_id }: { blog_id: string }) => {
  const queryClient = useQueryClient();

  type UpdatePostTagsMutation = {
    postId: string;
    tags: string[];
  };

  return useMutation({
    mutationFn: async ({ postId, tags }: UpdatePostTagsMutation) => {
      // TO DO: move this to an rfc

      // first, delete all tags for this post
      await db
        .delete(postTags)
        .where(eq(postTags.postId, postId));

      // then insert new tags
      if (tags.length > 0) {
        await db.insert(postTags).values(
          tags.map((tag) => ({
            postId: postId,
            tagId: tag,
            blogId: blog_id,
          }))
        );
      }

      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};
