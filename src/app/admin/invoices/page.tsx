'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { resolveAssetUrl } from '@/lib/apiConfig';
import type { AdminCategory } from '@/types/adminCategory';
import type { AdminProduct, ProductCategoryRef } from '@/types/adminProduct';
import {
  BadgeDollarSign,
  Building2,
  CalendarDays,
  Download,
  FileText,
  Globe,
  Loader2,
  Mail,
  Phone,
  Plus,
  Printer,
  RotateCcw,
  Trash2,
} from 'lucide-react';

type CatalogProduct = AdminProduct & {
  slug?: string;
};

type InvoiceItem = {
  id: string;
  categoryId: string;
  productId: string;
  productName: string;
  description: string;
  uom: string;
  quantity: number;
  unitPrice: number;
  remarks: string;
  picture: string;
};

type InvoiceForm = {
  invoiceNo: string;
  date: string;
  purchaseOrder: string;
  quotationNo: string;
  companyName: string;
  location: string;
  gst: string;
  ntn: string;
  subtitle: string;
  thankYouNote: string;
  website: string;
  address: string;
  email: string;
  phonePrimary: string;
  phoneSecondary: string;
  directorName: string;
};

const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const createInvoiceForm = (): InvoiceForm => ({
  invoiceNo: '250',
  date: formatDate(new Date()),
  purchaseOrder: '',
  quotationNo: '',
  companyName: 'Fecto Cement Ltd',
  location: 'Rawalpindi',
  gst: '',
  ntn: '',
  subtitle: 'A wide range of industrial instrument & sensing solutions',
  thankYouNote: 'THANK YOU FOR YOUR BUSINESS!',
  website: 'www.classicelectronics.com.pk',
  address: '133G St # 109 Sector G 11/3, Islamabad',
  email: 'sales@classicelectronics.com.pk',
  phonePrimary: '+92 3 111 777 510',
  phoneSecondary: '+92 321 5180308',
  directorName: 'M Fawad Younas',
});

const createInvoiceItem = (): InvoiceItem => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  categoryId: '',
  productId: '',
  productName: '',
  description: '',
  uom: 'PCS',
  quantity: 1,
  unitPrice: 0,
  remarks: '',
  picture: '',
});

const formatCurrency = (amount: number) =>
  `Rs. ${amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;

const getCategoryId = (categoryRef?: ProductCategoryRef): string => {
  if (!categoryRef) return '';
  if (typeof categoryRef === 'string') return categoryRef;
  return categoryRef._id || '';
};

const getProductDisplayName = (product: CatalogProduct): string => {
  const model = product.specifications?.model?.trim();
  return model ? `${product.name} (${model})` : product.name;
};

const getPrimaryProductImage = (product?: CatalogProduct | null): string =>
  Array.isArray(product?.images) && product.images[0] ? product.images[0] : '';

const isLikelyImagePath = (value: string): boolean => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return false;

  return (
    /^https?:\/\//i.test(trimmedValue) ||
    trimmedValue.startsWith('/') ||
    /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(trimmedValue)
  );
};

const getPictureSource = (value: string): string =>
  isLikelyImagePath(value) ? resolveAssetUrl(value) : '';

const getFrontendAssetUrl = (assetPath: string): string => {
  if (typeof window === 'undefined') {
    return assetPath;
  }

  return new URL(assetPath, window.location.origin).toString();
};

const loadImageAsPngDataUrl = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Unable to load image: ${response.status}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    try {
      return await new Promise<string>((resolve, reject) => {
        const image = document.createElement('img');

        image.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth || image.width || 1;
          canvas.height = image.naturalHeight || image.height || 1;

          const context = canvas.getContext('2d');
          if (!context) {
            reject(new Error('Unable to prepare image canvas.'));
            return;
          }

          context.drawImage(image, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };

        image.onerror = () => reject(new Error('Unable to decode image.'));
        image.src = objectUrl;
      });
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch (error) {
    console.warn('PDF image skipped:', error);
    return null;
  }
};

const buildPdfFileName = (invoiceNo: string, date: string): string => {
  const cleanInvoiceNo = invoiceNo.trim().replace(/[^a-zA-Z0-9-_]+/g, '-') || 'invoice';
  const cleanDate = date.trim().replace(/[^0-9-]+/g, '-') || 'date';

  return `sales-tax-invoice-${cleanInvoiceNo}-${cleanDate}.pdf`;
};

const SalesTaxInvoicePage = () => {
  const [form, setForm] = useState<InvoiceForm>(createInvoiceForm);
  const [items, setItems] = useState<InvoiceItem[]>([createInvoiceItem()]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadCatalog = async () => {
      setCatalogLoading(true);
      setCatalogError('');

      try {
        const [categoriesResponse, productsResponse] = await Promise.all([
          api.get('categories'),
          api.get('products', {
            params: {
              includeSpecs: '1',
            },
          }),
        ]);

        if (!isActive) return;

        const categoryList = Array.isArray(categoriesResponse.data)
          ? [...(categoriesResponse.data as AdminCategory[])].sort((first, second) =>
              first.name.localeCompare(second.name, undefined, { sensitivity: 'base' })
            )
          : [];

        const productList = Array.isArray(productsResponse.data)
          ? [...(productsResponse.data as CatalogProduct[])]
              .filter((product) => (product.status || 'active') !== 'inactive')
              .sort((first, second) =>
                first.name.localeCompare(second.name, undefined, { sensitivity: 'base' })
              )
          : [];

        setCategories(categoryList);
        setProducts(productList);
      } catch (error) {
        console.error('Failed to load invoice item catalog', error);
        if (!isActive) return;
        setCatalogError('Unable to load categories and products. Please try again shortly.');
      } finally {
        if (isActive) {
          setCatalogLoading(false);
        }
      }
    };

    loadCatalog();

    return () => {
      isActive = false;
    };
  }, []);

  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
    0
  );

  const handleFormChange = (field: keyof InvoiceForm, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleItemChange = (
    id: string,
    field: keyof Omit<InvoiceItem, 'id'>,
    value: string
  ) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === 'quantity' || field === 'unitPrice'
                  ? Number(value)
                  : value,
            }
          : item
      )
    );
  };

  const handleCategorySelect = (id: string, categoryId: string) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              categoryId,
              productId: '',
              productName: '',
              description: '',
              unitPrice: 0,
              remarks: '',
              picture: '',
            }
          : item
      )
    );
  };

  const handleProductSelect = (id: string, productId: string) => {
    const selectedProduct = products.find((product) => product._id === productId);

    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== id) return item;
        if (!selectedProduct) {
          return {
            ...item,
            productId: '',
            productName: '',
            description: '',
            unitPrice: 0,
            remarks: '',
            picture: '',
          };
        }

        const productName = getProductDisplayName(selectedProduct);

        return {
          ...item,
          categoryId: getCategoryId(selectedProduct.categoryId),
          productId: selectedProduct._id,
          productName,
          description: selectedProduct.description?.trim() || selectedProduct.name,
          unitPrice: Number(selectedProduct.price || 0),
          remarks: productName,
          picture: getPrimaryProductImage(selectedProduct),
        };
      })
    );
  };

  const handleAddItem = () => {
    setItems((currentItems) => [...currentItems, createInvoiceItem()]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((currentItems) =>
      currentItems.length === 1
        ? currentItems
        : currentItems.filter((item) => item.id !== id)
    );
  };

  const handleReset = () => {
    setForm(createInvoiceForm());
    setItems([createInvoiceItem()]);
  };

  const handleDownloadPdf = async () => {
    if (isDownloadingPdf) return;

    setIsDownloadingPdf(true);

    try {
      const { GState, jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
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

      const logoUrl = getFrontendAssetUrl('/Classic_logo.png');
      const logoDataUrl = await loadImageAsPngDataUrl(logoUrl);
      const itemImageDataUrls = await Promise.all(
        items.map((item) => {
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
        pdf.text(`SALES TAX INVOICE: ${form.invoiceNo || '---'}`, contentRightX, 15, {
          align: 'right',
        });
        pdf.setFontSize(13.2);
        pdf.text(`Date: ${form.date || '--/--/----'}`, contentRightX, 22.5, {
          align: 'right',
        });
        pdf.setFont('helvetica', 'bolditalic');
        pdf.setFontSize(10.8);
        pdf.text(`Purchase Order: ${form.purchaseOrder || '____________'}`, contentRightX, 29.5, {
          align: 'right',
        });
        pdf.text(`Quotation No: ${form.quotationNo || '____________'}`, contentRightX, 36.5, {
          align: 'right',
        });

        let cursorY = 50;

        if (withCustomerBlock) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(11);
          pdf.setTextColor(...primaryTextColor);
          pdf.text(form.companyName || 'Customer Company', contentLeftX + 1, cursorY + 7);
          pdf.text(form.location ? `${form.location}:` : 'Location:', contentLeftX + 1, cursorY + 13);
          pdf.text(`GST: ${form.gst || '________________'}`, contentLeftX + 1, cursorY + 19);
          pdf.text(`NTN: ${form.ntn || '________________'}`, contentLeftX + 1, cursorY + 25);
          cursorY += 31;
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

      if (cursorY + 58 > pageHeight - 22) {
        pdf.addPage();
        cursorY = drawPageHeader(false);
      }

      const totalBoxWidth = 56;
      const totalBoxX = contentRightX - totalBoxWidth;
      const totalBoxY = cursorY + 8;

      pdf.setDrawColor(...borderColor);
      pdf.roundedRect(totalBoxX, totalBoxY, totalBoxWidth, 18, 3, 3, 'S');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...mutedTextColor);
      pdf.text('GRAND TOTAL', totalBoxX + totalBoxWidth / 2, totalBoxY + 5.5, {
        align: 'center',
      });
      pdf.setFontSize(13);
      pdf.setTextColor(...primaryTextColor);
      pdf.text(formatCurrency(totalAmount), totalBoxX + totalBoxWidth / 2, totalBoxY + 12.5, {
        align: 'center',
      });

      const signatureNameY = totalBoxY + 8;
      const signatureLineY = totalBoxY + 10.5;
      const signatureLabelY = totalBoxY + 17.2;
      const thankYouY = Math.max(totalBoxY + 30, footerBoxY - 7);

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

      const addressLines = pdf.splitTextToSize(form.address || '', 54) as string[];

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.2);
      pdf.setTextColor(...primaryTextColor);
      pdf.text(form.website, footerBoxX + 5, footerLineOneY);
      pdf.text(addressLines.slice(0, 2), footerBoxX + 5, footerLineTwoY);

      pdf.text('NTN: 1700506', pageWidth / 2, footerLineOneY, { align: 'center' });
      pdf.text('GST: 05-07-8500-014-73', pageWidth / 2, footerLineTwoY, { align: 'center' });
      pdf.text(form.email, pageWidth / 2, footerLineThreeY, { align: 'center' });

      pdf.text(form.phonePrimary, footerBoxX + footerBoxWidth - 5, footerLineOneY, { align: 'right' });
      pdf.text(form.phoneSecondary, footerBoxX + footerBoxWidth - 5, footerLineTwoY, { align: 'right' });

      pdf.save(buildPdfFileName(form.invoiceNo, form.date));
    } catch (error) {
      console.error('Failed to download invoice PDF', error);
      alert('Unable to generate the PDF. Please try again.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const getCategoryName = (categoryId: string): string =>
    categories.find((category) => category._id === categoryId)?.name || 'Uncategorized';

  const getProductsForCategory = (categoryId: string): CatalogProduct[] =>
    products.filter((product) => getCategoryId(product.categoryId) === categoryId);

  return (
    <div className="invoice-builder-page relative isolate overflow-hidden">
      <div className="invoice-builder-bg pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-12 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-6 top-10 opacity-[0.05]">
          <Image
            src="/Classic_logo.png"
            alt=""
            width={360}
            height={140}
            className="h-auto w-[280px] sm:w-[360px]"
          />
        </div>
        <div className="absolute bottom-16 left-[28%] opacity-[0.04]">
          <Image
            src="/Classic_logo.png"
            alt=""
            width={500}
            height={190}
            className="h-auto w-[320px] sm:w-[500px]"
          />
        </div>
      </div>

      <div className="space-y-6">
      <div className="invoice-builder-toolbar flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            <FileText size={14} />
            Invoice Builder
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white">Sales Tax Invoice Page</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            A live invoice builder inside the admin panel. Update values on the left
            and review the invoice preview on the right.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
          >
            <RotateCcw size={16} />
            Reset
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDownloadingPdf ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {isDownloadingPdf ? 'Preparing PDF...' : 'Download PDF'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <Printer size={16} />
            Print Preview
          </button>
        </div>
      </div>

      <div className="invoice-builder-grid grid gap-6 2xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="invoice-builder-editor space-y-5">
          <section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 shadow-xl">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <BadgeDollarSign size={16} />
              Document Details
            </div>

            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-1">
              <Field
                label="Invoice No"
                value={form.invoiceNo}
                onChange={(value) => handleFormChange('invoiceNo', value)}
              />
              <Field
                label="Date"
                value={form.date}
                onChange={(value) => handleFormChange('date', value)}
              />
              <Field
                label="Purchase Order"
                value={form.purchaseOrder}
                onChange={(value) => handleFormChange('purchaseOrder', value)}
              />
              <Field
                label="Quotation No"
                value={form.quotationNo}
                onChange={(value) => handleFormChange('quotationNo', value)}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 shadow-xl">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <Building2 size={16} />
              Customer Details
            </div>

            <div className="space-y-4">
              <Field
                label="Company Name"
                value={form.companyName}
                onChange={(value) => handleFormChange('companyName', value)}
              />
              <Field
                label="Location"
                value={form.location}
                onChange={(value) => handleFormChange('location', value)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="GST"
                  value={form.gst}
                  onChange={(value) => handleFormChange('gst', value)}
                />
                <Field
                  label="NTN"
                  value={form.ntn}
                  onChange={(value) => handleFormChange('ntn', value)}
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
                <CalendarDays size={16} />
                Invoice Items
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
              >
                <Plus size={14} />
                Add Item
              </button>
            </div>

            <div className="mb-4 rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
              {catalogLoading ? (
                <div className="flex items-center gap-2 text-cyan-300">
                  <Loader2 size={16} className="animate-spin" />
                  Loading categories and items...
                </div>
              ) : catalogError ? (
                <div className="text-rose-300">{catalogError}</div>
              ) : (
                <div>
                  <span className="font-semibold text-white">{categories.length}</span> categories and{' '}
                  <span className="font-semibold text-white">{products.length}</span> products are ready.
                </div>
              )}
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Item {index + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={items.length === 1}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-rose-300 transition hover:text-rose-200 disabled:cursor-not-allowed disabled:text-slate-600"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <SelectField
                        label="Category"
                        value={item.categoryId}
                        onChange={(value) => handleCategorySelect(item.id, value)}
                        options={categories.map((category) => ({
                          label: category.name,
                          value: category._id,
                        }))}
                        placeholder={catalogLoading ? 'Loading categories...' : 'Select category'}
                        disabled={catalogLoading || categories.length === 0}
                      />
                      <SelectField
                        label="Item"
                        value={item.productId}
                        onChange={(value) => handleProductSelect(item.id, value)}
                        options={getProductsForCategory(item.categoryId).map((product) => ({
                          label: getProductDisplayName(product),
                          value: product._id,
                        }))}
                        placeholder={
                          item.categoryId ? 'Select product' : 'Select category first'
                        }
                        disabled={
                          catalogLoading ||
                          !item.categoryId ||
                          getProductsForCategory(item.categoryId).length === 0
                        }
                      />
                    </div>

                    {item.categoryId && getProductsForCategory(item.categoryId).length === 0 ? (
                      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                        No products are currently available in this category.
                      </div>
                    ) : null}

                    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-3">
                      <div className="flex gap-4">
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
                          {getPictureSource(item.picture) ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={getPictureSource(item.picture)}
                              alt={item.productName || item.description || 'Selected product'}
                              className="h-full w-full object-contain p-2"
                            />
                          ) : (
                            <span className="px-3 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                              No Image
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                            Selected Product
                          </div>
                          <div className="mt-1 text-base font-semibold text-white">
                            {item.productName || 'Select a category and item'}
                          </div>
                          <div className="mt-1 text-sm text-slate-400">
                            {item.categoryId ? getCategoryName(item.categoryId) : 'No category selected'}
                          </div>
                          <div className="mt-3 text-sm font-semibold text-cyan-300">
                            Unit Price: {formatCurrency(item.unitPrice || 0)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Field
                      label="Description"
                      value={item.description}
                      onChange={(value) =>
                        handleItemChange(item.id, 'description', value)
                      }
                    />
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Field
                        label="UOM"
                        value={item.uom}
                        onChange={(value) => handleItemChange(item.id, 'uom', value)}
                      />
                      <Field
                        label="Quantity"
                        type="number"
                        value={String(item.quantity)}
                        onChange={(value) =>
                          handleItemChange(item.id, 'quantity', value)
                        }
                      />
                      <Field
                        label="Unit Price"
                        type="number"
                        value={String(item.unitPrice)}
                        onChange={(value) =>
                          handleItemChange(item.id, 'unitPrice', value)
                        }
                      />
                    </div>
                    <Field
                      label="Remarks"
                      value={item.remarks}
                      onChange={(value) => handleItemChange(item.id, 'remarks', value)}
                    />
                    <Field
                      label="Picture URL / Reference"
                      value={item.picture}
                      onChange={(value) => handleItemChange(item.id, 'picture', value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 shadow-xl">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <Mail size={16} />
              Footer Details
            </div>

            <div className="space-y-4">
              <Field
                label="Thank You Note"
                value={form.thankYouNote}
                onChange={(value) => handleFormChange('thankYouNote', value)}
              />
              <Field
                label="Subtitle"
                value={form.subtitle}
                onChange={(value) => handleFormChange('subtitle', value)}
              />
              <Field
                label="Website"
                value={form.website}
                onChange={(value) => handleFormChange('website', value)}
              />
              <Field
                label="Address"
                value={form.address}
                onChange={(value) => handleFormChange('address', value)}
              />
              <Field
                label="Email"
                value={form.email}
                onChange={(value) => handleFormChange('email', value)}
              />
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                <Field
                  label="Primary Phone"
                  value={form.phonePrimary}
                  onChange={(value) => handleFormChange('phonePrimary', value)}
                />
                <Field
                  label="Secondary Phone"
                  value={form.phoneSecondary}
                  onChange={(value) => handleFormChange('phoneSecondary', value)}
                />
              </div>
              <Field
                label="Director Name"
                value={form.directorName}
                onChange={(value) => handleFormChange('directorName', value)}
              />
            </div>
          </section>
        </div>

        <section className="invoice-print-panel rounded-[32px] border border-slate-800 bg-[#0b1120] p-3 shadow-[0_25px_60px_rgba(15,23,42,0.5)]">
          <div
            className="invoice-print-sheet mx-auto flex min-h-[1120px] w-full max-w-[760px] flex-col rounded-[28px] bg-white px-5 py-4 text-slate-900 sm:px-6 sm:py-5"
            style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
          >
            <div className="flex items-start justify-between gap-6">
              <div className="max-w-[210px] shrink-0">
                <Image
                  src="/Classic_logo.png"
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
                  Sales Tax Invoice: {form.invoiceNo || '---'}
                </div>
                <div className="mt-1 text-[15px] font-black leading-[1.08] text-slate-950 sm:text-[17px]">
                  Date: {form.date || '--/--/----'}
                </div>
                <div className="mt-2 w-full space-y-1">
                  <div className="text-[14px] font-black italic leading-[1.12] text-slate-950 sm:text-[15px]">
                    Purchase Order: {form.purchaseOrder || '____________'}
                  </div>
                  <div className="text-[14px] font-black italic leading-[1.12] text-slate-950 sm:text-[15px]">
                    Quotation No: {form.quotationNo || '____________'}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="relative mt-5 flex flex-1 flex-col overflow-hidden rounded-[34px] border-2 border-violet-600 bg-white px-4 pb-5 pt-8 sm:px-5"
              style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
            >
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.08]">
                <Image
                  src="/Classic_logo.png"
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
                  <div>GST: {form.gst || '________________'}</div>
                  <div>NTN: {form.ntn || '________________'}</div>
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
                        const itemTotal =
                          Number(item.quantity || 0) * Number(item.unitPrice || 0);

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
                                {getPictureSource(item.picture) ? (
                                  <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={getPictureSource(item.picture)}
                                      alt={item.productName || item.description || 'Invoice item'}
                                      className="h-16 w-full object-contain bg-white p-1.5"
                                    />
                                  </div>
                                ) : item.picture ? (
                                  <div className="rounded-lg border border-dashed border-slate-300 px-2 py-3 text-[11px] text-slate-500">
                                    {item.picture}
                                  </div>
                                ) : (
                                  <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-slate-300 text-[11px] text-slate-400">
                                    No picture selected
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
                  <div className="w-full max-w-[200px] rounded-[16px] border-2 border-slate-950 bg-white px-4 py-3 text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                      Grand Total
                    </div>
                    <div className="mt-1 text-[18px] font-black text-slate-950 sm:text-[20px]">
                      {formatCurrency(totalAmount)}
                    </div>
                  </div>
                </div>

                <div className="flex-1" />

                <div className="pt-10 text-right">
                  <div className="text-base font-bold text-violet-700 sm:text-[20px]">
                    {form.thankYouNote}
                  </div>
                </div>

                <div className="mt-4 rounded-[22px] border-2 border-violet-600 bg-white/85 px-4 py-3">
                  <div className="pb-2 text-center text-[12px] font-semibold text-slate-900 sm:text-[13px]">
                    {form.subtitle}
                  </div>
                  <div className="grid gap-3 border-t border-violet-200 pt-3 md:grid-cols-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-cyan-100 p-2.5 text-cyan-700">
                        <Globe size={18} />
                      </div>
                      <div>
                        <div className="text-[15px] font-semibold text-slate-900">
                          {form.website}
                        </div>
                        <div className="mt-1 text-xs leading-relaxed text-slate-600">
                          {form.address}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-violet-100 p-2.5 text-violet-700">
                        <Mail size={18} />
                      </div>
                      <div className="text-xs leading-relaxed text-slate-600">
                        <div>NTN: 1700506</div>
                        <div>GST: 05-07-8500-014-73</div>
                        <div className="mt-1 font-medium text-slate-900">{form.email}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
                        <Phone size={18} />
                      </div>
                      <div>
                        <div className="text-[15px] font-semibold text-slate-900">
                          {form.phonePrimary}
                        </div>
                        <div className="mt-1 text-xs text-slate-600">{form.phoneSecondary}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
    </div>
      </div>
    </div>
  );
};

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
};

const Field = ({ label, value, onChange, type = 'text' }: FieldProps) => (
  <label className="block">
    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
      {label}
    </span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
    />
  </label>
);

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder: string;
  disabled?: boolean;
};

const SelectField = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: SelectFieldProps) => (
  <label className="block">
    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
      {label}
    </span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:text-slate-500"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

export default SalesTaxInvoicePage;
