import Image from 'next/image';
import { CLASSIC_LOGO_SRC } from '@/lib/brandAssets';
import { Download, FileText, FilePlus, History, Loader2, Printer, Save } from 'lucide-react';
import type { DocumentType } from '../types';
import { documentTypes } from '../utils';

type ActiveDocument = (typeof documentTypes)[number];

type BuilderHeaderProps = {
  activeDocument: ActiveDocument;
  activeDocumentType: DocumentType;
  isDownloadingPdf: boolean;
  isSavingDocument: boolean;
  saveStatus: string;
  onDocumentTypeChange: (documentType: DocumentType) => void;
  onDownloadPdf: () => void;
  onOpenHistory: () => void;
  onPrint: () => void;
  onReset: () => void;
  onSaveDocument: () => void;
};

export const BuilderBackground = () => (
  <div className="invoice-builder-bg pointer-events-none absolute inset-0 -z-10">
    <div className="absolute -left-20 top-12 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
    <div className="absolute right-6 top-10 opacity-[0.05]">
      <Image
        src={CLASSIC_LOGO_SRC}
        alt=""
        width={360}
        height={140}
        className="h-auto w-[280px] sm:w-[360px]"
      />
    </div>
    <div className="absolute bottom-16 left-[28%] opacity-[0.04]">
      <Image
        src={CLASSIC_LOGO_SRC}
        alt=""
        width={500}
        height={190}
        className="h-auto w-[320px] sm:w-[500px]"
      />
    </div>
  </div>
);

export const BuilderHeader = ({
  activeDocument,
  activeDocumentType,
  isDownloadingPdf,
  isSavingDocument,
  saveStatus,
  onDocumentTypeChange,
  onDownloadPdf,
  onOpenHistory,
  onPrint,
  onReset,
  onSaveDocument,
}: BuilderHeaderProps) => (
  <>
    <div className="invoice-builder-toolbar flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
          <FileText size={14} />
          Document Builder
        </div>
        <h1 className="mt-4 text-3xl font-bold text-white">{activeDocument.title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Select document type, update values on the left, and review the preview on the right.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onOpenHistory}
          className="inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-sm font-semibold text-purple-200 transition hover:bg-purple-500/20"
        >
          <History size={16} />
          History
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
        >
          <FilePlus size={16} />
          Add New
        </button>
        <button
          type="button"
          onClick={onSaveDocument}
          disabled={isSavingDocument}
          className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSavingDocument ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSavingDocument ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onDownloadPdf}
          disabled={isDownloadingPdf}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDownloadingPdf ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          {isDownloadingPdf ? 'Preparing PDF...' : 'Download PDF'}
        </button>
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          <Printer size={16} />
          Print Preview
        </button>
        {saveStatus ? (
          <div className="flex basis-full items-center text-xs font-semibold text-emerald-300 xl:basis-auto">
            {saveStatus}
          </div>
        ) : null}
      </div>
    </div>

    <div className="invoice-document-tabs grid gap-3 rounded-3xl border border-slate-800 bg-[#111827] p-3 shadow-xl sm:grid-cols-2 lg:grid-cols-4">
      {documentTypes.map((documentType) => {
        const isActive = activeDocumentType === documentType.type;

        return (
          <button
            key={documentType.type}
            type="button"
            onClick={() => onDocumentTypeChange(documentType.type)}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              isActive
                ? 'border-cyan-400 bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/30'
                : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-cyan-500/60 hover:text-cyan-200'
            }`}
          >
            <FileText size={16} />
            {documentType.label}
          </button>
        );
      })}
    </div>
  </>
);
