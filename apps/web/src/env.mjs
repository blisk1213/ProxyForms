import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  /**
   * Server-side environment variables
   * These are only available on the server and never exposed to the client
   */
  server: {
    // Node Environment
    NODE_ENV: z.enum(["development", "test", "production"]),

    // Database (PostgreSQL with Drizzle ORM)
    DATABASE_URL: z.string().url(),

    // Authentication (better-auth)
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url().optional(),

    // Payments (Stripe)
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),

    // Cache (Redis)
    REDIS_URL: z.string().url(),
    REDIS_PASSWORD: z.string().optional(),

    // Object Storage (MinIO/S3)
    MINIO_ENDPOINT: z.string().min(1),
    MINIO_PORT: z.string().optional().default("9000"),
    MINIO_USE_SSL: z.string().optional().default("false"),
    MINIO_ROOT_USER: z.string().min(1),
    MINIO_ROOT_PASSWORD: z.string().min(1),
    MINIO_BUCKET_IMAGES: z.string().optional().default("proxyforms-images"),
    MINIO_BUCKET_MEDIA: z.string().optional().default("proxyforms-media"),

    // Email (Resend)
    RESEND_API_KEY: z.string().min(1),

    // Optional: AI Features
    OPENAI_API_KEY: z.string().optional(),

    // Optional: Analytics & Monitoring
    AXIOM_TOKEN: z.string().optional(),
    AXIOM_ORG_ID: z.string().optional(),
    TINYBIRD_TOKEN: z.string().optional(),

    // Legacy (Deprecated - will be removed after Supabase migration)
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
    SUPABASE_SERVICE_ROLE: z.string().optional(),
  },

  /**
   * Client-side environment variables
   * These are exposed to the client and must be prefixed with NEXT_PUBLIC_
   */
  client: {
    // Application URLs
    NEXT_PUBLIC_APP_URL: z.string().url(),

    // Authentication URLs
    NEXT_PUBLIC_SIGN_IN_URL: z.string().optional().default("/sign-in"),
    NEXT_PUBLIC_SIGN_UP_URL: z.string().optional().default("/sign-up"),

    // Payments (Stripe)
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),

    // Object Storage (MinIO/S3 public URL)
    NEXT_PUBLIC_MINIO_URL: z.string().url(),

    // API URL
    NEXT_PUBLIC_API_URL: z.string().url().optional(),

    // Optional: Analytics
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
  },

  /**
   * Runtime environment variables
   * You can't destruct process.env as a regular object in Next.js edge runtimes
   */
  runtimeEnv: {
    // Node
    NODE_ENV: process.env.NODE_ENV,

    // Database
    DATABASE_URL: process.env.DATABASE_URL,

    // Clerk
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,

    // Stripe
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,

    // Redis
    REDIS_URL: process.env.REDIS_URL,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,

    // MinIO
    MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
    MINIO_PORT: process.env.MINIO_PORT,
    MINIO_USE_SSL: process.env.MINIO_USE_SSL,
    MINIO_ROOT_USER: process.env.MINIO_ROOT_USER,
    MINIO_ROOT_PASSWORD: process.env.MINIO_ROOT_PASSWORD,
    MINIO_BUCKET_IMAGES: process.env.MINIO_BUCKET_IMAGES,
    MINIO_BUCKET_MEDIA: process.env.MINIO_BUCKET_MEDIA,
    NEXT_PUBLIC_MINIO_URL: process.env.NEXT_PUBLIC_MINIO_URL,

    // Resend
    RESEND_API_KEY: process.env.RESEND_API_KEY,

    // Application
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,

    // Optional: AI
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,

    // Optional: Analytics & Monitoring
    AXIOM_TOKEN: process.env.AXIOM_TOKEN,
    AXIOM_ORG_ID: process.env.AXIOM_ORG_ID,
    TINYBIRD_TOKEN: process.env.TINYBIRD_TOKEN,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,

    // Legacy (Deprecated)
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE,
  },

  /**
   * Skip validation during build if SKIP_ENV_VALIDATION is set
   * Use with caution - only for specific build scenarios
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
