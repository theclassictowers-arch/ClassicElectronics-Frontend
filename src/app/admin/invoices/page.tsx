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
  FileText,
  Globe,
  Loader2,
  Mail,
  MapPin,
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

const SalesTaxInvoicePage = () => {
  const [form, setForm] = useState<InvoiceForm>(createInvoiceForm);
  const [items, setItems] = useState<InvoiceItem[]>([createInvoiceItem()]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');

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
        setCatalogError('Categories aur products load nahi ho sake. Thori dair baad dobara try karein.');
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

  const getCategoryName = (categoryId: string): string =>
    categories.find((category) => category._id === categoryId)?.name || 'Uncategorized';

  const getProductsForCategory = (categoryId: string): CatalogProduct[] =>
    products.filter((product) => getCategoryId(product.categoryId) === categoryId);

  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
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
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            <FileText size={14} />
            Invoice Builder
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white">Sales Tax Invoice Page</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Admin panel ke andar editable invoice experience ready hai. Left side
            se values update karein aur right side par uploaded design jaisi live
            preview dekhein.
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
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <Printer size={16} />
            Print Preview
          </button>
        </div>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-5">
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
                  Categories aur items load ho rahe hain...
                </div>
              ) : catalogError ? (
                <div className="text-rose-300">{catalogError}</div>
              ) : (
                <div>
                  <span className="font-semibold text-white">{categories.length}</span> categories aur{' '}
                  <span className="font-semibold text-white">{products.length}</span> products ready hain.
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
                        Is category me abhi koi product available nahi mila.
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
                            {item.productName || 'Category aur item select karein'}
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

        <section className="rounded-[32px] border border-slate-800 bg-[#0b1120] p-3 shadow-[0_25px_60px_rgba(15,23,42,0.5)]">
          <div className="mx-auto w-full max-w-[980px] rounded-[28px] bg-gradient-to-br from-white via-slate-50 to-slate-100 p-5 text-slate-900 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-[360px]">
                <Image
                  src="/Classic_logo.png"
                  alt="Classic Electronics"
                  width={360}
                  height={135}
                  className="h-auto w-auto"
                  priority
                />
              </div>

              <div className="text-left lg:text-right">
                <div className="text-[25px] font-black uppercase tracking-[0.08em] leading-tight text-slate-950">
                  Sales Tax Invoice: {form.invoiceNo || '---'}
                </div>
                <div className="mt-2 text-[25px] font-black leading-tight text-slate-950">
                  Date: {form.date || '--/--/----'}
                </div>
                <div className="mt-4 inline-flex flex-col items-start gap-1 lg:items-end">
                  <div className="text-[20px] font-black italic leading-tight text-slate-950">
                    Purchase Order: {form.purchaseOrder || '____________'}
                  </div>
                  <div className="text-[20px] font-black italic leading-tight text-slate-950">
                    Quotation No: {form.quotationNo || '____________'}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-8 overflow-hidden rounded-[38px] border-[3px] border-violet-600 bg-white px-5 pb-8 pt-10 sm:px-8">
              <div className="pointer-events-none absolute inset-x-0 top-44 flex justify-center opacity-10">
                <Image
                  src="/Classic_logo.png"
                  alt=""
                  width={720}
                  height={260}
                  className="h-auto w-[72%] max-w-[720px]"
                />
              </div>

              <div className="absolute left-8 top-0 h-10 w-[38%] -translate-y-1/2 rounded-[22px] border-[3px] border-violet-600 bg-white" />

              <div className="relative">
                <div className="mb-6 max-w-md text-[20px] leading-tight text-slate-900 sm:text-[24px]">
                  <div>{form.companyName || 'Customer Company'}</div>
                  <div>{form.location ? `${form.location}:` : 'Location:'}</div>
                  <div>GST: {form.gst || '________________'}</div>
                  <div>NTN: {form.ntn || '________________'}</div>
                </div>

                <div className="overflow-hidden rounded-[24px] border-[3px] border-slate-950 bg-white">
                  <table className="w-full border-collapse text-slate-950">
                    <thead>
                      <tr className="border-b-[3px] border-slate-950">
                        <th className="w-16 border-r-[3px] border-slate-950 px-2 py-3 text-center text-[18px] font-medium sm:text-[22px]">
                          Sr
                        </th>
                        <th className="border-r-[3px] border-slate-950 px-2 py-3 text-center text-[18px] font-medium sm:text-[22px]">
                          Description
                        </th>
                        <th className="w-28 border-r-[3px] border-slate-950 px-2 py-3 text-center text-[18px] font-medium sm:text-[22px]">
                          UOM
                        </th>
                        <th className="w-28 border-r-[3px] border-slate-950 px-2 py-3 text-center text-[18px] font-medium sm:text-[22px]">
                          QTY
                        </th>
                        <th className="w-36 border-r-[3px] border-slate-950 px-2 py-3 text-center text-[18px] font-medium sm:text-[22px]">
                          Unit Price
                        </th>
                        <th className="w-56 border-r-[3px] border-slate-950 px-2 py-3 text-center text-[18px] font-medium sm:text-[22px]">
                          Remarks/Picture
                        </th>
                        <th className="w-40 px-2 py-3 text-center text-[18px] font-medium sm:text-[22px]">
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
                            className="align-top [&:not(:last-child)]:border-b-[3px] [&:not(:last-child)]:border-slate-950"
                          >
                            <td className="border-r-[3px] border-slate-950 px-2 py-4 text-center text-xl">
                              {index + 1}
                            </td>
                            <td className="border-r-[3px] border-slate-950 px-3 py-4 text-lg sm:text-xl">
                              {item.description || 'Item description'}
                            </td>
                            <td className="border-r-[3px] border-slate-950 px-2 py-4 text-center text-lg sm:text-xl">
                              {item.uom || '--'}
                            </td>
                            <td className="border-r-[3px] border-slate-950 px-2 py-4 text-center text-lg sm:text-xl">
                              {item.quantity || 0}
                            </td>
                            <td className="border-r-[3px] border-slate-950 px-3 py-4 text-center text-lg sm:text-xl">
                              {formatCurrency(item.unitPrice || 0)}
                            </td>
                            <td className="border-r-[3px] border-slate-950 px-3 py-4 text-base leading-relaxed text-slate-700 sm:text-lg">
                              <div className="space-y-3">
                                <div className="font-medium text-slate-900">
                                  {item.remarks || item.productName || 'Remarks'}
                                </div>
                                {getPictureSource(item.picture) ? (
                                  <div className="overflow-hidden rounded-xl border border-slate-300 bg-slate-50">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={getPictureSource(item.picture)}
                                      alt={item.productName || item.description || 'Invoice item'}
                                      className="h-28 w-full object-contain bg-white p-2"
                                    />
                                  </div>
                                ) : item.picture ? (
                                  <div className="rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                                    {item.picture}
                                  </div>
                                ) : (
                                  <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-400">
                                    No picture selected
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-4 text-center text-lg font-semibold sm:text-xl">
                              {formatCurrency(itemTotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-5 flex justify-end">
                  <div className="w-full max-w-xs rounded-[20px] border-[3px] border-slate-950 bg-slate-50 px-5 py-4 text-right">
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Grand Total
                    </div>
                    <div className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                      {formatCurrency(totalAmount)}
                    </div>
                  </div>
                </div>

                <div className="mt-20 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-xs">
                    <div className="text-[22px] italic text-sky-700 sm:text-[34px]">
                      {form.directorName || 'Director Name'}
                    </div>
                    <div className="mt-3 w-40 border-t-2 border-slate-400 pt-2 text-[18px] font-semibold text-slate-900">
                      Director
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-semibold text-violet-600 sm:text-2xl">
                      {form.thankYouNote}
                    </div>
                    <div className="mt-2 text-base font-semibold text-slate-900 sm:text-[20px]">
                      {form.subtitle}
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 rounded-[28px] border-[3px] border-violet-600 bg-white/90 p-5 md:grid-cols-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700">
                      <Globe size={22} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Website
                      </div>
                      <div className="mt-1 text-lg font-semibold text-slate-900">
                        {form.website}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">{form.address}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                      <Mail size={22} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Contact
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
                        <MapPin size={16} className="text-slate-500" />
                        Islamabad
                      </div>
                      <div className="mt-1 text-sm text-slate-600">NTN: 1700506</div>
                      <div className="text-sm text-slate-600">GST: 05-07-8500-014-73</div>
                      <div className="mt-1 text-sm font-medium text-slate-900">
                        {form.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                      <Phone size={22} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Phone
                      </div>
                      <div className="mt-1 text-lg font-semibold text-slate-900">
                        {form.phonePrimary}
                      </div>
                      <div className="text-sm text-slate-600">{form.phoneSecondary}</div>
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
