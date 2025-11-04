#!/bin/bash

# ProxyForms Database Reset Script
# WARNING: This will delete ALL data in the database

set -e

echo "⚠️  ProxyForms Database Reset"
echo "================================"
echo ""
echo "This will DELETE ALL data from the database!"
echo ""

# Prompt for confirmation
read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirmation

if [ "$confirmation" != "yes" ]; then
    echo "Reset cancelled."
    exit 0
fi

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "🗑️  Stopping and removing containers..."
bun run docker:down

echo ""
echo "🧹 Removing database volumes..."
docker volume rm proxyforms_postgres_data 2>/dev/null || echo "Volume already removed"

echo ""
echo "🚀 Starting fresh containers..."
bun run docker:up

echo ""
echo "⏳ Waiting for PostgreSQL..."
sleep 5

# Wait for PostgreSQL
max_retries=30
counter=0

until docker exec proxyforms-postgres pg_isready -U proxyforms > /dev/null 2>&1; do
    counter=$((counter+1))
    if [ $counter -eq $max_retries ]; then
        echo -e "${RED}❌ PostgreSQL failed to start${NC}"
        exit 1
    fi
    echo "  Waiting... ($counter/$max_retries)"
    sleep 2
done

echo -e "${GREEN}✓ PostgreSQL is ready${NC}"

echo ""
echo "📝 Pushing fresh schema..."
bun run db:push

echo ""
echo "================================"
echo -e "${GREEN}✅ Database reset complete!${NC}"
echo ""
echo "The database is now empty and ready to use."
echo ""
