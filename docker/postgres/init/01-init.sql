-- ProxyForms Database Initialization Script
-- This script runs automatically when the PostgreSQL container starts for the first time

-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- Create custom types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'blog_sort_order') THEN
        CREATE TYPE blog_sort_order AS ENUM ('latest', 'oldest', 'alphabetical');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_status') THEN
        CREATE TYPE media_status AS ENUM ('pending', 'uploaded', 'failed');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid');
    END IF;
END $$;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE proxyforms TO proxyforms;

-- Set timezone
SET timezone = 'UTC';

-- Log initialization complete
DO $$
BEGIN
    RAISE NOTICE 'ProxyForms database initialized successfully';
END $$;
