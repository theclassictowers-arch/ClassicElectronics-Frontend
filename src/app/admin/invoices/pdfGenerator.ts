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
        const formatPdfRs = (amount: number) => `${Math.round(amount)} Rs`;
        const quotationItems = items.length > 0 ? items : [createInvoiceItem()];
        const taxAmount = totalAmount * SALES_TAX_RATE;
        const grandTotal = totalAmount + taxAmount;
        const tableX = 8;
        const tableY = 69;
        const tableWidth = 194;
        const headerHeight = 13;
        const minimumRowHeight = quotationItems.length <= 2 ? 40 : quotationItems.length <= 4 ? 30 : 22;
        const srWidth = 10;
        const descriptionWidth = 76;
        const remarksWidth = 78;
        const totalWidth = tableWidth - srWidth - descriptionWidth - remarksWidth;
        const splitPdfCellText = (value: string, width: number) =>
          pdf.splitTextToSize(value.replace(/(\S{24})/g, '$1 '), width) as string[];
        const globeDataUrl = await loadImageAsPngDataUrl(getFrontendAssetUrl('/quotation-globe.png'));
        const stampDataUrl = await loadImageAsPngDataUrl(getFrontendAssetUrl('/quotation-stamp-signature.png'));
        const whatsappDataUrl = await loadImageAsPngDataUrl(getFrontendAssetUrl('/quotation-whatsapp.png'));
        const quotationImageDataUrls = await Promise.all(
          quotationItems.map((item) => {
            if (!item.showPicture) return Promise.resolve(null);
            const imageUrl = getPictureSource(item.picture);
            return imageUrl ? loadImageAsPngDataUrl(imageUrl) : Promise.resolve(null);
          })
        );

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
        pdf.setFontSize(19);
        pdf.text(`Quotation:${form.invoiceNo || '0050'}`, 199, 15, { align: 'right' });
        pdf.setFontSize(11);
        pdf.text(`Date: ${form.date || '--/--/----'}`, 199, 23, { align: 'right' });
        pdf.setFont('helvetica', 'bolditalic');
        pdf.setFontSize(11);
        pdf.text('Indent No:', 199, 32, { align: 'right' });
        pdf.text('Enquiry No:', 199, 41, { align: 'right' });

        pdf.setDrawColor(...purple);
        pdf.setLineWidth(0.7);
        pdf.roundedRect(2, 45, 206, 205, 5, 5, 'S');

        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.text('Manage Purchase;', 8, 49);
        pdf.text(form.companyName || 'Fecto Cement Ltd', 8, 56);
        pdf.text(`${form.location || 'Rawalpindi'}:`, 8, 63);
        pdf.setFont('helvetica', 'bolditalic');
        pdf.setFontSize(8);
        pdf.text('Reference to your quotation the details is as below.', 8, 68);

        const quotationRowHeights = quotationItems.map((item, index) => {
          const descriptionLines = splitPdfCellText(
            item.description || item.productName || '',
            descriptionWidth - 4
          );
          const remarksLines = splitPdfCellText(
            item.remarks || item.productName || '',
            remarksWidth - 5
          );
          const textHeight = Math.max(descriptionLines.length, remarksLines.length, 1) * 4.3;
          const imageHeight = quotationImageDataUrls[index] ? 25 : 0;

          return Math.max(minimumRowHeight, textHeight + imageHeight + 12);
        });
        const tableHeight =
          headerHeight + quotationRowHeights.reduce((height, rowHeight) => height + rowHeight, 0);
        const descriptionX = tableX + srWidth;
        const remarksX = descriptionX + descriptionWidth;
        const totalX = remarksX + remarksWidth;

        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.62);
        pdf.rect(tableX, tableY, tableWidth, tableHeight);
        pdf.line(tableX, tableY + headerHeight, tableX + tableWidth, tableY + headerHeight);
        pdf.line(descriptionX, tableY, descriptionX, tableY + tableHeight);
        pdf.line(remarksX, tableY, remarksX, tableY + tableHeight);
        pdf.line(totalX, tableY, totalX, tableY + tableHeight);
        pdf.line(descriptionX, tableY + 6.5, remarksX, tableY + 6.5);
        pdf.line(descriptionX + 25.33, tableY + 6.5, descriptionX + 25.33, tableY + headerHeight);
        pdf.line(descriptionX + 50.66, tableY + 6.5, descriptionX + 50.66, tableY + headerHeight);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.6);
        pdf.text('Sr', tableX + 5, tableY + 8.4, { align: 'center' });
        pdf.text('DESCRIPTION', descriptionX + descriptionWidth / 2, tableY + 4.5, { align: 'center' });
        pdf.text('UOM', descriptionX + 12.66, tableY + 11.4, { align: 'center' });
        pdf.text('QTY', descriptionX + 38, tableY + 11.4, { align: 'center' });
        pdf.text('Unit Price', descriptionX + 63.33, tableY + 11.4, { align: 'center' });
        pdf.text('Remarks/Picture', remarksX + remarksWidth / 2, tableY + 8.4, { align: 'center' });
        pdf.text('Total', totalX + totalWidth / 2, tableY + 8.4, { align: 'center' });

        let rowY = tableY + headerHeight;
        quotationItems.forEach((item, index) => {
          const rowHeight = quotationRowHeights[index];
          const itemTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
          const itemImage = quotationImageDataUrls[index];

          if (index > 0) pdf.line(tableX, rowY, tableX + tableWidth, rowY);

          pdf.line(descriptionX, rowY + rowHeight - 8, remarksX, rowY + rowHeight - 8);
          pdf.line(descriptionX + 25.33, rowY + rowHeight - 8, descriptionX + 25.33, rowY + rowHeight);
          pdf.line(descriptionX + 50.66, rowY + rowHeight - 8, descriptionX + 50.66, rowY + rowHeight);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.text(String(index + 1), tableX + 5, rowY + rowHeight / 2 + 2, { align: 'center' });
          pdf.text(
            splitPdfCellText(item.description || item.productName || '', descriptionWidth - 4),
            descriptionX + 2,
            rowY + 8
          );
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(8.5);
          pdf.text(item.uom || 'NOS', descriptionX + 12.66, rowY + rowHeight - 2.5, { align: 'center' });
          pdf.text(String(item.quantity || 0), descriptionX + 38, rowY + rowHeight - 2.5, {
            align: 'center',
          });
          pdf.text(String(item.unitPrice || 0), descriptionX + 63.33, rowY + rowHeight - 2.5, {
            align: 'center',
          });
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7.5);
          const remarksLines = splitPdfCellText(
            item.remarks || item.productName || '',
            remarksWidth - 5
          );
          pdf.text(remarksLines, remarksX + 2, rowY + 7);
          if (itemImage) {
            const imageWidth = Math.min(30, remarksWidth - 12);
            const imageHeight = Math.min(22, Math.max(rowHeight - 18, 12));
            const imageX = remarksX + (remarksWidth - imageWidth) / 2;
            const textHeight = Math.max(remarksLines.length, 1) * 4;
            const imageY = Math.min(rowY + 8 + textHeight, rowY + rowHeight - imageHeight - 3);
            pdf.addImage(itemImage, 'PNG', imageX, imageY, imageWidth, imageHeight, undefined, 'FAST');
          }
          pdf.setFont('helvetica', 'bolditalic');
          pdf.setFontSize(8.2);
          pdf.text(formatPdfRs(itemTotal), totalX + totalWidth / 2, rowY + rowHeight / 2 + 2, {
            align: 'center',
          });
          rowY += rowHeight;
        });

        const afterTableY = tableY + tableHeight + 3;
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(5.4);
        pdf.text('If you have any questions concerning this quotation please tell us.', 8, afterTableY);

        const detailsY = afterTableY + 6;
        pdf.setFont('helvetica', 'bolditalic');
        pdf.setFontSize(9);
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

        const stampY = Math.min(detailsY + 45, 216);
        if (stampDataUrl) pdf.addImage(stampDataUrl, 'PNG', 5, stampY, 42, 25.2, undefined, 'FAST');

        pdf.setFont('helvetica', 'bolditalic');
        pdf.setTextColor(...purple);
        pdf.setFontSize(7.8);
        pdf.text('THANK YOU FOR YOUR BUSINESS!', 105, 266.5, { align: 'center' });
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(4.9);
        pdf.text('A wide range of industrial instrument & sensing solutions', 105, 270.4, {
          align: 'center',
        });

        if (globeDataUrl) pdf.addImage(globeDataUrl, 'PNG', 35.5, 275, 8, 8, undefined, 'FAST');
        if (whatsappDataUrl) pdf.addImage(whatsappDataUrl, 'PNG', 169.5, 275.2, 7.2, 7.2, undefined, 'FAST');

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(5.5);
        pdf.text(form.website || 'www.classicelectronics.com.pk', 40, 286.2, { align: 'center' });
        pdf.text(form.address || '133 G St # 109 Sector G 11/3 Islamabad', 40, 290, {
          align: 'center',
          maxWidth: 56,
        });

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6.3);
        pdf.text('NTN: 1700506', 105, 283.6, { align: 'center' });
        pdf.text('GST: 05-07-8500-014-73', 105, 287.8, { align: 'center' });

        pdf.setDrawColor(37, 99, 235);
        pdf.setLineWidth(0.45);
        pdf.circle(105, 276.6, 3.6);
        pdf.rect(102.9, 275.6, 4.2, 2.8);
        pdf.line(102.9, 275.6, 105, 277.4);
        pdf.line(107.1, 275.6, 105, 277.4);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(5.6);
        pdf.setTextColor(0, 0, 0);
        pdf.text(form.email || 'sales@classicelectronics.com.pk', 105, 292.2, { align: 'center' });

        pdf.setFontSize(6.2);
        pdf.text(form.phonePrimary || '+92 3 111 777 510', 173, 286.2, { align: 'center' });
        pdf.text(form.phoneSecondary || '+92 321 5180308', 173, 290.2, { align: 'center' });

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
