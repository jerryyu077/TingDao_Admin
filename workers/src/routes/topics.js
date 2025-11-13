/**
 * 主题 API 路由
 */
import { success, paginated, error, notFound } from '../utils/response.js';
import { queryAll, queryOne, queryPaginated, execute } from '../utils/db.js';

// GET /v1/topics - 获取主题列表
export async function getTopics(request, env) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('_page') || '1');
  const limit = parseInt(url.searchParams.get('_limit') || '10');
  const status = url.searchParams.get('status');
  const searchTerm = url.searchParams.get('q');

  try {
    let sql = 'SELECT * FROM topics WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (searchTerm) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    sql += ' ORDER BY display_order ASC, created_at DESC';

    const result = await queryPaginated(env.DB, sql, params, page, limit);

    return paginated(result.data, result.pagination);
  } catch (e) {
    console.error('Error fetching topics:', e);
    return error('获取主题列表失败: ' + e.message);
  }
}

// GET /v1/topics/:id - 获取单个主题
export async function getTopic(request, env, id) {
  try {
    const sql = 'SELECT * FROM topics WHERE id = ?';
    const topic = await queryOne(env.DB, sql, [id]);
    
    if (!topic) {
      return notFound('主题不存在');
    }

    // 获取该主题的讲道
    const sermonsSql = `
      SELECT s.id, s.title, s.cover_image_url, s.duration, s.status
      FROM sermons s
      JOIN sermon_topics st ON s.id = st.sermon_id
      WHERE st.topic_id = ?
      ORDER BY s.publish_date DESC
    `;
    const sermons = await queryAll(env.DB, sermonsSql, [id]);
    topic.sermons = sermons;

    return success(topic);
  } catch (e) {
    console.error('Error fetching topic:', e);
    return error('获取主题详情失败: ' + e.message);
  }
}

// POST /v1/topics - 创建主题
export async function createTopic(request, env) {
  try {
    const data = await request.json();
    
    if (!data.id || !data.name) {
      return error('缺少必填字段', 'MISSING_REQUIRED_FIELDS', 400);
    }

    const sql = `
      INSERT INTO topics (
        id, name, icon, description, cover_image_url, sermon_count,
        display_order, status, is_system, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const now = new Date().toISOString();
    await execute(env.DB, sql, [
      data.id,
      data.name,
      data.icon || null,
      data.description || null,
      data.cover_image_url || null,
      0, // sermon_count
      data.display_order || 999,
      data.status || 'active',
      data.is_system ? 1 : 0,
      now,
      now
    ]);

    return success({ id: data.id }, { message: '主题创建成功' });
  } catch (e) {
    console.error('Error creating topic:', e);
    return error('创建主题失败: ' + e.message);
  }
}

// PUT /v1/topics/:id - 更新主题
export async function updateTopic(request, env, id) {
  try {
    const data = await request.json();
    
    const existing = await queryOne(env.DB, 'SELECT id FROM topics WHERE id = ?', [id]);
    if (!existing) {
      return notFound('主题不存在');
    }

    const sql = `
      UPDATE topics SET
        name = ?, icon = ?, description = ?, cover_image_url = ?,
        display_order = ?, status = ?, updated_at = ?
      WHERE id = ?
    `;

    const now = new Date().toISOString();
    await execute(env.DB, sql, [
      data.name,
      data.icon,
      data.description,
      data.cover_image_url,
      data.display_order,
      data.status,
      now,
      id
    ]);

    return success({ id }, { message: '主题更新成功' });
  } catch (e) {
    console.error('Error updating topic:', e);
    return error('更新主题失败: ' + e.message);
  }
}

// PUT /v1/topics/:id/sermons - 更新主题的讲道列表
export async function updateTopicSermons(request, env, id) {
  try {
    const { sermon_ids } = await request.json();
    
    if (!Array.isArray(sermon_ids)) {
      return error('sermon_ids必须是数组', 'INVALID_SERMON_IDS', 400);
    }

    const existing = await queryOne(env.DB, 'SELECT id FROM topics WHERE id = ?', [id]);
    if (!existing) {
      return notFound('主题不存在');
    }

    // 删除旧关联
    await execute(env.DB, 'DELETE FROM sermon_topics WHERE topic_id = ?', [id]);

    // 添加新关联
    for (const sermonId of sermon_ids) {
      await execute(env.DB, 
        'INSERT INTO sermon_topics (sermon_id, topic_id) VALUES (?, ?)',
        [sermonId, id]
      );
    }

    // 更新sermon_count和updated_at（触发器会自动更新sermon_count，但我们也手动更新以确保）
    const now = new Date().toISOString();
    await execute(env.DB, 
      'UPDATE topics SET sermon_count = ?, updated_at = ? WHERE id = ?',
      [sermon_ids.length, now, id]
    );

    return success({ id, sermon_count: sermon_ids.length }, { message: '主题讲道列表更新成功' });
  } catch (e) {
    console.error('Error updating topic sermons:', e);
    return error('更新主题讲道列表失败: ' + e.message);
  }
}

// PATCH /v1/topics/:id - 更新主题状态
export async function updateTopicStatus(request, env, id) {
  try {
    const { status } = await request.json();
    
    if (!status) {
      return error('缺少status字段', 'MISSING_STATUS', 400);
    }

    const sql = 'UPDATE topics SET status = ?, updated_at = ? WHERE id = ?';
    const now = new Date().toISOString();
    
    const result = await execute(env.DB, sql, [status, now, id]);
    
    if (result.meta.changes === 0) {
      return notFound('主题不存在');
    }

    return success({ id, status }, { message: '状态更新成功' });
  } catch (e) {
    console.error('Error updating topic status:', e);
    return error('更新主题状态失败: ' + e.message);
  }
}

// DELETE /v1/topics/:id - 删除主题
export async function deleteTopic(request, env, id) {
  try {
    // 删除sermon_topics关联
    await execute(env.DB, 'DELETE FROM sermon_topics WHERE topic_id = ?', [id]);
    
    // 删除topic
    const result = await execute(env.DB, 'DELETE FROM topics WHERE id = ?', [id]);
    
    if (result.meta.changes === 0) {
      return notFound('主题不存在');
    }

    return success({ id }, { message: '主题删除成功' });
  } catch (e) {
    console.error('Error deleting topic:', e);
    return error('删除主题失败: ' + e.message);
  }
}

