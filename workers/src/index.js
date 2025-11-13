/**
 * TingDao API - Cloudflare Workers
 * Main entry point
 */

import { handleOptions } from './utils/response.js';
import * as sermonsRoute from './routes/sermons.js';
import * as speakersRoute from './routes/speakers.js';
import * as usersRoute from './routes/users.js';
import * as topicsRoute from './routes/topics.js';
import * as homeRoute from './routes/home.js';
import * as uploadRoute from './routes/upload.js';

export default {
  async fetch(request, env, ctx) {
    // 获取请求来源
    const origin = request.headers.get('Origin');
    
    // 处理CORS预检请求
    if (request.method === 'OPTIONS') {
      return handleOptions(origin);
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      // ==================== Sermons API ====================
      
      // GET /v1/sermons
      if (path === '/api/v1/sermons' && method === 'GET') {
        return await sermonsRoute.getSermons(request, env);
      }
      
      // POST /v1/sermons
      if (path === '/api/v1/sermons' && method === 'POST') {
        return await sermonsRoute.createSermon(request, env);
      }
      
      // GET /v1/sermons/:id
      if (path.match(/^\/api\/v1\/sermons\/[^/]+$/) && method === 'GET') {
        const id = path.split('/').pop();
        return await sermonsRoute.getSermon(request, env, id);
      }
      
      // PUT /v1/sermons/:id
      if (path.match(/^\/api\/v1\/sermons\/[^/]+$/) && method === 'PUT') {
        const id = path.split('/').pop();
        return await sermonsRoute.updateSermon(request, env, id);
      }
      
      // PATCH /v1/sermons/:id
      if (path.match(/^\/api\/v1\/sermons\/[^/]+$/) && method === 'PATCH') {
        const id = path.split('/').pop();
        return await sermonsRoute.updateSermonStatus(request, env, id);
      }
      
      // DELETE /v1/sermons/:id
      if (path.match(/^\/api\/v1\/sermons\/[^/]+$/) && method === 'DELETE') {
        const id = path.split('/').pop();
        return await sermonsRoute.deleteSermon(request, env, id);
      }

      // ==================== Speakers API ====================
      
      // GET /v1/speakers
      if (path === '/api/v1/speakers' && method === 'GET') {
        return await speakersRoute.getSpeakers(request, env);
      }
      
      // POST /v1/speakers
      if (path === '/api/v1/speakers' && method === 'POST') {
        return await speakersRoute.createSpeaker(request, env);
      }
      
      // GET /v1/speakers/:id
      if (path.match(/^\/api\/v1\/speakers\/[^/]+$/) && method === 'GET') {
        const id = path.split('/').pop();
        return await speakersRoute.getSpeaker(request, env, id);
      }
      
      // PUT /v1/speakers/:id
      if (path.match(/^\/api\/v1\/speakers\/[^/]+$/) && method === 'PUT') {
        const id = path.split('/').pop();
        return await speakersRoute.updateSpeaker(request, env, id);
      }
      
      // PATCH /v1/speakers/:id
      if (path.match(/^\/api\/v1\/speakers\/[^/]+$/) && method === 'PATCH') {
        const id = path.split('/').pop();
        return await speakersRoute.updateSpeakerStatus(request, env, id);
      }
      
      // DELETE /v1/speakers/:id
      if (path.match(/^\/api\/v1\/speakers\/[^/]+$/) && method === 'DELETE') {
        const id = path.split('/').pop();
        return await speakersRoute.deleteSpeaker(request, env, id);
      }

      // ==================== Users API ====================
      
      // GET /v1/users
      if (path === '/api/v1/users' && method === 'GET') {
        return await usersRoute.getUsers(request, env);
      }
      
      // GET /v1/users/:id
      if (path.match(/^\/api\/v1\/users\/[^/]+$/) && method === 'GET') {
        const id = path.split('/').pop();
        return await usersRoute.getUser(request, env, id);
      }
      
      // PUT /v1/users/:id
      if (path.match(/^\/api\/v1\/users\/[^/]+$/) && method === 'PUT') {
        const id = path.split('/').pop();
        return await usersRoute.updateUser(request, env, id);
      }
      
      // PATCH /v1/users/:id
      if (path.match(/^\/api\/v1\/users\/[^/]+$/) && method === 'PATCH') {
        const id = path.split('/').pop();
        return await usersRoute.updateUserStatus(request, env, id);
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

      // ==================== 404 ====================
      
      return new Response(JSON.stringify({
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
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*'
        }
      });

    } catch (error) {
      console.error('Unhandled error:', error);
      
      return new Response(JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || '服务器内部错误'
        }
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};

