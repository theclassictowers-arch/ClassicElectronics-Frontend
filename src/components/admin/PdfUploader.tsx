'use client';

import React, { useRef, useState } from 'react';
import axios from 'axios';
import { FileText, Loader2, Upload, X } from 'lucide-react';
import { API_URL as API_BASE, SERVER_BASE } from '@/lib/apiConfig';

type PdfUploaderProps = {
  value: string;
  onChange: (value: string) => void;
};

const getFullUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${SERVER_BASE}${url}`;
  return url;
};

export default function PdfUploader({ value, onChange }: PdfUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('PDF is too large. Maximum 10MB.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await axios.post(`${API_BASE}/upload/pdf`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      onChange(String(response.data.url || ''));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(String(err.response.data.message));
      } else {
        setError('Failed to upload PDF. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm text-gray-400">Product PDF</label>

      <div className="bg-[#0f172a] border border-gray-700 rounded-lg p-4 space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
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
            {uploading ? 'Uploading PDF...' : 'Upload PDF'}
          </button>

          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="border border-gray-600 text-gray-200 px-4 py-3 rounded font-medium inline-flex items-center justify-center gap-2 hover:border-white hover:text-white"
            >
              <X size={18} />
              Remove PDF
            </button>
          )}
        </div>

        {value && (
          <a
            href={getFullUrl(value)}
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
