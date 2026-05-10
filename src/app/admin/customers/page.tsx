'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Building2,
  Edit3,
  Eye,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Search,
  X,
} from 'lucide-react';
import {
  createCustomer,
  getCustomers,
  updateCustomer,
} from '@/services/api';
import type { CustomerPayload, CustomerRecord } from '@/services/api';

type SortKey = 'name' | 'location' | 'gst' | 'ntn' | 'email' | 'status' | 'updatedAt';
type SortDirection = 'asc' | 'desc';
type CustomerForm = {
  name: string;
  location: string;
  gst: string;
  ntn: string;
  email: string;
  phonePrimary: string;
  phoneSecondary: string;
  contactPerson: string;
  notes: string;
  status: 'active' | 'inactive';
};

const emptyCustomerForm = (): CustomerForm => ({
  name: '',
  location: '',
  gst: '18',
  ntn: '',
  email: '',
  phonePrimary: '',
  phoneSecondary: '',
  contactPerson: '',
  notes: '',
  status: 'active',
});

const toCustomerForm = (customer: CustomerRecord): CustomerForm => ({
  name: customer.name || '',
  location: customer.location || '',
  gst: customer.gst || '18',
  ntn: customer.ntn || '',
  email: customer.email || '',
  phonePrimary: customer.phonePrimary || '',
  phoneSecondary: customer.phoneSecondary || '',
  contactPerson: customer.contactPerson || '',
  notes: customer.notes || '',
  status: customer.status || 'active',
});

const toPayload = (form: CustomerForm): CustomerPayload => ({
  name: form.name.trim(),
  location: form.location.trim(),
  gst: form.gst.trim(),
  ntn: form.ntn.trim(),
  email: form.email.trim(),
  phonePrimary: form.phonePrimary.trim(),
  phoneSecondary: form.phoneSecondary.trim(),
  contactPerson: form.contactPerson.trim(),
  notes: form.notes.trim(),
  status: form.status,
});

const formatDateTime = (value?: string) => {
  if (!value) return '---';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '---' : date.toLocaleString();
};

const getSortValue = (customer: CustomerRecord, key: SortKey): string =>
  String(customer[key] || '').toLowerCase();

const CustomersAdminPage = () => {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [form, setForm] = useState<CustomerForm>(emptyCustomerForm);
  const [statusMessage, setStatusMessage] = useState('');

  const loadCustomers = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    setLoading(true);
    setStatusMessage('');

    try {
      const data = await getCustomers(token, { limit: 500 });
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers', error);
      setStatusMessage('Unable to load customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return [...customers]
      .filter((customer) => {
        const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
        if (!matchesStatus) return false;

        if (!searchTerm) return true;

        return [
          customer.name,
          customer.location,
          customer.gst,
          customer.ntn,
          customer.email,
          customer.phonePrimary,
          customer.phoneSecondary,
          customer.contactPerson,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchTerm));
      })
      .sort((first, second) => {
        const firstValue = getSortValue(first, sortKey);
        const secondValue = getSortValue(second, sortKey);
        const result = firstValue.localeCompare(secondValue, undefined, {
          numeric: true,
          sensitivity: 'base',
        });

        return sortDirection === 'asc' ? result : -result;
      });
  }, [customers, search, sortDirection, sortKey, statusFilter]);

  const stats = {
    total: customers.length,
    active: customers.filter((customer) => customer.status === 'active').length,
    inactive: customers.filter((customer) => customer.status === 'inactive').length,
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDirection(key === 'updatedAt' ? 'desc' : 'asc');
  };

  const openCreateEditor = () => {
    setEditingCustomer(null);
    setForm(emptyCustomerForm());
    setStatusMessage('');
    setIsEditorOpen(true);
  };

  const openEditEditor = (customer: CustomerRecord) => {
    setEditingCustomer(customer);
    setForm(toCustomerForm(customer));
    setStatusMessage('');
    setIsEditorOpen(true);
  };

  const handleFormChange = (field: keyof CustomerForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: field === 'status' && value === 'inactive' ? 'inactive' : value,
    }));
  };

  const handleSaveCustomer = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert('Please login as admin first');
      return;
    }

    const payload = toPayload(form);
    if (!payload.name) {
      alert('Customer name is required');
      return;
    }

    setSaving(true);
    setStatusMessage('');

    try {
      const savedCustomer = editingCustomer
        ? await updateCustomer(token, editingCustomer._id, payload)
        : await createCustomer(token, payload);

      setCustomers((current) => {
        const exists = current.some((customer) => customer._id === savedCustomer._id);
        return exists
          ? current.map((customer) => (customer._id === savedCustomer._id ? savedCustomer : customer))
          : [...current, savedCustomer];
      });
      setSelectedCustomer(savedCustomer);
      setIsEditorOpen(false);
      setStatusMessage(editingCustomer ? 'Customer updated.' : 'Customer saved.');
    } catch (error) {
      const maybeApiError = error as { response?: { data?: { message?: string } } };
      setStatusMessage(maybeApiError.response?.data?.message || 'Unable to save customer.');
    } finally {
      setSaving(false);
    }
  };

  const SortButton = ({ label, column }: { label: string; column: SortKey }) => (
    <button
      type="button"
      onClick={() => handleSort(column)}
      className="inline-flex items-center gap-2 text-left font-semibold uppercase tracking-[0.16em] text-slate-400 transition hover:text-cyan-300"
    >
      {label}
      <ArrowUpDown size={13} className={sortKey === column ? 'text-cyan-300' : 'text-slate-600'} />
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Customers</h1>
          <p className="mt-1 text-sm text-slate-400">View, sort, add, and edit saved customer details.</p>
        </div>
        <button
          type="button"
          onClick={openCreateEditor}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-[#1e293b] p-4">
          <div className="text-sm text-slate-400">Total Customers</div>
          <div className="mt-1 text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#1e293b] p-4">
          <div className="text-sm text-emerald-300">Active</div>
          <div className="mt-1 text-2xl font-bold">{stats.active}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#1e293b] p-4">
          <div className="text-sm text-slate-400">Inactive</div>
          <div className="mt-1 text-2xl font-bold">{stats.inactive}</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#1e293b] p-4">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, location, GST, NTN, email or phone..."
              className="w-full rounded-lg border border-slate-700 bg-[#0b1120] py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')}
            className="rounded-lg border border-slate-700 bg-[#0b1120] px-4 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-cyan-400"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {statusMessage ? (
        <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-200">
          {statusMessage}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#1e293b]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] table-fixed text-left">
            <thead className="bg-[#0b1120] text-xs">
              <tr>
                <th className="w-[20%] p-4"><SortButton label="Name" column="name" /></th>
                <th className="w-[20%] p-4"><SortButton label="Location" column="location" /></th>
                <th className="w-[10%] p-4"><SortButton label="GST" column="gst" /></th>
                <th className="w-[10%] p-4"><SortButton label="NTN" column="ntn" /></th>
                <th className="w-[17%] p-4"><SortButton label="Contact" column="email" /></th>
                <th className="w-[10%] p-4"><SortButton label="Status" column="status" /></th>
                <th className="w-[13%] p-4 text-right"><SortButton label="Updated" column="updatedAt" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      Loading customers...
                    </span>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">No customers found</td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="transition hover:bg-white/5">
                    <td className="p-4">
                      <div className="truncate font-semibold text-white">{customer.name || '---'}</div>
                      <div className="mt-1 truncate text-xs text-slate-500">{customer.contactPerson || 'No contact person'}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-300">{customer.location || '---'}</td>
                    <td className="p-4 text-sm text-slate-300">{customer.gst || '---'}</td>
                    <td className="p-4 text-sm text-slate-300">{customer.ntn || '---'}</td>
                    <td className="p-4">
                      <div className="truncate text-sm text-slate-300">{customer.email || '---'}</div>
                      <div className="mt-1 truncate text-xs text-slate-500">{customer.phonePrimary || customer.phoneSecondary || 'No phone'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`rounded px-2 py-1 text-xs font-bold ${
                        customer.status === 'inactive'
                          ? 'bg-slate-600/30 text-slate-300'
                          : 'bg-emerald-500/15 text-emerald-300'
                      }`}>
                        {customer.status || 'active'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(customer)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
                          title="View customer"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditEditor(customer)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
                          title="Edit customer"
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCustomer ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-[#111827] p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedCustomer.name || 'Customer'}</h2>
                <p className="text-sm text-slate-400">Full customer details</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition hover:border-rose-400 hover:text-rose-300"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Detail icon={Building2} label="Name" value={selectedCustomer.name} />
              <Detail icon={MapPin} label="Location" value={selectedCustomer.location} />
              <Detail icon={Building2} label="GST" value={selectedCustomer.gst} />
              <Detail icon={Building2} label="NTN" value={selectedCustomer.ntn} />
              <Detail icon={Mail} label="Email" value={selectedCustomer.email} />
              <Detail icon={Phone} label="Primary Phone" value={selectedCustomer.phonePrimary} />
              <Detail icon={Phone} label="Secondary Phone" value={selectedCustomer.phoneSecondary} />
              <Detail icon={Building2} label="Contact Person" value={selectedCustomer.contactPerson} />
            </div>
            <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Notes</div>
              <div className="mt-2 whitespace-pre-wrap text-sm text-slate-200">{selectedCustomer.notes || '---'}</div>
            </div>
            <div className="mt-4 flex justify-between text-xs text-slate-500">
              <span>Created: {formatDateTime(selectedCustomer.createdAt)}</span>
              <span>Updated: {formatDateTime(selectedCustomer.updatedAt)}</span>
            </div>
          </div>
        </div>
      ) : null}

      {isEditorOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-xl border border-slate-700 bg-[#111827] p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h2>
                <p className="text-sm text-slate-400">Same name and same location will not be duplicated.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition hover:border-rose-400 hover:text-rose-300"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <EditorField label="Customer Name" value={form.name} onChange={(value) => handleFormChange('name', value)} />
              <EditorField label="Location" value={form.location} onChange={(value) => handleFormChange('location', value)} />
              <EditorField label="GST" value={form.gst} onChange={(value) => handleFormChange('gst', value)} />
              <EditorField label="NTN" value={form.ntn} onChange={(value) => handleFormChange('ntn', value)} />
              <EditorField label="Email" value={form.email} onChange={(value) => handleFormChange('email', value)} type="email" />
              <EditorField label="Primary Phone" value={form.phonePrimary} onChange={(value) => handleFormChange('phonePrimary', value)} />
              <EditorField label="Secondary Phone" value={form.phoneSecondary} onChange={(value) => handleFormChange('phoneSecondary', value)} />
              <EditorField label="Contact Person" value={form.contactPerson} onChange={(value) => handleFormChange('contactPerson', value)} />
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Status</span>
                <select
                  value={form.status}
                  onChange={(event) => handleFormChange('status', event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>
            <label className="mt-4 block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Notes</span>
              <textarea
                value={form.notes}
                onChange={(event) => handleFormChange('notes', event.target.value)}
                rows={4}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
              />
            </label>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCustomer}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

type DetailProps = {
  icon: typeof Building2;
  label: string;
  value?: string;
};

const Detail = ({ icon: Icon, label, value }: DetailProps) => (
  <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
      <Icon size={14} />
      {label}
    </div>
    <div className="break-words text-sm font-medium text-slate-100">{value || '---'}</div>
  </div>
);

type EditorFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email';
};

const EditorField = ({ label, value, onChange, type = 'text' }: EditorFieldProps) => (
  <label className="block">
    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
    />
  </label>
);

export default CustomersAdminPage;
