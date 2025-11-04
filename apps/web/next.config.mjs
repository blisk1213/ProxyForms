/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
// During build phase, skip env validation if SKIP_ENV_VALIDATION is explicitly set
// This allows building without runtime environment variables (provided at container startup)
if (!process.env.SKIP_ENV_VALIDATION && process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  process.env.SKIP_ENV_VALIDATION = '1';
}

// Only import and validate env if not skipping
if (!process.env.SKIP_ENV_VALIDATION) {
  await import("./src/env.mjs");
}

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  /**
   * Standalone output mode for optimized Docker builds
   * This creates a minimal production bundle with only necessary files
   */
  output: "standalone",

  /**
   * Transpile packages that don't support ESM
   */
  transpilePackages: ["react-syntax-highlighter"],

  /**
   * Image optimization configuration
   * Add domains that will serve images through next/image
   */
  images: {
    remotePatterns: [
      // ProxyForms CDN
      { hostname: "cdn.proxyforms.com", protocol: "https", port: "", pathname: "/**" },
      // MinIO/S3 storage
      { hostname: "*.proxyforms.com", protocol: "https", port: "", pathname: "/**" },
      // Legacy (will be removed after migration)
      { hostname: "images.zenblog.com", protocol: "https", port: "", pathname: "/**" },
      { hostname: "ppfseefimhneysnokffx.supabase.co", protocol: "https", port: "", pathname: "/**" },
    ],
    // Image optimization settings
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  /**
   * Security headers for production
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevent clickjacking attacks
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Enable XSS protection
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Referrer policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions policy
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      // CORS headers for public API
      {
        source: "/api/public/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "false" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
    ];
  },

  /**
   * Redirects for legacy URLs
   */
  async redirects() {
    return [
      // Redirect www to non-www
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.proxyforms.com",
          },
        ],
        destination: "https://proxyforms.com/:path*",
        permanent: true,
      },
    ];
  },

  /**
   * Webpack configuration
   */
  webpack: (config, { isServer }) => {
    // Custom webpack config if needed
    if (!isServer) {
      // Don't bundle server-only packages in client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        perf_hooks: false,
        child_process: false,
        dns: false,
        crypto: false,
        stream: false,
        path: false,
        os: false,
      };
    }
    return config;
  },

  /**
   * Experimental features
   */
  experimental: {
    // Enable server actions (if using)
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  /**
   * Production optimizations
   */
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  /**
   * TypeScript and ESLint
   */
  typescript: {
    // Don't fail build on type errors in production (handle in CI)
    ignoreBuildErrors: false,
  },
  eslint: {
    // Don't fail build on lint errors in production (handle in CI)
    ignoreDuringBuilds: false,
  },
};

export default config;
