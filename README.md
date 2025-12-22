# 博客系统

一个功能完整的个人博客平台，基于 Node.js + Next.js + TypeScript 构建，支持服务端渲染（SSR）。

## 功能特性

### 内容管理
- **文章管理** - 创建、编辑、发布文章，支持草稿、定时发布、软删除
- **Markdown 编辑** - 支持 Shiki 代码高亮、自动生成目录、粘贴/拖拽上传图片
- **图片本地化** - 自动下载远程图片到本地服务器（可选功能）
- **分类管理** - 支持层级分类（父子关系）
- **标签管理** - 标签创建、合并功能
- **页面管理** - 独立页面，支持导航菜单配置
- **媒体库** - 图片上传、缩略图生成、本地存储、粘贴/拖拽上传
- **知识库** - 层级文档管理，支持排序

### 扩展功能
- **友情链接** - 友链管理，支持分组和排序
- **项目展示** - 项目作品集，支持分类管理

### 互动功能
- **评论系统** - 评论提交、审核、垃圾检测、XSS 防护
- **访问统计** - 浏览量统计、热门文章排行、访客分析

### AI 功能
- **多模型支持** - OpenAI、Claude、通义千问
- **AI 辅助写作** - 根据想法生成完整文章
- **API 密钥加密存储**

### 系统功能
- **用户认证** - JWT + bcrypt 安全认证
- **主题系统** - 11 套主题，支持深色/浅色模式
  - Classic（经典）- 传统博客风格
  - Minimal（极简）- 简洁清爽
  - Magazine（杂志）- 杂志排版风格
  - Cyber（赛博）- 科技感霓虹风格
  - Vibrant（活力）- 现代卡片式布局
  - Aura-Nexus（灵气枢纽）- 动态光效背景
  - Vibe-Pulse（微博风格）- 社交媒体风格
  - Aether-Bloom（以太花语）- 优雅花卉主题
  - Chroma-Dimension（幻彩维度）- 渐变色彩主题
  - Serene-Ink（静墨）- 以阅读为核心的极简主题
  - Clarity-Focus（清晰聚焦）- 三栏结构，视觉重心集中
- **主题配置** - 每个主题支持自定义配置选项
- **自定义代码注入** - 支持 Head/Body 自定义代码、侧边栏 HTML
- **三级菜单** - 支持三级导航菜单配置
- **幻灯片** - 首页幻灯片，支持全宽轮播、卡片网格、简约横幅三种样式
- **插件系统** - 插件安装、启用/禁用、依赖管理
- **数据备份** - JSON/Markdown 导出导入
- **SEO 优化** - 服务端渲染，爬虫可抓取完整内容

### 安全特性
- **XSS 防护** - Markdown 内容净化、评论 HTML 转义
- **速率限制** - API 请求频率限制，防止暴力破解
- **HTTP 安全头** - Helmet 中间件保护
- **密码安全** - bcrypt 哈希、账户锁定机制
- **SQL 注入防护** - Prisma ORM 参数化查询

## 技术栈

### 后端
- Node.js + Express
- TypeScript
- Prisma ORM + SQLite
- JWT 认证
- Helmet + Rate Limit 安全中间件
- Vitest 测试框架

### 前端
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand 状态管理
- TanStack Query
- 服务端渲染 (SSR) + 静态生成 (SSG)

## 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd blog
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

后端配置：
```bash
cp packages/server/.env.example packages/server/.env
```

编辑 `packages/server/.env`：
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-this"  # 必须修改！
ENCRYPTION_KEY="your-32-char-encryption-key"
PORT=3012
ALLOWED_ORIGINS=*  # 生产环境改为具体域名
```

前端配置：
```bash
cp packages/web/.env.local.example packages/web/.env.local
```

编辑 `packages/web/.env.local`：
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:3012
```

4. **初始化数据库**
```bash
cd packages/server
npx prisma migrate dev
npx prisma db seed  # 可选：创建初始管理员账户
```

5. **启动开发服务器**

**方式一：同时启动前后端（推荐）**
```bash
# 在项目根目录
npm run dev
```
这会同时启动后端 (http://localhost:3012) 和前端 (http://localhost:3011)

**方式二：分别启动**

后端：
```bash
cd packages/server
npm run dev
# 服务运行在 http://localhost:3012
```

前端：
```bash
cd packages/web
npm run dev
# 服务运行在 http://localhost:3011
```

6. **访问系统**
- 前台首页: http://localhost:3011
- 后台管理: http://localhost:3011/admin
- 默认账户: admin / admin123

### 生产部署

1. **构建前端**
```bash
cd packages/web
npm run build
```

2. **启动前端（Next.js 需要 Node.js 运行时）**
```bash
cd packages/web
npm start
```

3. **启动后端**
```bash
cd packages/server
npm run build
npm start
```

### 使用 PM2 部署（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动后端
cd packages/server
npm run build
pm2 start dist/index.js --name blog-server

# 启动前端
cd packages/web
npm run build
pm2 start npm --name blog-web -- start

# 查看日志
pm2 logs blog-server
```

### Caddy 反向代理配置

如果使用 Caddy 作为反向代理，需要同时配置前端和后端的代理规则：

```caddyfile
yourdomain.com, www.yourdomain.com {
    # 上传文件直接访问（静态文件）
    handle /uploads/* {
        root * /path/to/blog/packages/server
        file_server
    }
    
    # API 请求代理到后端服务 (3012)
    handle /api/* {
        reverse_proxy 127.0.0.1:3012
    }
    
    # 其他请求代理到 Next.js 前端 (3011)
    handle {
        reverse_proxy 127.0.0.1:3011
    }
}
```

**重要说明：**
- `/api/*` 必须代理到后端端口 (3012)，否则 API 请求会失败
- `/uploads/*` 可以直接由 Caddy 提供静态文件服务，提高性能
- 其他请求代理到 Next.js 前端 (3011)
- 系统已配置 `trust proxy`，可以正确获取客户端真实 IP

### 版本更新

当拉取新代码后，执行以下步骤：

```bash
# 1. 安装新依赖
npm install

# 2. 更新数据库（如有迁移）
cd packages/server
npx prisma migrate deploy
npx prisma generate

# 3. 重新构建
npm run build
cd ../web
npm run build

# 4. 重启服务
pm2 restart blog-server
pm2 restart blog-web
```

## 项目结构

```
blog/
├── packages/
│   ├── server/                 # 后端服务
│   │   ├── prisma/
│   │   │   └── schema.prisma   # 数据库模型
│   │   └── src/
│   │       ├── routes/         # API 路由
│   │       ├── services/       # 业务逻辑
│   │       ├── middleware/     # 中间件
│   │       └── lib/            # 工具库
│   │
│   └── web/                    # 前端应用 (Next.js)
│       └── src/
│           ├── app/            # App Router 页面
│           │   ├── (blog)/     # 博客前台（SSR）
│           │   ├── (admin)/    # 后台管理（CSR）
│           │   └── login/      # 登录页
│           ├── components/     # 通用组件
│           ├── views/          # 页面视图组件
│           ├── layouts/        # 布局组件
│           ├── hooks/          # 自定义 Hooks
│           ├── stores/         # 状态管理
│           ├── themes/         # 主题组件
│           │   └── shared/     # 主题共享组件
│           ├── lib/            # 工具函数
│           └── types/          # 类型定义
├── SECURITY_AUDIT.md           # 安全审计报告
└── README.md
```

## API 接口

| 路由 | 说明 |
|------|------|
| `/api/auth` | 用户认证（含速率限制） |
| `/api/articles` | 文章管理 |
| `/api/categories` | 分类管理 |
| `/api/tags` | 标签管理 |
| `/api/pages` | 页面管理 |
| `/api/media` | 媒体管理（含图片本地化） |
| `/api/knowledge` | 知识库 |
| `/api/comments` | 评论管理 |
| `/api/stats` | 访问统计 |
| `/api/analytics` | 访客分析 |
| `/api/backup` | 数据备份 |
| `/api/ai` | AI 功能 |
| `/api/themes` | 主题管理 |
| `/api/plugins` | 插件管理 |
| `/api/settings` | 系统设置 |
| `/api/friend-links` | 友情链接 |
| `/api/projects` | 项目管理 |
| `/api/project-categories` | 项目分类 |

## 安全配置

### 速率限制

系统内置 API 速率限制，防止暴力破解和滥用（按客户端 IP 独立计算）：

| 接口 | 时间窗口 | 最大请求数 |
|------|----------|-----------|
| 通用 API | 15分钟 | 2000次/IP |
| 登录接口 | 1小时 | 30次/IP |
| 访客追踪 | 1分钟 | 60次/IP |

**说明：**
- 速率限制是按 IP 独立计算的，不同访客互不影响
- 使用反向代理（Caddy/Nginx）时，系统会自动获取真实客户端 IP
- 超出限制后返回 429 状态码

### 账户安全

- 密码错误 5 次后账户锁定 15 分钟
- 密码使用 bcrypt 哈希存储（cost=10）
- JWT Token 24 小时过期

### 生产环境必须配置

```env
# 必须设置强随机密钥
JWT_SECRET=<随机32位以上字符串>

# 必须限制允许的域名
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## 默认账户

运行 `npm run db:seed` 后会创建默认管理员账户：
- 用户名: `admin`
- 密码: `admin123`

**⚠️ 生产环境请立即修改默认密码！**

或者使用 Prisma Studio 手动管理数据：
```bash
cd packages/server
npx prisma studio
```

## 运行测试

```bash
cd packages/server
npm test
```

## 开发命令

```bash
# 安装所有依赖
npm install

# 同时启动前后端开发服务器（推荐）
npm run dev

# 后端开发
cd packages/server
npm run dev          # 启动开发服务器
npm test             # 运行测试
npm run build        # 构建生产版本
npm run db:seed      # 初始化数据

# 前端开发
cd packages/web
npm run dev          # 启动开发服务器 (Next.js)
npm run build        # 构建生产版本
npm start            # 启动生产服务器

# 数据库
cd packages/server
npx prisma studio    # 打开数据库管理界面
npx prisma migrate dev   # 运行迁移
npx prisma generate  # 生成 Prisma Client
```

## 配置说明

### 后端配置 (packages/server/.env)

```env
# 数据库
DATABASE_URL="file:./dev.db"

# JWT 密钥（生产环境必须修改）
JWT_SECRET="your-jwt-secret-key"

# API 密钥加密密钥 (32字符)
ENCRYPTION_KEY="your-32-character-encryption-key"

# 服务端口
PORT=3012

# CORS 允许的域名（生产环境必须配置具体域名）
ALLOWED_ORIGINS=https://your-domain.com
```

### 前端配置 (packages/web/.env.local)

```env
# API 服务器地址
NEXT_PUBLIC_API_URL=http://127.0.0.1:3012
```

### AI 模型配置

在后台管理界面 -> 系统设置 -> AI 模型 中配置：

1. 添加 AI 模型（OpenAI/Claude/通义千问）
2. 填写 API Key
3. 设置默认模型

## 主题开发

主题位于 `packages/web/src/themes/` 目录，每个主题需要实现 `ThemeComponents` 接口。

### 必需组件

| 组件 | 说明 |
|------|------|
| `BlogLayout` | 博客布局容器 |
| `ArticleCard` | 文章卡片 |
| `ArticleDetail` | 文章详情页 |
| `CategoryList` | 分类列表 |
| `TagList` | 标签列表 |
| `SearchResults` | 搜索结果 |

### 可选组件

| 组件 | 说明 | 默认行为 |
|------|------|----------|
| `ProjectDetail` | 项目详情页 | 使用 `DefaultProjectDetail` |

### 共享组件

位于 `themes/shared/` 目录，可被所有主题复用：

- `DefaultProjectDetail` - 默认项目详情组件
- `CustomHtmlBlock` - 自定义 HTML 渲染组件
- `useHeadCodeInjector` - Head 代码注入 Hook

### 主题配置

每个主题可定义 `configOptions` 配置选项，支持类型：
- `select` - 下拉选择
- `boolean` - 开关
- `color` - 颜色选择器
- `number` - 数字输入
- `text` - 文本输入
- `json` - JSON 编辑器

### 自定义代码注入

部分主题支持自定义代码注入功能：

- **customHeadCode** - 注入到 `<head>` 标签（统计代码、字体等）
- **customBodyStartCode** - 页面顶部代码
- **customBodyEndCode** - 页面底部代码
- **leftSidebarCustomHtml** - 左侧边栏自定义 HTML
- **rightSidebarCustomHtml** - 右侧边栏自定义 HTML

## SEO 说明

本项目使用 Next.js 服务端渲染（SSR），博客前台页面在服务端生成完整 HTML：

- **首页** - SSR，每次请求时获取最新文章
- **文章详情** - SSG + ISR，静态生成并定期重新验证
- **分类/标签页** - SSG + ISR
- **搜索页** - SSR，支持动态搜索参数
- **后台管理** - CSR，客户端渲染

爬虫访问时可以获取完整的页面内容，有利于 SEO。

## 更新日志

### 2025-12-22
- 新增项目详情页 `/project/[slug]`，支持 Markdown 内容
- 新增 Serene-Ink（静墨）主题 - 以阅读为核心的极简设计
- 新增 Clarity-Focus（清晰聚焦）主题 - 三栏结构布局
- 新增主题自定义代码注入功能
- 新增访客分析功能（设备、浏览器、来源统计）
- 安全加固：XSS 防护、速率限制、HTTP 安全头

## License

MIT
