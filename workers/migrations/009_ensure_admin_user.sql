-- 确保 admin 用户存在
-- 注意：users 表没有 role 字段
INSERT OR IGNORE INTO users (id, username, email, name, password_hash, can_upload, created_at, updated_at)
VALUES (
    'admin',
    'admin',
    'admin@tingdao.app',
    'Admin',
    '', -- 空密码，因为使用 Cloudflare Zero Trust
    1,
    datetime('now'),
    datetime('now')
);

