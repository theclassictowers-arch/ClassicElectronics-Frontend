import Image from 'next/image';
import { CLASSIC_LOGO_SRC } from '@/lib/brandAssets';
import type { DocumentType, InvoiceForm, InvoiceItem } from '../types';
import {
  DEFAULT_INVOICE_TAX_NOTICE,
  DEFAULT_INVOICE_TERMS_LINE_1,
  DEFAULT_INVOICE_TERMS_LINE_2,
  DEFAULT_INVOICE_TERMS_TITLE,
  MAX_DESCRIPTION_LINES,
  SALES_TAX_RATE,
  documentTypes,
  formatCurrency,
  getCustomerDetailRows,
  getPictureSource,
} from '../utils';
import { DocumentBodyBorder } from './DocumentBodyBorder';
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
  const pxPerMm = 794 / 210;
  const isTaxDocument = activeDocumentType === 'invoice';
  const isBillDocument = activeDocumentType === 'bill';
  const customerRows = getCustomerDetailRows(form);
  const showInvoiceTaxNotice = isTaxDocument && form.showQuotationTaxNotice !== false;
  const showInvoiceTerms = isTaxDocument && form.showQuotationTerms !== false;
  const hasInvoiceNoticeBlocks = isTaxDocument && (showInvoiceTaxNotice || showInvoiceTerms);
  const salesTaxAmount = totalAmount * SALES_TAX_RATE;
  const grandTotalWithTax = isTaxDocument ? totalAmount + salesTaxAmount : totalAmount;
  const invoiceTaxNotice = form.invoiceTaxNotice?.trim() || DEFAULT_INVOICE_TAX_NOTICE;
  const invoiceTermsTitle = form.invoiceTermsTitle?.trim() || DEFAULT_INVOICE_TERMS_TITLE;
  const invoiceTermsLine1 = form.invoiceTermsLine1?.trim() || DEFAULT_INVOICE_TERMS_LINE_1;
  const invoiceTermsLine2 = form.invoiceTermsLine2?.trim() || DEFAULT_INVOICE_TERMS_LINE_2;
  const signatureName =
    activeDocumentType === 'bill'
      ? form.billIssuerName?.trim() || form.directorName || 'Issued By'
      : form.directorName || 'Director Name';
  const signatureLabel = activeDocumentType === 'bill' ? 'Issued By' : 'Director';
  const contentLeft = 15 * pxPerMm;
  const contentRight = 195 * pxPerMm;
  const tableTop = (46 + 4 - 7.9 + customerRows.length * 5) * pxPerMm;
  const tableHeaderHeight = 10 * pxPerMm;
  const bodyContentBottom = (272 - (hasInvoiceNoticeBlocks ? 42 : 22)) * pxPerMm;
  const standardLineHeight = 2.55 * pxPerMm;
  const standardMaxRowHeight = (hasInvoiceNoticeBlocks ? 28 : 34) * pxPerMm;
  const tableColumnWidths = [10, 77, 55, 40].map((width) => width * pxPerMm);
  const tableWidth = tableColumnWidths.reduce((sum, width) => sum + width, 0);
  const visibleItems = items.slice(0, 4);
  const estimateRows = (value: string, charactersPerLine: number) =>
    Math.max(
      1,
      value
        .trim()
        .split(/\r?\n/)
        .reduce((lineCount, line) => lineCount + Math.max(1, Math.ceil((line || ' ').length / charactersPerLine)), 0)
    );
  const rowHeights = visibleItems.map((item) => {
    const descriptionLines =
      (item.productName ? estimateRows(item.productName, 34) : 0) +
      (item.description ? Math.min(estimateRows(item.description, 34), MAX_DESCRIPTION_LINES) : 0);
    const remarksLines = estimateRows(item.remarks || item.productName || 'Remarks', 28);
    const imageHeight = item.showPicture && getPictureSource(item.picture) ? 14 * pxPerMm : 0;
    const contentHeight = Math.max(
      Math.max(descriptionLines, 1) * standardLineHeight,
      Math.max(remarksLines, 1) * standardLineHeight + imageHeight + (imageHeight ? 2 * pxPerMm : 0)
    );

    return Math.min(standardMaxRowHeight, Math.max(24 * pxPerMm, contentHeight + 3 * pxPerMm));
  });
  const rowsHeight = rowHeights.reduce((height, rowHeight) => height + rowHeight, 0);
  const totalBoxHeight = (isTaxDocument ? 28 : 18) * pxPerMm;
  const totalBoxTop = Math.min(
    tableTop + tableHeaderHeight + rowsHeight + 4 * pxPerMm,
    bodyContentBottom - totalBoxHeight
  );
  const bodyBorderHeight = isBillDocument ? 902 : 914;

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
        className="absolute right-[57px] top-[87px] w-[390px] text-right"
        style={{
          fontFamily: '"Arial Narrow", Arial, Helvetica, sans-serif',
          fontStretch: 'condensed',
        }}
      >
        <div className="text-[21px] font-black uppercase leading-none text-slate-950">
          {activeDocument.pdfTitle}: {form.invoiceNo || '---'}
        </div>
        <div className="mt-[3px] text-[16px] font-black leading-none text-slate-950">
          Date: {form.date || '--/--/----'}
        </div>
        {activeDocumentType === 'bill' ? null : (
          <div className="mt-[5px] w-full space-y-[4px]">
            <div className="text-[16px] font-black italic leading-none text-slate-950">
              {activeDocument.purchaseLabel}: {form.purchaseOrder || '____________'}
            </div>
            <div className="text-[16px] font-black italic leading-none text-slate-950">
              {activeDocument.referenceLabel}: {form.quotationNo || '____________'}
            </div>
          </div>
        )}
      </div>

      <DocumentBodyBorder
        className="left-[42px] top-[140px] z-10 w-[710px]"
        style={{ height: bodyBorderHeight }}
      />
      <div className="pointer-events-none absolute left-[166px] top-[544px] opacity-[0.08]">
        <Image src={CLASSIC_LOGO_SRC} alt="" width={500} height={200} className="h-auto w-[461px]" />
      </div>

      <div className="absolute left-[60px] top-[159px] flex max-w-[430px] flex-col text-[12px] leading-[19px] text-slate-900">
        {customerRows.map(([label, value], index) => (
          <div key={`${label || 'customer'}-${index}`} className="truncate">
            {label ? `${label} ${value || '________________'}` : value || '________________'}
          </div>
        ))}
      </div>

      <div
        className="absolute overflow-hidden border border-slate-950 bg-white text-slate-950"
        style={{ left: contentLeft, top: tableTop, width: tableWidth }}
      >
        <div
          className="grid border-b border-slate-950 text-center text-[13px] font-bold leading-none"
          style={{
            gridTemplateColumns: `${tableColumnWidths[0]}px ${tableColumnWidths[1]}px ${tableColumnWidths[2]}px ${tableColumnWidths[3]}px`,
            height: tableHeaderHeight,
          }}
        >
          {['Sr', 'Description', 'Remarks', 'Price'].map((header, index) => (
            <div key={header} className={`flex items-center justify-center ${index < 3 ? 'border-r border-slate-950' : ''}`}>
              {header}
            </div>
          ))}
        </div>

        {visibleItems.map((item, index) => {
          const itemTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
          const imageSource = getPictureSource(item.picture);
          const rowHeight = rowHeights[index];

          return (
            <div
              key={item.id}
              className="grid overflow-hidden border-b border-slate-950 last:border-b-0"
              style={{
                gridTemplateColumns: `${tableColumnWidths[0]}px ${tableColumnWidths[1]}px ${tableColumnWidths[2]}px ${tableColumnWidths[3]}px`,
                height: rowHeight,
              }}
            >
              <div className="flex items-center justify-center border-r border-slate-950 text-[13px]">
                {index + 1}
              </div>
              <div className="overflow-hidden border-r border-slate-950 px-2 py-[7px] text-[10px] leading-[10px]">
                {item.productName ? <div className="font-bold text-slate-950">{item.productName}</div> : null}
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
                  'Item description'
                ) : null}
              </div>
              <div className="overflow-hidden border-r border-slate-950 px-2 py-[7px] text-[10px] leading-[10px]">
                <div className="whitespace-pre-wrap">{item.remarks || item.productName || 'Remarks'}</div>
                {item.showPicture && imageSource ? (
                  <div className="mt-2 h-[42px] overflow-hidden bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageSource}
                      alt={item.productName || item.description || 'Invoice item'}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : null}
              </div>
              <div className="grid grid-rows-4 overflow-hidden text-[12px] leading-none">
                {[
                  ['UOM', item.uom || '--', false],
                  ['Price', formatCurrency(item.unitPrice || 0), false],
                  ['QTY', String(item.quantity || 0), false],
                  ['Total', formatCurrency(itemTotal), true],
                ].map(([label, value, isTotal]) => (
                  <div key={String(label)} className="grid grid-cols-[49px_1fr] border-b border-slate-950 last:border-b-0">
                    <div className={`flex items-center border-r border-slate-950 px-1 ${isTotal ? 'font-bold' : ''}`}>
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

      <div className="absolute left-[60px]" style={{ top: totalBoxTop + 20 }}>
        <div className="text-[20px] italic leading-none text-cyan-700">{signatureName}</div>
        <div className="mt-[6px] w-[121px] border-t border-slate-300 pt-[4px] text-[13px] font-bold text-slate-950">
          {signatureLabel}
        </div>
      </div>

      <div
        className="absolute rounded-[11px] border border-slate-950 bg-white px-[15px] py-[10px] text-right"
        style={{ left: contentRight - 56 * pxPerMm, top: totalBoxTop, width: 56 * pxPerMm, height: totalBoxHeight }}
      >
        {isTaxDocument ? (
          <div className="space-y-[7px] text-[12px] font-bold text-slate-600">
            <div className="flex justify-between gap-3">
              <span>SUB TOTAL</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>GST 18%</span>
              <span>{formatCurrency(salesTaxAmount)}</span>
            </div>
            <div className="border-t border-slate-300 pt-[7px] text-slate-950">
              <div className="flex justify-between gap-3">
                <span>GRAND TOTAL</span>
                <span>{formatCurrency(grandTotalWithTax)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-between gap-3 text-[12px] font-bold text-slate-950">
            <span>TOTAL</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        )}
      </div>

      {showInvoiceTaxNotice ? (
        <div
          className="absolute z-20 border border-black bg-yellow-200 px-2 text-center text-[12px] font-bold uppercase leading-[30px] text-red-600"
          style={{
            left: contentLeft,
            top: (showInvoiceTerms ? 233.9 : 248.7) * pxPerMm,
            width: contentRight - contentLeft,
            height: 8 * pxPerMm,
          }}
        >
          {invoiceTaxNotice}
        </div>
      ) : null}
      {showInvoiceTerms ? (
        <div
          className="absolute z-20 border border-dashed border-emerald-700 bg-white px-2 text-center leading-none"
          style={{ left: contentLeft, top: 242.7 * pxPerMm, width: contentRight - contentLeft, height: 14 * pxPerMm }}
        >
          <div className="pt-[8px] text-[10px] font-bold">{invoiceTermsTitle}</div>
          <div className="mt-[4px] truncate text-[9px]">{invoiceTermsLine1}</div>
          <div className="mt-[4px] truncate text-[10px] font-bold">{invoiceTermsLine2}</div>
        </div>
      ) : null}
      <div className="absolute left-0 right-0 top-[990px] z-20 text-center text-[14px] font-black italic leading-none text-violet-700 drop-shadow-[1px_1px_1px_rgba(15,23,42,0.22)]">
        {form.thankYouNote || 'THANK YOU FOR YOUR BUSINESS!'}
      </div>
      <div className="absolute left-0 right-0 top-[1013px] z-20 text-center text-[14px] font-bold leading-none text-black">
        <span className={isBillDocument ? '' : 'bg-white px-2'}>
          {form.subtitle || 'A wide range of industrial instrument & sensing solutions'}
        </span>
      </div>
      <DocumentFooter form={form} className="absolute bottom-[10px] left-0 right-0" />
    </div>
  );
};
