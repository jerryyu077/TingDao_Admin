/**
 * CORS Middleware - 跨域资源共享白名单
 * 防止未授权的网站访问API
 */

// CORS白名单
const ALLOWED_ORIGINS = [
  'https://share.tingdao.app',              // 分享页
  'https://tingdao.app',                    // 主网站（如果有）
  'https://admin.tingdao.app',              // 管理后台
  'http://localhost:3000',                  // 本地开发
  'http://127.0.0.1:3000',                  // 本地开发
  'tingdao://',                              // iOS App (URL Scheme)
  'capacitor://localhost',                   // 如果使用Capacitor
  'http://localhost:8100',                   // Ionic本地开发
];

// 生产环境的Cloudflare Pages域名模式
const CLOUDFLARE_PAGES_PATTERN = /https:\/\/.*\.pages\.dev$/;

/**
 * 检查Origin是否被允许
 * @param {string} origin
 * @returns {boolean}
 */
export function isOriginAllowed(origin) {
  if (!origin) {
    // 如果没有Origin header（同源请求或某些移动应用），允许
    return true;
  }
  
  // 检查白名单
  if (ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }
  
  // 检查Cloudflare Pages域名（用于预览部署）
  if (CLOUDFLARE_PAGES_PATTERN.test(origin)) {
    return true;
  }
  
  // iOS App通常不发送Origin，或发送null
  if (origin === 'null' || origin === 'undefined') {
    return true;
  }
  
  return false;
}

/**
 * 获取CORS Headers
 * @param {string} origin
 * @param {string} method
 * @returns {Object} Headers对象
 */
export function getCorsHeaders(origin, method = 'GET') {
  const headers = {};
  
  // 如果Origin被允许，设置对应的Access-Control-Allow-Origin
  if (isOriginAllowed(origin)) {
    // 对于有凭证的请求，不能使用 *
    headers['Access-Control-Allow-Origin'] = origin || '*';
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else {
    // 不在白名单中的Origin，不设置CORS头（浏览器会阻止）
    console.warn(`🚫 Blocked CORS request from unauthorized origin: ${origin}`);
    return null;
  }
  
  // 其他CORS头
  headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
  headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-API-Key, X-Client-Type, X-Requested-With';
  headers['Access-Control-Max-Age'] = '86400'; // 24小时
  headers['Access-Control-Expose-Headers'] = 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset';
  
  return headers;
}

/**
 * 处理OPTIONS预检请求
 * @param {string} origin
 * @returns {Response}
 */
export function handleCorsPreFlight(origin) {
  const corsHeaders = getCorsHeaders(origin, 'OPTIONS');
  
  if (!corsHeaders) {
    // Origin不被允许
    return new Response(JSON.stringify({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: '不允许的请求来源'
      }
    }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    });
  }
  
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

/**
 * 添加CORS Headers到响应
 * @param {Response} response
 * @param {string} origin
 * @returns {Response}
 */
export function addCorsHeaders(response, origin) {
  const corsHeaders = getCorsHeaders(origin);
  
  if (!corsHeaders) {
    // 如果Origin不被允许，返回403
    return new Response(JSON.stringify({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: '不允许的请求来源'
      }
    }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    });
  }
  
  // 创建新的Response，添加CORS头
  const newResponse = new Response(response.body, response);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  
  return newResponse;
}

/**
 * 检查请求的Referer
 * @param {Request} request
 * @returns {boolean}
 */
export function checkReferer(request) {
  const referer = request.headers.get('Referer');
  
  // 如果没有Referer（直接访问或移动应用），允许
  if (!referer) {
    return true;
  }
  
  try {
    const refererUrl = new URL(referer);
    const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
    
    return isOriginAllowed(refererOrigin);
  } catch (error) {
    console.warn('Invalid referer:', referer);
    return false;
  }
}

