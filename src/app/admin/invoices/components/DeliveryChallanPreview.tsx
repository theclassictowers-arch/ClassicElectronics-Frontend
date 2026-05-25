import Image from 'next/image';
import { CLASSIC_LOGO_SRC } from '@/lib/brandAssets';
import type { InvoiceForm, InvoiceItem } from '../types';
import { MAX_DESCRIPTION_LINES, createInvoiceItem, getCustomerDetailRows } from '../utils';
import { DocumentBodyBorder } from './DocumentBodyBorder';
import { DocumentFooter } from './DocumentFooter';

type DeliveryChallanPreviewProps = {
  form: InvoiceForm;
  items: InvoiceItem[];
};

export const DeliveryChallanPreview = ({ form, items }: DeliveryChallanPreviewProps) => {
  const pxPerMm = 794 / 210;
  const customerRows = getCustomerDetailRows(form);
  const deliveryItems = (items.length > 0 ? items : [createInvoiceItem()]).slice(0, 4);
  const contentLeft = 15 * pxPerMm;
  const contentRight = 195 * pxPerMm;
  const customerTop = (50 - 7.9) * pxPerMm;
  const tableTop = customerTop + customerRows.length * 5 * pxPerMm;
  const tableHeaderHeight = 10 * pxPerMm;
  const columnWidths = [18, 87, 43, 32].map((width) => width * pxPerMm);
  const tableWidth = contentRight - contentLeft;
  const deliveryLineHeight = 3.6 * pxPerMm;
  const deliveryRowPadding = 2 * pxPerMm;
  const estimateRows = (value: string, charactersPerLine: number) =>
    Math.max(
      1,
      value
        .trim()
        .split(/\r?\n/)
        .reduce((lineCount, line) => lineCount + Math.max(1, Math.ceil((line || ' ').length / charactersPerLine)), 0)
    );
  const rowHeights = deliveryItems.map((item) => {
    const particularsRows =
      (item.productName ? estimateRows(item.productName, 39) : 0) +
      (item.description ? Math.min(estimateRows(item.description, 39), MAX_DESCRIPTION_LINES) : 0);
    const remarksRows = item.remarks ? estimateRows(item.remarks, 22) : 1;

    return Math.min(
      31 * pxPerMm,
      Math.max(12 * pxPerMm, Math.max(particularsRows, remarksRows, 1) * deliveryLineHeight + deliveryRowPadding)
    );
  });
  const tableHeight = tableHeaderHeight + rowHeights.reduce((height, rowHeight) => height + rowHeight, 0);
  const signatureTop = Math.min(tableTop + tableHeight + 12 * pxPerMm, 220 * pxPerMm);

  return (
    <div className="relative mx-auto h-[1123px] w-[794px] overflow-hidden bg-white text-black">
      <div className="absolute left-[57px] top-[19px]">
        <div className="w-[299px]">
          <Image
            src={CLASSIC_LOGO_SRC}
            alt="Classic Electronics"
            width={360}
            height={135}
            className="h-auto w-full"
            priority
          />
        </div>
      </div>
      <div
        className="absolute right-[57px] top-[106px] w-[430px] text-right"
        style={{
          fontFamily: '"Arial Narrow", Arial, Helvetica, sans-serif',
          fontStretch: 'condensed',
        }}
      >
        <div className="text-[21px] font-black uppercase leading-none text-slate-950">
          DELIVERY CHALLAN: {form.invoiceNo || '---'}
        </div>
        <div className="mt-[4px] text-[16px] font-black leading-none text-slate-950">
          Date: {form.date || '--/--/----'}
        </div>
        <div className="mt-[5px] w-full space-y-[4px]">
          <div className="text-[16px] font-black italic leading-none text-slate-950">
            Purchase Order: {form.purchaseOrder || '____________'}
          </div>
          <div className="text-[16px] font-black italic leading-none text-slate-950">
            Quotation No: {form.quotationNo || '____________'}
          </div>
        </div>
      </div>

      <DocumentBodyBorder className="left-[42px] top-[148px] z-10 h-[902px] w-[710px]" />
      <div className="pointer-events-none absolute left-[170px] top-[476px] opacity-[0.08]">
        <Image src={CLASSIC_LOGO_SRC} alt="" width={500} height={200} className="h-auto w-[454px]" />
      </div>

      <div className="absolute left-[60px] flex max-w-[430px] flex-col text-[12px] leading-[19px] text-slate-900" style={{ top: customerTop }}>
        {customerRows.map(([label, value], index) => (
          <div key={`${label || 'customer'}-${index}`} className="truncate">
            {label ? `${label} ${value || '________________'}` : value || '________________'}
          </div>
        ))}
      </div>

      <div
        className="absolute overflow-hidden rounded-[19px] border border-slate-950 bg-white text-slate-950"
        style={{ left: contentLeft, top: tableTop, width: tableWidth, height: tableHeight }}
      >
        <div
          className="grid border-b border-slate-950 text-center text-[13px] font-bold leading-none"
          style={{
            gridTemplateColumns: `${columnWidths[0]}px ${columnWidths[1]}px ${columnWidths[2]}px ${columnWidths[3]}px`,
            height: tableHeaderHeight,
          }}
        >
          {['S.No', 'Particulars', 'Remarks', 'Details'].map((header, index) => (
            <div key={header} className={`flex items-center justify-center ${index < 3 ? 'border-r border-slate-950' : ''}`}>
              {header}
            </div>
          ))}
        </div>

        {deliveryItems.map((item, index) => {
          const rowHeight = rowHeights[index];

          return (
            <div
              key={item.id}
              className="grid overflow-hidden border-b border-slate-950 last:border-b-0"
              style={{
                gridTemplateColumns: `${columnWidths[0]}px ${columnWidths[1]}px ${columnWidths[2]}px ${columnWidths[3]}px`,
                height: rowHeight,
              }}
            >
              <div className="flex items-center justify-center border-r border-slate-950 text-[13px]">
                {index + 1}
              </div>
              <div className="overflow-hidden border-r border-slate-950 px-2 py-[7px] text-[10px] leading-[14px]">
                {item.productName ? <div className="font-bold">{item.productName}</div> : null}
                {item.description ? (
                  <div
                    className="whitespace-pre-wrap"
                    style={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: MAX_DESCRIPTION_LINES,
                      overflow: 'hidden',
                    }}
                  >
                    {item.description}
                  </div>
                ) : !item.productName ? (
                  'Item particulars'
                ) : null}
              </div>
              <div className="overflow-hidden whitespace-pre-wrap border-r border-slate-950 px-2 py-[7px] text-[13px] leading-[14px]">
                {item.remarks}
              </div>
              <div className="grid grid-rows-2 overflow-hidden text-[13px] leading-none">
                {[
                  ['UOM', item.uom || 'PCS'],
                  ['QTY', String(item.quantity || '')],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[45px_1fr] border-b border-slate-950 last:border-b-0">
                    <div className="flex items-center border-r border-slate-950 px-1 font-bold">{label}</div>
                    <div className="flex items-center justify-center px-1 text-center">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute left-[60px] text-[14px] text-slate-950" style={{ top: signatureTop }}>
        From Classic Electronics
      </div>
      <div className="absolute left-[60px]" style={{ top: signatureTop + 97 }}>
        <div className="text-[20px] italic leading-none text-cyan-700">
          {form.directorName || 'M Fawad Younas'}
        </div>
        <div className="mt-[6px] w-[121px] border-t border-slate-300 pt-[4px] text-[13px] font-bold text-slate-950">
          Director
        </div>
      </div>

      <div className="absolute left-0 right-0 top-[990px] z-20 text-center text-[14px] font-black italic leading-none text-violet-700 drop-shadow-[1px_1px_1px_rgba(15,23,42,0.22)]">
        {form.thankYouNote || 'THANK YOU FOR YOUR BUSINESS!'}
      </div>
      <div className="absolute left-0 right-0 top-[1013px] z-20 text-center text-[14px] font-bold leading-none text-black">
        {form.subtitle || 'A wide range of industrial instrument & sensing solutions'}
      </div>
      <DocumentFooter form={form} className="absolute bottom-[10px] left-0 right-0" />
    </div>
  );
};
