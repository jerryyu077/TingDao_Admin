-- Fix user_play_history table to use composite primary key
-- Step 1: Create new table with correct structure
CREATE TABLE IF NOT EXISTS user_play_history_new (
    user_id TEXT NOT NULL,
    sermon_id TEXT NOT NULL,
    play_progress REAL DEFAULT 0,
    duration REAL DEFAULT 0,
    last_played_at TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, sermon_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sermon_id) REFERENCES sermons(id) ON DELETE CASCADE
);

-- Step 2: Copy existing data (if any)
INSERT INTO user_play_history_new (user_id, sermon_id, play_progress, duration, last_played_at, created_at)
SELECT user_id, sermon_id, play_progress, duration, last_played_at, created_at 
FROM user_play_history
WHERE true
ON CONFLICT(user_id, sermon_id) DO UPDATE SET
    play_progress = excluded.play_progress,
    duration = excluded.duration,
    last_played_at = excluded.last_played_at;

-- Step 3: Drop old table
DROP TABLE user_play_history;

-- Step 4: Rename new table
ALTER TABLE user_play_history_new RENAME TO user_play_history;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_play_history_user ON user_play_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_play_history_last_played ON user_play_history(last_played_at DESC);

