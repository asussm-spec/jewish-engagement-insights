-- Replace event_type enum with expanded types
-- Postgres doesn't allow easy enum replacement, so we:
-- 1. Add new values to the existing enum
-- 2. Add event_subtype column

-- Add new enum values (skip if already exists)
DO $$ BEGIN
  ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'worship_prayer';
  ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'learning_education';
  ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'holiday_calendar';
  ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'community_social';
  ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'youth_family';
  ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'arts_culture';
  ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'health_wellness';
  ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'tikkun_olam';
  ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'institutional';
END $$;

-- Add event_subtype column (optional)
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_subtype text;

-- Add audience and format columns
ALTER TABLE events ADD COLUMN IF NOT EXISTS audience text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS format text DEFAULT 'in_person';
