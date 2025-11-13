// 听道管理后台 - 讲员管理 API 集成
// 版本: v1.0
// 最后更新: 2025年11月4日

/**
 * 讲员列表页 (speakers.html)
 */
const SpeakersPage = {
    currentPage: 1,
    pageSize: 20,
    filters: {
        status: '',
        search: ''
    },
    
    async init() {
        AuthService.checkAuth();
        this.setupEventListeners();
        await this.loadSpeakers();
    },
    
    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(async (e) => {
                this.filters.search = e.target.value;
                this.currentPage = 1;
                await this.loadSpeakers();
            }, 500));
        }
        
        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', async (e) => {
                this.filters.status = e.target.value;
                this.currentPage = 1;
                await this.loadSpeakers();
            });
        }
    },
    
    async loadSpeakers() {
        try {
            this.showLoading(true);
            
            const response = await SpeakerService.getSpeakers({
                page: this.currentPage,
                limit: this.pageSize,
                status: this.filters.status,
                search: this.filters.search
            });
            
            if (response.success && response.data) {
                this.renderSpeakers(response.data);
                if (response.pagination) {
                    this.renderPagination(response.pagination);
                }
            }
        } catch (error) {
            console.error('Failed to load speakers:', error);
            api.showError(error);
        } finally {
            this.showLoading(false);
        }
    },
    
    renderSpeakers(speakers) {
        const tbody = document.querySelector('#speakersTable tbody');
        if (!tbody) return;
        
        if (!speakers || speakers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-base-content/60">暂无数据</td></tr>';
            return;
        }
        
        tbody.innerHTML = speakers.map(speaker => `
            <tr class="hover">
                <td>
                    <label>
                        <input type="checkbox" class="checkbox checkbox-sm" value="${speaker.id}">
                    </label>
                </td>
                <td>
                    <div class="flex items-center gap-3">
                        <div class="avatar">
                            <div class="mask mask-squircle w-12 h-12">
                                <img src="${speaker.avatar_url || 'https://via.placeholder.com/48'}" alt="${speaker.name}">
                            </div>
                        </div>
                        <div>
                            <div class="font-medium">${speaker.name}</div>
                            <div class="text-sm text-base-content/60">${speaker.title || ''}</div>
                        </div>
                    </div>
                </td>
                <td>${speaker.church || '-'}</td>
                <td>${speaker.sermon_count || 0}</td>
                <td>${speaker.follower_count || 0}</td>
                <td>${getStatusBadge(speaker.status)}</td>
                <td>
                    <div class="flex gap-1">
                        <a href="speaker-detail.html?id=${speaker.id}" class="btn btn-ghost btn-xs">
                            <span class="iconify" data-icon="heroicons:eye"></span>
                        </a>
                        <button class="btn btn-ghost btn-xs" onclick="SpeakersPage.editSpeaker('${speaker.id}')">
                            <span class="iconify" data-icon="heroicons:pencil"></span>
                        </button>
                        <button class="btn btn-ghost btn-xs text-error" onclick="SpeakersPage.deleteSpeaker('${speaker.id}')">
                            <span class="iconify" data-icon="heroicons:trash"></span>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    renderPagination(pagination) {
        // Similar to SermonsPage
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;
        
        const { page, total_pages, total } = pagination;
        paginationContainer.innerHTML = `
            <div class="flex justify-between items-center">
                <div class="text-sm text-base-content/60">共 ${total} 条记录，第 ${page} / ${total_pages} 页</div>
                <div class="join">
                    <button class="join-item btn btn-sm" ${page <= 1 ? 'disabled' : ''} onclick="SpeakersPage.goToPage(${page - 1})">«</button>
                    <button class="join-item btn btn-sm">第 ${page} 页</button>
                    <button class="join-item btn btn-sm" ${page >= total_pages ? 'disabled' : ''} onclick="SpeakersPage.goToPage(${page + 1})">»</button>
                </div>
            </div>
        `;
    },
    
    async goToPage(page) {
        this.currentPage = page;
        await this.loadSpeakers();
    },
    
    showLoading(show) {
        const tbody = document.querySelector('#speakersTable tbody');
        if (!tbody) return;
        if (show) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8"><span class="loading loading-spinner loading-lg"></span></td></tr>';
        }
    },
    
    editSpeaker(id) {
        window.location.href = `speaker-detail.html?id=${id}&mode=edit`;
    },
    
    async deleteSpeaker(id) {
        if (!confirm('确定要删除这个讲员吗？此操作不可撤销。')) return;
        
        try {
            const response = await SpeakerService.deleteSpeaker(id);
            if (response.success) {
                api.showSuccess('删除成功');
                await this.loadSpeakers();
            }
        } catch (error) {
            console.error('Failed to delete speaker:', error);
            api.showError(error);
        }
    }
};

/**
 * 讲员详情页 (speaker-detail.html)
 */
const SpeakerDetailPage = {
    speakerId: null,
    
    async init() {
        AuthService.checkAuth();
        
        const params = new URLSearchParams(window.location.search);
        this.speakerId = params.get('id');
        
        if (!this.speakerId) {
            alert('讲员ID不存在');
            window.location.href = 'speakers.html';
            return;
        }
        
        await this.loadSpeaker();
        await this.loadSpeakerSermons();
    },
    
    async loadSpeaker() {
        try {
            const response = await SpeakerService.getSpeaker(this.speakerId);
            if (response.success && response.data) {
                this.renderSpeakerDetail(response.data);
            }
        } catch (error) {
            console.error('Failed to load speaker:', error);
            api.showError(error);
            setTimeout(() => window.location.href = 'speakers.html', 2000);
        }
    },
    
    async loadSpeakerSermons() {
        try {
            const response = await SpeakerService.getSpeakerSermons(this.speakerId, { limit: 50 });
            if (response.success && response.data) {
                this.renderSermons(response.data);
            }
        } catch (error) {
            console.error('Failed to load speaker sermons:', error);
        }
    },
    
    renderSpeakerDetail(speaker) {
        document.title = `${speaker.name} - 听道后台管理系统`;
        
        // Update all fields
        const fields = {
            'speakerName': speaker.name,
            'speakerTitle': speaker.title,
            'speakerChurch': speaker.church,
            'speakerBio': speaker.bio,
            'speakerEmail': speaker.email,
            'speakerWebsite': speaker.website,
            'sermonCount': speaker.sermon_count,
            'followerCount': speaker.follower_count,
            'totalPlays': speaker.total_play_count
        };
        
        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value || '-';
        });
        
        // Update avatar
        const avatar = document.getElementById('speakerAvatar');
        if (avatar && speaker.avatar_url) {
            avatar.src = speaker.avatar_url;
        }
        
        // Update status badge
        const statusBadge = document.getElementById('statusBadge');
        if (statusBadge) {
            statusBadge.innerHTML = getStatusBadge(speaker.status);
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
                <td>${formatDate(sermon.date, 'YYYY-MM-DD')}</td>
                <td>${formatDuration(sermon.duration)}</td>
                <td>${sermon.play_count || 0}</td>
                <td>${getStatusBadge(sermon.status)}</td>
                <td>
                    <a href="sermon-detail.html?id=${sermon.id}" class="btn btn-ghost btn-xs">
                        <span class="iconify" data-icon="heroicons:eye"></span>
                    </a>
                </td>
            </tr>
        `).join('');
    }
};

/**
 * 添加讲员页 (add-speaker.html)
 */
const AddSpeakerPage = {
    async init() {
        AuthService.checkAuth();
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        const form = document.getElementById('addSpeakerForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        const avatarInput = document.getElementById('avatarFile');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => this.handleAvatarUpload(e));
        }
    },
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            title: formData.get('title'),
            church: formData.get('church'),
            bio: formData.get('bio'),
            email: formData.get('email'),
            website: formData.get('website'),
            avatar_url: formData.get('avatar_url'),
            status: 'active'
        };
        
        try {
            const response = await SpeakerService.createSpeaker(data);
            if (response.success) {
                api.showSuccess('讲员添加成功');
                setTimeout(() => {
                    window.location.href = `speaker-detail.html?id=${response.data.id}`;
                }, 1000);
            }
        } catch (error) {
            console.error('Failed to create speaker:', error);
            api.showError(error);
        }
    },
    
    async handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            UploadService.validateFile(file, 'image');
            const response = await UploadService.uploadAvatar(file);
            
            if (response.success && response.data.url) {
                document.getElementById('avatarUrl').value = response.data.url;
                const preview = document.getElementById('avatarPreview');
                if (preview) {
                    preview.src = response.data.url;
                    preview.classList.remove('hidden');
                }
                api.showSuccess('头像上传成功');
            }
        } catch (error) {
            console.error('Failed to upload avatar:', error);
            api.showError(error);
        }
    }
};

// Initialize based on current page
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const path = window.location.pathname;
        
        if (path.includes('speakers.html')) {
            SpeakersPage.init();
        } else if (path.includes('speaker-detail.html')) {
            SpeakerDetailPage.init();
        } else if (path.includes('add-speaker.html')) {
            AddSpeakerPage.init();
        }
    });
}

