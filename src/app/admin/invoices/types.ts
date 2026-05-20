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
  location: string;
  gst: string;
  ntn: string;
  subtitle: string;
  thankYouNote: string;
  deliveryPeriod: string;
  website: string;
  address: string;
  email: string;
  phonePrimary: string;
  phoneSecondary: string;
  directorName: string;
};

export type DocumentType = 'quotation' | 'invoice' | 'deliveryChallan' | 'bill';
export type InvoiceHistoryRecord = SalesDocumentRecord<InvoiceForm, Omit<InvoiceItem, 'id'> & { id?: string }>;
export type HistorySortBy = 'createdAt' | 'date' | 'documentNo' | 'customerName' | 'totalAmount';
export type HistorySortOrder = 'asc' | 'desc';
