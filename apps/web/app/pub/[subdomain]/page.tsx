import React from "react";
import { getBlog, getPosts } from "../queries";
import { Metadata } from "next";
import { BlogHomePage } from "../themes/blog-home";
import { Theme } from "app/types";

export async function generateMetadata({
  params: { subdomain },
}: {
  params: { subdomain: string };
}): Promise<Metadata> {
  console.log(subdomain);
  const { data: blog } = await getBlog(subdomain);

  return {
    title: `${blog?.title}` || "A ProxyForms blog",
    icons: {
      icon:
        `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${blog?.emoji}</text></svg>` ||
        `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎑</text></svg>`,
    },
    description: blog?.description || "Start writing your blog today",
    openGraph: {
      title: `${blog?.title} - ProxyForms` || "A ProxyForms blog",
      description: blog?.description || "Start writing your blog today",
      type: "website",
    },
  };
}

async function HostedBlog({
  params: { subdomain },
}: {
  params: { subdomain: string };
}) {
  const { data: blog, error: blogError } = await getBlog(subdomain);
  const { data: posts, error: postsError } = await getPosts(
    subdomain,
    blog?.order
  );

  if (blogError || postsError || !blog) {
    return (
      <div className="flex-center p-12">
        <h1>Blog not found</h1>
        <p>{blogError?.message}</p>
        <p>{postsError?.message}</p>
      </div>
    );
  }

  // Convert null values to undefined for type compatibility
  const blogData = {
    emoji: blog.emoji,
    title: blog.title,
    description: blog.description,
    twitter: blog.twitter ?? undefined,
    instagram: blog.instagram ?? undefined,
    website: blog.website ?? undefined,
  };

  return <BlogHomePage theme={blog.theme as Theme} blog={blogData} posts={posts || []} />;
}

export default HostedBlog;
