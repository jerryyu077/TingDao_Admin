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
        s.id,
        s.title,
        s.summary,
        s.scripture,
        s.audio_url,
        s.duration,
        s.series_id,
        s.publish_date,
        s.date,
        s.cover_image_url,
        s.language,
        s.tags,
        s.play_count,
        s.favorite_count,
        s.created_at,
        s.updated_at,
        sp.id as speaker_id,
        sp.name as speaker_name,
        sp.avatar_url as speaker_avatar_url,
        (SELECT COUNT(DISTINCT user_id) FROM user_favorites WHERE sermon_id = s.id) as favorites_count,
        uf.created_at as favorited_at
      FROM user_favorites uf
      JOIN sermons s ON uf.sermon_id = s.id
      LEFT JOIN speakers sp ON s.speaker_id = sp.id
      WHERE uf.user_id = ?
      ORDER BY uf.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(userId, limit, offset).all();
    
    const countResult = await env.DB.prepare(
      'SELECT COUNT(*) as total FROM user_favorites WHERE user_id = ?'
    ).bind(userId).first();
    
    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limit);
    
    // 格式化数据以匹配客户端期望的结构
    const formattedSermons = (favorites.results || []).map(row => {
      // 将日期转换为 ISO8601 格式
      let isoDate = row.date;
      if (row.date && !row.date.includes('T')) {
        // 如果 date 只是 YYYY-MM-DD 格式，转换为 ISO8601
        isoDate = `${row.date}T00:00:00Z`;
      }
      
      return {
        id: row.id,
        title: row.title,
        summary: row.summary,
        scripture: row.scripture,
        audioURL: row.audio_url, // 注意大小写，客户端使用 audioURL
        coverImageURL: row.cover_image_url, // 客户端使用 coverImageURL
        duration: row.duration,
        series: row.series_id,
        date: isoDate, // 客户端期望 ISO8601 格式
        publishDate: row.publish_date || isoDate,
        language: row.language,
        tags: row.tags ? row.tags.split(',') : [],
        playCount: row.play_count || 0,
        favoriteCount: row.favorite_count || 0,
        status: 'published', // 默认状态
        currentTime: 0, // 播放进度默认为 0
        isPlaying: false, // 默认不在播放
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        favoritesCount: row.favorites_count || 0,
        speaker: row.speaker_id ? {
          id: row.speaker_id,
          name: row.speaker_name,
          avatarURL: row.speaker_avatar_url, // 注意大小写
          title: null,
          bio: null,
          church: null,
          followerCount: null
        } : null,
        favoritedAt: row.favorited_at
      };
    });
    
    return Response.json({
      success: true,
      data: {
        sermons: formattedSermons,
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

