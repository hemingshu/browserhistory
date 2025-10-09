// 全局变量
let currentHistory = [];
let filteredHistory = [];
let currentPage = 1;
let itemsPerPage = 20;
let searchQuery = '';
let dateFilter = 'all';
let sortFilter = 'time-desc';
let viewMode = 'grid'; // 'grid' or 'list'
let isAutoRefresh = false;
let refreshInterval = null;
let categoryFilter = 'all'; // 新增类别过滤
let currentLanguage = 'zh'; // 当前语言：'zh' 或 'en'

// 语言数据
const translations = {
    zh: {
        // 页面标题
        pageTitle: 'Browser History Manager - 浏览历史记录',
        appTitle: '浏览历史记录管理器',
        
        // 按钮
        refresh: '刷新',
        exportTitles: '导出标题',
        export: '导出',
        clearAll: '清空全部',
        
        // 搜索和过滤
        searchPlaceholder: '搜索历史记录...',
        apiKeyPlaceholder: '输入 Gemini API Key 启用 AI 分类...',
        saveApiKey: '保存 API Key',
        classifyNow: '立即分类',
        
        // 时间过滤
        allTime: '全部时间',
        today: '今天',
        thisWeek: '本周',
        thisMonth: '本月',
        thisYear: '今年',
        
        // 排序
        timeDesc: '按时间倒序',
        timeAsc: '按时间正序',
        titleAsc: '按标题A-Z',
        titleDesc: '按标题Z-A',
        visitsDesc: '按访问次数',
        
        // 类别
        all: '全部',
        work: '工作',
        entertainment: '娱乐',
        shopping: '购物',
        news: '资讯',
        social: '社交',
        auth: '鉴权',
        
        // 统计
        totalRecords: '总记录数',
        filteredResults: '筛选结果',
        starredItems: '重要标记',
        todayVisits: '今日访问',
        
        // 主内容
        historyList: '历史记录列表',
        showingRecords: '显示 0 条记录',
        gridView: '网格视图',
        listView: '列表视图',
        
        // 加载和结果
        loadingHistory: '正在加载历史记录...',
        noResults: '没有找到匹配的历史记录',
        tryAdjustingFilters: '尝试调整搜索条件或过滤选项',
        
        // 分页
        pageInfo: '第 1 页，共 1 页',
        firstPage: '首页',
        prevPage: '上一页',
        nextPage: '下一页',
        lastPage: '末页',
        itemsPerPage: '每页显示：',
        items10: '10条',
        items20: '20条',
        items50: '50条',
        items100: '100条',
        
        // 底部
        footerText: 'Browser History Manager v1.0.0 | 管理您的浏览历史记录',
        settings: '设置',
        help: '帮助',
        
        // 导出模态框
        exportHistory: '导出历史记录',
        exportFormat: '导出格式',
        csvFormat: 'CSV格式 (Excel兼容)',
        jsonFormat: 'JSON格式 (程序兼容)',
        exportRange: '导出范围',
        currentFilter: '当前筛选结果',
        allHistory: '全部历史记录',
        confirmExport: '确认导出',
        cancel: '取消',
        
        // 设置模态框
        autoRefresh: '自动刷新历史记录',
        showVisits: '显示访问次数',
        showFavicon: '显示网站图标',
        geminiApiKey: 'Gemini API Key（仅本机保存）',
        apiKeyPlaceholderSettings: '请输入 Gemini API Key',
        apiKeyHint: '用于分类时在本机使用，扩展不会将密钥上传至任何服务器。',
        reclassifyWithAI: '使用 AI 重新分类历史记录',
        clearClassification: '清除分类标记（下次加载时重新分类）',
        saveSettings: '保存设置',
        
        // 历史记录项
        unstar: '取消标记',
        star: '标记重要',
        delete: '删除',
        visits: '访问 {count} 次',
        category: '类别: {name}',
        confirmDelete: '确定要删除这条历史记录吗？',
        deleteSuccess: '删除成功',
        deleteFailed: '删除失败',
        
        // 时间格式
        justNow: '刚刚',
        minutesAgo: '{count}分钟前',
        hoursAgo: '{count}小时前',
        daysAgo: '{count}天前'
    },
    en: {
        // 页面标题
        pageTitle: 'Browser History Manager - Browse History',
        appTitle: 'Browser History Manager',
        
        // 按钮
        refresh: 'Refresh',
        exportTitles: 'Export Titles',
        export: 'Export',
        clearAll: 'Clear All',
        
        // 搜索和过滤
        searchPlaceholder: 'Search history...',
        apiKeyPlaceholder: 'Enter Gemini API Key to enable AI classification...',
        saveApiKey: 'Save API Key',
        classifyNow: 'Classify Now',
        
        // 时间过滤
        allTime: 'All Time',
        today: 'Today',
        thisWeek: 'This Week',
        thisMonth: 'This Month',
        thisYear: 'This Year',
        
        // 排序
        timeDesc: 'Time (Newest First)',
        timeAsc: 'Time (Oldest First)',
        titleAsc: 'Title (A-Z)',
        titleDesc: 'Title (Z-A)',
        visitsDesc: 'Visit Count',
        
        // 类别
        all: 'All',
        work: 'Work',
        entertainment: 'Entertainment',
        shopping: 'Shopping',
        news: 'News',
        social: 'Social',
        auth: 'Auth',
        
        // 统计
        totalRecords: 'Total Records',
        filteredResults: 'Filtered Results',
        starredItems: 'Starred Items',
        todayVisits: 'Today\'s Visits',
        
        // 主内容
        historyList: 'History List',
        showingRecords: 'Showing 0 records',
        gridView: 'Grid View',
        listView: 'List View',
        
        // 加载和结果
        loadingHistory: 'Loading history...',
        noResults: 'No matching history found',
        tryAdjustingFilters: 'Try adjusting search criteria or filter options',
        
        // 分页
        pageInfo: 'Page 1 of 1',
        firstPage: 'First',
        prevPage: 'Previous',
        nextPage: 'Next',
        lastPage: 'Last',
        itemsPerPage: 'Items per page:',
        items10: '10 items',
        items20: '20 items',
        items50: '50 items',
        items100: '100 items',
        
        // 底部
        footerText: 'Browser History Manager v1.0.0 | Manage Your Browse History',
        settings: 'Settings',
        help: 'Help',
        
        // 导出模态框
        exportHistory: 'Export History',
        exportFormat: 'Export Format',
        csvFormat: 'CSV Format (Excel Compatible)',
        jsonFormat: 'JSON Format (Program Compatible)',
        exportRange: 'Export Range',
        currentFilter: 'Current Filter Results',
        allHistory: 'All History',
        confirmExport: 'Confirm Export',
        cancel: 'Cancel',
        
        // 设置模态框
        autoRefresh: 'Auto Refresh History',
        showVisits: 'Show Visit Count',
        showFavicon: 'Show Website Icons',
        geminiApiKey: 'Gemini API Key (Local Only)',
        apiKeyPlaceholderSettings: 'Please enter Gemini API Key',
        apiKeyHint: 'Used for classification locally, extension will not upload the key to any server.',
        reclassifyWithAI: 'Reclassify History with AI',
        clearClassification: 'Clear Classification Tags (Reclassify on Next Load)',
        saveSettings: 'Save Settings',
        
        // 历史记录项
        unstar: 'Unstar',
        star: 'Star',
        delete: 'Delete',
        visits: 'Visited {count} times',
        category: 'Category: {name}',
        confirmDelete: 'Are you sure you want to delete this history record?',
        deleteSuccess: 'Delete successful',
        deleteFailed: 'Delete failed',
        
        // 时间格式
        justNow: 'Just now',
        minutesAgo: '{count} minutes ago',
        hoursAgo: '{count} hours ago',
        daysAgo: '{count} days ago'
    }
};

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

// 语言切换相关元素
const languageBtn = document.getElementById('languageBtn');
const languageText = document.getElementById('languageText');
const pageTitle = document.getElementById('pageTitle');
const footerText = document.getElementById('footerText');

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
    initializeLanguage();
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
    
    // 语言切换
    languageBtn.addEventListener('click', toggleLanguage);
    
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
        // const classificationCheck = await chrome.storage.local.get(['hasClassified']);
        // if (classificationCheck.hasClassified) {
        //     console.log('历史记录已经分类过，跳过自动分类');
        //     return;
        // }
        
        // 获取需要分类的标题（只分类前1000条，避免API调用过长）
        const titlesToClassify = currentHistory.slice(0, 1000).map(item => item.title);
        
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
        updateRecordCount();
        return;
    }
    
    noResults.style.display = 'none';
    filteredCountEl.textContent = filteredHistory.length.toLocaleString();
    updateRecordCount();
    
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
    
    const t = translations[currentLanguage];
    const categoryNames = {
        'work': t.work,
        'entertainment': t.entertainment,
        'shopping': t.shopping,
        'news': t.news,
        'social': t.social,
        'auth': t.auth,
        'other': t.all
    };
    
    const categoryIcon = categoryIcons[item.category] || '📄';
    const categoryName = categoryNames[item.category] || t.all;
    
    return `
        <div class="history-item" data-id="${item.id}" data-category="${item.category}">
            <div class="history-item-header">
                <a href="${item.url}" class="history-title" target="_blank" title="${item.title}">
                    ${viewMode === 'grid' ? `<img src="${faviconUrl}" alt="" class="favicon" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle;">` : ''}
                    ${item.title}
                </a>
                <div class="history-actions">
                    <button class="action-btn star-btn ${item.starred ? 'starred' : ''}" 
                            data-id="${item.id}" title="${item.starred ? t.unstar : t.star}">
                        ${item.starred ? '★' : '☆'}
                    </button>
                    <button class="action-btn delete-btn" data-id="${item.id}" title="${t.delete}">
                        ×
                    </button>
                </div>
            </div>
            <div class="history-url" title="${item.url}">${item.url}</div>
            <div class="history-meta">
                <span class="history-time">${timeString}</span>
                <span>${t.visits.replace('{count}', item.visitCount)}</span>
                <span class="history-category" title="${t.category.replace('{name}', categoryName)}">
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
    const t = translations[currentLanguage];
    if (confirm(t.confirmDelete)) {
        try {
            const item = currentHistory.find(item => item.id === id);
            if (item) {
                await chrome.history.deleteUrl({ url: item.url });
                
                // 从当前历史记录中移除
                currentHistory = currentHistory.filter(item => item.id !== id);
                updateStats();
                applyFilters();
                
                showMessage(t.deleteSuccess, 'success');
            }
        } catch (error) {
            console.error('删除失败:', error);
            showMessage(t.deleteFailed, 'error');
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
    updatePageInfo();
    
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
    const t = translations[currentLanguage];
    
    if (diff < 60000) { // 1分钟内
        return t.justNow;
    } else if (diff < 3600000) { // 1小时内
        return t.minutesAgo.replace('{count}', Math.floor(diff / 60000));
    } else if (diff < 86400000) { // 24小时内
        return t.hoursAgo.replace('{count}', Math.floor(diff / 3600000));
    } else if (diff < 604800000) { // 7天内
        return t.daysAgo.replace('{count}', Math.floor(diff / 86400000));
    } else {
        // 使用当前语言的日期格式
        return date.toLocaleDateString(currentLanguage === 'zh' ? 'zh-CN' : 'en-US');
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

// 语言切换相关函数
function initializeLanguage() {
    // 从localStorage加载保存的语言设置
    const savedLanguage = localStorage.getItem('browserHistoryLanguage');
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
        currentLanguage = savedLanguage;
    }
    
    // 应用当前语言
    applyLanguage();
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
    localStorage.setItem('browserHistoryLanguage', currentLanguage);
    applyLanguage();
    // 重新渲染历史记录列表以更新语言
    renderHistory();
}

function applyLanguage() {
    const t = translations[currentLanguage];
    
    // 更新页面标题
    if (pageTitle) {
        pageTitle.textContent = t.pageTitle;
    }
    
    // 更新语言按钮文本
    if (languageText) {
        languageText.textContent = currentLanguage === 'zh' ? '中文' : 'EN';
    }
    
    // 更新所有带有data-i18n属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (t[key]) {
            element.textContent = t[key];
        }
    });
    
    // 更新placeholder属性
    document.querySelectorAll('[data-placeholder-zh]').forEach(element => {
        const placeholder = currentLanguage === 'zh' ? 
            element.getAttribute('data-placeholder-zh') : 
            element.getAttribute('data-placeholder-en');
        if (placeholder) {
            element.placeholder = placeholder;
        }
    });
    
    // 更新title属性
    document.querySelectorAll('[data-title-zh]').forEach(element => {
        const title = currentLanguage === 'zh' ? 
            element.getAttribute('data-title-zh') : 
            element.getAttribute('data-title-en');
        if (title) {
            element.title = title;
        }
    });
    
    // 更新底部文本
    if (footerText) {
        footerText.textContent = t.footerText;
    }
    
    // 更新HTML lang属性
    document.documentElement.lang = currentLanguage === 'zh' ? 'zh-CN' : 'en';
    
    // 更新分页信息
    updatePageInfo();
}

// 更新分页信息的语言
function updatePageInfo() {
    if (!pageInfo) return;
    
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const t = translations[currentLanguage];
    
    if (currentLanguage === 'zh') {
        pageInfo.textContent = `第 ${currentPage} 页，共 ${totalPages} 页`;
    } else {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    }
}

// 更新记录计数显示的语言
function updateRecordCount() {
    if (!recordCountEl) return;
    
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, filteredHistory.length);
    const t = translations[currentLanguage];
    
    if (currentLanguage === 'zh') {
        recordCountEl.textContent = `显示 ${start}-${end} 条记录，共 ${filteredHistory.length} 条`;
    } else {
        recordCountEl.textContent = `Showing ${start}-${end} of ${filteredHistory.length} records`;
    }
}
