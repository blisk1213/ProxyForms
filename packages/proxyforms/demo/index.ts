import { createProxyFormsClient } from "../dist";

const client = createProxyFormsClient({ blogId: "123" });

client.posts.list({ category: "nextjs" });
