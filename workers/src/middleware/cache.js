/**
 * 缓存中间件
 */

/**
 * 处理带缓存的请求
 * @param {Request} request 
 * @param {Function} handler 处理函数
 * @param {Object} ctx 执行上下文
 * @param {number} ttl 缓存时间（秒），默认300秒（5分钟）
 * @returns {Promise<Response>}
 */
export async function withCache(request, handler, ctx, ttl = 300) {
  const method = request.method;
  
  // 只缓存 GET 请求
  if (method !== 'GET') {
    return await handler();
  }
  
  const cache = caches.default;
  
  // 1. 尝试从缓存获取
  let response = await cache.match(request);
  
  if (response) {
    console.log('✅ 缓存命中:', new URL(request.url).pathname);
    return response;
  }
  
  // 2. 执行实际请求
  response = await handler();
  
  // 3. 如果成功，缓存响应
  if (response.ok) {
    const cacheResponse = response.clone();
    const headers = new Headers(cacheResponse.headers);
    headers.set('Cache-Control', `public, max-age=${ttl}`);
    headers.set('X-Cache-Status', 'MISS');
    
    const cachedResponse = new Response(cacheResponse.body, {
      status: cacheResponse.status,
      statusText: cacheResponse.statusText,
      headers: headers
    });
    
    // 异步写入缓存，不阻塞响应
    ctx.waitUntil(cache.put(request, cachedResponse));
    
    console.log('💾 已缓存响应:', new URL(request.url).pathname, `TTL: ${ttl}s`);
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



