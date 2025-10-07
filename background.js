// 后台脚本 - 处理扩展的后台任务

// 安装时的初始化
chrome.runtime.onInstalled.addListener(async () => {
    console.log('Browser History Manager 已安装');
    
    try {
        // 创建右键菜单
        await chrome.contextMenus.create({
            id: 'addToHistory',
            title: '添加到历史记录管理',
            contexts: ['page', 'link']
        });
        
        // 创建标记菜单
        await chrome.contextMenus.create({
            id: 'markImportant',
            title: '标记为重要',
            contexts: ['page']
        });
        
        console.log('右键菜单创建成功');
    } catch (error) {
        console.error('创建右键菜单失败:', error);
    }
});

// 处理扩展图标点击
chrome.action.onClicked.addListener(async (tab) => {
    try {
        // 打开历史记录管理页面
        await chrome.tabs.create({
            url: chrome.runtime.getURL('history.html')
        });
    } catch (error) {
        console.error('打开历史记录页面失败:', error);
    }
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    try {
        if (info.menuItemId === 'addToHistory') {
            // 可以在这里添加特殊处理逻辑
            console.log('添加到历史记录管理:', info);
        } else if (info.menuItemId === 'markImportant') {
            await markPageAsImportant(tab);
        }
    } catch (error) {
        console.error('处理右键菜单点击失败:', error);
    }
});

// 标记页面为重要
async function markPageAsImportant(tab) {
    try {
        // 获取当前页面的历史记录
        const history = await chrome.history.search({
            text: tab.url,
            maxResults: 1
        });
        
        if (history.length > 0) {
            const item = history[0];
            
            // 从存储中获取现有标记
            const result = await chrome.storage.local.get(['historyMarks']);
            const marks = result.historyMarks || {};
            
            // 更新标记
            marks[item.id] = {
                starred: true,
                tags: marks[item.id]?.tags || []
            };
            
            // 保存到存储
            await chrome.storage.local.set({ historyMarks: marks });
            
            // 发送通知给popup
            chrome.runtime.sendMessage({
                type: 'PAGE_MARKED',
                data: { id: item.id, starred: true }
            });
        }
    } catch (error) {
        console.error('标记页面失败:', error);
    }
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case 'GET_HISTORY':
            handleGetHistory(request, sendResponse);
            return true; // 保持消息通道开放
            
        case 'DELETE_HISTORY':
            handleDeleteHistory(request, sendResponse);
            return true;
            
        case 'CLEAR_ALL_HISTORY':
            handleClearAllHistory(request, sendResponse);
            return true;
            
        default:
            console.log('未知消息类型:', request.type);
    }
});

// 处理获取历史记录请求
async function handleGetHistory(request, sendResponse) {
    try {
        const history = await chrome.history.search({
            text: request.query || '',
            maxResults: request.maxResults || 1000,
            startTime: request.startTime || 0
        });
        
        sendResponse({ success: true, data: history });
    } catch (error) {
        console.error('获取历史记录失败:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// 处理删除历史记录请求
async function handleDeleteHistory(request, sendResponse) {
    try {
        await chrome.history.deleteUrl({ url: request.url });
        sendResponse({ success: true });
    } catch (error) {
        console.error('删除历史记录失败:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// 处理清空所有历史记录请求
async function handleClearAllHistory(request, sendResponse) {
    try {
        // 获取所有历史记录
        const allHistory = await chrome.history.search({ text: '', maxResults: 0 });
        
        // 删除所有URL
        for (const item of allHistory) {
            await chrome.history.deleteUrl({ url: item.url });
        }
        
        sendResponse({ success: true });
    } catch (error) {
        console.error('清空历史记录失败:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// 监听历史记录变化
chrome.history.onVisited.addListener((result) => {
    // 当有新页面被访问时，可以在这里添加处理逻辑
    console.log('新页面访问:', result);
});

chrome.history.onVisitRemoved.addListener((removed) => {
    // 当历史记录被删除时，可以在这里添加处理逻辑
    console.log('历史记录被删除:', removed);
});

// 定期清理过期数据（可选）
try {
    chrome.alarms.create('cleanup', { delayInMinutes: 60, periodInMinutes: 60 });
    
    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === 'cleanup') {
            // 执行清理任务
            performCleanup();
        }
    });
} catch (error) {
    console.log('alarms API 不可用，跳过定期清理功能');
}

async function performCleanup() {
    try {
        // 清理超过30天的标记数据
        const result = await chrome.storage.local.get(['historyMarks']);
        const marks = result.historyMarks || {};
        
        // 获取当前历史记录
        const history = await chrome.history.search({ text: '', maxResults: 0 });
        const existingIds = new Set(history.map(item => item.id));
        
        // 删除不存在历史记录的标记
        const cleanedMarks = {};
        for (const [id, mark] of Object.entries(marks)) {
            if (existingIds.has(parseInt(id))) {
                cleanedMarks[id] = mark;
            }
        }
        
        await chrome.storage.local.set({ historyMarks: cleanedMarks });
        console.log('清理完成');
    } catch (error) {
        console.error('清理失败:', error);
    }
}

