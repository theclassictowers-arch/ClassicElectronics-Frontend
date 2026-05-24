import Image from 'next/image';
import { CLASSIC_LOGO_SRC } from '@/lib/brandAssets';
import type { DocumentType, InvoiceForm, InvoiceItem } from '../types';
import {
  SALES_TAX_RATE,
  documentTypes,
  formatCurrency,
  getCustomerDetailRows,
  getPictureSource,
} from '../utils';
import { DocumentFooter } from './DocumentFooter';

type ActiveDocument = (typeof documentTypes)[number];

type StandardDocumentPreviewProps = {
  activeDocument: ActiveDocument;
  activeDocumentType: DocumentType;
  form: InvoiceForm;
  items: InvoiceItem[];
  totalAmount: number;
};

export const StandardDocumentPreview = ({
  activeDocument,
  activeDocumentType,
  form,
  items,
  totalAmount,
}: StandardDocumentPreviewProps) => {
  const isTaxDocument = activeDocumentType === 'invoice';
  const customerRows = getCustomerDetailRows(form);
  const showInvoiceTaxNotice = isTaxDocument && form.showQuotationTaxNotice !== false;
  const showInvoiceTerms = isTaxDocument && form.showQuotationTerms !== false;
  const salesTaxAmount = totalAmount * SALES_TAX_RATE;
  const grandTotalWithTax = isTaxDocument ? totalAmount + salesTaxAmount : totalAmount;

  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div className="max-w-[285px] shrink-0">
          <Image
            src={CLASSIC_LOGO_SRC}
            alt="Classic Electronics"
            width={360}
            height={135}
            className="h-auto w-full"
            priority
          />
        </div>

        <div
          className="ml-auto w-full max-w-[340px] text-right"
          style={{
            fontFamily: '"Arial Narrow", Arial, Helvetica, sans-serif',
            fontStretch: 'condensed',
          }}
        >
          <div className="text-[20px] font-black uppercase leading-none text-slate-950">
            {activeDocument.pdfTitle}: {form.invoiceNo || '---'}
          </div>
          <div className="mt-[2px] text-[14px] font-black leading-none text-slate-950">
            Date: {form.date || '--/--/----'}
          </div>
          {activeDocumentType === 'bill' ? null : (
            <div className="mt-[4px] w-full space-y-[3px]">
              <div className="text-[14px] font-black italic leading-none text-slate-950">
                {activeDocument.purchaseLabel}: {form.purchaseOrder || '____________'}
              </div>
              <div className="text-[14px] font-black italic leading-none text-slate-950">
                {activeDocument.referenceLabel}: {form.quotationNo || '____________'}
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className="relative mt-7 flex flex-1 flex-col overflow-hidden rounded-[34px] border-2 border-violet-600 bg-white px-4 pb-5 pt-8 sm:px-5"
        style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.08]">
          <Image
            src={CLASSIC_LOGO_SRC}
            alt=""
            width={900}
            height={360}
            className="h-auto w-[76%] max-w-[500px]"
          />
        </div>

        <div className="absolute left-6 top-0 h-6 w-[42%] -translate-y-1/2 rounded-[18px] border-2 border-violet-600 bg-white" />

        <div className="relative flex h-full flex-1 flex-col">
          <div className="mb-3 grid max-w-[430px] grid-cols-[44px_1fr] gap-x-2 text-[12px] leading-snug text-slate-900">
            {customerRows.map(([label, value], index) => (
              label ? (
                <div key={`${label}-${index}`} className="col-span-2 min-w-0 break-words">
                  {label} {value || '________________'}
                </div>
              ) : (
                <div key={`customer-${index}`} className="col-span-2 min-w-0 break-words">
                  {value || '________________'}
                </div>
              )
            ))}
          </div>

          <div className="overflow-hidden rounded-[20px] border-2 border-slate-950 bg-white">
            <table className="w-full table-fixed border-collapse text-slate-950">
              <thead>
                <tr className="border-b-2 border-slate-950">
                  <th className="w-10 border-r-2 border-slate-950 px-1 py-2 text-center text-[11px] font-medium sm:text-[13px]">
                    Sr
                  </th>
                  <th className="w-[43%] border-r-2 border-slate-950 px-2 py-2 text-center text-[11px] font-medium sm:text-[13px]">
                    Description
                  </th>
                  <th className="w-[30%] border-r-2 border-slate-950 px-1 py-2 text-center text-[11px] font-medium sm:text-[13px]">
                    Remarks
                  </th>
                  <th className="w-[21%] px-1 py-2 text-center text-[11px] font-medium sm:text-[13px]">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const itemTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);

                  return (
                    <tr
                      key={item.id}
                      className="align-top [&:not(:last-child)]:border-b-2 [&:not(:last-child)]:border-slate-950"
                    >
                      <td className="border-r-2 border-slate-950 px-1 py-3 text-center text-sm sm:text-base">
                        {index + 1}
                      </td>
                      <td className="border-r-2 border-slate-950 px-2 py-3 text-[12px] leading-snug sm:text-[13px]">
                        {item.productName ? <div className="font-bold text-slate-950">{item.productName}</div> : null}
                        {item.description ? (
                          <div className={item.productName ? 'mt-1' : ''}>{item.description}</div>
                        ) : !item.productName ? (
                          'Item description'
                        ) : null}
                      </td>
                      <td className="border-r-2 border-slate-950 px-2 py-3 text-[11px] leading-relaxed text-slate-700 sm:text-[12px]">
                        <div className="space-y-2">
                          <div className="font-medium text-slate-900">
                            {item.remarks || item.productName || 'Remarks'}
                          </div>
                          {item.showPicture && getPictureSource(item.picture) ? (
                            <div className="overflow-hidden border border-slate-300 bg-white">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={getPictureSource(item.picture)}
                                alt={item.productName || item.description || 'Invoice item'}
                                className="h-16 w-full object-contain bg-white p-1.5"
                              />
                            </div>
                          ) : item.picture && item.showPicture ? (
                            <div className="rounded-lg border border-dashed border-slate-300 px-2 py-3 text-[11px] text-slate-500">
                              {item.picture}
                            </div>
                          ) : (
                            <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-slate-300 text-[11px] text-slate-400">
                              {item.showPicture ? 'No picture selected' : 'Photo off'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-0 text-[12px] sm:text-[13px]">
                        <div className="grid h-full min-h-[96px] grid-rows-4">
                          {[
                            ['UOM', item.uom || '--', false],
                            ['Price', formatCurrency(item.unitPrice || 0), false],
                            ['QTY', String(item.quantity || 0), false],
                            ['Total', formatCurrency(itemTotal), true],
                          ].map(([label, value, isTotal]) => (
                            <div
                              key={String(label)}
                              className="grid grid-cols-[42px_1fr] border-b-2 border-slate-950 last:border-b-0"
                            >
                              <div className={`flex items-center border-r-2 border-slate-950 px-1 ${isTotal ? 'font-bold' : ''}`}>
                                {label}
                              </div>
                              <div className={`flex min-w-0 items-center justify-center overflow-hidden truncate px-1 text-center ${isTotal ? 'font-bold' : ''}`}>
                                {value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xs">
              <div className="text-[20px] italic text-sky-700 sm:text-[22px]">
                {form.directorName || 'Director Name'}
              </div>
              <div className="mt-2 w-28 border-t border-slate-400 pt-1 text-[12px] font-semibold text-slate-900">
                Director
              </div>
            </div>
            <div className="w-full max-w-[240px] rounded-[16px] border-2 border-slate-950 bg-white px-4 py-3 text-right">
              <div className="space-y-1 text-[12px] font-semibold text-slate-700">
                {isTaxDocument ? (
                  <>
                    <div className="flex justify-between gap-4">
                      <span>Sub Total</span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>GST 18%</span>
                      <span>{formatCurrency(salesTaxAmount)}</span>
                    </div>
                  </>
                ) : null}
              </div>
              <div className="mt-2 border-t border-slate-300 pt-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  {isTaxDocument ? 'Grand Total' : 'Total'}
                </div>
                <div className="mt-1 text-[18px] font-black text-slate-950 sm:text-[20px]">
                  {formatCurrency(grandTotalWithTax)}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-[30px] left-0 right-0 text-center text-[14px] font-black italic leading-none text-violet-700 drop-shadow-[1px_1px_1px_rgba(15,23,42,0.22)]">
            {form.thankYouNote || 'THANK YOU FOR YOUR BUSINESS!'}
          </div>
          {showInvoiceTerms ? (
            <div className="absolute bottom-[40px] left-5 right-5 border-2 border-dashed border-emerald-700 bg-white px-2 py-1 text-[12px] leading-[17px]">
              <div className="font-bold">Terms &amp; Conditions</div>
              <div>All goods remain the property of Classic Electronic until full payment has been received.</div>
              <div>
                Please make cheque payments payable to <span className="text-[16px] font-black">Classic Electronic</span>
              </div>
              <div className="text-[16px] font-black">
                Account No: Meezan Bank PK13 MEZN 0003 1101 1360 2248
              </div>
            </div>
          ) : null}
          {showInvoiceTaxNotice ? (
            <div
              className={`absolute left-5 w-[300px] border-2 border-black bg-yellow-200 px-4 py-2 text-center text-[14px] font-black uppercase leading-[18px] text-red-600 ${
                showInvoiceTerms ? 'bottom-[122px]' : 'bottom-[40px]'
              }`}
            >
              <div>Please do not reduct</div>
              <div>income tax as it was payed</div>
              <div>while importing</div>
            </div>
          ) : null}
          <div className="absolute bottom-[10px] left-0 right-0 text-center text-[14px] font-bold leading-none text-black">
            {form.subtitle || 'A wide range of industrial instrument & sensing solutions'}
          </div>

          <div className="flex-1" />
        </div>
      </div>

      <DocumentFooter form={form} className="mt-0" />
    </>
  );
};
