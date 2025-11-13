/**
 * 用户 API 路由
 */
import { success, paginated, error, notFound } from '../utils/response.js';
import { queryAll, queryOne, queryPaginated, execute } from '../utils/db.js';

// GET /v1/users - 获取用户列表
export async function getUsers(request, env) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('_page') || '1');
  const limit = parseInt(url.searchParams.get('_limit') || '10');
  const status = url.searchParams.get('status');
  const searchTerm = url.searchParams.get('q');

  try {
    let sql = 'SELECT * FROM users WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (searchTerm) {
      sql += ' AND (name LIKE ? OR username LIKE ? OR email LIKE ?)';
      params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await queryPaginated(env.DB, sql, params, page, limit);

    return paginated(result.data, result.pagination);
  } catch (e) {
    console.error('Error fetching users:', e);
    return error('获取用户列表失败: ' + e.message);
  }
}

// GET /v1/users/:id - 获取单个用户
export async function getUser(request, env, id) {
  try {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const user = await queryOne(env.DB, sql, [id]);
    
    if (!user) {
      return notFound('用户不存在');
    }

    return success(user);
  } catch (e) {
    console.error('Error fetching user:', e);
    return error('获取用户详情失败: ' + e.message);
  }
}

// PUT /v1/users/:id - 更新用户
export async function updateUser(request, env, id) {
  try {
    const data = await request.json();
    
    const existing = await queryOne(env.DB, 'SELECT id FROM users WHERE id = ?', [id]);
    if (!existing) {
      return notFound('用户不存在');
    }

    const sql = `
      UPDATE users SET
        name = ?, username = ?, email = ?, avatar_url = ?,
        bio = ?, status = ?, updated_at = ?
      WHERE id = ?
    `;

    const now = new Date().toISOString();
    await execute(env.DB, sql, [
      data.name,
      data.username,
      data.email,
      data.avatar_url,
      data.bio,
      data.status,
      now,
      id
    ]);

    return success({ id }, { message: '用户更新成功' });
  } catch (e) {
    console.error('Error updating user:', e);
    return error('更新用户失败: ' + e.message);
  }
}

// PATCH /v1/users/:id - 更新用户状态
export async function updateUserStatus(request, env, id) {
  try {
    const { status } = await request.json();
    
    if (!status) {
      return error('缺少status字段', 'MISSING_STATUS', 400);
    }

    const sql = 'UPDATE users SET status = ?, updated_at = ? WHERE id = ?';
    const now = new Date().toISOString();
    
    const result = await execute(env.DB, sql, [status, now, id]);
    
    if (result.meta.changes === 0) {
      return notFound('用户不存在');
    }

    return success({ id, status }, { message: '状态更新成功' });
  } catch (e) {
    console.error('Error updating user status:', e);
    return error('更新用户状态失败: ' + e.message);
  }
}

