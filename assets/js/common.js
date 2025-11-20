// 听道管理后台 - 共用函数

// 全局命名空间
window.TingdaoAdmin = window.TingdaoAdmin || {};

// API基础URL - 从 api-config.js 导入
// 如果 APIConfig 未定义，使用默认值
const API_BASE_URL = (typeof APIConfig !== 'undefined' && APIConfig.baseURL) 
    ? `${APIConfig.baseURL}${APIConfig.apiVersion}` 
    : 'https://tingdao-api.living-water-tingdaoapp.workers.dev/api/v1';

// 获取认证令牌
function getAuthToken() {
    return localStorage.getItem('admin_token');
}

// 检查认证状态
function checkAuth() {
    // 临时禁用登录检查 - 使用 Cloudflare Zero Trust 保护
    // TODO: 如需重新启用登录，取消下面注释
    /*
    if (!getAuthToken()) {
        alert('请先登录');
        window.location.href = 'login.html';
        return false;
    }
    */
    return true; // 始终返回 true，允许访问
}

// 通用API请求函数
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 401) {
            alert('登录已过期，请重新登录');
            localStorage.removeItem('admin_token');
            window.location.href = 'login.html';
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API请求失败:', error);
        showNotification('网络请求失败，请稍后重试', 'error');
        return null;
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} fixed top-4 right-4 w-96 z-50 shadow-lg transition-smooth`;
    
    const icons = {
        info: 'heroicons:information-circle',
        success: 'heroicons:check-circle',
        warning: 'heroicons:exclamation-triangle',
        error: 'heroicons:x-circle'
    };
    
    notification.innerHTML = `
        <div class="flex items-center gap-2">
            <span class="iconify" data-icon="${icons[type]}" data-width="20"></span>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 150);
    }, 3000);
}

// 确认对话框
function confirmDialog(message) {
    return confirm(message);
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 格式化时间
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 格式化时长（秒转为 HH:MM:SS）
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 防抖函数
function debounce(func, wait) {
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

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 导出到全局
window.TingdaoAdmin = {
    apiRequest,
    checkAuth,
    getAuthToken,
    showNotification,
    confirmDialog,
    formatDate,
    formatDateTime,
    formatDuration,
    formatFileSize,
    debounce,
    throttle
};

console.log('🚀 听道管理后台已加载');

