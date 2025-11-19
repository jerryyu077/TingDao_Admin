-- 添加 password_hash 列到 users 表
ALTER TABLE users ADD COLUMN password_hash TEXT;

-- 创建 user_favorites 表（如果不存在）
CREATE TABLE IF NOT EXISTS user_favorites (
    user_id TEXT NOT NULL,
    sermon_id TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, sermon_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sermon_id) REFERENCES sermons(id) ON DELETE CASCADE
);

-- 创建 user_play_history 表（如果不存在）
CREATE TABLE IF NOT EXISTS user_play_history (
    user_id TEXT NOT NULL,
    sermon_id TEXT NOT NULL,
    play_progress REAL NOT NULL,
    duration REAL NOT NULL,
    last_played_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, sermon_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sermon_id) REFERENCES sermons(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_sermon_id ON user_favorites(sermon_id);
CREATE INDEX IF NOT EXISTS idx_user_play_history_user_id ON user_play_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_play_history_last_played ON user_play_history(last_played_at DESC);

