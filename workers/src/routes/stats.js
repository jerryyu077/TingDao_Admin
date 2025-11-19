/**
 * 统计 API 路由
 * 用于 Admin 端的数据统计和分析
 */
import { success, error } from '../utils/response.js';
import { queryOne, queryAll } from '../utils/db.js';

/**
 * GET /api/v1/stats/overview - 获取总体统计
 */
export async function getOverviewStats(request, env) {
  try {
    // 获取各种统计数据
    const stats = {};
    
    // 讲道统计
    const sermonStats = await queryOne(env.DB, `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft
      FROM sermons
    `);
    stats.sermons = sermonStats;
    
    // 讲员统计
    const speakerStats = await queryOne(env.DB, `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive
      FROM speakers
    `);
    stats.speakers = speakerStats;
    
    // 用户统计
    const userStats = await queryOne(env.DB, `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN created_at > datetime('now', '-7 days') THEN 1 END) as new_this_week,
        COUNT(CASE WHEN created_at > datetime('now', '-30 days') THEN 1 END) as new_this_month
      FROM users
    `);
    stats.users = userStats;
    
    // 收藏统计
    const favoritesStats = await queryOne(env.DB, `
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT sermon_id) as unique_sermons
      FROM user_favorites
    `);
    stats.favorites = favoritesStats;
    
    // 播放历史统计
    const historyStats = await queryOne(env.DB, `
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT sermon_id) as unique_sermons
      FROM user_play_history
    `);
    stats.playHistory = historyStats;
    
    return success(stats);
  } catch (e) {
    console.error('Get overview stats error:', e);
    return error('获取统计数据失败: ' + e.message);
  }
}

/**
 * GET /api/v1/stats/sermons/top-favorited - 获取最受欢迎的讲道（按收藏数）
 */
export async function getTopFavoritedSermons(request, env) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    const sql = `
      SELECT 
        s.id,
        s.title,
        s.speaker_id,
        sp.name as speaker_name,
        COUNT(uf.user_id) as favorites_count
      FROM sermons s
      LEFT JOIN speakers sp ON s.speaker_id = sp.id
      LEFT JOIN user_favorites uf ON s.id = uf.sermon_id
      WHERE s.status = 'published'
      GROUP BY s.id
      HAVING favorites_count > 0
      ORDER BY favorites_count DESC
      LIMIT ?
    `;
    
    const sermons = await queryAll(env.DB, sql, [limit]);
    
    return success(sermons);
  } catch (e) {
    console.error('Get top favorited sermons error:', e);
    return error('获取热门讲道失败: ' + e.message);
  }
}

/**
 * GET /api/v1/stats/speakers/top-favorited - 获取最受欢迎的讲员（按收藏数）
 */
export async function getTopFavoritedSpeakers(request, env) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    const sql = `
      SELECT 
        sp.id,
        sp.name,
        sp.church,
        sp.avatar_url,
        COUNT(DISTINCT uf.user_id) as favorites_count,
        COUNT(DISTINCT s.id) as sermons_count
      FROM speakers sp
      LEFT JOIN sermons s ON sp.id = s.speaker_id
      LEFT JOIN user_favorites uf ON s.id = uf.sermon_id
      WHERE sp.status = 'active'
      GROUP BY sp.id
      HAVING favorites_count > 0
      ORDER BY favorites_count DESC
      LIMIT ?
    `;
    
    const speakers = await queryAll(env.DB, sql, [limit]);
    
    return success(speakers);
  } catch (e) {
    console.error('Get top favorited speakers error:', e);
    return error('获取热门讲员失败: ' + e.message);
  }
}

/**
 * GET /api/v1/stats/sermons/:id/favorites - 获取某个讲道的收藏统计
 */
export async function getSermonFavoritesStats(request, env, sermonId) {
  try {
    const sql = `
      SELECT 
        COUNT(*) as favorites_count,
        COUNT(CASE WHEN created_at > datetime('now', '-7 days') THEN 1 END) as new_this_week,
        COUNT(CASE WHEN created_at > datetime('now', '-30 days') THEN 1 END) as new_this_month
      FROM user_favorites
      WHERE sermon_id = ?
    `;
    
    const stats = await queryOne(env.DB, sql, [sermonId]);
    
    return success(stats);
  } catch (e) {
    console.error('Get sermon favorites stats error:', e);
    return error('获取讲道收藏统计失败: ' + e.message);
  }
}

/**
 * GET /api/v1/stats/speakers/:id/favorites - 获取某个讲员的收藏统计
 */
export async function getSpeakerFavoritesStats(request, env, speakerId) {
  try {
    const sql = `
      SELECT 
        COUNT(DISTINCT uf.user_id) as favorites_count,
        COUNT(DISTINCT uf.sermon_id) as favorited_sermons_count,
        COUNT(CASE WHEN uf.created_at > datetime('now', '-7 days') THEN 1 END) as new_this_week,
        COUNT(CASE WHEN uf.created_at > datetime('now', '-30 days') THEN 1 END) as new_this_month
      FROM user_favorites uf
      JOIN sermons s ON uf.sermon_id = s.id
      WHERE s.speaker_id = ?
    `;
    
    const stats = await queryOne(env.DB, sql, [speakerId]);
    
    return success(stats);
  } catch (e) {
    console.error('Get speaker favorites stats error:', e);
    return error('获取讲员收藏统计失败: ' + e.message);
  }
}

/**
 * GET /api/v1/stats/favorites/trends - 获取收藏趋势（最近7天）
 */
export async function getFavoritesTrends(request, env) {
  try {
    const sql = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM user_favorites
      WHERE created_at > datetime('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    
    const trends = await queryAll(env.DB, sql);
    
    return success(trends);
  } catch (e) {
    console.error('Get favorites trends error:', e);
    return error('获取收藏趋势失败: ' + e.message);
  }
}

