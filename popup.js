// 全局变量
let currentHistory = [];
let filteredHistory = [];
let currentPage = 1;
const itemsPerPage = 10;
let searchQuery = '';
let dateFilter = 'all';

// DOM元素
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const dateFilterSelect = document.getElementById('dateFilter');
const refreshBtn = document.getElementById('refreshBtn');
const exportBtn = document.getElementById('exportBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const historyList = document.getElementById('historyList');
const loadingIndicator = document.getElementById('loadingIndicator');
const noResults = document.getElementById('noResults');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const exportModal = document.getElementById('exportModal');
const confirmExportBtn = document.getElementById('confirmExport');
const cancelExportBtn = document.getElementById('cancelExport');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadHistory();
});

// 事件监听器
function initializeEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    dateFilterSelect.addEventListener('change', function() {
        dateFilter = this.value;
        applyFilters();
    });
    
    refreshBtn.addEventListener('click', loadHistory);
    exportBtn.addEventListener('click', showExportModal);
    clearAllBtn.addEventListener('click', clearAllHistory);
    
    prevPageBtn.addEventListener('click', () => changePage(-1));
    nextPageBtn.addEventListener('click', () => changePage(1));
    
    confirmExportBtn.addEventListener('click', handleExport);
    cancelExportBtn.addEventListener('click', hideExportModal);
    
    // 模态框关闭
    document.querySelector('.close').addEventListener('click', hideExportModal);
    window.addEventListener('click', function(e) {
        if (e.target === exportModal) {
            hideExportModal();
        }
    });
}

// 加载历史记录
async function loadHistory() {
    showLoading();
    
    try {
        // 获取最近1000条历史记录
        const history = await chrome.history.search({
            text: '',
            maxResults: 1000,
            startTime: 0
        });
        
        currentHistory = history.map(item => ({
            id: item.id,
            title: item.title || '无标题',
            url: item.url,
            visitCount: item.visitCount || 1,
            lastVisitTime: item.lastVisitTime,
            starred: false,
            tags: []
        }));
        
        // 从存储中加载用户标记
        await loadUserMarks();
        
        applyFilters();
        hideLoading();
    } catch (error) {
        console.error('加载历史记录失败:', error);
        showError('加载历史记录失败');
        hideLoading();
    }
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
            }
        }
        
        return true;
    });
    
    currentPage = 1;
    renderHistory();
}

// 处理搜索
function handleSearch() {
    searchQuery = searchInput.value.trim();
    applyFilters();
}

// 渲染历史记录
function renderHistory() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageHistory = filteredHistory.slice(startIndex, endIndex);
    
    if (pageHistory.length === 0) {
        historyList.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
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
    
    return `
        <div class="history-item" data-id="${item.id}">
            <div class="history-item-header">
                <a href="${item.url}" class="history-title" target="_blank" title="${item.title}">
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
            await chrome.history.deleteUrl({ url: currentHistory.find(item => item.id === id).url });
            
            // 从当前历史记录中移除
            currentHistory = currentHistory.filter(item => item.id !== id);
            applyFilters();
            
            showMessage('删除成功');
        } catch (error) {
            console.error('删除失败:', error);
            showError('删除失败');
        }
    }
}

// 切换星标
async function toggleStar(id) {
    const item = currentHistory.find(item => item.id === id);
    if (item) {
        item.starred = !item.starred;
        await saveUserMarks();
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
            applyFilters();
            showMessage('已清空所有历史记录');
        } catch (error) {
            console.error('清空失败:', error);
            showError('清空失败');
        }
    }
}

// 分页功能
function changePage(direction) {
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderHistory();
    }
}

function updatePagination() {
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
    
    pageInfo.textContent = `第 ${currentPage} 页，共 ${totalPages} 页`;
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
    
    try {
        if (format === 'csv') {
            exportToCSV();
        } else {
            exportToJSON();
        }
        hideExportModal();
        showMessage('导出成功');
    } catch (error) {
        console.error('导出失败:', error);
        showError('导出失败');
    }
}

function exportToCSV() {
    const headers = ['标题', 'URL', '访问次数', '最后访问时间', '标记'];
    const csvContent = [
        headers.join(','),
        ...filteredHistory.map(item => [
            `"${item.title.replace(/"/g, '""')}"`,
            `"${item.url}"`,
            item.visitCount,
            `"${new Date(item.lastVisitTime).toLocaleString()}"`,
            item.starred ? '是' : '否'
        ].join(','))
    ].join('\n');
    
    downloadFile(csvContent, 'browser-history.csv', 'text/csv');
}

function exportToJSON() {
    const jsonData = filteredHistory.map(item => ({
        title: item.title,
        url: item.url,
        visitCount: item.visitCount,
        lastVisitTime: new Date(item.lastVisitTime).toISOString(),
        starred: item.starred,
        tags: item.tags
    }));
    
    downloadFile(JSON.stringify(jsonData, null, 2), 'browser-history.json', 'application/json');
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

function showLoading() {
    loadingIndicator.style.display = 'block';
    historyList.style.display = 'none';
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
    historyList.style.display = 'block';
}

function showMessage(message) {
    // 简单的消息提示
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 1000;
        font-size: 14px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}

function showError(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 1000;
        font-size: 14px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}

