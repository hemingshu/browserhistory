// 全局变量
let currentHistory = [];
let filteredHistory = [];
let currentPage = 1;
let itemsPerPage = 20;
let searchQuery = '';
let dateFilter = 'all';
let sortFilter = 'time-desc';
let viewMode = 'grid'; // 'grid' or 'list'
let isAutoRefresh = true;
let refreshInterval = null;
let categoryFilter = 'all'; // 新增类别过滤

// DOM元素
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const dateFilterSelect = document.getElementById('dateFilter');
const sortFilterSelect = document.getElementById('sortFilter');
const refreshBtn = document.getElementById('refreshBtn');
const exportBtn = document.getElementById('exportBtn');
const exportTitlesBtn = document.getElementById('exportTitlesBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const historyList = document.getElementById('historyList');
const loadingIndicator = document.getElementById('loadingIndicator');
const noResults = document.getElementById('noResults');
const firstPageBtn = document.getElementById('firstPage');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const lastPageBtn = document.getElementById('lastPage');
const pageInfo = document.getElementById('pageInfo');
const pageNumbers = document.getElementById('pageNumbers');
const pageSizeSelect = document.getElementById('pageSize');
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const exportModal = document.getElementById('exportModal');
const settingsModal = document.getElementById('settingsModal');
const confirmExportBtn = document.getElementById('confirmExport');
const cancelExportBtn = document.getElementById('cancelExport');
const settingsBtn = document.getElementById('settingsBtn');
const helpBtn = document.getElementById('helpBtn');
const geminiApiKeyInput = document.getElementById('geminiApiKey');
const classifyBtn = document.getElementById('classifyBtn');
const mainApiKeyInput = document.getElementById('mainApiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const classifyNowBtn = document.getElementById('classifyNowBtn');
const clearClassificationBtn = document.getElementById('clearClassificationBtn');

// 类别选项卡元素
const categoryTabs = document.querySelectorAll('.category-tab');

// 统计元素
const totalCountEl = document.getElementById('totalCount');
const filteredCountEl = document.getElementById('filteredCount');
const starredCountEl = document.getElementById('starredCount');
const todayCountEl = document.getElementById('todayCount');
const recordCountEl = document.getElementById('recordCount');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadSettings();
    loadHistory(true); // 首次加载时进行分类
    startAutoRefresh();
});

// 事件监听器
function initializeEventListeners() {
    // 搜索功能
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // 过滤功能
    dateFilterSelect.addEventListener('change', function() {
        dateFilter = this.value;
        applyFilters();
    });
    
    sortFilterSelect.addEventListener('change', function() {
        sortFilter = this.value;
        applySorting();
    });
    
    // 页面大小
    pageSizeSelect.addEventListener('change', function() {
        itemsPerPage = parseInt(this.value);
        currentPage = 1;
        renderHistory();
    });
    
    // 视图模式
    gridViewBtn.addEventListener('click', () => setViewMode('grid'));
    listViewBtn.addEventListener('click', () => setViewMode('list'));
    
    // 类别选项卡
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            setCategoryFilter(category);
        });
    });
    
    // 操作按钮
    refreshBtn.addEventListener('click', () => loadHistory(true)); // 手动刷新时进行分类
    exportBtn.addEventListener('click', showExportModal);
    if (exportTitlesBtn) {
        exportTitlesBtn.addEventListener('click', exportTitlesJSON);
    }
    clearAllBtn.addEventListener('click', clearAllHistory);
    
    // 分页
    firstPageBtn.addEventListener('click', () => goToPage(1));
    prevPageBtn.addEventListener('click', () => changePage(-1));
    nextPageBtn.addEventListener('click', () => changePage(1));
    lastPageBtn.addEventListener('click', () => goToPage(getTotalPages()));
    
    // 模态框
    confirmExportBtn.addEventListener('click', handleExport);
    cancelExportBtn.addEventListener('click', hideExportModal);
    settingsBtn.addEventListener('click', showSettingsModal);
    helpBtn.addEventListener('click', showHelp);
    
    // 模态框关闭
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // 设置保存
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    document.getElementById('cancelSettings').addEventListener('click', hideSettingsModal);
    
    // AI 分类按钮
    if (classifyBtn) {
        classifyBtn.addEventListener('click', handleManualClassification);
    }
    if (clearClassificationBtn) {
        clearClassificationBtn.addEventListener('click', clearClassificationMark);
    }
    
    // 主页面 API Key 相关按钮
    if (saveApiKeyBtn) {
        saveApiKeyBtn.addEventListener('click', saveApiKeyFromMain);
    }
    if (classifyNowBtn) {
        classifyNowBtn.addEventListener('click', classifyNowFromMain);
    }
}

// 加载设置
async function loadSettings() {
    try {
        const result = await chrome.storage.local.get(['historySettings','geminiApiKey']);
        if (result.historySettings) {
            const settings = result.historySettings;
            isAutoRefresh = settings.autoRefresh !== false;
            document.getElementById('autoRefresh').checked = isAutoRefresh;
            document.getElementById('showVisits').checked = settings.showVisits !== false;
            document.getElementById('showFavicon').checked = settings.showFavicon !== false;
        }
        if (result.geminiApiKey) {
            if (geminiApiKeyInput) {
                geminiApiKeyInput.value = result.geminiApiKey;
            }
            if (mainApiKeyInput) {
                mainApiKeyInput.value = result.geminiApiKey;
            }
        }
    } catch (error) {
        console.error('加载设置失败:', error);
    }
}

// 保存设置
async function saveSettings() {
    try {
        const settings = {
            autoRefresh: document.getElementById('autoRefresh').checked,
            showVisits: document.getElementById('showVisits').checked,
            showFavicon: document.getElementById('showFavicon').checked
        };
        const apiKey = geminiApiKeyInput ? geminiApiKeyInput.value.trim() : '';
        const toSave = { historySettings: settings };
        if (apiKey) {
            toSave.geminiApiKey = apiKey;
        }
        await chrome.storage.local.set(toSave);
        isAutoRefresh = settings.autoRefresh;
        if (isAutoRefresh) {
            startAutoRefresh();
        } else {
            stopAutoRefresh();
        }
        hideSettingsModal();
        showMessage('设置已保存', 'success');
    } catch (error) {
        console.error('保存设置失败:', error);
        showMessage('保存设置失败', 'error');
    }
}

// 自动刷新
function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    if (isAutoRefresh) {
        refreshInterval = setInterval(() => loadHistory(false), 30000); // 30秒刷新一次，不进行分类
    }
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

// 加载历史记录
async function loadHistory(shouldClassify = false) {
    showLoading();
    
    try {
        console.log('开始加载历史记录...');
        
        // 检查chrome API是否可用
        if (typeof chrome === 'undefined' || !chrome.history) {
            throw new Error('Chrome History API 不可用');
        }
        
        // 获取最近5000条历史记录
        const history = await chrome.history.search({
            text: '',
            maxResults: 5000,
            startTime: 0
        });
        
        console.log('获取到历史记录数量:', history.length);
        
        currentHistory = history.map(item => ({
            id: item.id,
            title: item.title || '无标题',
            url: item.url,
            visitCount: item.visitCount || 1,
            lastVisitTime: item.lastVisitTime,
            starred: false,
            tags: [],
            category: categorizeUrl(item.url, item.title || '无标题')
        }));
        
        // 从存储中加载用户标记
        await loadUserMarks();
        
        // 只有在明确要求时才进行分类
        if (shouldClassify) {
            await classifyHistoryWithGemini();
        }
        
        // 更新统计信息
        updateStats();
        
        applyFilters();
        hideLoading();
        
        console.log('历史记录加载完成');
    } catch (error) {
        console.error('加载历史记录失败:', error);
        showError('加载历史记录失败: ' + error.message);
        hideLoading();
    }
}

// 类别识别函数
function categorizeUrl(url, title) {
    const urlLower = url.toLowerCase();
    const titleLower = title.toLowerCase();
    
    // 工作相关
    if (urlLower.includes('linkedin.com') || 
        urlLower.includes('github.com') || 
        urlLower.includes('stackoverflow.com') ||
        urlLower.includes('jira.') ||
        urlLower.includes('confluence.') ||
        urlLower.includes('slack.com') ||
        urlLower.includes('teams.microsoft.com') ||
        urlLower.includes('zoom.us') ||
        urlLower.includes('meet.google.com') ||
        titleLower.includes('工作') ||
        titleLower.includes('项目') ||
        titleLower.includes('会议') ||
        titleLower.includes('office') ||
        titleLower.includes('work')) {
        return 'work';
    }
    
    // 娱乐相关
    if (urlLower.includes('youtube.com') ||
        urlLower.includes('netflix.com') ||
        urlLower.includes('bilibili.com') ||
        urlLower.includes('iqiyi.com') ||
        urlLower.includes('youku.com') ||
        urlLower.includes('twitch.tv') ||
        urlLower.includes('steam.com') ||
        urlLower.includes('epicgames.com') ||
        urlLower.includes('playstation.com') ||
        urlLower.includes('xbox.com') ||
        titleLower.includes('游戏') ||
        titleLower.includes('电影') ||
        titleLower.includes('视频') ||
        titleLower.includes('娱乐') ||
        titleLower.includes('music') ||
        titleLower.includes('game')) {
        return 'entertainment';
    }
    
    // 购物相关
    if (urlLower.includes('taobao.com') ||
        urlLower.includes('tmall.com') ||
        urlLower.includes('jd.com') ||
        urlLower.includes('amazon.com') ||
        urlLower.includes('ebay.com') ||
        urlLower.includes('alibaba.com') ||
        urlLower.includes('shopify.com') ||
        urlLower.includes('shopee.') ||
        urlLower.includes('lazada.') ||
        titleLower.includes('购物') ||
        titleLower.includes('商城') ||
        titleLower.includes('商店') ||
        titleLower.includes('购买') ||
        titleLower.includes('shop') ||
        titleLower.includes('buy')) {
        return 'shopping';
    }
    
    // 资讯相关
    if (urlLower.includes('news.') ||
        urlLower.includes('cnn.com') ||
        urlLower.includes('bbc.com') ||
        urlLower.includes('reuters.com') ||
        urlLower.includes('sina.com.cn') ||
        urlLower.includes('sohu.com') ||
        urlLower.includes('163.com') ||
        urlLower.includes('qq.com') ||
        urlLower.includes('zhihu.com') ||
        urlLower.includes('reddit.com') ||
        titleLower.includes('新闻') ||
        titleLower.includes('资讯') ||
        titleLower.includes('头条') ||
        titleLower.includes('news') ||
        titleLower.includes('article')) {
        return 'news';
    }
    
    // 社交相关
    if (urlLower.includes('facebook.com') ||
        urlLower.includes('twitter.com') ||
        urlLower.includes('instagram.com') ||
        urlLower.includes('weibo.com') ||
        urlLower.includes('douyin.com') ||
        urlLower.includes('tiktok.com') ||
        urlLower.includes('discord.com') ||
        urlLower.includes('telegram.org') ||
        urlLower.includes('whatsapp.com') ||
        titleLower.includes('社交') ||
        titleLower.includes('朋友圈') ||
        titleLower.includes('微博') ||
        titleLower.includes('social') ||
        titleLower.includes('chat')) {
        return 'social';
    }
    
    // 鉴权相关
    if (urlLower.includes('login') ||
        urlLower.includes('signin') ||
        urlLower.includes('auth') ||
        urlLower.includes('oauth') ||
        urlLower.includes('sso') ||
        urlLower.includes('passport') ||
        urlLower.includes('account') ||
        urlLower.includes('profile') ||
        urlLower.includes('settings') ||
        urlLower.includes('admin') ||
        titleLower.includes('登录') ||
        titleLower.includes('注册') ||
        titleLower.includes('账户') ||
        titleLower.includes('设置') ||
        titleLower.includes('管理') ||
        titleLower.includes('login') ||
        titleLower.includes('signin')) {
        return 'auth';
    }
    
    return 'other';
}

// 从存储中加载用户标记
async function loadUserMarks() {
    try {
        const result = await chrome.storage.local.get(['historyMarks']);
        if (result.historyMarks) {
            const marks = result.historyMarks;
            currentHistory.forEach(item => {
                if (marks[item.id]) {
                    item.starred = marks[item.id].starred || false;
                    item.tags = marks[item.id].tags || [];
                }
            });
        }
    } catch (error) {
        console.error('加载用户标记失败:', error);
    }
}

// 使用 Gemini API 对历史记录进行分类
async function classifyHistoryWithGemini() {
    try {
        // 检查是否有 Gemini API Key
        const result = await chrome.storage.local.get(['geminiApiKey']);
        const apiKey = result.geminiApiKey;
        
        if (!apiKey || !apiKey.trim()) {
            console.log('未设置 Gemini API Key，跳过自动分类');
            return;
        }
        
        // 检查是否有 GeminiClassifier 可用
        if (typeof window.GeminiClassifier === 'undefined') {
            console.log('GeminiClassifier 未加载，跳过自动分类');
            return;
        }
        
        // 检查是否已经分类过（避免重复分类）
        const classificationCheck = await chrome.storage.local.get(['hasClassified']);
        if (classificationCheck.hasClassified) {
            console.log('历史记录已经分类过，跳过自动分类');
            return;
        }
        
        // 获取需要分类的标题（只分类前100条，避免API调用过长）
        const titlesToClassify = currentHistory.slice(0, 100).map(item => item.title);
        
        if (titlesToClassify.length === 0) {
            return;
        }
        
        console.log(`开始使用 Gemini API 分类 ${titlesToClassify.length} 条历史记录...`);
        
        // 调用 Gemini API 进行分类
        const classificationResult = await window.GeminiClassifier.classifyTitles(titlesToClassify, apiKey);
        
        if (classificationResult && classificationResult.items) {
            // 更新历史记录的类别
            classificationResult.items.forEach((classifiedItem, index) => {
                if (currentHistory[index]) {
                    currentHistory[index].category = classifiedItem.category;
                }
            });
            
            // 标记已经分类过
            await chrome.storage.local.set({ hasClassified: true });
            
            console.log('Gemini API 分类完成');
            showMessage(`已使用 AI 分类 ${classificationResult.items.length} 条历史记录`, 'success');
        }
        
    } catch (error) {
        console.error('Gemini API 分类失败:', error);
        showMessage('AI 分类失败: ' + error.message, 'error');
    }
}

// 手动触发分类
async function handleManualClassification() {
    if (!geminiApiKeyInput || !geminiApiKeyInput.value.trim()) {
        showMessage('请先设置 Gemini API Key', 'error');
        return;
    }
    
    if (currentHistory.length === 0) {
        showMessage('暂无历史记录可分类', 'error');
        return;
    }
    
    if (typeof window.GeminiClassifier === 'undefined') {
        showMessage('AI 分类功能未加载，请刷新页面重试', 'error');
        return;
    }
    
    // 禁用按钮，显示加载状态
    classifyBtn.disabled = true;
    classifyBtn.innerHTML = '<span class="btn-icon">⏳</span>分类中...';
    
    try {
        // 获取所有历史记录的标题进行分类
        const titlesToClassify = currentHistory.map(item => item.title);
        
        console.log(`开始手动分类 ${titlesToClassify.length} 条历史记录...`);
        
        // 调用 Gemini API 进行分类
        const classificationResult = await window.GeminiClassifier.classifyTitles(titlesToClassify, geminiApiKeyInput.value.trim());
        
        if (classificationResult && classificationResult.items) {
            // 更新历史记录的类别
            classificationResult.items.forEach((classifiedItem, index) => {
                if (currentHistory[index]) {
                    currentHistory[index].category = classifiedItem.category;
                }
            });
            
            // 标记已经分类过
            await chrome.storage.local.set({ hasClassified: true });
            
            // 更新统计和显示
            updateStats();
            applyFilters();
            
            console.log('手动分类完成');
            showMessage(`已使用 AI 重新分类 ${classificationResult.items.length} 条历史记录`, 'success');
        }
        
    } catch (error) {
        console.error('手动分类失败:', error);
        showMessage('AI 分类失败: ' + error.message, 'error');
    } finally {
        // 恢复按钮状态
        classifyBtn.disabled = false;
        classifyBtn.innerHTML = '<span class="btn-icon">🤖</span>使用 AI 重新分类历史记录';
    }
}

// 从主页面保存 API Key
async function saveApiKeyFromMain() {
    if (!mainApiKeyInput || !mainApiKeyInput.value.trim()) {
        showMessage('请输入 Gemini API Key', 'error');
        return;
    }
    
    try {
        const apiKey = mainApiKeyInput.value.trim();
        await chrome.storage.local.set({ geminiApiKey: apiKey });
        
        // 同步到设置页面的输入框
        if (geminiApiKeyInput) {
            geminiApiKeyInput.value = apiKey;
        }
        
        showMessage('API Key 已保存', 'success');
    } catch (error) {
        console.error('保存 API Key 失败:', error);
        showMessage('保存 API Key 失败', 'error');
    }
}

// 从主页面立即分类
async function classifyNowFromMain() {
    if (!mainApiKeyInput || !mainApiKeyInput.value.trim()) {
        showMessage('请先输入 Gemini API Key', 'error');
        return;
    }
    
    if (currentHistory.length === 0) {
        showMessage('暂无历史记录可分类', 'error');
        return;
    }
    
    if (typeof window.GeminiClassifier === 'undefined') {
        showMessage('AI 分类功能未加载，请刷新页面重试', 'error');
        return;
    }
    
    // 先保存 API Key
    await saveApiKeyFromMain();
    
    // 禁用按钮，显示加载状态
    classifyNowBtn.disabled = true;
    classifyNowBtn.innerHTML = '<span class="search-icon">⏳</span>';
    
    try {
        // 获取所有历史记录的标题进行分类
        const titlesToClassify = currentHistory.map(item => item.title);
        
        console.log(`开始从主页面分类 ${titlesToClassify.length} 条历史记录...`);
        
        // 调用 Gemini API 进行分类
        const classificationResult = await window.GeminiClassifier.classifyTitles(titlesToClassify, mainApiKeyInput.value.trim());
        
        if (classificationResult && classificationResult.items) {
            // 更新历史记录的类别
            classificationResult.items.forEach((classifiedItem, index) => {
                if (currentHistory[index]) {
                    currentHistory[index].category = classifiedItem.category;
                }
            });
            
            // 标记已经分类过
            await chrome.storage.local.set({ hasClassified: true });
            
            // 更新统计和显示
            updateStats();
            applyFilters();
            
            console.log('主页面分类完成');
            showMessage(`已使用 AI 分类 ${classificationResult.items.length} 条历史记录`, 'success');
        }
        
    } catch (error) {
        console.error('主页面分类失败:', error);
        showMessage('AI 分类失败: ' + error.message, 'error');
    } finally {
        // 恢复按钮状态
        classifyNowBtn.disabled = false;
        classifyNowBtn.innerHTML = '<span class="search-icon">🤖</span>';
    }
}

// 清除分类标记
async function clearClassificationMark() {
    try {
        await chrome.storage.local.remove(['hasClassified']);
        showMessage('分类标记已清除，下次加载时将重新分类', 'success');
    } catch (error) {
        console.error('清除分类标记失败:', error);
        showMessage('清除分类标记失败', 'error');
    }
}

// 保存用户标记到存储
async function saveUserMarks() {
    try {
        const marks = {};
        currentHistory.forEach(item => {
            if (item.starred || item.tags.length > 0) {
                marks[item.id] = {
                    starred: item.starred,
                    tags: item.tags
                };
            }
        });
        await chrome.storage.local.set({ historyMarks: marks });
    } catch (error) {
        console.error('保存用户标记失败:', error);
    }
}

// 设置类别过滤
function setCategoryFilter(category) {
    categoryFilter = category;
    
    // 更新选项卡状态
    categoryTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-category') === category) {
            tab.classList.add('active');
        }
    });
    
    applyFilters();
}

// 更新统计信息
function updateStats() {
    const total = currentHistory.length;
    const starred = currentHistory.filter(item => item.starred).length;
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const todayCount = currentHistory.filter(item => item.lastVisitTime >= todayStart).length;
    
    totalCountEl.textContent = total.toLocaleString();
    starredCountEl.textContent = starred.toLocaleString();
    todayCountEl.textContent = todayCount.toLocaleString();
    
    // 更新类别统计
    updateCategoryStats();
}

// 更新类别统计
function updateCategoryStats() {
    const categories = ['all', 'work', 'entertainment', 'shopping', 'news', 'social', 'auth'];
    
    categories.forEach(category => {
        const countEl = document.getElementById(category + 'Count');
        if (countEl) {
            let count = 0;
            if (category === 'all') {
                count = currentHistory.length;
            } else {
                count = currentHistory.filter(item => item.category === category).length;
            }
            countEl.textContent = count.toLocaleString();
        }
    });
}

// 应用过滤条件
function applyFilters() {
    filteredHistory = currentHistory.filter(item => {
        // 搜索过滤
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesTitle = item.title.toLowerCase().includes(query);
            const matchesUrl = item.url.toLowerCase().includes(query);
            if (!matchesTitle && !matchesUrl) {
                return false;
            }
        }
        
        // 类别过滤
        if (categoryFilter !== 'all') {
            if (item.category !== categoryFilter) {
                return false;
            }
        }
        
        // 日期过滤
        if (dateFilter !== 'all') {
            const now = new Date();
            const itemDate = new Date(item.lastVisitTime);
            
            switch (dateFilter) {
                case 'today':
                    if (itemDate.toDateString() !== now.toDateString()) {
                        return false;
                    }
                    break;
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    if (itemDate < weekAgo) {
                        return false;
                    }
                    break;
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    if (itemDate < monthAgo) {
                        return false;
                    }
                    break;
                case 'year':
                    const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    if (itemDate < yearAgo) {
                        return false;
                    }
                    break;
            }
        }
        
        return true;
    });
    
    applySorting();
    currentPage = 1;
    renderHistory();
}

// 应用排序
function applySorting() {
    filteredHistory.sort((a, b) => {
        switch (sortFilter) {
            case 'time-desc':
                return b.lastVisitTime - a.lastVisitTime;
            case 'time-asc':
                return a.lastVisitTime - b.lastVisitTime;
            case 'title-asc':
                return a.title.localeCompare(b.title);
            case 'title-desc':
                return b.title.localeCompare(a.title);
            case 'visits-desc':
                return b.visitCount - a.visitCount;
            default:
                return b.lastVisitTime - a.lastVisitTime;
        }
    });
}

// 处理搜索
function handleSearch() {
    searchQuery = searchInput.value.trim();
    applyFilters();
}

// 设置视图模式
function setViewMode(mode) {
    viewMode = mode;
    historyList.className = `history-list ${mode}-view`;
    
    if (mode === 'grid') {
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    } else {
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
    }
    
    renderHistory();
}

// 渲染历史记录
function renderHistory() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageHistory = filteredHistory.slice(startIndex, endIndex);
    
    if (pageHistory.length === 0) {
        historyList.innerHTML = '';
        noResults.style.display = 'block';
        recordCountEl.textContent = '显示 0 条记录';
        return;
    }
    
    noResults.style.display = 'none';
    filteredCountEl.textContent = filteredHistory.length.toLocaleString();
    recordCountEl.textContent = `显示 ${startIndex + 1}-${Math.min(endIndex, filteredHistory.length)} 条记录，共 ${filteredHistory.length} 条`;
    
    historyList.innerHTML = pageHistory.map(item => createHistoryItemHTML(item)).join('');
    
    // 添加事件监听器
    addHistoryItemListeners();
    
    // 更新分页
    updatePagination();
}

// 创建历史记录项HTML
function createHistoryItemHTML(item) {
    const visitTime = new Date(item.lastVisitTime);
    const timeString = formatTime(visitTime);
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(item.url).hostname}&sz=16`;
    
    // 类别图标映射
    const categoryIcons = {
        'work': '💼',
        'entertainment': '🎮',
        'shopping': '🛒',
        'news': '📰',
        'social': '👥',
        'auth': '🔐',
        'other': '📄'
    };
    
    const categoryNames = {
        'work': '工作',
        'entertainment': '娱乐',
        'shopping': '购物',
        'news': '资讯',
        'social': '社交',
        'auth': '鉴权',
        'other': '其他'
    };
    
    const categoryIcon = categoryIcons[item.category] || '📄';
    const categoryName = categoryNames[item.category] || '其他';
    
    return `
        <div class="history-item" data-id="${item.id}" data-category="${item.category}">
            <div class="history-item-header">
                <a href="${item.url}" class="history-title" target="_blank" title="${item.title}">
                    ${viewMode === 'grid' ? `<img src="${faviconUrl}" alt="" class="favicon" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle;">` : ''}
                    ${item.title}
                </a>
                <div class="history-actions">
                    <button class="action-btn star-btn ${item.starred ? 'starred' : ''}" 
                            data-id="${item.id}" title="${item.starred ? '取消标记' : '标记重要'}">
                        ${item.starred ? '★' : '☆'}
                    </button>
                    <button class="action-btn delete-btn" data-id="${item.id}" title="删除">
                        ×
                    </button>
                </div>
            </div>
            <div class="history-url" title="${item.url}">${item.url}</div>
            <div class="history-meta">
                <span class="history-time">${timeString}</span>
                <span>访问 ${item.visitCount} 次</span>
                <span class="history-category" title="类别: ${categoryName}">
                    ${categoryIcon} ${categoryName}
                </span>
                ${item.tags.length > 0 ? `<div class="history-tags">${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
            </div>
        </div>
    `;
}

// 添加历史记录项事件监听器
function addHistoryItemListeners() {
    // 删除按钮
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.getAttribute('data-id');
            deleteHistoryItem(id);
        });
    });
    
    // 星标按钮
    document.querySelectorAll('.star-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.getAttribute('data-id');
            toggleStar(id);
        });
    });
}

// 删除历史记录项
async function deleteHistoryItem(id) {
    if (confirm('确定要删除这条历史记录吗？')) {
        try {
            const item = currentHistory.find(item => item.id === id);
            if (item) {
                await chrome.history.deleteUrl({ url: item.url });
                
                // 从当前历史记录中移除
                currentHistory = currentHistory.filter(item => item.id !== id);
                updateStats();
                applyFilters();
                
                showMessage('删除成功', 'success');
            }
        } catch (error) {
            console.error('删除失败:', error);
            showMessage('删除失败', 'error');
        }
    }
}

// 切换星标
async function toggleStar(id) {
    const item = currentHistory.find(item => item.id === id);
    if (item) {
        item.starred = !item.starred;
        await saveUserMarks();
        updateStats();
        renderHistory();
    }
}

// 清空所有历史记录
async function clearAllHistory() {
    if (confirm('确定要清空所有历史记录吗？此操作不可恢复！')) {
        try {
            // 获取所有历史记录
            const allHistory = await chrome.history.search({ text: '', maxResults: 0 });
            
            // 删除所有URL
            for (const item of allHistory) {
                await chrome.history.deleteUrl({ url: item.url });
            }
            
            currentHistory = [];
            updateStats();
            applyFilters();
            showMessage('已清空所有历史记录', 'success');
        } catch (error) {
            console.error('清空失败:', error);
            showMessage('清空失败', 'error');
        }
    }
}

// 分页功能
function changePage(direction) {
    const totalPages = getTotalPages();
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        goToPage(newPage);
    }
}

function goToPage(page) {
    const totalPages = getTotalPages();
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderHistory();
    }
}

function getTotalPages() {
    return Math.ceil(filteredHistory.length / itemsPerPage);
}

function updatePagination() {
    const totalPages = getTotalPages();
    
    // 更新按钮状态
    firstPageBtn.disabled = currentPage <= 1;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
    lastPageBtn.disabled = currentPage >= totalPages;
    
    // 更新页面信息
    pageInfo.textContent = `第 ${currentPage} 页，共 ${totalPages} 页`;
    
    // 生成页码按钮
    generatePageNumbers(totalPages);
}

function generatePageNumbers(totalPages) {
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    let pageNumbersHTML = '';
    
    for (let i = startPage; i <= endPage; i++) {
        pageNumbersHTML += `
            <button class="page-number ${i === currentPage ? 'active' : ''}" 
                    onclick="goToPage(${i})">${i}</button>
        `;
    }
    
    pageNumbers.innerHTML = pageNumbersHTML;
}

// 导出功能
function showExportModal() {
    exportModal.style.display = 'block';
}

function hideExportModal() {
    exportModal.style.display = 'none';
}

async function handleExport() {
    const format = document.querySelector('input[name="exportFormat"]:checked').value;
    const range = document.querySelector('input[name="exportRange"]:checked').value;
    
    try {
        const dataToExport = range === 'all' ? currentHistory : filteredHistory;
        
        if (format === 'csv') {
            exportToCSV(dataToExport);
        } else {
            exportToJSON(dataToExport);
        }
        hideExportModal();
        showMessage('导出成功', 'success');
    } catch (error) {
        console.error('导出失败:', error);
        showMessage('导出失败', 'error');
    }
}

function exportToCSV(data) {
    const headers = ['标题', 'URL', '访问次数', '最后访问时间', '标记'];
    const csvContent = [
        headers.join(','),
        ...data.map(item => [
            `"${item.title.replace(/"/g, '""')}"`,
            `"${item.url}"`,
            item.visitCount,
            `"${new Date(item.lastVisitTime).toLocaleString()}"`,
            item.starred ? '是' : '否'
        ].join(','))
    ].join('\n');
    
    downloadFile(csvContent, 'browser-history.csv', 'text/csv');
}

function exportToJSON(data) {
    const jsonData = data.map(item => ({
        title: item.title,
        url: item.url,
        visitCount: item.visitCount,
        lastVisitTime: new Date(item.lastVisitTime).toISOString(),
        starred: item.starred,
        tags: item.tags
    }));
    
    downloadFile(JSON.stringify(jsonData, null, 2), 'browser-history.json', 'application/json');
}

// 导出标题 JSON（用于离线到 Node 端分类）
function exportTitlesJSON() {
    try {
        if (!currentHistory || currentHistory.length === 0) {
            showMessage('暂无历史记录可导出', 'error');
            return;
        }
        const titles = filteredHistory && filteredHistory.length > 0
            ? filteredHistory.map(i => i.title)
            : currentHistory.map(i => i.title);
        const content = JSON.stringify(titles, null, 2);
        downloadFile(content, 'history-titles.json', 'application/json');
        showMessage('已导出标题列表', 'success');
    } catch (error) {
        console.error('导出标题失败:', error);
        showMessage('导出标题失败', 'error');
    }
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 设置模态框
function showSettingsModal() {
    settingsModal.style.display = 'block';
}

function hideSettingsModal() {
    settingsModal.style.display = 'none';
}

// 帮助功能
function showHelp() {
    alert(`Browser History Manager 使用帮助：

1. 搜索功能：在搜索框中输入关键词，可以搜索标题或URL
2. 时间过滤：选择时间范围快速筛选历史记录
3. 排序功能：按时间、标题或访问次数排序
4. 视图模式：网格视图和列表视图切换
5. 标记功能：点击星标按钮标记重要记录
6. 删除功能：点击删除按钮移除不需要的记录
7. 导出功能：支持CSV和JSON格式导出
8. 自动刷新：每30秒自动刷新历史记录

更多功能请查看设置页面。`);
}

// 工具函数
function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // 1分钟内
        return '刚刚';
    } else if (diff < 3600000) { // 1小时内
        return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 24小时内
        return `${Math.floor(diff / 3600000)}小时前`;
    } else if (diff < 604800000) { // 7天内
        return `${Math.floor(diff / 86400000)}天前`;
    } else {
        return date.toLocaleDateString();
    }
}

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

function showLoading() {
    loadingIndicator.style.display = 'flex';
    historyList.style.display = 'none';
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
    historyList.style.display = 'block';
}

function showMessage(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }
    }, 3000);
}

function showError(message) {
    showMessage(message, 'error');
}

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});
