# API 文档

## 基础信息

- 基础 URL: `http://localhost:3001/api`
- 认证方式: Bearer Token (JWT)
- 响应格式: JSON

## 认证

### 登录
```
POST /auth/login
```

请求体:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

响应:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "xxx",
      "username": "admin",
      "email": "admin@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 修改密码
```
PUT /auth/password
Authorization: Bearer <token>
```

请求体:
```json
{
  "oldPassword": "current-password",
  "newPassword": "new-password"
}
```

---

## 文章管理

### 获取文章列表
```
GET /articles?page=1&pageSize=10&status=published&categoryId=xxx&search=keyword
```

### 获取单篇文章
```
GET /articles/:id
```

### 创建文章
```
POST /articles
Authorization: Bearer <token>
```

请求体:
```json
{
  "title": "文章标题",
  "content": "Markdown 内容",
  "excerpt": "摘要",
  "slug": "article-slug",
  "status": "draft",
  "categoryId": "xxx",
  "tagIds": ["tag1", "tag2"],
  "seoTitle": "SEO 标题",
  "seoDescription": "SEO 描述"
}
```

### 更新文章
```
PUT /articles/:id
Authorization: Bearer <token>
```

### 删除文章
```
DELETE /articles/:id
Authorization: Bearer <token>
```

### 发布文章
```
POST /articles/:id/publish
Authorization: Bearer <token>
```

### 公开接口 - 获取已发布文章
```
GET /articles/public?page=1&pageSize=10&categoryId=xxx&tagId=xxx&search=keyword
```

### 公开接口 - 获取文章详情
```
GET /articles/public/:slug
```

---

## 分类管理

### 获取所有分类
```
GET /categories
```

### 创建分类
```
POST /categories
Authorization: Bearer <token>
```

请求体:
```json
{
  "name": "分类名称",
  "slug": "category-slug",
  "description": "分类描述",
  "parentId": "父分类ID"
}
```

### 更新分类
```
PUT /categories/:id
Authorization: Bearer <token>
```

### 删除分类
```
DELETE /categories/:id
Authorization: Bearer <token>
```

---

## 标签管理

### 获取所有标签
```
GET /tags
```

### 创建标签
```
POST /tags
Authorization: Bearer <token>
```

请求体:
```json
{
  "name": "标签名称",
  "slug": "tag-slug"
}
```

### 合并标签
```
POST /tags/merge
Authorization: Bearer <token>
```

请求体:
```json
{
  "sourceId": "源标签ID",
  "targetId": "目标标签ID"
}
```

---

## 页面管理

### 获取所有页面
```
GET /pages
```

### 创建页面
```
POST /pages
Authorization: Bearer <token>
```

请求体:
```json
{
  "title": "页面标题",
  "slug": "page-slug",
  "content": "Markdown 内容",
  "isPublished": true,
  "showInNav": true,
  "order": 0
}
```

### 公开接口 - 获取页面
```
GET /pages/public/:slug
```

---

## 媒体管理

### 获取媒体列表
```
GET /media
Authorization: Bearer <token>
```

### 上传文件
```
POST /media/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### 删除文件
```
DELETE /media/:id
Authorization: Bearer <token>
```

---

## 知识库

### 获取文档列表
```
GET /knowledge
```

### 创建文档
```
POST /knowledge
Authorization: Bearer <token>
```

请求体:
```json
{
  "title": "文档标题",
  "content": "Markdown 内容",
  "parentId": "父文档ID",
  "order": 0
}
```

### 调整排序
```
PUT /knowledge/reorder
Authorization: Bearer <token>
```

---

## 评论管理

### 获取评论列表
```
GET /comments?page=1&pageSize=20&status=pending&articleId=xxx
Authorization: Bearer <token>
```

### 提交评论 (公开)
```
POST /comments
```

请求体:
```json
{
  "content": "评论内容",
  "authorName": "昵称",
  "authorEmail": "email@example.com",
  "authorUrl": "https://example.com",
  "articleId": "文章ID"
}
```

### 批准评论
```
PUT /comments/:id/approve
Authorization: Bearer <token>
```

### 标记垃圾
```
PUT /comments/:id/spam
Authorization: Bearer <token>
```

---

## 访问统计

### 获取统计数据
```
GET /stats
Authorization: Bearer <token>
```

### 记录访问
```
POST /stats/view
```

请求体:
```json
{
  "articleId": "文章ID"
}
```

---

## 数据备份

### 导出数据
```
POST /backup/export
Authorization: Bearer <token>
```

### 导入数据
```
POST /backup/import
Authorization: Bearer <token>
```

---

## AI 功能

### 获取 AI 模型列表
```
GET /ai/models
Authorization: Bearer <token>
```

### 添加 AI 模型
```
POST /ai/models
Authorization: Bearer <token>
```

请求体:
```json
{
  "name": "模型名称",
  "provider": "openai",
  "model": "gpt-4",
  "apiKey": "sk-xxx",
  "baseUrl": "https://api.openai.com/v1"
}
```

### 设置默认模型
```
PUT /ai/models/:id/default
Authorization: Bearer <token>
```

### 测试模型连接
```
POST /ai/models/:id/test
Authorization: Bearer <token>
```

### AI 生成文章
```
POST /ai/generate
Authorization: Bearer <token>
```

请求体:
```json
{
  "idea": "文章想法或主题描述"
}
```

响应:
```json
{
  "success": true,
  "data": {
    "title": "生成的标题",
    "content": "生成的 Markdown 内容",
    "tags": ["推荐标签1", "推荐标签2"]
  }
}
```

---

## 主题管理

### 获取主题列表
```
GET /themes
```

### 获取当前主题
```
GET /themes/active
```

### 安装主题
```
POST /themes/install
Authorization: Bearer <token>
```

### 激活主题
```
PUT /themes/:id/activate
Authorization: Bearer <token>
```

### 更新主题配置
```
PUT /themes/:id/config
Authorization: Bearer <token>
```

---

## 插件管理

### 获取插件列表
```
GET /plugins
```

### 获取已启用插件
```
GET /plugins/enabled
```

### 安装插件
```
POST /plugins/install
Authorization: Bearer <token>
```

### 启用插件
```
PUT /plugins/:id/enable
Authorization: Bearer <token>
```

### 禁用插件
```
PUT /plugins/:id/disable
Authorization: Bearer <token>
```

---

## 错误响应

所有错误响应格式:
```json
{
  "success": false,
  "error": "错误信息",
  "code": "ERROR_CODE"
}
```

常见错误码:
- `UNAUTHORIZED` - 未认证
- `FORBIDDEN` - 无权限
- `NOT_FOUND` - 资源不存在
- `VALIDATION_ERROR` - 参数验证失败
- `INTERNAL_ERROR` - 服务器内部错误
