'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Plus, ListOrdered } from 'lucide-react';
import ProductTable from '@/components/admin/ProductTable';
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

      <ProductTable 
        products={products} 
        loading={loading} 
        onEdit={(p) => { setEditingProduct(p); setShowModal(true); }} 
        onDelete={handleDelete} 
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
