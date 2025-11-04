import { db } from "@/db";
import { categories } from "@/db/schema/categories";
import { posts } from "@/db/schema/posts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { eq, and, count, sql } from "drizzle-orm";

const keys = {
  list: ["categories", "categories-with-post-count"],
};

type Category = {
  id: number;
  slug: string;
  name: string;
  createdAt: string;
  blogId: string;
};

export function useCategoriesWithPostCount(blogId: string) {
  return useQuery({
    queryKey: keys.list,
    queryFn: async () => {
      const result = await db
        .select({
          category_id: categories.id,
          category_name: categories.name,
          category_slug: categories.slug,
          post_count: sql<number>`cast(count(${posts.id}) as int)`,
          created_at: categories.createdAt,
        })
        .from(categories)
        .leftJoin(posts, eq(categories.id, posts.categoryId))
        .where(eq(categories.blogId, blogId))
        .groupBy(categories.id, categories.name, categories.slug, categories.createdAt);

      return { data: result, error: null };
    },
  });
}

export function useCategories(blogId: string) {
  return useQuery({
    queryKey: keys.list,
    queryFn: async () => {
      const data = await db
        .select({
          id: categories.id,
          slug: categories.slug,
          name: categories.name,
          created_at: categories.createdAt,
        })
        .from(categories)
        .where(eq(categories.blogId, blogId));

      return data;
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: Omit<Category, "id" | "createdAt">) => {
      await db.insert(categories).values({
        blogId: category.blogId,
        name: category.name,
        slug: category.slug,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.list });
    },
  });
}

export function useDeleteCategoryMutation(blogId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: number) => {
      await db
        .delete(categories)
        .where(
          and(
            eq(categories.id, categoryId),
            eq(categories.blogId, blogId)
          )
        );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: keys.list,
      });
    },
    onError: (error) => {
      toast.error(error.message);
      console.error(error);
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: {
      id: number;
      name: string;
      slug: string;
    }) => {
      await db
        .update(categories)
        .set({
          name: category.name,
          slug: category.slug,
        })
        .where(eq(categories.id, category.id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: keys.list,
      });
    },
    onError: (error) => {
      toast.error(error.message);
      console.error(error);
    },
  });
}
