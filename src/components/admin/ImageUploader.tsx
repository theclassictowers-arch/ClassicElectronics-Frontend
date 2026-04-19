'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, X, ImagePlus, Loader2 } from 'lucide-react';
import { resolveAssetUrl } from '@/lib/apiConfig';
import { IMAGE_MAX_SIZE_BYTES, MAX_PRODUCT_IMAGES } from '@/services/uploadService';

type ImageUploaderProps = {
  images: string[];
  pendingFiles: File[];
  onAddFiles: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
  onRemovePendingFile: (index: number) => void;
  uploading?: boolean;
  error?: string | null;
};

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  pendingFiles,
  onAddFiles,
  onRemoveImage,
  onRemovePendingFile,
  uploading = false,
  error = null,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingPreviews = useMemo(() => {
    const objectUrls = pendingFiles.map((file) => URL.createObjectURL(file));

    return objectUrls;
  }, [pendingFiles]);

  useEffect(() => {
    return () => {
      pendingPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [pendingPreviews]);

  const queueFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    onAddFiles(fileArray);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      queueFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      queueFiles(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm text-gray-400">Product Images</label>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${
            dragOver
              ? 'border-cyan-400 bg-cyan-500/10'
              : 'border-gray-600 hover:border-gray-500 bg-[#0b1120]'
          }
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif,.jpg,.jpeg,.png,.webp,.svg,.gif"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-cyan-400">
            <Loader2 size={32} className="animate-spin" />
            <span className="text-sm">Uploading images...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            {dragOver ? (
              <>
                <ImagePlus size={32} className="text-cyan-400" />
                <span className="text-sm text-cyan-400">Drop images here</span>
              </>
            ) : (
              <>
                <Upload size={32} />
                <span className="text-sm">
                  Drag & drop images here, or <span className="text-cyan-400 underline">browse</span>
                </span>
                <span className="text-xs text-gray-500">
                  JPG, JPEG, PNG, WebP, SVG, GIF - Max {Math.round(IMAGE_MAX_SIZE_BYTES / (1024 * 1024))}MB each, up to {MAX_PRODUCT_IMAGES} images
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
          {error}
        </p>
      )}

      {(images.length > 0 || pendingFiles.length > 0) && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative group rounded-lg overflow-hidden border border-gray-700 bg-[#0b1120] aspect-square"
            >
              <img
                src={resolveAssetUrl(url)}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%231e293b"/><text x="50" y="55" font-size="12" text-anchor="middle" fill="%236b7280">No Image</text></svg>';
                }}
              />
              <button
                type="button"
                onClick={() => onRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-400 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove image ${index + 1}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {pendingFiles.map((file, index) => (
            <div
              key={`${file.name}-${file.lastModified}-${index}`}
              className="relative group rounded-lg overflow-hidden border border-cyan-700 bg-[#0b1120] aspect-square"
            >
              <img
                src={pendingPreviews[index]}
                alt={`Pending product image ${index + 1}`}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/75 px-2 py-1 text-[10px] text-cyan-200 truncate">
                Pending upload
              </div>
              <button
                type="button"
                onClick={() => onRemovePendingFile(index)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-400 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove pending image ${index + 1}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
