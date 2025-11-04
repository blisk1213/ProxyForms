import { handle } from "hono/vercel";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { Hono } from "hono";
import {
  categories as categoriesRoute,
  postBySlug,
  posts as postsRoute,
  tags as tagsRoute,
  authors as authorsRoute,
  authorBySlug,
} from "./public-api.constants";
import { PublicApiResponse } from "./public-api.types";
import { Post, PostWithContent } from "@proxyforms/types";
import { throwError } from "./public-api.errors";
import { trackApiUsage } from "lib/axiom";
import {
  cacheGetOrSet,
  CacheTTL,
  getCachedPostBySlug,
  cachePost,
  getCachedCategories,
  cacheCategories,
  getCachedTags,
  cacheTags
} from "@/lib/cache";
import { db, posts, categories, tags, authors, postTags, postAuthors } from "@/db";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

const app = new Hono()
  .basePath("/api/public")
  .use("*", logger())
  .use("*", prettyJSON())
  .use("*", async (ctx, next) => {
    // middleware doesnt get the blogId param
    // so we need to get it from the url
    const blogId = ctx.req.url.split("/")[6];

    if (!blogId) {
      await next();
      return;
    }

    trackApiUsage({
      blogId,
      event: "api-usage",
      timestamp: new Date().toISOString(),
      path: ctx.req.url,
    });

    await next();
  });

app.get(postsRoute.path, async (c) => {
  const blogId = c.req.param("blogId");
  const offset = parseInt(c.req.query("offset") || "0");
  const limit = parseInt(c.req.query("limit") || "30");
  const categoryFilter = c.req.query("category");
  const tagsFilter = c.req.query("tags")?.split(",");
  const authorFilter = c.req.query("author");

  if (!blogId) {
    return throwError(c, "MISSING_BLOG_ID");
  }

  // Generate cache key based on query parameters
  const cacheKey = `posts:${blogId}:${offset}:${limit}:${categoryFilter || 'all'}:${tagsFilter?.join(',') || 'all'}:${authorFilter || 'all'}`;

  // Use cache-aside pattern
  const cachedResponse = await cacheGetOrSet<PublicApiResponse<Post[]>>(
    cacheKey,
    async () => {
      // Build base query conditions
      const conditions = [
        eq(posts.blogId, blogId),
        eq(posts.published, true),
        eq(posts.deleted, false),
      ];

      // Add category filter if provided
      if (categoryFilter) {
        const category = await db.query.categories.findFirst({
          where: and(
            eq(categories.blogId, blogId),
            eq(categories.slug, categoryFilter)
          ),
        });
        if (category) {
          conditions.push(eq(posts.categoryId, category.id));
        }
      }

      // Get author filter if provided
      let authorIdFilter: number | undefined;
      if (authorFilter) {
        const author = await db.query.authors.findFirst({
          where: and(
            eq(authors.blogId, blogId),
            eq(authors.slug, authorFilter)
          ),
        });
        authorIdFilter = author?.id;
      }

      // Fetch all blog tags for later mapping
      const blogTags = await db.query.tags.findMany({
        where: eq(tags.blogId, blogId),
        columns: {
          id: true,
          slug: true,
          name: true,
        },
      });

      // Fetch all blog authors for later mapping
      const blogAuthors = await db.query.authors.findMany({
        where: eq(authors.blogId, blogId),
        columns: {
          id: true,
          slug: true,
          name: true,
          imageUrl: true,
          bio: true,
          website: true,
          twitter: true,
        },
      });

      // Get posts with category
      const postsQuery = db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          publishedAt: posts.publishedAt,
          excerpt: posts.excerpt,
          coverImage: posts.coverImage,
          categoryId: posts.categoryId,
          categoryName: categories.name,
          categorySlug: categories.slug,
        })
        .from(posts)
        .leftJoin(categories, eq(posts.categoryId, categories.id))
        .where(and(...conditions))
        .orderBy(desc(posts.publishedAt))
        .limit(limit)
        .offset(offset);

      const postsResult = await postsQuery;

      // Count total posts
      const countResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(posts)
        .where(and(...conditions));

      const totalCount = countResult[0]?.count || 0;

      // Get post IDs for fetching tags and authors
      const postIds = postsResult.map(p => p.id);

      // Fetch post tags
      let postTagsMap = new Map<string, string[]>();
      if (postIds.length > 0) {
        const postTagsResult = await db
          .select({
            postId: postTags.postId,
            tagId: postTags.tagId,
          })
          .from(postTags)
          .where(inArray(postTags.postId, postIds));

        // Build map of postId to tag slugs
        for (const pt of postTagsResult) {
          const tag = blogTags.find(t => t.id === pt.tagId);
          if (tag) {
            if (!postTagsMap.has(pt.postId)) {
              postTagsMap.set(pt.postId, []);
            }
            postTagsMap.get(pt.postId)!.push(tag.slug);
          }
        }
      }

      // Fetch post authors
      let postAuthorsMap = new Map<string, number[]>();
      if (postIds.length > 0) {
        const postAuthorsResult = await db
          .select({
            postId: postAuthors.postId,
            authorId: postAuthors.authorId,
          })
          .from(postAuthors)
          .where(inArray(postAuthors.postId, postIds));

        // Build map of postId to author IDs
        for (const pa of postAuthorsResult) {
          if (!postAuthorsMap.has(pa.postId)) {
            postAuthorsMap.set(pa.postId, []);
          }
          postAuthorsMap.get(pa.postId)!.push(pa.authorId);
        }
      }

      // Filter by tags if provided
      let filteredPosts = postsResult;
      if (tagsFilter && tagsFilter.length > 0) {
        filteredPosts = postsResult.filter(post => {
          const postTagSlugs = postTagsMap.get(post.id) || [];
          return tagsFilter.some(tag => postTagSlugs.includes(tag));
        });
      }

      // Filter by author if provided
      if (authorIdFilter !== undefined) {
        filteredPosts = filteredPosts.filter(post => {
          const postAuthorIds = postAuthorsMap.get(post.id) || [];
          return postAuthorIds.includes(authorIdFilter);
        });
      }

      // Format the response
      const formattedPostsRes = filteredPosts.map((post) => {
        const postTagSlugs = postTagsMap.get(post.id) || [];
        const postAuthorIds = postAuthorsMap.get(post.id) || [];

        return {
          title: post.title,
          slug: post.slug,
          published_at: post.publishedAt,
          excerpt: post.excerpt,
          cover_image: post.coverImage,
          category:
            post.categoryName && post.categorySlug
              ? { name: post.categoryName, slug: post.categorySlug }
              : null,
          tags: blogTags.filter(tag => postTagSlugs.includes(tag.slug)),
          authors: blogAuthors
            .filter(author => postAuthorIds.includes(author.id))
            .map(({ id, imageUrl, ...author }) => ({
              ...author,
              image_url: imageUrl || "",
              bio: author.bio || undefined,
              website_url: author.website || undefined,
              twitter_url: author.twitter || undefined,
            })),
        };
      });

      return {
        data: formattedPostsRes as unknown as Post[],
        total: totalCount,
        offset,
        limit,
      };
    },
    CacheTTL.FIVE_MINUTES
  );

  return c.json(cachedResponse, 200);
});

app.get(postBySlug.path, async (c) => {
  const blogId = c.req.param("blogId");
  const slug = c.req.param("slug");

  if (!blogId || !slug) {
    return throwError(c, "MISSING_BLOG_ID_OR_SLUG");
  }

  // Generate cache key for this specific post
  const cacheKey = `post:${blogId}:slug:${slug}`;

  // Use cache-aside pattern
  const cachedPost = await cacheGetOrSet<{ data: PostWithContent }>(
    cacheKey,
    async () => {
      // Fetch the post with category
      const postResult = await db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          publishedAt: posts.publishedAt,
          excerpt: posts.excerpt,
          coverImage: posts.coverImage,
          htmlContent: posts.htmlContent,
          categoryName: categories.name,
          categorySlug: categories.slug,
        })
        .from(posts)
        .leftJoin(categories, eq(posts.categoryId, categories.id))
        .where(
          and(
            eq(posts.blogId, blogId),
            eq(posts.slug, slug),
            eq(posts.published, true),
            eq(posts.deleted, false)
          )
        )
        .limit(1);

      const post = postResult[0];

      if (!post) {
        throw new Error("NO_POSTS_FOUND");
      }

      // Fetch post tags
      const postTagsResult = await db
        .select({
          slug: tags.slug,
          name: tags.name,
        })
        .from(postTags)
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .where(eq(postTags.postId, post.id));

      // Fetch post authors
      const postAuthorsResult = await db
        .select({
          id: authors.id,
          slug: authors.slug,
          name: authors.name,
          imageUrl: authors.imageUrl,
          bio: authors.bio,
          website: authors.website,
          twitter: authors.twitter,
        })
        .from(postAuthors)
        .innerJoin(authors, eq(postAuthors.authorId, authors.id))
        .where(eq(postAuthors.postId, post.id));

      // Format the response
      const formattedPost: PostWithContent = {
        title: post.title || "",
        slug: post.slug || "",
        published_at: post.publishedAt || "",
        excerpt: post.excerpt || "",
        cover_image: post.coverImage || "",
        tags: postTagsResult,
        category:
          !post.categoryName || !post.categorySlug
            ? null
            : {
                name: post.categoryName,
                slug: post.categorySlug,
              },
        authors: postAuthorsResult.map(({ id, imageUrl, ...author }) => ({
          ...author,
          image_url: imageUrl || "",
          bio: author.bio || undefined,
          website_url: author.website || undefined,
          twitter_url: author.twitter || undefined,
        })),
        html_content: post.htmlContent || "",
      };

      return { data: formattedPost };
    },
    CacheTTL.TEN_MINUTES
  );

  return c.json(cachedPost);
});

app.get(categoriesRoute.path, async (c) => {
  const blogId = c.req.param("blogId");
  const offset = parseInt(c.req.query("offset") || "0");
  const limit = parseInt(c.req.query("limit") || "30");

  if (!blogId) {
    return throwError(c, "MISSING_BLOG_ID");
  }

  const cacheKey = `categories:${blogId}:${offset}:${limit}`;

  const cachedResponse = await cacheGetOrSet(
    cacheKey,
    async () => {
      // Fetch categories
      const categoriesResult = await db
        .select({
          name: categories.name,
          slug: categories.slug,
        })
        .from(categories)
        .where(eq(categories.blogId, blogId))
        .limit(limit)
        .offset(offset);

      // Count total categories
      const countResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(categories)
        .where(eq(categories.blogId, blogId));

      const totalCount = countResult[0]?.count || 0;

      return {
        data: categoriesResult,
        total: totalCount,
        offset,
        limit,
      };
    },
    CacheTTL.THIRTY_MINUTES
  );

  return c.json(cachedResponse);
});

app.get(tagsRoute.path, async (c) => {
  const blogId = c.req.param("blogId");
  const offset = parseInt(c.req.query("offset") || "0");
  const limit = parseInt(c.req.query("limit") || "30");

  if (!blogId) {
    return throwError(c, "MISSING_BLOG_ID");
  }

  const cacheKey = `tags:${blogId}:${offset}:${limit}`;

  const cachedResponse = await cacheGetOrSet(
    cacheKey,
    async () => {
      // Fetch tags
      const tagsResult = await db
        .select({
          name: tags.name,
          slug: tags.slug,
        })
        .from(tags)
        .where(eq(tags.blogId, blogId))
        .limit(limit)
        .offset(offset);

      // Count total tags
      const countResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(tags)
        .where(eq(tags.blogId, blogId));

      const totalCount = countResult[0]?.count || 0;

      return {
        data: tagsResult,
        total: totalCount,
        offset,
        limit,
      };
    },
    CacheTTL.THIRTY_MINUTES
  );

  return c.json(cachedResponse);
});

app.get(authorsRoute.path, async (c) => {
  const blogId = c.req.param("blogId");
  const offset = parseInt(c.req.query("offset") || "0");
  const limit = parseInt(c.req.query("limit") || "30");

  if (!blogId) {
    return throwError(c, "MISSING_BLOG_ID");
  }

  const cacheKey = `authors:${blogId}:${offset}:${limit}`;

  const cachedResponse = await cacheGetOrSet(
    cacheKey,
    async () => {
      // Fetch authors
      const authorsResult = await db
        .select({
          name: authors.name,
          slug: authors.slug,
          image_url: authors.imageUrl,
          twitter: authors.twitter,
          website: authors.website,
          bio: authors.bio,
        })
        .from(authors)
        .where(eq(authors.blogId, blogId))
        .limit(limit)
        .offset(offset);

      // Count total authors
      const countResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(authors)
        .where(eq(authors.blogId, blogId));

      const totalCount = countResult[0]?.count || 0;

      return {
        data: authorsResult,
        total: totalCount,
        offset,
        limit,
      };
    },
    CacheTTL.THIRTY_MINUTES
  );

  return c.json(cachedResponse);
});

app.get(authorBySlug.path, async (c) => {
  const blogId = c.req.param("blogId");
  const slug = c.req.param("slug");

  if (!blogId || !slug) {
    return throwError(c, "MISSING_BLOG_ID_OR_SLUG");
  }

  const cacheKey = `author:${blogId}:slug:${slug}`;

  const cachedAuthor = await cacheGetOrSet(
    cacheKey,
    async () => {
      // Fetch author by slug
      const authorResult = await db
        .select({
          name: authors.name,
          slug: authors.slug,
          image_url: authors.imageUrl,
          twitter: authors.twitter,
          website: authors.website,
          bio: authors.bio,
        })
        .from(authors)
        .where(
          and(
            eq(authors.blogId, blogId),
            eq(authors.slug, slug)
          )
        )
        .limit(1);

      const author = authorResult[0];

      if (!author) {
        throw new Error("AUTHOR_NOT_FOUND");
      }

      return {
        data: {
          ...author,
          image_url: author.image_url || "",
          bio: author.bio || "",
          website: author.website || "",
          twitter: author.twitter || "",
        },
      };
    },
    CacheTTL.THIRTY_MINUTES
  );

  return c.json(cachedAuthor);
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
