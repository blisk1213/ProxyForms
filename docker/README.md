# ProxyForms Docker Services

This directory contains Docker configuration for ProxyForms development infrastructure.

## Services

### PostgreSQL 17
- **Port**: 5432
- **Database**: proxyforms
- **User**: proxyforms (configurable via .env)
- **Password**: Set in .env file
- **Health Check**: Automatic
- **Data Persistence**: `postgres_data` volume

### Redis 7
- **Port**: 6379
- **Password**: Set in .env file
- **Persistence**: AOF enabled
- **Data Volume**: `redis_data`
- **Use Case**: Session storage, API caching, query result caching

### Minio (S3-Compatible Storage)
- **API Port**: 9000
- **Console Port**: 9001
- **Root User**: Set in .env file
- **Root Password**: Set in .env file
- **Buckets**:
  - `proxyforms-images` (public read)
  - `proxyforms-media` (private)
- **Console URL**: http://localhost:9001
- **Data Volume**: `minio_data`

## Quick Start

### 1. Start all services

```bash
docker-compose up -d
```

### 2. Check service status

```bash
docker-compose ps
```

### 3. View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f minio
```

### 4. Stop services

```bash
docker-compose down
```

### 5. Stop and remove all data

```bash
docker-compose down -v
```

## Accessing Services

### PostgreSQL
```bash
# Using psql
psql postgresql://proxyforms:proxyforms_dev_password@localhost:5432/proxyforms

# Using docker exec
docker exec -it proxyforms-postgres psql -U proxyforms -d proxyforms
```

### Redis
```bash
# Using redis-cli
redis-cli -a proxyforms_redis_password

# Using docker exec
docker exec -it proxyforms-redis redis-cli -a proxyforms_redis_password
```

### Minio Console
Open http://localhost:9001 in your browser and login with:
- Username: `proxyforms` (or your MINIO_ROOT_USER)
- Password: `proxyforms_minio_password` (or your MINIO_ROOT_PASSWORD)

## Database Initialization

The PostgreSQL database is automatically initialized with:
- UUID extension for generating unique IDs
- pgcrypto extension for encryption functions
- pg_trgm extension for full-text search
- Custom enum types for blog_sort_order, media_status, subscription_status

Initialization scripts are located in `./postgres/init/` and run automatically on first startup.

## Data Persistence

All data is persisted in Docker volumes:
- `postgres_data` - Database files
- `redis_data` - Redis AOF files
- `minio_data` - Uploaded files and buckets

To backup data, you can use:

```bash
# Backup PostgreSQL
docker exec proxyforms-postgres pg_dump -U proxyforms proxyforms > backup.sql

# Backup Minio data
docker exec proxyforms-minio mc mirror minio/proxyforms-images ./backup/images
```

## Environment Variables

All configuration is done via environment variables. Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

Key variables:
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `REDIS_PASSWORD`
- `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`

## Troubleshooting

### Port already in use
If ports 5432, 6379, or 9000 are already in use, you can modify the ports in `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"  # Changed from 5432:5432
```

### Reset everything
To completely reset all services and data:

```bash
docker-compose down -v
docker-compose up -d
```

### Health check failed
Check service logs:
```bash
docker-compose logs <service-name>
```

## Production Deployment

For production, create a `docker-compose.production.yml` with:
- Strong passwords
- Resource limits
- Backup strategies
- Network isolation
- TLS/SSL configuration

Example:
```bash
docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d
```
