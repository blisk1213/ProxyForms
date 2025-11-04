import { cacheGet, cacheSet, cacheDel, cacheDelPattern, CacheTTL, cacheGetOrSet } from './index';

/**
 * Blog-specific caching utilities
 */

// Cache keys
export const BlogCacheKeys = {
  blog: (blogId: string) => `blog:${blogId}`,
  blogBySlug: (slug: string) => `blog:slug:${slug}`,
  userBlogs: (userId: string) => `user:${userId}:blogs`,
  post: (blogId: string, postId: string) => `blog:${blogId}:post:${postId}`,
  postBySlug: (blogId: string, slug: string) => `blog:${blogId}:post:slug:${slug}`,
  posts: (blogId: string, page: number = 1) => `blog:${blogId}:posts:${page}`,
  publishedPosts: (blogId: string, page: number = 1) => `blog:${blogId}:posts:published:${page}`,
  categories: (blogId: string) => `blog:${blogId}:categories`,
  tags: (blogId: string) => `blog:${blogId}:tags`,
  authors: (blogId: string) => `blog:${blogId}:authors`,
  postsByCategory: (blogId: string, categoryId: number, page: number = 1) =>
    `blog:${blogId}:category:${categoryId}:posts:${page}`,
  postsByTag: (blogId: string, tagId: string, page: number = 1) =>
    `blog:${blogId}:tag:${tagId}:posts:${page}`,
  postsByAuthor: (blogId: string, authorId: number, page: number = 1) =>
    `blog:${blogId}:author:${authorId}:posts:${page}`,
} as const;

/**
 * Cache a blog
 */
export async function cacheBlog(blogId: string, blog: any): Promise<boolean> {
  return await cacheSet(BlogCacheKeys.blog(blogId), blog, CacheTTL.ONE_HOUR);
}

/**
 * Get cached blog
 */
export async function getCachedBlog(blogId: string): Promise<any | null> {
  return await cacheGet(BlogCacheKeys.blog(blogId));
}

/**
 * Cache a post
 */
export async function cachePost(blogId: string, postId: string, post: any): Promise<boolean> {
  // Cache by ID and slug
  await cacheSet(BlogCacheKeys.post(blogId, postId), post, CacheTTL.TEN_MINUTES);

  if (post.slug) {
    await cacheSet(BlogCacheKeys.postBySlug(blogId, post.slug), post, CacheTTL.TEN_MINUTES);
  }

  return true;
}

/**
 * Get cached post by ID
 */
export async function getCachedPost(blogId: string, postId: string): Promise<any | null> {
  return await cacheGet(BlogCacheKeys.post(blogId, postId));
}

/**
 * Get cached post by slug
 */
export async function getCachedPostBySlug(blogId: string, slug: string): Promise<any | null> {
  return await cacheGet(BlogCacheKeys.postBySlug(blogId, slug));
}

/**
 * Cache posts list
 */
export async function cachePosts(
  blogId: string,
  posts: any[],
  page: number = 1,
  publishedOnly: boolean = false
): Promise<boolean> {
  const key = publishedOnly
    ? BlogCacheKeys.publishedPosts(blogId, page)
    : BlogCacheKeys.posts(blogId, page);

  return await cacheSet(key, posts, CacheTTL.FIVE_MINUTES);
}

/**
 * Get cached posts list
 */
export async function getCachedPosts(
  blogId: string,
  page: number = 1,
  publishedOnly: boolean = false
): Promise<any[] | null> {
  const key = publishedOnly
    ? BlogCacheKeys.publishedPosts(blogId, page)
    : BlogCacheKeys.posts(blogId, page);

  return await cacheGet(key);
}

/**
 * Cache categories
 */
export async function cacheCategories(blogId: string, categories: any[]): Promise<boolean> {
  return await cacheSet(BlogCacheKeys.categories(blogId), categories, CacheTTL.THIRTY_MINUTES);
}

/**
 * Get cached categories
 */
export async function getCachedCategories(blogId: string): Promise<any[] | null> {
  return await cacheGet(BlogCacheKeys.categories(blogId));
}

/**
 * Cache tags
 */
export async function cacheTags(blogId: string, tags: any[]): Promise<boolean> {
  return await cacheSet(BlogCacheKeys.tags(blogId), tags, CacheTTL.THIRTY_MINUTES);
}

/**
 * Get cached tags
 */
export async function getCachedTags(blogId: string): Promise<any[] | null> {
  return await cacheGet(BlogCacheKeys.tags(blogId));
}

/**
 * Invalidate all cache for a blog
 */
export async function invalidateBlogCache(blogId: string): Promise<number> {
  return await cacheDelPattern(`blog:${blogId}:*`);
}

/**
 * Invalidate cache for a specific post
 */
export async function invalidatePostCache(blogId: string, postId: string, slug?: string): Promise<void> {
  await cacheDel(BlogCacheKeys.post(blogId, postId));

  if (slug) {
    await cacheDel(BlogCacheKeys.postBySlug(blogId, slug));
  }

  // Invalidate posts lists
  await cacheDelPattern(`blog:${blogId}:posts:*`);
}

/**
 * Invalidate cache for categories
 */
export async function invalidateCategoriesCache(blogId: string): Promise<void> {
  await cacheDel(BlogCacheKeys.categories(blogId));
}

/**
 * Invalidate cache for tags
 */
export async function invalidateTagsCache(blogId: string): Promise<void> {
  await cacheDel(BlogCacheKeys.tags(blogId));
}

/**
 * Invalidate user's blogs cache
 */
export async function invalidateUserBlogsCache(userId: string): Promise<void> {
  await cacheDel(BlogCacheKeys.userBlogs(userId));
}
