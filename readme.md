# Browser History Manager - Chrome扩展

一个功能完整的Chrome浏览器历史记录管理扩展，提供查看、搜索、管理和导出浏览历史记录的功能。

## ✨ 主要功能

- 🔍 **智能搜索** - 支持关键词和URL搜索
- 📅 **时间过滤** - 按今天、本周、本月筛选
- ⭐ **重要标记** - 标记重要记录，支持星标功能
- 🗑️ **记录管理** - 删除单条、批量删除、清空全部
- 📤 **数据导出** - 支持CSV和JSON格式导出
- 🎯 **右键菜单** - 快速标记当前页面
- 📱 **响应式设计** - 适配不同屏幕尺寸

## 🚀 快速开始

### 安装步骤

1. **生成图标文件**
   ```bash
   # 打开 generate_icons.html 文件，自动下载图标
   open generate_icons.html
   ```

2. **加载扩展**
   - 打开Chrome浏览器
   - 访问 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目根目录

3. **开始使用**
   - 点击工具栏中的扩展图标
   - 在弹出窗口中管理历史记录

## 📁 项目结构

```
browser-history/
├── manifest.json          # 扩展配置
├── popup.html            # 主界面
├── popup.js              # 主逻辑
├── styles.css            # 样式
├── background.js         # 后台脚本
├── content.js            # 内容脚本
├── icons/                # 图标资源
├── generate_icons.html   # 图标生成器
└── INSTALL.md           # 详细安装说明
```

## 🛠️ 技术栈

- **Chrome Extension Manifest V3**
- **原生JavaScript (ES6+)**
- **Chrome History API**
- **Chrome Storage API**
- **Chrome Context Menus API**

## 📋 功能实现

### 历史记录获取
```javascript
const history = await chrome.history.search({
    text: '',
    maxResults: 1000,
    startTime: 0
});
```

### 数据存储
```javascript
await chrome.storage.local.set({ 
    historyMarks: marks 
});
```

### 导出功能
```javascript
function exportToCSV() {
    const csvContent = generateCSV(filteredHistory);
    downloadFile(csvContent, 'history.csv', 'text/csv');
}
```

## 🎨 界面特色

- **现代化设计** - 渐变背景，圆角按钮
- **直观操作** - 悬停效果，动画过渡
- **信息丰富** - 访问次数，时间显示
- **操作便捷** - 一键标记，批量操作

## 📖 使用说明

1. **查看历史记录** - 自动按时间倒序显示
2. **搜索记录** - 输入关键词搜索标题或URL
3. **过滤时间** - 选择时间范围快速筛选
4. **标记重要** - 点击星标按钮标记重要记录
5. **删除记录** - 点击删除按钮移除不需要的记录
6. **导出数据** - 选择格式导出历史记录

## 🔧 开发说明

### 权限要求
- `history` - 读取和管理历史记录
- `storage` - 保存用户设置
- `activeTab` - 获取当前标签页
- `contextMenus` - 创建右键菜单

### 性能优化
- 分页加载避免内存溢出
- 防抖搜索减少API调用
- 虚拟滚动优化长列表
- 定期清理过期数据

## 📝 更新日志

### v1.0.0 (2024-01-XX)
- ✨ 初始版本发布
- ✅ 实现所有核心功能
- 🎨 现代化界面设计
- 🚀 性能优化

## 📄 许可证

MIT License - 详见 LICENSE 文件

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

**注意**: 请确保在安装前阅读 `INSTALL.md` 获取详细的安装和配置说明。
