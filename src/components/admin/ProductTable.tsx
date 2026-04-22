'use client';

import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import type { AdminProduct, ProductCategoryRef } from '@/types/adminProduct';

interface ProductTableProps {
  products: AdminProduct[];
  loading: boolean;
  onEdit: (product: AdminProduct) => void;
  onDelete: (id: string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, loading, onEdit, onDelete }) => {
  const getCategoryName = (categoryId: ProductCategoryRef | undefined): string => {
    if (!categoryId || typeof categoryId === 'string') return '-';
    return categoryId.name || '-';
  };

  return (
    <div className="bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-[#0b1120] text-gray-400 font-medium text-sm uppercase">
          <tr>
            <th className="p-4">Product Name</th>
            <th className="p-4">Code</th>
            <th className="p-4">Category</th>
            <th className="p-4">Price</th>
            <th className="p-4">Stock</th>
            <th className="p-4">Status</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {loading ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-gray-400">
                Loading products...
              </td>
            </tr>
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-gray-400">
                No products found.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product._id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-medium text-white">{product.name}</td>
                <td className="p-4 text-cyan-400 font-mono text-sm">{product.specifications?.model || '-'}</td>
                <td className="p-4 text-gray-400">{getCategoryName(product.categoryId)}</td>
                <td className="p-4">Rs. {Number(product.price || 0).toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {product.stock} Units
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${product.status === 'inactive' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                    {product.status === 'inactive' ? 'Inactive' : 'Active'}
                  </span>
                </td>
                <td className="p-4 flex gap-2 justify-end">
                  <button
                    onClick={() => onEdit(product)}
                    className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(product._id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
