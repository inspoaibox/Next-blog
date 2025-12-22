import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { api } from '../../lib/api';

interface ImageInputProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
}

export function ImageInput({ label, value, onChange, placeholder, className }: ImageInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('只支持上传图片文件');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await api.upload<{ url: string }>('/media/upload', formData);
      onChange(result.url);
    } catch (err) {
      setError('上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    // 清空 input 以便重复选择同一文件
    e.target.value = '';
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      
      <div className="flex gap-2">
        {/* URL 输入框 */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || '输入图片 URL 或点击上传'}
            className="w-full px-3 py-2 pr-20 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          
          {/* 操作按钮 */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="清除"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 disabled:opacity-50"
              title="上传图片"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload size={16} />
              )}
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* 预览 */}
      {value && (
        <div className="mt-2 relative inline-block">
          <img
            src={value}
            alt="预览"
            className="h-12 w-auto rounded border border-gray-200 dark:border-gray-700 object-contain bg-gray-50 dark:bg-gray-800"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
