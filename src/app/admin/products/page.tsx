'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Plus, ListOrdered, Search, SlidersHorizontal } from 'lucide-react';
import ProductTable, {
  ProductSortKey,
  SortDirection,
} from '@/components/admin/ProductTable';
import ProductFormModal from '@/components/admin/ProductFormModal';
import { deleteFileFromServer } from '@/services/uploadService';

// Export types to be used in sub-components
export type AdminCategory = {
  _id: string;
  name: string;
  slug: string;
};

export type ProductCategoryRef =
  | {
      _id?: string;
      name?: string;
}
  | string
  | null;

export type AdminProduct = {
  _id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  images?: string[];
  status?: 'active' | 'inactive';
  categoryId?: ProductCategoryRef;
  showPrice?: boolean;
  pdfUrl?: string;
  specifications?: {
    basicInformation?: Array<{ label?: string; value?: string }>;
    operatingSpecifications?: Array<{ label?: string; value?: string }>;
    electricalSpecifications?: string[];
    certifications?: string[];
    features?: string[];
    applications?: string[];
    model?: string;
    series?: string;
    type?: string;
    portSize?: string;
    connectionType?: string;
    voltageOptions?: string[];
  } | null;
};

const ProductsAdmin = () => {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortKey, setSortKey] = useState<ProductSortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Use the centralized 'api' instance and correct the endpoints
      const [prodRes, catRes] = await Promise.all([
        api.get('products', { params: { includeSpecs: '1' } }),
        api.get('categories', { headers }),
      ]);

      setProducts(Array.isArray(prodRes.data) ? (prodRes.data as AdminProduct[]) : []);
      setCategories(Array.isArray(catRes.data) ? (catRes.data as AdminCategory[]) : []);
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const token = localStorage.getItem('adminToken');
    if (!token) return alert('Please login as admin first');

    try {
      const productToDelete = products.find((p) => p._id === id);
      if (productToDelete) {
        if (productToDelete.pdfUrl) await deleteFileFromServer(token, productToDelete.pdfUrl);
        productToDelete.images?.forEach(img => deleteFileFromServer(token, img));
      }
      await api.delete(`products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      await fetchData();
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  const getCategoryName = useCallback((categoryRef?: ProductCategoryRef) => {
    if (!categoryRef) return '';
    if (typeof categoryRef === 'string') {
      return categories.find((category) => category._id === categoryRef)?.name || '';
    }

    return categoryRef.name || '';
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const visibleProducts = products.filter((product) => {
      const categoryId =
        typeof product.categoryId === 'object' ? product.categoryId?._id : product.categoryId;
      const categoryName = getCategoryName(product.categoryId).toLowerCase();
      const productStatus = product.status === 'inactive' ? 'inactive' : 'active';

      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        (product.specifications?.model || '').toLowerCase().includes(normalizedSearch) ||
        categoryName.includes(normalizedSearch) ||
        productStatus.includes(normalizedSearch);

      const matchesCategory =
        selectedCategoryId === 'all' || (categoryId || '') === selectedCategoryId;
      const matchesStatus = selectedStatus === 'all' || productStatus === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    const sortedProducts = [...visibleProducts];
    sortedProducts.sort((firstProduct, secondProduct) => {
      const firstCategoryName = getCategoryName(firstProduct.categoryId);
      const secondCategoryName = getCategoryName(secondProduct.categoryId);
      const firstStatus = firstProduct.status === 'inactive' ? 'inactive' : 'active';
      const secondStatus = secondProduct.status === 'inactive' ? 'inactive' : 'active';

      const compareValue = (() => {
        switch (sortKey) {
          case 'model':
            return (firstProduct.specifications?.model || '').localeCompare(
              secondProduct.specifications?.model || '',
              undefined,
              { sensitivity: 'base' }
            );
          case 'category':
            return firstCategoryName.localeCompare(secondCategoryName, undefined, {
              sensitivity: 'base',
            });
          case 'price':
            return Number(firstProduct.price || 0) - Number(secondProduct.price || 0);
          case 'stock':
            return Number(firstProduct.stock || 0) - Number(secondProduct.stock || 0);
          case 'status':
            return firstStatus.localeCompare(secondStatus, undefined, {
              sensitivity: 'base',
            });
          case 'name':
          default:
            return firstProduct.name.localeCompare(secondProduct.name, undefined, {
              sensitivity: 'base',
            });
        }
      })();

      if (compareValue !== 0) {
        return sortDirection === 'asc' ? compareValue : -compareValue;
      }

      return firstProduct.name.localeCompare(secondProduct.name, undefined, {
        sensitivity: 'base',
      });
    });

    return sortedProducts;
  }, [
    getCategoryName,
    products,
    searchTerm,
    selectedCategoryId,
    selectedStatus,
    sortDirection,
    sortKey,
  ]);

  const handleSortChange = (nextSortKey: ProductSortKey) => {
    if (sortKey === nextSortKey) {
      setSortDirection((currentDirection) => (currentDirection === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection('asc');
  };

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/admin/products/sort-menu-products')}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded flex items-center gap-2 font-bold shadow-lg"
          >
            <ListOrdered size={18} /> Sort Menu Products
          </button>
          <button 
            onClick={() => { setEditingProduct(null); setShowModal(true); }}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded flex items-center gap-2 font-bold"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-[#1e293b] border border-gray-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-4">
          <SlidersHorizontal size={16} className="text-cyan-400" />
          Product Filters
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                placeholder="Search by name, code, category, status"
                className="w-full bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-gray-500"
              />
            </div>
          </label>

          <label>
            <span className="block text-xs uppercase tracking-wide text-gray-400 mb-2">
              Category
            </span>
            <select
              value={selectedCategoryId}
              onChange={(event) => setSelectedCategoryId(event.target.value)}
              className="w-full bg-[#0b1120] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="block text-xs uppercase tracking-wide text-gray-400 mb-2">
              Status
            </span>
            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              className="w-full bg-[#0b1120] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>
      </div>

      <ProductTable 
        products={filteredProducts}
        loading={loading} 
        onEdit={(p) => { setEditingProduct(p); setShowModal(true); }} 
        onDelete={handleDelete} 
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
      />

      {showModal && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchData(); }}
        />
      )}
    </div>
  );
};

export default ProductsAdmin;
