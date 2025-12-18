/**
 * API Key Middleware
 * 为公开端点提供API Key验证
 */

// API Key配置
const API_KEYS = {
  // share-web的公开API Key（有限权限）
  'share_web_v1_2025': {
    name: 'Share Web Public',
    permissions: ['read'],
    rateLimit: 'public',
    allowedEndpoints: [
      '/api/v1/sermons',
      '/api/v1/speakers',
      '/api/v1/topics'
    ]
  },
  // iOS App的API Key（完整权限）
  'ios_app_v1_2025': {
    name: 'iOS App',
    permissions: ['read', 'write'],
    rateLimit: 'authenticated',
    allowedEndpoints: ['*']
  },
  // Admin后台的API Key（管理员权限）
  'admin_panel_v1_2025': {
    name: 'Admin Panel',
    permissions: ['read', 'write', 'admin'],
    rateLimit: 'authenticated',
    allowedEndpoints: ['*']
  }
};

/**
 * 验证API Key
 * @param {Request} request
 * @returns {Object|null} API Key配置，如果无效则返回null
 */
export function validateApiKey(request) {
  const apiKey = request.headers.get('X-API-Key');
  const clientType = request.headers.get('X-Client-Type');
  
  // 如果有JWT Authorization，优先使用JWT认证
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // JWT认证会在其他地方处理
    return { 
      valid: true, 
      type: 'jwt',
      permissions: ['read', 'write']
    };
  }
  
  // 没有API Key，检查是否是公开端点或认证端点
  if (!apiKey) {
    const url = new URL(request.url);
    const method = request.method;
    
    // GET请求到公开端点，允许无API Key访问（但会受到更严格的Rate Limit）
    if (method === 'GET' && isPublicEndpoint(url.pathname)) {
      return {
        valid: true,
        type: 'public',
        permissions: ['read'],
        rateLimit: 'public',
        warning: 'No API Key provided - strict rate limit applied'
      };
    }
    
    // 认证相关端点（注册、登录等）也允许无API Key访问
    if (isAuthEndpoint(url.pathname)) {
      return {
        valid: true,
        type: 'auth',
        permissions: ['read', 'write'],
        rateLimit: 'sensitive',
        warning: 'Auth endpoint - no API Key required'
      };
    }
    
    return null;
  }
  
  // 验证API Key
  const keyConfig = API_KEYS[apiKey];
  
  if (!keyConfig) {
    console.warn(`🚫 Invalid API Key: ${apiKey}`);
    return null;
  }
  
  // 检查端点权限
  const url = new URL(request.url);
  if (!isEndpointAllowed(keyConfig, url.pathname)) {
    console.warn(`🚫 API Key ${keyConfig.name} not allowed for endpoint: ${url.pathname}`);
    return null;
  }
  
  // 检查操作权限
  const method = request.method;
  if (method !== 'GET' && !keyConfig.permissions.includes('write')) {
    console.warn(`🚫 API Key ${keyConfig.name} not allowed for ${method} operations`);
    return null;
  }
  
  console.log(`✅ Valid API Key: ${keyConfig.name} (${clientType || 'unknown'})`);
  
  return {
    valid: true,
    type: 'apikey',
    name: keyConfig.name,
    permissions: keyConfig.permissions,
    rateLimit: keyConfig.rateLimit
  };
}

/**
 * 检查是否是公开端点（无需API Key）
 * @param {string} pathname
 * @returns {boolean}
 */
function isPublicEndpoint(pathname) {
  const publicEndpoints = [
    /^\/api\/v1\/sermons\/[^/]+$/,          // GET /sermons/:id
    /^\/api\/v1\/sermons$/,                  // GET /sermons (list)
    /^\/api\/v1\/speakers\/[^/]+$/,          // GET /speakers/:id
    /^\/api\/v1\/speakers$/,                 // GET /speakers (list)
    /^\/api\/v1\/speakers\/[^/]+\/sermons$/, // GET /speakers/:id/sermons
    /^\/api\/v1\/topics\/[^/]+$/,            // GET /topics/:id
    /^\/api\/v1\/topics$/,                   // GET /topics (list)
    /^\/api\/v1\/topics\/[^/]+\/sermons$/,   // GET /topics/:id/sermons
    /^\/api\/v1\/home\/config$/,             // GET /home/config
    /^\/api\/v1\/curation\//,                // GET /curation/* (配置)
    /^\/api\/v1\/launch-screen$/,            // GET /launch-screen
  ];
  
  return publicEndpoints.some(pattern => pattern.test(pathname));
}

/**
 * 检查是否是认证端点（无需API Key，但需要Rate Limit）
 * @param {string} pathname
 * @returns {boolean}
 */
function isAuthEndpoint(pathname) {
  const authEndpoints = [
    '/api/v1/auth/send-verification-code',   // 发送验证码
    '/api/v1/auth/register',                 // 注册
    '/api/v1/auth/login',                    // 登录
    '/api/v1/auth/forgot-password',          // 忘记密码
    '/api/v1/auth/verify-reset-token',       // 验证重置token
    '/api/v1/auth/reset-password',           // 重置密码
  ];
  
  return authEndpoints.includes(pathname);
}

/**
 * 检查端点是否被API Key允许
 * @param {Object} keyConfig
 * @param {string} pathname
 * @returns {boolean}
 */
function isEndpointAllowed(keyConfig, pathname) {
  // 如果允许所有端点
  if (keyConfig.allowedEndpoints.includes('*')) {
    return true;
  }
  
  // 检查具体端点
  return keyConfig.allowedEndpoints.some(endpoint => {
    // 完全匹配
    if (pathname === endpoint) {
      return true;
    }
    
    // 前缀匹配
    if (pathname.startsWith(endpoint + '/')) {
      return true;
    }
    
    return false;
  });
}

/**
 * API Key验证失败响应
 * @param {string} reason
 * @returns {Response}
 */
export function apiKeyErrorResponse(reason = 'Invalid or missing API Key') {
  return new Response(JSON.stringify({
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: reason
    }
  }), {
    status: 401,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  });
}

/**
 * 获取Share Web的公开API Key
 * 用于更新share_web的js代码
 * @returns {string}
 */
export function getShareWebApiKey() {
  return 'share_web_v1_2025';
}

