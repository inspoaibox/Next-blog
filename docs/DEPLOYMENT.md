# 部署指南

## 本地开发

### 1. 环境准备

确保已安装:
- Node.js >= 18
- npm >= 9

### 2. 安装依赖

```bash
# 在项目根目录
npm install
```

### 3. 配置环境变量

后端配置：
```bash
cd packages/server
cp .env.example .env
```

编辑 `packages/server/.env`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
ENCRYPTION_KEY="your-32-character-key-here"
PORT=3012
```

前端配置：
```bash
cd packages/web
cp .env.local.example .env.local
```

编辑 `packages/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:3012
```

### 4. 初始化数据库

```bash
cd packages/server

# 运行数据库迁移
npx prisma migrate dev

# 初始化数据 (创建管理员账户)
npm run db:seed
```

默认管理员账户:
- 用户名: `admin`
- 密码: `admin123`

### 5. 启动服务

**方式一：同时启动（推荐）**
```bash
# 在项目根目录
npm run dev
```

**方式二：分别启动**

终端 1 - 后端:
```bash
cd packages/server
npm run dev
```

终端 2 - 前端:
```bash
cd packages/web
npm run dev
```

访问:
- 前台: http://localhost:3011
- 后台: http://localhost:3011/admin
- API: http://localhost:3012/api

---

## 生产部署

### 方式一: 传统服务器部署

#### 1. 构建项目

```bash
# 构建后端
cd packages/server
npm run build

# 构建前端 (Next.js)
cd packages/web
npm run build
```

#### 2. 配置生产环境变量

后端 `packages/server/.env`:
```env
DATABASE_URL="file:./prod.db"
JWT_SECRET="your-production-secret-key"
ENCRYPTION_KEY="your-32-char-production-key"
PORT=3012
NODE_ENV=production
ALLOWED_ORIGINS=https://your-domain.com
```

前端 `packages/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:3012
```

#### 3. 运行数据库迁移

```bash
cd packages/server
npx prisma migrate deploy
npm run db:seed  # 首次部署
```

#### 4. 启动服务

使用 PM2 管理进程:
```bash
npm install -g pm2

# 启动后端
cd packages/server
pm2 start dist/index.js --name blog-server

# 启动前端 (Next.js 需要 Node.js 运行时)
cd packages/web
pm2 start npm --name blog-web -- start
```

#### 5. 配置 Web 服务器

##### Caddy 配置（推荐）

Caddy 会自动处理 HTTPS 证书，配置更简洁。

`Caddyfile`:
```caddyfile
your-domain.com {
    # 前端 Next.js 反向代理
    reverse_proxy localhost:3011
    
    # 媒体文件直接服务
    handle /uploads/* {
        root * /path/to/packages/server
        file_server
    }
}
```

如果后端 API 使用不同端口或域名：

```caddyfile
# 前端
your-domain.com {
    reverse_proxy localhost:3011
}

# 后端 API（可选，如果需要直接访问）
api.your-domain.com {
    reverse_proxy localhost:3012
}
```

##### Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端 Next.js 反向代理
    location / {
        proxy_pass http://localhost:3011;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 媒体文件
    location /uploads {
        alias /path/to/packages/server/uploads;
    }
}
```

#### 6. 配置 CORS（跨域）

如果前后端使用不同域名，需要配置 `ALLOWED_ORIGINS` 环境变量：

```env
# 单个域名
ALLOWED_ORIGINS=https://www.your-domain.com

# 多个域名（逗号分隔）
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# 允许所有（仅开发环境使用）
ALLOWED_ORIGINS=*
```

---

### 方式二: Docker 部署

#### 1. 创建 Dockerfile

后端 `packages/server/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY prisma ./prisma
RUN npx prisma generate

COPY dist ./dist

ENV NODE_ENV=production
EXPOSE 3012

CMD ["node", "dist/index.js"]
```

前端 `packages/web/Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3011
ENV PORT 3011

CMD ["node", "server.js"]
```

注意：需要在 `next.config.js` 中启用 standalone 输出：
```javascript
const nextConfig = {
  output: 'standalone',
  // ... 其他配置
};
```

#### 2. Docker Compose

`docker-compose.yml`:
```yaml
version: '3.8'

services:
  api:
    build: ./packages/server
    ports:
      - "3012:3012"
    environment:
      - DATABASE_URL=file:./data/prod.db
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads

  web:
    build: ./packages/web
    ports:
      - "3011:3011"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:3012
    depends_on:
      - api
```

#### 3. 启动

```bash
docker-compose up -d
```

---

## 数据库备份

### 手动备份

```bash
# SQLite 数据库文件位置
packages/server/prisma/dev.db  # 开发环境
packages/server/prisma/prod.db # 生产环境

# 复制备份
cp packages/server/prisma/prod.db backups/prod-$(date +%Y%m%d).db
```

### 使用系统备份功能

通过 API 导出:
```bash
curl -X POST http://localhost:3012/api/backup/export \
  -H "Authorization: Bearer <token>" \
  -o backup.json
```

---

## 常见问题

### 1. 数据库迁移失败

```bash
# 重置数据库
npx prisma migrate reset

# 重新迁移
npx prisma migrate dev
```

### 2. 端口被占用

修改环境变量中的端口：
- 后端：修改 `packages/server/.env` 中的 `PORT`
- 前端：使用 `npm run dev -- -p 3013` 或修改 `package.json`

### 3. 前端无法连接后端

检查 `packages/web/.env.local` 中的 API 地址配置：
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:3012
```

注意：Windows 上建议使用 `127.0.0.1` 而不是 `localhost`，避免 IPv6 连接问题。

### 4. CORS 跨域错误

如果使用反向代理部署，确保配置了正确的 `ALLOWED_ORIGINS`：
```bash
# 在后端 .env 中设置
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### 5. 图片上传失败

确保 `uploads` 目录存在且有写入权限:
```bash
mkdir -p packages/server/uploads
chmod 755 packages/server/uploads
```

### 6. Next.js 构建时 API 错误

构建时需要后端服务运行，因为 Next.js 会在构建时预渲染页面：
```bash
# 先启动后端
cd packages/server && npm run dev &

# 再构建前端
cd packages/web && npm run build
```

或者在 `next.config.js` 中配置动态渲染，跳过构建时的数据获取。

---

## 监控与日志

### PM2 监控

```bash
pm2 monit
pm2 logs blog-server
pm2 logs blog-web
```

### 健康检查

```bash
# 后端健康检查
curl http://localhost:3012/api/health

# 前端健康检查
curl http://localhost:3011
```

后端响应:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## SEO 验证

部署后，可以通过以下方式验证 SSR 是否正常工作：

1. **查看页面源代码**：在浏览器中访问首页，右键"查看页面源代码"，应该能看到完整的 HTML 内容（包括文章标题、摘要等）

2. **使用 curl 测试**：
```bash
curl -s http://your-domain.com | head -100
```

3. **Google Search Console**：提交网站后，使用"网址检查"工具查看 Google 抓取的内容
