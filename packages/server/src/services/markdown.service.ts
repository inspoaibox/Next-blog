import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import { createHighlighter, type Highlighter } from 'shiki';

export interface TocItem {
  id: string;
  text: string;
  level: number;
  children: TocItem[];
}

export interface ParseResult {
  html: string;
  toc: TocItem[];
}

let highlighter: Highlighter | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: ['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'html', 'css', 'json', 'yaml', 'markdown', 'bash', 'sql'],
    });
  }
  return highlighter;
}

export class MarkdownService {
  /**
   * 解析 Markdown 为 HTML
   */
  async parse(markdown: string): Promise<ParseResult> {
    const toc: TocItem[] = [];
    const headingStack: TocItem[] = [];

    // 提取标题生成目录
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    let match;
    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = this.generateHeadingId(text);

      const item: TocItem = { id, text, level, children: [] };

      // 构建层级结构
      while (headingStack.length > 0 && headingStack[headingStack.length - 1].level >= level) {
        headingStack.pop();
      }

      if (headingStack.length === 0) {
        toc.push(item);
      } else {
        headingStack[headingStack.length - 1].children.push(item);
      }
      headingStack.push(item);
    }

    // 解析 Markdown 为 HTML
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeSlug)
      .use(rehypeStringify, { allowDangerousHtml: true });

    const result = await processor.process(markdown);
    let html = String(result);

    // 代码高亮
    html = await this.highlightCode(html);

    return { html, toc };
  }


  /**
   * 生成标题 ID
   */
  private generateHeadingId(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * 代码高亮
   */
  private async highlightCode(html: string): Promise<string> {
    const hl = await getHighlighter();
    
    // 匹配 <pre><code class="language-xxx">...</code></pre>
    const codeBlockRegex = /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g;
    
    return html.replace(codeBlockRegex, (_match, lang, code) => {
      try {
        // 解码 HTML 实体
        const decodedCode = code
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

        const highlighted = hl.codeToHtml(decodedCode, {
          lang: lang || 'text',
          theme: 'github-dark',
        });
        return highlighted;
      } catch {
        return `<pre><code class="language-${lang}">${code}</code></pre>`;
      }
    });
  }

  /**
   * 生成目录 HTML
   */
  generateTocHtml(toc: TocItem[]): string {
    if (toc.length === 0) return '';

    const renderItems = (items: TocItem[]): string => {
      return items
        .map(item => {
          const children = item.children.length > 0 
            ? `<ul>${renderItems(item.children)}</ul>` 
            : '';
          return `<li><a href="#${item.id}">${item.text}</a>${children}</li>`;
        })
        .join('');
    };

    return `<nav class="toc"><ul>${renderItems(toc)}</ul></nav>`;
  }

  /**
   * 提取摘要（取前 N 个字符的纯文本）
   */
  extractExcerpt(markdown: string, maxLength: number = 200): string {
    // 移除 Markdown 语法
    const plainText = markdown
      .replace(/^#{1,6}\s+/gm, '') // 标题
      .replace(/\*\*(.+?)\*\*/g, '$1') // 粗体
      .replace(/\*(.+?)\*/g, '$1') // 斜体
      .replace(/`(.+?)`/g, '$1') // 行内代码
      .replace(/```[\s\S]*?```/g, '') // 代码块
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // 链接
      .replace(/!\[.*?\]\(.+?\)/g, '') // 图片
      .replace(/>\s+/g, '') // 引用
      .replace(/[-*+]\s+/g, '') // 列表
      .replace(/\n+/g, ' ') // 换行
      .trim();

    if (plainText.length <= maxLength) {
      return plainText;
    }

    return plainText.substring(0, maxLength).trim() + '...';
  }
}

export const markdownService = new MarkdownService();
