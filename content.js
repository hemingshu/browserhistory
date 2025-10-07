// 内容脚本 - 在网页中注入的功能

// 页面加载完成后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    // 添加页面标记功能
    addPageMarkingFeature();
    
    // 监听页面变化（SPA应用）
    observePageChanges();
}

// 添加页面标记功能
function addPageMarkingFeature() {
    // 创建标记按钮
    const markButton = createMarkButton();
    
    // 将按钮添加到页面
    document.body.appendChild(markButton);
    
    // 监听按钮点击
    markButton.addEventListener('click', handleMarkClick);
}

// 创建标记按钮
function createMarkButton() {
    const button = document.createElement('div');
    button.id = 'browser-history-mark-btn';
    button.innerHTML = '★';
    button.title = '标记为重要';
    
    // 样式
    button.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        background: #ffc107;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        cursor: pointer;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        user-select: none;
    `;
    
    // 悬停效果
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.background = '#ff9800';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.background = '#ffc107';
    });
    
    return button;
}

// 处理标记点击
async function handleMarkClick() {
    const button = document.getElementById('browser-history-mark-btn');
    
    try {
        // 发送消息到background script
        const response = await chrome.runtime.sendMessage({
            type: 'MARK_PAGE',
            data: {
                url: window.location.href,
                title: document.title
            }
        });
        
        if (response.success) {
            // 更新按钮状态
            button.innerHTML = '✓';
            button.style.background = '#4CAF50';
            button.title = '已标记';
            
            // 显示成功提示
            showNotification('页面已标记为重要', 'success');
            
            // 2秒后恢复原状
            setTimeout(() => {
                button.innerHTML = '★';
                button.style.background = '#ffc107';
                button.title = '标记为重要';
            }, 2000);
        } else {
            showNotification('标记失败', 'error');
        }
    } catch (error) {
        console.error('标记页面失败:', error);
        showNotification('标记失败', 'error');
    }
}

// 监听页面变化（用于SPA应用）
function observePageChanges() {
    let currentUrl = window.location.href;
    
    // 监听URL变化
    const observer = new MutationObserver(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            // URL变化时重新初始化
            setTimeout(init, 100);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // 监听popstate事件（浏览器前进/后退）
    window.addEventListener('popstate', () => {
        setTimeout(init, 100);
    });
    
    // 监听pushstate和replacestate（程序化导航）
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function() {
        originalPushState.apply(history, arguments);
        setTimeout(init, 100);
    };
    
    history.replaceState = function() {
        originalReplaceState.apply(history, arguments);
        setTimeout(init, 100);
    };
}

// 显示通知
function showNotification(message, type = 'info') {
    // 移除现有通知
    const existingNotification = document.getElementById('browser-history-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.id = 'browser-history-notification';
    notification.textContent = message;
    
    // 样式
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        info: '#2196F3'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 10001;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

// 监听来自background script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case 'UPDATE_MARK_STATUS':
            updateMarkStatus(request.data);
            break;
        case 'SHOW_NOTIFICATION':
            showNotification(request.message, request.notificationType);
            break;
        default:
            console.log('未知消息类型:', request.type);
    }
});

// 更新标记状态
function updateMarkStatus(data) {
    const button = document.getElementById('browser-history-mark-btn');
    if (button && data.starred) {
        button.innerHTML = '✓';
        button.style.background = '#4CAF50';
        button.title = '已标记';
    }
}

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    const button = document.getElementById('browser-history-mark-btn');
    if (button) {
        button.remove();
    }
    
    const notification = document.getElementById('browser-history-notification');
    if (notification) {
        notification.remove();
    }
});


