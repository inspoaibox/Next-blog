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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const { data: mediaList, isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: () => api.get<Media[]>('/media'),
  });

  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => api.get<Record<string, string>>('/settings'),
  });

  // 获取允许的文件类型
  const allowedTypes = settings?.allowedMediaTypes || 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/pdf';

  const uploadMedia = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.upload<Media>('/media/upload', formData);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const deleteMedia = useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      setSelectedMedia(null);
    },
  });

  const batchDelete = useMutation({
    mutationFn: (ids: string[]) => api.delete('/media/batch', { ids } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      setSelectedIds(new Set());
      setIsSelectionMode(false);
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

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (confirm(`确定要删除选中的 ${selectedIds.size} 个文件吗？`)) {
      await batchDelete.mutateAsync(Array.from(selectedIds));
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (!mediaList) return;
    if (selectedIds.size === mediaList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(mediaList.map(m => m.id)));
    }
  };

  const handleMediaClick = (media: Media) => {
    if (isSelectionMode) {
      toggleSelection(media.id);
    } else {
      setSelectedMedia(media);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 生成 accept 属性
  const acceptTypes = allowedTypes.split(',').map((t: string) => t.trim()).join(',');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">媒体库</h1>
        <div className="flex gap-2">
          {isSelectionMode ? (
            <>
              <Button variant="outline" onClick={toggleSelectAll}>
                {mediaList && selectedIds.size === mediaList.length ? '取消全选' : '全选'}
              </Button>
              <Button 
                variant="danger" 
                onClick={handleBatchDelete} 
                loading={batchDelete.isPending}
                disabled={selectedIds.size === 0}
              >
                删除选中 ({selectedIds.size})
              </Button>
              <Button variant="outline" onClick={() => { setIsSelectionMode(false); setSelectedIds(new Set()); }}>
                取消
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsSelectionMode(true)}>
                批量管理
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptTypes}
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()} loading={uploadMedia.isPending}>
                上传文件
              </Button>
            </>
          )}
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
                  onClick={() => handleMediaClick(media)}
                  className={`cursor-pointer group relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden ${
                    selectedIds.has(media.id) ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  {isSelectionMode && (
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(media.id)}
                        onChange={() => toggleSelection(media.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>
                  )}
                  {media.mimeType.startsWith('image/') ? (
                    <img
                      src={`/api/media/${media.id}/file`}
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
                  src={`/api/media/${selectedMedia.id}/file`}
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
                  /api/media/{selectedMedia.id}/file
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
