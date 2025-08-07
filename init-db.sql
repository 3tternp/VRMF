-- Initialize the database with required extensions and settings
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Create database user for the application (if needed)
-- This is handled by the POSTGRES_USER environment variable in docker-compose.yml

-- The actual tables will be created by Encore.ts migrations
-- This file is just for any initial database setup
