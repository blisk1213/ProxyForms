# Official ProxyForms API Client

This is the official TypeScript client for ProxyForms, a headless CMS for blogging.

Link to docs: [https://proxyforms.com/docs](https://proxyforms.com/docs)
Link to the official website: [https://proxyforms.com](https://proxyforms.com)

## Install

```bash
npm install proxyforms
```

## Usage example

```typescript
import { createProxyFormsClient } from "proxyforms";

const cms = createProxyFormsClient({
  blogId: "MY_BLOG_ID", // Go to your blog settings to get your blog id
});

const posts = await cms.posts.list();
const post = await cms.posts.get({ slug: "post-slug" });
```
