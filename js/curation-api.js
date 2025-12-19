// 听道管理后台 - 内容编排 API 集成
// 版本: v1.0
// 最后更新: 2025年11月4日

/**
 * 首页模块编辑器 (home-editor.html)
 */
const HomeEditorPage = {
    config: null,
    
    async init() {
        AuthService.checkAuth();
        await this.loadConfig();
        await this.loadReferenceData();
        await this.renderConfigToUI();  // 渲染配置到 UI
        this.setupEventListeners();
        console.log('✅ HomeEditorPage initialized successfully');
    },
    
    async loadConfig() {
        try {
            // 直接从 API 获取配置
            const url = `${APIConfig.baseURL}/curation/home-config`;
            const response = await fetch(url, {
                headers: {
                    'X-API-Key': APIConfig.apiKey,
                    'X-Client-Type': APIConfig.clientType
                }
            });
            if (response.ok) {
                const result = await response.json();
                // 处理包装格式 { success: true, data: {...} }
                this.config = result.data || result;
                console.log('✅ Loaded home config:', {
                    scriptures: this.config.config.scriptures?.length || 0,
                    recommendedSermons: this.config.config.recommendedSermons?.length || 0,
                    featuredTopics: this.config.config.featuredTopics?.length || 0,
                    popularSpeakers: this.config.config.popularSpeakers?.length || 0
                });
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.warn('Home config endpoint not available, using default:', error);
            // 使用默认配置
            this.config = {
                id: 'home-config',
                page: 'home',
                config: {
                    scriptures: [],
                    recommendedSermons: [],
                    featuredTopics: [],
                    popularSpeakers: []
                }
            };
        }
    },
    
    async loadReferenceData() {
        // Load sermons, speakers, topics for content selectors
        try {
            const [sermonsResp, speakersResp, topicsResp] = await Promise.all([
                SermonService.getSermons({ status: 'published', limit: 100 }),
                SpeakerService.getSpeakers({ status: 'active', limit: 100 }),
                TopicService.getTopics({ status: 'active', limit: 100 })
            ]);
            
            if (sermonsResp.success) window.availableSermons = sermonsResp.data;
            if (speakersResp.success) window.availableSpeakers = speakersResp.data;
            if (topicsResp.success) window.availableTopics = topicsResp.data;
        } catch (error) {
            console.error('Failed to load reference data:', error);
        }
    },
    
    renderConfig() {
        if (!this.config) return;
        console.log('Rendering home config:', this.config);
    },
    
    async renderConfigToUI() {
        if (!this.config || !this.config.config) {
            console.warn('No config to render');
            return;
        }
        
        const cfg = this.config.config;
        
        // 1. 渲染经文
        if (cfg.scriptures && cfg.scriptures.length > 0) {
            const scriptureList = document.getElementById('scripture-list');
            if (scriptureList) {
                scriptureList.innerHTML = cfg.scriptures.map(scripture => `
                    <div class="card card-compact bg-base-200">
                        <div class="card-body p-2">
                            <div class="flex items-start gap-2">
                                <div class="flex-1">
                                    <p class="text-sm font-medium">"${scripture.text}"</p>
                                    <p class="text-xs text-base-content/60 mt-1">${scripture.reference}</p>
                                </div>
                                <div class="flex gap-1">
                                    <button onclick="editScripture(this)" class="btn btn-ghost btn-xs">编辑</button>
                                    <button onclick="deleteScripture(this)" class="btn btn-ghost btn-xs text-error">删除</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
        
        // 2. 渲染推荐讲道
        if (cfg.recommendedSermons && cfg.recommendedSermons.length > 0) {
            await this.renderSermonCards('sermons-grid', cfg.recommendedSermons);
        }
        
        // 3. 渲染更多推荐页讲道
        if (cfg.moreRecommendedSermons && cfg.moreRecommendedSermons.length > 0) {
            await this.renderSermonCards('more-sermons-grid', cfg.moreRecommendedSermons);
        }
        
        // 4. 渲染主题讲道（兼容新旧格式）
        if (cfg.featuredTopics && cfg.featuredTopics.length > 0) {
            // 新格式：featuredTopics 数组
            await this.renderTopicCards('topics-grid', cfg.featuredTopics);
        } else if (cfg.topicSermons && cfg.topicSermons.topicId) {
            // 旧格式：topicSermons.topicId（向后兼容）
            await this.renderTopicCards('topics-grid', [cfg.topicSermons.topicId]);
        }
        
        // 5. 渲染浏览主题页
        if (cfg.browseTopics && cfg.browseTopics.length > 0) {
            await this.renderTopicCards('browse-topics-grid', cfg.browseTopics);
        }
        
        // 6. 渲染热门讲员
        if (cfg.popularSpeakers && cfg.popularSpeakers.length > 0) {
            await this.renderSpeakerCards('speakers-grid', cfg.popularSpeakers);
        }
        
        // 7. 渲染更多讲员页
        if (cfg.moreSpeakers && cfg.moreSpeakers.length > 0) {
            await this.renderSpeakerCards('more-speakers-grid', cfg.moreSpeakers);
        }
    },
    
    async renderSermonCards(gridId, sermonIds) {
        const grid = document.getElementById(gridId);
        if (!grid) {
            console.warn(`Grid not found: ${gridId}`);
            return;
        }
        
        try {
            // 获取讲道详情
            const sermonsData = await Promise.all(
                sermonIds.map(async id => {
                    try {
                        const url = `${APIConfig.baseURL}/sermons/${id}`;
                        const response = await fetch(url, {
                            headers: {
                                'X-API-Key': APIConfig.apiKey,
                                'X-Client-Type': APIConfig.clientType
                            }
                        });
                        if (!response.ok) return null;
                        const result = await response.json();
                        // 处理包装格式 { success: true, data: {...} }
                        return result.data || result;
                    } catch (e) {
                        console.error(`Failed to fetch sermon ${id}:`, e);
                        return null;
                    }
                })
            );
            
            const validSermons = sermonsData.filter(s => s);
            console.log(`Rendering ${validSermons.length} sermons to ${gridId}`);
            
            grid.innerHTML = validSermons.map(sermon => `
                <div class="card card-compact bg-base-200" data-sermon-id="${sermon.id}">
                    <div class="card-body p-2">
                        <h4 class="text-sm font-medium line-clamp-2">${sermon.title}</h4>
                        <p class="text-xs text-base-content/60 mt-1">${sermon.speaker?.name || '未知讲员'}</p>
                        <div class="mt-1">
                            <button onclick="removeItem(this)" class="btn btn-ghost btn-xs text-error w-full">移除</button>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error(`Failed to render sermons for ${gridId}:`, error);
        }
    },
    
    async renderSpeakerCards(gridId, speakerIds) {
        const grid = document.getElementById(gridId);
        if (!grid) {
            console.warn(`Grid not found: ${gridId}`);
            return;
        }
        
        try {
            // 获取讲员详情
            const speakersData = await Promise.all(
                speakerIds.map(async id => {
                    try {
                        const url = `${APIConfig.baseURL}/speakers/${id}`;
                        const response = await fetch(url, {
                            headers: {
                                'X-API-Key': APIConfig.apiKey,
                                'X-Client-Type': APIConfig.clientType
                            }
                        });
                        if (!response.ok) return null;
                        const result = await response.json();
                        // 处理包装格式 { success: true, data: {...} }
                        return result.data || result;
                    } catch (e) {
                        console.error(`Failed to fetch speaker ${id}:`, e);
                        return null;
                    }
                })
            );
            
            const validSpeakers = speakersData.filter(s => s);
            console.log(`Rendering ${validSpeakers.length} speakers to ${gridId}`);
            
            grid.innerHTML = validSpeakers.map(speaker => `
                <div class="card card-compact bg-base-200" data-speaker-id="${speaker.id}">
                    <div class="card-body p-2">
                        <h4 class="text-sm font-medium line-clamp-2">${speaker.name}</h4>
                        <p class="text-xs text-base-content/60 mt-1">${speaker.church || ''}</p>
                        <div class="mt-1">
                            <button onclick="removeItem(this)" class="btn btn-ghost btn-xs text-error w-full">移除</button>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error(`Failed to render speakers for ${gridId}:`, error);
        }
    },
    
    async renderTopicCards(gridId, topicIds) {
        const grid = document.getElementById(gridId);
        if (!grid) {
            console.warn(`Grid not found: ${gridId}`);
            return;
        }
        
        try {
            // 获取所有主题详情
            const topicsData = await Promise.all(
                topicIds.map(async id => {
                    try {
                        const url = `${APIConfig.baseURL}/topics/${id}`;
                        const response = await fetch(url, {
                            headers: {
                                'X-API-Key': APIConfig.apiKey,
                                'X-Client-Type': APIConfig.clientType
                            }
                        });
                        if (!response.ok) return null;
                        const result = await response.json();
                        return result.data || result;
                    } catch (e) {
                        console.error(`Failed to fetch topic ${id}:`, e);
                        return null;
                    }
                })
            );
            
            const validTopics = topicsData.filter(t => t);
            console.log(`Rendering ${validTopics.length} topics to ${gridId}`);
            
            grid.innerHTML = validTopics.map(topic => `
                <div class="card card-compact bg-base-200" data-topic-id="${topic.id}">
                    <div class="card-body p-2">
                        <h4 class="text-sm font-medium line-clamp-2">${topic.name}</h4>
                        <p class="text-xs text-base-content/60 mt-1">${topic.sermon_count || 0}个讲道</p>
                        <div class="mt-1">
                            <button onclick="removeItem(this)" class="btn btn-ghost btn-xs text-error w-full">移除</button>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error(`Failed to render topics for ${gridId}:`, error);
        }
    },
    
    setupEventListeners() {
        const saveBtn = document.getElementById('saveConfigBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveConfig());
        }
    },
    
    async saveConfig() {
        try {
            // 显示加载状态
            const saveBtn = document.querySelector('.btn-primary');
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> 保存中...';
            }
            
            // 收集配置数据
            const configData = this.collectConfigFromUI();
            console.log('Saving config:', configData);
            
            // 调用 API 保存
            const url = `${APIConfig.baseURL}/curation/home-config`;
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(configData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('✅ Save response:', result);
            
            // 更新本地配置
            this.config = result.data || result;
            
            // 显示成功消息
            if (typeof showNotification === 'function') {
                showNotification('首页模块配置已保存并发布', 'success');
            }
            
            // 1.5秒后跳转
            setTimeout(() => {
                window.location.href = 'curation.html';
            }, 1500);
            
        } catch (error) {
            console.error('❌ Failed to save home config:', error);
            if (typeof showNotification === 'function') {
                showNotification('保存失败: ' + (error.message || error), 'error');
            }
            
            // 恢复按钮状态
            const saveBtn = document.querySelector('.btn-primary');
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<span class="iconify" data-icon="heroicons:check" data-width="16"></span> 保存并发布';
            }
        }
    },
    
    collectConfigFromUI() {
        // 收集经文库数据
        const scriptures = [];
        const scriptureCards = document.querySelectorAll('#scripture-list .card');
        scriptureCards.forEach((card, index) => {
            // 更精确的选择器：选择 .flex-1 容器内的元素
            const contentContainer = card.querySelector('.flex-1');
            if (contentContainer) {
                const content = contentContainer.querySelector('p.text-sm')?.textContent.replace(/^"|"$/g, '') || '';
                const reference = contentContainer.querySelector('p.text-xs')?.textContent || '';
                scriptures.push({
                    id: `scripture-${index + 1}`,
                    reference,
                    text: content,
                    order: index + 1
                });
            }
        });
        
        // 收集推荐讲道
        const recommendedSermons = [];
        const recommendedCards = document.querySelectorAll('#sermons-grid .card');
        recommendedCards.forEach(card => {
            const sermonId = card.dataset.sermonId;
            if (sermonId) recommendedSermons.push(sermonId);
        });
        console.log('✅ 收集推荐讲道:', recommendedSermons);
        
        // 收集更多推荐页讲道
        const moreRecommendedSermons = [];
        const moreRecommendedCards = document.querySelectorAll('#more-sermons-grid .card');
        moreRecommendedCards.forEach(card => {
            const sermonId = card.dataset.sermonId;
            if (sermonId) moreRecommendedSermons.push(sermonId);
        });
        console.log('✅ 收集更多推荐页讲道:', moreRecommendedSermons);
        
        // 收集主题讲道（收集多个主题 ID）
        const featuredTopics = [];
        const topicCards = document.querySelectorAll('#topics-grid .card');
        topicCards.forEach(card => {
            const topicId = card.dataset.topicId;
            if (topicId) featuredTopics.push(topicId);
        });
        console.log('✅ 收集主题讲道:', featuredTopics);
        
        // 收集浏览主题页（收集多个主题 ID）
        const browseTopics = [];
        const browseTopicCards = document.querySelectorAll('#browse-topics-grid .card');
        browseTopicCards.forEach(card => {
            const topicId = card.dataset.topicId;
            if (topicId) browseTopics.push(topicId);
        });
        console.log('✅ 收集浏览主题页:', browseTopics);
        
        // 收集热门讲员
        const popularSpeakers = [];
        const speakerCards = document.querySelectorAll('#speakers-grid .card');
        speakerCards.forEach(card => {
            const speakerId = card.dataset.speakerId;
            if (speakerId) popularSpeakers.push(speakerId);
        });
        console.log('✅ 收集热门讲员:', popularSpeakers);
        
        // 收集更多讲员页
        const moreSpeakers = [];
        const moreSpeakerCards = document.querySelectorAll('#more-speakers-grid .card');
        moreSpeakerCards.forEach(card => {
            const speakerId = card.dataset.speakerId;
            if (speakerId) moreSpeakers.push(speakerId);
        });
        console.log('✅ 收集更多讲员页:', moreSpeakers);
        
        const configData = {
            page: 'home',
            config: {
                scriptures,
                recommendedSermons,
                moreRecommendedSermons,
                featuredTopics,
                browseTopics,
                popularSpeakers,
                moreSpeakers
            },
            updated_at: new Date().toISOString()
        };
        
        console.log('📦 完整配置数据:', configData);
        return configData;
    }
};

/**
 * 发现页模块编辑器 (discover-editor.html)
 */
const DiscoverEditorPage = {
    config: null,
    
    async init() {
        AuthService.checkAuth();
        await this.loadConfig();
        await this.loadContent();
        this.setupEventListeners();
        console.log('✅ DiscoverEditorPage initialized successfully');
    },
    
    async loadConfig() {
        try {
            const response = await CurationService.getDiscoverConfig();
            if (response.success && response.data) {
                this.config = response.data;
                this.renderConfig();
            }
        } catch (error) {
            console.warn('Discover config endpoint not available, using demo mode:', error);
            // 演示模式：使用默认配置
            this.config = { modules: [] };
        }
    },
    
    async loadContent() {
        try {
            // Load content for each section
            const [dailyRecommended, latest, popular, speakers, topics] = await Promise.all([
                SermonService.getRecommendedSermons(10),
                SermonService.getLatestSermons(10),
                SermonService.getPopularSermons(10),
                SpeakerService.getPopularSpeakers(10),
                TopicService.getLatestTopics(10)
            ]);
            
            this.renderSections({
                dailyRecommended: dailyRecommended.data,
                latest: latest.data,
                popular: popular.data,
                speakers: speakers.data,
                topics: topics.data
            });
        } catch (error) {
            console.warn('Some discover content endpoints not available, using demo mode:', error);
            // 演示模式：继续运行，不显示错误
        }
    },
    
    renderConfig() {
        console.log('Rendering discover config:', this.config);
    },
    
    renderSections(data) {
        // Render each section with its content
        Object.entries(data).forEach(([section, items]) => {
            this.renderSection(section, items);
        });
    },
    
    renderSection(section, items) {
        const container = document.getElementById(`${section}Container`);
        if (!container) return;
        
        // Render items based on type
        console.log(`Rendering ${section}:`, items);
    },
    
    setupEventListeners() {
        const saveBtn = document.getElementById('saveConfigBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveConfig());
        }
    },
    
    async saveConfig() {
        try {
            const config = this.collectConfigFromUI();
            const response = await CurationService.updateDiscoverConfig(config);
            if (response.success) {
                api.showSuccess('保存成功');
                this.config = config;
            }
        } catch (error) {
            console.error('Failed to save discover config:', error);
            api.showError(error);
        }
    },
    
    collectConfigFromUI() {
        return {
            filterTags: [],
            modules: []
        };
    }
};

/**
 * 编排概览页 (curation.html)
 */
const CurationPage = {
    async init() {
        AuthService.checkAuth();
        await this.loadScriptures();
        await this.loadFeaturedContent();
        this.setupEventListeners();
    },
    
    async loadScriptures() {
        try {
            const response = await CurationService.getScriptures();
            if (response.success && response.data) {
                this.renderScriptures(response.data);
            }
        } catch (error) {
            console.error('Failed to load scriptures:', error);
        }
    },
    
    async loadFeaturedContent() {
        try {
            const response = await CurationService.getFeaturedContent();
            if (response.success && response.data) {
                this.renderFeaturedContent(response.data);
            }
        } catch (error) {
            console.error('Failed to load featured content:', error);
        }
    },
    
    renderScriptures(scriptures) {
        const container = document.getElementById('scripturesContainer');
        if (!container) return;
        
        container.innerHTML = scriptures.map(scripture => `
            <div class="card bg-base-100 shadow-sm">
                <div class="card-body p-4">
                    <h3 class="font-semibold">${scripture.reference}</h3>
                    <p class="text-sm">${scripture.text}</p>
                </div>
            </div>
        `).join('');
    },
    
    renderFeaturedContent(content) {
        console.log('Featured content:', content);
    },
    
    setupEventListeners() {
        // Add scripture button
        const addScriptureBtn = document.getElementById('addScriptureBtn');
        if (addScriptureBtn) {
            addScriptureBtn.addEventListener('click', () => this.showAddScriptureModal());
        }
    },
    
    showAddScriptureModal() {
        // Show modal for adding scripture
        console.log('Show add scripture modal');
    },
    
    async saveScripture(scripture) {
        try {
            const response = await CurationService.updateScriptures([scripture]);
            if (response.success) {
                api.showSuccess('经文添加成功');
                await this.loadScriptures();
            }
        } catch (error) {
            console.error('Failed to save scripture:', error);
            api.showError(error);
        }
    }
};

/**
 * 主题组管理页 (topic-groups.html)
 */
const TopicGroupsPage = {
    currentPage: 1,
    pageSize: 20,
    filters: {
        status: '',
        search: ''
    },
    
    async init() {
        AuthService.checkAuth();
        this.setupEventListeners();
        await this.loadTopicGroups();
        await this.loadStats();
    },
    
    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(async (e) => {
                this.filters.search = e.target.value;
                this.currentPage = 1;
                await this.loadTopicGroups();
            }, 500));
        }
        
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', async (e) => {
                this.filters.status = e.target.value;
                this.currentPage = 1;
                await this.loadTopicGroups();
            });
        }
        
        const createBtn = document.getElementById('createTopicGroupBtn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.showCreateModal());
        }
    },
    
    async loadTopicGroups() {
        try {
            this.showLoading(true);
            
            const response = await TopicService.getTopics({
                page: this.currentPage,
                limit: this.pageSize,
                status: this.filters.status,
                search: this.filters.search
            });
            
            if (response.success && response.data) {
                this.renderTopicGroups(response.data);
                if (response.pagination) {
                    this.renderPagination(response.pagination);
                }
            }
        } catch (error) {
            console.error('Failed to load topic groups:', error);
            api.showError(error);
        } finally {
            this.showLoading(false);
        }
    },
    
    async loadStats() {
        try {
            const response = await TopicService.getTopics({ limit: 1000 });
            if (response.success && response.data) {
                const topics = response.data;
                const stats = {
                    total: topics.length,
                    totalSermons: topics.reduce((sum, t) => sum + (t.sermon_count || 0), 0),
                    avgSermons: Math.round(topics.reduce((sum, t) => sum + (t.sermon_count || 0), 0) / topics.length)
                };
                this.updateStats(stats);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    },
    
    updateStats(stats) {
        const elements = {
            'totalTopics': stats.total,
            'totalSermons': stats.totalSermons,
            'avgSermons': stats.avgSermons
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    },
    
    renderTopicGroups(topics) {
        const tbody = document.querySelector('#topicGroupsTable tbody');
        if (!tbody) return;
        
        if (!topics || topics.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-base-content/60">暂无数据</td></tr>';
            return;
        }
        
        tbody.innerHTML = topics.map(topic => `
            <tr class="hover">
                <td>
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-gradient-to-br ${topic.color || 'from-blue-500 to-purple-500'} flex items-center justify-center">
                            <span class="iconify text-white" data-icon="${topic.icon || 'heroicons:tag'}" data-width="20"></span>
                        </div>
                        <div>
                            <div class="font-medium">${topic.name}</div>
                            <div class="text-xs text-base-content/60">${topic.description || ''}</div>
                        </div>
                    </div>
                </td>
                <td>${topic.sermon_count || 0}</td>
                <td>${formatDate(topic.created_at, 'YYYY-MM-DD')}</td>
                <td>${getStatusBadge(topic.status)}</td>
                <td>
                    <div class="flex gap-1">
                        <button class="btn btn-ghost btn-xs" onclick="TopicGroupsPage.editTopicGroup('${topic.id}')">
                            <span class="iconify" data-icon="heroicons:pencil"></span>
                        </button>
                        <button class="btn btn-ghost btn-xs text-error" onclick="TopicGroupsPage.deleteTopicGroup('${topic.id}')">
                            <span class="iconify" data-icon="heroicons:trash"></span>
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
                    <button class="join-item btn btn-sm" ${page <= 1 ? 'disabled' : ''} onclick="TopicGroupsPage.goToPage(${page - 1})">«</button>
                    <button class="join-item btn btn-sm">第 ${page} 页</button>
                    <button class="join-item btn btn-sm" ${page >= total_pages ? 'disabled' : ''} onclick="TopicGroupsPage.goToPage(${page + 1})">»</button>
                </div>
            </div>
        `;
    },
    
    async goToPage(page) {
        this.currentPage = page;
        await this.loadTopicGroups();
    },
    
    showLoading(show) {
        const tbody = document.querySelector('#topicGroupsTable tbody');
        if (!tbody) return;
        if (show) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8"><span class="loading loading-spinner loading-lg"></span></td></tr>';
        }
    },
    
    showCreateModal() {
        // Show create topic group modal
        const modal = document.getElementById('createTopicModal');
        if (modal) modal.showModal();
    },
    
    async editTopicGroup(id) {
        // Load topic group data and show edit modal
        try {
            const response = await TopicService.getTopic(id);
            if (response.success && response.data) {
                this.showEditModal(response.data);
            }
        } catch (error) {
            console.error('Failed to load topic group:', error);
            api.showError(error);
        }
    },
    
    showEditModal(topicGroup) {
        const modal = document.getElementById('editTopicModal');
        if (modal) {
            // Populate modal with topic group data
            modal.showModal();
        }
    },
    
    async deleteTopicGroup(id) {
        if (!confirm('确定要删除这个主题组吗？此操作不可撤销。')) return;
        
        try {
            const response = await TopicService.deleteTopic(id);
            if (response.success) {
                api.showSuccess('删除成功');
                await this.loadTopicGroups();
            }
        } catch (error) {
            console.error('Failed to delete topic group:', error);
            api.showError(error);
        }
    },
    
    async createTopicGroup(data) {
        try {
            const response = await TopicService.createTopic(data);
            if (response.success) {
                api.showSuccess('创建成功');
                await this.loadTopicGroups();
                const modal = document.getElementById('createTopicModal');
                if (modal) modal.close();
            }
        } catch (error) {
            console.error('Failed to create topic group:', error);
            api.showError(error);
        }
    },
    
    async updateTopicGroup(id, data) {
        try {
            const response = await TopicService.updateTopic(id, data);
            if (response.success) {
                api.showSuccess('更新成功');
                await this.loadTopicGroups();
                const modal = document.getElementById('editTopicModal');
                if (modal) modal.close();
            }
        } catch (error) {
            console.error('Failed to update topic group:', error);
            api.showError(error);
        }
    },
    
    async addSermonToTopic(topicId, sermonId) {
        try {
            const response = await TopicService.addSermonToTopic(topicId, sermonId);
            if (response.success) {
                api.showSuccess('添加成功');
                // Refresh sermon list in modal
            }
        } catch (error) {
            console.error('Failed to add sermon to topic:', error);
            api.showError(error);
        }
    },
    
    async removeSermonFromTopic(topicId, sermonId) {
        if (!confirm('确定要移除这个讲道吗？')) return;
        
        try {
            const response = await TopicService.removeSermonFromTopic(topicId, sermonId);
            if (response.success) {
                api.showSuccess('移除成功');
                // Refresh sermon list in modal
            }
        } catch (error) {
            console.error('Failed to remove sermon from topic:', error);
            api.showError(error);
        }
    }
};

// Initialize based on current page
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const path = window.location.pathname;
        
        if (path.includes('home-editor.html')) {
            HomeEditorPage.init();
        } else if (path.includes('discover-editor.html')) {
            DiscoverEditorPage.init();
        } else if (path.includes('curation.html')) {
            CurationPage.init();
        } else if (path.includes('topic-groups.html')) {
            TopicGroupsPage.init();
        }
    });
}

