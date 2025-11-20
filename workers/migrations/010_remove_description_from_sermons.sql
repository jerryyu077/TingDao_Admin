-- 010_remove_description_from_sermons.sql
-- 移除 sermons 表的 description 列，只保留 summary

-- SQLite 不支持直接 DROP COLUMN，需要重建表
-- 1. 创建新表（不包含 description 列）
CREATE TABLE sermons_new (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    speaker_id TEXT NOT NULL,
    cover_image_url TEXT,
    audio_url TEXT NOT NULL,
    audio_size INTEGER DEFAULT 0,
    audio_format TEXT DEFAULT 'mp3',
    duration INTEGER DEFAULT 0,
    scripture TEXT,
    summary TEXT,
    tags TEXT,
    series_id TEXT,
    series_order INTEGER,
    language TEXT DEFAULT 'zh-CN',
    date TEXT NOT NULL,
    publish_date TEXT,
    play_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    is_featured INTEGER DEFAULT 0,
    submitter_id TEXT,
    metadata TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 2. 复制数据（不包含 description）
INSERT INTO sermons_new 
SELECT 
    id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format,
    duration, scripture, summary, tags, series_id, series_order, language,
    date, publish_date, play_count, favorite_count, download_count, status,
    is_featured, submitter_id, metadata, created_at, updated_at
FROM sermons;

-- 3. 删除旧表
DROP TABLE sermons;

-- 4. 重命名新表
ALTER TABLE sermons_new RENAME TO sermons;

-- 5. 重建索引
CREATE INDEX IF NOT EXISTS idx_sermons_speaker_id ON sermons(speaker_id);
CREATE INDEX IF NOT EXISTS idx_sermons_status ON sermons(status);
CREATE INDEX IF NOT EXISTS idx_sermons_date ON sermons(date);
CREATE INDEX IF NOT EXISTS idx_sermons_submitter_id ON sermons(submitter_id);

