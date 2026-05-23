import { CLASSIC_LOGO_SRC } from '@/lib/brandAssets';
import type { DocumentType, InvoiceForm, InvoiceItem } from './types';
import {
  SALES_TAX_RATE,
  buildSalesPdfFileName,
  createInvoiceItem,
  formatClassicPhoneDisplay,
  formatCurrency,
  getCustomerDetailRows,
  getFrontendAssetUrl,
  getPictureSource,
  loadImageAsPngDataUrl,
} from './utils';

type ActiveDocument = {
  fileSlug: string;
  pdfTitle: string;
  purchaseLabel: string;
  referenceLabel: string;
};

type DownloadInvoicePdfParams = {
  activeDocumentType: DocumentType;
  activeDocument: ActiveDocument;
  form: InvoiceForm;
  items: InvoiceItem[];
  totalAmount: number;
};

export const downloadInvoicePdf = async ({
  activeDocumentType,
  activeDocument,
  form,
  items,
  totalAmount,
}: DownloadInvoicePdfParams) => {

      const { GState, jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const logoUrl = getFrontendAssetUrl(CLASSIC_LOGO_SRC);
        const logoDataUrl = await loadImageAsPngDataUrl(logoUrl);
        const globeDataUrl = await loadImageAsPngDataUrl(getFrontendAssetUrl('/quotation-globe.png'));
        const whatsappDataUrl = await loadImageAsPngDataUrl(getFrontendAssetUrl('/quotation-whatsapp.png'));
        const includeTax = activeDocumentType === 'invoice';
        const salesTaxAmount = totalAmount * SALES_TAX_RATE;
        const grandTotalWithTax = includeTax ? totalAmount + salesTaxAmount : totalAmount;
        const classicPurple: [number, number, number] = [109, 40, 217];
        const footerFontSize = 9;

        const drawBodyThankYou = (x: number, y: number, align: 'left' | 'center' | 'right' = 'right') => {
          const text = form.thankYouNote || 'THANK YOU FOR YOUR BUSINESS!';
          pdf.setFont('helvetica', 'bolditalic');
          pdf.setFontSize(10.5);
          pdf.setTextColor(...classicPurple);
          pdf.text(text, x, y, { align });
          pdf.setTextColor(0, 0, 0);
        };

        const drawBodySubtitle = (y: number) => {
          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10.5);
          pdf.text(
            form.subtitle || 'A wide range of industrial instrument & sensing solutions',
            105,
            y,
            { align: 'center' }
          );
        };

        const fitPdfText = (value: string, width: number) => {
          let text = value;
          while (pdf.getTextWidth(text) > width && text.length > 1) {
            text = text.slice(0, -1);
          }
          return text;
        };

        const drawCustomerRows = (
          rows: Array<[string, string]>,
          x: number,
          y: number,
          labelWidth: number,
          valueWidth: number,
          lineHeight = 5
        ) => {
          rows.forEach(([label, value], index) => {
            const rowY = y + index * lineHeight;
            pdf.setFont('helvetica', 'bold');
            pdf.text(label, x, rowY);
            pdf.setFont('helvetica', 'normal');
            pdf.text(fitPdfText(value || '________________', valueWidth), x + labelWidth, rowY);
          });
        };

        const drawClassicFooter = () => {
          const footerAddress = form.address || '133G St # 109 Sector G 11/3, Islamabad';
          const footerAddressLines = footerAddress.toLowerCase().includes('islamabad')
            ? [footerAddress.replace(/,?\s*islamabad/i, '').trim(), 'Islamabad']
            : pdf.splitTextToSize(footerAddress, 56).slice(0, 2);

          if (globeDataUrl) pdf.addImage(globeDataUrl, 'PNG', 5.8, 275.2, 15.6, 15.6, undefined, 'FAST');
          if (whatsappDataUrl) pdf.addImage(whatsappDataUrl, 'PNG', 151, 276.4, 13.2, 13.2, undefined, 'FAST');

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(footerFontSize);
          pdf.text(form.website || 'www.classicelectronics.com.pk', 47.2, 281.4, { align: 'center' });
          pdf.setFont('helvetica', 'normal');
          pdf.text(footerAddressLines, 47.2, 286, { align: 'center' });

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(footerFontSize);
          pdf.text('NTN: 1700506', 106.3, 279.2, { align: 'center' });
          pdf.text('GST: 05-07-8500-014-73', 106.3, 283.6, { align: 'center' });
          pdf.setFont('helvetica', 'normal');
          pdf.text(form.email || 'sales@classicelectronics.com.pk', 106.3, 288, { align: 'center' });

          pdf.setDrawColor(37, 99, 235);
          pdf.setLineWidth(0.35);
          pdf.circle(78, 285.2, 4);
          pdf.roundedRect(75.5, 284.1, 5, 3.3, 0.5, 0.5);
          pdf.line(75.5, 284.1, 78, 285.95);
          pdf.line(80.5, 284.1, 78, 285.95);
          pdf.line(75.5, 287.4, 77.35, 285.75);
          pdf.line(80.5, 287.4, 78.65, 285.75);

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(footerFontSize);
          pdf.text(formatClassicPhoneDisplay(form.phonePrimary, '+923 111 777 510'), 180, 282, {
            align: 'center',
          });
          pdf.text(formatClassicPhoneDisplay(form.phoneSecondary, '+923 215 180 308'), 180, 286.6, {
            align: 'center',
          });
        };

      if (activeDocumentType === 'quotation') {
        const purple = classicPurple;
        const formatPdfRs = (amount: number) => formatCurrency(amount);
        const quotationItems = items.length > 0 ? items : [createInvoiceItem()];
        const taxAmount = totalAmount * SALES_TAX_RATE;
        const grandTotal = totalAmount + taxAmount;
        const tableX = 15;
        const tableY = 88;
        const tableWidth = 180;
        const headerHeight = 13;
        const minimumRowHeight = 20;
        const srWidth = 10;
        const descriptionWidth = 83;
        const remarksWidth = 55;
        const priceLabelWidth = 12;
        const priceValueWidth = tableWidth - srWidth - descriptionWidth - remarksWidth - priceLabelWidth;
        const splitPdfCellText = (value: string, width: number, fontSize = 8) => {
          const previousFontSize = pdf.getFontSize();
          pdf.setFontSize(fontSize);
          const lines = pdf.splitTextToSize(value.replace(/(\S{12})/g, '$1 '), width) as string[];
          pdf.setFontSize(previousFontSize);

          return lines;
        };
        const fitPdfText = (value: string, width: number) => {
          const text = value || '';
          if (pdf.getTextWidth(text) <= width) return text;

          let fittedText = text;
          while (fittedText.length > 1 && pdf.getTextWidth(`${fittedText}...`) > width) {
            fittedText = fittedText.slice(0, -1);
          }

          return `${fittedText}...`;
        };
        const fitPdfLines = (lines: string[], maxLines: number, width: number) => {
          if (lines.length <= maxLines) return lines;

          const fittedLines = lines.slice(0, Math.max(1, maxLines));
          const lastIndex = fittedLines.length - 1;
          fittedLines[lastIndex] = fitPdfText(`${fittedLines[lastIndex]}...`, width);

          return fittedLines;
        };
        const stampDataUrl = await loadImageAsPngDataUrl(
          getFrontendAssetUrl('/quotation-stamp-signature.png'),
          { transparentWhite: true }
        );
        const quotationImageDataUrls = await Promise.all(
          quotationItems.map((item) => {
            if (!item.showPicture) return Promise.resolve(null);
            const imageUrl = getPictureSource(item.picture);
            return imageUrl ? loadImageAsPngDataUrl(imageUrl) : Promise.resolve(null);
          })
        );

        const contentBottomY = 250;
        const detailsBlockHeight = 92;
        const quotationNoteGap = 8;
        const maxQuotationRowHeight =
          contentBottomY - detailsBlockHeight - tableY - headerHeight - quotationNoteGap - 8;

        const quotationRowHeights = quotationItems.map((item, index) => {
          const descriptionLines = splitPdfCellText(
            item.description || item.productName || '',
            descriptionWidth - 4,
            8
          );
          const remarksLines = splitPdfCellText(
            item.remarks || item.productName || '',
            remarksWidth - 5,
            7.5
          );
          const descriptionHeight = Math.max(descriptionLines.length, 1) * 4.3 + 10;
          const remarksTextHeight = Math.max(remarksLines.length, 1) * 4.3;
          const imageHeight = quotationImageDataUrls[index] ? 20 : 0;
          const remarksHeight = remarksTextHeight + imageHeight + (imageHeight ? 7 : 6);

          return Math.min(
            maxQuotationRowHeight,
            Math.max(minimumRowHeight, descriptionHeight, remarksHeight)
          );
        });
        const descriptionX = tableX + srWidth;
        const remarksX = descriptionX + descriptionWidth;
        const priceX = remarksX + remarksWidth;
        const priceValueX = priceX + priceLabelWidth;
        const drawQuotationShell = () => {
          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, pageWidth, pageHeight, 'F');

          if (logoDataUrl) {
            pdf.addImage(logoDataUrl, 'PNG', 9.3, 5, 79, 30, undefined, 'FAST');
            pdf.setGState(new GState({ opacity: 0.18, 'stroke-opacity': 0.18 }));
            pdf.addImage(logoDataUrl, 'PNG', 47, 116, 118, 45, undefined, 'FAST');
            pdf.setGState(new GState({ opacity: 1, 'stroke-opacity': 1 }));
          }

          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(16);
          pdf.text(`QUOTATION: ${form.invoiceNo || '---'}`, 195, 28, { align: 'right' });
          pdf.setFontSize(12);
          pdf.text(`Date: ${form.date || '--/--/----'}`, 195, 33, { align: 'right' });
          pdf.setFont('helvetica', 'bolditalic');
          pdf.setFontSize(12);
          pdf.text(`Indent No: ${form.purchaseOrder || '____________'}`, 195, 38, { align: 'right' });
          pdf.text(`Enquiry No: ${form.quotationNo || '____________'}`, 195, 43, { align: 'right' });

          pdf.setDrawColor(...purple);
          pdf.setLineWidth(1.05);
          pdf.setLineJoin('round');
          pdf.setLineCap('round');

          const quotationMargin = 11;
          const quotationTabTopY = 37;
          const quotationTopY = 46;
          const quotationBottomY = 272;
          const quotationTabWidth = 68;
          const quotationRadius = 8;
          const quotationTabEndX = quotationMargin + quotationTabWidth;

          pdf.moveTo(quotationMargin + quotationRadius, quotationTabTopY);
          pdf.lineTo(quotationTabEndX - quotationRadius, quotationTabTopY);
          pdf.curveTo(
            quotationTabEndX - 2,
            quotationTabTopY,
            quotationTabEndX + 2,
            quotationTopY - 2,
            quotationTabEndX + quotationRadius,
            quotationTopY
          );
          pdf.lineTo(pageWidth - quotationMargin - quotationRadius, quotationTopY);
          pdf.curveTo(
            pageWidth - quotationMargin + 0.5,
            quotationTopY,
            pageWidth - quotationMargin + 0.5,
            quotationTopY,
            pageWidth - quotationMargin,
            quotationTopY + quotationRadius
          );
          pdf.lineTo(pageWidth - quotationMargin, quotationBottomY - quotationRadius);
          pdf.curveTo(
            pageWidth - quotationMargin,
            quotationBottomY + 0.5,
            pageWidth - quotationMargin,
            quotationBottomY + 0.5,
            pageWidth - quotationMargin - quotationRadius,
            quotationBottomY
          );
          pdf.lineTo(quotationMargin + quotationRadius, quotationBottomY);
          pdf.curveTo(
            quotationMargin - 0.5,
            quotationBottomY,
            quotationMargin - 0.5,
            quotationBottomY,
            quotationMargin,
            quotationBottomY - quotationRadius
          );
          pdf.lineTo(quotationMargin, quotationTabTopY + quotationRadius);
          pdf.curveTo(
            quotationMargin,
            quotationTabTopY - 0.5,
            quotationMargin,
            quotationTabTopY - 0.5,
            quotationMargin + quotationRadius,
            quotationTabTopY
          );
          pdf.stroke();

          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(8.3);
          drawCustomerRows(getCustomerDetailRows(form), 15, 50, 30, 85, 4);
          pdf.setFont('helvetica', 'bolditalic');
          pdf.setFontSize(9.75);
          pdf.text('Reference to your quotation the details is as below.', 15, 80);

          drawClassicFooter();
        };

        const drawQuotationTableHeader = (startY: number) => {
          pdf.setDrawColor(0, 0, 0);
          pdf.setLineWidth(0.62);
          pdf.rect(tableX, startY, tableWidth, headerHeight);
          pdf.line(descriptionX, startY, descriptionX, startY + headerHeight);
          pdf.line(remarksX, startY, remarksX, startY + headerHeight);
          pdf.line(priceX, startY, priceX, startY + headerHeight);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7.6);
          pdf.setTextColor(0, 0, 0);
          pdf.text('Sr', tableX + 5, startY + 8.4, { align: 'center' });
          pdf.text('DESCRIPTION', descriptionX + descriptionWidth / 2, startY + 8.4, { align: 'center' });
          pdf.text('Remarks', remarksX + remarksWidth / 2, startY + 8.4, { align: 'center' });
          pdf.text('Price', priceX + (priceLabelWidth + priceValueWidth) / 2, startY + 8.4, { align: 'center' });

          return startY + headerHeight;
        };

        const drawQuotationRow = (item: InvoiceItem, index: number, rowY: number, rowHeight: number) => {
          const itemTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
          const itemImage = quotationImageDataUrls[index];

          pdf.setDrawColor(0, 0, 0);
          pdf.setLineWidth(0.62);
          pdf.rect(tableX, rowY, tableWidth, rowHeight);
          pdf.line(descriptionX, rowY, descriptionX, rowY + rowHeight);
          pdf.line(remarksX, rowY, remarksX, rowY + rowHeight);
          pdf.line(priceX, rowY, priceX, rowY + rowHeight);
          pdf.line(priceValueX, rowY, priceValueX, rowY + rowHeight);
          for (let priceRowIndex = 1; priceRowIndex < 4; priceRowIndex += 1) {
            const priceRowY = rowY + (rowHeight / 4) * priceRowIndex;
            pdf.line(priceX, priceRowY, tableX + tableWidth, priceRowY);
          }

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.text(String(index + 1), tableX + 5, rowY + rowHeight / 2 + 2, { align: 'center' });
          pdf.text(
            fitPdfLines(
              splitPdfCellText(item.description || item.productName || '', descriptionWidth - 4, 8),
              Math.max(1, Math.floor((rowHeight - 9) / 4.3)),
              descriptionWidth - 4
            ),
            descriptionX + 2,
            rowY + 6
          );
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(8.5);
          const priceRows: Array<[string, string, boolean]> = [
            ['UOM', item.uom || 'NOS', false],
            ['Price', formatPdfRs(item.unitPrice || 0), false],
            ['QTY', String(item.quantity || 0), false],
            ['Total', formatPdfRs(itemTotal), true],
          ];
          priceRows.forEach(([label, value, isTotal], priceRowIndex) => {
            const priceTextY = rowY + (rowHeight / 4) * priceRowIndex + rowHeight / 8 + 1.5;
            pdf.setFont('helvetica', isTotal ? 'bolditalic' : 'italic');
            pdf.text(label, priceX + 1.2, priceTextY);
            pdf.text(fitPdfText(value, priceValueWidth - 2), priceValueX + priceValueWidth / 2, priceTextY, {
              align: 'center',
            });
          });
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7.5);
          const rawRemarksLines = splitPdfCellText(
            item.remarks || item.productName || '',
            remarksWidth - 5,
            7.5
          );
          const imageReservedHeight = itemImage ? 25 : 0;
          const remarksLines = fitPdfLines(
            rawRemarksLines,
            Math.max(1, Math.floor((rowHeight - imageReservedHeight - 7) / 4.3)),
            remarksWidth - 5
          );
          pdf.text(remarksLines, remarksX + 2, rowY + 5.5);
          if (itemImage) {
            const imageWidth = Math.min(30, remarksWidth - 12);
            const imageHeight = Math.min(20, Math.max(rowHeight - 16, 10));
            const imageX = remarksX + (remarksWidth - imageWidth) / 2;
            const textHeight = Math.max(remarksLines.length, 1) * 4.3;
            const imageY = Math.min(rowY + 5 + textHeight, rowY + rowHeight - imageHeight - 1.5);
            pdf.addImage(itemImage, 'PNG', imageX, imageY, imageWidth, imageHeight, undefined, 'FAST');
          }
        };

        const drawQuotationTotals = (detailsY: number) => {
          pdf.setFont('helvetica', 'bolditalic');
          pdf.setFontSize(9);
          pdf.setTextColor(0, 0, 0);
          pdf.text('Delivery Period :', 15, detailsY);
          pdf.text('Validity Date:', 15, detailsY + 8);
          pdf.setFont('helvetica', 'italic');
          pdf.rect(58, detailsY - 5, 43, 7);
          pdf.text(form.deliveryPeriod || '4 Weeks', 79.5, detailsY, { align: 'center' });
          pdf.rect(58, detailsY + 3, 43, 7);
          pdf.text(form.validityDate || '1 WEEK', 79.5, detailsY + 8, { align: 'center' });

          const totalsX = 140;
          const totalsValueX = 165;
          const totalsBoxWidth = 31;
          [
            ['Sub Total', formatPdfRs(totalAmount), detailsY - 5],
            ['Tax 18%', formatPdfRs(taxAmount), detailsY + 3],
            ['Total', formatPdfRs(grandTotal), detailsY + 11],
          ].forEach(([label, value, y]) => {
          pdf.setFont('helvetica', 'bolditalic');
          pdf.text(String(label), totalsX - 15, Number(y) + 5);
          pdf.setFont('helvetica', 'italic');
          pdf.rect(totalsValueX, Number(y), totalsBoxWidth, 7);
          pdf.text(String(value), totalsValueX + totalsBoxWidth / 2, Number(y) + 5, {
            align: 'center',
          });
          });

          if (stampDataUrl) {
            pdf.addImage(stampDataUrl, 'PNG', 21, detailsY + 18, 45, 27, undefined, 'FAST');
          }

          drawBodyThankYou(105, 262, 'center');
          drawBodySubtitle(268);
        };

        drawQuotationShell();
        let rowY = drawQuotationTableHeader(tableY);

        quotationItems.forEach((item, index) => {
          const rowHeight = quotationRowHeights[index];
          const isLastRow = index === quotationItems.length - 1;
          const requiredBottom = isLastRow ? contentBottomY - detailsBlockHeight : contentBottomY;

          if (rowY + rowHeight > requiredBottom && rowY > tableY + headerHeight) {
            pdf.addPage();
            drawQuotationShell();
            rowY = drawQuotationTableHeader(tableY);
          }

          drawQuotationRow(item, index, rowY, rowHeight);
          rowY += rowHeight;
        });

        let afterTableY = Math.min(rowY + quotationNoteGap, contentBottomY - detailsBlockHeight);

        if (afterTableY + detailsBlockHeight > contentBottomY) {
          pdf.addPage();
          drawQuotationShell();
          rowY = drawQuotationTableHeader(tableY);
          afterTableY = rowY + 5;
        }

        pdf.setFont('helvetica', 'bolditalic');
        pdf.setFontSize(9.75);
        pdf.setTextColor(0, 0, 0);
        pdf.text('If you have any questions concerning this quotation please tell us.', 18, afterTableY);
        drawQuotationTotals(afterTableY + 10);

        pdf.save(buildSalesPdfFileName(activeDocumentType, form));
        return;
      }

      if (activeDocumentType === 'deliveryChallan') {
        const drawDeliveryChallan = () => {
          const margin = 11;
          const innerPadding = 4;
          const contentLeftX = margin + innerPadding;
          const contentRightX = pageWidth - margin - innerPadding;
          const tableX = contentLeftX;
          const tableY = 98;
          const tableWidth = contentRightX - contentLeftX;
          const headerHeight = 10;
          const rowHeight = 28;
          const visibleRows = Math.max(items.length, 1);
          const tableHeight = headerHeight + rowHeight * visibleRows;
          const columns = [18, 87, 43, 34];
          const borderColor: [number, number, number] = [15, 23, 42];
          const customerRows = getCustomerDetailRows(form);
          const drawDeliveryOutline = () => {
            const tabEndX = margin + 68;
            const tabTopY = 37;
            const outerBorderTopY = 46;
            const outerBorderBottomY = 272;
            const borderRadius = 8;

            pdf.setDrawColor(...classicPurple);
            pdf.setLineWidth(1.05);
            pdf.setLineJoin('round');
            pdf.setLineCap('round');
            pdf.moveTo(margin + borderRadius, tabTopY);
            pdf.lineTo(tabEndX - borderRadius, tabTopY);
            pdf.curveTo(tabEndX - 2, tabTopY, tabEndX + 2, outerBorderTopY - 2, tabEndX + borderRadius, outerBorderTopY);
            pdf.lineTo(pageWidth - margin - borderRadius, outerBorderTopY);
            pdf.curveTo(pageWidth - margin + 0.5, outerBorderTopY, pageWidth - margin + 0.5, outerBorderTopY, pageWidth - margin, outerBorderTopY + borderRadius);
            pdf.lineTo(pageWidth - margin, outerBorderBottomY - borderRadius);
            pdf.curveTo(pageWidth - margin, outerBorderBottomY + 0.5, pageWidth - margin, outerBorderBottomY + 0.5, pageWidth - margin - borderRadius, outerBorderBottomY);
            pdf.lineTo(margin + borderRadius, outerBorderBottomY);
            pdf.curveTo(margin - 0.5, outerBorderBottomY, margin - 0.5, outerBorderBottomY, margin, outerBorderBottomY - borderRadius);
            pdf.lineTo(margin, tabTopY + borderRadius);
            pdf.curveTo(margin, tabTopY - 0.5, margin, tabTopY - 0.5, margin + borderRadius, tabTopY);
            pdf.stroke();
          };

          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, pageWidth, pageHeight, 'F');
          drawDeliveryOutline();
          drawClassicFooter();

          if (logoDataUrl) {
            pdf.addImage(logoDataUrl, 'PNG', contentLeftX, 5, 79, 30, undefined, 'FAST');
            pdf.setGState(new GState({ opacity: 0.08, 'stroke-opacity': 0.08 }));
            pdf.addImage(logoDataUrl, 'PNG', 45, 126, 120, 46, undefined, 'FAST');
            pdf.setGState(new GState({ opacity: 1, 'stroke-opacity': 1 }));
          }

          pdf.setTextColor(15, 23, 42);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(16);
          pdf.text(`DELIVERY CHALLAN: ${form.invoiceNo || '---'}`, contentRightX, 28, { align: 'right' });
          pdf.setFontSize(12);
          pdf.text(`Date: ${form.date || '--/--/----'}`, contentRightX, 33, { align: 'right' });
          pdf.setFont('helvetica', 'bolditalic');
          pdf.text(`Purchase Order: ${form.purchaseOrder || '____________'}`, contentRightX, 38, {
            align: 'right',
          });
          pdf.text(`Quotation No: ${form.quotationNo || '____________'}`, contentRightX, 43, {
            align: 'right',
          });

          pdf.setTextColor(15, 23, 42);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9.3);
          drawCustomerRows(customerRows, contentLeftX + 1, 58, 32, 92, 5);

          pdf.setDrawColor(...borderColor);
          pdf.setLineWidth(0.5);
          pdf.roundedRect(tableX, tableY, tableWidth, tableHeight, 5, 5, 'S');
          let columnX = tableX;
          columns.slice(0, -1).forEach((width) => {
            columnX += width;
            pdf.line(columnX, tableY, columnX, tableY + tableHeight);
          });
          pdf.line(tableX, tableY + headerHeight, tableX + tableWidth, tableY + headerHeight);
          for (let rowIndex = 1; rowIndex < visibleRows; rowIndex += 1) {
            const rowLineY = tableY + headerHeight + rowHeight * rowIndex;
            pdf.line(tableX, rowLineY, tableX + tableWidth, rowLineY);
          }

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9.5);
          pdf.text('S.No', tableX + columns[0] / 2, tableY + 6.4, { align: 'center' });
          pdf.text('Particulars', tableX + columns[0] + columns[1] / 2, tableY + 6.4, { align: 'center' });
          pdf.text('Remarks', tableX + columns[0] + columns[1] + columns[2] / 2, tableY + 6.4, { align: 'center' });
          pdf.text('Details', tableX + columns[0] + columns[1] + columns[2] + columns[3] / 2, tableY + 6.4, { align: 'center' });

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9.5);

          items.forEach((item, index) => {
            const rowTop = tableY + headerHeight + index * rowHeight;
            const detailsX = tableX + columns[0] + columns[1] + columns[2];
            const detailsLabelWidth = 12;

            pdf.text(String(index + 1), tableX + columns[0] / 2, rowTop + rowHeight / 2 + 2, { align: 'center' });
            pdf.text(
              pdf.splitTextToSize(item.remarks || '', columns[2] - 4),
              tableX + columns[0] + columns[1] + 2,
              rowTop + 7
            );
            pdf.text(
              pdf.splitTextToSize(item.description || item.productName || 'Item particulars', columns[1] - 5),
              tableX + columns[0] + 2,
              rowTop + 7
            );
            pdf.line(detailsX + detailsLabelWidth, rowTop, detailsX + detailsLabelWidth, rowTop + rowHeight);
            pdf.line(detailsX, rowTop + rowHeight / 2, detailsX + columns[3], rowTop + rowHeight / 2);
            pdf.setFont('helvetica', 'bold');
            pdf.text('UOM', detailsX + 1.2, rowTop + 8.8);
            pdf.text('QTY', detailsX + 1.2, rowTop + rowHeight / 2 + 8.8);
            pdf.setFont('helvetica', 'normal');
            pdf.text(item.uom || 'PCS', detailsX + detailsLabelWidth + (columns[3] - detailsLabelWidth) / 2, rowTop + 8.8, {
              align: 'center',
            });
            pdf.text(String(item.quantity || ''), detailsX + detailsLabelWidth + (columns[3] - detailsLabelWidth) / 2, rowTop + rowHeight / 2 + 8.8, {
              align: 'center',
            });
          });

          const signatureY = Math.min(tableY + tableHeight + 16, 198);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10.5);
          pdf.text('From Classic Electronics', contentLeftX + 1, signatureY);
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(15);
          pdf.setTextColor(14, 116, 144);
          pdf.text(form.directorName || 'M Fawad Younas', contentLeftX + 1, signatureY + 25.7);
          pdf.setDrawColor(203, 213, 225);
          pdf.setLineWidth(0.35);
          pdf.line(contentLeftX + 1, signatureY + 28.2, contentLeftX + 33, signatureY + 28.2);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9.5);
          pdf.setTextColor(15, 23, 42);
          pdf.text('Director', contentLeftX + 1, signatureY + 34.9);
          drawBodyThankYou(105, 262, 'center');
          drawBodySubtitle(268);
        };

        drawDeliveryChallan();
        pdf.save(buildSalesPdfFileName(activeDocumentType, form));
        return;
      }

      const margin = 11;
      const innerPadding = 4;
      const contentLeftX = margin + innerPadding;
      const contentRightX = pageWidth - margin - innerPadding;
      const tableColumnWidths = [10, 77, 55, 40];
      const tableHeaders = ['Sr', 'Description', 'Remarks', 'Price'];
      const primaryTextColor: [number, number, number] = [15, 23, 42];
      const mutedTextColor: [number, number, number] = [71, 85, 105];
      const accentColor: [number, number, number] = [109, 40, 217];
      const borderColor: [number, number, number] = [15, 23, 42];
      const lightBorderColor: [number, number, number] = [203, 213, 225];
      const outerBorderTopY = 46;
      const outerBorderBottomY = 272;
      const hasInvoiceNoticeBlocks =
        activeDocumentType === 'invoice' &&
        (form.showQuotationTaxNotice !== false || form.showQuotationTerms !== false);
      const bodyContentBottomY = outerBorderBottomY - (hasInvoiceNoticeBlocks ? 75 : 22);
      const tabTopY = 37;
      const tabWidth = 68;
      const borderRadius = 8;
      const footerBoxY = 261.2;

      const itemImageDataUrls = await Promise.all(
        items.map((item) => {
          if (!item.showPicture) return Promise.resolve(null);
          const imageUrl = getPictureSource(item.picture);
          return imageUrl ? loadImageAsPngDataUrl(imageUrl) : Promise.resolve(null);
        })
      );

      const fitTableLines = (lines: string[], maxLines: number, width: number) => {
        if (lines.length <= maxLines) return lines;

        const fittedLines = lines.slice(0, Math.max(1, maxLines));
        const lastIndex = fittedLines.length - 1;
        fittedLines[lastIndex] = fitPdfText(`${fittedLines[lastIndex]}...`, width);

        return fittedLines;
      };

      const drawTableHeader = (startY: number) => {
        let startX = contentLeftX;

        pdf.setDrawColor(...borderColor);
        pdf.setLineWidth(0.5);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9.5);
        pdf.setTextColor(...primaryTextColor);

        tableHeaders.forEach((header, index) => {
          const cellWidth = tableColumnWidths[index];
          pdf.rect(startX, startY, cellWidth, 10);
          pdf.text(header, startX + cellWidth / 2, startY + 6.2, {
            align: 'center',
            baseline: 'middle',
          });
          startX += cellWidth;
        });

        return startY + 10;
      };

      const drawInvoiceOutline = () => {
        const tabEndX = margin + tabWidth;

        pdf.setDrawColor(...accentColor);
        pdf.setLineWidth(1.05);
        pdf.setLineJoin('round');
        pdf.setLineCap('round');

        pdf.moveTo(margin + borderRadius, tabTopY);
        pdf.lineTo(tabEndX - borderRadius, tabTopY);
        pdf.curveTo(
          tabEndX - 2,
          tabTopY,
          tabEndX + 2,
          outerBorderTopY - 2,
          tabEndX + borderRadius,
          outerBorderTopY
        );
        pdf.lineTo(pageWidth - margin - borderRadius, outerBorderTopY);
        pdf.curveTo(
          pageWidth - margin + 0.5,
          outerBorderTopY,
          pageWidth - margin + 0.5,
          outerBorderTopY,
          pageWidth - margin,
          outerBorderTopY + borderRadius
        );
        pdf.lineTo(pageWidth - margin, outerBorderBottomY - borderRadius);
        pdf.curveTo(
          pageWidth - margin,
          outerBorderBottomY + 0.5,
          pageWidth - margin,
          outerBorderBottomY + 0.5,
          pageWidth - margin - borderRadius,
          outerBorderBottomY
        );
        pdf.lineTo(margin + borderRadius, outerBorderBottomY);
        pdf.curveTo(
          margin - 0.5,
          outerBorderBottomY,
          margin - 0.5,
          outerBorderBottomY,
          margin,
          outerBorderBottomY - borderRadius
        );
        pdf.lineTo(margin, tabTopY + borderRadius);
        pdf.curveTo(
          margin,
          tabTopY - 0.5,
          margin,
          tabTopY - 0.5,
          margin + borderRadius,
          tabTopY
        );
        pdf.stroke();
      };

      const drawPageHeader = (withCustomerBlock: boolean) => {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        drawInvoiceOutline();
        drawClassicFooter();

        if (logoDataUrl) {
          pdf.addImage(logoDataUrl, 'PNG', contentLeftX, 5, 79, 30, undefined, 'FAST');
        }

        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...primaryTextColor);
        pdf.setFontSize(16);
        pdf.text(`${activeDocument.pdfTitle}: ${form.invoiceNo || '---'}`, contentRightX, 28, {
          align: 'right',
        });
        pdf.setFontSize(12);
        pdf.text(`Date: ${form.date || '--/--/----'}`, contentRightX, 33, {
          align: 'right',
        });
        if (activeDocumentType !== 'bill') {
          pdf.setFont('helvetica', 'bolditalic');
          pdf.setFontSize(12);
          pdf.text(`${activeDocument.purchaseLabel}: ${form.purchaseOrder || '____________'}`, contentRightX, 38, {
            align: 'right',
          });
          pdf.text(`${activeDocument.referenceLabel}: ${form.quotationNo || '____________'}`, contentRightX, 43, {
            align: 'right',
          });
        }

        let cursorY = 53;

        if (withCustomerBlock) {
          pdf.setTextColor(...primaryTextColor);
          pdf.setFontSize(9.3);
          const customerRows = getCustomerDetailRows(form);
          drawCustomerRows(customerRows, contentLeftX + 1, cursorY + 7, 30, 92, 5);
          cursorY += customerRows.length * 5 + 9;
        }

        if (logoDataUrl) {
          pdf.setGState(new GState({ opacity: 0.08, 'stroke-opacity': 0.08 }));
          pdf.addImage(logoDataUrl, 'PNG', (pageWidth - 122) / 2, 144, 122, 46, undefined, 'FAST');
          pdf.setGState(new GState({ opacity: 1, 'stroke-opacity': 1 }));
        }

        return drawTableHeader(cursorY);
      };

      const drawInvoiceNoticeBlocks = () => {
        if (activeDocumentType !== 'invoice') return;

        const showTaxNotice = form.showQuotationTaxNotice !== false;
        const showTerms = form.showQuotationTerms !== false;
        const thankYouY = outerBorderBottomY - 10;
        const boxGapY = 1.3;
        const thankYouTopGapY = 5.3;
        const termsBoxHeight = 24;
        const yellowBoxHeight = 20;
        const termsBoxY = thankYouY - thankYouTopGapY - termsBoxHeight;
        const yellowBoxY = showTerms
          ? termsBoxY - boxGapY - yellowBoxHeight - 1.5
          : thankYouY - thankYouTopGapY - yellowBoxHeight;

        if (showTaxNotice) {
          pdf.setDrawColor(0, 0, 0);
          pdf.setFillColor(254, 240, 138);
          pdf.rect(contentLeftX, yellowBoxY, 84, yellowBoxHeight, 'FD');
          pdf.setTextColor(220, 38, 38);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9.8);
          pdf.text('PLEASE DO NOT REDUCT', contentLeftX + 42, yellowBoxY + 5, { align: 'center' });
          pdf.text('INCOME TAX AS IT WAS PAYED', contentLeftX + 42, yellowBoxY + 11, { align: 'center' });
          pdf.text('WHILE IMPORTING', contentLeftX + 42, yellowBoxY + 17, { align: 'center' });
        }

        if (showTerms) {
          pdf.setDrawColor(4, 120, 87);
          pdf.setLineDashPattern([1.5, 1.2], 0);
          pdf.setFillColor(255, 255, 255);
          pdf.rect(contentLeftX, termsBoxY, contentRightX - contentLeftX, termsBoxHeight, 'FD');
          pdf.setLineDashPattern([], 0);
          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8.5);
          pdf.text('Terms & Conditions', contentLeftX + 2, termsBoxY + 5);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7.7);
          pdf.text(
            'All goods remain the property of Classic Electronic until full payment has been received.',
            contentLeftX + 2,
            termsBoxY + 10
          );
          pdf.text('Please make cheque payments payable to', contentLeftX + 2, termsBoxY + 15);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10.5);
          pdf.text('Classic Electronic', contentLeftX + 65, termsBoxY + 15);
          pdf.text('Account No: Meezan Bank PK13 MEZN 0003 1101 1360 2248', contentLeftX + 2, termsBoxY + 21);
        }

        pdf.setTextColor(...primaryTextColor);
      };

      let cursorY = drawPageHeader(true);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9.5);
      pdf.setTextColor(...primaryTextColor);

      for (const [index, item] of items.entries()) {
        const descriptionLines = pdf.splitTextToSize(
          item.description || 'Item description',
          tableColumnWidths[1] - 4
        ) as string[];
        const remarksLines = pdf.splitTextToSize(
          item.remarks || item.productName || 'Remarks',
          tableColumnWidths[2] - 4
        ) as string[];
        const itemImage = itemImageDataUrls[index];
        const itemTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);

        const descriptionHeight = Math.max(descriptionLines.length, 1) * 4;
        const remarksHeight = Math.max(remarksLines.length, 1) * 4;
        const imageHeight = itemImage ? 18 : 0;
        const maxRowHeight = bodyContentBottomY - cursorY - 2;
        const rowHeight = Math.min(
          Math.max(28, maxRowHeight),
          Math.max(28, Math.max(descriptionHeight, remarksHeight + imageHeight) + 6)
        );

        if (cursorY + rowHeight > bodyContentBottomY) {
          pdf.addPage();
          cursorY = drawPageHeader(false);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9.5);
          pdf.setTextColor(...primaryTextColor);
        }

        const finalRowHeight = Math.min(
          Math.max(28, bodyContentBottomY - cursorY - 2),
          Math.max(28, Math.max(descriptionHeight, remarksHeight + imageHeight) + 6)
        );
        const fittedDescriptionLines = fitTableLines(
          descriptionLines,
          Math.max(1, Math.floor((finalRowHeight - 7) / 4)),
          tableColumnWidths[1] - 4
        );
        const fittedRemarksLines = fitTableLines(
          remarksLines,
          Math.max(1, Math.floor((finalRowHeight - imageHeight - 7) / 4)),
          tableColumnWidths[2] - 4
        );

        const srX = contentLeftX;
        const descriptionCellX = srX + tableColumnWidths[0];
        const remarksCellX = descriptionCellX + tableColumnWidths[1];
        const priceCellX = remarksCellX + tableColumnWidths[2];
        const priceLabelWidth = 13;
        const priceValueWidth = tableColumnWidths[3] - priceLabelWidth;

        pdf.setDrawColor(...borderColor);
        [srX, descriptionCellX, remarksCellX, priceCellX].forEach((cellX, cellIndex) => {
          pdf.rect(cellX, cursorY, tableColumnWidths[cellIndex], finalRowHeight);
        });

        pdf.text(String(index + 1), srX + tableColumnWidths[0] / 2, cursorY + finalRowHeight / 2 + 2, {
          align: 'center',
        });
        pdf.text(fittedDescriptionLines, descriptionCellX + 2, cursorY + 4.8);

        pdf.setTextColor(...mutedTextColor);
        pdf.text(fittedRemarksLines, remarksCellX + 2, cursorY + 4.8);
        if (itemImage) {
          const imageY = cursorY + Math.max(fittedRemarksLines.length * 4 + 4, 10);
          const maxImageWidth = tableColumnWidths[2] - 4;
          const maxImageHeight = Math.max(finalRowHeight - (imageY - cursorY) - 2, 8);
          const imageSize = Math.min(maxImageWidth, maxImageHeight);

          if (imageSize > 6) {
            pdf.addImage(itemImage, 'PNG', remarksCellX + 2, imageY, imageSize, imageSize, undefined, 'FAST');
          }
        }
        pdf.setTextColor(...primaryTextColor);

        pdf.line(priceCellX + priceLabelWidth, cursorY, priceCellX + priceLabelWidth, cursorY + finalRowHeight);
        for (let priceRowIndex = 1; priceRowIndex < 4; priceRowIndex += 1) {
          const priceRowY = cursorY + (finalRowHeight / 4) * priceRowIndex;
          pdf.line(priceCellX, priceRowY, priceCellX + tableColumnWidths[3], priceRowY);
        }

        const priceRows: Array<[string, string, boolean]> = [
          ['UOM', item.uom || '--', false],
          ['Price', formatCurrency(item.unitPrice || 0), false],
          ['QTY', String(item.quantity || 0), false],
          ['Total', formatCurrency(itemTotal), true],
        ];
        priceRows.forEach(([label, value, isTotal], priceRowIndex) => {
          const priceTextY = cursorY + (finalRowHeight / 4) * priceRowIndex + finalRowHeight / 8 + 1.5;
          pdf.setFont('helvetica', isTotal ? 'bold' : 'normal');
          pdf.text(label, priceCellX + 1.2, priceTextY);
          pdf.text(fitPdfText(value, priceValueWidth - 2), priceCellX + priceLabelWidth + priceValueWidth / 2, priceTextY, {
            align: 'center',
          });
        });
        pdf.setFont('helvetica', 'normal');

        cursorY += finalRowHeight;
      }

      if (cursorY + 52 > bodyContentBottomY) {
        pdf.addPage();
        cursorY = drawPageHeader(false);
      }

      const totalBoxWidth = 56;
      const totalBoxX = contentRightX - totalBoxWidth;
      const totalBoxY = cursorY + 8;

      pdf.setDrawColor(...borderColor);
      pdf.roundedRect(totalBoxX, totalBoxY, totalBoxWidth, includeTax ? 34 : 22, 3, 3, 'S');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...mutedTextColor);
      if (includeTax) {
        pdf.text('SUB TOTAL', totalBoxX + 4, totalBoxY + 6);
        pdf.text(formatCurrency(totalAmount), totalBoxX + totalBoxWidth - 4, totalBoxY + 6, { align: 'right' });
        pdf.text('GST 18%', totalBoxX + 4, totalBoxY + 15);
        pdf.text(formatCurrency(salesTaxAmount), totalBoxX + totalBoxWidth - 4, totalBoxY + 15, { align: 'right' });
        pdf.line(totalBoxX + 4, totalBoxY + 20, totalBoxX + totalBoxWidth - 4, totalBoxY + 20);
        pdf.setTextColor(...primaryTextColor);
        pdf.text('GRAND TOTAL', totalBoxX + 4, totalBoxY + 28);
        pdf.text(formatCurrency(grandTotalWithTax), totalBoxX + totalBoxWidth - 4, totalBoxY + 28, { align: 'right' });
      } else {
        pdf.setTextColor(...primaryTextColor);
        pdf.text('TOTAL', totalBoxX + 4, totalBoxY + 13);
        pdf.text(formatCurrency(totalAmount), totalBoxX + totalBoxWidth - 4, totalBoxY + 13, { align: 'right' });
      }

      const signatureNameY = totalBoxY + 8;
      const signatureLineY = totalBoxY + 10.5;
      const signatureLabelY = totalBoxY + 17.2;

      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(15);
      pdf.setTextColor(14, 116, 144);
      pdf.text(form.directorName || 'Director Name', contentLeftX + 1, signatureNameY);

      pdf.setDrawColor(...lightBorderColor);
      pdf.setLineWidth(0.35);
      pdf.line(contentLeftX + 1, signatureLineY, contentLeftX + 33, signatureLineY);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.setTextColor(...primaryTextColor);
      pdf.text('Director', contentLeftX + 1, signatureLabelY);
      drawInvoiceNoticeBlocks();
      drawBodyThankYou(105, outerBorderBottomY - 10, 'center');
      drawBodySubtitle(outerBorderBottomY - 4);

      pdf.save(buildSalesPdfFileName(activeDocumentType, form));

};
