-- Add email verification fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMP;
