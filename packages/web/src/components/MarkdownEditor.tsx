import { useState, useRef, useCallback } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  onImageUpload,
  placeholder,
  className,
}: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertText = useCallback((before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // 恢复光标位置
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  const handleBold = () => insertText('**', '**');
  const handleItalic = () => insertText('*', '*');
  const handleHeading = () => insertText('## ');
  const handleLink = () => insertText('[', '](url)');
  const handleCode = () => insertText('`', '`');
  const handleCodeBlock = () => insertText('\n```\n', '\n```\n');
  const handleQuote = () => insertText('> ');
  const handleList = () => insertText('- ');
  const handleOrderedList = () => insertText('1. ');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;

    try {
      const url = await onImageUpload(file);
      insertText(`![${file.name}](${url})`);
    } catch (error) {
      console.error('图片上传失败:', error);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toolbarButtons = [
    { icon: 'B', title: '粗体', onClick: handleBold },
    { icon: 'I', title: '斜体', onClick: handleItalic },
    { icon: 'H', title: '标题', onClick: handleHeading },
    { icon: '🔗', title: '链接', onClick: handleLink },
    { icon: '</>', title: '代码', onClick: handleCode },
    { icon: '📝', title: '代码块', onClick: handleCodeBlock },
    { icon: '"', title: '引用', onClick: handleQuote },
    { icon: '•', title: '列表', onClick: handleList },
    { icon: '1.', title: '有序列表', onClick: handleOrderedList },
  ];

  return (
    <div className={className}>
      {/* 工具栏 */}
      <div className="flex items-center gap-1 p-2 border border-gray-300 dark:border-gray-600 rounded-t-lg bg-gray-50 dark:bg-gray-800">
        {toolbarButtons.map((btn, index) => (
          <button
            key={index}
            type="button"
            onClick={btn.onClick}
            title={btn.title}
            className="px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            {btn.icon}
          </button>
        ))}
        
        {onImageUpload && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="上传图片"
              className="px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              🖼️
            </button>
          </>
        )}

        <div className="flex-1" />
        
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className={`px-3 py-1 text-sm rounded ${
            isPreview
              ? 'bg-primary-600 text-white'
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {isPreview ? '编辑' : '预览'}
        </button>
      </div>

      {/* 编辑区/预览区 */}
      {isPreview ? (
        <div className="p-4 border border-t-0 border-gray-300 dark:border-gray-600 rounded-b-lg min-h-[400px] prose dark:prose-invert max-w-none">
          <MarkdownPreview content={value} />
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-4 border border-t-0 border-gray-300 dark:border-gray-600 rounded-b-lg min-h-[400px] font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
        />
      )}
    </div>
  );
}

function MarkdownPreview({ content }: { content: string }) {
  // 简单的 Markdown 预览，实际项目中可以使用 react-markdown
  const html = content
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/\n/gim, '<br />');

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
