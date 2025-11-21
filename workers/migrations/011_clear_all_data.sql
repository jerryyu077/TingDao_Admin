-- 清空所有数据表
-- 执行时间: 2025-11-21
-- 目的: 移除所有 sample data，准备导入真实数据

-- 1. 清空关联表（先删除外键关联的数据）
DELETE FROM sermon_topics;
DELETE FROM user_favorites;
DELETE FROM user_topic_favorites;
DELETE FROM user_speaker_favorites;
DELETE FROM play_history;
DELETE FROM user_play_history;

-- 2. 清空主数据表
DELETE FROM sermons;
DELETE FROM speakers;
DELETE FROM topics;
DELETE FROM users;

-- 3. 清空配置表
DELETE FROM home_config;
DELETE FROM launch_screen;
DELETE FROM series;

-- 4. 清空会话和密码重置表
DELETE FROM user_sessions;
DELETE FROM password_reset_tokens;
