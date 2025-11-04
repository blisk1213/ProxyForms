import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API } from "app/utils/api-client";
import { db, authors, postAuthors } from "@/db";
import { eq, and } from "drizzle-orm";

export type Author = Omit<
  typeof authors.$inferSelect,
  "updatedAt" | "blogId"
>;

const keys = {
  authors: ["blog-authors"],
  postAuthors: ["blog-post-authors"],
};

export function useAuthorsQuery() {
  return useQuery({
    queryKey: keys.authors,
    queryFn: async () => {
      const data = await db.select({
        id: authors.id,
        slug: authors.slug,
        name: authors.name,
        bio: authors.bio,
        twitter: authors.twitter,
        website: authors.website,
      }).from(authors);
      return data;
    },
  });
}

export function useAuthors({ blogId }: { blogId: string }) {
  return useQuery({
    queryKey: keys.authors,
    queryFn: async () => {
      const data = await db.select({
        id: authors.id,
        slug: authors.slug,
        name: authors.name,
        createdAt: authors.createdAt,
        bio: authors.bio,
        twitter: authors.twitter,
        website: authors.website,
        imageUrl: authors.imageUrl,
      })
      .from(authors)
      .where(eq(authors.blogId, blogId));

      return data;
    },
  });
}

const api = API();
const createAuthor = api.v2.blogs[":blog_id"].authors.$post;
export type CreateAuthorInput = Parameters<typeof createAuthor>[0];

export function useCreateAuthor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (author: CreateAuthorInput) => await createAuthor(author),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.authors });
    },
  });
}

export function useDeleteAuthorMutation(blogId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (authorId: number) => {
      const result = await db
        .delete(authors)
        .where(
          and(
            eq(authors.blogId, blogId),
            eq(authors.id, authorId)
          )
        );

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: keys.authors,
      });
    },
  });
}

export function useUpdateAuthorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      form: CreateAuthorInput["form"];
      param: { blog_id: string; author_slug: string };
    }) => {
      const res = await api.v2.blogs[":blog_id"].authors[":author_slug"].$patch(
        {
          form: payload.form,
          param: {
            blog_id: payload.param.blog_id,
            author_slug: payload.param.author_slug,
          },
        }
      );

      if (!res.ok) {
        throw new Error(res.statusText);
      }

      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: keys.authors,
      });
    },
  });
}

export function usePostAuthorsQuery({
  postId,
  blogId,
}: {
  postId: string;
  blogId: string;
}) {
  return useQuery({
    queryKey: keys.postAuthors,
    enabled: !!postId && !!blogId,
    queryFn: async () => {
      const data = await db
        .select({
          id: postAuthors.id,
          post_id: postAuthors.postId,
          author_id: postAuthors.authorId,
          author: {
            name: authors.name,
            slug: authors.slug,
            imageUrl: authors.imageUrl,
          },
        })
        .from(postAuthors)
        .leftJoin(authors, eq(postAuthors.authorId, authors.id))
        .where(
          and(
            eq(postAuthors.postId, postId),
            eq(postAuthors.blogId, blogId)
          )
        );

      return data;
    },
  });
}

export function useAddPostAuthorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      post_id: string;
      author_id: number;
      blog_id: string;
    }) => {
      const result = await db.insert(postAuthors).values({
        postId: payload.post_id,
        authorId: payload.author_id,
        blogId: payload.blog_id,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: keys.postAuthors,
      });
    },
  });
}

export function useRemovePostAuthorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { post_id: string; author_id: number }) => {
      const result = await db
        .delete(postAuthors)
        .where(
          and(
            eq(postAuthors.postId, payload.post_id),
            eq(postAuthors.authorId, payload.author_id)
          )
        );
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: keys.postAuthors,
      });
    },
  });
}
