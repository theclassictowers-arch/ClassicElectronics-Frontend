'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import axios from 'axios';
import { Plus, X } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import PdfUploader from '@/components/admin/PdfUploader';
import {
  uploadProductImages,
  uploadProductPdf,
  validateImageFiles,
  validatePdfFile,
  deleteFileFromServer,
} from '@/services/uploadService';
import type { AdminProduct, AdminCategory, ProductCategoryRef } from '@/types/adminProduct';

interface ProductFormModalProps {
  product: AdminProduct | null;
  categories: AdminCategory[];
  onClose: () => void;
  onSuccess: () => void;
}

type KeyValueSpecRow = { label: string; value: string };

type ProductSpecificationsFormData = {
  basicInformation: KeyValueSpecRow[];
  operatingSpecifications: KeyValueSpecRow[];
  electricalSpecifications: string[];
  applications: string[];
  features: string[];
  certifications: string[];
};

type ProductFormData = {
  name: string;
  model: string;
  categoryId: string;
  price: string;
  description: string;
  stock: string;
  images: string[];
  status: 'active' | 'inactive';
  showPrice: boolean;
  pdfUrl: string;
  specifications: ProductSpecificationsFormData;
};

const EMPTY_SPECIFICATIONS: ProductSpecificationsFormData = {
  basicInformation: [],
  operatingSpecifications: [],
  electricalSpecifications: [],
  applications: [],
  features: [],
  certifications: [],
};

const EMPTY_FORM_DATA: ProductFormData = {
  name: '',
  model: '',
  categoryId: '',
  price: '',
  description: '',
  stock: '',
  images: [],
  status: 'active',
  showPrice: false,
  pdfUrl: '',
  specifications: EMPTY_SPECIFICATIONS,
};

// Helper logic
const createEmptyKeyValueRow = (): KeyValueSpecRow => ({ label: '', value: '' });

const getKeyValueSections = (rows?: Array<{ label?: string; value?: string }>, fallback?: KeyValueSpecRow[]): KeyValueSpecRow[] => {
  if (Array.isArray(rows) && rows.length > 0) {
    return rows.map((row) => ({ label: row.label || '', value: row.value || '' }));
  }
  return fallback ?? [];
};

const getTextSections = (rows?: string[], fallback?: string[]): string[] =>
  Array.isArray(rows) && rows.length > 0 ? rows : fallback ?? [];

const sanitizeKeyValueRows = (rows: KeyValueSpecRow[]): KeyValueSpecRow[] =>
  rows.map((row) => ({ label: row.label.trim(), value: row.value.trim() })).filter((row) => row.label || row.value);

const sanitizeTextRows = (rows: string[]): string[] => rows.map((row) => row.trim()).filter(Boolean);

const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, categories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM_DATA);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [pendingPdf, setPendingPdf] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [pdfUploadError, setPdfUploadError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);

  useEffect(() => {
    if (product) {
      const getCategoryId = (cat: ProductCategoryRef | undefined): string => {
        if (!cat) return '';
        return typeof cat === 'string' ? cat : (cat._id || '');
      };

      setFormData({
        name: product.name || '',
        model: product.specifications?.model || '',
        categoryId: getCategoryId(product.categoryId),
        price: String(product.price ?? ''),
        description: product.description || '',
        stock: String(product.stock ?? ''),
        images: Array.isArray(product.images) ? product.images : [],
        status: product.status === 'inactive' ? 'inactive' : 'active',
        showPrice: product.showPrice ?? false,
        pdfUrl: product.pdfUrl || '',
        specifications: {
          basicInformation: getKeyValueSections(product.specifications?.basicInformation, [
            { label: 'Model', value: product.specifications?.model || product.name || '' },
            { label: 'Series', value: product.specifications?.series || '' },
            { label: 'Type', value: product.specifications?.type || '' },
            { label: 'Port Size', value: product.specifications?.portSize || '' },
          ]),
          operatingSpecifications: getKeyValueSections(product.specifications?.operatingSpecifications, [
            { label: 'Connection Type', value: product.specifications?.connectionType || '' },
          ]),
          electricalSpecifications: getTextSections(product.specifications?.electricalSpecifications, product.specifications?.voltageOptions),
          certifications: getTextSections(product.specifications?.certifications),
          features: getTextSections(product.specifications?.features),
          applications: getTextSections(product.specifications?.applications),
        },
      });
    } else {
      setFormData(EMPTY_FORM_DATA);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    if (!token) return setSubmitError('Please login as admin first.');

    setSaving(true);
    try {
      let uploadedImages = [...formData.images];
      let uploadedPdfUrl = formData.pdfUrl || '';

      if (pendingImages.length > 0) {
        setImageUploading(true);
        const newImageUrls = await uploadProductImages(token, pendingImages);
        uploadedImages = [...uploadedImages, ...newImageUrls];
      }

      if (pendingPdf) {
        setPdfUploading(true);
        uploadedPdfUrl = await uploadProductPdf(token, pendingPdf);
      }

      const basicInformation = sanitizeKeyValueRows(formData.specifications.basicInformation);
      const operatingSpecifications = sanitizeKeyValueRows(formData.specifications.operatingSpecifications);
      const electricalSpecifications = sanitizeTextRows(formData.specifications.electricalSpecifications);

      const specifications = {
        ...formData.specifications,
        basicInformation,
        operatingSpecifications,
        electricalSpecifications,
        model: formData.model.trim() || formData.name.trim(),
      };

      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        images: uploadedImages,
        pdfUrl: uploadedPdfUrl,
        specifications,
      };

      if (product?._id) {
        await api.put(`products/${product._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await api.post('products', payload, { headers: { Authorization: `Bearer ${token}` } });
      }
      onSuccess();
    } catch (error) {
      setSubmitError('Error saving product.');
    } finally {
      setSaving(false);
      setImageUploading(false);
      setPdfUploading(false);
    }
  };

  // Handler functions for adding/removing rows (keeping same logic as before)
  const addKeyValueRow = (section: 'basicInformation' | 'operatingSpecifications') => {
    setFormData({ ...formData, specifications: { ...formData.specifications, [section]: [...formData.specifications[section], createEmptyKeyValueRow()] } });
  };

  const updateKeyValueRow = (section: 'basicInformation' | 'operatingSpecifications', index: number, key: 'label' | 'value', value: string) => {
    const updated = formData.specifications[section].map((row, i) => i === index ? { ...row, [key]: value } : row);
    setFormData({ ...formData, specifications: { ...formData.specifications, [section]: updated } });
  };

  const addTextRow = (section: 'electricalSpecifications' | 'applications' | 'features' | 'certifications') => {
    setFormData({ ...formData, specifications: { ...formData.specifications, [section]: [...formData.specifications[section], ''] } });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#1e293b] p-8 rounded-xl max-w-3xl w-full border border-gray-700 my-4 h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 sticky top-0 bg-[#1e293b] py-2 z-10 border-b border-gray-700">
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded text-sm">{submitError}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Product Name</label>
              <input className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Product Code / Model</label>
              <input className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} required />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Category</label>
            <select className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white" value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} required>
              <option value="">Select Category</option>
              {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Price (Rs.)</label>
              <input type="number" className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Stock Quantity</label>
              <input type="number" className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`relative w-11 h-6 rounded-full transition-colors ${formData.showPrice ? 'bg-cyan-600' : 'bg-gray-600'}`} onClick={() => setFormData({ ...formData, showPrice: !formData.showPrice })}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${formData.showPrice ? 'translate-x-5' : ''}`} />
              </div>
              <span className="text-gray-300 text-sm">Show Price</span>
            </label>
            <select className="bg-[#0b1120] border border-gray-600 rounded p-2 text-white text-sm" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <ImageUploader
            images={formData.images}
            pendingFiles={pendingImages}
            onAddFiles={(files) => setPendingImages([...pendingImages, ...files])}
            onRemoveImage={(idx) => setFormData({...formData, images: formData.images.filter((_, i) => i !== idx)})}
            onRemovePendingFile={(idx) => setPendingImages(pendingImages.filter((_, i) => i !== idx))}
            uploading={imageUploading}
          />

          <PdfUploader
            value={formData.pdfUrl}
            pendingFile={pendingPdf}
            onSelectFile={setPendingPdf}
            onRemoveUploaded={() => setFormData({...formData, pdfUrl: ''})}
            onRemovePending={() => setPendingPdf(null)}
            uploading={pdfUploading}
          />

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Description</label>
            <textarea className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white h-24" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          </div>

          <div className="border border-gray-700 rounded-lg p-4 bg-[#0f172a] space-y-4">
            <h3 className="text-lg font-semibold text-white">Technical Specifications</h3>
            
            {/* Basic Information Section */}
            <div className="bg-[#111827] border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold">Basic Information</h4>
                <button type="button" onClick={() => addKeyValueRow('basicInformation')} className="text-cyan-400 text-sm">Add</button>
              </div>
              {formData.specifications.basicInformation.map((row, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2">
                  <input placeholder="Label" className="bg-[#0b1120] border border-gray-600 rounded p-2 text-white text-sm" value={row.label} onChange={(e) => updateKeyValueRow('basicInformation', index, 'label', e.target.value)} />
                  <input placeholder="Value" className="bg-[#0b1120] border border-gray-600 rounded p-2 text-white text-sm" value={row.value} onChange={(e) => updateKeyValueRow('basicInformation', index, 'value', e.target.value)} />
                  <button type="button" onClick={() => setFormData({...formData, specifications: {...formData.specifications, basicInformation: formData.specifications.basicInformation.filter((_, i) => i !== index)}})} className="text-red-400 px-2">X</button>
                </div>
              ))}
            </div>

            {/* Other text sections like Features, Applications etc. */}
            {([
              ['features', 'Key Features'],
              ['applications', 'Applications'],
            ] as const).map(([key, title]) => (
              <div key={key} className="bg-[#111827] border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold">{title}</h4>
                  <button type="button" onClick={() => addTextRow(key)} className="text-cyan-400 text-sm">Add</button>
                </div>
                {formData.specifications[key].map((row, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input className="flex-1 bg-[#0b1120] border border-gray-600 rounded p-2 text-white text-sm" value={row} onChange={(e) => {
                      const updated = [...formData.specifications[key]];
                      updated[index] = e.target.value;
                      setFormData({...formData, specifications: {...formData.specifications, [key]: updated}});
                    }} />
                    <button type="button" onClick={() => {
                      const updated = formData.specifications[key].filter((_, i) => i !== index);
                      setFormData({...formData, specifications: {...formData.specifications, [key]: updated}});
                    }} className="text-red-400">X</button>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-700">
            <button type="submit" disabled={saving} className="flex-1 bg-cyan-600 text-white py-3 rounded font-bold hover:bg-cyan-500 disabled:opacity-50">
              {saving ? 'Processing...' : (product ? 'Update Product' : 'Save Product')}
            </button>
            <button type="button" onClick={onClose} className="flex-1 border border-gray-600 text-white py-3 rounded font-bold hover:bg-gray-800">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
