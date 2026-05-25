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
import { DocumentBodyBorder } from './DocumentBodyBorder';
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
  const pxPerMm = 794 / 210;
  const taxAmount = totalAmount * 0.18;
  const grandTotal = totalAmount + taxAmount;
  const quotationItems = items.length > 0 ? items : [createInvoiceItem()];
  const customerRows = getCustomerDetailRows(form);

  const showItemImage = (item: InvoiceItem) => {
    const hasImage = Boolean(getPictureSource(item.picture));
    return hasImage && (item as any).showPicture !== false;
  };

  const baseRowHeight = 24 * pxPerMm;
  const rowHeights = quotationItems.map((item) => {
    const descriptionRows = Math.min(
      estimateWrappedRows(item.description || item.productName || '', 42),
      MAX_DESCRIPTION_LINES
    );
    const remarksRows = estimateWrappedRows(item.remarks || item.productName || '', 28);
    const imageHeight = showItemImage(item) ? 15 * pxPerMm : 0;
    const descriptionHeight = descriptionRows * 2.55 * pxPerMm + 3 * pxPerMm;
    const remarksHeight = remarksRows * 2.55 * pxPerMm + imageHeight + (imageHeight ? 3 * pxPerMm : 2 * pxPerMm);

    return Math.min(24 * pxPerMm, Math.max(baseRowHeight, descriptionHeight, remarksHeight));
  });

  const contentLeft = 15 * pxPerMm;
  const tableTop = (84 - 7.9) * pxPerMm;
  const tableHeaderHeight = 10 * pxPerMm;
  const bodyBottom = 250 * pxPerMm;
  const detailsBlockHeight = 60 * pxPerMm;
  const tableBottomGap = 5.3 * pxPerMm;
  const maxTableBodyHeight = bodyBottom - tableTop - tableHeaderHeight - detailsBlockHeight - tableBottomGap;
  const fixedTableBodyHeight = Math.max(118, maxTableBodyHeight);
  const rowHeightLimit = Math.max(48, Math.floor(fixedTableBodyHeight / quotationItems.length));
  const cappedRowHeights = rowHeights.map((height) => Math.min(height, rowHeightLimit));
  const usedRowsHeight = cappedRowHeights.reduce((height, itemRowHeight) => height + itemRowHeight, 0);
  const remainingRowsHeight = Math.max(0, fixedTableBodyHeight - usedRowsHeight);
  if (cappedRowHeights.length > 0) {
    cappedRowHeights[cappedRowHeights.length - 1] += remainingRowsHeight;
  }
  const tableHeight =
    tableHeaderHeight + cappedRowHeights.reduce((height, itemRowHeight) => height + itemRowHeight, 0);
  const noteTop = Math.min(tableTop + tableHeight + tableBottomGap, bodyBottom - detailsBlockHeight);
  const detailsTop = noteTop + 10 * pxPerMm;
  const tableColumns = [10, 83, 55, 32].map((width) => width * pxPerMm);
  const priceLabelWidth = 12 * pxPerMm;

  return (
    <div className="quotation-a4 relative mx-auto h-[1123px] w-[794px] overflow-hidden bg-white text-black">
      <div className="absolute left-[35px] top-[19px]">
        <Image
          src={CLASSIC_LOGO_SRC}
          alt="Classic Electronics"
          width={300}
          height={120}
          className="h-auto w-[299px]"
          priority
        />
      </div>

      <div
        className="absolute right-[57px] top-[106px] w-[390px] text-right"
        style={{
          fontFamily: '"Arial Narrow", Arial, Helvetica, sans-serif',
          fontStretch: 'condensed',
        }}
      >
        <div className="text-[21px] font-black uppercase leading-none text-slate-950">
          QUOTATION: {form.invoiceNo || '---'}
        </div>
        <div className="mt-[3px] text-[16px] font-black leading-none text-slate-950">
          Date: {form.date || '--/--/----'}
        </div>
        <div className="mt-[5px] w-full space-y-[4px]">
          <div className="text-[16px] font-black italic leading-none text-slate-950">
            Indent No: {form.purchaseOrder || '____________'}
          </div>
          <div className="text-[16px] font-black italic leading-none text-slate-950">
            Enquiry No: {form.quotationNo || '____________'}
          </div>
        </div>
      </div>

      <DocumentBodyBorder className="left-[42px] top-[148px] z-10 h-[889px] w-[710px]" />

      <div className="pointer-events-none absolute left-[178px] top-[439px] opacity-[0.18]">
        <Image
          src={CLASSIC_LOGO_SRC}
          alt=""
          width={500}
          height={200}
          className="h-auto w-[446px]"
        />
      </div>

      <div
        className="absolute left-[57px] flex max-w-[405px] flex-col text-[12px] leading-[15px]"
        style={{ top: (50 - 7.9) * pxPerMm }}
      >
        {customerRows.map(([label, value], index) => (
          <div key={`${label || 'customer'}-${index}`} className="truncate">
            {label ? `${label} ${value || '________________'}` : value || '________________'}
          </div>
        ))}
      </div>

      <div
        className="absolute left-[57px] text-[13px] font-bold italic leading-none"
        style={{ top: (78 - 7.9) * pxPerMm }}
      >
        Reference to your quotation the details is as below.
      </div>

      <div
        className="absolute overflow-hidden rounded-[11px] border border-black bg-white text-[14px]"
        style={{ left: contentLeft, top: tableTop, width: 180 * pxPerMm }}
      >
        <div className="absolute inset-0 bg-white" />
        <div
          className="relative grid border-b border-black bg-white text-center text-[12px] font-bold"
          style={{
            gridTemplateColumns: `${tableColumns[0]}px ${tableColumns[1]}px ${tableColumns[2]}px ${tableColumns[3]}px`,
            height: tableHeaderHeight,
          }}
        >
          <div className="flex items-center justify-center border-r border-black">
            Sr
          </div>

          <div className="flex items-center justify-center border-r border-black">
            DESCRIPTION
          </div>

          <div className="flex items-center justify-center border-r border-black">
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
              className="relative grid min-w-0 overflow-hidden border-b border-black bg-white last:border-b-0"
              style={{
                gridTemplateColumns: `${tableColumns[0]}px ${tableColumns[1]}px ${tableColumns[2]}px ${tableColumns[3]}px`,
                height: rowHeight,
              }}
            >
              <div className="flex items-center justify-center border-r border-black text-[10px]">
                {index + 1}
              </div>

              <div
                className="min-h-0 overflow-hidden border-r border-black px-2 py-[5px] text-[10px] leading-[10px]"
                style={{
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                }}
              >
                {item.productName ? <div className="font-bold">{item.productName}</div> : null}
                {item.description ? (
                  <div
                    className="whitespace-pre-wrap font-normal"
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

              <div className="min-w-0 overflow-hidden border-r border-black px-2 py-[5px]">
                <div className="flex h-full min-w-0 flex-col items-center gap-2 overflow-hidden">
                  <div
                    className="w-full min-w-0 whitespace-pre-wrap break-words text-left text-[10px] leading-[12px]"
                    style={{
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.remarks || item.productName || ''}
                  </div>

                  {showItemImage(item) && imageSrc ? (
                    <div className="mt-1 h-11 w-full shrink-0 overflow-hidden border border-slate-300 bg-white p-1">
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

              <div className="grid min-w-0 grid-rows-4 overflow-hidden text-[11px] leading-none">
                {[
                  ['UOM', item.uom || 'NOS', false],
                  ['Price', formatCurrency(item.unitPrice || 0), false],
                  ['QTY', String(item.quantity || 0), false],
                  ['Total', formatCurrency(itemTotal), true],
                ].map(([label, value, isTotal]) => (
                  <div
                    key={String(label)}
                    className="grid border-b border-black last:border-b-0"
                    style={{ gridTemplateColumns: `${priceLabelWidth}px 1fr` }}
                  >
                    <div className={`flex items-center border-r border-black px-1 italic ${isTotal ? 'font-bold' : ''}`}>
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
        className="absolute left-[57px] max-w-[660px] text-[13px] font-bold italic"
        style={{ top: noteTop }}
      >
        If you have any questions concerning this quotation please tell us.
      </div>

      <div
        className="absolute left-[57px] text-[13px] font-bold italic leading-[30px]"
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
        className="absolute w-[212px] rounded-[11px] border border-slate-950 bg-white px-3 py-2 text-right"
        style={{ left: 139 * pxPerMm, top: detailsTop - 7 }}
      >
        <div className="space-y-[2px] text-[12px] font-semibold text-slate-700">
          <div className="flex justify-between gap-4">
            <span>Sub Total</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>GST 18%</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
        </div>
        <div className="mt-1 border-t border-slate-300 pt-1">
          <div className="text-[10px] font-semibold uppercase text-slate-500">
            Grand Total
          </div>
          <div className="mt-1 text-[20px] font-black text-slate-950">
            {formatCurrency(grandTotal)}
          </div>
        </div>
      </div>

      <div className="absolute left-[76px] w-[160px]" style={{ top: detailsTop + 66 }}>
        <Image
          src="/quotation-stamp-signature.png"
          alt=""
          width={250}
          height={150}
          className="h-auto w-[155px] mix-blend-multiply"
        />
      </div>

      <div className="absolute left-0 right-0 top-[990px] text-center text-[14px] font-black italic leading-none text-violet-700 drop-shadow-[1px_1px_1px_rgba(15,23,42,0.22)]">
        {form.thankYouNote || 'THANK YOU FOR YOUR BUSINESS!'}
      </div>
      <div className="absolute left-0 right-0 top-[1003px] text-center text-[14px] font-bold leading-none text-black">
        {form.subtitle || 'A wide range of industrial instrument & sensing solutions'}
      </div>

      <DocumentFooter form={form} className="absolute bottom-[10px] left-0 right-0" />
    </div>
  );
};
