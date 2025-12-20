import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { MarkdownService } from './markdown.service.js';

const markdownService = new MarkdownService();

describe('MarkdownService', () => {
  /**
   * **Feature: blog-system, Property 15: 目录生成正确性**
   * **Validates: Requirements 5.3**
   */
  it('Property 15: 目录生成正确性', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            level: fc.integer({ min: 1, max: 6 }),
            text: fc.string({ minLength: 1, maxLength: 20 }).filter(s => {
              const trimmed = s.trim();
              return trimmed.length > 0 && !/[#\n$]/.test(trimmed);
            }).map(s => s.trim()),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (headings) => {
          // 生成 Markdown 内容
          const markdown = headings
            .map(h => `${'#'.repeat(h.level)} ${h.text}\n\nSome content here.\n`)
            .join('\n');

          const result = await markdownService.parse(markdown);

          // 验证目录包含所有标题
          const flattenToc = (items: any[]): any[] => {
            return items.flatMap(item => [item, ...flattenToc(item.children)]);
          };
          const allTocItems = flattenToc(result.toc);

          expect(allTocItems.length).toBe(headings.length);

          // 验证每个标题都在目录中
          for (let i = 0; i < headings.length; i++) {
            expect(allTocItems[i].text).toBe(headings[i].text);
            expect(allTocItems[i].level).toBe(headings[i].level);
          }

          return true;
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  it('should parse basic Markdown to HTML', async () => {
    const markdown = `# Hello World

This is a **bold** text and *italic* text.

## Code Example

\`\`\`javascript
const x = 1;
\`\`\`
`;

    const result = await markdownService.parse(markdown);

    expect(result.html).toContain('<h1');
    expect(result.html).toContain('Hello World');
    expect(result.html).toContain('<strong>bold</strong>');
    expect(result.html).toContain('<em>italic</em>');
    expect(result.toc.length).toBeGreaterThan(0);
  });


  it('should generate correct TOC structure', async () => {
    const markdown = `# Title 1
## Subtitle 1.1
## Subtitle 1.2
### Sub-subtitle 1.2.1
# Title 2
`;

    const result = await markdownService.parse(markdown);

    expect(result.toc.length).toBe(2); // Two top-level headings
    expect(result.toc[0].text).toBe('Title 1');
    expect(result.toc[0].children.length).toBe(2);
    expect(result.toc[0].children[1].children.length).toBe(1);
    expect(result.toc[1].text).toBe('Title 2');
  });

  it('should extract excerpt correctly', () => {
    const markdown = `# Hello World

This is a **bold** text and *italic* text.

Some more content here with [a link](https://example.com).
`;

    const excerpt = markdownService.extractExcerpt(markdown, 50);

    expect(excerpt).not.toContain('#');
    expect(excerpt).not.toContain('**');
    expect(excerpt).not.toContain('[');
    expect(excerpt.length).toBeLessThanOrEqual(53); // 50 + '...'
  });

  it('should generate TOC HTML', async () => {
    const markdown = `# Title 1
## Subtitle 1.1
`;

    const result = await markdownService.parse(markdown);
    const tocHtml = markdownService.generateTocHtml(result.toc);

    expect(tocHtml).toContain('<nav class="toc">');
    expect(tocHtml).toContain('<a href="#title-1">Title 1</a>');
    expect(tocHtml).toContain('<a href="#subtitle-11">Subtitle 1.1</a>');
  });
});
