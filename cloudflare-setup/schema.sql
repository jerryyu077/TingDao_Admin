-- =====================================================
-- 听道APP - Cloudflare D1 数据库表结构设计
-- 创建日期: 2025-11-13
-- 版本: 1.0
-- =====================================================

-- =====================================================
-- 1. 讲员表 (Speakers)
-- =====================================================
CREATE TABLE IF NOT EXISTS speakers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    title TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    bio_long TEXT,
    church TEXT,
    email TEXT,
    website TEXT,
    social_media TEXT,  -- JSON格式: {"wechat": "xxx", "youtube": "xxx"}
    sermon_count INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    total_play_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',  -- active, inactive
    is_verified INTEGER DEFAULT 0,  -- 0=false, 1=true
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 创建讲员表的索引
CREATE INDEX idx_speakers_status ON speakers(status);
CREATE INDEX idx_speakers_church ON speakers(church);
CREATE INDEX idx_speakers_created_at ON speakers(created_at);

-- =====================================================
-- 2. 用户表 (Users)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    name TEXT,
    email TEXT UNIQUE,
    avatar TEXT,
    phone TEXT,
    church TEXT,
    location TEXT,
    bio TEXT,
    sermon_upload_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',  -- active, disabled
    last_login_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 创建用户表的索引
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- =====================================================
-- 3. 系列表 (Series)
-- =====================================================
CREATE TABLE IF NOT EXISTS series (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    sermon_count INTEGER DEFAULT 0,
    start_date TEXT,
    end_date TEXT,
    status TEXT DEFAULT 'active',  -- active, completed, archived
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 创建系列表的索引
CREATE INDEX idx_series_status ON series(status);
CREATE INDEX idx_series_start_date ON series(start_date);

-- =====================================================
-- 4. 主题表 (Topics)
-- =====================================================
CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    icon TEXT,  -- 图标类名或URL
    gradient TEXT,  -- CSS渐变样式
    sermon_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',  -- active, inactive
    is_system INTEGER DEFAULT 0,  -- 0=用户创建, 1=系统预设
    display_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 创建主题表的索引
CREATE INDEX idx_topics_status ON topics(status);
CREATE INDEX idx_topics_display_order ON topics(display_order);
CREATE INDEX idx_topics_is_system ON topics(is_system);

-- =====================================================
-- 5. 讲道表 (Sermons)
-- =====================================================
CREATE TABLE IF NOT EXISTS sermons (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    speaker_id TEXT NOT NULL,
    cover_image_url TEXT,
    audio_url TEXT NOT NULL,
    audio_size INTEGER DEFAULT 0,  -- 字节
    audio_format TEXT DEFAULT 'mp3',
    duration INTEGER DEFAULT 0,  -- 秒
    scripture TEXT,  -- 经文引用，用分号分隔
    summary TEXT,
    description TEXT,
    tags TEXT,  -- JSON数组格式: ["信心", "希望"]
    series_id TEXT,
    series_order INTEGER,
    language TEXT DEFAULT 'zh-CN',
    date TEXT NOT NULL,  -- YYYY-MM-DD
    publish_date TEXT,
    play_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',  -- published, pending, rejected, returned
    is_featured INTEGER DEFAULT 0,  -- 0=false, 1=true
    submitter_id TEXT,
    metadata TEXT,  -- JSON格式: {"church": "xxx", "location": "xxx", "event": "xxx"}
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (speaker_id) REFERENCES speakers(id),
    FOREIGN KEY (series_id) REFERENCES series(id),
    FOREIGN KEY (submitter_id) REFERENCES users(id)
);

-- 创建讲道表的索引
CREATE INDEX idx_sermons_speaker_id ON sermons(speaker_id);
CREATE INDEX idx_sermons_series_id ON sermons(series_id);
CREATE INDEX idx_sermons_submitter_id ON sermons(submitter_id);
CREATE INDEX idx_sermons_status ON sermons(status);
CREATE INDEX idx_sermons_date ON sermons(date DESC);
CREATE INDEX idx_sermons_publish_date ON sermons(publish_date DESC);
CREATE INDEX idx_sermons_play_count ON sermons(play_count DESC);
CREATE INDEX idx_sermons_favorite_count ON sermons(favorite_count DESC);
CREATE INDEX idx_sermons_is_featured ON sermons(is_featured);

-- =====================================================
-- 6. 讲道-主题关联表 (Sermon_Topics) - 多对多
-- =====================================================
CREATE TABLE IF NOT EXISTS sermon_topics (
    sermon_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (sermon_id, topic_id),
    FOREIGN KEY (sermon_id) REFERENCES sermons(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

-- 创建关联表的索引
CREATE INDEX idx_sermon_topics_sermon_id ON sermon_topics(sermon_id);
CREATE INDEX idx_sermon_topics_topic_id ON sermon_topics(topic_id);

-- =====================================================
-- 7. 首页配置表 (Home_Config)
-- =====================================================
CREATE TABLE IF NOT EXISTS home_config (
    id INTEGER PRIMARY KEY DEFAULT 1,  -- 永远只有一条记录
    recommended_sermons TEXT,  -- JSON数组: ["sermon-001", "sermon-002"]
    featured_topics TEXT,  -- JSON数组: ["topic-001", "topic-002"]
    featured_speakers TEXT,  -- JSON数组: ["speaker-001", "speaker-002"]
    discover_tags TEXT,  -- JSON数组: ["最受欢迎", "最新上传"]
    discover_daily_sermon TEXT,  -- 单个sermon_id
    discover_popular_sermons TEXT,  -- JSON数组: sermon_ids
    discover_popular_speakers TEXT,  -- JSON数组: speaker_ids
    discover_popular_topics TEXT,  -- JSON数组: topic_ids
    updated_at TEXT DEFAULT (datetime('now')),
    CHECK (id = 1)  -- 确保只有一条记录
);

-- 插入默认配置（如果不存在）
INSERT OR IGNORE INTO home_config (id) VALUES (1);

-- =====================================================
-- 8. 启动屏幕表 (Launch_Screen)
-- =====================================================
CREATE TABLE IF NOT EXISTS launch_screen (
    id INTEGER PRIMARY KEY DEFAULT 1,  -- 永远只有一条记录
    image_url TEXT,
    scripture TEXT,
    scripture_reference TEXT,  -- 经文出处，如 "约翰福音 3:16"
    updated_at TEXT DEFAULT (datetime('now')),
    CHECK (id = 1)  -- 确保只有一条记录
);

-- 插入默认配置（如果不存在）
INSERT OR IGNORE INTO launch_screen (id) VALUES (1);

-- =====================================================
-- 9. 用户收藏表 (User_Favorites) - 可选
-- =====================================================
CREATE TABLE IF NOT EXISTS user_favorites (
    user_id TEXT NOT NULL,
    sermon_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, sermon_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sermon_id) REFERENCES sermons(id) ON DELETE CASCADE
);

-- 创建收藏表的索引
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_sermon_id ON user_favorites(sermon_id);

-- =====================================================
-- 10. 播放历史表 (Play_History) - 可选
-- =====================================================
CREATE TABLE IF NOT EXISTS play_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    sermon_id TEXT NOT NULL,
    play_duration INTEGER DEFAULT 0,  -- 播放时长（秒）
    played_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (sermon_id) REFERENCES sermons(id) ON DELETE CASCADE
);

-- 创建播放历史表的索引
CREATE INDEX idx_play_history_user_id ON play_history(user_id);
CREATE INDEX idx_play_history_sermon_id ON play_history(sermon_id);
CREATE INDEX idx_play_history_played_at ON play_history(played_at DESC);

-- =====================================================
-- 表结构设计说明
-- =====================================================

-- 1. 所有日期时间字段使用TEXT类型，存储ISO 8601格式 (YYYY-MM-DD或YYYY-MM-DDTHH:MM:SSZ)
-- 2. JSON数据存储为TEXT类型，在应用层进行JSON.parse/stringify处理
-- 3. 布尔值使用INTEGER类型，0=false, 1=true
-- 4. 所有主键使用TEXT类型（如sermon-001），方便前端识别和调试
-- 5. 外键使用ON DELETE CASCADE或ON DELETE SET NULL，根据业务需求
-- 6. 索引创建在常用查询字段上，提高查询效率
-- 7. 统计字段(如sermon_count)通过触发器或定期任务更新

-- =====================================================
-- 触发器示例 (可选，用于自动更新统计)
-- =====================================================

-- 当sermon被创建时，增加speaker的sermon_count
CREATE TRIGGER IF NOT EXISTS update_speaker_sermon_count_on_insert
AFTER INSERT ON sermons
FOR EACH ROW
BEGIN
    UPDATE speakers 
    SET sermon_count = sermon_count + 1,
        updated_at = datetime('now')
    WHERE id = NEW.speaker_id;
END;

-- 当sermon被删除时，减少speaker的sermon_count
CREATE TRIGGER IF NOT EXISTS update_speaker_sermon_count_on_delete
AFTER DELETE ON sermons
FOR EACH ROW
BEGIN
    UPDATE speakers 
    SET sermon_count = sermon_count - 1,
        updated_at = datetime('now')
    WHERE id = OLD.speaker_id;
END;

-- 当sermon_topics关联被创建时，增加topic的sermon_count
CREATE TRIGGER IF NOT EXISTS update_topic_sermon_count_on_insert
AFTER INSERT ON sermon_topics
FOR EACH ROW
BEGIN
    UPDATE topics 
    SET sermon_count = sermon_count + 1,
        updated_at = datetime('now')
    WHERE id = NEW.topic_id;
END;

-- 当sermon_topics关联被删除时，减少topic的sermon_count
CREATE TRIGGER IF NOT EXISTS update_topic_sermon_count_on_delete
AFTER DELETE ON sermon_topics
FOR EACH ROW
BEGIN
    UPDATE topics 
    SET sermon_count = sermon_count - 1,
        updated_at = datetime('now')
    WHERE id = OLD.topic_id;
END;

-- =====================================================
-- 结束
-- =====================================================

