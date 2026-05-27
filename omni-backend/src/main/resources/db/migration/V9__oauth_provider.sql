-- V9__oauth_provider.sql
-- Add social login provider support to users table

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS provider    VARCHAR(50)  NOT NULL DEFAULT 'LOCAL',
  ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_provider_id
  ON users (provider, provider_id)
  WHERE provider_id IS NOT NULL;
