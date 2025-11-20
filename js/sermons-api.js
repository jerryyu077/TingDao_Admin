// 听道管理后台 - 讲道管理 API 集成
// 版本: v2.0
// 最后更新: 2025年11月5日
// 更新内容: 
// - 实现客户端搜索过滤（支持中文）
// - 修复状态筛选
// - 修复分页显示
// - 删除了删除按钮

/**
 * 讲道列表页 (sermons.html)
 */
const SermonsPage = {
    currentPage: 1,
    pageSize: 10, // Changed from 20 to 10
    filters: {
        status: '',
        search: '',
        speaker_id: ''
    },
    
    async init() {
        // Check authentication
        AuthService.checkAuth();
        
        // Check for speaker_id in URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('speaker_id')) {
            this.filters.speaker_id = urlParams.get('speaker_id');
        }
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load initial data
        await this.loadStats();
        await this.loadSermons();
    },
    
    async loadStats() {
        try {
            const url = `${APIConfig.baseURL}${APIConfig.apiVersion}/sermons`;
            const response = await fetch(url);
            const jsonData = await response.json();
            const allSermons = jsonData.success ? jsonData.data : jsonData;
            
            // Calculate stats from all sermons
            const stats = {
                total: allSermons.length,
                pending: 0,
                published: 0,
                revision: 0
            };
            
            allSermons.forEach(sermon => {
                const statusKey = `sermon_status_${sermon.id}`;
                const savedStatus = localStorage.getItem(statusKey);
                const currentStatus = savedStatus || sermon.status;
                
                if (currentStatus === 'pending') stats.pending++;
                else if (currentStatus === 'published') stats.published++;
                else if (currentStatus === 'revision') stats.revision++;
            });
            
            // Update UI
            document.getElementById('statTotal').textContent = stats.total.toLocaleString();
            document.getElementById('statPending').textContent = stats.pending.toLocaleString();
            document.getElementById('statPublished').textContent = stats.published.toLocaleString();
            document.getElementById('statRevision').textContent = stats.revision.toLocaleString();
            
            console.log('[Stats] Loaded:', stats);
        } catch (error) {
            console.error('[Stats] Failed to load:', error);
        }
    },
    
    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(async (e) => {
                this.filters.search = e.target.value;
                this.currentPage = 1;
                await this.loadSermons();
            }, 500));
        }
        
        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', async (e) => {
                this.filters.status = e.target.value;
                this.currentPage = 1;
                await this.loadSermons();
            });
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadSermons());
        }
    },
    
    async loadSermons() {
        try {
            // Show loading state
            this.showLoading(true);
            
            // Build URL with speaker_id filter if present
            let url = `${APIConfig.baseURL}${APIConfig.apiVersion}/sermons`;
            if (this.filters.speaker_id) {
                url += `?speaker_id=${this.filters.speaker_id}`;
            }
            
            console.log('Loading sermons from:', url);
            
            const response = await fetch(url);
            const jsonData = await response.json();
            
            // Handle wrapped response from backend
            let allSermons = jsonData.success ? jsonData.data : jsonData;
            
            // Client-side status filtering (using localStorage status)
            if (this.filters.status) {
                console.log(`Applying status filter: "${this.filters.status}"`);
                allSermons = allSermons.filter(sermon => {
                    const statusKey = `sermon_status_${sermon.id}`;
                    const savedStatus = localStorage.getItem(statusKey);
                    const currentStatus = savedStatus || sermon.status;
                    const matches = currentStatus === this.filters.status;
                    if (savedStatus) {
                        console.log(`  ${sermon.id}: localStorage="${savedStatus}", API="${sermon.status}", using="${currentStatus}", matches=${matches}`);
                    }
                    return matches;
                });
                console.log(`✅ Filtered to ${allSermons.length} sermons with status "${this.filters.status}"`);
            }
            
            // Client-side search filtering (for Chinese text support)
            if (this.filters.search && this.filters.search.trim()) {
                const searchTerm = this.filters.search.toLowerCase().trim();
                allSermons = allSermons.filter(sermon => {
                    return sermon.title?.toLowerCase().includes(searchTerm) ||
                           sermon.speaker?.name?.toLowerCase().includes(searchTerm) ||
                           sermon.submitter?.username?.toLowerCase().includes(searchTerm) ||
                           sermon.summary?.toLowerCase().includes(searchTerm);
                });
                console.log(`Filtered to ${allSermons.length} sermons matching "${this.filters.search}"`);
            }
            
            // Client-side pagination
            const total = allSermons.length;
            const totalPages = Math.ceil(total / this.pageSize);
            const startIndex = (this.currentPage - 1) * this.pageSize;
            const endIndex = startIndex + this.pageSize;
            const paginatedSermons = allSermons.slice(startIndex, endIndex);
            
            console.log(`Page ${this.currentPage}: showing ${paginatedSermons.length} of ${total} sermons`);
            
            this.renderSermons(paginatedSermons);
            this.renderPagination({
                page: this.currentPage,
                total_pages: totalPages,
                total: total
            });
        } catch (error) {
            console.error('Failed to load sermons:', error);
            alert('加载讲道列表失败: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    },
    
    renderSermons(sermons) {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;
        
        if (!sermons || sermons.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-8 text-base-content/60">
                        暂无数据
                    </td>
                </tr>
            `;
            return;
        }
        
        // Render sermons with new table structure (matching our static HTML)
        tbody.innerHTML = sermons.map(sermon => {
            const sermonId = sermon.id;
            const speaker = sermon.speaker?.name || '未知讲员';
            const submitter = sermon.submitter?.email || sermon.submitter?.username || '未知用户';
            // Use created_at (submission time) instead of date (sermon date)
            const createdAt = sermon.created_at || sermon.date;
            const date = createdAt ? new Date(createdAt).toISOString().split('T')[0] : '';
            const time = createdAt ? new Date(createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
            
            // Get status from localStorage or use API status
            const statusKey = `sermon_status_${sermonId}`;
            const savedStatus = localStorage.getItem(statusKey);
            const statusMap = {
                'pending': '待审核',
                'published': '已发布',
                'revision': '已退回',
                'rejected': '已拒绝'
            };
            const statusClass = {
                'pending': 'status-pending',
                'published': 'status-published',
                'revision': 'status-revision',
                'rejected': 'status-rejected'
            };
            const currentStatus = savedStatus || sermon.status;
            const statusText = statusMap[currentStatus] || '待审核';
            const statusCls = statusClass[currentStatus] || 'status-pending';
            
            // Debug log for status
            if (savedStatus) {
                console.log(`${sermonId}: localStorage status='${savedStatus}', showing '${statusText}'`);
            }
            
            return `
                <tr class="hover cursor-pointer" data-sermon-id="${sermonId}" onclick="if (!event.target.closest('input, button')) location.href='sermon-detail.html?id=${sermonId}'">
                    <td><input type="checkbox" class="checkbox checkbox-sm sermon-checkbox" onclick="event.stopPropagation(); updateSelectCount()"></td>
                    <td>
                        <div class="flex items-center gap-2">
                            <span class="font-medium">${sermon.title}</span>
                        </div>
                    </td>
                    <td>${speaker}</td>
                    <td>${submitter}</td>
                    <td>${date} ${time}</td>
                    <td>
                        <div class="flex gap-2 text-xs">
                            <span><span class="iconify" data-icon="heroicons:play" data-width="14"></span> ${sermon.play_count || 0}</span>
                            <span><span class="iconify" data-icon="heroicons:heart" data-width="14"></span> ${sermon.favorite_count || 0}</span>
                        </div>
                    </td>
                    <td class="text-center"><span class="status-indicator ${statusCls}" data-sermon-id="${sermonId}">${statusText}</span></td>
                    <td class="text-center">
                        <div class="flex items-center justify-center gap-1">
                            <button class="btn btn-ghost btn-xs btn-square" onclick="event.stopPropagation(); location.href='sermon-detail.html?id=${sermonId}'" title="编辑"><span class="iconify" data-icon="heroicons:pencil" data-width="16"></span></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Status is already handled in renderSermons() above, no need to update again
    },
    
    renderPagination(pagination) {
        const { page, total_pages, total } = pagination;
        const start = (page - 1) * this.pageSize + 1;
        const end = Math.min(page * this.pageSize, total);
        
        // Update pagination info text
        const paginationInfo = document.querySelector('.text-sm.text-base-content\\/70');
        if (paginationInfo) {
            paginationInfo.innerHTML = `
                显示第 <span class="font-medium">${start}</span> 到 <span class="font-medium">${end}</span> 条，共 <span class="font-medium">${total}</span> 条
            `;
        }
        
        // Update pagination buttons
        const paginationButtons = document.querySelector('.join');
        if (paginationButtons) {
            const maxPageButtons = 5; // Maximum number of page buttons to show
            let startPage = Math.max(1, page - 2);
            let endPage = Math.min(total_pages, startPage + maxPageButtons - 1);
            
            if (endPage - startPage < maxPageButtons - 1) {
                startPage = Math.max(1, endPage - maxPageButtons + 1);
            }
            
            let buttonsHTML = `
                <button class="join-item btn btn-sm" ${page <= 1 ? 'disabled' : ''} 
                    onclick="SermonsPage.goToPage(${page - 1})">«</button>
            `;
            
            for (let i = startPage; i <= endPage; i++) {
                buttonsHTML += `
                    <button class="join-item btn btn-sm ${i === page ? 'btn-primary' : ''}" 
                        onclick="SermonsPage.goToPage(${i})">${i}</button>
                `;
            }
            
            if (endPage < total_pages) {
                buttonsHTML += `<button class="join-item btn btn-sm btn-disabled">...</button>`;
                buttonsHTML += `<button class="join-item btn btn-sm" onclick="SermonsPage.goToPage(${total_pages})">${total_pages}</button>`;
            }
            
            buttonsHTML += `
                <button class="join-item btn btn-sm" ${page >= total_pages ? 'disabled' : ''} 
                    onclick="SermonsPage.goToPage(${page + 1})">»</button>
            `;
            
            paginationButtons.innerHTML = buttonsHTML;
        }
    },
    
    async goToPage(page) {
        this.currentPage = page;
        await this.loadSermons();
    },
    
    showLoading(show) {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;
        
        if (show) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-8">
                        <span class="loading loading-spinner loading-lg"></span>
                    </td>
                </tr>
            `;
        }
    },
    
    editSermon(id) {
        window.location.href = `sermon-detail.html?id=${id}&mode=edit`;
    },
    
    async deleteSermon(id) {
        if (!confirm('确定要删除这个讲道吗？此操作不可撤销。')) {
            return;
        }
        
        try {
            const response = await SermonService.deleteSermon(id);
            if (response.success) {
                api.showSuccess('删除成功');
                await this.loadSermons();
            }
        } catch (error) {
            console.error('Failed to delete sermon:', error);
            api.showError(error);
        }
    }
};

/**
 * 讲道详情页 (sermon-detail.html)
 */
const SermonDetailPage = {
    sermonId: null,
    
    async init() {
        // Check authentication
        AuthService.checkAuth();
        
        // Get sermon ID from URL
        const params = new URLSearchParams(window.location.search);
        this.sermonId = params.get('id');
        
        if (!this.sermonId) {
            alert('讲道ID不存在');
            window.location.href = 'sermons.html';
            return;
        }
        
        // Load sermon data
        await this.loadSermon();
        
        // Setup event listeners
        this.setupEventListeners();
    },
    
    async loadSermon() {
        try {
            const response = await SermonService.getSermon(this.sermonId);
            
            if (response.success && response.data) {
                this.renderSermonDetail(response.data);
            }
        } catch (error) {
            console.error('Failed to load sermon:', error);
            api.showError(error);
            setTimeout(() => {
                window.location.href = 'sermons.html';
            }, 2000);
        }
    },
    
    renderSermonDetail(sermon) {
        // Update page title
        document.title = `${sermon.title} - 听道后台管理系统`;
        
        // Update breadcrumb
        const breadcrumbTitle = document.getElementById('breadcrumbTitle');
        if (breadcrumbTitle) breadcrumbTitle.textContent = sermon.title;
        
        // Update all sermon fields
        this.updateField('sermonTitle', sermon.title);
        this.updateField('sermonSpeaker', sermon.speaker?.name || '-');
        this.updateField('sermonSubmitter', sermon.submitter?.username || '-');
        this.updateField('sermonDate', formatDate(sermon.date, 'YYYY-MM-DD'));
        this.updateField('sermonDuration', formatDuration(sermon.duration));
        this.updateField('sermonScripture', sermon.scripture || '-');
        this.updateField('sermonSummary', sermon.summary || '-');
        this.updateField('sermonStatus', sermon.status);
        this.updateField('sermonPlays', sermon.play_count || 0);
        this.updateField('sermonFavorites', sermon.favorite_count || 0);
        this.updateField('sermonDownloads', sermon.download_count || 0);
        
        // Update cover image
        const coverImg = document.getElementById('sermonCover');
        if (coverImg && sermon.cover_image_url) {
            coverImg.src = sermon.cover_image_url;
        }
        
        // Update audio player
        const audioPlayer = document.getElementById('audioPlayer');
        if (audioPlayer && sermon.audio_url) {
            audioPlayer.src = sermon.audio_url;
        }
        
        // Update status badge
        const statusBadge = document.getElementById('statusBadge');
        if (statusBadge) {
            statusBadge.innerHTML = getStatusBadge(sermon.status);
        }
        
        // Update speaker link
        const speakerLink = document.querySelector('[data-speaker-link]');
        if (speakerLink && sermon.speaker_id) {
            speakerLink.href = `speaker-detail.html?id=${sermon.speaker_id}`;
        }
        
        // Update submitter link
        const submitterLink = document.querySelector('[data-submitter-link]');
        if (submitterLink && sermon.submitted_by) {
            submitterLink.href = `user-detail.html?id=${sermon.submitted_by}`;
        }
    },
    
    updateField(id, value) {
        const element = document.getElementById(id);
        if (element) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.value = value;
            } else {
                element.textContent = value;
            }
        }
    },
    
    setupEventListeners() {
        // Approve button
        const approveBtn = document.getElementById('approveBtn');
        if (approveBtn) {
            approveBtn.addEventListener('click', () => this.updateStatus('published'));
        }
        
        // Reject button
        const rejectBtn = document.getElementById('rejectBtn');
        if (rejectBtn) {
            rejectBtn.addEventListener('click', () => this.updateStatus('rejected'));
        }
        
        // Delete button
        const deleteBtn = document.getElementById('deleteBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteSermon());
        }
    },
    
    async updateStatus(status) {
        const statusText = { published: '批准', rejected: '拒绝' }[status];
        if (!confirm(`确定要${statusText}这个讲道吗？`)) {
            return;
        }
        
        try {
            const response = await SermonService.updateStatus(this.sermonId, status);
            if (response.success) {
                api.showSuccess(`${statusText}成功`);
                await this.loadSermon();
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            api.showError(error);
        }
    },
    
    async deleteSermon() {
        if (!confirm('确定要删除这个讲道吗？此操作不可撤销。')) {
            return;
        }
        
        try {
            const response = await SermonService.deleteSermon(this.sermonId);
            if (response.success) {
                api.showSuccess('删除成功');
                setTimeout(() => {
                    window.location.href = 'sermons.html';
                }, 1000);
            }
        } catch (error) {
            console.error('Failed to delete sermon:', error);
            api.showError(error);
        }
    }
};

/**
 * 添加讲道页 (add-sermon.html)
 */
const AddSermonPage = {
    speakers: [],
    users: [],
    
    async init() {
        // Check authentication
        AuthService.checkAuth();
        
        // Load reference data
        await this.loadSpeakers();
        await this.loadUsers();
        
        // Setup event listeners
        this.setupEventListeners();
    },
    
    async loadSpeakers() {
        try {
            const response = await SpeakerService.getSpeakers({ limit: 1000 });
            if (response.success && response.data) {
                this.speakers = response.data;
            }
        } catch (error) {
            console.error('Failed to load speakers:', error);
        }
    },
    
    async loadUsers() {
        try {
            const response = await UserService.getUsers({ limit: 1000 });
            if (response.success && response.data) {
                this.users = response.data;
            }
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    },
    
    setupEventListeners() {
        // Form submission
        const form = document.getElementById('addSermonForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        // Audio file upload
        const audioInput = document.getElementById('audioFile');
        if (audioInput) {
            audioInput.addEventListener('change', (e) => this.handleAudioUpload(e));
        }
        
        // Cover image upload
        const coverInput = document.getElementById('coverImage');
        if (coverInput) {
            coverInput.addEventListener('change', (e) => this.handleCoverUpload(e));
        }
    },
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            title: formData.get('title'),
            speaker_id: formData.get('speaker_id'),
            submitted_by: api.getCurrentUser()?.id || formData.get('submitted_by'),
            date: formData.get('date'),
            scripture: formData.get('scripture'),
            summary: formData.get('summary'),
            description: formData.get('description'),
            audio_url: formData.get('audio_url'), // Should be set after upload
            cover_image_url: formData.get('cover_image_url'), // Should be set after upload
            status: 'draft'
        };
        
        try {
            const response = await SermonService.createSermon(data);
            if (response.success) {
                api.showSuccess('讲道添加成功');
                setTimeout(() => {
                    window.location.href = `sermon-detail.html?id=${response.data.id}`;
                }, 1000);
            }
        } catch (error) {
            console.error('Failed to create sermon:', error);
            api.showError(error);
        }
    },
    
    async handleAudioUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            UploadService.validateFile(file, 'audio');
            
            const progressBar = document.getElementById('audioUploadProgress');
            if (progressBar) progressBar.classList.remove('hidden');
            
            const response = await UploadService.uploadAudio(file, (percent) => {
                if (progressBar) {
                    progressBar.value = percent;
                }
            });
            
            if (response.success && response.data.url) {
                document.getElementById('audioUrl').value = response.data.url;
                api.showSuccess('音频上传成功');
            }
        } catch (error) {
            console.error('Failed to upload audio:', error);
            api.showError(error);
        }
    },
    
    async handleCoverUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            UploadService.validateFile(file, 'image');
            
            const response = await UploadService.uploadCover(file);
            
            if (response.success && response.data.url) {
                document.getElementById('coverUrl').value = response.data.url;
                
                // Show preview
                const preview = document.getElementById('coverPreview');
                if (preview) {
                    preview.src = response.data.url;
                    preview.classList.remove('hidden');
                }
                
                api.showSuccess('封面上传成功');
            }
        } catch (error) {
            console.error('Failed to upload cover:', error);
            api.showError(error);
        }
    }
};

// Initialize based on current page
// Note: sermons.html has its own initialization, so we only auto-init for sermon-detail and add-sermon
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const path = window.location.pathname;
        
        // sermons.html init is handled in the page's own script
        if (path.includes('sermon-detail.html')) {
            SermonDetailPage.init();
        } else if (path.includes('add-sermon.html')) {
            AddSermonPage.init();
        }
    });
}

