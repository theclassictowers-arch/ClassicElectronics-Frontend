'use client';

import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Upload, X, ImagePlus, Loader2 } from 'lucide-react';
import { API_URL as API_BASE, SERVER_BASE } from '@/lib/apiConfig';

type ImageUploaderProps = {
  images: string[];
  onChange: (images: string[]) => void;
};

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFullUrl = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `${SERVER_BASE}${url}`;
    return url;
  };

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const fileArray = Array.from(files);

      // Client-side validation
      const maxSize = 5 * 1024 * 1024;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];

      for (const file of fileArray) {
        if (!allowedTypes.includes(file.type)) {
          setError(`"${file.name}" is not a supported image type. Use JPEG, PNG, WebP, SVG, or GIF.`);
          return;
        }
        if (file.size > maxSize) {
          setError(`"${file.name}" is too large. Maximum 5MB per file.`);
          return;
        }
      }

      if (images.length + fileArray.length > 10) {
        setError('Maximum 10 images allowed per product.');
        return;
      }

      setUploading(true);
      try {
        const token = localStorage.getItem('adminToken');
        const formData = new FormData();
        fileArray.forEach((file) => formData.append('images', file));

        const res = await axios.post(`${API_BASE}/upload/images`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        const newUrls = res.data.urls as string[];
        onChange([...images, ...newUrls]);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Failed to upload images. Please try again.');
        }
      } finally {
        setUploading(false);
      }
    },
    [images, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files);
      }
    },
    [uploadFiles],
  );

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
      uploadFiles(e.target.files);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm text-gray-400">Product Images</label>

      {/* Drop Zone */}
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
          accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-cyan-400">
            <Loader2 size={32} className="animate-spin" />
            <span className="text-sm">Uploading...</span>
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
                <span className="text-xs text-gray-500">JPEG, PNG, WebP, SVG, GIF - Max 5MB each</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
          {error}
        </p>
      )}

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative group rounded-lg overflow-hidden border border-gray-700 bg-[#0b1120] aspect-square"
            >
              <img
                src={getFullUrl(url)}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%231e293b"/><text x="50" y="55" font-size="12" text-anchor="middle" fill="%236b7280">No Image</text></svg>';
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-400 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove image ${index + 1}`}
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
