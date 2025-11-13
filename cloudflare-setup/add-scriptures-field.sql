-- 添加经文库字段到 home_config 表
-- 用于存储每日经文横幅的经文列表

ALTER TABLE home_config ADD COLUMN scriptures TEXT;

-- scriptures 字段存储格式:
-- JSON数组: [
--   {"id": "scripture-1", "text": "你们要先求他的国和他的义", "reference": "马太福音 6:33", "order": 1},
--   {"id": "scripture-2", "text": "...", "reference": "...", "order": 2}
-- ]

