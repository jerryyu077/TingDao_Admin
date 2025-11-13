// 听道管理后台 - API 客户端
// 版本: v1.0
// 最后更新: 2025年11月4日

/**
 * API 客户端类
 * 处理所有与后端的 HTTP 通信
 */
class APIClient {
    constructor() {
        this.baseURL = APIConfig.baseURL + APIConfig.apiVersion;
        this.timeout = APIConfig.timeout;
        this.debug = APIConfig.debug;
    }
    
    // ==================== 核心请求方法 ====================
    
    /**
     * 通用请求方法
     * @param {string} endpoint - API 端点
     * @param {object} options - 请求选项
     * @returns {Promise} - 响应数据
     */
    async request(endpoint, options = {}) {
        const {
            method = 'GET',
            body = null,
            headers = {},
            params = null,
            requireAuth = true
        } = options;
        
        // 构建完整 URL
        let url = this.baseURL + endpoint;
        
        // 添加查询参数
        if (params) {
            const queryString = new URLSearchParams(params).toString();
            url += `?${queryString}`;
        }
        
        // 构建请求头
        const requestHeaders = {
            'Content-Type': 'application/json',
            ...headers
        };
        
        // 添加认证令牌
        if (requireAuth) {
            const token = this.getAuthToken();
            if (token) {
                requestHeaders['Authorization'] = `Bearer ${token}`;
            }
        }
        
        // 构建请求配置
        const requestConfig = {
            method,
            headers: requestHeaders
        };
        
        // 添加请求体
        if (body && method !== 'GET') {
            requestConfig.body = JSON.stringify(body);
        }
        
        // 调试日志
        if (this.debug) {
            console.log(`[API] ${method} ${url}`, body || '');
        }
        
        try {
            // 发送请求（带超时）
            const response = await this.fetchWithTimeout(url, requestConfig, this.timeout);
            
            // 处理响应
            return await this.handleResponse(response);
            
        } catch (error) {
            // 处理错误
            throw this.handleError(error);
        }
    }
    
    /**
     * 带超时的 fetch
     */
    async fetchWithTimeout(url, options, timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    
    /**
     * 处理响应
     */
    async handleResponse(response) {
        // 如果是 204 No Content
        if (response.status === HTTPStatus.NO_CONTENT) {
            return { success: true };
        }
        
        // 解析 JSON
        const data = await response.json();
        
        // 检查 HTTP 状态码
        if (!response.ok) {
            throw {
                status: response.status,
                code: data.error?.code || APIErrorCode.UNKNOWN_ERROR,
                message: data.error?.message || '请求失败',
                details: data.error?.details || null
            };
        }
        
        // 调试日志
        if (this.debug) {
            console.log('[API] Response:', data);
        }
        
        // 返回数据（支持包装和非包装格式）
        if (data.success !== undefined) {
            return data; // 包装格式: { success, data, ... }
        } else {
            return { success: true, data }; // 非包装格式
        }
    }
    
    /**
     * 处理错误
     */
    handleError(error) {
        if (this.debug) {
            console.error('[API] Error:', error);
        }
        
        // 网络错误
        if (error.name === 'AbortError') {
            return {
                code: APIErrorCode.TIMEOUT,
                message: '请求超时，请检查网络连接',
                originalError: error
            };
        }
        
        if (error instanceof TypeError) {
            return {
                code: APIErrorCode.NETWORK_ERROR,
                message: '网络错误，请检查您的网络连接',
                originalError: error
            };
        }
        
        // API 错误（已格式化）
        if (error.code) {
            return error;
        }
        
        // 未知错误
        return {
            code: APIErrorCode.UNKNOWN_ERROR,
            message: error.message || '未知错误',
            originalError: error
        };
    }
    
    // ==================== 快捷方法 ====================
    
    async get(endpoint, params = null, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET', params });
    }
    
    async post(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body });
    }
    
    async put(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body });
    }
    
    async patch(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PATCH', body });
    }
    
    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
    
    // ==================== 认证相关 ====================
    
    /**
     * 获取认证令牌
     */
    getAuthToken() {
        return localStorage.getItem(APIConfig.auth.tokenKey);
    }
    
    /**
     * 设置认证令牌
     */
    setAuthToken(token) {
        localStorage.setItem(APIConfig.auth.tokenKey, token);
    }
    
    /**
     * 移除认证令牌
     */
    removeAuthToken() {
        localStorage.removeItem(APIConfig.auth.tokenKey);
        localStorage.removeItem(APIConfig.auth.refreshTokenKey);
        localStorage.removeItem(APIConfig.auth.userKey);
    }
    
    /**
     * 获取当前用户信息
     */
    getCurrentUser() {
        const userStr = localStorage.getItem(APIConfig.auth.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }
    
    /**
     * 设置当前用户信息
     */
    setCurrentUser(user) {
        localStorage.setItem(APIConfig.auth.userKey, JSON.stringify(user));
    }
    
    /**
     * 检查是否已认证
     */
    isAuthenticated() {
        return !!this.getAuthToken();
    }
    
    // ==================== 文件上传 ====================
    
    /**
     * 上传文件
     * @param {string} endpoint - 上传端点
     * @param {File} file - 文件对象
     * @param {function} onProgress - 进度回调
     */
    async uploadFile(endpoint, file, onProgress = null) {
        const url = this.baseURL + endpoint;
        
        const formData = new FormData();
        formData.append('file', file);
        
        const headers = {};
        const token = this.getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            // 进度监听
            if (onProgress) {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100;
                        onProgress(percentComplete, e.loaded, e.total);
                    }
                });
            }
            
            // 完成监听
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (error) {
                        reject({ code: APIErrorCode.UNKNOWN_ERROR, message: '响应解析失败' });
                    }
                } else {
                    try {
                        const error = JSON.parse(xhr.responseText);
                        reject(error);
                    } catch {
                        reject({ code: APIErrorCode.SERVER_ERROR, message: '上传失败' });
                    }
                }
            });
            
            // 错误监听
            xhr.addEventListener('error', () => {
                reject({ code: APIErrorCode.NETWORK_ERROR, message: '网络错误' });
            });
            
            // 超时监听
            xhr.addEventListener('timeout', () => {
                reject({ code: APIErrorCode.TIMEOUT, message: '上传超时' });
            });
            
            // 发送请求
            xhr.open('POST', url);
            Object.keys(headers).forEach(key => {
                xhr.setRequestHeader(key, headers[key]);
            });
            xhr.timeout = this.timeout;
            xhr.send(formData);
        });
    }
    
    // ==================== 辅助方法 ====================
    
    /**
     * 构建查询参数
     */
    buildQueryParams(params) {
        const filtered = Object.entries(params)
            .filter(([_, value]) => value !== null && value !== undefined && value !== '')
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        
        return filtered;
    }
    
    /**
     * 显示错误消息（使用 DaisyUI alert）
     */
    showError(error, duration = 5000) {
        const message = error.message || '操作失败';
        
        // 创建 alert 元素
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-error shadow-lg fixed top-4 right-4 w-96 z-50';
        alertDiv.innerHTML = `
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(alertDiv);
        
        // 自动移除
        setTimeout(() => {
            alertDiv.remove();
        }, duration);
    }
    
    /**
     * 显示成功消息
     */
    showSuccess(message, duration = 3000) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success shadow-lg fixed top-4 right-4 w-96 z-50';
        alertDiv.innerHTML = `
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, duration);
    }
}

// 创建全局实例
const api = new APIClient();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, api };
}

