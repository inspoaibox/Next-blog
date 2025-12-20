import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button, Card, CardContent, CardHeader, Textarea, Input } from '../../components/ui';

interface GenerateResult {
  title: string;
  content: string;
  tags: string[];
}

export function AIWritingPage() {
  const [idea, setIdea] = useState('');
  const [result, setResult] = useState<GenerateResult | null>(null);

  const generateArticle = useMutation({
    mutationFn: (idea: string) => api.post<GenerateResult>('/ai/generate', { idea }),
    onSuccess: (data) => setResult(data),
  });

  const handleGenerate = () => {
    if (!idea.trim()) return;
    generateArticle.mutate(idea);
  };

  const handleUseResult = () => {
    if (!result) return;
    // 跳转到文章编辑页面，带上生成的内容
    const params = new URLSearchParams({
      title: result.title,
      content: result.content,
      tags: result.tags.join(','),
    });
    window.location.href = `/admin/articles/new?${params}`;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">AI 辅助写作</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">输入想法</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="描述你想写的文章主题、要点或大纲..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="min-h-[200px]"
            />
            <Button
              onClick={handleGenerate}
              loading={generateArticle.isPending}
              disabled={!idea.trim()}
              className="w-full"
            >
              {generateArticle.isPending ? '生成中...' : '生成文章'}
            </Button>
            
            {generateArticle.isError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                生成失败，请检查 AI 模型配置或稍后重试
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">生成结果</h2>
              {result && (
                <Button size="sm" onClick={handleUseResult}>
                  使用此内容
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="text-center text-gray-500 py-12">
                输入想法后点击生成按钮
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    标题
                  </label>
                  <Input value={result.title} readOnly />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    推荐标签
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    内容预览
                  </label>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg max-h-[300px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {result.content}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
