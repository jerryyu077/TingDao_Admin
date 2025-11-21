-- ==========================================
-- 性能优化：添加数据库索引
-- 创建日期: 2025-11-21
-- ==========================================

-- ==================== Sermons 表索引 ====================

-- 1. 状态索引（用于筛选已发布/待审核等）
CREATE INDEX IF NOT EXISTS idx_sermons_status 
ON sermons(status);

-- 2. 发布日期索引（用于按时间排序）
CREATE INDEX IF NOT EXISTS idx_sermons_publish_date 
ON sermons(publish_date DESC);

-- 3. 讲员ID索引（用于查询讲员的所有讲道）
CREATE INDEX IF NOT EXISTS idx_sermons_speaker_id 
ON sermons(speaker_id);

-- 4. 提交者ID索引（用于查询用户提交的讲道）
CREATE INDEX IF NOT EXISTS idx_sermons_submitter_id 
ON sermons(submitter_id);

-- 5. 播放量索引（用于热门排序）
CREATE INDEX IF NOT EXISTS idx_sermons_play_count 
ON sermons(play_count DESC);

-- 6. 收藏量索引（用于热门排序）
CREATE INDEX IF NOT EXISTS idx_sermons_favorite_count 
ON sermons(favorite_count DESC);

-- 7. 组合索引：状态 + 发布日期（最常用的查询组合）
CREATE INDEX IF NOT EXISTS idx_sermons_status_date 
ON sermons(status, publish_date DESC);

-- ==================== Speakers 表索引 ====================

-- 8. 状态索引（用于筛选活跃/停用讲员）
CREATE INDEX IF NOT EXISTS idx_speakers_status 
ON speakers(status);

-- 9. 姓名索引（用于搜索和排序）
CREATE INDEX IF NOT EXISTS idx_speakers_name 
ON speakers(name);

-- 10. 教会索引（用于按教会筛选）
CREATE INDEX IF NOT EXISTS idx_speakers_church 
ON speakers(church);

-- ==================== Topics 表索引 ====================

-- 11. 状态索引
CREATE INDEX IF NOT EXISTS idx_topics_status 
ON topics(status);

-- 12. 显示顺序索引（用于排序）
CREATE INDEX IF NOT EXISTS idx_topics_display_order 
ON topics(display_order ASC);

-- ==================== Users 表索引 ====================

-- 13. 邮箱索引（用于登录和查找）
CREATE INDEX IF NOT EXISTS idx_users_email 
ON users(email);

-- 14. 用户名索引（用于搜索）
CREATE INDEX IF NOT EXISTS idx_users_username 
ON users(username);

-- 15. 上传权限索引（用于筛选可上传用户）
CREATE INDEX IF NOT EXISTS idx_users_can_upload 
ON users(can_upload);

-- 16. 注册时间索引（用于按时间排序）
CREATE INDEX IF NOT EXISTS idx_users_created_at 
ON users(created_at DESC);

-- ==================== User Favorites 表索引 ====================

-- 17. 用户ID索引（用于查询用户的所有收藏）
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id 
ON user_favorites(user_id);

-- 18. 讲道ID索引（用于查询讲道的收藏数）
CREATE INDEX IF NOT EXISTS idx_user_favorites_sermon_id 
ON user_favorites(sermon_id);

-- 19. 组合索引：用户ID + 讲道ID（用于检查是否已收藏）
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_sermon 
ON user_favorites(user_id, sermon_id);

-- ==================== User Topic Favorites 表索引 ====================

-- 20. 用户ID索引
CREATE INDEX IF NOT EXISTS idx_user_topic_favorites_user_id 
ON user_topic_favorites(user_id);

-- 21. 主题ID索引
CREATE INDEX IF NOT EXISTS idx_user_topic_favorites_topic_id 
ON user_topic_favorites(topic_id);

-- 22. 组合索引
CREATE INDEX IF NOT EXISTS idx_user_topic_favorites_user_topic 
ON user_topic_favorites(user_id, topic_id);

-- ==================== User Speaker Favorites 表索引 ====================

-- 23. 用户ID索引
CREATE INDEX IF NOT EXISTS idx_user_speaker_favorites_user_id 
ON user_speaker_favorites(user_id);

-- 24. 讲员ID索引
CREATE INDEX IF NOT EXISTS idx_user_speaker_favorites_speaker_id 
ON user_speaker_favorites(speaker_id);

-- 25. 组合索引
CREATE INDEX IF NOT EXISTS idx_user_speaker_favorites_user_speaker 
ON user_speaker_favorites(user_id, speaker_id);

-- ==================== Sermon Topics 表索引 ====================

-- 26. 讲道ID索引（用于查询讲道的所有主题）
CREATE INDEX IF NOT EXISTS idx_sermon_topics_sermon_id 
ON sermon_topics(sermon_id);

-- 27. 主题ID索引（用于查询主题的所有讲道）
CREATE INDEX IF NOT EXISTS idx_sermon_topics_topic_id 
ON sermon_topics(topic_id);

-- 28. 组合索引（防止重复关联）
CREATE INDEX IF NOT EXISTS idx_sermon_topics_sermon_topic 
ON sermon_topics(sermon_id, topic_id);

-- ==================== Play History 表索引（如果存在）====================

-- 注意：play_history 表可能不存在或字段不同，跳过这些索引
-- 如果需要，请根据实际表结构手动创建

-- 29. 用户ID索引（用于查询用户播放历史）
-- CREATE INDEX IF NOT EXISTS idx_play_history_user_id 
-- ON play_history(user_id);

-- 30. 讲道ID索引（用于统计讲道播放次数）
-- CREATE INDEX IF NOT EXISTS idx_play_history_sermon_id 
-- ON play_history(sermon_id);

-- ==========================================
-- 索引创建完成
-- 总计: 28个索引
-- ==========================================

-- 验证索引是否创建成功
-- SELECT name, tbl_name FROM sqlite_master WHERE type='index' ORDER BY tbl_name, name;

