import Image from 'next/image';
import { CLASSIC_LOGO_SRC } from '@/lib/brandAssets';
import type { InvoiceForm, InvoiceItem } from '../types';
import {
  MAX_DESCRIPTION_LINES,
  createInvoiceItem,
  formatCurrency,
  getCustomerDetailRows,
  getPictureSource,
} from '../utils';
import { DocumentFooter } from './DocumentFooter';

type QuotationPreviewProps = {
  form: InvoiceForm;
  items: InvoiceItem[];
  totalAmount: number;
};

const estimateWrappedRows = (value: string, charactersPerLine: number) => {
  const lines = value.trim().split(/\r?\n/);
  const rowCount = lines.reduce((count, line) => {
    if (!line.trim()) return count + 1;

    const sentenceRows = Math.ceil(line.length / charactersPerLine);
    const longWordRows = line
      .trim()
      .split(/\s+/)
      .reduce((maxRows, word) => Math.max(maxRows, Math.ceil(word.length / charactersPerLine)), 1);

    return count + Math.max(sentenceRows, longWordRows, 1);
  }, 0);

  return Math.max(1, rowCount);
};

export const QuotationPreview = ({ form, items, totalAmount }: QuotationPreviewProps) => {
  const taxAmount = totalAmount * 0.18;
  const grandTotal = totalAmount + taxAmount;
  const quotationItems = items.length > 0 ? items : [createInvoiceItem()];
  const customerRows = getCustomerDetailRows(form);

  const showItemImage = (item: InvoiceItem) => {
    const hasImage = Boolean(getPictureSource(item.picture));
    return hasImage && (item as any).showPicture !== false;
  };

  const baseRowHeight =
    quotationItems.length <= 1 ? 150 : quotationItems.length === 2 ? 210 : 165;
  const rowHeights = quotationItems.map((item) => {
    const descriptionRows = Math.min(
      estimateWrappedRows(item.description || item.productName || '', 24),
      MAX_DESCRIPTION_LINES
    );
    const remarksRows = estimateWrappedRows(item.remarks || item.productName || '', 27);
    const imageHeight = showItemImage(item) ? 104 : 0;
    const descriptionHeight = descriptionRows * 22 + 74;
    const remarksHeight = remarksRows * 22 + imageHeight + 50;

    return Math.max(baseRowHeight, descriptionHeight, remarksHeight);
  });

  const tableTop = 252;
  const tableHeaderHeight = 48;
  const bodyBottom = 960;
  const detailsBlockHeight = 210;
  const tableBottomGap = 20;
  const maxTableBodyHeight = bodyBottom - tableTop - tableHeaderHeight - detailsBlockHeight - tableBottomGap;
  const cappedRowHeights = rowHeights.map((height) =>
    Math.min(height, Math.max(130, Math.floor(maxTableBodyHeight / quotationItems.length)))
  );
  const tableHeight =
    tableHeaderHeight + cappedRowHeights.reduce((height, itemRowHeight) => height + itemRowHeight, 0);
  const noteTop = Math.min(tableTop + tableHeight + tableBottomGap, bodyBottom - detailsBlockHeight);
  const detailsTop = noteTop + 28;

  return (
    <div className="quotation-a4 relative mx-auto h-[1123px] w-[794px] overflow-hidden bg-white text-black">
      <div className="absolute left-[10px] top-[8px]">
        <Image
          src={CLASSIC_LOGO_SRC}
          alt="Classic Electronics"
          width={300}
          height={120}
          className="h-auto w-[285px]"
          priority
        />
      </div>

      <div
        className="absolute right-[22px] top-[8px] w-[340px] text-right"
        style={{
          fontFamily: '"Arial Narrow", Arial, Helvetica, sans-serif',
          fontStretch: 'condensed',
        }}
      >
        <div className="text-[20px] font-black uppercase leading-none text-slate-950">
          QUOTATION: {form.invoiceNo || '---'}
        </div>
        <div className="mt-[2px] text-[14px] font-black leading-none text-slate-950">
          Date: {form.date || '--/--/----'}
        </div>
        <div className="mt-[4px] w-full space-y-[3px]">
          <div className="text-[14px] font-black italic leading-none text-slate-950">
            Indent No: {form.purchaseOrder || '____________'}
          </div>
          <div className="text-[14px] font-black italic leading-none text-slate-950">
            Enquiry No: {form.quotationNo || '____________'}
          </div>
        </div>
      </div>

      <div className="absolute left-[17px] top-[132px] h-[905px] w-[760px] rounded-[34px] border-2 border-violet-600 bg-white" />
      <div className="absolute left-[41px] top-[132px] h-6 w-[42%] -translate-y-1/2 rounded-[18px] border-2 border-violet-600 bg-white" />

      <div className="pointer-events-none absolute left-[118px] top-[351px] opacity-[0.14]">
        <Image
          src={CLASSIC_LOGO_SRC}
          alt=""
          width={500}
          height={200}
          className="h-auto w-[470px]"
        />
      </div>

      <div className="absolute left-[44px] top-[112px] flex max-w-[405px] flex-col text-[12px] leading-[14px]">
        {customerRows.map(([label, value], index) => (
          <div key={`${label || 'customer'}-${index}`} className="truncate">
            {label ? `${label} ${value || '________________'}` : value || '________________'}
          </div>
        ))}
      </div>

      <div className="absolute left-[44px] top-[224px] text-[13px] font-bold italic leading-[14px]">
        Reference to your quotation the details is as below.
      </div>

      <div
        className="absolute left-[42px] w-[710px] border-[2px] border-black bg-white text-[14px]"
        style={{ top: tableTop }}
      >
        <div className="grid h-[48px] grid-cols-[38px_330px_220px_122px] border-b-[2px] border-black text-center text-[13px]">
          <div className="flex items-center justify-center border-r-[2px] border-black">
            Sr
          </div>

          <div className="flex items-center justify-center border-r-[2px] border-black">
            DESCRIPTION
          </div>

          <div className="flex items-center justify-center border-r-[2px] border-black">
            Remarks
          </div>

          <div className="flex items-center justify-center">Price</div>
        </div>

        {quotationItems.map((item, index) => {
          const itemTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
          const imageSrc = getPictureSource(item.picture);
          const rowHeight = cappedRowHeights[index];

          return (
            <div
              key={item.id}
              className="grid min-w-0 grid-cols-[38px_330px_220px_122px] overflow-hidden border-b-[2px] border-black last:border-b-0"
              style={{ height: rowHeight }}
            >
              <div className="flex items-center justify-center border-r-[2px] border-black">
                {index + 1}
              </div>

              <div
                className="min-h-0 overflow-hidden border-r-[2px] border-black px-3 py-4 text-[14px] leading-[21px]"
                style={{
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                }}
              >
                {item.productName ? <div className="font-bold">{item.productName}</div> : null}
                {item.description ? (
                  <div
                    className={item.productName ? 'mt-1 whitespace-pre-wrap font-normal' : 'whitespace-pre-wrap font-normal'}
                    style={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: MAX_DESCRIPTION_LINES,
                      overflow: 'hidden',
                    }}
                  >
                    {item.description}
                  </div>
                ) : null}
              </div>

              <div className="min-w-0 overflow-hidden border-r-[2px] border-black px-3 py-3">
                <div className="flex h-full min-w-0 flex-col items-center gap-2 overflow-hidden">
                  <div
                    className="w-full min-w-0 whitespace-pre-wrap break-words text-left text-[14px] leading-[21px]"
                    style={{
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.remarks || item.productName || ''}
                  </div>

                  {showItemImage(item) && imageSrc ? (
                    <div className="mt-1 h-16 w-full shrink-0 overflow-hidden border border-slate-300 bg-white p-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageSrc}
                        alt={item.productName || item.description || 'Item image'}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid min-w-0 grid-rows-4 overflow-hidden text-[13px] leading-none">
                {[
                  ['UOM', item.uom || 'NOS', false],
                  ['Price', formatCurrency(item.unitPrice || 0), false],
                  ['QTY', String(item.quantity || 0), false],
                  ['Total', formatCurrency(itemTotal), true],
                ].map(([label, value, isTotal]) => (
                  <div
                    key={String(label)}
                    className="grid grid-cols-[45px_1fr] border-b-[2px] border-black last:border-b-0"
                  >
                    <div className={`flex items-center border-r-[2px] border-black px-1 ${isTotal ? 'font-bold' : ''}`}>
                      {label}
                    </div>
                    <div className={`flex min-w-0 items-center justify-center overflow-hidden truncate px-1 text-center ${isTotal ? 'font-bold' : ''}`}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="absolute left-[42px] max-w-[660px] text-[13px] font-bold italic"
        style={{ top: noteTop }}
      >
        If you have any questions concerning this quotation please tell us.
      </div>

      <div
        className="absolute left-[40px] text-[16px] font-bold italic leading-[30px]"
        style={{ top: detailsTop }}
      >
        <div>
          <span>Delivery Period:</span>
          <span className="ml-2 font-normal">{form.deliveryPeriod || '4 Weeks'}</span>
        </div>
        <div>
          <span>Validity Date:</span>
          <span className="ml-2 font-normal">{form.validityDate || '1 WEEK'}</span>
        </div>
      </div>

      <div
        className="absolute right-[44px] w-[212px] rounded-[12px] border-2 border-slate-950 bg-white px-4 py-3 text-right"
        style={{ top: detailsTop - 7 }}
      >
        <div className="space-y-1 text-[12px] font-semibold text-slate-700">
          <div className="flex justify-between gap-4">
            <span>Sub Total</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>GST 18%</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
        </div>
        <div className="mt-2 border-t border-slate-300 pt-2">
          <div className="text-[10px] font-semibold uppercase text-slate-500">
            Grand Total
          </div>
          <div className="mt-1 text-[20px] font-black text-slate-950">
            {formatCurrency(grandTotal)}
          </div>
        </div>
      </div>

      <div className="absolute left-[75px] w-[160px]" style={{ top: detailsTop + 66 }}>
        <Image
          src="/quotation-stamp-signature.png"
          alt=""
          width={250}
          height={150}
          className="h-auto w-[155px] mix-blend-multiply"
        />
      </div>

      <div className="absolute left-0 right-0 top-[996px] text-center text-[14px] font-black italic leading-none text-violet-700 drop-shadow-[1px_1px_1px_rgba(15,23,42,0.22)]">
        {form.thankYouNote || 'THANK YOU FOR YOUR BUSINESS!'}
      </div>
      <div className="absolute left-0 right-0 top-[1015px] text-center text-[14px] font-bold leading-none text-black">
        {form.subtitle || 'A wide range of industrial instrument & sensing solutions'}
      </div>

      <DocumentFooter form={form} className="absolute bottom-[10px] left-0 right-0" />
    </div>
  );
};
