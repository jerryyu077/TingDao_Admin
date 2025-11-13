/**
 * 讲道 API 路由
 */
import { success, paginated, error, notFound } from '../utils/response.js';
import { queryAll, queryOne, queryPaginated, execute, parseJsonFields, parseJsonFieldsInArray } from '../utils/db.js';

// GET /v1/sermons - 获取讲道列表（支持分页、搜索、过滤）
export async function getSermons(request, env) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('_page') || '1');
  const limit = parseInt(url.searchParams.get('_limit') || '10');
  const status = url.searchParams.get('status');
  const speakerId = url.searchParams.get('speaker_id');
  const searchTerm = url.searchParams.get('q');
  const sort = url.searchParams.get('_sort') || 'publish_date';
  const order = url.searchParams.get('_order') || 'desc';

  try {
    let sql = `
      SELECT s.*, 
             sp.name as speaker_name, 
             sp.avatar_url as speaker_avatar,
             u.username as submitter_username,
             u.name as submitter_name
      FROM sermons s
      LEFT JOIN speakers sp ON s.speaker_id = sp.id
      LEFT JOIN users u ON s.submitter_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // 状态过滤
    if (status) {
      sql += ` AND s.status = ?`;
      params.push(status);
    }

    // 讲员过滤
    if (speakerId) {
      sql += ` AND s.speaker_id = ?`;
      params.push(speakerId);
    }

    // 搜索
    if (searchTerm) {
      sql += ` AND (s.title LIKE ? OR s.description LIKE ?)`;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    // 排序
    sql += ` ORDER BY s.${sort} ${order.toUpperCase()}`;

    // 分页查询
    const result = await queryPaginated(env.DB, sql, params, page, limit);
    
    // 解析JSON字段
    result.data = parseJsonFieldsInArray(result.data, ['tags', 'metadata']);
    
    // 构造submitter对象
    result.data = result.data.map(sermon => ({
      ...sermon,
      submitter: sermon.submitter_id ? {
        id: sermon.submitter_id,
        username: sermon.submitter_username,
        name: sermon.submitter_name
      } : null
    }));

    return paginated(result.data, result.pagination);
  } catch (e) {
    console.error('Error fetching sermons:', e);
    return error('获取讲道列表失败: ' + e.message);
  }
}

// GET /v1/sermons/:id - 获取单个讲道
export async function getSermon(request, env, id) {
  try {
    const sql = `
      SELECT s.*, 
             sp.name as speaker_name, 
             sp.avatar_url as speaker_avatar,
             sp.title as speaker_title,
             sp.church as speaker_church,
             u.username as submitter_username,
             u.name as submitter_name
      FROM sermons s
      LEFT JOIN speakers sp ON s.speaker_id = sp.id
      LEFT JOIN users u ON s.submitter_id = u.id
      WHERE s.id = ?
    `;
    
    let sermon = await queryOne(env.DB, sql, [id]);
    
    if (!sermon) {
      return notFound('讲道不存在');
    }

    // 解析JSON字段
    sermon = parseJsonFields(sermon, ['tags', 'metadata']);
    
    // 构造speaker对象
    sermon.speaker = {
      id: sermon.speaker_id,
      name: sermon.speaker_name,
      avatar_url: sermon.speaker_avatar,
      title: sermon.speaker_title,
      church: sermon.speaker_church
    };
    
    // 构造submitter对象
    sermon.submitter = sermon.submitter_id ? {
      id: sermon.submitter_id,
      username: sermon.submitter_username,
      name: sermon.submitter_name
    } : null;

    // 获取关联的topics
    const topicsSql = `
      SELECT t.id, t.name, t.icon, t.description
      FROM topics t
      JOIN sermon_topics st ON t.id = st.topic_id
      WHERE st.sermon_id = ?
    `;
    const topics = await queryAll(env.DB, topicsSql, [id]);
    sermon.topics = topics;
    sermon.topic_ids = topics.map(t => t.id);

    return success(sermon);
  } catch (e) {
    console.error('Error fetching sermon:', e);
    return error('获取讲道详情失败: ' + e.message);
  }
}

// POST /v1/sermons - 创建讲道
export async function createSermon(request, env) {
  try {
    const data = await request.json();
    
    // 验证必填字段
    if (!data.id || !data.title || !data.speaker_id || !data.audio_url) {
      return error('缺少必填字段', 'MISSING_REQUIRED_FIELDS', 400);
    }

    const sql = `
      INSERT INTO sermons (
        id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format,
        duration, scripture, summary, description, tags, series_id, series_order,
        language, date, publish_date, status, is_featured, submitter_id, metadata,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const now = new Date().toISOString();
    await execute(env.DB, sql, [
      data.id,
      data.title,
      data.speaker_id,
      data.cover_image_url || null,
      data.audio_url,
      data.audio_size || 0,
      data.audio_format || 'mp3',
      data.duration || 0,
      data.scripture || null,
      data.summary || null,
      data.description || null,
      data.tags ? JSON.stringify(data.tags) : null,
      data.series_id || null,
      data.series_order || null,
      data.language || 'zh-CN',
      data.date,
      data.publish_date || now,
      data.status || 'pending',
      data.is_featured ? 1 : 0,
      data.submitter_id || null,
      data.metadata ? JSON.stringify(data.metadata) : null,
      now,
      now
    ]);

    // 如果有topic_ids，添加关联
    if (data.topic_ids && Array.isArray(data.topic_ids)) {
      for (const topicId of data.topic_ids) {
        await execute(env.DB, 
          'INSERT INTO sermon_topics (sermon_id, topic_id) VALUES (?, ?)',
          [data.id, topicId]
        );
      }
    }

    return success({ id: data.id }, { message: '讲道创建成功' });
  } catch (e) {
    console.error('Error creating sermon:', e);
    return error('创建讲道失败: ' + e.message);
  }
}

// PUT /v1/sermons/:id - 更新讲道
export async function updateSermon(request, env, id) {
  try {
    const data = await request.json();
    
    // 检查讲道是否存在
    const existing = await queryOne(env.DB, 'SELECT id FROM sermons WHERE id = ?', [id]);
    if (!existing) {
      return notFound('讲道不存在');
    }

    const sql = `
      UPDATE sermons SET
        title = ?, speaker_id = ?, cover_image_url = ?, audio_url = ?,
        audio_size = ?, audio_format = ?, duration = ?, scripture = ?,
        summary = ?, description = ?, tags = ?, series_id = ?, series_order = ?,
        language = ?, date = ?, publish_date = ?, status = ?, is_featured = ?,
        submitter_id = ?, metadata = ?, updated_at = ?
      WHERE id = ?
    `;

    const now = new Date().toISOString();
    await execute(env.DB, sql, [
      data.title,
      data.speaker_id,
      data.cover_image_url,
      data.audio_url,
      data.audio_size || 0,
      data.audio_format || 'mp3',
      data.duration || 0,
      data.scripture,
      data.summary,
      data.description,
      data.tags ? JSON.stringify(data.tags) : null,
      data.series_id,
      data.series_order,
      data.language || 'zh-CN',
      data.date,
      data.publish_date,
      data.status,
      data.is_featured ? 1 : 0,
      data.submitter_id,
      data.metadata ? JSON.stringify(data.metadata) : null,
      now,
      id
    ]);

    // 更新topic关联
    if (data.topic_ids) {
      // 删除旧关联
      await execute(env.DB, 'DELETE FROM sermon_topics WHERE sermon_id = ?', [id]);
      // 添加新关联
      for (const topicId of data.topic_ids) {
        await execute(env.DB, 
          'INSERT INTO sermon_topics (sermon_id, topic_id) VALUES (?, ?)',
          [id, topicId]
        );
      }
    }

    return success({ id }, { message: '讲道更新成功' });
  } catch (e) {
    console.error('Error updating sermon:', e);
    return error('更新讲道失败: ' + e.message);
  }
}

// PATCH /v1/sermons/:id - 更新讲道状态
export async function updateSermonStatus(request, env, id) {
  try {
    const { status } = await request.json();
    
    if (!status) {
      return error('缺少status字段', 'MISSING_STATUS', 400);
    }

    const sql = 'UPDATE sermons SET status = ?, updated_at = ? WHERE id = ?';
    const now = new Date().toISOString();
    
    const result = await execute(env.DB, sql, [status, now, id]);
    
    if (result.meta.changes === 0) {
      return notFound('讲道不存在');
    }

    return success({ id, status }, { message: '状态更新成功' });
  } catch (e) {
    console.error('Error updating sermon status:', e);
    return error('更新讲道状态失败: ' + e.message);
  }
}

// DELETE /v1/sermons/:id - 删除讲道
export async function deleteSermon(request, env, id) {
  try {
    // 删除sermon_topics关联
    await execute(env.DB, 'DELETE FROM sermon_topics WHERE sermon_id = ?', [id]);
    
    // 删除sermon
    const result = await execute(env.DB, 'DELETE FROM sermons WHERE id = ?', [id]);
    
    if (result.meta.changes === 0) {
      return notFound('讲道不存在');
    }

    return success({ id }, { message: '讲道删除成功' });
  } catch (e) {
    console.error('Error deleting sermon:', e);
    return error('删除讲道失败: ' + e.message);
  }
}

