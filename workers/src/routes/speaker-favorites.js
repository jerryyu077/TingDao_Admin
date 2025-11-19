/**
 * 用户讲员收藏 API
 */
import { getUserIdFromRequest } from './auth.js';

/**
 * GET /api/v1/speaker-favorites - 获取用户的讲员收藏列表
 */
export async function getSpeakerFavorites(request, env) {
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

    // 查询用户收藏的讲员
    const { results } = await env.DB.prepare(`
      SELECT 
        sp.id,
        sp.name,
        sp.avatar_url,
        sp.title,
        sp.bio,
        sp.church,
        usf.created_at as favorited_at,
        (SELECT COUNT(*) FROM user_speaker_favorites WHERE speaker_id = sp.id) as favorites_count,
        (SELECT COUNT(*) FROM sermons WHERE speaker_id = sp.id) as sermon_count
      FROM user_speaker_favorites usf
      INNER JOIN speakers sp ON usf.speaker_id = sp.id
      WHERE usf.user_id = ?
      ORDER BY usf.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(userId, limit, offset).all();

    // 获取总数
    const { total } = await env.DB.prepare(`
      SELECT COUNT(*) as total
      FROM user_speaker_favorites
      WHERE user_id = ?
    `).bind(userId).first();

    // 格式化返回数据
    const speakers = results.map(speaker => ({
      id: speaker.id,
      name: speaker.name,
      avatarURL: speaker.avatar_url,
      title: speaker.title,
      bio: speaker.bio,
      church: speaker.church,
      favoritedAt: speaker.favorited_at,
      favoritesCount: speaker.favorites_count || 0,
      sermonCount: speaker.sermon_count || 0
    }));

    return Response.json({
      success: true,
      data: {
        speakers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total || 0,
          totalPages: Math.ceil((total || 0) / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get speaker favorites error:', error);
    return Response.json(
      { success: false, error: { message: '服务器错误', details: error.message } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/speaker-favorites - 添加讲员收藏
 */
export async function addSpeakerFavorite(request, env) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return Response.json(
        { success: false, error: { message: '未授权' } },
        { status: 401 }
      );
    }

    const { speakerId } = await request.json();
    
    if (!speakerId) {
      return Response.json(
        { success: false, error: { message: '缺少讲员ID' } },
        { status: 400 }
      );
    }

    // 检查讲员是否存在
    const speaker = await env.DB.prepare(`
      SELECT id FROM speakers WHERE id = ?
    `).bind(speakerId).first();

    if (!speaker) {
      return Response.json(
        { success: false, error: { message: '讲员不存在' } },
        { status: 404 }
      );
    }

    // 检查是否已收藏
    const existing = await env.DB.prepare(`
      SELECT 1 FROM user_speaker_favorites
      WHERE user_id = ? AND speaker_id = ?
    `).bind(userId, speakerId).first();

    if (existing) {
      return Response.json(
        { success: false, error: { message: '已经收藏过该讲员' } },
        { status: 409 }
      );
    }

    // 添加收藏
    await env.DB.prepare(`
      INSERT INTO user_speaker_favorites (user_id, speaker_id)
      VALUES (?, ?)
    `).bind(userId, speakerId).run();

    return Response.json({
      success: true,
      data: { message: '收藏成功' }
    });
  } catch (error) {
    console.error('Add speaker favorite error:', error);
    return Response.json(
      { success: false, error: { message: '服务器错误', details: error.message } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/speaker-favorites/:speakerId - 删除讲员收藏
 */
export async function removeSpeakerFavorite(request, env, speakerId) {
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
      DELETE FROM user_speaker_favorites
      WHERE user_id = ? AND speaker_id = ?
    `).bind(userId, speakerId).run();

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
    console.error('Remove speaker favorite error:', error);
    return Response.json(
      { success: false, error: { message: '服务器错误', details: error.message } },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/speaker-favorites/check/:speakerId - 检查讲员是否已收藏
 */
export async function checkSpeakerFavorite(request, env, speakerId) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return Response.json({
        success: true,
        data: { isFavorited: false }
      });
    }

    const existing = await env.DB.prepare(`
      SELECT 1 FROM user_speaker_favorites
      WHERE user_id = ? AND speaker_id = ?
    `).bind(userId, speakerId).first();

    return Response.json({
      success: true,
      data: { isFavorited: !!existing }
    });
  } catch (error) {
    console.error('Check speaker favorite error:', error);
    return Response.json(
      { success: false, error: { message: '服务器错误', details: error.message } },
      { status: 500 }
    );
  }
}
