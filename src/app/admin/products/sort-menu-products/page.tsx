'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Save,
  Loader2,
  Package,
  ChevronRight,
  LayoutGrid,
} from 'lucide-react';
import type { AdminProduct, AdminCategory } from '../page';

type Product = AdminProduct & {
  categoryId?: string | { _id?: string; name?: string };
  category?: string | { _id?: string; name?: string };
  categories?: Array<string | { _id?: string; name?: string }>;
  specifications?: {
    model?: string;
  };
  price?: number | string;
};

type Category = AdminCategory & {
  productOrder?: string[];
};

const getCategoryIdsFromProduct = (product: Product): string[] => {
  const ids: string[] = [];

  // categoryId
  if (product.categoryId) {
    if (typeof product.categoryId === 'object' && product.categoryId?._id) {
      ids.push(product.categoryId._id);
    } else if (typeof product.categoryId === 'string') {
      ids.push(product.categoryId);
    }
  }

  // category
  if (product.category) {
    if (typeof product.category === 'object' && product.category?._id) {
      ids.push(product.category._id);
    } else if (typeof product.category === 'string') {
      ids.push(product.category);
    }
  }

  // categories array
  if (Array.isArray(product.categories)) {
    for (const cat of product.categories) {
      if (typeof cat === 'object' && cat?._id) {
        ids.push(cat._id);
      } else if (typeof cat === 'string') {
        ids.push(cat);
      }
    }
  }

  return [...new Set(ids.filter(Boolean))];
};

const SortableProductRow = ({ product }: { product: Product }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
        isDragging
          ? 'bg-cyan-900/40 border-cyan-500 shadow-2xl scale-[1.02]'
          : 'bg-[#1e293b] border-gray-800 hover:border-gray-700'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="text-gray-500 cursor-grab active:cursor-grabbing hover:text-cyan-400 p-1"
      >
        <GripVertical size={22} />
      </div>

      <div className="flex-1">
        <p className="text-white font-bold">{product.name}</p>
        <p className="text-xs text-gray-400 font-mono">
          {product.specifications?.model ? `${product.specifications.model} • ` : ''}
          Rs. {Number(product.price || 0).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

const ProductSorterPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchData = useCallback(async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get('categories'),
        api.get('products', { params: { includeSpecs: '1' } }),
      ]);

      const allProducts: Product[] = Array.isArray(prodRes.data) ? prodRes.data : [];
      const allCategories: Category[] = Array.isArray(catRes.data) ? catRes.data : [];

      // Only show categories that have products
      const usedCategoryIds = new Set<string>();

      allProducts.forEach((product) => {
        const ids = getCategoryIdsFromProduct(product);
        ids.forEach((id) => usedCategoryIds.add(id));
      });

      const filteredCategories = allCategories.filter((cat) => usedCategoryIds.has(cat._id));
      setCategories(filteredCategories);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCategoryClick = async (category: Category) => {
    setProducts([]);
    setSelectedCategory(category);
    setLoading(true);

    try {
      
      const res = await api.get('products', {
        params: {
          categoryId: category._id,
          includeSpecs: '1',
        },
      });

      const rawProducts: Product[] = Array.isArray(res.data) ? res.data : [];

      // Strict frontend filter: only selected category's products
      let filteredProducts = rawProducts.filter((product) => {
        const ids = getCategoryIdsFromProduct(product);
        return ids.includes(category._id);
      });

      // Duplicates remove
      filteredProducts = filteredProducts.filter(
        (product, index, arr) => index === arr.findIndex((p) => p._id === product._id)
      );

      // Saved custom order apply
      const customOrder = category.productOrder || [];

      filteredProducts.sort((a, b) => {
        const indexA = customOrder.indexOf(a._id);
        const indexB = customOrder.indexOf(b._id);

        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });

      setProducts(filteredProducts);
    } catch (error) {
      console.error('Failed to load products', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setProducts((prev) => {
      const oldIndex = prev.findIndex((p) => p._id === active.id);
      const newIndex = prev.findIndex((p) => p._id === over.id);

      if (oldIndex === -1 || newIndex === -1) return prev;

      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleSave = async () => {
    const token = localStorage.getItem('adminToken');

    if (!token || !selectedCategory) {
      alert('Admin login required or no category selected');
      return;
    }

    setSaving(true);

    try {
      const orderedIds = products.map((p) => p._id);

      const response = await api.put(
        'products/reorder',
        { orderedIds },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showMessage('success', response.data.message || 'Order updated');

      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat._id === selectedCategory._id
            ? { ...cat, productOrder: orderedIds }
            : cat
        )
      );

      setSelectedCategory((prev) =>
        prev ? { ...prev, productOrder: orderedIds } : null
      );
    } catch (error) {
      console.error('Failed to save order', error);
      showMessage('error', 'Failed to save product order');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <LayoutGrid className="text-cyan-400" size={28} />
          <div>
            <h1 className="text-3xl font-bold text-white">Menu Sorter</h1>
            <p className="text-gray-400 text-sm">
              Organize how products appear in the navbar
            </p>
          </div>
        </div>

        {selectedCategory && (
          <button
            onClick={handleSave}
            disabled={loading || saving || products.length === 0}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Save New Order
          </button>
        )}
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-300 ${
          message.type === 'success' 
            ? 'bg-green-500/10 text-green-400 border-green-500/30' 
            : 'bg-red-500/10 text-red-400 border-red-500/30'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider mb-4 ml-1">
            Select Category
          </h3>

          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryClick(cat)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                selectedCategory?._id === cat._id
                  ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400'
                  : 'bg-[#1e293b] border-gray-800 text-gray-300 hover:border-gray-600'
              }`}
            >
              <span className="font-medium">{cat.name}</span>
              <ChevronRight
                size={16}
                className={selectedCategory?._id === cat._id ? 'opacity-100' : 'opacity-0'}
              />
            </button>
          ))}
        </div>

        <div className="md:col-span-2">
          {!selectedCategory ? (
            <div className="bg-[#0b1120] border-2 border-dashed border-gray-800 rounded-2xl p-12 text-center">
              <Package className="mx-auto text-gray-600 mb-4" size={48} />
              <p className="text-gray-500">
               First, select a category to reorder their products.
              </p>
            </div>
          ) : loading ? (
            <div className="text-center py-20 text-cyan-400 flex flex-col items-center gap-3">
              <Loader2 className="animate-spin" size={32} />
              <p>Products are loading...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-[#1e293b] rounded-2xl border border-gray-800">
              There are no products in this category.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={products.map((p) => p._id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {products.map((product) => (
                    <SortableProductRow key={product._id} product={product} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSorterPage;