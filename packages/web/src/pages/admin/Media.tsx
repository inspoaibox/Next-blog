import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Media } from '../../types';
import { Button, Card, CardContent, Modal } from '../../components/ui';
import { formatDate } from '../../lib/utils';

export function MediaPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  const { data: mediaList, isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: () => api.get<Media[]>('/media'),
  });

  const uploadMedia = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  });

  const deleteMedia = useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      setSelectedMedia(null);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    for (const file of Array.from(files)) {
      await uploadMedia.mutateAsync(file);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (selectedMedia && confirm('确定要删除这个文件吗？')) {
      await deleteMedia.mutateAsync(selectedMedia.id);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">媒体库</h1>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button onClick={() => fileInputRef.current?.click()} loading={uploadMedia.isPending}>
            上传文件
          </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">加载中...</div>
          ) : !mediaList?.length ? (
            <div className="p-8 text-center text-gray-500">暂无媒体文件</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mediaList.map((media) => (
                <div
                  key={media.id}
                  onClick={() => setSelectedMedia(media)}
                  className="cursor-pointer group relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
                >
                  {media.mimeType.startsWith('image/') ? (
                    <img
                      src={media.thumbnailPath || media.path}
                      alt={media.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      📄
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm truncate px-2">
                      {media.originalName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        title="媒体详情"
        size="lg"
      >
        {selectedMedia && (
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              {selectedMedia.mimeType.startsWith('image/') ? (
                <img
                  src={selectedMedia.path}
                  alt={selectedMedia.originalName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  📄
                </div>
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">文件名：</span>{selectedMedia.originalName}</p>
              <p><span className="text-gray-500">类型：</span>{selectedMedia.mimeType}</p>
              <p><span className="text-gray-500">大小：</span>{formatSize(selectedMedia.size)}</p>
              <p><span className="text-gray-500">上传时间：</span>{formatDate(selectedMedia.createdAt)}</p>
              <p>
                <span className="text-gray-500">链接：</span>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                  {selectedMedia.path}
                </code>
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="danger" onClick={handleDelete} loading={deleteMedia.isPending}>
                删除
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
