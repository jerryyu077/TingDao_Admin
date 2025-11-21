-- 初始化 home_config 默认记录
-- 执行时间: 2025-11-21
-- 目的: 清空数据库后需要重新创建默认配置记录

-- 插入默认的 home_config 记录
INSERT INTO home_config (
  id,
  scriptures,
  recommended_sermons,
  more_recommended_sermons,
  featured_topics,
  browse_topics,
  featured_speakers,
  more_speakers,
  discover_tags,
  updated_at
) VALUES (
  1,
  '[]',
  '[]',
  '[]',
  '[]',
  '[]',
  '[]',
  '[]',
  '[]',
  datetime('now')
);

-- 验证插入结果
SELECT * FROM home_config WHERE id = 1;

