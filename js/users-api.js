// 听道管理后台 - 用户管理 API 集成
// 版本: v1.0
// 最后更新: 2025年11月4日

/**
 * 用户列表页 (users.html)
 */
const UsersPage = {
    currentPage: 1,
    pageSize: 20,
    filters: {
        status: '',
        search: ''
    },
    
    async init() {
        AuthService.checkAuth();
        this.setupEventListeners();
        await this.loadUsers();
        await this.loadStats();
    },
    
    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(async (e) => {
                this.filters.search = e.target.value;
                this.currentPage = 1;
                await this.loadUsers();
            }, 500));
        }
        
        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', async (e) => {
                this.filters.status = e.target.value;
                this.currentPage = 1;
                await this.loadUsers();
            });
        }
    },
    
    async loadUsers() {
        try {
            this.showLoading(true);
            
            const response = await UserService.getUsers({
                page: this.currentPage,
                limit: this.pageSize,
                status: this.filters.status,
                search: this.filters.search
            });
            
            if (response.success && response.data) {
                this.renderUsers(response.data);
                if (response.pagination) {
                    this.renderPagination(response.pagination);
                }
            }
        } catch (error) {
            console.error('Failed to load users:', error);
            api.showError(error);
        } finally {
            this.showLoading(false);
        }
    },
    
    async loadStats() {
        try {
            const response = await UserService.getStats();
            if (response.success && response.data) {
                this.updateStats(response.data);
            }
        } catch (error) {
            console.error('Failed to load user stats:', error);
        }
    },
    
    updateStats(stats) {
        const statElements = {
            'totalUsers': stats.total || 0,
            'activeUsers': stats.active || 0,
            'newUsers': stats.new || 0,
            'disabledUsers': stats.disabled || 0
        };
        
        Object.entries(statElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    },
    
    renderUsers(users) {
        const tbody = document.querySelector('#usersTable tbody');
        if (!tbody) return;
        
        if (!users || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-base-content/60">暂无数据</td></tr>';
            return;
        }
        
        tbody.innerHTML = users.map(user => `
            <tr class="hover">
                <td>
                    <a href="user-detail.html?id=${user.id}" class="link link-hover text-primary">
                        ${user.id}
                    </a>
                </td>
                <td>
                    <div class="flex items-center gap-3">
                        <div class="avatar">
                            <div class="mask mask-squircle w-10 h-10">
                                <img src="${user.avatar_url || 'https://via.placeholder.com/40'}" alt="${user.username}">
                            </div>
                        </div>
                        <span class="font-medium">${user.username}</span>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>${formatDate(user.registered_at || user.created_at, 'YYYY-MM-DD')}</td>
                <td>${formatDate(user.last_login, 'YYYY-MM-DD HH:mm')}</td>
                <td>${user.sermon_count || 0}</td>
                <td>${getStatusBadge(user.status)}</td>
                <td>
                    <div class="flex gap-1">
                        <a href="user-detail.html?id=${user.id}" class="btn btn-ghost btn-xs">
                            <span class="iconify" data-icon="heroicons:eye"></span>
                        </a>
                        <button class="btn btn-ghost btn-xs" onclick="UsersPage.toggleUserStatus('${user.id}', '${user.status}')">
                            <span class="iconify" data-icon="heroicons:${user.status === 'active' ? 'lock-closed' : 'lock-open'}"></span>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    renderPagination(pagination) {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;
        
        const { page, total_pages, total } = pagination;
        paginationContainer.innerHTML = `
            <div class="flex justify-between items-center">
                <div class="text-sm text-base-content/60">共 ${total} 条记录，第 ${page} / ${total_pages} 页</div>
                <div class="join">
                    <button class="join-item btn btn-sm" ${page <= 1 ? 'disabled' : ''} onclick="UsersPage.goToPage(${page - 1})">«</button>
                    <button class="join-item btn btn-sm">第 ${page} 页</button>
                    <button class="join-item btn btn-sm" ${page >= total_pages ? 'disabled' : ''} onclick="UsersPage.goToPage(${page + 1})">»</button>
                </div>
            </div>
        `;
    },
    
    async goToPage(page) {
        this.currentPage = page;
        await this.loadUsers();
    },
    
    showLoading(show) {
        const tbody = document.querySelector('#usersTable tbody');
        if (!tbody) return;
        if (show) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center py-8"><span class="loading loading-spinner loading-lg"></span></td></tr>';
        }
    },
    
    async toggleUserStatus(userId, currentStatus) {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        const action = newStatus === 'active' ? '启用' : '禁用';
        
        if (!confirm(`确定要${action}该用户吗？`)) return;
        
        try {
            const response = await UserService.updateUser(userId, { status: newStatus });
            if (response.success) {
                api.showSuccess(`${action}成功`);
                await this.loadUsers();
            }
        } catch (error) {
            console.error('Failed to update user status:', error);
            api.showError(error);
        }
    }
};

/**
 * 用户详情页 (user-detail.html)
 */
const UserDetailPage = {
    userId: null,
    isEditMode: false,
    
    async init() {
        AuthService.checkAuth();
        
        const params = new URLSearchParams(window.location.search);
        this.userId = params.get('id');
        
        if (!this.userId) {
            alert('用户ID不存在');
            window.location.href = 'users.html';
            return;
        }
        
        await this.loadUser();
        await this.loadUserSermons();
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        const editBtn = document.getElementById('editBtn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.toggleEditMode());
        }
        
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveUser());
        }
        
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelEdit());
        }
    },
    
    async loadUser() {
        try {
            const response = await UserService.getUser(this.userId);
            if (response.success && response.data) {
                this.renderUserDetail(response.data);
            }
        } catch (error) {
            console.error('Failed to load user:', error);
            api.showError(error);
            setTimeout(() => window.location.href = 'users.html', 2000);
        }
    },
    
    async loadUserSermons() {
        try {
            const response = await UserService.getUserSermons(this.userId, { limit: 50 });
            if (response.success && response.data) {
                this.renderSermons(response.data);
            }
        } catch (error) {
            console.error('Failed to load user sermons:', error);
        }
    },
    
    renderUserDetail(user) {
        document.title = `${user.username} - 听道后台管理系统`;
        
        // Update fields
        const fields = {
            'userName': user.username,
            'userEmail': user.email,
            'userStatus': user.status,
            'registeredAt': formatDate(user.registered_at || user.created_at, 'YYYY-MM-DD HH:mm'),
            'lastLogin': formatDate(user.last_login, 'YYYY-MM-DD HH:mm'),
            'sermonCount': user.sermon_count || 0
        };
        
        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
                    element.value = value;
                } else {
                    element.textContent = value || '-';
                }
            }
        });
        
        // Update avatar
        const avatar = document.getElementById('userAvatar');
        if (avatar && user.avatar_url) {
            avatar.src = user.avatar_url;
        }
    },
    
    renderSermons(sermons) {
        const tbody = document.querySelector('#sermonsTable tbody');
        if (!tbody) return;
        
        if (!sermons || sermons.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-base-content/60">暂无讲道</td></tr>';
            return;
        }
        
        tbody.innerHTML = sermons.map(sermon => `
            <tr class="hover">
                <td>
                    <a href="sermon-detail.html?id=${sermon.id}" class="link link-hover font-medium">
                        ${sermon.title}
                    </a>
                </td>
                <td>${sermon.speaker?.name || '-'}</td>
                <td>${formatDate(sermon.date, 'YYYY-MM-DD')}</td>
                <td>${sermon.play_count || 0}</td>
                <td>${getStatusBadge(sermon.status)}</td>
                <td>
                    <a href="sermon-detail.html?id=${sermon.id}" class="btn btn-ghost btn-xs">
                        <span class="iconify" data-icon="heroicons:eye"></span>
                    </a>
                </td>
            </tr>
        `).join('');
    },
    
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        
        // Toggle input fields
        const inputs = ['userName', 'userEmail', 'userStatus'];
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.disabled = !this.isEditMode;
            }
        });
        
        // Toggle buttons
        document.getElementById('editBtn')?.classList.toggle('hidden', this.isEditMode);
        document.getElementById('saveBtn')?.classList.toggle('hidden', !this.isEditMode);
        document.getElementById('cancelBtn')?.classList.toggle('hidden', !this.isEditMode);
    },
    
    async saveUser() {
        try {
            const data = {
                username: document.getElementById('userName').value,
                email: document.getElementById('userEmail').value,
                status: document.getElementById('userStatus').value
            };
            
            const response = await UserService.updateUser(this.userId, data);
            if (response.success) {
                api.showSuccess('保存成功');
                this.toggleEditMode();
                await this.loadUser();
            }
        } catch (error) {
            console.error('Failed to update user:', error);
            api.showError(error);
        }
    },
    
    cancelEdit() {
        this.toggleEditMode();
        this.loadUser(); // Reload original data
    }
};

// Initialize based on current page
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const path = window.location.pathname;
        
        if (path.includes('users.html')) {
            UsersPage.init();
        } else if (path.includes('user-detail.html')) {
            UserDetailPage.init();
        }
    });
}

