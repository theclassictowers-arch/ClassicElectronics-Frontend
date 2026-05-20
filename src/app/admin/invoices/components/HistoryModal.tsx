import { Eye, History, Loader2, Search, X } from 'lucide-react';
import type {
  DocumentType,
  HistorySortBy,
  HistorySortOrder,
  InvoiceHistoryRecord,
} from '../types';
import {
  documentTypes,
  formatCurrency,
  getHistoryReferenceText,
  getHistorySearchPlaceholder,
} from '../utils';

type HistoryDocument = (typeof documentTypes)[number];

type HistoryModalProps = {
  isOpen: boolean;
  historyDocument: HistoryDocument;
  historyDocumentType: DocumentType;
  historySearch: string;
  historySortBy: HistorySortBy;
  historySortOrder: HistorySortOrder;
  historyRecords: InvoiceHistoryRecord[];
  historyLoading: boolean;
  historyError: string;
  onClose: () => void;
  onDocumentTypeChange: (documentType: DocumentType) => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSortChange: (sortBy: HistorySortBy) => void;
  onSortOrderChange: (sortOrder: HistorySortOrder) => void;
  onOpenRecord: (record: InvoiceHistoryRecord) => void;
};

export const HistoryModal = ({
  isOpen,
  historyDocument,
  historyDocumentType,
  historySearch,
  historySortBy,
  historySortOrder,
  historyRecords,
  historyLoading,
  historyError,
  onClose,
  onDocumentTypeChange,
  onSearchChange,
  onSearchSubmit,
  onSortChange,
  onSortOrderChange,
  onOpenRecord,
}: HistoryModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <section className="w-full max-w-5xl rounded-3xl border border-slate-700 bg-[#0b1120] shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 p-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <History size={16} />
              {historyDocument.label} History
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Open any saved {historyDocument.label.toLowerCase()} to view, edit, print, or download it again.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition hover:border-rose-400 hover:text-rose-300"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex flex-wrap gap-2">
            {documentTypes.map((documentType) => {
              const isActive = historyDocumentType === documentType.type;
              return (
                <button
                  key={documentType.type}
                  type="button"
                  onClick={() => onDocumentTypeChange(documentType.type)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-cyan-400 text-slate-950'
                      : 'border border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-200'
                  }`}
                >
                  {documentType.label}
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_180px_140px_auto]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                value={historySearch}
                onChange={(event) => onSearchChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') onSearchSubmit();
                }}
                placeholder={getHistorySearchPlaceholder(historyDocumentType)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
              />
            </div>
            <select
              value={historySortBy}
              onChange={(event) => onSortChange(event.target.value as HistorySortBy)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            >
              <option value="createdAt">Saved Date</option>
              <option value="date">Document Date</option>
              <option value="documentNo">Number</option>
              <option value="customerName">Customer</option>
              <option value="totalAmount">Amount</option>
            </select>
            <select
              value={historySortOrder}
              onChange={(event) => onSortOrderChange(event.target.value as HistorySortOrder)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            >
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </select>
            <button
              type="button"
              onClick={onSearchSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              <Search size={16} />
              Search
            </button>
          </div>

          {historyLoading ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-10 text-sm text-cyan-300">
              <Loader2 size={18} className="animate-spin" />
              Loading history...
            </div>
          ) : historyError ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {historyError}
            </div>
          ) : historyRecords.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-10 text-center text-sm text-slate-400">
              No saved {historyDocument.label.toLowerCase()} history found.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-800">
              <div className="max-h-[60vh] overflow-auto">
                <table className="w-full min-w-[760px] table-fixed border-collapse text-left text-sm">
                  <thead className="sticky top-0 bg-slate-900 text-xs uppercase tracking-[0.18em] text-slate-400">
                    <tr>
                      <th className="w-[18%] px-4 py-3">No</th>
                      <th className="w-[26%] px-4 py-3">Customer</th>
                      <th className="w-[14%] px-4 py-3">Date</th>
                      <th className="w-[14%] px-4 py-3">Amount</th>
                      <th className="w-[18%] px-4 py-3">Saved</th>
                      <th className="w-[10%] px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/60 text-slate-200">
                    {historyRecords.map((record) => (
                      <tr key={record._id} className="transition hover:bg-slate-900">
                        <td className="px-4 py-3 font-semibold text-white">
                          {record.documentNo || record.form?.invoiceNo || '---'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate">
                            {record.customerName || record.form?.companyName || '---'}
                          </div>
                          <div className="mt-1 truncate text-xs text-slate-500">
                            {getHistoryReferenceText(record)}
                          </div>
                        </td>
                        <td className="px-4 py-3">{record.date || record.form?.date || '---'}</td>
                        <td className="px-4 py-3">{formatCurrency(Number(record.totalAmount || 0))}</td>
                        <td className="px-4 py-3 text-slate-400">
                          {record.createdAt ? new Date(record.createdAt).toLocaleString() : '---'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => onOpenRecord(record)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
                          >
                            <Eye size={14} />
                            Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
