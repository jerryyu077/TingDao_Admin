-- Migration: Add missing columns to home_config table
-- Date: 2024-11-14
-- Description: Add columns for more_recommended_sermons, browse_topics, more_speakers

ALTER TABLE home_config ADD COLUMN more_recommended_sermons TEXT;
ALTER TABLE home_config ADD COLUMN browse_topics TEXT;
ALTER TABLE home_config ADD COLUMN more_speakers TEXT;
