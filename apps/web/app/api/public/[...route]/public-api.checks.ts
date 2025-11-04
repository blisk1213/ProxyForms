/**
 * Checks if the code examples are valid with typescript
 */

import { createProxyFormsClient } from "proxyforms";

const proxyforms = createProxyFormsClient({
  blogId: "doesnt-matter",
});

const posts = await proxyforms.posts.list({
  limit: 100,
  offset: 0,
  tags: ["tag1", "tag2"],
  category: "category-slug",
  author: "author-slug",
});
const postsBySlug = await proxyforms.posts.get({
  slug: "slug",
});

const categories = await proxyforms.categories.list();
const tags = await proxyforms.tags.list();
const authors = await proxyforms.authors.list();
const authorBySlug = await proxyforms.authors.get({
  slug: "slug",
});

console.log(posts);
console.log(postsBySlug);
console.log(categories);
console.log(tags);
console.log(authors);
console.log(authorBySlug);
