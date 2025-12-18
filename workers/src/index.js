/**
 * TingDao API - Cloudflare Workers
 * Main entry point - 集成安全中间件
 */

import { handleOptions } from './utils/response.js';
import { withCache } from './middleware/cache.js';
import { checkRateLimit, rateLimitResponse, addRateLimitHeaders } from './middleware/rateLimit.js';
import { handleCorsPreFlight, addCorsHeaders, isOriginAllowed } from './middleware/cors.js';
import { validateApiKey, apiKeyErrorResponse } from './middleware/apiKey.js';
import * as sermonsRoute from './routes/sermons.js';
import * as speakersRoute from './routes/speakers.js';
import * as usersRoute from './routes/users.js';
import * as topicsRoute from './routes/topics.js';
import * as homeRoute from './routes/home.js';
import * as uploadRoute from './routes/upload.js';
import * as authRoute from './routes/auth.js';
import * as favoritesRoute from './routes/favorites.js';
import * as historyRoute from './routes/history.js';
import * as passwordResetRoute from './routes/password-reset.js';
import * as statsRoute from './routes/stats.js';
import * as topicFavoritesRoute from './routes/topic-favorites.js';
import * as speakerFavoritesRoute from './routes/speaker-favorites.js';
import * as submissionsRoute from './routes/submissions.js';

// Helper function to wrap responses with security headers
function wrapResponse(response, origin, rateLimitResult) {
  let newResponse = addCorsHeaders(response, origin);
  newResponse = addRateLimitHeaders(newResponse, rateLimitResult);
  return newResponse;
}

export default {
  async fetch(request, env, ctx) {
    // 获取请求来源
    const origin = request.headers.get('Origin');
    
    // 🔒 CORS检查 - 验证请求来源
    if (origin && !isOriginAllowed(origin)) {
      console.warn(`🚫 Blocked request from unauthorized origin: ${origin}`);
      return new Response(JSON.stringify({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '不允许的请求来源'
        }
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });
    }
    
    // 处理CORS预检请求
    if (request.method === 'OPTIONS') {
      return handleCorsPreFlight(origin);
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      // 🚦 Rate Limiting检查
      const rateLimitResult = await checkRateLimit(request, env);
      if (!rateLimitResult.allowed) {
        // Rate Limit 429响应也要添加CORS headers
        let response = rateLimitResponse(rateLimitResult);
        response = addCorsHeaders(response, origin);
        return response;
      }
      
      // 🔑 API Key验证
      const apiKeyResult = validateApiKey(request);
      if (!apiKeyResult || !apiKeyResult.valid) {
        // 返回401时也要添加CORS headers
        let response = apiKeyErrorResponse('Invalid or missing API Key');
        response = addCorsHeaders(response, origin);
        response = addRateLimitHeaders(response, rateLimitResult);
        return response;
      }
      
      if (apiKeyResult.warning) {
        console.warn(`⚠️ ${apiKeyResult.warning}`);
      }
      
      // 定义响应包装器
      const wrap = (response) => wrapResponse(response, origin, rateLimitResult);
      // ==================== Sermons API ====================
      
      // GET /v1/sermons (带缓存)
      if (path === '/api/v1/sermons' && method === 'GET') {
        return wrap(await withCache(request, () => sermonsRoute.getSermons(request, env), ctx, 300));
      }
      
      // POST /v1/sermons
      if (path === '/api/v1/sermons' && method === 'POST') {
        return wrap(await sermonsRoute.createSermon(request, env));
      }
      
      // GET /v1/sermons/:id
      if (path.match(/^\/api\/v1\/sermons\/[^/]+$/) && method === 'GET') {
        const id = path.split('/').pop();
        return wrap(await sermonsRoute.getSermon(request, env, id));
      }
      
      // PUT /v1/sermons/:id
      if (path.match(/^\/api\/v1\/sermons\/[^/]+$/) && method === 'PUT') {
        const id = path.split('/').pop();
        return await sermonsRoute.updateSermon(request, env, id);
      }
      
      // PATCH /v1/sermons/:id
      if (path.match(/^\/api\/v1\/sermons\/[^/]+$/) && method === 'PATCH') {
        const id = path.split('/').pop();
        return await sermonsRoute.updateSermon(request, env, id);
      }
      
      // DELETE /v1/sermons/:id
      if (path.match(/^\/api\/v1\/sermons\/[^/]+$/) && method === 'DELETE') {
        const id = path.split('/').pop();
        return await sermonsRoute.deleteSermon(request, env, id);
      }
      
      // POST /v1/sermons/:id/play
      if (path.match(/^\/api\/v1\/sermons\/[^/]+\/play$/) && method === 'POST') {
        const id = path.split('/')[4];
        return await sermonsRoute.incrementPlayCount(request, env, id);
      }

      // ==================== Speakers API ====================
      
      // GET /v1/speakers
      if (path === '/api/v1/speakers' && method === 'GET') {
        return wrap(await speakersRoute.getSpeakers(request, env));
      }
      
      // POST /v1/speakers
      if (path === '/api/v1/speakers' && method === 'POST') {
        return wrap(await speakersRoute.createSpeaker(request, env));
      }
      
      // GET /v1/speakers/:id/sermons
      if (path.match(/^\/api\/v1\/speakers\/[^/]+\/sermons$/) && method === 'GET') {
        const parts = path.split('/');
        const speakerId = parts[parts.length - 2];
        return wrap(await speakersRoute.getSpeakerSermons(request, env, speakerId));
      }
      
      // GET /v1/speakers/:id
      if (path.match(/^\/api\/v1\/speakers\/[^/]+$/) && method === 'GET') {
        const id = path.split('/').pop();
        return wrap(await speakersRoute.getSpeaker(request, env, id));
      }
      
      // PUT /v1/speakers/:id
      if (path.match(/^\/api\/v1\/speakers\/[^/]+$/) && method === 'PUT') {
        const id = path.split('/').pop();
        return wrap(await speakersRoute.updateSpeaker(request, env, id));
      }
      
      // PATCH /v1/speakers/:id
      if (path.match(/^\/api\/v1\/speakers\/[^/]+$/) && method === 'PATCH') {
        const id = path.split('/').pop();
        return wrap(await speakersRoute.updateSpeakerStatus(request, env, id));
      }
      
      // DELETE /v1/speakers/:id
      if (path.match(/^\/api\/v1\/speakers\/[^/]+$/) && method === 'DELETE') {
        const id = path.split('/').pop();
        return wrap(await speakersRoute.deleteSpeaker(request, env, id));
      }

      // ==================== Users API ====================
      
      // GET /v1/users
      if (path === '/api/v1/users' && method === 'GET') {
        return wrap(await usersRoute.getUsers(request, env));
      }
      
      // GET /v1/users/:id
      if (path.match(/^\/api\/v1\/users\/[^/]+$/) && method === 'GET') {
        const id = path.split('/').pop();
        return wrap(await usersRoute.getUser(request, env, id));
      }
      
      // PUT /v1/users/:id
      if (path.match(/^\/api\/v1\/users\/[^/]+$/) && method === 'PUT') {
        const id = path.split('/').pop();
        return wrap(await usersRoute.updateUser(request, env, id));
      }
      
      // PATCH /v1/users/:id
      if (path.match(/^\/api\/v1\/users\/[^/]+$/) && method === 'PATCH') {
        const id = path.split('/').pop();
        return wrap(await usersRoute.updateUserStatus(request, env, id));
      }

      // ==================== Topics API ====================
      
      // GET /v1/topics
      if (path === '/api/v1/topics' && method === 'GET') {
        return await topicsRoute.getTopics(request, env);
      }
      
      // POST /v1/topics
      if (path === '/api/v1/topics' && method === 'POST') {
        return await topicsRoute.createTopic(request, env);
      }
      
      // GET /v1/topics/:id/sermons (must be before /v1/topics/:id)
      if (path.match(/^\/api\/v1\/topics\/[^/]+\/sermons$/) && method === 'GET') {
        const id = path.split('/')[4]; // /api/v1/topics/:id/sermons
        return await topicsRoute.getTopicSermons(request, env, id);
      }
      
      // GET /v1/topics/:id
      if (path.match(/^\/api\/v1\/topics\/[^/]+$/) && method === 'GET') {
        const id = path.split('/').pop();
        return await topicsRoute.getTopic(request, env, id);
      }
      
      // PUT /v1/topics/:id
      if (path.match(/^\/api\/v1\/topics\/[^/]+$/) && method === 'PUT') {
        const id = path.split('/').pop();
        return await topicsRoute.updateTopic(request, env, id);
      }
      
      // PATCH /v1/topics/:id
      if (path.match(/^\/api\/v1\/topics\/[^/]+$/) && method === 'PATCH') {
        const id = path.split('/').pop();
        return await topicsRoute.updateTopicStatus(request, env, id);
      }
      
      // DELETE /v1/topics/:id
      if (path.match(/^\/api\/v1\/topics\/[^/]+$/) && method === 'DELETE') {
        const id = path.split('/').pop();
        return await topicsRoute.deleteTopic(request, env, id);
      }
      
      // PUT /v1/topics/:id/sermons
      if (path.match(/^\/api\/v1\/topics\/[^/]+\/sermons$/) && method === 'PUT') {
        const id = path.split('/')[4]; // /api/v1/topics/:id/sermons
        return await topicsRoute.updateTopicSermons(request, env, id);
      }

      // ==================== Home & Config API ====================
      
      // GET /v1/home/config
      if (path === '/api/v1/home/config' && method === 'GET') {
        return await homeRoute.getHomeConfig(request, env);
      }
      
      // PUT /v1/home/config
      if (path === '/api/v1/home/config' && method === 'PUT') {
        return await homeRoute.updateHomeConfig(request, env);
      }
      
      // GET /v1/curation/home-config (兼容旧API)
      if (path === '/api/v1/curation/home-config' && method === 'GET') {
        return await homeRoute.getCurationHomeConfig(request, env);
      }
      
      // PATCH /v1/curation/home-config
      if (path === '/api/v1/curation/home-config' && method === 'PATCH') {
        return await homeRoute.updateCurationHomeConfig(request, env);
      }
      
      // GET /v1/curation/discover-config
      if (path === '/api/v1/curation/discover-config' && method === 'GET') {
        return await homeRoute.getDiscoverConfig(request, env);
      }
      
      // PATCH /v1/curation/discover-config
      if (path === '/api/v1/curation/discover-config' && method === 'PATCH') {
        return await homeRoute.updateDiscoverConfig(request, env);
      }
      
      // GET /v1/curation/launch-screen-config
      if (path === '/api/v1/curation/launch-screen-config' && method === 'GET') {
        return await homeRoute.getLaunchScreenConfig(request, env);
      }
      
      // PATCH /v1/curation/launch-screen-config
      if (path === '/api/v1/curation/launch-screen-config' && method === 'PATCH') {
        return await homeRoute.updateLaunchScreenConfig(request, env);
      }
      
      // GET /v1/launch-screen
      if (path === '/api/v1/launch-screen' && method === 'GET') {
        return await homeRoute.getLaunchScreen(request, env);
      }
      
      // PUT /v1/launch-screen
      if (path === '/api/v1/launch-screen' && method === 'PUT') {
        return await homeRoute.updateLaunchScreen(request, env);
      }

      // ==================== Upload API ====================
      
      // POST /v1/upload/audio
      if (path === '/api/v1/upload/audio' && method === 'POST') {
        return await uploadRoute.uploadAudio(request, env);
      }
      
      // POST /v1/upload/image
      if (path === '/api/v1/upload/image' && method === 'POST') {
        return await uploadRoute.uploadImage(request, env);
      }
      
      // DELETE /v1/upload/*
      if (path.match(/^\/api\/v1\/upload\/.+/) && method === 'DELETE') {
        const filePath = path.replace('/api/v1/upload/', '');
        return await uploadRoute.deleteFile(request, env, filePath);
      }

      // ==================== Auth API ====================
      
      // POST /v1/auth/send-verification-code
      if (path === '/api/v1/auth/send-verification-code' && method === 'POST') {
        return await authRoute.sendVerificationCode(request, env);
      }
      
      // POST /v1/auth/register
      if (path === '/api/v1/auth/register' && method === 'POST') {
        return await authRoute.register(request, env);
      }
      
      // POST /v1/auth/login
      if (path === '/api/v1/auth/login' && method === 'POST') {
        return await authRoute.login(request, env);
      }
      
      // GET /v1/auth/me
      if (path === '/api/v1/auth/me' && method === 'GET') {
        return await authRoute.getCurrentUser(request, env);
      }
      
      // PUT /v1/auth/profile
      if (path === '/api/v1/auth/profile' && method === 'PUT') {
        return await authRoute.updateProfile(request, env);
      }
      
      // DELETE /v1/auth/account
      if (path === '/api/v1/auth/account' && method === 'DELETE') {
        return await authRoute.deleteAccount(request, env);
      }
      
      // POST /v1/auth/forgot-password
      if (path === '/api/v1/auth/forgot-password' && method === 'POST') {
        return await passwordResetRoute.requestPasswordReset(request, env);
      }
      
      // GET /v1/auth/verify-reset-token
      if (path === '/api/v1/auth/verify-reset-token' && method === 'GET') {
        return await passwordResetRoute.verifyResetToken(request, env);
      }
      
      // POST /v1/auth/reset-password
      if (path === '/api/v1/auth/reset-password' && method === 'POST') {
        return await passwordResetRoute.resetPassword(request, env);
      }

      // ==================== Favorites API ====================
      
      // GET /v1/favorites
      if (path === '/api/v1/favorites' && method === 'GET') {
        return await favoritesRoute.getFavorites(request, env);
      }
      
      // POST /v1/favorites
      if (path === '/api/v1/favorites' && method === 'POST') {
        return await favoritesRoute.addFavorite(request, env);
      }
      
      // DELETE /v1/favorites/:sermonId
      if (path.match(/^\/api\/v1\/favorites\/[^/]+$/) && method === 'DELETE') {
        const sermonId = path.split('/').pop();
        return await favoritesRoute.removeFavorite(request, env, sermonId);
      }
      
      // GET /v1/favorites/check/:sermonId
      if (path.match(/^\/api\/v1\/favorites\/check\/[^/]+$/) && method === 'GET') {
        const sermonId = path.split('/').pop();
        return await favoritesRoute.checkFavorite(request, env, sermonId);
      }

      // ==================== Play History API ====================
      
      // GET /v1/history
      if (path === '/api/v1/history' && method === 'GET') {
        return await historyRoute.getPlayHistory(request, env);
      }
      
      // POST /v1/history
      if (path === '/api/v1/history' && method === 'POST') {
        return await historyRoute.updatePlayProgress(request, env);
      }
      
      // GET /v1/history/:sermonId
      if (path.match(/^\/api\/v1\/history\/[^/]+$/) && method === 'GET') {
        const sermonId = path.split('/').pop();
        return await historyRoute.getSermonProgress(request, env, sermonId);
      }
      
      // DELETE /v1/history/:sermonId
      if (path.match(/^\/api\/v1\/history\/[^/]+$/) && method === 'DELETE') {
        const sermonId = path.split('/').pop();
        return await historyRoute.deletePlayHistory(request, env, sermonId);
      }

      // ==================== Stats API ====================
      
      // GET /v1/stats/overview
      if (path === '/api/v1/stats/overview' && method === 'GET') {
        return await statsRoute.getOverviewStats(request, env);
      }
      
      // GET /v1/stats/sermons/top-favorited
      if (path === '/api/v1/stats/sermons/top-favorited' && method === 'GET') {
        return await statsRoute.getTopFavoritedSermons(request, env);
      }
      
      // GET /v1/stats/speakers/top-favorited
      if (path === '/api/v1/stats/speakers/top-favorited' && method === 'GET') {
        return await statsRoute.getTopFavoritedSpeakers(request, env);
      }
      
      // GET /v1/stats/sermons/:id/favorites
      if (path.match(/^\/api\/v1\/stats\/sermons\/[^/]+\/favorites$/) && method === 'GET') {
        const sermonId = path.split('/')[5];
        return await statsRoute.getSermonFavoritesStats(request, env, sermonId);
      }
      
      // GET /v1/stats/speakers/:id/favorites
      if (path.match(/^\/api\/v1\/stats\/speakers\/[^/]+\/favorites$/) && method === 'GET') {
        const speakerId = path.split('/')[5];
        return await statsRoute.getSpeakerFavoritesStats(request, env, speakerId);
      }
      
      // GET /v1/stats/favorites/trends
      if (path === '/api/v1/stats/favorites/trends' && method === 'GET') {
        return await statsRoute.getFavoritesTrends(request, env);
      }

      // ==================== Topic Favorites API ====================
      
      // GET /v1/topic-favorites
      if (path === '/api/v1/topic-favorites' && method === 'GET') {
        return await topicFavoritesRoute.getTopicFavorites(request, env);
      }
      
      // POST /v1/topic-favorites
      if (path === '/api/v1/topic-favorites' && method === 'POST') {
        return await topicFavoritesRoute.addTopicFavorite(request, env);
      }
      
      // DELETE /v1/topic-favorites/:topicId
      if (path.match(/^\/api\/v1\/topic-favorites\/[^/]+$/) && method === 'DELETE') {
        const topicId = path.split('/').pop();
        return await topicFavoritesRoute.removeTopicFavorite(request, env, topicId);
      }
      
      // GET /v1/topic-favorites/check/:topicId
      if (path.match(/^\/api\/v1\/topic-favorites\/check\/[^/]+$/) && method === 'GET') {
        const topicId = path.split('/').pop();
        return await topicFavoritesRoute.checkTopicFavorite(request, env, topicId);
      }

      // ==================== Speaker Favorites API ====================
      
      // GET /v1/speaker-favorites
      if (path === '/api/v1/speaker-favorites' && method === 'GET') {
        return await speakerFavoritesRoute.getSpeakerFavorites(request, env);
      }
      
      // POST /v1/speaker-favorites
      if (path === '/api/v1/speaker-favorites' && method === 'POST') {
        return await speakerFavoritesRoute.addSpeakerFavorite(request, env);
      }
      
      // DELETE /v1/speaker-favorites/:speakerId
      if (path.match(/^\/api\/v1\/speaker-favorites\/[^/]+$/) && method === 'DELETE') {
        const speakerId = path.split('/').pop();
        return await speakerFavoritesRoute.removeSpeakerFavorite(request, env, speakerId);
      }
      
      // GET /v1/speaker-favorites/check/:speakerId
      if (path.match(/^\/api\/v1\/speaker-favorites\/check\/[^/]+$/) && method === 'GET') {
        const speakerId = path.split('/').pop();
        return await speakerFavoritesRoute.checkSpeakerFavorite(request, env, speakerId);
      }

      // ==================== Submissions API ====================
      
      // GET /v1/submissions
      if (path === '/api/v1/submissions' && method === 'GET') {
        return await submissionsRoute.getMySubmissions(request, env);
      }
      
      // GET /v1/submissions/:id
      if (path.match(/^\/api\/v1\/submissions\/[^/]+$/) && method === 'GET') {
        const id = path.split('/').pop();
        return await submissionsRoute.getSubmission(request, env, id);
      }
      
      // DELETE /v1/submissions/:id
      if (path.match(/^\/api\/v1\/submissions\/[^/]+$/) && method === 'DELETE') {
        const id = path.split('/').pop();
        return await submissionsRoute.deleteSubmission(request, env, id);
      }

      // ==================== 404 ====================
      
      return wrap(new Response(JSON.stringify({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '未找到该API端点',
          path: path,
          method: method
        }
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        }
      }));

    } catch (error) {
      console.error('Unhandled error:', error);
      
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || '服务器内部错误'
        }
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        }
      }), origin);
    }
  }
};

