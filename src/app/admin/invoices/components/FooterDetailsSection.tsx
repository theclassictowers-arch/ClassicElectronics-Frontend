import { Mail } from 'lucide-react';
import type { InvoiceForm } from '../types';
import { Field } from './FormFields';

type FooterDetailsSectionProps = {
  form: InvoiceForm;
  onFormChange: (field: keyof InvoiceForm, value: string | boolean) => void;
};

export const FooterDetailsSection = ({ form, onFormChange }: FooterDetailsSectionProps) => (
  <section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 shadow-xl">
    <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-cyan-300">
      <Mail size={16} />
      Footer Details
    </div>

    <div className="space-y-4">
      <Field
        label="Thank You Note"
        value={form.thankYouNote}
        onChange={(value) => onFormChange('thankYouNote', value)}
      />
      <Field
        label="Subtitle"
        value={form.subtitle}
        onChange={(value) => onFormChange('subtitle', value)}
      />
      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
        <ToggleButton
          label="Quotation Tax Notice"
          enabled={form.showQuotationTaxNotice !== false}
          onToggle={() =>
            onFormChange('showQuotationTaxNotice', !(form.showQuotationTaxNotice !== false))
          }
        />
        <ToggleButton
          label="Quotation Terms"
          enabled={form.showQuotationTerms !== false}
          onToggle={() => onFormChange('showQuotationTerms', !(form.showQuotationTerms !== false))}
        />
      </div>
      <Field
        label="Website"
        value={form.website}
        onChange={(value) => onFormChange('website', value)}
      />
      <Field
        label="Address"
        value={form.address}
        onChange={(value) => onFormChange('address', value)}
      />
      <Field label="Email" value={form.email} onChange={(value) => onFormChange('email', value)} />
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-1">
        <Field
          label="Primary Phone"
          value={form.phonePrimary}
          onChange={(value) => onFormChange('phonePrimary', value)}
        />
        <Field
          label="Secondary Phone"
          value={form.phoneSecondary}
          onChange={(value) => onFormChange('phoneSecondary', value)}
        />
      </div>
      <Field
        label="Director Name"
        value={form.directorName}
        onChange={(value) => onFormChange('directorName', value)}
      />
    </div>
  </section>
);

type ToggleButtonProps = {
  label: string;
  enabled: boolean;
  onToggle: () => void;
};

const ToggleButton = ({ label, enabled, onToggle }: ToggleButtonProps) => (
  <button
    type="button"
    onClick={onToggle}
    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
      enabled
        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
        : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500'
    }`}
  >
    <span>{label}</span>
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
        enabled ? 'bg-emerald-400 text-slate-950' : 'bg-slate-700 text-slate-200'
      }`}
    >
      {enabled ? 'Enabled' : 'Disabled'}
    </span>
  </button>
);
