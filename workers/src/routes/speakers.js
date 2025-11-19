/**
 * 讲员 API 路由
 */
import { success, paginated, error, notFound } from '../utils/response.js';
import { queryAll, queryOne, queryPaginated, execute, parseJsonFields, parseJsonFieldsInArray } from '../utils/db.js';

// GET /v1/speakers - 获取讲员列表
export async function getSpeakers(request, env) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('_page') || '1');
  const limit = parseInt(url.searchParams.get('_limit') || '10');
  const status = url.searchParams.get('status');
  const church = url.searchParams.get('church');
  const searchTerm = url.searchParams.get('q');

  try {
    let sql = `
      SELECT sp.*,
             COALESCE(
               (SELECT COUNT(DISTINCT uf.user_id)
                FROM user_favorites uf
                JOIN sermons s ON uf.sermon_id = s.id
                WHERE s.speaker_id = sp.id),
               0
             ) as favorites_count
      FROM speakers sp
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND sp.status = ?';
      params.push(status);
    }

    if (church) {
      sql += ' AND sp.church = ?';
      params.push(church);
    }

    if (searchTerm) {
      sql += ' AND (sp.name LIKE ? OR sp.name_en LIKE ? OR sp.church LIKE ?)';
      params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
    }

    sql += ' ORDER BY sp.created_at DESC';

    const result = await queryPaginated(env.DB, sql, params, page, limit);
    
    // 解析JSON字段
    result.data = parseJsonFieldsInArray(result.data, ['social_media']);

    return paginated(result.data, result.pagination);
  } catch (e) {
    console.error('Error fetching speakers:', e);
    return error('获取讲员列表失败: ' + e.message);
  }
}

// GET /v1/speakers/:id - 获取单个讲员
export async function getSpeaker(request, env, id) {
  try {
    const sql = `
      SELECT sp.*,
             COALESCE(
               (SELECT COUNT(DISTINCT uf.user_id)
                FROM user_favorites uf
                JOIN sermons s ON uf.sermon_id = s.id
                WHERE s.speaker_id = sp.id),
               0
             ) as favorites_count
      FROM speakers sp
      WHERE sp.id = ?
    `;
    let speaker = await queryOne(env.DB, sql, [id]);
    
    if (!speaker) {
      return notFound('讲员不存在');
    }

    // 解析JSON字段
    speaker = parseJsonFields(speaker, ['social_media']);

    return success(speaker);
  } catch (e) {
    console.error('Error fetching speaker:', e);
    return error('获取讲员详情失败: ' + e.message);
  }
}

// POST /v1/speakers - 创建讲员
export async function createSpeaker(request, env) {
  try {
    const data = await request.json();
    
    if (!data.id || !data.name || !data.title || !data.church) {
      return error('缺少必填字段', 'MISSING_REQUIRED_FIELDS', 400);
    }

    const sql = `
      INSERT INTO speakers (
        id, name, name_en, title, avatar_url, bio, bio_long, church,
        email, website, social_media, sermon_count, follower_count,
        total_play_count, status, is_verified, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const now = new Date().toISOString();
    await execute(env.DB, sql, [
      data.id,
      data.name,
      data.name_en || null,
      data.title,
      data.avatar_url || null,
      data.bio || null,
      data.bio_long || null,
      data.church,
      data.email || null,
      data.website || null,
      data.social_media ? JSON.stringify(data.social_media) : null,
      0, // sermon_count
      0, // follower_count
      0, // total_play_count
      data.status || 'active',
      data.is_verified ? 1 : 0,
      now,
      now
    ]);

    return success({ id: data.id }, { message: '讲员创建成功' });
  } catch (e) {
    console.error('Error creating speaker:', e);
    return error('创建讲员失败: ' + e.message);
  }
}

// PUT /v1/speakers/:id - 更新讲员
export async function updateSpeaker(request, env, id) {
  try {
    const data = await request.json();
    
    const existing = await queryOne(env.DB, 'SELECT id FROM speakers WHERE id = ?', [id]);
    if (!existing) {
      return notFound('讲员不存在');
    }

    const sql = `
      UPDATE speakers SET
        name = ?, name_en = ?, title = ?, avatar_url = ?, bio = ?, bio_long = ?,
        church = ?, email = ?, website = ?, social_media = ?, status = ?,
        is_verified = ?, updated_at = ?
      WHERE id = ?
    `;

    const now = new Date().toISOString();
    await execute(env.DB, sql, [
      data.name,
      data.name_en,
      data.title,
      data.avatar_url,
      data.bio,
      data.bio_long,
      data.church,
      data.email,
      data.website,
      data.social_media ? JSON.stringify(data.social_media) : null,
      data.status,
      data.is_verified ? 1 : 0,
      now,
      id
    ]);

    return success({ id }, { message: '讲员更新成功' });
  } catch (e) {
    console.error('Error updating speaker:', e);
    return error('更新讲员失败: ' + e.message);
  }
}

// PATCH /v1/speakers/:id - 更新讲员状态
export async function updateSpeakerStatus(request, env, id) {
  try {
    const { status } = await request.json();
    
    if (!status) {
      return error('缺少status字段', 'MISSING_STATUS', 400);
    }

    const sql = 'UPDATE speakers SET status = ?, updated_at = ? WHERE id = ?';
    const now = new Date().toISOString();
    
    const result = await execute(env.DB, sql, [status, now, id]);
    
    if (result.meta.changes === 0) {
      return notFound('讲员不存在');
    }

    return success({ id, status }, { message: '状态更新成功' });
  } catch (e) {
    console.error('Error updating speaker status:', e);
    return error('更新讲员状态失败: ' + e.message);
  }
}

// DELETE /v1/speakers/:id - 删除讲员
export async function deleteSpeaker(request, env, id) {
  try {
    const result = await execute(env.DB, 'DELETE FROM speakers WHERE id = ?', [id]);
    
    if (result.meta.changes === 0) {
      return notFound('讲员不存在');
    }

    return success({ id }, { message: '讲员删除成功' });
  } catch (e) {
    console.error('Error deleting speaker:', e);
    return error('删除讲员失败: ' + e.message);
  }
}

