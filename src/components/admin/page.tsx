'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AdminMenuSorter } from '@/components/admin/AdminMenuSorter';
import { API_URL } from '@/lib/apiConfig';
import { Loader2, ListOrdered } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Product {
  _id: string;
  name: string;
  order?: number;
  category?: string;
}

const AdminProductSorterPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = useCallback(() => {
    // Replace with your actual token retrieval logic (e.g., from localStorage or a context)
    return localStorage.getItem('adminToken');
  }, []);

  // Fetch all categories for the dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setError(null);
      try {
        const token = getAuthToken();
        if (!token) {
          setError('Authentication token not found. Please log in.');
          setLoadingCategories(false);
          return;
        }
        const response = await axios.get<Category[]>(`${API_URL}/categories/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(response.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories. Please try again.');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [getAuthToken]);

  // Function to fetch products by category (passed to AdminMenuSorter)
  const fetchProductsByCategory = useCallback(async (categorySlug: string): Promise<Product[]> => {
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication token not found. Please log in.');
        return [];
      }
      const response = await axios.get<Product[]>(`${API_URL}/products/by-category/${categorySlug}/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Ensure products have an 'order' property for initial sorting in AdminMenuSorter
      return response.data.map((p, index) => ({ ...p, order: p.order ?? index }));
    } catch (err) {
      console.error(`Failed to fetch products for category ${categorySlug}:`, err);
      setError('Failed to load products for the selected category.');
      return [];
    }
  }, [getAuthToken]);

  // Function to save the new order (passed to AdminMenuSorter)
  const handleSaveOrder = useCallback(async (orderedIds: string[]) => {
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication token not found. Please log in.');
        return;
      }
      await axios.put(`${API_URL}/products/reorder`, { orderedIds }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Product order saved successfully!');
    } catch (err) {
      console.error('Failed to save product order:', err);
      setError('Failed to save product order. Please try again.');
    }
  }, [getAuthToken]);

  if (loadingCategories) {
    return (
      <div className="flex justify-center items-center h-screen text-cyan-500">
        <Loader2 className="animate-spin" size={40} />
        <span className="ml-3 text-lg">Loading categories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-400 bg-red-900/20 border border-red-800 rounded-lg mx-auto max-w-2xl mt-10">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <ListOrdered size={28} className="text-cyan-400" />
        <h1 className="text-3xl font-bold text-white">Product Reordering</h1>
      </div>

      <AdminMenuSorter
        title="Sort Products"
        categories={categories.map(cat => cat.slug)} // Pass slugs for fetching
        fetchItemsByCategory={fetchProductsByCategory}
        onSave={handleSaveOrder}
      />
    </div>
  );
};

export default AdminProductSorterPage;