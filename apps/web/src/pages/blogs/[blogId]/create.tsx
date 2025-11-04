import { useRouter } from "next/router";
import { ZendoEditor } from "@/components/Editor/ZendoEditor";
import { toast } from "sonner";
import { useState } from "react";

export default function CreatePost() {
  const router = useRouter();
  const blogId = router.query.blogId as string;
  const [loading, setLoading] = useState(false);

  return (
    <>
      <ZendoEditor
        autoCompleteSlug={true}
        tags={[]} // initial tags, none when creating a new post.
        loading={loading}
        onSave={async (content) => {
          setLoading(true);
          const { tags, authors, metadata, ...post } = content;
          try {
            if (post.category_id === 0) {
              // remove category_id from post
              post.category_id = null;
            }

            // Create post via API route
            const response = await fetch("/api/posts/create", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                post: { ...post, meta: metadata },
                tags,
                authors,
                blogId,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw errorData;
            }

            const { data: newPost } = await response.json();

            // Only redirect after both operations complete successfully
            if (content.published) {
              toast.success("Post published!");
              router.push(
                `/blogs/${blogId}/post/${newPost.slug}?pub=${content.published}`
              );
            } else {
              router.push(`/blogs/${blogId}/post/${newPost.slug}`);
              toast.success("Post saved!");
            }
          } catch (error: any) {
            console.error(error);
            if (error?.code === "23505") {
              toast.error("A post with that slug already exists");
              return;
            }
            toast.error("Failed to save post");
          } finally {
            setLoading(false);
          }
        }}
      />
    </>
  );
}
