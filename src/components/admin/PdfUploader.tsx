'use client';

import React, { useRef } from 'react';
import { FileText, Loader2, Upload, X } from 'lucide-react';
import { resolveAssetUrl } from '@/lib/apiConfig';
import { PDF_MAX_SIZE_BYTES } from '@/services/uploadService';

type PdfUploaderProps = {
  value: string;
  pendingFile: File | null;
  onSelectFile: (file: File | null) => void;
  onRemoveUploaded: () => void;
  onRemovePending: () => void;
  uploading?: boolean;
  error?: string | null;
};

export default function PdfUploader({
  value,
  pendingFile,
  onSelectFile,
  onRemoveUploaded,
  onRemovePending,
  uploading = false,
  error = null,
}: PdfUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    onSelectFile(file ?? null);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm text-gray-400">Product PDF</label>

      <div className="bg-[#0f172a] border border-gray-700 rounded-lg p-4 space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white px-4 py-3 rounded font-medium inline-flex items-center justify-center gap-2"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {uploading ? 'Uploading PDF...' : 'Select PDF'}
          </button>

          {pendingFile && (
            <button
              type="button"
              onClick={onRemovePending}
              className="border border-gray-600 text-gray-200 px-4 py-3 rounded font-medium inline-flex items-center justify-center gap-2 hover:border-white hover:text-white"
            >
              <X size={18} />
              Remove Pending PDF
            </button>
          )}

          {!pendingFile && value && (
            <button
              type="button"
              onClick={onRemoveUploaded}
              className="border border-gray-600 text-gray-200 px-4 py-3 rounded font-medium inline-flex items-center justify-center gap-2 hover:border-white hover:text-white"
            >
              <X size={18} />
              Remove PDF
            </button>
          )}
        </div>

        {pendingFile && (
          <div className="text-sm text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded px-3 py-2">
            <div className="font-medium break-all">{pendingFile.name}</div>
            <div className="text-xs text-cyan-200/80">
              Pending upload, max {Math.round(PDF_MAX_SIZE_BYTES / (1024 * 1024))}MB
            </div>
          </div>
        )}

        {value && (
          <a
            href={resolveAssetUrl(value)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm break-all"
          >
            <FileText size={16} />
            {value}
          </a>
        )}

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
