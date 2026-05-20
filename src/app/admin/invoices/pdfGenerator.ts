import { CLASSIC_LOGO_SRC } from '@/lib/brandAssets';
import type { DocumentType, InvoiceForm, InvoiceItem } from './types';
import {
  GST_REGISTRATION_PLACEHOLDER,
  SALES_TAX_RATE,
  buildPdfFileName,
  createInvoiceItem,
  formatCurrency,
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
        const includeTax = activeDocumentType === 'invoice';
        const salesTaxAmount = totalAmount * SALES_TAX_RATE;
        const grandTotalWithTax = includeTax ? totalAmount + salesTaxAmount : totalAmount;

      if (activeDocumentType === 'quotation') {
        const purple: [number, number, number] = [109, 40, 217];
        const formatPdfRs = (amount: number) => formatCurrency(amount);
        const quotationItems = items.length > 0 ? items : [createInvoiceItem()];
        const taxAmount = totalAmount * SALES_TAX_RATE;
        const grandTotal = totalAmount + taxAmount;
        const tableX = 8;
        const tableY = 75;
        const tableWidth = 194;
        const headerHeight = 13;
        const minimumRowHeight = 20;
        const srWidth = 10;
        const descriptionWidth = 76;
        const remarksWidth = 78;
        const totalWidth = tableWidth - srWidth - descriptionWidth - remarksWidth;
        const descriptionPartWidth = descriptionWidth / 3;
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
        const globeDataUrl = await loadImageAsPngDataUrl(getFrontendAssetUrl('/quotation-globe.png'));
        const stampDataUrl = await loadImageAsPngDataUrl(
          getFrontendAssetUrl('/quotation-stamp-signature.png'),
          { transparentWhite: true }
        );
        const whatsappDataUrl = await loadImageAsPngDataUrl(getFrontendAssetUrl('/quotation-whatsapp.png'));
        const quotationImageDataUrls = await Promise.all(
          quotationItems.map((item) => {
            if (!item.showPicture) return Promise.resolve(null);
            const imageUrl = getPictureSource(item.picture);
            return imageUrl ? loadImageAsPngDataUrl(imageUrl) : Promise.resolve(null);
          })
        );

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

          return Math.max(minimumRowHeight, descriptionHeight, remarksHeight);
        });
        const descriptionX = tableX + srWidth;
        const remarksX = descriptionX + descriptionWidth;
        const totalX = remarksX + remarksWidth;

        const contentBottomY = 250;
        const detailsBlockHeight = 60;

        const drawQuotationFooter = () => {
          pdf.setFont('helvetica', 'bolditalic');
          pdf.setTextColor(...purple);
          pdf.setFontSize(7.8);
          pdf.text('THANK YOU FOR YOUR BUSINESS!', 105, 261.2, { align: 'center' });
          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(4.9);
          pdf.text('A wide range of industrial instrument & sensing solutions', 105, 265.1, {
            align: 'center',
          });

          if (globeDataUrl) pdf.addImage(globeDataUrl, 'PNG', 38, 272.8, 4.8, 4.8, undefined, 'FAST');
          if (whatsappDataUrl) pdf.addImage(whatsappDataUrl, 'PNG', 171.2, 272.9, 4.6, 4.6, undefined, 'FAST');

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(5.5);
          pdf.text(form.website || 'www.classicelectronics.com.pk', 41, 286.2, { align: 'center' });
          pdf.text(form.address || '133 G St # 109 Sector G 11/3 Islamabad', 41, 290, {
            align: 'center',
            maxWidth: 56,
          });

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(6.3);
          pdf.text('NTN: 1700506', 105, 283.6, { align: 'center' });
          pdf.text('GST: 05-07-8500-014-73', 105, 287.8, { align: 'center' });

          pdf.setDrawColor(37, 99, 235);
          pdf.setLineWidth(0.35);
          pdf.circle(105, 275.2, 2.8);
          pdf.roundedRect(103.25, 274.4, 3.5, 2.35, 0.35, 0.35);
          pdf.line(103.25, 274.4, 105, 275.7);
          pdf.line(106.75, 274.4, 105, 275.7);
          pdf.line(103.25, 276.75, 104.55, 275.6);
          pdf.line(106.75, 276.75, 105.45, 275.6);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(5.6);
          pdf.setTextColor(0, 0, 0);
          pdf.text(form.email || 'sales@classicelectronics.com.pk', 105, 292.2, { align: 'center' });

          pdf.setFontSize(6.2);
          pdf.text(form.phonePrimary || '+92 3 111 777 510', 174, 286.2, { align: 'center' });
          pdf.text(form.phoneSecondary || '+92 321 5180308', 174, 290.2, { align: 'center' });
        };

        const drawQuotationShell = () => {
          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, pageWidth, pageHeight, 'F');

          if (logoDataUrl) {
            pdf.addImage(logoDataUrl, 'PNG', 4, 5, 79, 30, undefined, 'FAST');
            pdf.setGState(new GState({ opacity: 0.18, 'stroke-opacity': 0.18 }));
            pdf.addImage(logoDataUrl, 'PNG', 47, 134, 118, 45, undefined, 'FAST');
            pdf.setGState(new GState({ opacity: 1, 'stroke-opacity': 1 }));
          }

          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(24);
          pdf.text(`Quotation:${form.invoiceNo || '0050'}`, 199, 15, { align: 'right' });
          pdf.setFontSize(15);
          pdf.text(`Date: ${form.date || '--/--/----'}`, 199, 22.5, { align: 'right' });
          pdf.text(`Date: ${form.date || '--/--/----'}`, 198.8, 22.5, { align: 'right' });
          pdf.setFont('helvetica', 'bolditalic');
          pdf.setFontSize(15);
          pdf.text(`Indent No: ${form.purchaseOrder || ''}`, 199, 31, { align: 'right' });
          pdf.text(`Indent No: ${form.purchaseOrder || ''}`, 198.8, 31, { align: 'right' });
          pdf.text(`Enquiry No: ${form.quotationNo || ''}`, 199, 38.8, { align: 'right' });
          pdf.text(`Enquiry No: ${form.quotationNo || ''}`, 198.8, 38.8, { align: 'right' });

          pdf.setDrawColor(...purple);
          pdf.setLineWidth(0.7);
          pdf.roundedRect(2, 53, 206, 197, 5, 5, 'S');

          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.text('Manage Purchase;', 8, 57);
          pdf.text(form.companyName || 'Fecto Cement Ltd', 8, 61);
          pdf.text(`${form.location || 'Rawalpindi'}:`, 8, 65);
          pdf.setFont('helvetica', 'bolditalic');
          pdf.setFontSize(8);
          pdf.text('Reference to your quotation the details is as below.', 8, 70);

          drawQuotationFooter();
        };

        const drawQuotationTableHeader = (startY: number) => {
          pdf.setDrawColor(0, 0, 0);
          pdf.setLineWidth(0.62);
          pdf.rect(tableX, startY, tableWidth, headerHeight);
          pdf.line(descriptionX, startY, descriptionX, startY + headerHeight);
          pdf.line(remarksX, startY, remarksX, startY + headerHeight);
          pdf.line(totalX, startY, totalX, startY + headerHeight);
          pdf.line(descriptionX, startY + 6.5, remarksX, startY + 6.5);
          pdf.line(descriptionX + descriptionPartWidth, startY + 6.5, descriptionX + descriptionPartWidth, startY + headerHeight);
          pdf.line(descriptionX + descriptionPartWidth * 2, startY + 6.5, descriptionX + descriptionPartWidth * 2, startY + headerHeight);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7.6);
          pdf.setTextColor(0, 0, 0);
          pdf.text('Sr', tableX + 5, startY + 8.4, { align: 'center' });
          pdf.text('DESCRIPTION', descriptionX + descriptionWidth / 2, startY + 4.5, { align: 'center' });
          pdf.text('UOM', descriptionX + descriptionPartWidth / 2, startY + 11.4, { align: 'center' });
          pdf.text('QTY', descriptionX + descriptionPartWidth * 1.5, startY + 11.4, { align: 'center' });
          pdf.text('Unit Price', descriptionX + descriptionPartWidth * 2.5, startY + 11.4, { align: 'center' });
          pdf.text('Remarks/Picture', remarksX + remarksWidth / 2, startY + 8.4, { align: 'center' });
          pdf.text('Total', totalX + totalWidth / 2, startY + 8.4, { align: 'center' });

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
          pdf.line(totalX, rowY, totalX, rowY + rowHeight);
          pdf.line(descriptionX, rowY + rowHeight - 8, remarksX, rowY + rowHeight - 8);
          pdf.line(descriptionX + descriptionPartWidth, rowY + rowHeight - 8, descriptionX + descriptionPartWidth, rowY + rowHeight);
          pdf.line(descriptionX + descriptionPartWidth * 2, rowY + rowHeight - 8, descriptionX + descriptionPartWidth * 2, rowY + rowHeight);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.text(String(index + 1), tableX + 5, rowY + rowHeight / 2 + 2, { align: 'center' });
          pdf.text(
            splitPdfCellText(item.description || item.productName || '', descriptionWidth - 4, 8),
            descriptionX + 2,
            rowY + 6
          );
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(8.5);
          pdf.text(fitPdfText(item.uom || 'NOS', descriptionPartWidth - 3), descriptionX + descriptionPartWidth / 2, rowY + rowHeight - 2.5, { align: 'center' });
          pdf.text(fitPdfText(String(item.quantity || 0), descriptionPartWidth - 3), descriptionX + descriptionPartWidth * 1.5, rowY + rowHeight - 2.5, {
            align: 'center',
          });
          pdf.text(fitPdfText(formatPdfRs(item.unitPrice || 0), descriptionPartWidth - 3), descriptionX + descriptionPartWidth * 2.5, rowY + rowHeight - 2.5, {
            align: 'center',
          });
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7.5);
          const remarksLines = splitPdfCellText(
            item.remarks || item.productName || '',
            remarksWidth - 5,
            7.5
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
          pdf.setFont('helvetica', 'bolditalic');
          pdf.setFontSize(8.2);
          pdf.text(formatPdfRs(itemTotal), totalX + totalWidth / 2, rowY + rowHeight / 2 + 2, {
            align: 'center',
          });
        };

        const drawQuotationTotals = (detailsY: number) => {
          pdf.setFont('helvetica', 'bolditalic');
          pdf.setFontSize(9);
          pdf.setTextColor(0, 0, 0);
          pdf.text('Delivery Period :', 8, detailsY);
          pdf.text('Validity Date:', 8, detailsY + 8);
          pdf.setFont('helvetica', 'italic');
          pdf.rect(51, detailsY - 5, 43, 7);
          pdf.text(form.deliveryPeriod || '4 Weeks', 72.5, detailsY, { align: 'center' });
          pdf.rect(51, detailsY + 3, 43, 7);
          pdf.text('1 WEEK', 72.5, detailsY + 8, { align: 'center' });

          const totalsX = 140;
          const totalsValueX = 165;
          const totalsBoxWidth = 31;
          [
            ['Sub Total', formatPdfRs(totalAmount), detailsY - 5],
            ['Tax', '18%', detailsY + 3],
            ['Total', formatPdfRs(taxAmount), detailsY + 11],
            ['Total as', formatPdfRs(grandTotal), detailsY + 19],
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
            pdf.addImage(stampDataUrl, 'PNG', 8, detailsY + 20, 46, 27.6, undefined, 'FAST');
          }
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

        let afterTableY = rowY + 5;

        if (afterTableY + detailsBlockHeight > contentBottomY) {
          pdf.addPage();
          drawQuotationShell();
          rowY = drawQuotationTableHeader(tableY);
          afterTableY = rowY + 5;
        }

        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(5.4);
        pdf.setTextColor(0, 0, 0);
        pdf.text('If you have any questions concerning this quotation please tell us.', 8, afterTableY);
        drawQuotationTotals(afterTableY + 10);

        pdf.save(buildPdfFileName(activeDocument.fileSlug, form.invoiceNo, form.date));
        return;
      }

      if (activeDocumentType === 'deliveryChallan') {
        const drawDeliveryChallan = () => {
          const leftX = 18.5;
          const rightX = 153;
          const topY = 20;
          const tableX = 18;
          const tableY = 98.5;
          const tableWidth = 172;
          const headerHeight = 5.2;
          const rowHeight = 22.5;
          const visibleRows = Math.max(items.length, 1);
          const tableHeight = headerHeight + rowHeight * visibleRows;
          const columns = [29, 80, 25, 38];
          const lineColor: [number, number, number] = [0, 0, 0];

          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, pageWidth, pageHeight, 'F');

          if (logoDataUrl) {
            pdf.addImage(logoDataUrl, 'PNG', 19, topY, 91, 36.5, undefined, 'FAST');
            pdf.setGState(new GState({ opacity: 0.08, 'stroke-opacity': 0.08 }));
            pdf.addImage(logoDataUrl, 'PNG', 45, 126, 120, 46, undefined, 'FAST');
            pdf.setGState(new GState({ opacity: 1, 'stroke-opacity': 1 }));
          }

          pdf.setTextColor(54, 96, 146);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(16);
          pdf.text('Delivery Challan', 135, 34);

          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(11);
          pdf.text('DC', 147, 56);
          pdf.text(form.invoiceNo || '---', 153, 56);
          pdf.text('Date:', 143, 61.2);
          pdf.text(form.date || '--/--/----', 153, 61.2);

          pdf.text('Name of Buyer', leftX, 66.2);
          pdf.setFont('helvetica', 'bold');
          pdf.text(form.companyName || 'Customer Company', 47.5, 66.2);
          pdf.setFont('helvetica', 'normal');
          pdf.text('Our Sale tax Reg #:', 128, 66.2);
          pdf.text('05-07-8500-014-73', rightX, 66.2);

          pdf.text('Address', leftX, 71.4);
          pdf.setFont('helvetica', 'bold');
          pdf.text(form.location || 'Customer Address', 47.5, 71.4);
          pdf.setFont('helvetica', 'normal');

          pdf.text('Sales Tax Registration No', leftX, 91.8);
          pdf.text(form.gst || GST_REGISTRATION_PLACEHOLDER, 73, 91.8);
          pdf.text(`PO:${form.purchaseOrder || '________________'}`, leftX, 97.2);

          pdf.setDrawColor(...lineColor);
          pdf.setLineWidth(0.35);
          pdf.rect(tableX, tableY, tableWidth, tableHeight);
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
          pdf.setFontSize(10.5);
          pdf.text('S.No', tableX + 10.5, tableY + 4.2);
          pdf.text('Particulars', tableX + 60, tableY + 4.2);
          pdf.text('Qty', tableX + 113, tableY + 4.2);
          pdf.text('Remarks', tableX + 137, tableY + 4.2);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);

          items.forEach((item, index) => {
            const rowTop = tableY + headerHeight + index * rowHeight;

            pdf.text(String(index + 1), tableX + 14, rowTop + 12.5);
            pdf.text(String(item.quantity || ''), tableX + 118, rowTop + 12.5, {
              align: 'center',
            });
            pdf.text(
              pdf.splitTextToSize(item.remarks || '', columns[3] - 4),
              tableX + 136,
              rowTop + 12.5
            );
            pdf.text(
              pdf.splitTextToSize(item.description || item.productName || 'Item particulars', columns[1] - 5),
              tableX + 31,
              rowTop + 12.2
            );
          });

          const signatureY = 135;
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10.5);
          pdf.text('From Classic Electronics', leftX, signatureY);
          pdf.setFont('helvetica', 'bold');
          pdf.text(form.directorName || 'M Fawad  Younis', leftX, signatureY + 25.7);
          pdf.text('Director', leftX, signatureY + 30.8);

          const footerY = 265;
          pdf.setDrawColor(180, 180, 180);
          pdf.setLineWidth(0.25);
          pdf.line(18, footerY - 5, 190, footerY - 5);

          if (logoDataUrl) {
            pdf.addImage(logoDataUrl, 'PNG', 18, footerY - 1, 39, 15.5, undefined, 'FAST');
          }

          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8.5);
          pdf.text(form.website, 64, footerY + 2);
          pdf.text(form.address, 64, footerY + 7);
          pdf.text(form.email, 64, footerY + 12);
          pdf.text(form.phonePrimary, 151, footerY + 4);
          pdf.text(form.phoneSecondary, 151, footerY + 9);
        };

        drawDeliveryChallan();
        pdf.save(buildPdfFileName(activeDocument.fileSlug, form.invoiceNo, form.date));
        return;
      }

      const margin = 11;
      const innerPadding = 4;
      const contentWidth = pageWidth - margin * 2;
      const contentLeftX = margin + innerPadding;
      const contentRightX = pageWidth - margin - innerPadding;
      const tableColumnWidths = [10, 72, 9, 9, 15, 38, 29];
      const tableHeaders = ['Sr', 'Description', 'UOM', 'QTY', 'Unit Price', 'Remarks/Picture', 'Total'];
      const primaryTextColor: [number, number, number] = [15, 23, 42];
      const mutedTextColor: [number, number, number] = [71, 85, 105];
      const accentColor: [number, number, number] = [109, 40, 217];
      const borderColor: [number, number, number] = [15, 23, 42];
      const lightBorderColor: [number, number, number] = [203, 213, 225];
      const outerBorderTopY = 43;
      const outerBorderBottomY = pageHeight - 34;
      const tabTopY = 34;
      const tabWidth = 68;
      const borderRadius = 8;
      const footerBoxX = margin;
      const footerBoxY = pageHeight - 30;
      const footerBoxWidth = contentWidth;
      const footerBoxHeight = 23;

      const itemImageDataUrls = await Promise.all(
        items.map((item) => {
          if (!item.showPicture) return Promise.resolve(null);
          const imageUrl = getPictureSource(item.picture);
          return imageUrl ? loadImageAsPngDataUrl(imageUrl) : Promise.resolve(null);
        })
      );

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

      const drawFooterOutline = () => {
        pdf.setDrawColor(...accentColor);
        pdf.setFillColor(255, 255, 255);
        pdf.setLineWidth(0.9);
        pdf.roundedRect(footerBoxX, footerBoxY, footerBoxWidth, footerBoxHeight, 6, 6, 'FD');
      };

      const drawPageHeader = (withCustomerBlock: boolean) => {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        drawInvoiceOutline();
        drawFooterOutline();

        if (logoDataUrl) {
          pdf.addImage(logoDataUrl, 'PNG', contentLeftX, 8, 50, 19, undefined, 'FAST');
        }

        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...primaryTextColor);
        pdf.setFontSize(15);
        pdf.text(`${activeDocument.pdfTitle}: ${form.invoiceNo || '---'}`, contentRightX, 15, {
          align: 'right',
        });
        pdf.setFontSize(13.2);
        pdf.text(`Date: ${form.date || '--/--/----'}`, contentRightX, 22.5, {
          align: 'right',
        });
        pdf.setFont('helvetica', 'bolditalic');
        pdf.setFontSize(10.8);
        pdf.text(`${activeDocument.purchaseLabel}: ${form.purchaseOrder || '____________'}`, contentRightX, 29.5, {
          align: 'right',
        });
        pdf.text(`${activeDocument.referenceLabel}: ${form.quotationNo || '____________'}`, contentRightX, 36.5, {
          align: 'right',
        });

        let cursorY = 50;

        if (withCustomerBlock) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(11);
          pdf.setTextColor(...primaryTextColor);
          pdf.text(form.companyName || 'Customer Company', contentLeftX + 1, cursorY + 7);
          pdf.text(form.location ? `${form.location}:` : 'Location:', contentLeftX + 1, cursorY + 13);
          if (includeTax) {
            pdf.text(`GST: ${form.gst || '________________'}`, contentLeftX + 1, cursorY + 19);
            pdf.text(`NTN: ${form.ntn || '________________'}`, contentLeftX + 1, cursorY + 25);
            cursorY += 31;
          } else {
            cursorY += 21;
          }
        }

        if (logoDataUrl) {
          pdf.setGState(new GState({ opacity: 0.08, 'stroke-opacity': 0.08 }));
          pdf.addImage(logoDataUrl, 'PNG', (pageWidth - 122) / 2, 144, 122, 46, undefined, 'FAST');
          pdf.setGState(new GState({ opacity: 1, 'stroke-opacity': 1 }));
        }

        return drawTableHeader(cursorY);
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
          tableColumnWidths[5] - 4
        ) as string[];
        const itemImage = itemImageDataUrls[index];
        const itemTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);

        const descriptionHeight = Math.max(descriptionLines.length, 1) * 4;
        const remarksHeight = Math.max(remarksLines.length, 1) * 4;
        const imageHeight = itemImage ? 18 : 0;
        const rowHeight = Math.max(16, Math.max(descriptionHeight, remarksHeight + imageHeight) + 6);

        if (cursorY + rowHeight > pageHeight - 55) {
          pdf.addPage();
          cursorY = drawPageHeader(false);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9.5);
          pdf.setTextColor(...primaryTextColor);
        }

        let currentX = contentLeftX;
        const rowValues = [
          String(index + 1),
          descriptionLines,
          item.uom || '--',
          String(item.quantity || 0),
          formatCurrency(item.unitPrice || 0),
          remarksLines,
          formatCurrency(itemTotal),
        ] as const;

        rowValues.forEach((value, valueIndex) => {
          const cellWidth = tableColumnWidths[valueIndex];
          pdf.setDrawColor(...borderColor);
          pdf.rect(currentX, cursorY, cellWidth, rowHeight);

          if (valueIndex === 1) {
            pdf.text(value as string[], currentX + 2, cursorY + 4.8);
          } else if (valueIndex === 5) {
            pdf.setTextColor(...mutedTextColor);
            pdf.text(value as string[], currentX + 2, cursorY + 4.8);

            if (itemImage) {
              const imageY = cursorY + Math.max(remarksHeight + 4, 10);
              const maxImageWidth = cellWidth - 4;
              const maxImageHeight = Math.max(rowHeight - (imageY - cursorY) - 2, 8);
              const imageSize = Math.min(maxImageWidth, maxImageHeight);

              if (imageSize > 6) {
                pdf.addImage(itemImage, 'PNG', currentX + 2, imageY, imageSize, imageSize, undefined, 'FAST');
              }
            }

            pdf.setTextColor(...primaryTextColor);
          } else {
            pdf.text(String(value), currentX + cellWidth / 2, cursorY + 6, {
              align: 'center',
            });
          }

          currentX += cellWidth;
        });

        cursorY += rowHeight;
      }

      if (cursorY + 74 > pageHeight - 22) {
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
      const thankYouY = Math.max(totalBoxY + 46, footerBoxY - 7);

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

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11.5);
      pdf.setTextColor(...accentColor);
      pdf.text(form.thankYouNote, contentRightX, thankYouY, { align: 'right' });

      const footerTitleY = footerBoxY + 4.8;
      const footerDividerY = footerBoxY + 7.2;
      const footerLineOneY = footerBoxY + 12.3;
      const footerLineTwoY = footerBoxY + 16.6;
      const footerLineThreeY = footerBoxY + 20;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(...primaryTextColor);
      pdf.text(form.subtitle, pageWidth / 2, footerTitleY, {
        align: 'center',
        maxWidth: footerBoxWidth - 12,
      });

      pdf.setDrawColor(...lightBorderColor);
      pdf.setLineWidth(0.35);
      pdf.line(footerBoxX + 4, footerDividerY, footerBoxX + footerBoxWidth - 4, footerDividerY);

      const addressLines = pdf.splitTextToSize(form.address || '', 58) as string[];
      const footerLeftX = footerBoxX + 7;
      const footerCenterX = footerBoxX + footerBoxWidth / 2;
      const footerRightX = footerBoxX + footerBoxWidth - 7;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.2);
      pdf.setTextColor(...primaryTextColor);
      pdf.text(form.website, footerLeftX, footerLineOneY);
      pdf.text(addressLines[0] || '', footerLeftX, footerLineTwoY);
      pdf.text(addressLines[1] || '', footerLeftX, footerLineThreeY);

      if (includeTax) {
        pdf.text('NTN: 1700506', footerCenterX, footerLineOneY, { align: 'center' });
        pdf.text('GST: 05-07-8500-014-73', footerCenterX, footerLineTwoY, { align: 'center' });
        pdf.text(form.email, footerCenterX, footerLineThreeY, { align: 'center' });
      } else {
        pdf.text(form.email, footerCenterX, footerLineTwoY, { align: 'center' });
      }

      pdf.text(form.phonePrimary, footerRightX, footerLineOneY, { align: 'right' });
      pdf.text(form.phoneSecondary, footerRightX, footerLineTwoY, { align: 'right' });

      pdf.save(buildPdfFileName(activeDocument.fileSlug, form.invoiceNo, form.date));

};
