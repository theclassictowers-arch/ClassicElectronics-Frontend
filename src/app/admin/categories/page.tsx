'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
import CategoryFormModal from '@/components/admin/CategoryFormModal';
import type { AdminCategory, CategoryFormMode, CategoryTreeNode } from '@/types/adminCategory';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Build a tree from a flat list of categories */
const buildTree = (flat: AdminCategory[]): CategoryTreeNode[] => {
  const map = new Map<string, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  for (const category of flat) {
    map.set(category._id, { ...category, children: [] });
  }

  for (const category of flat) {
    const node = map.get(category._id);
    if (!node) continue;

    const parentId = category.parent;
    if (parentId && map.has(parentId)) {
      map.get(parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: CategoryTreeNode[]) => {
    nodes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
    nodes.forEach((node) => sortNodes(node.children));
  };

  sortNodes(roots);
  return roots;
};

const LEVEL_STYLES: Record<number, { label: string; bg: string; text: string }> = {
  1: { label: 'Menu', bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  2: { label: 'Category', bg: 'bg-purple-500/20', text: 'text-purple-400' },
  3: { label: 'Sub-cat', bg: 'bg-amber-500/20', text: 'text-amber-400' },
};

const levelBadge = (level: number) => {
  const style = LEVEL_STYLES[level] || LEVEL_STYLES[3];
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold ${style.bg} ${style.text}`}>
      L{level} {style.label}
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
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [modalMode, setModalMode] = useState<CategoryFormMode>('root');
  const [modalParentId, setModalParentId] = useState('');
  const [modalLevel, setModalLevel] = useState(1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setCategories([]);
        return;
      }

      const response = await axios.get(`${API_URL}/categories/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(response.data) ? (response.data as AdminCategory[]) : [];
      setCategories(data);
      setExpanded(new Set(data.map((category) => category._id)));
    } catch (error) {
      console.error('Failed to load categories', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tree = buildTree(categories);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setModalMode('root');
    setModalParentId('');
    setModalLevel(1);
  };

  const openAddRoot = () => {
    setEditingCategory(null);
    setModalMode('root');
    setModalParentId('');
    setModalLevel(1);
    setShowModal(true);
  };

  const openAddChild = (parentCategory: AdminCategory) => {
    const parentLevel = parentCategory.level ?? 1;
    setEditingCategory(null);
    setModalMode('child');
    setModalParentId(parentCategory._id);
    setModalLevel(Math.min(parentLevel + 1, 3));
    setShowModal(true);
  };

  const openEdit = (category: AdminCategory) => {
    setEditingCategory(category);
    setModalMode('edit');
    setModalParentId(category.parent || '');
    setModalLevel(category.level ?? 1);
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const hasChildren = categories.some((category) => category.parent === id);
    const message = hasChildren
      ? `"${name}" has child categories. Deleting it may orphan them. Continue?`
      : `Delete "${name}"?`;

    if (!confirm(message)) return;

    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert('Please login as admin first');
      return;
    }

    try {
      await axios.delete(`${API_URL}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  const renderNode = (node: CategoryTreeNode, depth: number): React.ReactNode => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expanded.has(node._id);
    const level = node.level ?? 1;
    const canAddChild = level < 3;

    return (
      <React.Fragment key={node._id}>
        <div
          className="flex items-center gap-2 px-4 py-3 hover:bg-white/5 transition-colors border-b border-gray-800/50"
          style={{ paddingLeft: `${depth * 28 + 16}px` }}
        >
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

          <span className="font-medium text-white flex-1 min-w-0 truncate">{node.name}</span>
          {levelBadge(level)}

          <span title={node.showInNavbar ? 'Visible in navbar' : 'Hidden from navbar'}>
            {node.showInNavbar ? (
              <Eye size={14} className="text-green-400" />
            ) : (
              <EyeOff size={14} className="text-gray-600" />
            )}
          </span>

          <span
            className={`px-2 py-0.5 rounded text-xs font-bold ${
              node.status === 'inactive'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-green-500/20 text-green-400'
            }`}
          >
            {node.status === 'inactive' ? 'Inactive' : 'Active'}
          </span>

          <span className="text-xs text-gray-500 w-8 text-right" title="Sort order">
            #{node.order ?? 0}
          </span>

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

        {isExpanded && node.children.map((child) => renderNode(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div>
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

      <div className="flex gap-4 mb-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">{levelBadge(1)} Root menu</span>
        <span className="flex items-center gap-1">{levelBadge(2)} Category</span>
        <span className="flex items-center gap-1">{levelBadge(3)} Sub-category</span>
        <span className="flex items-center gap-1">
          <Eye size={12} className="text-green-400" /> In navbar
        </span>
        <span className="flex items-center gap-1">
          <EyeOff size={12} className="text-gray-600" /> Hidden
        </span>
      </div>

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

      {showModal && (
        <CategoryFormModal
          category={editingCategory}
          categories={categories}
          initialParentId={modalParentId}
          initialLevel={modalLevel}
          mode={modalMode}
          onClose={closeModal}
          onSuccess={async () => {
            closeModal();
            await fetchData();
          }}
        />
      )}
    </div>
  );
};

export default CategoriesAdmin;
