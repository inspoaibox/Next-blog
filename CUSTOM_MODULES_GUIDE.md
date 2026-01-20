# 杂志主题 - 自定义侧边栏模块使用指南

## 功能说明

在杂志主题的侧边栏中，你现在可以添加自定义 HTML/JS 模块，显示在"快捷导航"下方。

## 使用步骤

### 1. 进入主题设置

1. 登录管理后台
2. 进入 `/admin/settings`
3. 点击"主题设置"标签
4. 确保当前使用的是"杂志主题"
5. 在主题配置中找到"自定义侧边栏模块"选项

### 2. 添加自定义模块

点击"+ 添加自定义模块"按钮，填写以下信息：

- **模块标题**：显示在模块顶部的标题（必填）
- **HTML 代码**：模块的内容，支持任意 HTML 标签（必填）
- **JavaScript 代码**：可选，用于添加交互功能
- **启用此模块**：勾选后模块才会显示

### 3. 示例

#### 示例 1：简单公告

**模块标题**：`最新公告`

**HTML 代码**：
```html
<div class="space-y-2">
  <p class="text-sm text-gray-600 dark:text-gray-400">
    🎉 博客全新改版上线！
  </p>
  <p class="text-sm text-gray-600 dark:text-gray-400">
    📢 欢迎关注我们的社交媒体
  </p>
</div>
```

#### 示例 2：联系方式

**模块标题**：`联系我`

**HTML 代码**：
```html
<div class="space-y-3">
  <a href="mailto:your@email.com" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 transition-colors">
    <span>📧</span>
    <span>your@email.com</span>
  </a>
  <a href="https://github.com/yourusername" target="_blank" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 transition-colors">
    <span>🐙</span>
    <span>GitHub</span>
  </a>
  <a href="https://twitter.com/yourusername" target="_blank" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 transition-colors">
    <span>🐦</span>
    <span>Twitter</span>
  </a>
</div>
```

#### 示例 3：带交互的计数器

**模块标题**：`访问计数`

**HTML 代码**：
```html
<div class="text-center">
  <p class="text-2xl font-bold text-violet-600" id="visit-counter">0</p>
  <p class="text-xs text-gray-500 mt-1">今日访问</p>
</div>
```

**JavaScript 代码**：
```javascript
// 模拟访问计数
let count = Math.floor(Math.random() * 1000) + 100;
document.getElementById('visit-counter').textContent = count;

// 每秒增加
setInterval(() => {
  count++;
  const el = document.getElementById('visit-counter');
  if (el) el.textContent = count;
}, 5000);
```

#### 示例 4：嵌入第三方小部件

**模块标题**：`天气预报`

**HTML 代码**：
```html
<div id="weather-widget" class="text-center">
  <div class="text-4xl mb-2">☀️</div>
  <p class="text-sm text-gray-600 dark:text-gray-400">晴天 25°C</p>
  <p class="text-xs text-gray-500 mt-1">北京</p>
</div>
```

**JavaScript 代码**：
```javascript
// 这里可以调用天气 API
// 示例：简单的天气显示
console.log('天气模块已加载');
```

#### 示例 5：RSS 订阅

**模块标题**：`订阅博客`

**HTML 代码**：
```html
<div class="space-y-3">
  <p class="text-sm text-gray-600 dark:text-gray-400">
    通过 RSS 订阅获取最新文章
  </p>
  <a href="/rss.xml" class="block w-full px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-center rounded-full text-sm font-medium hover:shadow-lg transition-all">
    📡 订阅 RSS
  </a>
</div>
```

## 管理功能

- **排序**：使用 ▲▼ 按钮调整模块显示顺序
- **启用/禁用**：使用开关快速启用或禁用模块
- **编辑**：点击"编辑"按钮修改模块内容
- **删除**：点击"删除"按钮移除模块

## 注意事项

### 安全性
- 自定义 HTML/JS 代码会直接在前台执行
- 请确保代码来源可信，避免 XSS 攻击
- 建议只在管理员账号下操作

### 样式建议
- 使用 Tailwind CSS 类名保持与主题一致
- 推荐使用主题配色：`text-violet-600`、`bg-violet-50` 等
- 使用 `dark:` 前缀支持暗色模式

### JavaScript 限制
- JS 代码在模块挂载时执行
- 避免使用全局变量污染
- 使用 `console.log` 调试时注意清理

## 技术细节

### 数据存储
自定义模块配置存储在主题配置的 `customModules` 字段中，格式为 JSON 数组：

```json
[
  {
    "title": "模块标题",
    "html": "<div>HTML内容</div>",
    "js": "console.log('JS代码');",
    "enabled": true
  }
]
```

### 渲染位置
模块渲染在侧边栏的以下位置：
1. 作者卡片
2. 站点统计
3. 快捷导航
4. **自定义模块（这里）** ← 新增位置

### 前提条件
- 必须启用侧边栏（主题配置中的"显示侧边栏"选项）
- 只在杂志主题中可用

## 常见问题

**Q: 为什么我的模块不显示？**
A: 检查以下几点：
1. 是否启用了侧边栏（主题配置 → 显示侧边栏）
2. 模块是否已启用（开关是否打开）
3. 是否在使用杂志主题

**Q: JavaScript 代码不执行？**
A: 
1. 检查浏览器控制台是否有错误
2. 确保 JS 代码语法正确
3. 避免使用需要外部依赖的代码

**Q: 如何调试自定义模块？**
A:
1. 使用浏览器开发者工具（F12）
2. 在 JS 代码中添加 `console.log()` 输出
3. 检查 Network 标签查看资源加载

## 更新日志

- **2025-01-20**: 初始版本发布
  - 支持自定义 HTML/JS 模块
  - 支持模块排序、启用/禁用
  - 提供可视化编辑界面
