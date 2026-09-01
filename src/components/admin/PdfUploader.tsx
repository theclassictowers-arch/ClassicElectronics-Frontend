'use client';

import React, { useRef } from 'react';
import { FileText, Loader2, Upload, X } from 'lucide-react';
import { resolveAssetUrl } from '@/lib/apiConfig';
import { MAX_PRODUCT_PDFS, PDF_MAX_SIZE_BYTES } from '@/services/uploadService';

type Props = {
  values: string[];
  pendingFiles: File[];
  onAddFiles: (files: File[]) => void;
  onRemoveUploaded: (index: number) => void;
  onRemovePending: (index: number) => void;
  uploading?: boolean;
  error?: string | null;
};

const fileLabel = (url: string) => decodeURIComponent(url.split('/').pop() || url);

export default function PdfUploader({ values, pendingFiles, onAddFiles, onRemoveUploaded, onRemovePending, uploading = false, error = null }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const count = values.length + pendingFiles.length;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (files.length) onAddFiles(files);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm text-gray-400">Product PDFs ({count}/{MAX_PRODUCT_PDFS})</label>
      <div className="bg-[#0f172a] border border-gray-700 rounded-lg p-4 space-y-3">
        <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple onChange={handleFileSelect} className="hidden" />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading || count >= MAX_PRODUCT_PDFS} className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white px-4 py-3 rounded font-medium inline-flex items-center justify-center gap-2">
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
          {uploading ? 'Uploading PDFs...' : 'Select PDF Files'}
        </button>

        {pendingFiles.map((file, index) => (
          <div key={`${file.name}-${file.lastModified}`} className="flex items-center justify-between gap-3 text-sm text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded px-3 py-2">
            <div className="min-w-0"><div className="font-medium break-all">{file.name}</div><div className="text-xs">Pending upload</div></div>
            <button type="button" onClick={() => onRemovePending(index)} aria-label={`Remove ${file.name}`} className="text-gray-300 hover:text-white"><X size={18} /></button>
          </div>
        ))}

        {values.map((value, index) => (
          <div key={value} className="flex items-center justify-between gap-3 border border-gray-700 rounded px-3 py-2">
            <a href={resolveAssetUrl(value)} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-0 items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm">
              <FileText size={16} className="shrink-0" /><span className="break-all">{fileLabel(value)}</span>
            </a>
            <button type="button" onClick={() => onRemoveUploaded(index)} aria-label={`Remove ${fileLabel(value)}`} className="shrink-0 text-gray-300 hover:text-white"><X size={18} /></button>
          </div>
        ))}

        <p className="text-xs text-gray-500">Maximum {MAX_PRODUCT_PDFS} files, {Math.round(PDF_MAX_SIZE_BYTES / (1024 * 1024))}MB per PDF.</p>
        {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded px-3 py-2">{error}</p>}
      </div>
    </div>
  );
}
