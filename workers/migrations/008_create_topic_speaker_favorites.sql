-- Migration: Create Topic and Speaker Favorites Tables
-- Description: Add tables for user topic and speaker favorites with proper constraints

-- 创建主题收藏表
CREATE TABLE IF NOT EXISTS user_topic_favorites (
    user_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, topic_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

-- 创建主题收藏表的索引
CREATE INDEX IF NOT EXISTS idx_user_topic_favorites_user ON user_topic_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_topic_favorites_topic ON user_topic_favorites(topic_id);
CREATE INDEX IF NOT EXISTS idx_user_topic_favorites_created ON user_topic_favorites(created_at);

-- 创建讲员收藏表
CREATE TABLE IF NOT EXISTS user_speaker_favorites (
    user_id TEXT NOT NULL,
    speaker_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, speaker_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (speaker_id) REFERENCES speakers(id) ON DELETE CASCADE
);

-- 创建讲员收藏表的索引
CREATE INDEX IF NOT EXISTS idx_user_speaker_favorites_user ON user_speaker_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_speaker_favorites_speaker ON user_speaker_favorites(speaker_id);
CREATE INDEX IF NOT EXISTS idx_user_speaker_favorites_created ON user_speaker_favorites(created_at);

