# Browser History Manager - 安装说明

## 功能特性

✅ **历史记录展示** - 按时间倒序展示浏览历史记录  
✅ **搜索与过滤** - 支持关键词搜索和日期过滤  
✅ **历史记录管理** - 删除单条记录、批量删除、清空全部  
✅ **记录标记** - 标记重要记录，支持星标功能  
✅ **导出功能** - 支持CSV和JSON格式导出  
✅ **用户交互** - 右键菜单、页面内标记按钮  
✅ **性能优化** - 分页加载，支持大数据量  

## 安装步骤

### 1. 生成图标文件

1. 打开 `generate_icons.html` 文件
2. 浏览器会自动下载4个不同尺寸的PNG图标文件
3. 将下载的图标文件移动到 `icons/` 文件夹中

### 2. 加载扩展

1. 打开Chrome浏览器
2. 进入 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本项目的根目录（包含manifest.json的文件夹）

### 3. 使用扩展

1. 点击浏览器工具栏中的扩展图标
2. 系统会自动打开新的标签页显示历史记录管理界面
3. 在管理界面中查看和管理历史记录
4. 使用搜索和过滤功能快速找到需要的记录
5. 点击星标按钮标记重要记录
6. 使用导出功能保存历史记录

## 权限说明

- **history**: 读取和管理浏览历史记录
- **storage**: 保存用户标记和设置
- **activeTab**: 获取当前标签页信息
- **contextMenus**: 创建右键菜单

## 文件结构

```
browser-history/
├── manifest.json          # 扩展配置文件
├── history.html          # 历史记录管理页面
├── history.js            # 页面逻辑
├── history-styles.css    # 页面样式
├── popup.html            # 弹出窗口（备用）
├── popup.js              # 弹出窗口逻辑
├── styles.css            # 弹出窗口样式
├── background.js         # 后台脚本
├── content.js            # 内容脚本
├── icons/                # 图标文件夹
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── generate_icons.html   # 图标生成器
└── INSTALL.md           # 安装说明
```

## 开发说明

### 技术栈
- Chrome Extension Manifest V3
- 原生JavaScript (ES6+)
- Chrome History API
- Chrome Storage API
- Chrome Context Menus API

### 主要功能实现

1. **历史记录获取**: 使用 `chrome.history.search()` API
2. **数据存储**: 使用 `chrome.storage.local` 保存用户标记
3. **右键菜单**: 使用 `chrome.contextMenus` API
4. **页面交互**: 通过内容脚本在网页中注入功能
5. **导出功能**: 使用Blob API生成下载文件

### 性能优化

- 分页加载历史记录，避免一次性加载过多数据
- 使用虚拟滚动优化长列表渲染
- 防抖搜索，避免频繁API调用
- 定期清理过期数据

## 故障排除

### 常见问题

1. **Service Worker注册失败 (Status code: 15)**
   - 重新加载扩展：在chrome://extensions/页面点击刷新按钮
   - 检查background-simple.js文件是否存在
   - 确保manifest.json中的service_worker路径正确

2. **扩展无法加载**
   - 确保所有文件都在正确位置
   - 检查manifest.json语法是否正确
   - 确保图标文件存在

3. **点击扩展图标没有反应**
   - 检查控制台是否有错误信息
   - 确保background-simple.js正常工作
   - 尝试重新安装扩展

4. **历史记录无法显示**
   - 检查浏览器权限设置
   - 确保history权限已授予
   - 打开test.html页面进行API测试

5. **导出功能不工作**
   - 检查浏览器是否允许下载
   - 确保有足够的历史记录数据

### 调试方法

1. **使用测试页面**
   - 打开 `test.html` 进行功能测试
   - 检查各个API是否正常工作

2. **查看控制台错误**
   - 打开Chrome开发者工具 (F12)
   - 查看Console面板的错误信息
   - 检查Service Worker的错误日志

3. **检查扩展权限**
   - 在chrome://extensions/页面检查权限
   - 确保所有必要权限都已授予

4. **重新安装扩展**
   - 删除现有扩展
   - 重新加载扩展文件夹
   - 检查所有文件完整性

### 快速修复步骤

1. **如果Service Worker失败**：
   ```bash
   # 确保使用简化的background脚本
   # manifest.json中应该指向background-simple.js
   ```

2. **如果点击无反应**：
   - 打开chrome://extensions/
   - 找到Browser History Manager
   - 点击"重新加载"按钮
   - 再次尝试点击扩展图标

3. **如果API调用失败**：
   - 打开test.html页面
   - 运行所有测试
   - 根据错误信息进行修复

## 更新日志

### v1.0.0
- 初始版本发布
- 实现所有核心功能
- 支持历史记录查看、搜索、管理
- 支持标记和导出功能

