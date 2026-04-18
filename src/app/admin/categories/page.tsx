'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  FolderTree,
} from 'lucide-react';
import { API_URL } from '@/lib/apiConfig';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type AdminCategory = {
  _id: string;
  name: string;
  slug: string;
  parent?: string | null;
  level?: number;
  order?: number;
  status?: 'active' | 'inactive';
  showInNavbar?: boolean;
};

type TreeNode = AdminCategory & { children: TreeNode[] };

type CategoryFormData = {
  name: string;
  slug: string;
  parent: string; // '' means root
  level: number;
  order: number;
  status: 'active' | 'inactive';
  showInNavbar: boolean;
};

const EMPTY_FORM: CategoryFormData = {
  name: '',
  slug: '',
  parent: '',
  level: 1,
  order: 0,
  status: 'active',
  showInNavbar: true,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

/** Build a tree from a flat list of categories */
const buildTree = (flat: AdminCategory[]): TreeNode[] => {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // Create nodes
  for (const cat of flat) {
    map.set(cat._id, { ...cat, children: [] });
  }

  // Link children to parents
  for (const cat of flat) {
    const node = map.get(cat._id)!;
    const parentId = cat.parent;
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Sort each level by order then name
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
    nodes.forEach((n) => sortNodes(n.children));
  };
  sortNodes(roots);

  return roots;
};

/** Level label & color */
const LEVEL_STYLES: Record<number, { label: string; bg: string; text: string }> = {
  1: { label: 'Menu', bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  2: { label: 'Category', bg: 'bg-purple-500/20', text: 'text-purple-400' },
  3: { label: 'Sub-cat', bg: 'bg-amber-500/20', text: 'text-amber-400' },
};

const levelBadge = (level: number) => {
  const s = LEVEL_STYLES[level] || LEVEL_STYLES[3];
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold ${s.bg} ${s.text}`}>
      L{level} {s.label}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const CategoriesAdmin = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(EMPTY_FORM);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  /* ---------- data fetch ---------- */

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) { setCategories([]); return; }

      const res = await axios.get(`${API_URL}/categories/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? (res.data as AdminCategory[]) : [];
      setCategories(data);

      // Auto-expand all on first load
      setExpanded(new Set(data.map((c) => c._id)));
    } catch (error) {
      console.error('Failed to load categories', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ---------- tree ---------- */

  const tree = buildTree(categories);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  /* ---------- modal helpers ---------- */

  const closeModal = () => { setShowModal(false); setEditingId(null); setFormData(EMPTY_FORM); };

  const openAddRoot = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM, level: 1, parent: '' });
    setShowModal(true);
  };

  const openAddChild = (parentCat: AdminCategory) => {
    const parentLevel = parentCat.level ?? 1;
    setEditingId(null);
    setFormData({
      ...EMPTY_FORM,
      parent: parentCat._id,
      level: parentLevel + 1,
    });
    setShowModal(true);
  };

  const openEdit = (cat: AdminCategory) => {
    setEditingId(cat._id);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      parent: cat.parent || '',
      level: cat.level ?? 1,
      order: cat.order ?? 0,
      status: cat.status === 'inactive' ? 'inactive' : 'active',
      showInNavbar: cat.showInNavbar ?? true,
    });
    setShowModal(true);
  };

  /* ---------- name -> slug sync ---------- */

  const handleNameChange = (value: string) => {
    setFormData((prev) => {
      const oldAutoSlug = toSlug(prev.name);
      const shouldSync = !prev.slug || prev.slug === oldAutoSlug;
      return { ...prev, name: value, slug: shouldSync ? toSlug(value) : prev.slug };
    });
  };

  /* ---------- parent change -> recalc level ---------- */

  const handleParentChange = (parentId: string) => {
    if (!parentId) {
      setFormData((prev) => ({ ...prev, parent: '', level: 1 }));
      return;
    }
    const parentCat = categories.find((c) => c._id === parentId);
    const parentLevel = parentCat?.level ?? 1;
    setFormData((prev) => ({ ...prev, parent: parentId, level: parentLevel + 1 }));
  };

  /* ---------- submit ---------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    if (!token) { alert('Please login as admin first'); return; }
    if (!formData.slug.trim()) { alert('Slug is required'); return; }

    const payload: Record<string, unknown> = {
      name: formData.name,
      slug: formData.slug,
      level: formData.level,
      order: formData.order,
      status: formData.status,
      showInNavbar: formData.showInNavbar,
    };
    if (formData.parent) payload.parent = formData.parent;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (editingId) {
        await axios.put(`${API_URL}/categories/${editingId}`, payload, { headers });
      } else {
        await axios.post(`${API_URL}/categories`, payload, { headers });
      }
      closeModal();
      await fetchData();
    } catch (error) {
      console.error('Failed to save category', error);
      alert('Error saving category');
    }
  };

  /* ---------- delete ---------- */

  const handleDelete = async (id: string, name: string) => {
    // Check for children
    const hasChildren = categories.some((c) => c.parent === id);
    const msg = hasChildren
      ? `"${name}" has child categories. Deleting it may orphan them. Continue?`
      : `Delete "${name}"?`;
    if (!confirm(msg)) return;

    const token = localStorage.getItem('adminToken');
    if (!token) { alert('Please login as admin first'); return; }

    try {
      await axios.delete(`${API_URL}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  /* ---------- available parents for modal dropdown ---------- */

  const availableParents = (): AdminCategory[] => {
    if (editingId) {
      // Can't be parent of self or own descendants
      const descendantIds = new Set<string>();
      const collectDescendants = (parentId: string) => {
        for (const c of categories) {
          if (c.parent === parentId && !descendantIds.has(c._id)) {
            descendantIds.add(c._id);
            collectDescendants(c._id);
          }
        }
      };
      descendantIds.add(editingId);
      collectDescendants(editingId);
      return categories.filter((c) => !descendantIds.has(c._id) && (c.level ?? 1) <= 2);
    }
    // For new categories, any L1 or L2 can be parent
    return categories.filter((c) => (c.level ?? 1) <= 2);
  };

  /* ---------------------------------------------------------------- */
  /*  Tree row renderer                                                */
  /* ---------------------------------------------------------------- */

  const renderNode = (node: TreeNode, depth: number): React.ReactNode => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expanded.has(node._id);
    const level = node.level ?? 1;
    const canAddChild = level < 3;

    return (
      <React.Fragment key={node._id}>
        {/* Row */}
        <div
          className="flex items-center gap-2 px-4 py-3 hover:bg-white/5 transition-colors border-b border-gray-800/50"
          style={{ paddingLeft: `${depth * 28 + 16}px` }}
        >
          {/* Expand/collapse or spacer */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(node._id)}
              className="p-0.5 text-gray-400 hover:text-white rounded"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <span className="w-5" />
          )}

          {/* Name */}
          <span className="font-medium text-white flex-1 min-w-0 truncate">
            {node.name}
          </span>

          {/* Level badge */}
          {levelBadge(level)}

          {/* Navbar visibility */}
          <span title={node.showInNavbar ? 'Visible in navbar' : 'Hidden from navbar'}>
            {node.showInNavbar ? (
              <Eye size={14} className="text-green-400" />
            ) : (
              <EyeOff size={14} className="text-gray-600" />
            )}
          </span>

          {/* Status badge */}
          <span
            className={`px-2 py-0.5 rounded text-xs font-bold ${
              node.status === 'inactive'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-green-500/20 text-green-400'
            }`}
          >
            {node.status === 'inactive' ? 'Inactive' : 'Active'}
          </span>

          {/* Order */}
          <span className="text-xs text-gray-500 w-8 text-right" title="Sort order">
            #{node.order ?? 0}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-2">
            {canAddChild && (
              <button
                onClick={() => openAddChild(node)}
                className="px-2 py-1 text-xs text-cyan-400 hover:bg-cyan-500/10 rounded flex items-center gap-1"
                title="Add child category"
              >
                <Plus size={12} /> Child
              </button>
            )}
            <button
              onClick={() => openEdit(node)}
              className="p-1.5 text-cyan-400 hover:bg-cyan-500/10 rounded"
              title="Edit"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={() => handleDelete(node._id, node.name)}
              className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Children */}
        {isExpanded && node.children.map((child) => renderNode(child, depth + 1))}
      </React.Fragment>
    );
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <FolderTree size={28} className="text-cyan-400" />
          <h1 className="text-3xl font-bold">Category Management</h1>
        </div>
        <button
          onClick={openAddRoot}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded flex items-center gap-2 font-bold"
        >
          <Plus size={18} /> Add Root Menu
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">{levelBadge(1)} Root menu</span>
        <span className="flex items-center gap-1">{levelBadge(2)} Category</span>
        <span className="flex items-center gap-1">{levelBadge(3)} Sub-category</span>
        <span className="flex items-center gap-1"><Eye size={12} className="text-green-400" /> In navbar</span>
        <span className="flex items-center gap-1"><EyeOff size={12} className="text-gray-600" /> Hidden</span>
      </div>

      {/* Tree */}
      <div className="bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : tree.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No categories found. Click &quot;Add Root Menu&quot; to create your first menu item.
          </div>
        ) : (
          tree.map((node) => renderNode(node, 0))
        )}
      </div>

      {/* ---- Modal ---- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e293b] p-8 rounded-xl max-w-md w-full border border-gray-700">
            <h2 className="text-xl font-bold mb-6">
              {editingId ? 'Edit Category' : formData.parent ? `Add Child (Level ${formData.level})` : 'Add Root Menu'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  placeholder="Category Name"
                  className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Slug</label>
                <input
                  placeholder="slug"
                  className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: toSlug(e.target.value) })}
                  required
                />
              </div>

              {/* Parent */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Parent</label>
                <select
                  className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white"
                  value={formData.parent}
                  onChange={(e) => handleParentChange(e.target.value)}
                >
                  <option value="">— None (Root / Level 1) —</option>
                  {availableParents().map((p) => (
                    <option key={p._id} value={p._id}>
                      {'  '.repeat((p.level ?? 1) - 1)}{p.name} (L{p.level ?? 1})
                    </option>
                  ))}
                </select>
              </div>

              {/* Level (read-only, auto-calculated) */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Level (auto)</label>
                <div className="flex items-center gap-2 p-3 bg-[#0b1120] border border-gray-600 rounded text-gray-300">
                  {levelBadge(formData.level)}
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Sort Order</label>
                <input
                  type="number"
                  min={0}
                  className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <select
                  className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value === 'inactive' ? 'inactive' : 'active' })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Show in Navbar */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showInNavbar}
                  onChange={(e) => setFormData({ ...formData, showInNavbar: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500"
                />
                <span className="text-sm text-gray-300">Show in Navbar</span>
              </label>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-cyan-600 text-white py-2 rounded font-bold hover:bg-cyan-500"
                >
                  {editingId ? 'Update' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-transparent border border-gray-600 text-white py-2 rounded font-bold hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesAdmin;
