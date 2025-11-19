/**
 * 用户主题收藏 API
 */
import { getUserIdFromRequest } from './auth.js';

/**
 * GET /api/v1/topic-favorites - 获取用户的主题收藏列表
 */
export async function getTopicFavorites(request, env) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return Response.json(
        { success: false, error: { message: '未授权' } },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = (page - 1) * limit;

    // 查询用户收藏的主题
    const { results } = await env.DB.prepare(`
      SELECT 
        t.id,
        t.name,
        t.description,
        t.cover_image_url,
        t.icon,
        t.gradient,
        t.sermon_count,
        utf.created_at as favorited_at,
        (SELECT COUNT(*) FROM user_topic_favorites WHERE topic_id = t.id) as favorites_count
      FROM user_topic_favorites utf
      INNER JOIN topics t ON utf.topic_id = t.id
      WHERE utf.user_id = ?
      ORDER BY utf.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(userId, limit, offset).all();

    // 获取总数
    const { total } = await env.DB.prepare(`
      SELECT COUNT(*) as total
      FROM user_topic_favorites
      WHERE user_id = ?
    `).bind(userId).first();

    // 格式化返回数据
    const topics = results.map(topic => ({
      id: topic.id,
      name: topic.name,
      description: topic.description,
      coverImageURL: topic.cover_image_url,
      icon: topic.icon,
      gradient: topic.gradient,
      sermonCount: topic.sermon_count,
      favoritedAt: topic.favorited_at,
      favoritesCount: topic.favorites_count || 0
    }));

    return Response.json({
      success: true,
      data: {
        topics,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total || 0,
          totalPages: Math.ceil((total || 0) / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get topic favorites error:', error);
    return Response.json(
      { success: false, error: { message: '服务器错误', details: error.message } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/topic-favorites - 添加主题收藏
 */
export async function addTopicFavorite(request, env) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return Response.json(
        { success: false, error: { message: '未授权' } },
        { status: 401 }
      );
    }

    const { topicId } = await request.json();
    
    if (!topicId) {
      return Response.json(
        { success: false, error: { message: '缺少主题ID' } },
        { status: 400 }
      );
    }

    // 检查主题是否存在
    const topic = await env.DB.prepare(`
      SELECT id FROM topics WHERE id = ?
    `).bind(topicId).first();

    if (!topic) {
      return Response.json(
        { success: false, error: { message: '主题不存在' } },
        { status: 404 }
      );
    }

    // 检查是否已收藏
    const existing = await env.DB.prepare(`
      SELECT 1 FROM user_topic_favorites
      WHERE user_id = ? AND topic_id = ?
    `).bind(userId, topicId).first();

    if (existing) {
      return Response.json(
        { success: false, error: { message: '已经收藏过该主题' } },
        { status: 409 }
      );
    }

    // 添加收藏
    await env.DB.prepare(`
      INSERT INTO user_topic_favorites (user_id, topic_id)
      VALUES (?, ?)
    `).bind(userId, topicId).run();

    return Response.json({
      success: true,
      data: { message: '收藏成功' }
    });
  } catch (error) {
    console.error('Add topic favorite error:', error);
    return Response.json(
      { success: false, error: { message: '服务器错误', details: error.message } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/topic-favorites/:topicId - 删除主题收藏
 */
export async function removeTopicFavorite(request, env, topicId) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return Response.json(
        { success: false, error: { message: '未授权' } },
        { status: 401 }
      );
    }

    // 删除收藏
    const result = await env.DB.prepare(`
      DELETE FROM user_topic_favorites
      WHERE user_id = ? AND topic_id = ?
    `).bind(userId, topicId).run();

    if (result.meta.changes === 0) {
      return Response.json(
        { success: false, error: { message: '未找到该收藏' } },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: { message: '取消收藏成功' }
    });
  } catch (error) {
    console.error('Remove topic favorite error:', error);
    return Response.json(
      { success: false, error: { message: '服务器错误', details: error.message } },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/topic-favorites/check/:topicId - 检查主题是否已收藏
 */
export async function checkTopicFavorite(request, env, topicId) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return Response.json({
        success: true,
        data: { isFavorited: false }
      });
    }

    const existing = await env.DB.prepare(`
      SELECT 1 FROM user_topic_favorites
      WHERE user_id = ? AND topic_id = ?
    `).bind(userId, topicId).first();

    return Response.json({
      success: true,
      data: { isFavorited: !!existing }
    });
  } catch (error) {
    console.error('Check topic favorite error:', error);
    return Response.json(
      { success: false, error: { message: '服务器错误', details: error.message } },
      { status: 500 }
    );
  }
}
