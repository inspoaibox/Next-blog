# 设计文档

## 概述

本博客系统采用前后端分离架构，后端使用 Node.js + Express 提供 RESTful API，前端使用 React 构建单页应用。数据存储使用 SQLite（便于部署和迁移），文件存储使用本地文件系统。系统设计遵循模块化、可扩展原则，支持主题和插件的热插拔。

### 技术栈选型

| 层级 | 技术选择 | 理由 |
|------|----------|------|
| 后端框架 | Node.js + Express | 轻量、生态丰富、易于维护 |
| 数据库 | SQLite + Prisma ORM | 零配置、文件级备份、易迁移 |
| 前端框架 | React + TypeScript | 组件化、类型安全、生态成熟 |
| 状态管理 | Zustand | 轻量、简单、无样板代码 |
| 样式方案 | Tailwind CSS | 原子化、主题支持、响应式 |
| Markdown | unified + remark + rehype | 可扩展、插件丰富 |
| 代码高亮 | Shiki | 准确、主题丰富 |
| 认证 | JWT + bcrypt | 无状态、安全 |

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                              │
├─────────────────────────────────────────────────────────────┤
│  前台 (博客展示)          │       后台 (管理系统)            │
│  - 文章列表/详情          │       - 内容管理                 │
│  - 分类/标签页            │       - 分类标签管理             │
│  - 搜索                   │       - 媒体库                   │
│  - 知识库                 │       - AI 写作                  │
│  - 评论                   │       - 系统设置                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        API 网关层                            │
├─────────────────────────────────────────────────────────────┤
│  认证中间件 │ 限流中间件 │ 日志中间件 │ 错误处理中间件       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        业务服务层                            │
├─────────────────────────────────────────────────────────────┤
│ AuthService    │ ArticleService  │ CategoryService          │
│ TagService     │ PageService     │ MediaService             │
│ CommentService │ KnowledgeService│ AIService                │
│ ThemeService   │ PluginService   │ BackupService            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        数据访问层                            │
├─────────────────────────────────────────────────────────────┤
│              Prisma ORM + SQLite                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        存储层                                │
├─────────────────────────────────────────────────────────────┤
│     SQLite 数据库文件      │      本地文件系统 (媒体/主题)   │
└─────────────────────────────────────────────────────────────┘
```

## 组件与接口

### 后端 API 路由结构

```
/api
├── /auth
│   ├── POST /login          # 用户登录
│   ├── POST /logout         # 用户登出
│   └── PUT  /password       # 修改密码
├── /articles
│   ├── GET    /             # 文章列表（支持分页、筛选）
│   ├── GET    /:id          # 文章详情
│   ├── POST   /             # 创建文章
│   ├── PUT    /:id          # 更新文章
│   ├── DELETE /:id          # 删除文章（移至回收站）
│   └── POST   /:id/publish  # 发布文章
├── /categories
│   ├── GET    /             # 分类列表（树形）
│   ├── POST   /             # 创建分类
│   ├── PUT    /:id          # 更新分类
│   └── DELETE /:id          # 删除分类
├── /tags
│   ├── GET    /             # 标签列表
│   ├── POST   /             # 创建标签
│   ├── PUT    /:id          # 更新标签
│   ├── DELETE /:id          # 删除标签
│   └── POST   /merge        # 合并标签
├── /pages
│   ├── GET    /             # 页面列表
│   ├── GET    /:slug        # 页面详情
│   ├── POST   /             # 创建页面
│   ├── PUT    /:id          # 更新页面
│   └── DELETE /:id          # 删除页面
├── /media
│   ├── GET    /             # 媒体列表
│   ├── POST   /upload       # 上传文件
│   ├── DELETE /:id          # 删除文件
│   └── GET    /:id/download # 下载文件
├── /knowledge
│   ├── GET    /             # 知识库目录树
│   ├── GET    /:id          # 文档详情
│   ├── POST   /             # 创建文档
│   ├── PUT    /:id          # 更新文档
│   ├── DELETE /:id          # 删除文档
│   └── PUT    /reorder      # 调整顺序
├── /comments
│   ├── GET    /             # 评论列表
│   ├── POST   /             # 提交评论
│   ├── PUT    /:id/approve  # 审核通过
│   ├── PUT    /:id/spam     # 标记垃圾
│   └── DELETE /:id          # 删除评论
├── /ai
│   ├── GET    /models       # 模型列表
│   ├── POST   /models       # 添加模型配置
│   ├── PUT    /models/:id   # 更新模型配置
│   ├── DELETE /models/:id   # 删除模型配置
│   ├── POST   /models/:id/test  # 测试模型连接
│   ├── PUT    /models/:id/default # 设为默认模型
│   └── POST   /generate     # AI 生成文章
├── /themes
│   ├── GET    /             # 主题列表
│   ├── POST   /install      # 安装主题
│   ├── PUT    /:id/activate # 激活主题
│   ├── PUT    /:id/config   # 更新主题配置
│   └── DELETE /:id          # 卸载主题
├── /plugins
│   ├── GET    /             # 插件列表
│   ├── POST   /install      # 安装插件
│   ├── PUT    /:id/enable   # 启用插件
│   ├── PUT    /:id/disable  # 禁用插件
│   ├── PUT    /:id/config   # 更新插件配置
│   └── DELETE /:id          # 卸载插件
├── /settings
│   ├── GET    /             # 获取系统设置
│   └── PUT    /             # 更新系统设置
├── /backup
│   ├── POST   /export       # 导出备份
│   └── POST   /import       # 导入备份
└── /stats
    └── GET    /             # 访问统计
```

### 前端组件结构

```
src/
├── components/
│   ├── common/           # 通用组件
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── ThemeToggle/
│   ├── editor/           # 编辑器组件
│   │   ├── MarkdownEditor/
│   │   ├── Preview/
│   │   └── Toolbar/
│   ├── blog/             # 博客前台组件
│   │   ├── ArticleList/
│   │   ├── ArticleDetail/
│   │   ├── Sidebar/
│   │   ├── TableOfContents/
│   │   └── Comments/
│   └── admin/            # 后台管理组件
│       ├── Dashboard/
│       ├── ArticleManager/
│       ├── CategoryManager/
│       ├── MediaLibrary/
│       ├── AIWriter/
│       └── Settings/
├── hooks/                # 自定义 Hooks
├── services/             # API 调用服务
├── stores/               # Zustand 状态管理
├── themes/               # 主题相关
│   ├── ThemeProvider.tsx
│   └── themes/
└── plugins/              # 插件系统
    ├── PluginManager.ts
    └── hooks/
```


## 数据模型

### 数据库 Schema (Prisma)

```prisma
// 用户表
model User {
  id            String    @id @default(cuid())
  username      String    @unique
  passwordHash  String
  role          Role      @default(ADMIN)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  loginAttempts Int       @default(0)
  lockedUntil   DateTime?
  articles      Article[]
  comments      Comment[]
}

enum Role {
  ADMIN
  EDITOR
  VIEWER
}

// 文章表
model Article {
  id            String    @id @default(cuid())
  title         String
  slug          String    @unique
  content       String    // Markdown 内容
  excerpt       String?   // 摘要
  status        ArticleStatus @default(DRAFT)
  publishedAt   DateTime?
  scheduledAt   DateTime? // 定时发布时间
  seoTitle      String?
  seoDescription String?
  viewCount     Int       @default(0)
  authorId      String
  author        User      @relation(fields: [authorId], references: [id])
  categoryId    String?
  category      Category? @relation(fields: [categoryId], references: [id])
  tags          ArticleTag[]
  comments      Comment[]
  versions      ArticleVersion[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime? // 软删除
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
  SCHEDULED
  TRASHED
}

// 文章版本历史
model ArticleVersion {
  id        String   @id @default(cuid())
  articleId String
  article   Article  @relation(fields: [articleId], references: [id])
  title     String
  content   String
  createdAt DateTime @default(now())
}

// 分类表
model Category {
  id        String     @id @default(cuid())
  name      String
  slug      String     @unique
  parentId  String?
  parent    Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children  Category[] @relation("CategoryTree")
  articles  Article[]
  sortOrder Int        @default(0)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

// 标签表
model Tag {
  id        String       @id @default(cuid())
  name      String       @unique
  slug      String       @unique
  articles  ArticleTag[]
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
}

// 文章-标签关联表
model ArticleTag {
  articleId String
  article   Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  tagId     String
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@id([articleId, tagId])
}

// 独立页面表
model Page {
  id        String   @id @default(cuid())
  title     String
  slug      String   @unique
  content   String
  sortOrder Int      @default(0)
  showInNav Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// 媒体文件表
model Media {
  id          String   @id @default(cuid())
  filename    String
  originalName String
  mimeType    String
  size        Int
  path        String
  thumbnailPath String?
  createdAt   DateTime @default(now())
}

// 知识库文档表
model KnowledgeDoc {
  id        String         @id @default(cuid())
  title     String
  slug      String         @unique
  content   String
  parentId  String?
  parent    KnowledgeDoc?  @relation("DocTree", fields: [parentId], references: [id])
  children  KnowledgeDoc[] @relation("DocTree")
  sortOrder Int            @default(0)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt
}

// 评论表
model Comment {
  id          String        @id @default(cuid())
  content     String
  authorName  String
  authorEmail String
  status      CommentStatus @default(PENDING)
  articleId   String
  article     Article       @relation(fields: [articleId], references: [id], onDelete: Cascade)
  userId      String?       // 登录用户评论
  user        User?         @relation(fields: [userId], references: [id])
  parentId    String?
  parent      Comment?      @relation("CommentTree", fields: [parentId], references: [id])
  replies     Comment[]     @relation("CommentTree")
  createdAt   DateTime      @default(now())
}

enum CommentStatus {
  PENDING
  APPROVED
  SPAM
  TRASHED
}

// AI 模型配置表
model AIModel {
  id        String   @id @default(cuid())
  name      String
  provider  String   // openai, claude, qwen, etc.
  apiUrl    String
  apiKey    String   // 加密存储
  modelId   String   // 具体模型标识，如 gpt-4
  isDefault Boolean  @default(false)
  isEnabled Boolean  @default(true)
  config    Json?    // 额外配置参数
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// AI 使用日志
model AIUsageLog {
  id        String   @id @default(cuid())
  modelId   String
  prompt    String
  response  String?
  tokens    Int?
  success   Boolean
  error     String?
  createdAt DateTime @default(now())
}

// 主题配置表
model Theme {
  id        String   @id @default(cuid())
  name      String   @unique
  version   String
  path      String
  isActive  Boolean  @default(false)
  config    Json?    // 主题自定义配置
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// 插件配置表
model Plugin {
  id           String   @id @default(cuid())
  name         String   @unique
  version      String
  path         String
  isEnabled    Boolean  @default(false)
  config       Json?    // 插件配置
  dependencies Json?    // 依赖的其他插件
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

// 系统设置表
model Setting {
  key       String   @id
  value     Json
  updatedAt DateTime @updatedAt
}

// 访问统计表
model PageView {
  id        String   @id @default(cuid())
  articleId String?
  path      String
  ip        String?
  userAgent String?
  referer   String?
  createdAt DateTime @default(now())
}
```

### 核心接口定义

```typescript
// AI 模型统一接口
interface AIModelAdapter {
  name: string;
  generate(prompt: string, options?: GenerateOptions): Promise<GenerateResult>;
  testConnection(): Promise<boolean>;
}

interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

interface GenerateResult {
  title: string;
  content: string;
  tags: string[];
  tokensUsed: number;
}

// 主题接口
interface ThemeManifest {
  name: string;
  version: string;
  author: string;
  description: string;
  variables: ThemeVariable[];
  templates: string[];
}

interface ThemeVariable {
  key: string;
  label: string;
  type: 'color' | 'font' | 'size' | 'select';
  default: string;
  options?: string[];
}

// 插件接口
interface PluginManifest {
  name: string;
  version: string;
  author: string;
  description: string;
  dependencies?: string[];
  hooks: PluginHook[];
  routes?: PluginRoute[];
  settings?: PluginSetting[];
}

interface PluginHook {
  name: string; // 钩子名称
  handler: string; // 处理函数路径
}

// 插件生命周期钩子
type PluginLifecycleHooks = {
  onInstall?: () => Promise<void>;
  onEnable?: () => Promise<void>;
  onDisable?: () => Promise<void>;
  onUninstall?: () => Promise<void>;
};

// 插件扩展点
type PluginExtensionPoints = {
  'article:beforeSave'?: (article: Article) => Article;
  'article:afterSave'?: (article: Article) => void;
  'article:beforeRender'?: (content: string) => string;
  'editor:toolbar'?: () => ToolbarItem[];
  'admin:menu'?: () => MenuItem[];
  'theme:variables'?: () => ThemeVariable[];
};
```


## 正确性属性

*属性是指在系统所有有效执行中都应保持为真的特征或行为——本质上是关于系统应该做什么的形式化陈述。属性是人类可读规格说明与机器可验证正确性保证之间的桥梁。*

### Property 1: Markdown 往返一致性
*对于任意* 有效的 Markdown 文本，将其解析为 HTML 后再转换回 Markdown，应该产生语义等效的文本
**Validates: Requirements 3.5, 3.6**

### Property 2: 备份数据往返一致性
*对于任意* 系统数据（文章、页面、分类、标签），导出为备份格式后再导入，应该恢复所有内容和关联关系
**Validates: Requirements 13.1, 13.2**

### Property 3: 文章创建生成唯一标识符
*对于任意* 新创建的文章，系统应该生成唯一的标识符，且初始状态为草稿
**Validates: Requirements 2.1**

### Property 4: 已发布文章在前台可见
*对于任意* 状态为"已发布"的文章，该文章应该出现在前台文章列表中
**Validates: Requirements 2.3**

### Property 5: 软删除保留文章
*对于任意* 被删除的文章，该文章应该移至回收站（状态为TRASHED）而非永久删除
**Validates: Requirements 2.4, 13.3**

### Property 6: 文章分类标签关联正确性
*对于任意* 文章和其分配的分类、标签，关联关系应该正确建立且可查询
**Validates: Requirements 2.6**

### Property 7: 分类层级结构正确性
*对于任意* 带有父分类的分类，层级关系应该正确建立，子分类可通过父分类访问
**Validates: Requirements 4.1**

### Property 8: 标签多文章关联
*对于任意* 标签，该标签应该能够关联到多篇文章，且关联关系双向可查
**Validates: Requirements 4.2**

### Property 9: 分类删除文章迁移
*对于任意* 已关联文章的分类被删除时，相关文章应该移至默认分类
**Validates: Requirements 4.3**

### Property 10: 标签合并文章转移
*对于任意* 两个标签的合并操作，源标签的所有关联文章应该转移到目标标签
**Validates: Requirements 4.4**

### Property 11: 文章列表时间倒序
*对于任意* 文章列表查询，返回的文章应该按发布时间倒序排列
**Validates: Requirements 5.1**

### Property 12: 分类筛选正确性
*对于任意* 分类筛选查询，返回的文章应该全部属于该分类
**Validates: Requirements 5.4**

### Property 13: 标签筛选正确性
*对于任意* 标签筛选查询，返回的文章应该全部包含该标签
**Validates: Requirements 5.5**

### Property 14: 搜索结果相关性
*对于任意* 搜索关键词，返回的文章标题或内容应该包含该关键词
**Validates: Requirements 5.6**

### Property 15: 目录生成正确性
*对于任意* 包含多个标题的 Markdown 内容，生成的目录应该包含所有标题且层级正确
**Validates: Requirements 5.3**

### Property 16: 页面独立于文章列表
*对于任意* 创建的页面，该页面不应该出现在文章列表中
**Validates: Requirements 6.1**

### Property 17: 页面固定链接访问
*对于任意* 设置了固定链接的页面，通过该链接应该能够访问到页面内容
**Validates: Requirements 6.2**

### Property 18: 导航菜单页面显示
*对于任意* showInNav 为 true 的页面，该页面应该出现在导航菜单中
**Validates: Requirements 6.3**

### Property 19: 图片上传生成缩略图
*对于任意* 上传的图片，系统应该存储原图并生成缩略图
**Validates: Requirements 7.1**

### Property 20: 媒体库完整性
*对于任意* 已上传的媒体文件，该文件应该出现在媒体库列表中
**Validates: Requirements 7.2**

### Property 21: 知识库层级结构
*对于任意* 带有父文档的知识库文档，层级关系应该正确建立
**Validates: Requirements 8.1**

### Property 22: 知识库排序调整
*对于任意* 知识库文档的排序调整，sortOrder 应该正确更新
**Validates: Requirements 8.2**

### Property 23: 评论文章关联
*对于任意* 提交的评论，该评论应该正确关联到对应的文章
**Validates: Requirements 10.1**

### Property 24: 评论状态更新
*对于任意* 评论审核操作，评论状态应该正确更新为对应状态
**Validates: Requirements 10.2**

### Property 25: 浏览量统计
*对于任意* 文章页面访问，该文章的浏览量应该增加
**Validates: Requirements 11.1**

### Property 26: 热门文章排序
*对于任意* 热门文章查询，返回的文章应该按浏览量降序排列
**Validates: Requirements 11.2**

### Property 27: 文章版本历史
*对于任意* 文章编辑操作，应该创建新的版本记录
**Validates: Requirements 13.4**

### Property 28: AI 模型配置存储
*对于任意* AI 模型配置，所有字段（名称、API地址、密钥、参数）应该正确存储
**Validates: Requirements 15.1**

### Property 29: 默认模型唯一性
*对于任意* 时刻，系统中最多只有一个 AI 模型被设置为默认
**Validates: Requirements 15.3**

### Property 30: AI 生成结果完整性
*对于任意* AI 生成请求，返回结果应该包含标题、正文和推荐标签
**Validates: Requirements 16.2**

### Property 31: AI 使用日志记录
*对于任意* AI 撰写功能调用，应该创建对应的使用日志记录
**Validates: Requirements 16.6**

### Property 32: 活跃主题唯一性
*对于任意* 时刻，系统中最多只有一个主题处于激活状态
**Validates: Requirements 17.4, 17.7**

### Property 33: 主题安装注册
*对于任意* 安装的主题，该主题应该出现在主题列表中
**Validates: Requirements 17.3**

### Property 34: 主题配置覆盖
*对于任意* 主题自定义配置，自定义值应该覆盖主题默认值
**Validates: Requirements 17.5**

### Property 35: 插件安装注册
*对于任意* 安装的插件，该插件应该出现在插件列表中
**Validates: Requirements 18.1**

### Property 36: 插件启用状态
*对于任意* 启用的插件，其 isEnabled 状态应该为 true
**Validates: Requirements 18.2**

### Property 37: 插件禁用保留配置
*对于任意* 禁用的插件，其配置信息应该保留
**Validates: Requirements 18.3**

### Property 38: 插件依赖加载顺序
*对于任意* 有依赖关系的插件，被依赖的插件应该先于依赖它的插件加载
**Validates: Requirements 18.7**

### Property 39: 插件错误隔离
*对于任意* 插件执行错误，系统核心功能应该不受影响
**Validates: Requirements 18.8**

## 错误处理

### 错误分类

| 错误类型 | HTTP 状态码 | 处理方式 |
|----------|-------------|----------|
| 认证失败 | 401 | 返回错误信息，记录日志 |
| 权限不足 | 403 | 返回错误信息 |
| 资源不存在 | 404 | 返回错误信息 |
| 参数验证失败 | 400 | 返回详细的验证错误 |
| 服务器错误 | 500 | 记录错误日志，返回通用错误信息 |
| AI 服务错误 | 503 | 返回错误信息，允许重试 |

### 错误响应格式

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

## 测试策略

### 单元测试

使用 Vitest 进行单元测试，覆盖：
- 服务层业务逻辑
- 数据验证函数
- Markdown 解析器
- 工具函数

### 属性测试

使用 fast-check 进行属性测试，每个属性测试运行至少 100 次迭代。

属性测试重点覆盖：
- Markdown 往返一致性（Property 1）
- 备份数据往返一致性（Property 2）
- 数据关联正确性（Property 6-10）
- 列表排序和筛选（Property 11-14）
- 状态唯一性约束（Property 29, 32）

每个属性测试必须使用以下格式标注：
```typescript
// **Feature: blog-system, Property {number}: {property_text}**
// **Validates: Requirements X.Y**
```

### 集成测试

使用 Supertest 进行 API 集成测试，覆盖：
- 完整的 CRUD 流程
- 认证和授权流程
- 文件上传下载
- AI 服务调用（使用 mock）

### 测试覆盖率目标

- 单元测试：核心业务逻辑 80% 以上
- 属性测试：所有正确性属性 100% 覆盖
- 集成测试：所有 API 端点 100% 覆盖
