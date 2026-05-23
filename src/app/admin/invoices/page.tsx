'use client';

import { useEffect, useState } from 'react';
import api, {
  createCustomer,
  createSalesDocument,
  getCustomers,
  getSalesDocuments,
  updateCustomer,
  updateSalesDocument,
} from '@/services/api';
import type { CustomerPayload, CustomerRecord } from '@/services/api';
import type { AdminCategory } from '@/types/adminCategory';
import { BuilderBackground, BuilderHeader } from './components/BuilderHeader';
import { DeliveryChallanPreview } from './components/DeliveryChallanPreview';
import { CustomerDetailsSection, DocumentDetailsSection } from './components/EditorSections';
import { FooterDetailsSection } from './components/FooterDetailsSection';
import { HistoryModal } from './components/HistoryModal';
import { ItemsSection } from './components/ItemsSection';
import { QuotationPreview } from './components/QuotationPreview';
import { StandardDocumentPreview } from './components/StandardDocumentPreview';
import { downloadInvoicePdf } from './pdfGenerator';
import type {
  CatalogProduct,
  DocumentType,
  HistorySortBy,
  HistorySortOrder,
  InvoiceForm,
  InvoiceHistoryRecord,
  InvoiceItem,
} from './types';
import {
  createInvoiceForm,
  createInvoiceItem,
  documentTypes,
  formatNtnNumber,
  getCategoryId,
  getPrimaryProductImage,
  getProductDisplayName,
  normalizeCustomerGst,
  normalizeHistoryItems,
} from './utils';

const SalesTaxInvoicePage = () => {
  const [activeDocumentType, setActiveDocumentType] = useState<DocumentType>('invoice');
  const [form, setForm] = useState<InvoiceForm>(createInvoiceForm);
  const [items, setItems] = useState<InvoiceItem[]>([createInvoiceItem()]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerStatus, setCustomerStatus] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSavingDocument, setIsSavingDocument] = useState(false);
  const [savedDocumentId, setSavedDocumentId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyDocumentType, setHistoryDocumentType] = useState<DocumentType>('invoice');
  const [historySearch, setHistorySearch] = useState('');
  const [historySortBy, setHistorySortBy] = useState<HistorySortBy>('createdAt');
  const [historySortOrder, setHistorySortOrder] = useState<HistorySortOrder>('desc');
  const [historyRecords, setHistoryRecords] = useState<InvoiceHistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const activeDocument =
    documentTypes.find((documentType) => documentType.type === activeDocumentType) ||
    documentTypes[1];
  const historyDocument =
    documentTypes.find((documentType) => documentType.type === historyDocumentType) ||
    documentTypes[1];

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

  const getNextSequenceValue = (value: string): string => {
    const textValue = String(value || '').trim();
    if (!textValue) return '';

    const matches = [...textValue.matchAll(/\d+/g)];
    const lastMatch = matches[matches.length - 1];
    if (!lastMatch) return textValue;

    const numericText = lastMatch[0];
    const nextNumber = String(Number(numericText) + 1).padStart(numericText.length, '0');
    const startIndex = lastMatch.index || 0;

    return `${textValue.slice(0, startIndex)}${nextNumber}${textValue.slice(startIndex + numericText.length)}`;
  };

  const loadNextQuotationNumber = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const [latestQuotation] = await getSalesDocuments<InvoiceForm, InvoiceHistoryRecord['items'][number]>(
        token,
        'quotation',
        {
          limit: 1,
          sortBy: 'createdAt',
          order: 'desc',
        }
      );

      const latestNumber = latestQuotation?.form?.invoiceNo || latestQuotation?.documentNo || '';
      const nextNumber = getNextSequenceValue(latestNumber);
      if (!nextNumber) return;

      setForm((currentForm) => ({
        ...currentForm,
        invoiceNo: nextNumber,
      }));
    } catch (error) {
      console.error('Failed to load next quotation number', error);
    }
  };

  useEffect(() => {
    if (activeDocumentType === 'quotation' && !savedDocumentId) {
      void loadNextQuotationNumber();
    }
  }, [activeDocumentType, savedDocumentId]);

  const handleFormChange = (field: keyof InvoiceForm, value: string | boolean) => {
    setSaveStatus('');
    setCustomerStatus('');
    if (typeof value === 'boolean') {
      setForm((currentForm) => ({
        ...currentForm,
        [field]: value,
      }));
      return;
    }

    if (
      field === 'companyName' ||
      field === 'customerAbbreviation' ||
      field === 'location' ||
      field === 'customerAddress1' ||
      field === 'customerAddress2' ||
      field === 'customerCity' ||
      field === 'customerPhone'
    ) {
      setSelectedCustomerId('');
    }
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
      ...(field === 'customerAddress1' ? { location: value } : {}),
      ...(field === 'location' && !currentForm.customerAddress1 ? { customerAddress1: value } : {}),
    }));
  };

  const loadCustomers = async () => {
    const token = localStorage.getItem('adminToken');

    if (!token) return;

    setCustomerLoading(true);
    setCustomerStatus('');

    try {
      const customerList = await getCustomers(token, { status: 'active', limit: 500 });
      setCustomers(customerList);
    } catch (error) {
      console.error('Failed to load customers', error);
      setCustomerStatus('Unable to load saved customers.');
    } finally {
      setCustomerLoading(false);
    }
  };

  useEffect(() => {
    void loadCustomers();
  }, []);

  const buildCustomerPayload = (): CustomerPayload => ({
    name: form.companyName.trim(),
    abbreviation: form.customerAbbreviation.trim(),
    location: [form.customerAddress1, form.customerAddress2, form.customerCity]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(', ') || form.location.trim(),
    location1: (form.customerAddress1 || form.location).trim(),
    location2: form.customerAddress2.trim(),
    city: form.customerCity.trim(),
    country: 'Pakistan',
    gst: normalizeCustomerGst(form.gst).trim(),
    ntn: formatNtnNumber(form.ntn).trim(),
    email: '',
    phonePrimary: form.customerPhone.trim(),
    phoneSecondary: '',
    status: 'active',
  });

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setCustomerStatus('');

    const customer = customers.find((item) => item._id === customerId);
    if (!customer) return;
    const address1 = customer.location1 || customer.location || '';
    const address2 = customer.location2 || '';
    const city = customer.city || '';
    const phone = customer.phonePrimary || customer.phoneSecondary || '';
    const customerLocation = [address1, address2, city, customer.country].filter(Boolean).join(', ');

    setForm((currentForm) => ({
      ...currentForm,
      companyName: customer.name || '',
      customerAbbreviation: customer.abbreviation || '',
      location: customerLocation,
      customerAddress1: address1,
      customerAddress2: address2,
      customerCity: city,
      customerPhone: phone,
      gst: customer.gst ? normalizeCustomerGst(customer.gst) : '',
      ntn: customer.ntn ? formatNtnNumber(customer.ntn) : '',
    }));
  };

  const handleSaveCustomer = async () => {
    const token = localStorage.getItem('adminToken');

    if (!token) {
      alert('Please login as admin first');
      return;
    }

    const payload = buildCustomerPayload();

    if (!payload.name) {
      alert('Please enter company name first');
      return;
    }

    setCustomerLoading(true);
    setCustomerStatus('');

    try {
      const normalizedName = payload.name.trim().toLowerCase();
      const normalizedLocation = (payload.location || '').trim().toLowerCase();
      const existingCustomer = customers.find(
        (customer) =>
          customer.name.trim().toLowerCase() === normalizedName &&
          (customer.location || '').trim().toLowerCase() === normalizedLocation
      );
      const customerIdToUpdate = selectedCustomerId || existingCustomer?._id || '';
      const savedCustomer = customerIdToUpdate
        ? await updateCustomer(token, customerIdToUpdate, payload)
        : await createCustomer(token, payload);

      setSelectedCustomerId(savedCustomer._id);
      setCustomers((currentCustomers) => {
        const exists = currentCustomers.some((customer) => customer._id === savedCustomer._id);
        const nextCustomers = exists
          ? currentCustomers.map((customer) =>
              customer._id === savedCustomer._id ? savedCustomer : customer
            )
          : [...currentCustomers, savedCustomer];

        return nextCustomers.sort((first, second) =>
          first.name.localeCompare(second.name, undefined, { sensitivity: 'base' })
        );
      });
      setCustomerStatus('Customer saved.');
    } catch (error) {
      const maybeApiError = error as { response?: { status?: number; data?: { message?: string } } };
      if (maybeApiError.response?.status === 409) {
        setCustomerStatus(maybeApiError.response.data?.message || 'Customer already exists.');
        await loadCustomers();
        return;
      }
      console.error('Failed to save customer', error);
      alert('Unable to save customer. Maybe this customer already exists.');
    } finally {
      setCustomerLoading(false);
    }
  };

  const handleItemChange = (
    id: string,
    field: keyof Omit<InvoiceItem, 'id'>,
    value: string | boolean
  ) => {
    setSaveStatus('');
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === 'quantity' || field === 'unitPrice'
                  ? Number(value)
                  : field === 'showPicture'
                    ? value === true || value === 'true'
                  : value,
            }
          : item
      )
    );
  };

  const handleItemPictureFile = (id: string, file?: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      handleItemChange(id, 'picture', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCategorySelect = (id: string, categoryId: string) => {
    setSaveStatus('');
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
              showPicture: true,
            }
          : item
      )
    );
  };

  const handleProductSelect = (id: string, productId: string) => {
    setSaveStatus('');
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
            showPicture: true,
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
          showPicture: true,
        };
      })
    );
  };

  const handleAddItem = () => {
    setSaveStatus('');
    setItems((currentItems) => [...currentItems, createInvoiceItem()]);
  };

  const handleRemoveItem = (id: string) => {
    setSaveStatus('');
    setItems((currentItems) =>
      currentItems.length === 1
        ? currentItems
        : currentItems.filter((item) => item.id !== id)
    );
  };

  const handleReset = () => {
    setForm(createInvoiceForm());
    setItems([createInvoiceItem()]);
    setSavedDocumentId(null);
    setSaveStatus('');
  };

  const handleDocumentTypeChange = (documentType: DocumentType) => {
    setActiveDocumentType(documentType);
    setSavedDocumentId(null);
    setSaveStatus('');
  };

  const loadHistory = async (
    documentType = historyDocumentType,
    search = historySearch,
    sortBy = historySortBy,
    sortOrder = historySortOrder
  ) => {
    const token = localStorage.getItem('adminToken');

    if (!token) {
      alert('Please login as admin first');
      return;
    }

    setHistoryLoading(true);
    setHistoryError('');

    try {
      const documents = await getSalesDocuments<InvoiceForm, InvoiceHistoryRecord['items'][number]>(
        token,
        documentType,
        {
          q: search.trim(),
          limit: 150,
          sortBy,
          order: sortOrder,
        }
      );
      setHistoryRecords(documents as InvoiceHistoryRecord[]);
    } catch (error) {
      console.error('Failed to load document history', error);
      setHistoryError('Unable to load history. Please try again.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenHistory = () => {
    setHistoryDocumentType(activeDocumentType);
    setIsHistoryOpen(true);
    void loadHistory(activeDocumentType);
  };

  const handleHistoryDocumentTypeChange = (documentType: DocumentType) => {
    setHistoryDocumentType(documentType);
    void loadHistory(documentType, historySearch, historySortBy, historySortOrder);
  };

  const handleHistorySortChange = (sortBy: HistorySortBy, sortOrder = historySortOrder) => {
    setHistorySortBy(sortBy);
    setHistorySortOrder(sortOrder);
    void loadHistory(historyDocumentType, historySearch, sortBy, sortOrder);
  };

  const handleHistorySortOrderChange = (sortOrder: HistorySortOrder) => {
    setHistorySortOrder(sortOrder);
    void loadHistory(historyDocumentType, historySearch, historySortBy, sortOrder);
  };

  const handleLoadHistoryRecord = (record: InvoiceHistoryRecord) => {
    setActiveDocumentType(record.documentType);
    setForm({ ...createInvoiceForm(), ...(record.form as InvoiceForm) });
    setItems(normalizeHistoryItems(record.items));
    setSavedDocumentId(record._id);
    setSaveStatus(`${documentTypes.find((item) => item.type === record.documentType)?.label || 'Document'} loaded from history.`);
    setIsHistoryOpen(false);
  };

  const handleSaveDocument = async () => {
    const token = localStorage.getItem('adminToken');

    if (!token) {
      alert('Please login as admin first');
      return;
    }

    if (activeDocumentType === 'quotation') {
      const hasCustomer =
        form.companyName.trim() && (form.customerAddress1.trim() || form.location.trim());
      const hasProduct = items.some(
        (item) =>
          item.productId.trim() &&
          (item.productName.trim() || item.description.trim()) &&
          Number(item.quantity || 0) > 0
      );

      if (!hasCustomer) {
        setSaveStatus('Please add customer name and location before saving quotation.');
        alert('Please add customer details before saving quotation.');
        return;
      }

      if (!hasProduct) {
        setSaveStatus('Please select at least one product before saving quotation.');
        alert('Please select at least one product before saving quotation.');
        return;
      }
    }

    setIsSavingDocument(true);
    setSaveStatus('');

    try {
      const payload = {
        documentType: activeDocumentType,
        form,
        items,
        totalAmount,
      };
      const savedDocument = savedDocumentId
        ? await updateSalesDocument(token, savedDocumentId, payload)
        : await createSalesDocument(token, payload);

      setSavedDocumentId(savedDocument._id);
      setForm({ ...createInvoiceForm(), ...(savedDocument.form as InvoiceForm) });
      setSaveStatus(`${activeDocument.label} saved to backend.`);
      await loadCustomers();
    } catch (error) {
      console.error('Failed to save document', error);
      alert('Unable to save this document. Please try again.');
    } finally {
      setIsSavingDocument(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (isDownloadingPdf) return;

    setIsDownloadingPdf(true);

    try {
      await downloadInvoicePdf({
        activeDocumentType,
        activeDocument,
        form,
        items,
        totalAmount,
      });
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
      <BuilderBackground />

      <div className="space-y-6">
        <BuilderHeader
          activeDocument={activeDocument}
          activeDocumentType={activeDocumentType}
          isDownloadingPdf={isDownloadingPdf}
          isSavingDocument={isSavingDocument}
          saveStatus={saveStatus}
          onDocumentTypeChange={handleDocumentTypeChange}
          onDownloadPdf={handleDownloadPdf}
          onOpenHistory={handleOpenHistory}
          onPrint={() => window.print()}
          onReset={handleReset}
          onSaveDocument={handleSaveDocument}
        />

        <HistoryModal
          isOpen={isHistoryOpen}
          historyDocument={historyDocument}
          historyDocumentType={historyDocumentType}
          historySearch={historySearch}
          historySortBy={historySortBy}
          historySortOrder={historySortOrder}
          historyRecords={historyRecords}
          historyLoading={historyLoading}
          historyError={historyError}
          onClose={() => setIsHistoryOpen(false)}
          onDocumentTypeChange={handleHistoryDocumentTypeChange}
          onSearchChange={setHistorySearch}
          onSearchSubmit={() =>
            void loadHistory(historyDocumentType, historySearch, historySortBy, historySortOrder)
          }
          onSortChange={handleHistorySortChange}
          onSortOrderChange={handleHistorySortOrderChange}
          onOpenRecord={handleLoadHistoryRecord}
        />
        <div className="invoice-document-stage">
          <div
            key={activeDocumentType}
            className="invoice-builder-grid invoice-page-turn grid gap-6 2xl:grid-cols-[420px_minmax(0,1fr)]"
          >
            <div className="invoice-builder-editor space-y-5">
              <DocumentDetailsSection
                activeDocument={activeDocument}
                activeDocumentType={activeDocumentType}
                form={form}
                onFormChange={handleFormChange}
              />

              <CustomerDetailsSection
                activeDocumentType={activeDocumentType}
                form={form}
                customers={customers}
                selectedCustomerId={selectedCustomerId}
                customerLoading={customerLoading}
                customerStatus={customerStatus}
                onSaveCustomer={handleSaveCustomer}
                onCustomerSelect={handleCustomerSelect}
                onFormChange={handleFormChange}
              />
              <ItemsSection
                activeDocumentType={activeDocumentType}
                documentLabel={activeDocument.label}
                items={items}
                categories={categories}
                catalogLoading={catalogLoading}
                catalogError={catalogError}
                products={products}
                getCategoryName={getCategoryName}
                getProductsForCategory={getProductsForCategory}
                onAddItem={handleAddItem}
                onCategorySelect={handleCategorySelect}
                onItemChange={handleItemChange}
                onItemPictureFile={handleItemPictureFile}
                onProductSelect={handleProductSelect}
                onRemoveItem={handleRemoveItem}
              />

              <FooterDetailsSection
                activeDocumentType={activeDocumentType}
                form={form}
                onFormChange={handleFormChange}
              />
            </div>

            <section className="invoice-print-panel rounded-[32px] border border-slate-800 bg-[#0b1120] p-3 shadow-[0_25px_60px_rgba(15,23,42,0.5)]">
              <div
                className={
                  activeDocumentType === 'quotation'
                    ? 'invoice-print-sheet mx-auto flex w-full max-w-[794px] flex-col overflow-hidden rounded-[28px] bg-white text-slate-900'
                    : 'invoice-print-sheet mx-auto flex min-h-[1120px] w-full max-w-[760px] flex-col rounded-[28px] bg-white px-5 py-4 text-slate-900 sm:px-6 sm:py-5'
                }
                style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
              >
                {activeDocumentType === 'quotation' ? (
                  <QuotationPreview form={form} items={items} totalAmount={totalAmount} />
                ) : activeDocumentType === 'deliveryChallan' ? (
                  <DeliveryChallanPreview form={form} items={items} />
                ) : (
                  <StandardDocumentPreview
                    activeDocument={activeDocument}
                    activeDocumentType={activeDocumentType}
                    form={form}
                    items={items}
                    totalAmount={totalAmount}
                  />
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesTaxInvoicePage;
