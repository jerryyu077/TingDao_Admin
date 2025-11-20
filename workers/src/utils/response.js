/**
 * API响应工具函数
 */

// 成功响应
export function success(data, meta = {}) {
  return new Response(JSON.stringify({
    success: true,
    data,
    ...meta
  }), {
    status: 200,
    headers: corsHeaders()
  });
}

// 分页响应
export function paginated(data, pagination) {
  return new Response(JSON.stringify({
    success: true,
    data,
    pagination
  }), {
    status: 200,
    headers: corsHeaders()
  });
}

// 错误响应
export function error(message, code = 'SERVER_ERROR', statusCode = 500) {
  return new Response(JSON.stringify({
    success: false,
    error: {
      code,
      message
    }
  }), {
    status: statusCode,
    headers: corsHeaders()
  });
}

// 404响应
export function notFound(message = '资源不存在') {
  return error(message, 'NOT_FOUND', 404);
}

// 400响应
export function badRequest(message = '请求参数错误') {
  return error(message, 'BAD_REQUEST', 400);
}

// CORS Headers
export function corsHeaders(origin) {
  // 允许的域名列表
  const allowedOrigins = [
    'https://tingdao.app',
    'https://admin.tingdao.app',
    'https://1a11308b.tingdao-admin-1.pages.dev',
    'http://localhost:3000',
    'http://localhost:8787',
    'http://127.0.0.1:3000'
  ];
  
  // 检查origin是否在允许列表中，如果不在或未提供，则允许所有（*）
  let allowOrigin = '*';
  if (origin && allowedOrigins.includes(origin)) {
    allowOrigin = origin;
  }
  
  return {
    'Content-Type': 'application/json;charset=UTF-8',
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  };
}

// 处理OPTIONS请求
export function handleOptions(origin) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin)
  });
}

