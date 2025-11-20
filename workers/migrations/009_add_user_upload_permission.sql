-- Add upload permission field to users table
ALTER TABLE users ADD COLUMN can_upload INTEGER DEFAULT 0;

-- Set upload permission for specific users
UPDATE users SET can_upload = 1 WHERE email = 't@tingdao.com';
UPDATE users SET can_upload = 0 WHERE email = 'test@tingdao.com';

