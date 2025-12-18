/**
 * 缓存中间件 - 优化版
 * 集成CDN缓存和边缘计算
 */

// 缓存配置
const CACHE_CONFIG = {
  // 静态内容（长时间缓存）
  static: {
    ttl: 86400,      // 24小时
    swr: 43200       // Stale-While-Revalidate 12小时
  },
  // 动态内容（短时间缓存）
  dynamic: {
    ttl: 300,        // 5分钟
    swr: 60          // 1分钟
  },
  // 用户特定内容（不缓存）
  private: {
    ttl: 0,
    swr: 0
  }
};

/**
 * 确定缓存策略
 * @param {string} pathname
 * @returns {string} 'static' | 'dynamic' | 'private'
 */
function getCacheStrategy(pathname) {
  // 用户特定数据（不缓存）
  if (pathname.includes('/favorites') ||
      pathname.includes('/history') ||
      pathname.includes('/auth/me') ||
      pathname.includes('/submissions')) {
    return 'private';
  }
  
  // 配置和静态数据（长时间缓存）
  if (pathname.includes('/curation/') ||
      pathname.includes('/launch-screen') ||
      pathname.includes('/home/config')) {
    return 'static';
  }
  
  // 其他内容（短时间缓存）
  return 'dynamic';
}

/**
 * 处理带缓存的请求（增强版）
 * @param {Request} request 
 * @param {Function} handler 处理函数
 * @param {Object} ctx 执行上下文
 * @param {number} ttl 自定义缓存时间（秒），可选
 * @returns {Promise<Response>}
 */
export async function withCache(request, handler, ctx, ttl = null) {
  const method = request.method;
  
  // 只缓存 GET 请求
  if (method !== 'GET') {
    return await handler();
  }
  
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // 确定缓存策略
  const strategy = getCacheStrategy(pathname);
  const config = CACHE_CONFIG[strategy];
  
  // 如果是private，不缓存
  if (strategy === 'private') {
    const response = await handler();
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return newResponse;
  }
  
  // 使用自定义TTL或配置的TTL
  const cacheTtl = ttl !== null ? ttl : config.ttl;
  
  const cache = caches.default;
  
  // 1. 尝试从缓存获取
  let response = await cache.match(request);
  
  if (response) {
    console.log(`✅ 缓存命中 [${strategy}]:`, pathname);
    
    // 添加缓存命中标识
    const cachedResponse = new Response(response.body, response);
    cachedResponse.headers.set('X-Cache-Status', 'HIT');
    cachedResponse.headers.set('X-Cache-Strategy', strategy);
    
    return cachedResponse;
  }
  
  // 2. 执行实际请求
  response = await handler();
  
  // 3. 如果成功，缓存响应
  if (response.ok) {
    const cacheResponse = response.clone();
    const headers = new Headers(cacheResponse.headers);
    
    // 设置缓存头
    if (config.swr > 0) {
      // 使用 stale-while-revalidate 策略
      headers.set('Cache-Control', `public, max-age=${cacheTtl}, stale-while-revalidate=${config.swr}`);
    } else {
      headers.set('Cache-Control', `public, max-age=${cacheTtl}`);
    }
    
    // 添加CDN缓存头
    headers.set('CDN-Cache-Control', `public, max-age=${cacheTtl}`);
    headers.set('X-Cache-Status', 'MISS');
    headers.set('X-Cache-Strategy', strategy);
    
    const cachedResponse = new Response(cacheResponse.body, {
      status: cacheResponse.status,
      statusText: cacheResponse.statusText,
      headers: headers
    });
    
    // 异步写入缓存，不阻塞响应
    ctx.waitUntil(cache.put(request, cachedResponse));
    
    console.log(`💾 已缓存响应 [${strategy}]:`, pathname, `TTL: ${cacheTtl}s, SWR: ${config.swr}s`);
  }
  
  return response;
}

/**
 * 清除指定路径的缓存
 * @param {string} urlPattern URL 模式
 */
export async function clearCache(urlPattern) {
  const cache = caches.default;
  const keys = await cache.keys();
  
  let cleared = 0;
  for (const request of keys) {
    if (request.url.includes(urlPattern)) {
      await cache.delete(request);
      cleared++;
    }
  }
  
  console.log(`🗑️ 清除缓存: ${urlPattern}, 共 ${cleared} 条`);
  return cleared;
}



