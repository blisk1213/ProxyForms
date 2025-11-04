#!/bin/bash

# ProxyForms Database Setup Script
# This script sets up the PostgreSQL database with Drizzle ORM

set -e

echo "🚀 ProxyForms Database Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found. Copying from .env.example${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please update .env with your credentials${NC}"
fi

# Start Docker services
echo ""
echo "📦 Starting Docker services (PostgreSQL, Redis, MinIO)..."
bun run docker:up

# Wait for PostgreSQL to be ready
echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Retry logic for database connection
max_retries=30
counter=0

until docker exec proxyforms-postgres pg_isready -U proxyforms > /dev/null 2>&1; do
    counter=$((counter+1))
    if [ $counter -eq $max_retries ]; then
        echo -e "${RED}❌ PostgreSQL failed to start after ${max_retries} attempts${NC}"
        exit 1
    fi
    echo "  Waiting for PostgreSQL... ($counter/$max_retries)"
    sleep 2
done

echo -e "${GREEN}✓ PostgreSQL is ready${NC}"

# Check if migrations exist
if [ -d "apps/web/src/db/migrations" ] && [ "$(ls -A apps/web/src/db/migrations/*.sql 2>/dev/null)" ]; then
    echo ""
    echo "📝 Migrations found. Applying migrations..."
    bun run db:migrate
    echo -e "${GREEN}✓ Migrations applied successfully${NC}"
else
    echo ""
    echo "📝 No migrations found. Generating and pushing schema..."
    bun run db:generate
    bun run db:push
    echo -e "${GREEN}✓ Schema pushed successfully${NC}"
fi

# Verify database tables
echo ""
echo "🔍 Verifying database tables..."
TABLES=$(docker exec proxyforms-postgres psql -U proxyforms -d proxyforms -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

if [ "$TABLES" -gt 0 ]; then
    echo -e "${GREEN}✓ Database has $TABLES tables${NC}"
    echo ""
    echo "Tables created:"
    docker exec proxyforms-postgres psql -U proxyforms -d proxyforms -c "\dt" | grep "public"
else
    echo -e "${RED}❌ No tables found in database${NC}"
    exit 1
fi

# Success message
echo ""
echo "================================"
echo -e "${GREEN}✅ Database setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  • Start the development server: bun run dev:web"
echo "  • Open Drizzle Studio: bun run db:studio"
echo "  • View logs: bun run docker:logs"
echo ""
echo "Database connection:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: proxyforms"
echo "  User: proxyforms"
echo ""
