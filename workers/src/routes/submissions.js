/**
 * 用户提交的讲道管理 API
 */

import { getUserIdFromRequest } from './auth.js';

/**
 * GET /api/v1/submissions - 获取当前用户提交的讲道列表
 */
export async function getMySubmissions(request, env) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return Response.json({ success: false, error: { message: '未授权' } }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status'); // draft, reviewing, published, rejected
    const offset = (page - 1) * limit;

    // 构建查询条件
    let whereClause = 'WHERE s.submitter_id = ?';
    const params = [userId];
    
    if (status && status !== 'all') {
      whereClause += ' AND s.status = ?';
      params.push(status);
    }

    // 获取总数
    const countSql = `
      SELECT COUNT(*) as total
      FROM sermons s
      ${whereClause}
    `;
    const countResult = await env.DB.prepare(countSql).bind(...params).first();
    const total = countResult?.total || 0;

    // 获取列表
    const sql = `
      SELECT 
        s.id,
        s.title,
        s.cover_image_url,
        s.audio_url,
        s.duration,
        s.status,
        s.date,
        s.scripture,
        s.summary,
        s.tags,
        s.created_at,
        s.updated_at,
        sp.id as speaker_id,
        sp.name as speaker_name,
        sp.avatar_url as speaker_avatar
      FROM sermons s
      LEFT JOIN speakers sp ON s.speaker_id = sp.id
      ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    params.push(limit, offset);
    const result = await env.DB.prepare(sql).bind(...params).all();
    
    const sermons = (result.results || []).map(row => {
      let tags = null;
      if (row.tags) {
        try {
          tags = JSON.parse(row.tags);
        } catch (e) {
          console.error('Failed to parse tags:', e);
        }
      }
      
      return {
        id: row.id,
        title: row.title,
        coverImageUrl: row.cover_image_url,
        audioUrl: row.audio_url,
        duration: row.duration || 0,
        status: row.status || 'pending',
        date: row.date,
        scripture: row.scripture,
        summary: row.summary,
        tags: tags,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        speaker: {
          id: row.speaker_id,
          name: row.speaker_name || '未知讲员',
          avatarUrl: row.speaker_avatar
        }
      };
    });

    const totalPages = Math.ceil(total / limit);

    return Response.json({
      success: true,
      data: {
        sermons,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get submissions error:', error);
    return Response.json({ 
      success: false, 
      error: { message: '获取提交列表失败' } 
    }, { status: 500 });
  }
}

/**
 * GET /api/v1/submissions/:id - 获取单个提交的详情
 */
export async function getSubmission(request, env, id) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return Response.json({ success: false, error: { message: '未授权' } }, { status: 401 });
    }

    const sql = `
      SELECT 
        s.*,
        sp.id as speaker_id,
        sp.name as speaker_name,
        sp.avatar_url as speaker_avatar,
        sp.title as speaker_title,
        sp.church as speaker_church
      FROM sermons s
      LEFT JOIN speakers sp ON s.speaker_id = sp.id
      WHERE s.id = ? AND s.submitter_id = ?
    `;
    
    const sermon = await env.DB.prepare(sql).bind(id, userId).first();
    
    if (!sermon) {
      return Response.json({ 
        success: false, 
        error: { message: '讲道不存在或无权访问' } 
      }, { status: 404 });
    }

    // 格式化响应
    const response = {
      id: sermon.id,
      title: sermon.title,
      coverImageUrl: sermon.cover_image_url,
      audioUrl: sermon.audio_url,
      audioSize: sermon.audio_size,
      audioFormat: sermon.audio_format,
      duration: sermon.duration,
      scripture: sermon.scripture,
      summary: sermon.summary,
      description: sermon.description,
      tags: sermon.tags ? JSON.parse(sermon.tags) : [],
      seriesId: sermon.series_id,
      seriesOrder: sermon.series_order,
      language: sermon.language,
      date: sermon.date,
      publishDate: sermon.publish_date,
      status: sermon.status,
      isFeatured: Boolean(sermon.is_featured),
      metadata: sermon.metadata ? JSON.parse(sermon.metadata) : null,
      createdAt: sermon.created_at,
      updatedAt: sermon.updated_at,
      speaker: {
        id: sermon.speaker_id,
        name: sermon.speaker_name || '未知讲员',
        avatarUrl: sermon.speaker_avatar,
        title: sermon.speaker_title,
        church: sermon.speaker_church
      }
    };

    return Response.json({ success: true, data: response }, { status: 200 });

  } catch (error) {
    console.error('Get submission error:', error);
    return Response.json({ 
      success: false, 
      error: { message: '获取讲道详情失败' } 
    }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/submissions/:id - 删除草稿
 */
export async function deleteSubmission(request, env, id) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return Response.json({ success: false, error: { message: '未授权' } }, { status: 401 });
    }

    // 检查讲道是否存在且属于当前用户
    const sermon = await env.DB.prepare(`
      SELECT id, status FROM sermons WHERE id = ? AND submitter_id = ?
    `).bind(id, userId).first();
    
    if (!sermon) {
      return Response.json({ 
        success: false, 
        error: { message: '讲道不存在或无权删除' } 
      }, { status: 404 });
    }

    // 只允许删除待审核和被拒绝的讲道
    if (sermon.status !== 'pending' && sermon.status !== 'rejected') {
      return Response.json({ 
        success: false, 
        error: { message: '只能删除草稿或被拒绝的讲道' } 
      }, { status: 403 });
    }

    // 删除讲道
    await env.DB.prepare(`
      DELETE FROM sermons WHERE id = ?
    `).bind(id).run();

    return Response.json({ 
      success: true, 
      data: { message: '删除成功' } 
    }, { status: 200 });

  } catch (error) {
    console.error('Delete submission error:', error);
    return Response.json({ 
      success: false, 
      error: { message: '删除失败' } 
    }, { status: 500 });
  }
}

