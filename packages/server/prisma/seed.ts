import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 创建默认管理员账户
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: hashedPassword,
    },
  });

  console.log('Created admin user:', admin.username);

  // 创建默认分类
  const defaultCategory = await prisma.category.upsert({
    where: { slug: 'uncategorized' },
    update: {},
    create: {
      name: '未分类',
      slug: 'uncategorized',
    },
  });

  console.log('Created default category:', defaultCategory.name);

  // 创建示例文章
  const article = await prisma.article.upsert({
    where: { slug: 'hello-world' },
    update: {},
    create: {
      title: '欢迎使用博客系统',
      slug: 'hello-world',
      content: `# 欢迎使用博客系统

这是一篇示例文章，展示博客系统的基本功能。

## 功能特性

- **Markdown 支持** - 使用 Markdown 编写文章
- **代码高亮** - 支持多种编程语言
- **分类标签** - 灵活的内容组织
- **AI 写作** - 智能辅助创作

## 代码示例

\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

开始你的博客之旅吧！`,
      excerpt: '这是一篇示例文章，展示博客系统的基本功能。',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: admin.id,
      categoryId: defaultCategory.id,
    },
  });

  console.log('Created sample article:', article.title);

  // 创建内置主题
  await prisma.theme.upsert({
    where: { name: 'default-light' },
    update: {},
    create: {
      name: 'default-light',
      version: '1.0.0',
      path: '/themes/default-light',
      isActive: true,
      config: JSON.stringify({
        primaryColor: '#0ea5e9',
        fontFamily: 'system-ui',
      }),
    },
  });

  await prisma.theme.upsert({
    where: { name: 'default-dark' },
    update: {},
    create: {
      name: 'default-dark',
      version: '1.0.0',
      path: '/themes/default-dark',
      isActive: false,
      config: JSON.stringify({
        primaryColor: '#38bdf8',
        fontFamily: 'system-ui',
      }),
    },
  });

  console.log('Created default themes');

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
