import { BadgeDollarSign, Building2, Loader2, Save } from 'lucide-react';
import type { CustomerRecord } from '@/services/api';
import type { DocumentType, InvoiceForm } from '../types';
import {
  CUSTOMER_GST_PLACEHOLDER,
  CUSTOMER_NTN_PLACEHOLDER,
  GST_REGISTRATION_PLACEHOLDER,
  deliveryPeriodOptions,
  formatGstRegistration,
  formatNtnNumber,
  normalizeCustomerGst,
} from '../utils';
import { Field, SelectField } from './FormFields';

type ActiveDocument = {
  label: string;
  numberLabel: string;
  purchaseLabel: string;
  referenceLabel: string;
};

type DocumentDetailsSectionProps = {
  activeDocument: ActiveDocument;
  activeDocumentType: DocumentType;
  form: InvoiceForm;
  onFormChange: (field: keyof InvoiceForm, value: string) => void;
};

export const DocumentDetailsSection = ({
  activeDocument,
  activeDocumentType,
  form,
  onFormChange,
}: DocumentDetailsSectionProps) => (
  <section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 shadow-xl">
    <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-cyan-300">
      <BadgeDollarSign size={16} />
      Document Details
    </div>

    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-1">
      <Field
        label={activeDocument.numberLabel}
        value={form.invoiceNo}
        onChange={(value) => onFormChange('invoiceNo', value)}
      />
      <Field
        label="Date"
        value={form.date}
        onChange={(value) => onFormChange('date', value)}
        type="date"
      />
      <Field
        label={activeDocument.purchaseLabel}
        value={form.purchaseOrder}
        onChange={(value) => onFormChange('purchaseOrder', value)}
      />
      {activeDocumentType === 'deliveryChallan' ? null : (
        <Field
          label={activeDocument.referenceLabel}
          value={form.quotationNo}
          onChange={(value) => onFormChange('quotationNo', value)}
        />
      )}
      {activeDocumentType === 'quotation' ? (
        <>
          <SelectField
            label="Delivery Period"
            value={form.deliveryPeriod}
            onChange={(value) => onFormChange('deliveryPeriod', value)}
            options={deliveryPeriodOptions}
            placeholder="Select delivery period"
          />
          <Field
            label="Validity Date"
            value={form.validityDate}
            onChange={(value) => onFormChange('validityDate', value)}
          />
        </>
      ) : null}
    </div>
  </section>
);

type CustomerDetailsSectionProps = {
  activeDocumentType: DocumentType;
  form: InvoiceForm;
  customers: CustomerRecord[];
  selectedCustomerId: string;
  customerLoading: boolean;
  customerStatus: string;
  onSaveCustomer: () => void;
  onCustomerSelect: (customerId: string) => void;
  onFormChange: (field: keyof InvoiceForm, value: string) => void;
};

export const CustomerDetailsSection = ({
  activeDocumentType,
  form,
  customers,
  selectedCustomerId,
  customerLoading,
  customerStatus,
  onSaveCustomer,
  onCustomerSelect,
  onFormChange,
}: CustomerDetailsSectionProps) => (
  <section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 shadow-xl">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
        <Building2 size={16} />
        Customer Details
      </div>
      <button
        type="button"
        onClick={onSaveCustomer}
        disabled={customerLoading}
        className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {customerLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        Save Customer
      </button>
    </div>

    <div className="space-y-4">
      <SelectField
        label="Saved Customer"
        value={selectedCustomerId}
        onChange={onCustomerSelect}
        options={customers.map((customer) => {
          const customerLocation =
            [customer.location1, customer.location2, customer.city, customer.country].filter(Boolean).join(', ') ||
            customer.location;

          return {
            label: customerLocation
              ? `${customer.name}${customer.abbreviation ? ` (${customer.abbreviation})` : ''} - ${customerLocation}`
              : `${customer.name}${customer.abbreviation ? ` (${customer.abbreviation})` : ''}`,
            value: customer._id,
          };
        })}
        placeholder={customerLoading ? 'Loading customers...' : 'Select customer'}
        disabled={customerLoading || customers.length === 0}
      />
      {customerStatus ? <div className="text-xs font-medium text-cyan-300">{customerStatus}</div> : null}
      <Field
        label={activeDocumentType === 'deliveryChallan' ? 'Name of Buyer' : 'Company Name'}
        value={form.companyName}
        onChange={(value) => onFormChange('companyName', value)}
      />
      <Field
        label="Abbreviation"
        value={form.customerAbbreviation}
        onChange={(value) => onFormChange('customerAbbreviation', value)}
      />
      <Field
        label="Address 1"
        value={form.customerAddress1 || form.location}
        onChange={(value) => onFormChange('customerAddress1', value)}
      />
      <Field
        label="Address 2"
        value={form.customerAddress2}
        onChange={(value) => onFormChange('customerAddress2', value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="City"
          value={form.customerCity}
          onChange={(value) => onFormChange('customerCity', value)}
        />
        <Field
          label="Tel No."
          value={form.customerPhone}
          onChange={(value) => onFormChange('customerPhone', value)}
          inputMode="tel"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={activeDocumentType === 'deliveryChallan' ? 'Sales Tax Registration No' : 'GST'}
          value={activeDocumentType === 'deliveryChallan' ? form.gst : normalizeCustomerGst(form.gst)}
          onChange={(value) =>
            onFormChange(
              'gst',
              activeDocumentType === 'deliveryChallan'
                ? formatGstRegistration(value)
                : normalizeCustomerGst(value)
            )
          }
          placeholder={
            activeDocumentType === 'deliveryChallan'
              ? GST_REGISTRATION_PLACEHOLDER
              : CUSTOMER_GST_PLACEHOLDER
          }
          inputMode="numeric"
          maxLength={16}
        />
        <Field
          label="NTN"
          value={form.ntn}
          onChange={(value) => onFormChange('ntn', formatNtnNumber(value))}
          placeholder={CUSTOMER_NTN_PLACEHOLDER}
          inputMode="numeric"
          maxLength={9}
        />
      </div>
    </div>
  </section>
);
