// 听道管理后台 - API 配置
// 版本: v1.0
// 最后更新: 2025年11月4日

/**
 * API 配置
 */
const APIConfig = {
    // 基础 URL - Cloudflare Workers API
    baseURL: 'https://tingdao-api.living-water-tingdaoapp.workers.dev/api/v1',
    
    // 本地开发备用URL（取消注释以使用本地服务器）
    // baseURL: 'http://localhost:3000/v1',
    
    // API 安全认证
    apiKey: 'admin_panel_v1_2025',
    clientType: 'admin_panel',
    
    // 超时时间（毫秒）
    timeout: 30000,
    
    // 默认分页大小
    defaultPageSize: 20,
    
    // 是否启用调试日志
    debug: true,
    
    // API 版本（已包含在baseURL中）
    apiVersion: '', // 留空，因为版本已在baseURL中
    
    // 认证相关
    auth: {
        tokenKey: 'admin_token',
        refreshTokenKey: 'admin_refresh_token',
        userKey: 'admin_user'
    },
    
    // 上传配置
    upload: {
        maxFileSize: 100 * 1024 * 1024, // 100MB
        allowedAudioFormats: ['.mp3', '.m4a', '.wav'],
        allowedImageFormats: ['.jpg', '.jpeg', '.png', '.webp'],
        chunkSize: 5 * 1024 * 1024, // 5MB chunks for large files
        cdnBaseURL: 'https://media.tingdao.app' // R2 CDN URL
    }
};

/**
 * API 端点定义
 */
const APIEndpoints = {
    // ==================== 认证 ====================
    auth: {
        login: '/auth/login',
        logout: '/auth/logout',
        refresh: '/auth/refresh',
        me: '/auth/me'
    },
    
    // ==================== 讲道管理 ====================
    sermons: {
        list: '/sermons',                          // GET - 列表
        create: '/sermons',                        // POST - 创建
        get: (id) => `/sermons/${id}`,            // GET - 详情
        update: (id) => `/sermons/${id}`,         // PUT - 更新
        delete: (id) => `/sermons/${id}`,         // DELETE - 删除
        updateStatus: (id) => `/sermons/${id}/status`, // PATCH - 更新状态
        search: '/sermons/search',                 // GET - 搜索
        recommended: '/sermons/recommended',       // GET - 推荐
        latest: '/sermons/latest',                 // GET - 最新
        popular: '/sermons/popular',               // GET - 最受欢迎
        stats: '/sermons/stats'                    // GET - 统计数据
    },
    
    // ==================== 讲员管理 ====================
    speakers: {
        list: '/speakers',                         // GET - 列表
        create: '/speakers',                       // POST - 创建
        get: (id) => `/speakers/${id}`,           // GET - 详情
        update: (id) => `/speakers/${id}`,        // PUT - 更新
        delete: (id) => `/speakers/${id}`,        // DELETE - 删除
        sermons: (id) => `/speakers/${id}/sermons`, // GET - 讲员的讲道
        stats: (id) => `/speakers/${id}/stats`,   // GET - 讲员统计
        popular: '/speakers/popular'               // GET - 热门讲员
    },
    
    // ==================== 用户管理 ====================
    users: {
        list: '/users',                            // GET - 列表
        create: '/users',                          // POST - 创建
        get: (id) => `/users/${id}`,              // GET - 详情
        update: (id) => `/users/${id}`,           // PUT - 更新
        delete: (id) => `/users/${id}`,           // DELETE - 删除
        sermons: (id) => `/users/${id}/sermons`,  // GET - 用户上传的讲道
        stats: '/users/stats'                      // GET - 用户统计
    },
    
    // ==================== 标签管理 ====================
    tags: {
        list: '/tags',                             // GET - 列表
        create: '/tags',                           // POST - 创建
        get: (id) => `/tags/${id}`,               // GET - 详情
        update: (id) => `/tags/${id}`,            // PUT - 更新
        delete: (id) => `/tags/${id}`,            // DELETE - 删除
        sermons: (id) => `/tags/${id}/sermons`,   // GET - 标签的讲道
        featured: '/tags/featured'                 // GET - 精选标签
    },
    
    // ==================== 主题管理 ====================
    topics: {
        list: '/topics',                           // GET - 列表
        create: '/topics',                         // POST - 创建
        get: (id) => `/topics/${id}`,             // GET - 详情
        update: (id) => `/topics/${id}`,          // PUT - 更新
        delete: (id) => `/topics/${id}`,          // DELETE - 删除
        sermons: (id) => `/topics/${id}/sermons`, // GET - 主题的讲道
        addSermon: (id) => `/topics/${id}/sermons`, // POST - 添加讲道到主题
        removeSermon: (id, sermonId) => `/topics/${id}/sermons/${sermonId}`, // DELETE - 移除讲道
        featured: '/topics/featured',              // GET - 精选主题
        latest: '/topics/latest'                   // GET - 最新主题
    },
    
    // ==================== 文件上传 ====================
    upload: {
        audio: '/upload/audio',                    // POST - 上传音频
        image: '/upload/image',                    // POST - 上传图片
        avatar: '/upload/avatar',                  // POST - 上传头像
        cover: '/upload/cover'                     // POST - 上传封面
    },
    
    // ==================== 仪表盘统计 ====================
    dashboard: {
        stats: '/stats/overview',                  // GET - 总体统计
        recentActivity: '/dashboard/activity',     // GET - 最近活动
        charts: '/dashboard/charts'                // GET - 图表数据
    },
    
    // ==================== 内容编排 ====================
    curation: {
        home: '/curation/home',                    // GET/PUT - 首页配置
        discover: '/curation/discover',            // GET/PUT - 发现页配置
        scriptures: '/curation/scriptures',        // GET/PUT - 每日经文
        featured: '/curation/featured'             // GET/PUT - 精选内容
    },
    
    // ==================== 系统设置 ====================
    settings: {
        get: '/settings',                          // GET - 获取设置
        update: '/settings',                       // PUT - 更新设置
        admins: '/settings/admins',                // GET/POST - 管理员列表
        permissions: '/settings/permissions',      // GET/PUT - 权限配置
        apiConfig: '/settings/api'                 // GET/PUT - API配置
    },
    
    // ==================== 日志 ====================
    logs: {
        list: '/logs',                             // GET - 日志列表
        activity: '/logs/activity',                // GET - 活动日志
        errors: '/logs/errors'                     // GET - 错误日志
    }
};

/**
 * HTTP 状态码
 */
const HTTPStatus = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
};

/**
 * API 错误码
 */
const APIErrorCode = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIConfig, APIEndpoints, HTTPStatus, APIErrorCode };
}

