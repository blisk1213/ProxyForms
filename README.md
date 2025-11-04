<p align="center">
  <a href="https://github.com/proxyforms/proxyforms/stargazers>
    <img src="https://img.shields.io/github/stars/proxyforms/proxyforms?logo=github&style=for-the-badge&color=yellow" alt="Github Stars"></a>
  </a>
</p>
<p align="center" style="margin-top: 12px">

  <h1 align="center"><tt>ProxyForms</tt></h1>
  <h2 align="center">Simple, fast, headless blogging CMS</h2>

<p align="center">
    <a href="https://proxyforms.com"><strong>Website</strong></a> »
    <a href="https://twitter.com/proxyforms">
    <strong>Twitter</strong>
    </a>
  </p>
</p>

  <img src="./apps/web/public/static/ui-1.png">
  <img src="./apps/web/public/static/ui-2.png">

---

## 🏗️ Current Status

`ProxyForms` is currently under heavy development. The initial public release is expected in 2024

---

## About

ProxyForms (formerly Zenblog) is an open source, headless CMS for blogging. It's designed to be as simple to integrate as possible, while still providing a great user experience for both writers, readers and developers.

## Features

- As many blogs as you want
- Collaboration 🤼
- Fetch content from your website easily with the SDK
- Image hosting
- Analytics
- RSS feeds
- Webhooks
- API
- Self-hosting
- Custom themes
- Custom domains
- Easily fetch content from your website
- And more!

---

## Why

I wanted the ability to spin up a blog and fetch content from my website with ease. The same way you get a fully functional Postgres database with Supabase and connect to it in a few minutes, I wanted the same for my blog or content needs.

Headless CMS solutions are great, but they are often too complex and pricey for simple use cases. I wanted something that was simple to use, but still powerful enough to handle my needs.

In my opinion, headless CMS solutions are too pricey when you just want to fetch some text and images and render it in your website.

---

## Tech Stack

`ProxyForms` (formerly Zenblog) is built with the following technologies & tools:

- [PostgreSQL 17](https://www.postgresql.org/) - Database
- [Clerk](https://clerk.com/) - Authentication
- [Next.js 14](https://nextjs.org) - React Framework (App Router)
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Redis](https://redis.io/) - Caching
- [MinIO](https://min.io/) - S3-compatible Object Storage
- [Stripe](https://stripe.com/) - Payments
- [Resend](https://resend.com/) - Transactional Emails
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Bun](https://bun.sh/) - Package Manager & Runtime

## Running Locally

To get a local copy up and running, follow these simple steps.

### Prerequisites

Here is what you need to be able to run ProxyForms locally:

- [Bun](https://bun.sh/) (Version: >=1.0.0) - Fast JavaScript runtime & package manager
- [Docker](https://www.docker.com/) - For PostgreSQL, Redis, and MinIO
- [Stripe CLI](https://stripe.com/docs/stripe-cli) (Optional) - For webhook testing

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/proxyforms/proxyforms.git
   cd proxyforms
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Docker services** (PostgreSQL, Redis, MinIO)
   ```bash
   bun run docker:up
   ```

5. **Run database migrations**
   ```bash
   bun run db:push
   ```

6. **Start the development server**
   ```bash
   bun run dev:web
   ```

The app will be available at `http://localhost:8082`

## Self Hosting

A self hosting guide will be available soon.

## Contributing

ProxyForms is not ready for contributions yet. If you're interested in contributing, please reach out to me on [Twitter](https://twitter.com/proxyforms). I still need to do a lot of work to get the project ready for contributions. Thanks for your interest!
