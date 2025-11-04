import { CodeBlockComponent } from "@/components/code-block";
import { DocsPageLayout } from "app/ui/docs-page-layout";

export default function GettingStarted() {
  const items = [
    { title: "Install ProxyForms", href: "install-proxyforms" },
    { title: "Initialize ProxyForms", href: "initialize-proxyforms" },
    { title: "Fetch your posts", href: "fetch-your-posts" },
    { title: "Render your posts", href: "render-your-posts" },
    {
      title: "Fetch a single post with content",
      href: "fetch-a-single-post",
    },
    { title: "Render your post", href: "render-your-post" },
  ] as const;

  return (
    <DocsPageLayout
      tocItems={items as any}
      title="Getting started"
      description="Welcome to the ProxyForms documentation. To get started, you need to create a blog in the ProxyForms dashboard and grab your API key."
    >
      <div className="prose prose-headings:font-medium mt-8 max-w-none">
        <h2 id={items[0].href}>{items[0].title}</h2>
        <CodeBlockComponent filename="Terminal" language="sh">
          {`npm install proxyforms`}
        </CodeBlockComponent>

        <h2 id={items[1].href}>{items[1].title}</h2>
        <p>Initialize ProxyForms with your API key.</p>
        <CodeBlockComponent
          filename="cms/index.tsx"
          language="typescript"
          highlightedLines={[]}
        >
          {`import { createProxyFormsClient } from "proxyforms";

const proxyforms = createProxyFormsClient({ blogId: process.env.ZENBLOG_BLOG_ID });`}
        </CodeBlockComponent>

        <h2 id={items[2].href}>{items[2].title}</h2>
        <p>Fetch your posts from the ProxyForms API.</p>
        <CodeBlockComponent
          filename="cms/index.tsx"
          language="typescript"
          highlightedLines={[5]}
        >
          {`import { createProxyFormsClient } from "proxyforms";

const proxyforms = createProxyFormsClient({ blogId: process.env.ZENBLOG_BLOG_ID });
        
const posts = await proxyforms.posts.list();`}
        </CodeBlockComponent>

        <h2 id={items[3].href}>{items[3].title}</h2>
        <p>Render your posts in your app.</p>
        <CodeBlockComponent
          filename="cms/index.tsx"
          language="jsx"
          highlightedLines={[4]}
        >
          {`
<div>
  {posts.data.map((post) => (
    <a href={\`/blog/\${post.slug}\`} key={post.id}>
      {post.title}
    </a>
  ))}
</div>
  `}
        </CodeBlockComponent>

        <h2 id={items[4].href}>{items[4].title}</h2>
        <CodeBlockComponent
          filename="cms/index.tsx"
          language="tsx"
          highlightedLines={[5]}
        >
          {`import { createProxyFormsClient } from "proxyforms";

const proxyforms = createProxyFormsClient({ blogId: process.env.ZENBLOG_BLOG_ID });

const post = await proxyforms.posts.get({ slug: "my-first-post" });`}
        </CodeBlockComponent>

        <h2 id={items[5].href}>{items[5].title}</h2>
        <p>Render your post in your app. NextJS example.</p>
        <CodeBlockComponent filename="cms/index.tsx" language="tsx">
          {`<div>{post.title}</div>
<div>{post.content}</div>
<div>{post.publishedAt}</div>
<div dangerouslySetInnerHTML={{ __html: post.html_content }} />`}
        </CodeBlockComponent>

        <p>
          You can use something like Tailwind Typography to easily style the
          HTML content.
        </p>
      </div>
    </DocsPageLayout>
  );
}
