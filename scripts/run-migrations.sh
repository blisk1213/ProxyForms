#!/bin/bash
# ==============================================================================
# Database Migration Runner
# Runs Drizzle migrations on production deployment
# ==============================================================================

set -e

echo "🔄 Running database migrations..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "postgres" -U "proxyforms" -d "proxyforms" -c '\q'; do
  echo "Postgres is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Run Drizzle migrations
echo "📦 Running Drizzle migrations..."
cd /app/apps/web
bun run db:push

echo "✅ Migrations completed successfully!"
