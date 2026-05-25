import type { SalesDocumentRecord } from '@/services/api';
import type { AdminProduct } from '@/types/adminProduct';

export type CatalogProduct = AdminProduct & {
  slug?: string;
};

export type InvoiceItem = {
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
  showPicture: boolean;
};

export type InvoiceForm = {
  invoiceNo: string;
  date: string;
  purchaseOrder: string;
  quotationNo: string;
  companyName: string;
  customerAbbreviation: string;
  location: string;
  customerAddress1: string;
  customerAddress2: string;
  customerCity: string;
  customerPhone: string;
  gst: string;
  ntn: string;
  subtitle: string;
  thankYouNote: string;
  showQuotationTaxNotice: boolean;
  showQuotationTerms: boolean;
  invoiceTaxNotice: string;
  invoiceTermsTitle: string;
  invoiceTermsLine1: string;
  invoiceTermsLine2: string;
  deliveryPeriod: string;
  validityDate: string;
  website: string;
  address: string;
  email: string;
  phonePrimary: string;
  phoneSecondary: string;
  directorName: string;
  billIssuerName: string;
};

export type DocumentType = 'quotation' | 'invoice' | 'deliveryChallan' | 'bill';
export type InvoiceHistoryRecord = SalesDocumentRecord<InvoiceForm, Omit<InvoiceItem, 'id'> & { id?: string }>;
export type HistorySortBy = 'createdAt' | 'date' | 'documentNo' | 'customerName' | 'totalAmount';
export type HistorySortOrder = 'asc' | 'desc';
