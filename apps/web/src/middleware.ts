import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from "next/server";

// inspired by https://github.com/vercel/platforms/blob/main/middleware.ts

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

const invalidSubdomains = [
  "www",
  "localhost:3000",
  "localhost:8082",
  "proxyforms",
  "zenblog",
  "127",
];

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing',
  '/api/webhooks(.*)',
  '/api/public(.*)',
  '/pub(.*)',
  '/docs(.*)',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const subdomain = req.headers.get("host")?.split(".")[0];
  const path = req.nextUrl.pathname;

  // Handle subdomain routing for published blogs
  if (subdomain && !invalidSubdomains.includes(subdomain)) {
    const newPath = `/pub/${subdomain}${path}`;
    const url = new URL(newPath, req.url);
    return NextResponse.rewrite(url);
  }

  // Protect non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
}, {
  debug: process.env.NODE_ENV === 'development',
});
