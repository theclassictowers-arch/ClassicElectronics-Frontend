'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { API_URL } from '@/lib/apiConfig';
import type {
  AdminCategory,
  CategoryFormData,
  CategoryFormMode,
} from '@/types/adminCategory';
import { EMPTY_CATEGORY_FORM } from '@/types/adminCategory';

interface CategoryFormModalProps {
  category: AdminCategory | null;
  categories: AdminCategory[];
  initialParentId?: string;
  initialLevel?: number;
  mode: CategoryFormMode;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  category,
  categories,
  initialParentId = '',
  initialLevel = 1,
  mode,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CategoryFormData>(EMPTY_CATEGORY_FORM);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        parent: category.parent || '',
        level: category.level ?? 1,
        order: category.order ?? 0,
        status: category.status === 'inactive' ? 'inactive' : 'active',
        showInNavbar: category.showInNavbar ?? true,
      });
      return;
    }

    setFormData({
      ...EMPTY_CATEGORY_FORM,
      parent: initialParentId,
      level: initialLevel,
    });
  }, [category, initialLevel, initialParentId]);

  const availableParents = useMemo(() => {
    if (!category?._id) {
      return categories.filter((item) => (item.level ?? 1) <= 2);
    }

    const descendantIds = new Set<string>([category._id]);
    const collectDescendants = (parentId: string) => {
      for (const item of categories) {
        if (item.parent === parentId && !descendantIds.has(item._id)) {
          descendantIds.add(item._id);
          collectDescendants(item._id);
        }
      }
    };

    collectDescendants(category._id);

    return categories.filter((item) => !descendantIds.has(item._id) && (item.level ?? 1) <= 2);
  }, [categories, category]);

  const levelBadge = (level: number) => {
    const styles: Record<number, string> = {
      1: 'bg-cyan-500/20 text-cyan-400',
      2: 'bg-purple-500/20 text-purple-400',
      3: 'bg-amber-500/20 text-amber-400',
    };

    const labels: Record<number, string> = {
      1: 'Menu',
      2: 'Category',
      3: 'Sub-category',
    };

    return (
      <span className={`px-3 py-1 rounded text-xs font-bold ${styles[level] || styles[3]}`}>
        L{level} {labels[level] || labels[3]}
      </span>
    );
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => {
      const oldAutoSlug = toSlug(prev.name);
      const shouldSync = !prev.slug || prev.slug === oldAutoSlug;

      return {
        ...prev,
        name: value,
        slug: shouldSync ? toSlug(value) : prev.slug,
      };
    });
  };

  const handleParentChange = (parentId: string) => {
    if (!parentId) {
      setFormData((prev) => ({ ...prev, parent: '', level: 1 }));
      return;
    }

    const parentCategory = categories.find((item) => item._id === parentId);
    const parentLevel = parentCategory?.level ?? 1;

    setFormData((prev) => ({
      ...prev,
      parent: parentId,
      level: Math.min(parentLevel + 1, 3),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('adminToken');
    if (!token) {
      setSubmitError('Please login as admin first.');
      return;
    }

    if (!formData.name.trim() || !formData.slug.trim()) {
      setSubmitError('Name and slug are required.');
      return;
    }

    const payload: Record<string, unknown> = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      level: formData.level,
      order: formData.order,
      status: formData.status,
      showInNavbar: formData.showInNavbar,
      parent: formData.parent || null,
    };

    setSaving(true);
    setSubmitError(null);

    try {
      const headers = { Authorization: `Bearer ${token}` };

      if (category?._id) {
        await axios.put(`${API_URL}/categories/${category._id}`, payload, { headers });
      } else {
        await axios.post(`${API_URL}/categories`, payload, { headers });
      }

      await onSuccess();
    } catch (error) {
      const message =
        axios.isAxiosError(error) && typeof error.response?.data?.message === 'string'
          ? error.response.data.message
          : 'Error saving category.';
      setSubmitError(message);
    } finally {
      setSaving(false);
    }
  };

  const heading =
    mode === 'edit'
      ? 'Edit Category'
      : mode === 'child'
        ? `Add Child Category (Level ${formData.level})`
        : 'Add Root Menu';

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#1e293b] p-8 rounded-xl max-w-2xl w-full border border-gray-700 my-4 h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 sticky top-0 bg-[#1e293b] py-2 z-10 border-b border-gray-700">
          {heading}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Category Name</label>
              <input
                placeholder="Category Name"
                className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Slug</label>
              <input
                placeholder="category-slug"
                className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: toSlug(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Parent Category</label>
            <select
              className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white"
              value={formData.parent}
              onChange={(e) => handleParentChange(e.target.value)}
            >
              <option value="">None (Root / Level 1)</option>
              {availableParents.map((parent) => (
                <option key={parent._id} value={parent._id}>
                  {'  '.repeat((parent.level ?? 1) - 1)}
                  {parent.name} (L{parent.level ?? 1})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Level</label>
              <div className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white">
                {levelBadge(formData.level)}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Sort Order</label>
              <input
                type="number"
                min={0}
                className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white"
                value={formData.order}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, order: parseInt(e.target.value, 10) || 0 }))
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Status</label>
            <select
              className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white"
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value === 'inactive' ? 'inactive' : 'active',
                }))
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`relative w-11 h-6 rounded-full transition-colors ${
                formData.showInNavbar ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
              onClick={() =>
                setFormData((prev) => ({ ...prev, showInNavbar: !prev.showInNavbar }))
              }
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  formData.showInNavbar ? 'translate-x-5' : ''
                }`}
              />
            </div>
            <span className="text-gray-300 text-sm">
              Show In Navbar ({formData.showInNavbar ? 'Visible' : 'Hidden'})
            </span>
          </label>

          <div className="flex gap-4 pt-4 border-t border-gray-700">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-cyan-600 text-white py-3 rounded font-bold hover:bg-cyan-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : category ? 'Update Category' : 'Save Category'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 border border-gray-600 text-white py-3 rounded font-bold hover:bg-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
