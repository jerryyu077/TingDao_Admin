/**
 * Rate Limiting Middleware
 * 防止API滥用
 */

// Rate Limit 配置
const RATE_LIMITS = {
  // 公开端点 - 每个IP每小时5000次（兼容旧版本App）
  public: {
    requests: 5000,
    window: 3600 // 1小时（秒）
  },
  // 认证端点 - iOS App - 每个IP每小时10000次
  authenticated: {
    requests: 10000,
    window: 3600
  },
  // Share Web - 每个IP每小时1000次（公开分享页面）
  shareWeb: {
    requests: 1000,
    window: 3600
  },
  // 敏感操作（登录、注册）- 每个IP每小时10次
  sensitive: {
    requests: 10,
    window: 3600
  }
  // 注意：iOS App (新版本) 和 Admin Panel 完全跳过 Rate Limit（已有API Key保护）
};

// 确定端点类型
function getEndpointType(path, method) {
  // 敏感操作
  if (path === '/api/v1/auth/login' || 
      path === '/api/v1/auth/register' ||
      path === '/api/v1/auth/send-verification-code') {
    return 'sensitive';
  }
  
  // 写入操作需要认证
  if (method !== 'GET') {
    return 'authenticated';
  }
  
  // 默认公开读取
  return 'public';
}

/**
 * Rate Limit检查
 * @param {Request} request
 * @param {Object} env
 * @returns {Object} { allowed: boolean, retryAfter?: number, remaining?: number }
 */
export async function checkRateLimit(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  
  // 获取客户端IP（Cloudflare会自动提供）
  const clientIP = request.headers.get('CF-Connecting-IP') || 
                   request.headers.get('X-Real-IP') || 
                   'unknown';
  
  // 获取客户端类型
  const clientType = request.headers.get('X-Client-Type') || '';
  
  // 🔓 Admin Panel 和 iOS App 完全跳过 Rate Limit（已有API Key保护）
  if (clientType === 'admin_panel' || clientType === 'ios-app') {
    console.log(`✅ ${clientType} 跳过 Rate Limit for IP: ${clientIP}`);
    return {
      allowed: true,
      remaining: 999999,
      limit: 999999
    };
  }
  
  // 确定端点类型和限制
  let endpointType = getEndpointType(path, method);
  
  // Share Web 使用中等限制（1000次/小时）
  if (clientType === 'share-web' && endpointType === 'public') {
    endpointType = 'shareWeb';
  }
  
  const limit = RATE_LIMITS[endpointType];
  
  // 生成唯一的限流key
  const rateLimitKey = `ratelimit:${endpointType}:${clientIP}`;
  
  try {
    // 从KV获取当前计数
    const currentData = await env.RATE_LIMIT_KV.get(rateLimitKey, { type: 'json' });
    
    const now = Date.now();
    let requestCount = 0;
    let windowStart = now;
    
    if (currentData) {
      const timeElapsed = now - currentData.windowStart;
      
      // 如果还在时间窗口内
      if (timeElapsed < limit.window * 1000) {
        requestCount = currentData.count;
        windowStart = currentData.windowStart;
        
        // 检查是否超过限制
        if (requestCount >= limit.requests) {
          const retryAfter = Math.ceil((limit.window * 1000 - timeElapsed) / 1000);
          
          console.log(`🚫 Rate limit exceeded for IP ${clientIP} on ${path} (${endpointType})`);
          
          return {
            allowed: false,
            retryAfter,
            limit: limit.requests,
            remaining: 0
          };
        }
      } else {
        // 时间窗口已过，重置计数
        requestCount = 0;
        windowStart = now;
      }
    }
    
    // 增加计数
    requestCount++;
    
    // 保存到KV（设置过期时间为窗口大小）
    await env.RATE_LIMIT_KV.put(
      rateLimitKey,
      JSON.stringify({
        count: requestCount,
        windowStart
      }),
      { expirationTtl: limit.window }
    );
    
    const remaining = Math.max(0, limit.requests - requestCount);
    
    return {
      allowed: true,
      limit: limit.requests,
      remaining,
      reset: windowStart + (limit.window * 1000)
    };
    
  } catch (error) {
    console.error('Rate limit check error:', error);
    // 如果限流检查失败，允许请求通过（优雅降级）
    return { allowed: true };
  }
}

/**
 * Rate Limit响应
 * @param {Object} rateLimitResult
 * @returns {Response}
 */
export function rateLimitResponse(rateLimitResult) {
  const headers = {
    'Content-Type': 'application/json;charset=UTF-8',
    'Retry-After': rateLimitResult.retryAfter.toString(),
    'X-RateLimit-Limit': rateLimitResult.limit.toString(),
    'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
  };
  
  return new Response(JSON.stringify({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: `请求过于频繁，请在 ${rateLimitResult.retryAfter} 秒后重试`,
      retryAfter: rateLimitResult.retryAfter
    }
  }), {
    status: 429,
    headers
  });
}

/**
 * 添加Rate Limit Headers到响应
 * @param {Response} response
 * @param {Object} rateLimitResult
 * @returns {Response}
 */
export function addRateLimitHeaders(response, rateLimitResult) {
  if (!rateLimitResult.limit) return response;
  
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
  newResponse.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  
  if (rateLimitResult.reset) {
    newResponse.headers.set('X-RateLimit-Reset', Math.floor(rateLimitResult.reset / 1000).toString());
  }
  
  return newResponse;
}

