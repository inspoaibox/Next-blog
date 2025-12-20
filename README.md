# 博客系统

一个功能完整的个人博客平台，基于 Node.js + React + TypeScript 构建。

## 功能特性

### 内容管理
- **文章管理** - 创建、编辑、发布文章，支持草稿、定时发布、软删除
- **Markdown 编辑** - 支持 Shiki 代码高亮、自动生成目录
- **分类管理** - 支持层级分类（父子关系）
- **标签管理** - 标签创建、合并功能
- **页面管理** - 独立页面，支持导航菜单配置
- **媒体库** - 图片上传、缩略图生成
- **知识库** - 层级文档管理，支持排序

### 互动功能
- **评论系统** - 评论提交、审核、垃圾检测
- **访问统计** - 浏览量统计、热门文章排行

### AI 功能
- **多模型支持** - OpenAI、Claude、通义千问
- **AI 辅助写作** - 根据想法生成完整文章
- **API 密钥加密存储**

### 系统功能
- **用户认证** - JWT + bcrypt 安全认证
- **主题系统** - 深色/浅色模式切换
- **插件系统** - 插件安装、启用/禁用、依赖管理
- **数据备份** - JSON/Markdown 导出导入
- **SEO 优化** - 自定义标题、描述、固定链接

## 技术栈

### 后端
- Node.js + Express
- TypeScript
- Prisma ORM + SQLite
- JWT 认证
- Vitest 测试框架

### 前端
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Zustand 状态管理
- TanStack Query

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
```bash
# 复制环境变量模板
cp packages/server/.env.example packages/server/.env

# 编辑 .env 文件，设置以下变量：
# DATABASE_URL="file:./dev.db"
# JWT_SECRET="your-secret-key"
# ENCRYPTION_KEY="your-32-char-encryption-key"
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

2. **启动后端**
```bash
cd packages/server
npm run build
npm start
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
│   └── web/                    # 前端应用
│       └── src/
│           ├── components/     # 通用组件
│           ├── pages/          # 页面组件
│           ├── layouts/        # 布局组件
│           ├── hooks/          # 自定义 Hooks
│           ├── stores/         # 状态管理
│           ├── lib/            # 工具函数
│           └── types/          # 类型定义
│
└── .kiro/specs/                # 项目规格文档
```

## API 接口

| 路由 | 说明 |
|------|------|
| `/api/auth` | 用户认证 |
| `/api/articles` | 文章管理 |
| `/api/categories` | 分类管理 |
| `/api/tags` | 标签管理 |
| `/api/pages` | 页面管理 |
| `/api/media` | 媒体管理 |
| `/api/knowledge` | 知识库 |
| `/api/comments` | 评论管理 |
| `/api/stats` | 访问统计 |
| `/api/backup` | 数据备份 |
| `/api/ai` | AI 功能 |
| `/api/themes` | 主题管理 |
| `/api/plugins` | 插件管理 |

## 默认账户

运行 `npm run db:seed` 后会创建默认管理员账户：
- 用户名: `admin`
- 密码: `admin123`

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
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建

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

# JWT 密钥
JWT_SECRET="your-jwt-secret-key"

# API 密钥加密密钥 (32字符)
ENCRYPTION_KEY="your-32-character-encryption-key"

# 服务端口
PORT=3012
```

### AI 模型配置

在后台管理界面 -> 系统设置 -> AI 模型 中配置：

1. 添加 AI 模型（OpenAI/Claude/通义千问）
2. 填写 API Key
3. 设置默认模型

## License

MIT
