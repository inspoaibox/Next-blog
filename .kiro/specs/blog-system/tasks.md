# 实现计划

- [x] 1. 项目初始化与基础架构

  - [x] 1.1 创建项目结构，初始化 Node.js 后端和 React 前端


    - 创建 monorepo 结构：`packages/server` 和 `packages/web`
    - 配置 TypeScript、ESLint、Prettier
    - 配置 Vitest 和 fast-check 测试框架


    - _Requirements: 全局_
  - [x] 1.2 配置 Prisma ORM 和 SQLite 数据库
    - 创建 Prisma schema 文件


    - 定义所有数据模型

    - 生成 Prisma Client


    - _Requirements: 全局_
  - [x] 1.3 编写属性测试：文章创建生成唯一标识符


    - **Property 3: 文章创建生成唯一标识符**
    - **Validates: Requirements 2.1**



- [x] 2. 用户认证模块
  - [x] 2.1 实现用户模型和密码加密


    - 使用 bcrypt 进行密码哈希
    - 实现密码验证逻辑


    - _Requirements: 1.1, 1.3_
  - [x] 2.2 实现 JWT 认证中间件
    - 生成和验证 JWT token


    - 实现会话管理


    - _Requirements: 1.1, 1.4_
  - [x] 2.3 实现登录、登出、修改密码 API
    - POST /api/auth/login
    - POST /api/auth/logout
    - PUT /api/auth/password
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 2.4 编写属性测试：密码修改后登录验证
    - **Property: 密码修改后使用新密码登录成功**
    - **Validates: Requirements 1.3**

- [x] 3. 文章管理模块
  - [x] 3.1 实现文章 CRUD 服务
    - 创建、读取、更新、删除文章
    - 实现软删除（移至回收站）
    - 实现文章状态管理（草稿/已发布/定时/回收站）
    - _Requirements: 2.1, 2.3, 2.4_
  - [x] 3.2 编写属性测试：软删除保留文章
    - **Property 5: 软删除保留文章**
    - **Validates: Requirements 2.4, 13.3**
  - [x] 3.3 编写属性测试：已发布文章在前台可见
    - **Property 4: 已发布文章在前台可见**
    - **Validates: Requirements 2.3**
  - [x] 3.4 实现文章版本历史
    - 每次编辑保存版本记录
    - 支持版本回滚
    - _Requirements: 13.4_
  - [x] 3.5 编写属性测试：文章版本历史
    - **Property 27: 文章版本历史**
    - **Validates: Requirements 13.4**
  - [x] 3.6 实现文章 API 路由
    - GET/POST/PUT/DELETE /api/articles
    - POST /api/articles/:id/publish
    - _Requirements: 2.1-2.6_

- [x] 4. Checkpoint - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。

- [x] 5. 分类与标签模块
  - [x] 5.1 实现分类 CRUD 服务
    - 支持层级分类（父子关系）
    - 删除分类时文章迁移到默认分类
    - _Requirements: 4.1, 4.3_
  - [x] 5.2 编写属性测试：分类层级结构正确性
    - **Property 7: 分类层级结构正确性**
    - **Validates: Requirements 4.1**
  - [x] 5.3 编写属性测试：分类删除文章迁移
    - **Property 9: 分类删除文章迁移**
    - **Validates: Requirements 4.3**
  - [x] 5.4 实现标签 CRUD 服务
    - 标签创建和管理
    - 标签合并功能
    - _Requirements: 4.2, 4.4_
  - [x] 5.5 编写属性测试：标签多文章关联
    - **Property 8: 标签多文章关联**
    - **Validates: Requirements 4.2**
  - [x] 5.6 编写属性测试：标签合并文章转移
    - **Property 10: 标签合并文章转移**
    - **Validates: Requirements 4.4**
  - [x] 5.7 实现文章与分类、标签的关联
    - 文章分配分类和标签
    - 关联关系查询
    - _Requirements: 2.6_
  - [x] 5.8 编写属性测试：文章分类标签关联正确性
    - **Property 6: 文章分类标签关联正确性**
    - **Validates: Requirements 2.6**
  - [x] 5.9 实现分类和标签 API 路由
    - /api/categories 和 /api/tags 完整 CRUD
    - POST /api/tags/merge
    - _Requirements: 4.1-4.4_

- [x] 6. Markdown 解析模块
  - [x] 6.1 实现 Markdown 解析器
    - 使用 unified + remark + rehype
    - 支持标题、列表、引用、代码块
    - 集成 Shiki 代码高亮
    - _Requirements: 3.2, 3.3, 3.5_
  - [ ] 6.2 实现 HTML 到 Markdown 转换
    - 用于导入功能
    - _Requirements: 3.6_
  - [ ] 6.3 编写属性测试：Markdown 往返一致性
    - **Property 1: Markdown 往返一致性**
    - **Validates: Requirements 3.5, 3.6**
  - [x] 6.4 实现目录生成功能
    - 从 Markdown 标题生成目录树
    - _Requirements: 5.3_
  - [x] 6.5 编写属性测试：目录生成正确性
    - **Property 15: 目录生成正确性**
    - **Validates: Requirements 5.3**

- [x] 7. Checkpoint - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。

- [x] 8. 前台展示模块
  - [x] 8.1 实现文章列表查询服务
    - 分页查询
    - 按时间倒序排列
    - 分类和标签筛选
    - _Requirements: 5.1, 5.4, 5.5_
  - [x] 8.2 编写属性测试：文章列表时间倒序
    - **Property 11: 文章列表时间倒序**
    - **Validates: Requirements 5.1**
  - [x] 8.3 编写属性测试：分类筛选正确性
    - **Property 12: 分类筛选正确性**
    - **Validates: Requirements 5.4**
  - [x] 8.4 编写属性测试：标签筛选正确性
    - **Property 13: 标签筛选正确性**
    - **Validates: Requirements 5.5**
  - [x] 8.5 实现搜索功能
    - 标题和内容全文搜索
    - _Requirements: 5.6_
  - [x] 8.6 编写属性测试：搜索结果相关性
    - **Property 14: 搜索结果相关性**
    - **Validates: Requirements 5.6**
  - [x] 8.7 实现前台 API 路由
    - 公开的文章列表和详情接口
    - _Requirements: 5.1-5.6_

- [x] 9. 页面管理模块
  - [x] 9.1 实现页面 CRUD 服务
    - 独立于文章的页面管理
    - 固定链接设置
    - 导航菜单配置
    - _Requirements: 6.1, 6.2, 6.3_
  - [x] 9.2 编写属性测试：页面独立于文章列表
    - **Property 16: 页面独立于文章列表**
    - **Validates: Requirements 6.1**
  - [x] 9.3 编写属性测试：页面固定链接访问
    - **Property 17: 页面固定链接访问**
    - **Validates: Requirements 6.2**
  - [x] 9.4 编写属性测试：导航菜单页面显示
    - **Property 18: 导航菜单页面显示**
    - **Validates: Requirements 6.3**
  - [x] 9.5 实现页面 API 路由
    - /api/pages 完整 CRUD
    - _Requirements: 6.1-6.3_

- [x] 10. Checkpoint - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。


- [x] 11. 媒体管理模块
  - [x] 11.1 实现文件上传服务
    - 图片上传和存储
    - 缩略图生成
    - _Requirements: 7.1, 3.4_
  - [x] 11.2 编写属性测试：图片上传生成缩略图
    - **Property 19: 图片上传生成缩略图**
    - **Validates: Requirements 7.1**
  - [x] 11.3 实现媒体库管理
    - 媒体列表查询
    - 文件删除
    - 文件下载
    - _Requirements: 7.2, 7.3, 7.4_
  - [x] 11.4 编写属性测试：媒体库完整性
    - **Property 20: 媒体库完整性**
    - **Validates: Requirements 7.2**
  - [x] 11.5 实现媒体 API 路由
    - /api/media 完整 CRUD
    - POST /api/media/upload
    - _Requirements: 7.1-7.4_

- [x] 12. 知识库模块
  - [x] 12.1 实现知识库文档服务
    - 文档 CRUD
    - 层级父子关系
    - 排序调整
    - _Requirements: 8.1, 8.2_
  - [x] 12.2 编写属性测试：知识库层级结构
    - **Property 21: 知识库层级结构**
    - **Validates: Requirements 8.1**
  - [x] 12.3 编写属性测试：知识库排序调整
    - **Property 22: 知识库排序调整**
    - **Validates: Requirements 8.2**
  - [x] 12.4 实现知识库 API 路由
    - /api/knowledge 完整 CRUD
    - PUT /api/knowledge/reorder
    - _Requirements: 8.1-8.3_

- [x] 13. 评论系统模块
  - [x] 13.1 实现评论服务
    - 评论提交
    - 评论审核（批准/垃圾/删除）
    - 评论与文章关联
    - _Requirements: 10.1, 10.2_
  - [x] 13.2 编写属性测试：评论文章关联
    - **Property 23: 评论文章关联**
    - **Validates: Requirements 10.1**
  - [x] 13.3 编写属性测试：评论状态更新
    - **Property 24: 评论状态更新**
    - **Validates: Requirements 10.2**
  - [x] 13.4 实现简单的垃圾评论检测
    - 基于关键词的垃圾检测
    - _Requirements: 10.4_
  - [x] 13.5 实现评论 API 路由
    - /api/comments 完整 CRUD
    - PUT /api/comments/:id/approve
    - PUT /api/comments/:id/spam
    - _Requirements: 10.1-10.4_

- [x] 14. Checkpoint - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。

- [x] 15. 访问统计模块
  - [x] 15.1 实现浏览量统计服务
    - 记录页面访问
    - 更新文章浏览量
    - _Requirements: 11.1_
  - [x] 15.2 编写属性测试：浏览量统计
    - **Property 25: 浏览量统计**
    - **Validates: Requirements 11.1**
  - [x] 15.3 实现热门文章排行
    - 按浏览量排序
    - _Requirements: 11.2_
  - [x] 15.4 编写属性测试：热门文章排序
    - **Property 26: 热门文章排序**
    - **Validates: Requirements 11.2**
  - [x] 15.5 实现统计 API 路由
    - GET /api/stats
    - _Requirements: 11.1, 11.2_

- [x] 16. SEO 优化模块
  - [x] 16.1 实现 SEO 字段管理
    - 文章 SEO 标题和描述
    - 自定义固定链接
    - _Requirements: 12.1, 12.2, 12.3_
  - [x] 16.2 实现 SEO 元数据渲染
    - 生成 title 和 meta 标签
    - _Requirements: 12.1, 12.2_

- [x] 17. 数据备份模块
  - [x] 17.1 实现数据导出服务
    - 导出所有数据为 JSON 格式
    - 导出文章为 Markdown 文件
    - _Requirements: 13.1, 14.1_
  - [x] 17.2 实现数据导入服务
    - 导入 JSON 备份
    - 导入 Markdown 文件
    - _Requirements: 13.2, 14.2_
  - [ ] 17.3 编写属性测试：备份数据往返一致性
    - **Property 2: 备份数据往返一致性**
    - **Validates: Requirements 13.1, 13.2**
  - [x] 17.4 实现备份 API 路由
    - POST /api/backup/export
    - POST /api/backup/import
    - _Requirements: 13.1, 13.2, 14.1, 14.2_

- [x] 18. Checkpoint - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。

- [x] 19. AI 模型管理模块
  - [x] 19.1 实现 AI 模型配置服务
    - 模型 CRUD
    - API 密钥加密存储
    - 默认模型设置
    - _Requirements: 15.1, 15.2, 15.3, 15.5_
  - [x] 19.2 编写属性测试：AI 模型配置存储
    - **Property 28: AI 模型配置存储**
    - **Validates: Requirements 15.1**
  - [x] 19.3 编写属性测试：默认模型唯一性
    - **Property 29: 默认模型唯一性**
    - **Validates: Requirements 15.3**
  - [x] 19.4 实现统一的 AI 模型适配器接口
    - OpenAI 适配器
    - Claude 适配器
    - 通义千问适配器
    - _Requirements: 15.2, 15.6_
  - [x] 19.5 实现模型连接测试
    - _Requirements: 15.4_
  - [x] 19.6 实现 AI 模型 API 路由
    - /api/ai/models 完整 CRUD
    - POST /api/ai/models/:id/test
    - PUT /api/ai/models/:id/default
    - _Requirements: 15.1-15.6_

- [x] 20. AI 辅助写作模块
  - [x] 20.1 实现 AI 文章生成服务
    - 根据想法生成完整文章
    - 生成标题、正文、推荐标签
    - _Requirements: 16.1, 16.2_
  - [ ] 20.2 编写属性测试：AI 生成结果完整性
    - **Property 30: AI 生成结果完整性**
    - **Validates: Requirements 16.2**
  - [x] 20.3 实现 AI 使用日志
    - 记录每次 AI 调用
    - _Requirements: 16.6_
  - [ ] 20.4 编写属性测试：AI 使用日志记录
    - **Property 31: AI 使用日志记录**
    - **Validates: Requirements 16.6**
  - [x] 20.5 实现错误处理和重试机制
    - _Requirements: 16.5_
  - [x] 20.6 实现 AI 生成 API 路由
    - POST /api/ai/generate
    - _Requirements: 16.1-16.6_

- [x] 21. Checkpoint - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。

- [x] 22. 主题系统模块
  - [x] 22.1 实现主题管理服务
    - 主题安装、激活、卸载
    - 主题配置管理
    - _Requirements: 17.1, 17.3, 17.4, 17.5, 17.7_
  - [x] 22.2 编写属性测试：活跃主题唯一性
    - **Property 32: 活跃主题唯一性**
    - **Validates: Requirements 17.4, 17.7**
  - [x] 22.3 编写属性测试：主题安装注册
    - **Property 33: 主题安装注册**
    - **Validates: Requirements 17.3**
  - [x] 22.4 编写属性测试：主题配置覆盖
    - **Property 34: 主题配置覆盖**
    - **Validates: Requirements 17.5**
  - [x] 22.5 实现内置深色/明亮主题
    - _Requirements: 17.1_
  - [x] 22.6 实现主题 API 路由
    - /api/themes 完整 CRUD
    - PUT /api/themes/:id/activate
    - _Requirements: 17.1-17.7_

- [x] 23. 插件系统模块
  - [x] 23.1 实现插件管理服务
    - 插件安装、启用、禁用、卸载
    - 插件配置管理
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_
  - [x] 23.2 编写属性测试：插件安装注册
    - **Property 35: 插件安装注册**
    - **Validates: Requirements 18.1**
  - [x] 23.3 编写属性测试：插件启用状态
    - **Property 36: 插件启用状态**
    - **Validates: Requirements 18.2**
  - [x] 23.4 编写属性测试：插件禁用保留配置
    - **Property 37: 插件禁用保留配置**
    - **Validates: Requirements 18.3**
  - [x] 23.5 实现插件生命周期钩子
    - onInstall, onEnable, onDisable, onUninstall
    - _Requirements: 18.6_
  - [x] 23.6 实现插件扩展点系统
    - 定义扩展点接口
    - 插件注册扩展
    - _Requirements: 18.6_
  - [x] 23.7 实现插件依赖加载
    - 按依赖顺序加载插件
    - _Requirements: 18.7_
  - [x] 23.8 编写属性测试：插件依赖加载顺序
    - **Property 38: 插件依赖加载顺序**
    - **Validates: Requirements 18.7**
  - [x] 23.9 实现插件错误隔离
    - 插件错误不影响核心功能
    - _Requirements: 18.8_
  - [x] 23.10 编写属性测试：插件错误隔离
    - **Property 39: 插件错误隔离**
    - **Validates: Requirements 18.8**
  - [x] 23.11 实现插件 API 路由
    - /api/plugins 完整 CRUD
    - PUT /api/plugins/:id/enable
    - PUT /api/plugins/:id/disable
    - _Requirements: 18.1-18.8_

- [x] 24. Checkpoint - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。

- [x] 25. 前端基础架构



  - [x] 25.1 配置 React + TypeScript + Tailwind CSS

    - 创建前端项目结构
    - 配置路由（React Router）
    - 配置状态管理（Zustand）
    - _Requirements: 全局_
  - [x] 25.2 实现主题切换功能


    - ThemeProvider 组件
    - 深色/明亮模式切换
    - 主题偏好持久化
    - _Requirements: 9.1, 17.1, 17.2_
  - [x] 25.3 实现通用 UI 组件


    - Button, Input, Modal, Card 等
    - 响应式布局组件
    - _Requirements: 9.2, 9.3_

- [x] 26. 前端后台管理界面


  - [x] 26.1 实现登录页面

    - _Requirements: 1.1_
  - [x] 26.2 实现后台布局和导航
    - _Requirements: 全局_

  - [x] 26.3 实现文章管理页面

    - 文章列表、创建、编辑、删除
    - _Requirements: 2.1-2.6_
  - [x] 26.4 实现 Markdown 编辑器组件


    - 实时预览
    - 工具栏
    - 图片上传
    - _Requirements: 3.1-3.4_
  - [x] 26.5 实现分类和标签管理页面

    - _Requirements: 4.1-4.4_

  - [x] 26.6 实现页面管理界面

    - _Requirements: 6.1-6.3_
  - [x] 26.7 实现媒体库界面
    - _Requirements: 7.1-7.4_

  - [x] 26.8 实现知识库管理界面

    - 树形目录

    - 拖拽排序

    - _Requirements: 8.1-8.3_
  - [x] 26.9 实现评论管理界面
    - _Requirements: 10.1-10.4_
  - [x] 26.10 实现 AI 写作界面

    - 想法输入
    - AI 生成按钮
    - 结果展示和编辑
    - _Requirements: 16.1-16.6_
  - [x] 26.11 实现系统设置界面
    - AI 模型配置
    - 主题设置
    - 插件管理
    - _Requirements: 15.1-15.6, 17.1-17.7, 18.1-18.8_

- [x] 27. 前端博客展示界面

  - [x] 27.1 实现博客首页

    - 文章列表
    - 分页
    - _Requirements: 5.1_

  - [x] 27.2 实现文章详情页
    - Markdown 渲染
    - 目录导航
    - 代码高亮

    - _Requirements: 5.2, 5.3_

  - [x] 27.3 实现分类和标签页面

    - _Requirements: 5.4, 5.5_
  - [x] 27.4 实现搜索功能
    - _Requirements: 5.6_
  - [x] 27.5 实现独立页面展示
    - _Requirements: 6.1-6.3_
  - [x] 27.6 实现知识库浏览界面

    - _Requirements: 8.3_

  - [x] 27.7 实现评论组件

    - _Requirements: 10.1, 10.3_

- [x] 28. 最终 Checkpoint - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。
