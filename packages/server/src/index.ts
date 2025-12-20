import express from 'express';
import cors from 'cors';
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

const app = express();
const PORT = process.env.PORT || 3012;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
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

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
