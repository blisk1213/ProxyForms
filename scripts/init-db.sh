#!/bin/bash
# ==============================================================================
# Database Initialization Script
# Runs on first PostgreSQL container startup
# ==============================================================================

set -e

echo "🔧 Initializing ProxyForms database..."

# Create required extensions
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- UUID extension for generating UUIDs
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Cryptographic functions
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- Trigram similarity for text search
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";

    -- Grant permissions
    GRANT ALL PRIVILEGES ON DATABASE proxyforms TO proxyforms;
EOSQL

echo "✅ Database initialized successfully!"
echo "📊 Extensions installed: uuid-ossp, pgcrypto, pg_trgm"
