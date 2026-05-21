import Image from 'next/image';
import { CLASSIC_LOGO_SRC } from '@/lib/brandAssets';
import type { DocumentType, InvoiceForm, InvoiceItem } from '../types';
import { SALES_TAX_RATE, documentTypes, formatCurrency, getPictureSource } from '../utils';
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
  const salesTaxAmount = totalAmount * SALES_TAX_RATE;
  const grandTotalWithTax = isTaxDocument ? totalAmount + salesTaxAmount : totalAmount;

  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div className="max-w-[210px] shrink-0">
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
          <div className="text-[16px] font-black uppercase leading-[1.08] tracking-[0.04em] text-slate-950 sm:text-[18px]">
            {activeDocument.pdfTitle}: {form.invoiceNo || '---'}
          </div>
          <div className="mt-1 text-[15px] font-black leading-[1.08] text-slate-950 sm:text-[17px]">
            Date: {form.date || '--/--/----'}
          </div>
          <div className="mt-2 w-full space-y-1">
            <div className="text-[14px] font-black italic leading-[1.12] text-slate-950 sm:text-[15px]">
              {activeDocument.purchaseLabel}: {form.purchaseOrder || '____________'}
            </div>
            <div className="text-[14px] font-black italic leading-[1.12] text-slate-950 sm:text-[15px]">
              {activeDocument.referenceLabel}: {form.quotationNo || '____________'}
            </div>
          </div>
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
          <div className="mb-3 max-w-md text-[14px] leading-snug text-slate-900 sm:text-[16px]">
            <div>{form.companyName || 'Customer Company'}</div>
            <div>{form.location ? `${form.location}:` : 'Location:'}</div>
            {isTaxDocument ? (
              <>
                <div>GST: {form.gst || '________________'}</div>
                <div>NTN: {form.ntn || '________________'}</div>
              </>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-[20px] border-2 border-slate-950 bg-white">
            <table className="w-full table-fixed border-collapse text-slate-950">
              <thead>
                <tr className="border-b-2 border-slate-950">
                  <th className="w-10 border-r-2 border-slate-950 px-1 py-2 text-center text-[11px] font-medium sm:text-[13px]">
                    Sr
                  </th>
                  <th className="w-[35%] border-r-2 border-slate-950 px-2 py-2 text-center text-[11px] font-medium sm:text-[13px]">
                    Description
                  </th>
                  <th className="w-10 border-r-2 border-slate-950 px-1 py-2 text-center text-[11px] font-medium sm:text-[13px]">
                    UOM
                  </th>
                  <th className="w-10 border-r-2 border-slate-950 px-1 py-2 text-center text-[11px] font-medium sm:text-[13px]">
                    QTY
                  </th>
                  <th className="w-14 border-r-2 border-slate-950 px-1 py-2 text-center text-[11px] font-medium sm:text-[13px]">
                    Unit Price
                  </th>
                  <th className="w-[17%] border-r-2 border-slate-950 px-1 py-2 text-center text-[11px] font-medium sm:text-[13px]">
                    Remarks/Picture
                  </th>
                  <th className="w-16 px-1 py-2 text-center text-[11px] font-medium sm:text-[13px]">
                    Total
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
                        {item.description || 'Item description'}
                      </td>
                      <td className="border-r-2 border-slate-950 px-1 py-3 text-center text-[12px] sm:text-[13px]">
                        {item.uom || '--'}
                      </td>
                      <td className="border-r-2 border-slate-950 px-1 py-3 text-center text-[12px] sm:text-[13px]">
                        {item.quantity || 0}
                      </td>
                      <td className="border-r-2 border-slate-950 px-1 py-3 text-center text-[12px] sm:text-[13px]">
                        {formatCurrency(item.unitPrice || 0)}
                      </td>
                      <td className="border-r-2 border-slate-950 px-2 py-3 text-[11px] leading-relaxed text-slate-700 sm:text-[12px]">
                        <div className="space-y-2">
                          <div className="font-medium text-slate-900">
                            {item.remarks || item.productName || 'Remarks'}
                          </div>
                          {item.showPicture && getPictureSource(item.picture) ? (
                            <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
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
                      <td className="px-1 py-3 text-center text-[12px] font-semibold sm:text-[13px]">
                        {formatCurrency(itemTotal)}
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

          <div className="absolute bottom-4 left-5 text-left text-[14px] font-black italic leading-none text-violet-700 drop-shadow-[1px_1px_1px_rgba(15,23,42,0.22)]">
            {form.thankYouNote || 'THANK YOU FOR YOUR BUSINESS!'}
          </div>
          <div className="absolute bottom-4 left-0 right-0 text-center text-[11px] font-bold leading-none text-black">
            {form.subtitle || 'A wide range of industrial instrument & sensing solutions'}
          </div>

          <div className="flex-1" />
        </div>
      </div>

      <DocumentFooter form={form} className="mt-0" />
    </>
  );
};
