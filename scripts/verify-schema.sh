#!/bin/bash

# ProxyForms Schema Verification Script
# Verifies all schema files and migrations are in place

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 ProxyForms Schema Verification${NC}"
echo "===================================="
echo ""

# Track overall status
all_passed=true

# Function to check file existence
check_file() {
    local file=$1
    local description=$2

    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description"
        return 0
    else
        echo -e "${RED}✗${NC} $description - NOT FOUND"
        all_passed=false
        return 1
    fi
}

# Check schema files
echo -e "${YELLOW}Schema Files:${NC}"
check_file "apps/web/src/db/schema/enums.ts" "Enums (blog_sort_order, media_status, subscription_status)"
check_file "apps/web/src/db/schema/users.ts" "Users table (Clerk sync)"
check_file "apps/web/src/db/schema/blogs.ts" "Blogs table"
check_file "apps/web/src/db/schema/posts.ts" "Posts table"
check_file "apps/web/src/db/schema/categories.ts" "Categories table"
check_file "apps/web/src/db/schema/tags.ts" "Tags table"
check_file "apps/web/src/db/schema/authors.ts" "Authors table"
check_file "apps/web/src/db/schema/post-tags.ts" "Post-Tags junction table"
check_file "apps/web/src/db/schema/post-authors.ts" "Post-Authors junction table"
check_file "apps/web/src/db/schema/media.ts" "Blog images table"
check_file "apps/web/src/db/schema/subscriptions.ts" "Subscriptions, prices, products tables"
check_file "apps/web/src/db/schema/api-keys.ts" "API keys table"
check_file "apps/web/src/db/schema/webhooks.ts" "Webhooks table"
check_file "apps/web/src/db/schema/index.ts" "Schema index (exports all schemas)"

echo ""
echo -e "${YELLOW}Configuration Files:${NC}"
check_file "apps/web/src/db/index.ts" "Database client"
check_file "drizzle.config.ts" "Drizzle configuration"
check_file ".env.example" "Environment variables template"

echo ""
echo -e "${YELLOW}Migration Files:${NC}"
check_file "apps/web/src/db/migrations/0000_spicy_bruce_banner.sql" "Initial migration (12 tables)"
check_file "apps/web/src/db/migrations/0001_romantic_ironclad.sql" "API keys & webhooks migration"

echo ""
echo -e "${YELLOW}Helper Scripts:${NC}"
check_file "scripts/setup-database.sh" "Automated database setup"
check_file "scripts/reset-database.sh" "Database reset script"

# Check if scripts are executable
if [ -x "scripts/setup-database.sh" ] && [ -x "scripts/reset-database.sh" ]; then
    echo -e "${GREEN}✓${NC} Scripts are executable"
else
    echo -e "${YELLOW}⚠${NC} Scripts may need execute permission (run: chmod +x scripts/*.sh)"
fi

echo ""
echo -e "${YELLOW}Documentation:${NC}"
check_file "DATABASE_SETUP.md" "Database setup guide"
check_file "COMPLETE_SCHEMA_GUIDE.md" "Complete schema reference"
check_file "SESSION_SUMMARY.md" "Migration session summary"
check_file "SCHEMA_DEPLOYMENT_READY.md" "Deployment readiness document"

# Count schema files
echo ""
echo -e "${YELLOW}Statistics:${NC}"
schema_count=$(ls apps/web/src/db/schema/*.ts 2>/dev/null | wc -l)
migration_count=$(ls apps/web/src/db/migrations/*.sql 2>/dev/null | wc -l)
echo -e "  Schema files: ${BLUE}${schema_count}${NC}"
echo -e "  Migration files: ${BLUE}${migration_count}${NC}"

# Check package.json for required scripts
echo ""
echo -e "${YELLOW}Package Scripts:${NC}"
if grep -q "\"db:push\"" package.json; then
    echo -e "${GREEN}✓${NC} db:push command configured"
else
    echo -e "${RED}✗${NC} db:push command not found in package.json"
    all_passed=false
fi

if grep -q "\"db:migrate\"" package.json; then
    echo -e "${GREEN}✓${NC} db:migrate command configured"
else
    echo -e "${RED}✗${NC} db:migrate command not found in package.json"
    all_passed=false
fi

if grep -q "\"db:generate\"" package.json; then
    echo -e "${GREEN}✓${NC} db:generate command configured"
else
    echo -e "${RED}✗${NC} db:generate command not found in package.json"
    all_passed=false
fi

if grep -q "\"db:studio\"" package.json; then
    echo -e "${GREEN}✓${NC} db:studio command configured"
else
    echo -e "${RED}✗${NC} db:studio command not found in package.json"
    all_passed=false
fi

# Final verdict
echo ""
echo "===================================="
if [ "$all_passed" = true ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Schema is ready for deployment."
    echo ""
    echo "Next steps:"
    echo "  1. Start Docker services: bun run docker:up"
    echo "  2. Push schema: bun run db:push"
    echo "  OR"
    echo "  1. Run automated setup: ./scripts/setup-database.sh"
    exit 0
else
    echo -e "${RED}❌ Some checks failed${NC}"
    echo ""
    echo "Please review the errors above and fix any issues."
    exit 1
fi
