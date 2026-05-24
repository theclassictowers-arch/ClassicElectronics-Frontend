import { resolveAssetUrl } from '@/lib/apiConfig';
import type { ProductCategoryRef } from '@/types/adminProduct';
import type {
  CatalogProduct,
  DocumentType,
  InvoiceForm,
  InvoiceHistoryRecord,
  InvoiceItem,
} from './types';

export const GST_REGISTRATION_PLACEHOLDER = '00-00-0000-000-00';
export const CUSTOMER_GST_PLACEHOLDER = '02-04-2523-002-46';
export const CUSTOMER_NTN_PLACEHOLDER = '0701669-7';
export const SALES_TAX_RATE = 0.18;

export const deliveryPeriodOptions = [
  { label: '1 Week', value: '1 Week' },
  { label: '2 Weeks', value: '2 Weeks' },
  { label: '3 Weeks', value: '3 Weeks' },
  { label: '4 Weeks', value: '4 Weeks' },
  { label: '1 Month', value: '1 Month' },
  { label: '2 Months', value: '2 Months' },
  { label: '3 Months', value: '3 Months' },
  { label: '4 Months', value: '4 Months' },
];

export const documentTypes: Array<{
  type: DocumentType;
  label: string;
  title: string;
  pdfTitle: string;
  numberLabel: string;
  purchaseLabel: string;
  referenceLabel: string;
  fileSlug: string;
}> = [
  {
    type: 'quotation',
    label: 'Quotation',
    title: 'Quotation Page',
    pdfTitle: 'QUOTATION',
    numberLabel: 'Quotation No',
    purchaseLabel: 'Indent No',
    referenceLabel: 'Enquiry No',
    fileSlug: 'quotation',
  },
  {
    type: 'invoice',
    label: 'Invoice',
    title: 'Sales Tax Invoice Page',
    pdfTitle: 'SALES TAX INVOICE',
    numberLabel: 'Invoice No',
    purchaseLabel: 'Purchase Order',
    referenceLabel: 'Quotation No',
    fileSlug: 'sales-tax-invoice',
  },
  {
    type: 'deliveryChallan',
    label: 'Delivery Challan',
    title: 'Delivery Challan Page',
    pdfTitle: 'DELIVERY CHALLAN',
    numberLabel: 'Delivery Challan No',
    purchaseLabel: 'PO',
    referenceLabel: 'Invoice / PO Ref',
    fileSlug: 'delivery-challan',
  },
  {
    type: 'bill',
    label: 'Bill',
    title: 'Bill Page',
    pdfTitle: 'BILL',
    numberLabel: 'Bill No',
    purchaseLabel: 'Purchase Order',
    referenceLabel: 'Reference No',
    fileSlug: 'bill',
  },
];

export const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const toDateInputValue = (value: string): string => {
  const trimmedValue = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  const match = trimmedValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return '';

  const [, day, month, year] = match;

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

export const fromDateInputValue = (value: string): string => {
  if (!value) return '';

  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
};

export const formatGstRegistration = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  const groups = [
    digits.slice(0, 2),
    digits.slice(2, 4),
    digits.slice(4, 8),
    digits.slice(8, 11),
    digits.slice(11, 13),
  ].filter(Boolean);

  return groups.join('-');
};

export const normalizeCustomerGst = (value: string): string =>
  value.trim() === '18' ? '' : formatGstRegistration(value);

export const formatClassicPhoneDisplay = (value: string, fallback: string): string => {
  const digits = value.replace(/\D/g, '');

  if (digits === '923111777510' || digits === '03111777510' || digits === '3111777510') {
    return '+923 111 777 510';
  }

  if (digits === '923215180308' || digits === '03215180308' || digits === '3215180308') {
    return '+923 215 180 308';
  }

  return value.trim() || fallback;
};

export const formatNtnNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  const groups = [digits.slice(0, 7), digits.slice(7, 8)].filter(Boolean);

  return groups.join('-');
};

export const formatDigitsOnly = (value: string, maxLength?: number): string => {
  const digits = value.replace(/\D/g, '');
  return typeof maxLength === 'number' ? digits.slice(0, maxLength) : digits;
};

export const createInvoiceForm = (): InvoiceForm => ({
  invoiceNo: '250',
  date: formatDate(new Date()),
  purchaseOrder: '',
  quotationNo: '',
  companyName: '',
  customerAbbreviation: '',
  location: '',
  customerAddress1: '',
  customerAddress2: '',
  customerCity: '',
  customerPhone: '',
  gst: '',
  ntn: '',
  subtitle: 'A wide range of industrial instrument & sensing solutions',
  thankYouNote: 'THANK YOU FOR YOUR BUSINESS!',
  showQuotationTaxNotice: true,
  showQuotationTerms: true,
  deliveryPeriod: '4 Weeks',
  validityDate: '1 WEEK',
  website: 'www.classicelectronics.com.pk',
  address: '133G St # 109 Sector G 11/3, Islamabad',
  email: 'sales@classicelectronics.com.pk',
  phonePrimary: '+923 111 777 510',
  phoneSecondary: '+923 215 180 308',
  directorName: 'M Fawad Younas',
});

export const getCustomerAddressParts = (form: InvoiceForm) => {
  const address1 = form.customerAddress1?.trim() || form.location?.trim() || '';
  const address2 = form.customerAddress2?.trim() || '';
  const city = form.customerCity?.trim() || '';
  const phone = form.customerPhone?.trim() || '';

  return {
    name: form.companyName?.trim() || 'Customer Name',
    address1,
    address2,
    city,
    phone,
    gst: form.gst?.trim() || '',
    ntn: form.ntn?.trim() || '',
  };
};

export const getCustomerDetailRows = (
  form: InvoiceForm,
  options: { includeTaxIds?: boolean } = {}
): Array<[string, string]> => {
  const details = getCustomerAddressParts(form);
  const rows: Array<[string, string]> = [
    ['', details.name],
    ['', details.address1 || 'Customer Address'],
    ['', details.address2 || ''],
    ['', details.city],
    ['Tel:', details.phone],
  ];

  if (options.includeTaxIds !== false) {
    rows.push(['GST:', details.gst || '________________']);
    rows.push(['NTN:', details.ntn || '________________']);
  }

  return rows;
};

export const createInvoiceItem = (): InvoiceItem => ({
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
  showPicture: true,
});

export const formatCurrency = (amount: number) =>
  `Rs. ${amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;

export const getHistorySearchPlaceholder = (documentType: DocumentType): string =>
  documentType === 'quotation'
    ? 'Search number, customer, date, indent, enquiry...'
    : 'Search number, customer, date, PO, quotation...';

export const getHistoryReferenceText = (record: InvoiceHistoryRecord): string => {
  if (record.documentType === 'quotation') {
    const parts = [
      record.form?.purchaseOrder ? `Indent: ${record.form.purchaseOrder}` : '',
      record.form?.quotationNo ? `Enquiry: ${record.form.quotationNo}` : '',
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(' | ') : 'No indent/enquiry';
  }

  return record.form?.purchaseOrder ? `PO: ${record.form.purchaseOrder}` : 'No PO';
};

export const getCategoryId = (categoryRef?: ProductCategoryRef): string => {
  if (!categoryRef) return '';
  if (typeof categoryRef === 'string') return categoryRef;
  return categoryRef._id || '';
};

export const getProductDisplayName = (product: CatalogProduct): string => {
  const model = product.specifications?.model?.trim();
  return model ? `${product.name} (${model})` : product.name;
};

export const getPrimaryProductImage = (product?: CatalogProduct | null): string =>
  Array.isArray(product?.images) && product.images[0] ? product.images[0] : '';

export const isLikelyImagePath = (value: string): boolean => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return false;

  return (
    /^https?:\/\//i.test(trimmedValue) ||
    /^data:image\//i.test(trimmedValue) ||
    trimmedValue.startsWith('/') ||
    /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(trimmedValue)
  );
};

export const getPictureSource = (value: string): string =>
  /^data:image\//i.test(value.trim())
    ? value.trim()
    : isLikelyImagePath(value)
      ? resolveAssetUrl(value)
      : '';

export const getFrontendAssetUrl = (assetPath: string): string => {
  if (typeof window === 'undefined') {
    return assetPath;
  }

  return new URL(assetPath, window.location.origin).toString();
};

export const loadImageAsPngDataUrl = async (
  url: string,
  options: { transparentWhite?: boolean; whiteBackground?: boolean } = {}
): Promise<string | null> => {
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

          if (options.whiteBackground) {
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);
          }

          context.drawImage(image, 0, 0);

          if (options.transparentWhite) {
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const { data } = imageData;

            for (let index = 0; index < data.length; index += 4) {
              if (data[index] > 245 && data[index + 1] > 245 && data[index + 2] > 245) {
                data[index + 3] = 0;
              }
            }

            context.putImageData(imageData, 0, 0);
          }

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

export const buildPdfFileName = (fileSlug: string, documentNo: string, date: string): string => {
  const cleanDocumentNo = documentNo.trim().replace(/[^a-zA-Z0-9-_]+/g, '-') || 'document';
  const cleanDate = date.trim().replace(/[^0-9-]+/g, '-') || 'date';

  return `${fileSlug}-${cleanDocumentNo}-${cleanDate}.pdf`;
};

export const buildSalesPdfFileName = (documentType: DocumentType, form: InvoiceForm): string => {
  const cleanPart = (value: string, fallback = '') =>
    (value || fallback).trim().replace(/[^a-zA-Z0-9]+/g, '') || fallback;
  const documentNo = cleanPart(form.invoiceNo, 'document');
  const abbreviation = cleanPart(form.customerAbbreviation);
  const purchaseOrder = cleanPart(form.purchaseOrder);
  const prefixByType: Record<DocumentType, string> = {
    quotation: 'Q',
    deliveryChallan: 'D',
    invoice: 'I',
    bill: 'B',
  };

  if (documentType === 'bill') {
    return `${prefixByType[documentType]}${documentNo}.pdf`;
  }

  return `${prefixByType[documentType]}${documentNo}${abbreviation}${purchaseOrder}.pdf`;
};

export const normalizeHistoryItems = (
  documentItems: InvoiceHistoryRecord['items']
): InvoiceItem[] => {
  if (!Array.isArray(documentItems) || documentItems.length === 0) {
    return [createInvoiceItem()];
  }

  return documentItems.map((item, index) => ({
    id: item.id || `history-${Date.now()}-${index}`,
    categoryId: item.categoryId || '',
    productId: item.productId || '',
    productName: item.productName || '',
    description: item.description || '',
    uom: item.uom || 'PCS',
    quantity: Number(item.quantity || 0),
    unitPrice: Number(item.unitPrice || 0),
    remarks: item.remarks || '',
    picture: item.picture || '',
    showPicture: item.showPicture !== false,
  }));
};
