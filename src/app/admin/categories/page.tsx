'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  Search,
  SlidersHorizontal,
  ArrowDownAZ,
  ArrowUpAZ,
} from 'lucide-react';
import { API_URL } from '@/lib/apiConfig';
import CategoryFormModal from '@/components/admin/CategoryFormModal';
import type { AdminCategory, CategoryFormMode, CategoryTreeNode } from '@/types/adminCategory';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Build a tree from a flat list of categories */
type CategorySortKey = 'name' | 'slug' | 'level' | 'order' | 'status' | 'visibility';
type SortDirection = 'asc' | 'desc';

const buildTree = (
  flat: AdminCategory[],
  sortKey: CategorySortKey,
  sortDirection: SortDirection
): CategoryTreeNode[] => {
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
    nodes.sort((firstNode, secondNode) => {
      const compareValue = (() => {
        switch (sortKey) {
          case 'slug':
            return firstNode.slug.localeCompare(secondNode.slug, undefined, {
              sensitivity: 'base',
            });
          case 'level':
            return (firstNode.level ?? 1) - (secondNode.level ?? 1);
          case 'order':
            return (firstNode.order ?? 0) - (secondNode.order ?? 0);
          case 'status':
            return (firstNode.status === 'inactive' ? 'inactive' : 'active').localeCompare(
              secondNode.status === 'inactive' ? 'inactive' : 'active',
              undefined,
              { sensitivity: 'base' }
            );
          case 'visibility':
            return Number(firstNode.showInNavbar) - Number(secondNode.showInNavbar);
          case 'name':
          default:
            return firstNode.name.localeCompare(secondNode.name, undefined, {
              sensitivity: 'base',
            });
        }
      })();

      if (compareValue !== 0) {
        return sortDirection === 'asc' ? compareValue : -compareValue;
      }

      return firstNode.name.localeCompare(secondNode.name, undefined, {
        sensitivity: 'base',
      });
    });

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [navbarFilter, setNavbarFilter] = useState('all');
  const [sortKey, setSortKey] = useState<CategorySortKey>('order');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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

  const filteredCategories = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const categoryById = new Map(categories.map((category) => [category._id, category]));
    const visibleIds = new Set<string>();

    categories.forEach((category) => {
      const categoryStatus = category.status === 'inactive' ? 'inactive' : 'active';
      const categoryLevel = String(category.level ?? 1);
      const categoryVisibility = category.showInNavbar ? 'visible' : 'hidden';

      const matchesSearch =
        !normalizedSearch ||
        category.name.toLowerCase().includes(normalizedSearch) ||
        category.slug.toLowerCase().includes(normalizedSearch) ||
        categoryStatus.includes(normalizedSearch);

      const matchesStatus = statusFilter === 'all' || categoryStatus === statusFilter;
      const matchesLevel = levelFilter === 'all' || categoryLevel === levelFilter;
      const matchesNavbar = navbarFilter === 'all' || categoryVisibility === navbarFilter;

      if (matchesSearch && matchesStatus && matchesLevel && matchesNavbar) {
        let currentCategory: AdminCategory | undefined = category;

        while (currentCategory) {
          visibleIds.add(currentCategory._id);
          currentCategory = currentCategory.parent
            ? categoryById.get(currentCategory.parent)
            : undefined;
        }
      }
    });

    return categories.filter((category) => visibleIds.has(category._id));
  }, [categories, levelFilter, navbarFilter, searchTerm, statusFilter]);

  const tree = useMemo(
    () => buildTree(filteredCategories, sortKey, sortDirection),
    [filteredCategories, sortDirection, sortKey]
  );

  const handleSortToggle = () => {
    setSortDirection((currentDirection) => (currentDirection === 'asc' ? 'desc' : 'asc'));
  };

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

      <div className="bg-[#1e293b] border border-gray-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-4">
          <SlidersHorizontal size={16} className="text-cyan-400" />
          Category Filters
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <label className="md:col-span-2">
            <span className="block text-xs uppercase tracking-wide text-gray-400 mb-2">
              Search
            </span>
            <div className="flex items-center gap-2 bg-[#0b1120] border border-gray-700 rounded-lg px-3">
              <Search size={16} className="text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, slug, status"
                className="w-full bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-gray-500"
              />
            </div>
          </label>

          <label>
            <span className="block text-xs uppercase tracking-wide text-gray-400 mb-2">
              Level
            </span>
            <select
              value={levelFilter}
              onChange={(event) => setLevelFilter(event.target.value)}
              className="w-full bg-[#0b1120] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none"
            >
              <option value="all">All Levels</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
            </select>
          </label>

          <label>
            <span className="block text-xs uppercase tracking-wide text-gray-400 mb-2">
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full bg-[#0b1120] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <label>
            <span className="block text-xs uppercase tracking-wide text-gray-400 mb-2">
              Navbar
            </span>
            <select
              value={navbarFilter}
              onChange={(event) => setNavbarFilter(event.target.value)}
              className="w-full bg-[#0b1120] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none"
            >
              <option value="all">All Items</option>
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
            </select>
          </label>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <label className="md:w-64">
            <span className="block text-xs uppercase tracking-wide text-gray-400 mb-2">
              Sort By
            </span>
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as CategorySortKey)}
              className="w-full bg-[#0b1120] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none"
            >
              <option value="order">Order</option>
              <option value="name">Name</option>
              <option value="slug">Slug</option>
              <option value="level">Level</option>
              <option value="status">Status</option>
              <option value="visibility">Navbar Visibility</option>
            </select>
          </label>

          <div className="md:self-end">
            <button
              type="button"
              onClick={handleSortToggle}
              className="w-full md:w-auto bg-[#0b1120] border border-gray-700 hover:border-cyan-500 rounded-lg px-4 py-2.5 text-sm text-white flex items-center justify-center gap-2 transition-colors"
            >
              {sortDirection === 'asc' ? <ArrowUpAZ size={16} /> : <ArrowDownAZ size={16} />}
              {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>
        </div>
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
            No categories matched the selected filters.
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
