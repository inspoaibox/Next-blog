import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import articleRoutes from './routes/article.routes.js';
import categoryRoutes from './routes/category.routes.js';
import tagRoutes from './routes/tag.routes.js';
import pageRoutes from './routes/page.routes.js';
import mediaRoutes from './routes/media.routes.js';
import knowledgeRoutes from './routes/knowledge.routes.js';
import commentRoutes from './routes/comment.routes.js';
import statsRoutes from './routes/stats.routes.js';
import backupRoutes from './routes/backup.routes.js';
import aiRoutes from './routes/ai.routes.js';
import themeRoutes from './routes/theme.routes.js';
import pluginRoutes from './routes/plugin.routes.js';
import settingRoutes from './routes/setting.routes.js';
import prerenderRoutes from './routes/prerender.routes.js';
import projectRoutes from './routes/project.routes.js';
import projectCategoryRoutes from './routes/project-category.routes.js';
import friendLinkRoutes from './routes/friend-link.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import { themeService } from './services/theme.service.js';

const app = express();
const PORT = process.env.PORT || 3012;

// 信任代理（Caddy/Nginx），这样才能获取真实客户端IP
// 设置为 1 表示信任第一层代理
app.set('trust proxy', 1);

// 安全中间件 - HTTP 安全头
app.use(helmet({
  contentSecurityPolicy: false, // 允许内联脚本（主题自定义代码需要）
  crossOriginEmbedderPolicy: false,
}));

// 速率限制 - 防止暴力破解和 DDoS
// 开发环境下放宽限制
const isDev = process.env.NODE_ENV !== 'production';

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: isDev ? 5000 : 2000, // 开发环境5000次，生产环境2000次
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // 跳过健康检查和访客追踪接口（追踪接口请求量大但不敏感）
    return req.path === '/api/health' || req.path === '/api/analytics/track';
  },
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: isDev ? 100 : 30, // 开发环境100次，生产环境30次
  message: { success: false, error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 访客追踪专用限制（更宽松）
const trackingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 60, // 每分钟最多60次（每秒1次）
  message: { success: false, error: 'Too many tracking requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);

// CORS 配置 - 支持环境变量 ALLOWED_ORIGINS（逗号分隔）
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['*'];

app.use(cors({
  origin: (origin, callback) => {
    // 允许无 origin 的请求（如服务端请求、Postman）
    if (!origin) return callback(null, true);
    // 允许所有来源
    if (allowedOrigins.includes('*')) return callback(null, true);
    // 检查是否在白名单
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, false);
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authLimiter, authRoutes); // 登录接口使用更严格的限制
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/plugins', pluginRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/prerender', prerenderRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/project-categories', projectCategoryRoutes);
app.use('/api/friend-links', friendLinkRoutes);
app.use('/api/analytics', trackingLimiter, analyticsRoutes);

// Error handler
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  
  // 初始化内置主题
  try {
    await themeService.initBuiltinThemes();
    console.log('Built-in themes initialized');
  } catch (error) {
    console.error('Failed to initialize themes:', error);
  }
});

export default app;
