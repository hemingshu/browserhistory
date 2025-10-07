// 简化的后台脚本 - 避免复杂的API调用

// 安装时的初始化
chrome.runtime.onInstalled.addListener(() => {
    console.log('Browser History Manager 已安装');
});

// 处理扩展图标点击
chrome.action.onClicked.addListener(async (tab) => {
    try {
        console.log('点击扩展图标，准备打开历史记录页面');
        // 打开历史记录管理页面
        await chrome.tabs.create({
            url: chrome.runtime.getURL('history.html')
        });
        console.log('历史记录页面已打开');
    } catch (error) {
        console.error('打开历史记录页面失败:', error);
    }
});

// 监听来自页面的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('收到消息:', request);
    
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
            sendResponse({ success: false, error: '未知消息类型' });
    }
});

// 处理获取历史记录请求
async function handleGetHistory(request, sendResponse) {
    try {
        console.log('获取历史记录请求:', request);
        const history = await chrome.history.search({
            text: request.query || '',
            maxResults: request.maxResults || 1000,
            startTime: request.startTime || 0
        });
        
        console.log('获取到历史记录数量:', history.length);
        sendResponse({ success: true, data: history });
    } catch (error) {
        console.error('获取历史记录失败:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// 处理删除历史记录请求
async function handleDeleteHistory(request, sendResponse) {
    try {
        console.log('删除历史记录请求:', request);
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
        console.log('清空所有历史记录请求');
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
