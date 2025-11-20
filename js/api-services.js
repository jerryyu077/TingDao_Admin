// 听道管理后台 - API 服务层
// 版本: v1.0
// 最后更新: 2025年11月4日

/**
 * API 服务 - 提供各模块的具体 API 调用方法
 */

// ==================== 认证服务 ====================
const AuthService = {
    /**
     * 登录
     */
    async login(email, password) {
        const response = await api.post(APIEndpoints.auth.login, {
            email,
            password
        }, { requireAuth: false });
        
        if (response.success && response.data.token) {
            api.setAuthToken(response.data.token);
            if (response.data.user) {
                api.setCurrentUser(response.data.user);
            }
        }
        
        return response;
    },
    
    /**
     * 登出
     */
    async logout() {
        try {
            await api.post(APIEndpoints.auth.logout);
        } finally {
            api.removeAuthToken();
            window.location.href = 'login.html';
        }
    },
    
    /**
     * 获取当前用户信息
     */
    async getCurrentUser() {
        return await api.get(APIEndpoints.auth.me);
    },
    
    /**
     * 检查认证状态（临时禁用 - 使用 Cloudflare Zero Trust 保护）
     */
    checkAuth() {
        // TODO: 如需重新启用认证，取消下面注释
        /*
        if (!api.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        */
        return true; // 始终返回 true，允许访问
    }
};

// ==================== 讲道服务 ====================
const SermonService = {
    /**
     * 获取讲道列表
     */
    async getSermons(params = {}) {
        const queryParams = api.buildQueryParams({
            page: params.page || 1,
            limit: params.limit || APIConfig.defaultPageSize,
            status: params.status,
            speaker_id: params.speaker_id,
            tag: params.tag,
            search: params.search,
            sort: params.sort || '-created_at'
        });
        
        return await api.get(APIEndpoints.sermons.list, queryParams);
    },
    
    /**
     * 获取单个讲道
     */
    async getSermon(id) {
        return await api.get(APIEndpoints.sermons.get(id));
    },
    
    /**
     * 创建讲道
     */
    async createSermon(data) {
        return await api.post(APIEndpoints.sermons.create, data);
    },
    
    /**
     * 更新讲道
     */
    async updateSermon(id, data) {
        return await api.put(APIEndpoints.sermons.update(id), data);
    },
    
    /**
     * 删除讲道
     */
    async deleteSermon(id) {
        return await api.delete(APIEndpoints.sermons.delete(id));
    },
    
    /**
     * 更新讲道状态
     */
    async updateStatus(id, status) {
        return await api.patch(APIEndpoints.sermons.updateStatus(id), { status });
    },
    
    /**
     * 搜索讲道
     */
    async searchSermons(query, params = {}) {
        const queryParams = api.buildQueryParams({
            q: query,
            page: params.page || 1,
            limit: params.limit || APIConfig.defaultPageSize
        });
        
        return await api.get(APIEndpoints.sermons.search, queryParams);
    },
    
    /**
     * 获取推荐讲道
     */
    async getRecommendedSermons(limit = 10) {
        return await api.get(APIEndpoints.sermons.recommended, { limit });
    },
    
    /**
     * 获取最新讲道
     */
    async getLatestSermons(limit = 10) {
        return await api.get(APIEndpoints.sermons.latest, { limit });
    },
    
    /**
     * 获取最受欢迎讲道
     */
    async getPopularSermons(limit = 10) {
        return await api.get(APIEndpoints.sermons.popular, { limit });
    },
    
    /**
     * 获取讲道统计
     */
    async getStats() {
        return await api.get(APIEndpoints.sermons.stats);
    }
};

// ==================== 讲员服务 ====================
const SpeakerService = {
    /**
     * 获取讲员列表
     */
    async getSpeakers(params = {}) {
        const queryParams = api.buildQueryParams({
            page: params.page || 1,
            limit: params.limit || APIConfig.defaultPageSize,
            status: params.status,
            search: params.search,
            sort: params.sort || 'name'
        });
        
        return await api.get(APIEndpoints.speakers.list, queryParams);
    },
    
    /**
     * 获取单个讲员
     */
    async getSpeaker(id) {
        return await api.get(APIEndpoints.speakers.get(id));
    },
    
    /**
     * 创建讲员
     */
    async createSpeaker(data) {
        return await api.post(APIEndpoints.speakers.create, data);
    },
    
    /**
     * 更新讲员
     */
    async updateSpeaker(id, data) {
        return await api.put(APIEndpoints.speakers.update(id), data);
    },
    
    /**
     * 删除讲员
     */
    async deleteSpeaker(id) {
        return await api.delete(APIEndpoints.speakers.delete(id));
    },
    
    /**
     * 获取讲员的讲道列表
     */
    async getSpeakerSermons(speakerId, params = {}) {
        const queryParams = api.buildQueryParams({
            page: params.page || 1,
            limit: params.limit || APIConfig.defaultPageSize
        });
        
        return await api.get(APIEndpoints.speakers.sermons(speakerId), queryParams);
    },
    
    /**
     * 获取热门讲员
     */
    async getPopularSpeakers(limit = 10) {
        return await api.get(APIEndpoints.speakers.popular, { limit });
    },
    
    /**
     * 搜索讲员
     */
    async searchSpeakers(query) {
        return await api.get(APIEndpoints.speakers.list, { search: query });
    }
};

// ==================== 用户服务 ====================
const UserService = {
    /**
     * 获取用户列表
     */
    async getUsers(params = {}) {
        const queryParams = api.buildQueryParams({
            page: params.page || 1,
            limit: params.limit || APIConfig.defaultPageSize,
            status: params.status,
            search: params.search,
            sort: params.sort || '-created_at'
        });
        
        return await api.get(APIEndpoints.users.list, queryParams);
    },
    
    /**
     * 获取单个用户
     */
    async getUser(id) {
        return await api.get(APIEndpoints.users.get(id));
    },
    
    /**
     * 创建用户
     */
    async createUser(data) {
        return await api.post(APIEndpoints.users.create, data);
    },
    
    /**
     * 更新用户
     */
    async updateUser(id, data) {
        return await api.put(APIEndpoints.users.update(id), data);
    },
    
    /**
     * 删除用户
     */
    async deleteUser(id) {
        return await api.delete(APIEndpoints.users.delete(id));
    },
    
    /**
     * 获取用户上传的讲道
     */
    async getUserSermons(userId, params = {}) {
        const queryParams = api.buildQueryParams({
            page: params.page || 1,
            limit: params.limit || APIConfig.defaultPageSize
        });
        
        return await api.get(APIEndpoints.users.sermons(userId), queryParams);
    },
    
    /**
     * 获取用户统计
     */
    async getStats() {
        return await api.get(APIEndpoints.users.stats);
    },
    
    /**
     * 搜索用户
     */
    async searchUsers(query) {
        return await api.get(APIEndpoints.users.list, { search: query });
    }
};

// ==================== 标签服务 ====================
const TagService = {
    /**
     * 获取标签列表
     */
    async getTags(params = {}) {
        const queryParams = api.buildQueryParams({
            page: params.page || 1,
            limit: params.limit || APIConfig.defaultPageSize,
            category: params.category,
            search: params.search
        });
        
        return await api.get(APIEndpoints.tags.list, queryParams);
    },
    
    /**
     * 获取单个标签
     */
    async getTag(id) {
        return await api.get(APIEndpoints.tags.get(id));
    },
    
    /**
     * 创建标签
     */
    async createTag(data) {
        return await api.post(APIEndpoints.tags.create, data);
    },
    
    /**
     * 更新标签
     */
    async updateTag(id, data) {
        return await api.put(APIEndpoints.tags.update(id), data);
    },
    
    /**
     * 删除标签
     */
    async deleteTag(id) {
        return await api.delete(APIEndpoints.tags.delete(id));
    },
    
    /**
     * 获取精选标签
     */
    async getFeaturedTags() {
        return await api.get(APIEndpoints.tags.featured);
    }
};

// ==================== 主题服务 ====================
const TopicService = {
    /**
     * 获取主题列表
     */
    async getTopics(params = {}) {
        const queryParams = api.buildQueryParams({
            page: params.page || 1,
            limit: params.limit || APIConfig.defaultPageSize,
            status: params.status,
            search: params.search,
            sort: params.sort || '-created_at'
        });
        
        return await api.get(APIEndpoints.topics.list, queryParams);
    },
    
    /**
     * 获取单个主题
     */
    async getTopic(id) {
        return await api.get(APIEndpoints.topics.get(id));
    },
    
    /**
     * 创建主题
     */
    async createTopic(data) {
        return await api.post(APIEndpoints.topics.create, data);
    },
    
    /**
     * 更新主题
     */
    async updateTopic(id, data) {
        return await api.put(APIEndpoints.topics.update(id), data);
    },
    
    /**
     * 删除主题
     */
    async deleteTopic(id) {
        return await api.delete(APIEndpoints.topics.delete(id));
    },
    
    /**
     * 获取主题的讲道列表
     */
    async getTopicSermons(topicId, params = {}) {
        const queryParams = api.buildQueryParams({
            page: params.page || 1,
            limit: params.limit || APIConfig.defaultPageSize
        });
        
        return await api.get(APIEndpoints.topics.sermons(topicId), queryParams);
    },
    
    /**
     * 添加讲道到主题
     */
    async addSermonToTopic(topicId, sermonId) {
        return await api.post(APIEndpoints.topics.addSermon(topicId), {
            sermon_id: sermonId
        });
    },
    
    /**
     * 从主题移除讲道
     */
    async removeSermonFromTopic(topicId, sermonId) {
        return await api.delete(APIEndpoints.topics.removeSermon(topicId, sermonId));
    },
    
    /**
     * 获取精选主题
     */
    async getFeaturedTopics(limit = 10) {
        return await api.get(APIEndpoints.topics.featured, { limit });
    },
    
    /**
     * 获取最新主题
     */
    async getLatestTopics(limit = 10) {
        return await api.get(APIEndpoints.topics.latest, { limit });
    }
};

// ==================== 文件上传服务 ====================
const UploadService = {
    /**
     * 上传音频
     */
    async uploadAudio(file, onProgress) {
        return await api.uploadFile(APIEndpoints.upload.audio, file, onProgress);
    },
    
    /**
     * 上传图片
     */
    async uploadImage(file, onProgress) {
        return await api.uploadFile(APIEndpoints.upload.image, file, onProgress);
    },
    
    /**
     * 上传头像
     */
    async uploadAvatar(file, onProgress) {
        return await api.uploadFile(APIEndpoints.upload.avatar, file, onProgress);
    },
    
    /**
     * 上传封面
     */
    async uploadCover(file, onProgress) {
        return await api.uploadFile(APIEndpoints.upload.cover, file, onProgress);
    },
    
    /**
     * 验证文件
     */
    validateFile(file, type = 'image') {
        const config = APIConfig.upload;
        
        // 检查文件大小
        if (file.size > config.maxFileSize) {
            throw new Error(`文件大小不能超过 ${config.maxFileSize / 1024 / 1024}MB`);
        }
        
        // 检查文件类型
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        const allowedFormats = type === 'audio' 
            ? config.allowedAudioFormats 
            : config.allowedImageFormats;
        
        if (!allowedFormats.includes(ext)) {
            throw new Error(`不支持的文件格式: ${ext}`);
        }
        
        return true;
    }
};

// ==================== 仪表盘服务 ====================
const DashboardService = {
    /**
     * 获取统计数据
     */
    async getStats() {
        return await api.get(APIEndpoints.dashboard.stats);
    },
    
    /**
     * 获取最近活动
     */
    async getRecentActivity(limit = 10) {
        return await api.get(APIEndpoints.dashboard.recentActivity, { limit });
    },
    
    /**
     * 获取图表数据
     */
    async getCharts(period = '7d') {
        return await api.get(APIEndpoints.dashboard.charts, { period });
    }
};

// ==================== 内容编排服务 ====================
const CurationService = {
    /**
     * 获取首页配置
     */
    async getHomeConfig() {
        return await api.get(APIEndpoints.curation.home);
    },
    
    /**
     * 更新首页配置
     */
    async updateHomeConfig(config) {
        return await api.put(APIEndpoints.curation.home, config);
    },
    
    /**
     * 获取发现页配置
     */
    async getDiscoverConfig() {
        return await api.get(APIEndpoints.curation.discover);
    },
    
    /**
     * 更新发现页配置
     */
    async updateDiscoverConfig(config) {
        return await api.put(APIEndpoints.curation.discover, config);
    },
    
    /**
     * 获取每日经文
     */
    async getScriptures() {
        return await api.get(APIEndpoints.curation.scriptures);
    },
    
    /**
     * 更新每日经文
     */
    async updateScriptures(scriptures) {
        return await api.put(APIEndpoints.curation.scriptures, { scriptures });
    },
    
    /**
     * 获取精选内容
     */
    async getFeaturedContent() {
        return await api.get(APIEndpoints.curation.featured);
    },
    
    /**
     * 更新精选内容
     */
    async updateFeaturedContent(content) {
        return await api.put(APIEndpoints.curation.featured, content);
    }
};

// ==================== 辅助函数 ====================

/**
 * 格式化日期
 */
function formatDate(dateString, format = 'YYYY-MM-DD HH:mm') {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

/**
 * 格式化时长（秒 -> 时:分:秒）
 */
function formatDuration(seconds) {
    if (!seconds || seconds < 0) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    } else {
        return `${minutes}:${String(secs).padStart(2, '0')}`;
    }
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 获取状态徽章HTML
 */
function getStatusBadge(status) {
    const badges = {
        'published': '<span class="badge badge-success">已发布</span>',
        'draft': '<span class="badge badge-warning">草稿</span>',
        'reviewing': '<span class="badge badge-info">审核中</span>',
        'rejected': '<span class="badge badge-error">已拒绝</span>',
        'archived': '<span class="badge badge-ghost">已归档</span>',
        'active': '<span class="badge badge-success">活跃</span>',
        'inactive': '<span class="badge badge-ghost">停用</span>',
        'pending': '<span class="badge badge-warning">待审核</span>'
    };
    
    return badges[status] || `<span class="badge">${status}</span>`;
}

/**
 * 防抖函数
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 确认对话框
 */
function confirmAction(message, onConfirm) {
    if (confirm(message)) {
        onConfirm();
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AuthService,
        SermonService,
        SpeakerService,
        UserService,
        TagService,
        TopicService,
        UploadService,
        DashboardService,
        CurationService,
        formatDate,
        formatDuration,
        formatFileSize,
        getStatusBadge,
        debounce,
        confirmAction
    };
}

