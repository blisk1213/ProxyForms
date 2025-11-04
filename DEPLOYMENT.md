# ProxyForms Production Deployment Guide

## 🎯 Overview

This guide covers deploying ProxyForms to production using Docker, Docker Compose, and automated CI/CD pipelines.

## ✅ Completed Production Tasks

### Phase 1: Configuration & Environment (COMPLETE)
- [x] Environment validation with @t3-oss/env-nextjs (40+ variables)
- [x] Next.js standalone output mode for Docker optimization
- [x] Comprehensive .env.production.example template
- [x] Security headers and CORS configuration

### Phase 2A: Authentication Migration (COMPLETE)
- [x] Migrated from Supabase Auth to Clerk
- [x] Updated 7 component files
- [x] Migrated main management API
- [x] Updated query hooks (subscription, onboarding)

### Phase 2B: Database Migration (DEFERRED)
- [ ] Migrate Supabase queries to Drizzle ORM (20+ files)
- **Status**: Not blocking for production launch
- **Note**: App works with Supabase database client, Drizzle migration is a post-launch optimization

### Phase 3: Docker & Infrastructure (COMPLETE)
- [x] Multi-stage Dockerfile with Bun runtime
- [x] Production docker-compose.yml with all services
- [x] Nginx reverse proxy with SSL/TLS
- [x] Database initialization scripts
- [x] Migration runner automation
- [x] Health check endpoints

### Phase 4: CI/CD Automation (COMPLETE)
- [x] GitHub Actions CI pipeline (lint, test, build, security scan)
- [x] GitHub Actions CD pipeline (build, deploy, rollback)
- [x] Automated deployment to production
- [x] Post-deployment verification

## 📦 Services Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Nginx (Port 80/443)              │
│           SSL/TLS Termination + Load Balancing     │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              Next.js App (Port 3000)                │
│          Standalone mode with Bun runtime           │
└─┬───────────┬──────────────┬────────────────────────┘
  │           │              │
  │           │              │
┌─▼─────┐ ┌──▼─────┐  ┌─────▼──────┐
│PostgreSQL│ │Redis 7 │  │MinIO (S3) │
│   17    │ │ Cache  │  │  Storage  │
└─────────┘ └────────┘  └───────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose installed
- Domain name with DNS configured
- SSL certificates (Let's Encrypt recommended)
- GitHub account (for CI/CD)

### 1. Clone and Configure

```bash
# Clone repository
git clone https://github.com/yourusername/proxyforms.git
cd proxyforms

# Copy and configure environment
cp .env.production.example .env.production
nano .env.production  # Edit with your values
```

### 2. Required Environment Variables

**Critical (Required):**
```bash
# Database
DATABASE_URL=postgresql://user:password@postgres:5432/proxyforms
POSTGRES_PASSWORD=your_secure_password

# Clerk Authentication
CLERK_SECRET_KEY=sk_live_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx

# Stripe Payments
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=your_redis_password

# MinIO Storage
MINIO_ROOT_USER=your_access_key
MINIO_ROOT_PASSWORD=your_secret_key
NEXT_PUBLIC_MINIO_URL=https://cdn.yourdomain.com

# Email
RESEND_API_KEY=re_xxxxx

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Optional (Recommended):**
```bash
# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
AXIOM_TOKEN=xaat_xxxxx
TINYBIRD_TOKEN=p.xxxxx

# AI Features
OPENAI_API_KEY=sk-xxxxx
```

### 3. SSL Certificates

Place your SSL certificates in `nginx/ssl/`:

```bash
# Using Let's Encrypt
certbot certonly --standalone -d yourdomain.com

# Copy certificates
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
```

### 4. Deploy

```bash
# Start all services
docker-compose -f docker-compose.production.yml up -d

# Run database migrations
docker-compose -f docker-compose.production.yml exec web bun run db:push

# Verify health
curl http://localhost:3000/api/health
```

## 🔄 CI/CD Setup

### GitHub Secrets Configuration

Add these secrets to your GitHub repository:

```
Settings → Secrets and variables → Actions → New repository secret
```

**Required Secrets:**
- `PRODUCTION_HOST` - Your server IP/domain
- `PRODUCTION_USER` - SSH username
- `PRODUCTION_SSH_KEY` - Private SSH key
- `PRODUCTION_SSH_PORT` - SSH port (default: 22)

**Environment Variables:**
All production environment variables should be configured on your server in `/opt/proxyforms/.env`

### Deployment Workflow

1. **Push to main branch** → Triggers deployment
2. **CI Pipeline runs** → Lint, test, build, security scan
3. **Docker image built** → Multi-stage build with caching
4. **Deploy to production** → Via SSH with health checks
5. **Verification** → Automatic rollback if health checks fail

## 🛠️ Management Commands

### View Logs

```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f web
docker-compose -f docker-compose.production.yml logs -f postgres
```

### Database Management

```bash
# Run migrations
docker-compose -f docker-compose.production.yml exec web bun run db:push

# Database backup
docker-compose -f docker-compose.production.yml exec postgres pg_dump -U proxyforms proxyforms > backup.sql

# Restore backup
docker-compose -f docker-compose.production.yml exec -T postgres psql -U proxyforms proxyforms < backup.sql
```

### Service Management

```bash
# Restart specific service
docker-compose -f docker-compose.production.yml restart web

# Scale web service
docker-compose -f docker-compose.production.yml up -d --scale web=3

# Update image and redeploy
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d
```

## 📊 Monitoring

### Health Checks

- **Application**: `https://yourdomain.com/api/health`
- **Nginx**: `http://localhost:80/health`
- **PostgreSQL**: Built-in healthcheck (pg_isready)
- **Redis**: Built-in healthcheck (redis-cli ping)
- **MinIO**: Built-in healthcheck (minio/health/live)

### Logs & Analytics

- **Application Logs**: Docker logs
- **Access Logs**: Nginx access.log
- **Analytics**: PostHog (if configured)
- **Error Tracking**: Axiom (if configured)

## 🔒 Security Checklist

- [x] SSL/TLS certificates installed and configured
- [x] Security headers enabled (CSP, HSTS, X-Frame-Options)
- [x] Rate limiting configured in Nginx
- [x] Database firewall (only allow app server)
- [x] Redis password protected
- [x] MinIO access keys secured
- [ ] Regular security updates enabled
- [ ] Backup strategy in place
- [ ] Monitoring and alerting configured

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose -f docker-compose.production.yml logs web

# Verify environment variables
docker-compose -f docker-compose.production.yml config
```

### Database connection issues

```bash
# Check PostgreSQL is running
docker-compose -f docker-compose.production.yml ps postgres

# Test connection
docker-compose -f docker-compose.production.yml exec postgres psql -U proxyforms -d proxyforms -c 'SELECT 1;'
```

### Build fails

```bash
# Clear Docker cache
docker buildx prune -af

# Rebuild without cache
docker-compose -f docker-compose.production.yml build --no-cache
```

## 📚 Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Let's Encrypt Guide](https://letsencrypt.org/getting-started/)

## 🎉 Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] SSL certificates installed
- [ ] DNS records configured
- [ ] Database migrations run
- [ ] Health checks passing
- [ ] Clerk webhooks configured
- [ ] Stripe webhooks configured
- [ ] CDN configured for MinIO
- [ ] Backup strategy implemented
- [ ] Monitoring set up
- [ ] Load testing completed

## 📞 Support

For issues or questions:
- Check logs: `docker-compose logs`
- Review health endpoint: `/api/health`
- Check GitHub Actions for deployment status
- Verify all environment variables are set correctly

---

**Note**: Database migration from Supabase to Drizzle is deferred as a post-launch optimization. The application fully supports Supabase database client and all queries work correctly.
