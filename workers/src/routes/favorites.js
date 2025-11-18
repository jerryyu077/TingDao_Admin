/**
 * 用户收藏 API
 */
import { getUserIdFromRequest } from './auth.js';

/**
 * 生成唯一 ID
 */
function generateId(prefix) {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}-${timestamp}${random}`;
}

/**
 * GET /api/v1/favorites - 获取用户收藏列表
 */
export async function getFavorites(request, env) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return Response.json({ success: false, error: { message: '未授权' } }, { status: 401 });
    }
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    const favorites = await env.DB.prepare(`
      SELECT 
        uf.sermon_id,
        uf.created_at as favorited_at,
        s.*
      FROM user_favorites uf
      JOIN sermons s ON uf.sermon_id = s.id
      WHERE uf.user_id = ?
      ORDER BY uf.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(userId, limit, offset).all();
    
    const countResult = await env.DB.prepare(
      'SELECT COUNT(*) as total FROM user_favorites WHERE user_id = ?'
    ).bind(userId).first();
    
    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limit);
    
    return Response.json({
      success: true,
      data: {
        sermons: favorites.results || [],
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Get favorites error:', error);
    return Response.json({ success: false, error: { message: '获取收藏列表失败' } }, { status: 500 });
  }
}

/**
 * POST /api/v1/favorites - 添加收藏
 */
export async function addFavorite(request, env) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return Response.json({ success: false, error: { message: '未授权' } }, { status: 401 });
    }
    
    const body = await request.json();
    const { sermon_id } = body;
    
    if (!sermon_id) {
      return Response.json({ success: false, error: { message: 'sermon_id 为必填项' } }, { status: 400 });
    }
    
    const sermon = await env.DB.prepare('SELECT id FROM sermons WHERE id = ?').bind(sermon_id).first();
    if (!sermon) {
      return Response.json({ success: false, error: { message: '讲道不存在' } }, { status: 404 });
    }
    
    const existing = await env.DB.prepare(
      'SELECT * FROM user_favorites WHERE user_id = ? AND sermon_id = ?'
    ).bind(userId, sermon_id).first();
    
    if (existing) {
      return Response.json({ success: false, error: { message: '已经收藏过该讲道' } }, { status: 409 });
    }
    
    await env.DB.prepare(`
      INSERT INTO user_favorites (user_id, sermon_id, created_at)
      VALUES (?, ?, datetime('now'))
    `).bind(userId, sermon_id).run();
    
    return Response.json({ success: true, data: { message: '收藏成功' } }, { status: 201 });
  } catch (error) {
    console.error('Add favorite error:', error);
    return Response.json({ success: false, error: { message: '添加收藏失败' } }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/favorites/:sermonId - 取消收藏
 */
export async function removeFavorite(request, env, sermonId) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return Response.json({ success: false, error: { message: '未授权' } }, { status: 401 });
    }
    
    if (!sermonId) {
      return Response.json({ success: false, error: { message: 'sermon_id 为必填项' } }, { status: 400 });
    }
    
    const result = await env.DB.prepare(
      'DELETE FROM user_favorites WHERE user_id = ? AND sermon_id = ?'
    ).bind(userId, sermonId).run();
    
    if (result.meta.changes === 0) {
      return Response.json({ success: false, error: { message: '收藏不存在' } }, { status: 404 });
    }
    
    return Response.json({ success: true, data: { message: '取消收藏成功' } }, { status: 200 });
  } catch (error) {
    console.error('Remove favorite error:', error);
    return Response.json({ success: false, error: { message: '取消收藏失败' } }, { status: 500 });
  }
}

/**
 * GET /api/v1/favorites/check/:sermonId - 检查是否已收藏
 */
export async function checkFavorite(request, env, sermonId) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return Response.json({ success: false, error: { message: '未授权' } }, { status: 401 });
    }
    
    const favorite = await env.DB.prepare(
      'SELECT * FROM user_favorites WHERE user_id = ? AND sermon_id = ?'
    ).bind(userId, sermonId).first();
    
    return Response.json({ success: true, data: { isFavorited: !!favorite } }, { status: 200 });
  } catch (error) {
    console.error('Check favorite error:', error);
    return Response.json({ success: false, error: { message: '检查收藏状态失败' } }, { status: 500 });
  }
}

