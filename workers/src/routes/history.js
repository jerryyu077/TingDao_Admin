/**
 * 播放历史 API
 */
import { getUserIdFromRequest } from './auth.js';

/**
 * GET /api/v1/history - 获取播放历史
 */
export async function getPlayHistory(request, env) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return Response.json({ success: false, error: { message: '未授权' } }, { status: 401 });
    }
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    const history = await env.DB.prepare(`
      SELECT 
        h.sermon_id,
        h.play_progress,
        h.duration,
        h.last_played_at,
        s.*
      FROM user_play_history h
      JOIN sermons s ON h.sermon_id = s.id
      WHERE h.user_id = ?
      ORDER BY h.last_played_at DESC
      LIMIT ? OFFSET ?
    `).bind(userId, limit, offset).all();
    
    const countResult = await env.DB.prepare(
      'SELECT COUNT(*) as total FROM user_play_history WHERE user_id = ?'
    ).bind(userId).first();
    
    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limit);
    
    return Response.json({
      success: true,
      data: {
        history: history.results || [],
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Get play history error:', error);
    return Response.json({ success: false, error: { message: '获取播放历史失败' } }, { status: 500 });
  }
}

/**
 * POST /api/v1/history - 记录/更新播放进度
 */
export async function updatePlayProgress(request, env) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return Response.json({ success: false, error: { message: '未授权' } }, { status: 401 });
    }
    
    const body = await request.json();
    const { sermon_id, play_progress, duration } = body;
    
    if (!sermon_id || play_progress === undefined || duration === undefined) {
      return Response.json({ 
        success: false, 
        error: { message: 'sermon_id, play_progress, duration 为必填项' } 
      }, { status: 400 });
    }
    
    const sermon = await env.DB.prepare('SELECT id FROM sermons WHERE id = ?').bind(sermon_id).first();
    if (!sermon) {
      return Response.json({ success: false, error: { message: '讲道不存在' } }, { status: 404 });
    }
    
    const existing = await env.DB.prepare(
      'SELECT * FROM user_play_history WHERE user_id = ? AND sermon_id = ?'
    ).bind(userId, sermon_id).first();
    
    if (existing) {
      await env.DB.prepare(`
        UPDATE user_play_history
        SET play_progress = ?, duration = ?, last_played_at = datetime('now')
        WHERE user_id = ? AND sermon_id = ?
      `).bind(play_progress, duration, userId, sermon_id).run();
    } else {
      await env.DB.prepare(`
        INSERT INTO user_play_history (user_id, sermon_id, play_progress, duration, last_played_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `).bind(userId, sermon_id, play_progress, duration).run();
    }
    
    return Response.json({ success: true, data: { message: '播放进度已保存' } }, { status: 200 });
  } catch (error) {
    console.error('Update play progress error:', error);
    return Response.json({ success: false, error: { message: '保存播放进度失败' } }, { status: 500 });
  }
}

/**
 * GET /api/v1/history/:sermonId - 获取特定讲道的播放进度
 */
export async function getSermonProgress(request, env, sermonId) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return Response.json({ success: false, error: { message: '未授权' } }, { status: 401 });
    }
    
    const progress = await env.DB.prepare(
      'SELECT * FROM user_play_history WHERE user_id = ? AND sermon_id = ?'
    ).bind(userId, sermonId).first();
    
    if (!progress) {
      return Response.json({ 
        success: true, 
        data: { play_progress: 0, duration: 0 } 
      }, { status: 200 });
    }
    
    return Response.json({ success: true, data: progress }, { status: 200 });
  } catch (error) {
    console.error('Get sermon progress error:', error);
    return Response.json({ success: false, error: { message: '获取播放进度失败' } }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/history/:sermonId - 删除播放历史记录
 */
export async function deletePlayHistory(request, env, sermonId) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return Response.json({ success: false, error: { message: '未授权' } }, { status: 401 });
    }
    
    const result = await env.DB.prepare(
      'DELETE FROM user_play_history WHERE user_id = ? AND sermon_id = ?'
    ).bind(userId, sermonId).run();
    
    if (result.meta.changes === 0) {
      return Response.json({ success: false, error: { message: '播放历史不存在' } }, { status: 404 });
    }
    
    return Response.json({ success: true, data: { message: '删除播放历史成功' } }, { status: 200 });
  } catch (error) {
    console.error('Delete play history error:', error);
    return Response.json({ success: false, error: { message: '删除播放历史失败' } }, { status: 500 });
  }
}

