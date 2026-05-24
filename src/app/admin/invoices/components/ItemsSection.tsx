import { CalendarDays, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import type { AdminCategory } from '@/types/adminCategory';
import type { CatalogProduct, DocumentType, InvoiceItem } from '../types';
import { formatCurrency, getPictureSource, getProductDisplayName } from '../utils';
import { Field, SelectField } from './FormFields';

type ItemsSectionProps = {
  activeDocumentType: DocumentType;
  documentLabel: string;
  items: InvoiceItem[];
  categories: AdminCategory[];
  catalogLoading: boolean;
  catalogError: string;
  products: CatalogProduct[];
  getCategoryName: (categoryId: string) => string;
  getProductsForCategory: (categoryId: string) => CatalogProduct[];
  onAddItem: () => void;
  onCategorySelect: (id: string, categoryId: string) => void;
  onItemChange: (id: string, field: keyof Omit<InvoiceItem, 'id'>, value: string | boolean) => void;
  onItemPictureFile: (id: string, file?: File) => void;
  onProductSelect: (id: string, productId: string) => void;
  onRemoveItem: (id: string) => void;
};

export const ItemsSection = ({
  activeDocumentType,
  documentLabel,
  items,
  categories,
  catalogLoading,
  catalogError,
  products,
  getCategoryName,
  getProductsForCategory,
  onAddItem,
  onCategorySelect,
  onItemChange,
  onItemPictureFile,
  onProductSelect,
  onRemoveItem,
}: ItemsSectionProps) => (
  <section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 shadow-xl">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
        <CalendarDays size={16} />
        {documentLabel} Items
      </div>
      <button
        type="button"
        onClick={onAddItem}
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
      {items.map((item, index) => {
        const categoryProducts = getProductsForCategory(item.categoryId);

        return (
          <div key={item.id} className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Item {index + 1}
              </div>
              <button
                type="button"
                onClick={() => onRemoveItem(item.id)}
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
                  onChange={(value) => onCategorySelect(item.id, value)}
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
                  onChange={(value) => onProductSelect(item.id, value)}
                  options={categoryProducts.map((product) => ({
                    label: getProductDisplayName(product),
                    value: product._id,
                  }))}
                  placeholder={item.categoryId ? 'Select product' : 'Select category first'}
                  disabled={catalogLoading || !item.categoryId || categoryProducts.length === 0}
                />
              </div>

              {item.categoryId && categoryProducts.length === 0 ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  No products are currently available in this category.
                </div>
              ) : null}

              <div className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-3">
                <div className="flex gap-4">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
                    {item.showPicture && getPictureSource(item.picture) ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={getPictureSource(item.picture)}
                        alt={item.productName || item.description || 'Selected product'}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <span className="px-3 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        {item.showPicture ? 'No Image' : 'Photo Off'}
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
                    {activeDocumentType === 'deliveryChallan' ? null : (
                      <div className="mt-3 text-sm font-semibold text-cyan-300">
                        Unit Price: {formatCurrency(item.unitPrice || 0)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Field
                label={activeDocumentType === 'deliveryChallan' ? 'Particulars' : 'Description'}
                value={item.description}
                onChange={(value) => onItemChange(item.id, 'description', value)}
                multiline
                rows={5}
              />
              <div
                className={`grid gap-3 ${
                  activeDocumentType === 'deliveryChallan' ? 'sm:grid-cols-1' : 'sm:grid-cols-3'
                }`}
              >
                {activeDocumentType === 'deliveryChallan' ? null : (
                  <Field
                    label="UOM"
                    value={item.uom}
                    onChange={(value) => onItemChange(item.id, 'uom', value)}
                  />
                )}
                <Field
                  label="Quantity"
                  type="number"
                  value={String(item.quantity)}
                  onChange={(value) => onItemChange(item.id, 'quantity', value)}
                />
                {activeDocumentType === 'deliveryChallan' ? null : (
                  <Field
                    label="Unit Price"
                    type="number"
                    value={String(item.unitPrice)}
                    onChange={(value) => onItemChange(item.id, 'unitPrice', value)}
                  />
                )}
              </div>
              <Field
                label="Remarks"
                value={item.remarks}
                onChange={(value) => onItemChange(item.id, 'remarks', value)}
              />
              {activeDocumentType === 'deliveryChallan' ? null : (
                <div className="space-y-3">
                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Product Photo
                    </div>
                    <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 p-1 sm:w-52">
                      {[
                        { label: 'Yes', value: true },
                        { label: 'No', value: false },
                      ].map((option) => (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => onItemChange(item.id, 'showPicture', option.value)}
                          className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                            item.showPicture === option.value
                              ? 'bg-cyan-500 text-slate-950'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <Field
                      label="Picture URL / Reference"
                      value={/^data:image\//i.test(item.picture) ? 'Uploaded image selected' : item.picture}
                      onChange={(value) => onItemChange(item.id, 'picture', value)}
                    />
                    <div className="flex gap-2">
                      <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20">
                        <Upload size={14} />
                        Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(event) => {
                            onItemPictureFile(item.id, event.target.files?.[0]);
                            event.target.value = '';
                          }}
                        />
                      </label>
                      {item.picture ? (
                        <button
                          type="button"
                          onClick={() => onItemChange(item.id, 'picture', '')}
                          className="inline-flex h-11 items-center rounded-xl border border-slate-700 px-3 text-xs font-semibold text-slate-300 transition hover:border-rose-400 hover:text-rose-300"
                        >
                          Clear
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </section>
);
