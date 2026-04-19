'use client';

import React, { useCallback, useEffect, useState } from 'react';
import api from '@/services/api';
import axios from 'axios';
import { Plus, Edit, Trash2 } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import PdfUploader from '@/components/admin/PdfUploader';
import { API_URL } from '@/lib/apiConfig';
import {
  uploadProductImages,
  uploadProductPdf,
  validateImageFiles,
  validatePdfFile,
  deleteFileFromServer,
} from '@/services/uploadService';

type AdminCategory = {
  _id: string;
  name: string;
  slug: string;
};

type ProductCategoryRef =
  | {
      _id?: string;
      name?: string;
    }
  | string
  | null;

type AdminProduct = {
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

const createEmptyKeyValueRow = (): KeyValueSpecRow => ({ label: '', value: '' });

const getKeyValueSections = (
  rows?: Array<{ label?: string; value?: string }>,
  fallback?: KeyValueSpecRow[],
): KeyValueSpecRow[] => {
  if (Array.isArray(rows) && rows.length > 0) {
    return rows.map((row) => ({ label: row.label || '', value: row.value || '' }));
  }
  return fallback ?? [];
};

const getTextSections = (rows?: string[], fallback?: string[]): string[] =>
  Array.isArray(rows) && rows.length > 0 ? rows : fallback ?? [];

const sanitizeKeyValueRows = (rows: KeyValueSpecRow[]): KeyValueSpecRow[] =>
  rows
    .map((row) => ({ label: row.label.trim(), value: row.value.trim() }))
    .filter((row) => row.label || row.value);

const sanitizeTextRows = (rows: string[]): string[] =>
  rows.map((row) => row.trim()).filter(Boolean);

const getRequestErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message;
  }

  return error instanceof Error ? error.message : fallbackMessage;
};

const ProductsAdmin = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM_DATA);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [pendingPdf, setPendingPdf] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [pdfUploadError, setPdfUploadError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);

  const resetForm = () => {
    setFormData(EMPTY_FORM_DATA);
    setEditingProductId(null);
    setPendingImages([]);
    setPendingPdf(null);
    setSaving(false);
    setSubmitError(null);
    setImageUploadError(null);
    setPdfUploadError(null);
    setImageUploading(false);
    setPdfUploading(false);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const getCategoryId = (categoryId: ProductCategoryRef | undefined): string => {
    if (!categoryId) return '';
    if (typeof categoryId === 'string') return categoryId;
    return typeof categoryId._id === 'string' ? categoryId._id : '';
  };

  const getCategoryName = (categoryId: ProductCategoryRef | undefined): string => {
    if (!categoryId || typeof categoryId === 'string') return '-';
    return categoryId.name || '-';
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Use the centralized 'api' instance and correct the endpoints
      const [prodRes, catRes] = await Promise.all([
        api.get('products'),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setSubmitError('Please login as admin first.');
      return;
    }

    const parsedPrice = Number(formData.price);
    const parsedStock = Number(formData.stock);
    if (
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0 ||
      !Number.isFinite(parsedStock) ||
      parsedStock < 0
    ) {
      setSubmitError('Price and stock must be valid numbers.');
      return;
    }

    const imageValidationError = pendingImages.length > 0
      ? validateImageFiles(pendingImages, formData.images.length)
      : null;
    if (imageValidationError) {
      setImageUploadError(imageValidationError);
      return;
    }

    const pdfValidationError = pendingPdf ? validatePdfFile(pendingPdf) : null;
    if (pdfValidationError) {
      setPdfUploadError(pdfValidationError);
      return;
    }

    setSubmitError(null);
    setImageUploadError(null);
    setPdfUploadError(null);
    setSaving(true);

    try {
      let uploadedImages = [...formData.images];
      let uploadedPdfUrl = formData.pdfUrl || '';

      if (pendingImages.length > 0) {
        setImageUploading(true);
        const newImageUrls = await uploadProductImages(token, pendingImages);
        uploadedImages = [...uploadedImages, ...newImageUrls];
        setFormData((prev) => ({ ...prev, images: uploadedImages }));
        setPendingImages([]);
      }

      if (pendingPdf) {
        setPdfUploading(true);
        uploadedPdfUrl = await uploadProductPdf(token, pendingPdf);
        setFormData((prev) => ({ ...prev, pdfUrl: uploadedPdfUrl }));
        setPendingPdf(null);
      }

      const basicInformation = sanitizeKeyValueRows(formData.specifications.basicInformation);
      const operatingSpecifications = sanitizeKeyValueRows(formData.specifications.operatingSpecifications);
      const electricalSpecifications = sanitizeTextRows(formData.specifications.electricalSpecifications);
      const applications = sanitizeTextRows(formData.specifications.applications);
      const features = sanitizeTextRows(formData.specifications.features);
      const certifications = sanitizeTextRows(formData.specifications.certifications);

      const getBasicValue = (matchers: string[]) =>
        basicInformation.find((item) =>
          matchers.some((matcher) => item.label.toLowerCase() === matcher.toLowerCase()),
        )?.value || '';

      const specifications = {
        basicInformation,
        operatingSpecifications,
        electricalSpecifications,
        applications,
        features,
        certifications,
        model: getBasicValue(['model']) || formData.name.trim(),
        series: getBasicValue(['series']),
        type: getBasicValue(['type']) || 'Solenoid Valve',
        portSize: getBasicValue(['port size']) || 'N/A',
        connectionType:
          getBasicValue(['connection type']) ||
          operatingSpecifications.find((item) => item.label.toLowerCase() === 'connection type')?.value ||
          '',
        voltageOptions: electricalSpecifications,
      };

      const payload = {
        ...formData,
        price: parsedPrice,
        stock: parsedStock,
        images: uploadedImages,
        showPrice: formData.showPrice,
        pdfUrl: uploadedPdfUrl,
        specifications,
      };

      if (editingProductId) {
        await api.put(`products/${editingProductId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post('products', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      closeModal();
      await fetchData();
    } catch (error) {
      console.error('Failed to save product', error);
      setSubmitError(getRequestErrorMessage(error, 'Error saving product.'));
    } finally {
      setSaving(false);
      setImageUploading(false);
      setPdfUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert('Please login as admin first');
      return;
    }

    try {
      // Pehle product ka data dhoondhen taake files ka pata chal sake
      const productToDelete = products.find((p) => p._id === id);
      
      // Database se delete karne se pehle server se files delete karen
      if (productToDelete) {
        if (productToDelete.pdfUrl) await deleteFileFromServer(token, productToDelete.pdfUrl);
        if (productToDelete.images && productToDelete.images.length > 0) {
          for (const img of productToDelete.images) {
            await deleteFileFromServer(token, img);
          }
        }
      }

      await api.delete(`products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (product: AdminProduct) => {
    setEditingProductId(product._id);
    setPendingImages([]);
    setPendingPdf(null);
    setSubmitError(null);
    setImageUploadError(null);
    setPdfUploadError(null);
    setImageUploading(false);
    setPdfUploading(false);
    setSaving(false);
    setFormData({
      name: product.name || '',
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
        electricalSpecifications: getTextSections(
          product.specifications?.electricalSpecifications,
          product.specifications?.voltageOptions,
        ),
        certifications: getTextSections(product.specifications?.certifications),
        features: getTextSections(product.specifications?.features),
        applications: getTextSections(product.specifications?.applications),
      },
    });
    setShowModal(true);
  };

  const handleAddImageFiles = (files: File[]) => {
    const validationError = validateImageFiles(files, formData.images.length + pendingImages.length);
    setImageUploadError(validationError);

    if (validationError) return;

    setPendingImages((prev) => [...prev, ...files]);
  };

  const handleRemoveUploadedImage = (index: number) => {
    const token = localStorage.getItem('adminToken');
    const imageUrl = formData.images[index];
    
    if (token && imageUrl) {
      deleteFileFromServer(token, imageUrl);
    }

    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const handleRemovePendingImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, imageIndex) => imageIndex !== index));
    setImageUploadError(null);
  };

  const handleSelectPdf = (file: File | null) => {
    if (!file) return;

    const validationError = validatePdfFile(file);
    setPdfUploadError(validationError);

    if (validationError) return;

    setPendingPdf(file);
  };

  const handleRemoveUploadedPdf = () => {
    const token = localStorage.getItem('adminToken');
    if (token && formData.pdfUrl) {
      deleteFileFromServer(token, formData.pdfUrl);
    }
    setFormData((prev) => ({ ...prev, pdfUrl: '' }));
  };

  const handleRemovePendingPdf = () => {
    setPendingPdf(null);
    setPdfUploadError(null);
  };

  const addKeyValueRow = (section: 'basicInformation' | 'operatingSpecifications') => {
    setFormData({
      ...formData,
      specifications: {
        ...formData.specifications,
        [section]: [...formData.specifications[section], createEmptyKeyValueRow()],
      },
    });
  };

  const updateKeyValueRow = (
    section: 'basicInformation' | 'operatingSpecifications',
    index: number,
    key: 'label' | 'value',
    value: string,
  ) => {
    setFormData({
      ...formData,
      specifications: {
        ...formData.specifications,
        [section]: formData.specifications[section].map((row, rowIndex) =>
          rowIndex === index ? { ...row, [key]: value } : row,
        ),
      },
    });
  };

  const removeKeyValueRow = (section: 'basicInformation' | 'operatingSpecifications', index: number) => {
    setFormData({
      ...formData,
      specifications: {
        ...formData.specifications,
        [section]: formData.specifications[section].filter((_, rowIndex) => rowIndex !== index),
      },
    });
  };

  const addTextRow = (
    section: 'electricalSpecifications' | 'applications' | 'features' | 'certifications',
  ) => {
    setFormData({
      ...formData,
      specifications: {
        ...formData.specifications,
        [section]: [...formData.specifications[section], ''],
      },
    });
  };

  const updateTextRow = (
    section: 'electricalSpecifications' | 'applications' | 'features' | 'certifications',
    index: number,
    value: string,
  ) => {
    setFormData({
      ...formData,
      specifications: {
        ...formData.specifications,
        [section]: formData.specifications[section].map((row, rowIndex) =>
          rowIndex === index ? value : row,
        ),
      },
    });
  };

  const removeTextRow = (
    section: 'electricalSpecifications' | 'applications' | 'features' | 'certifications',
    index: number,
  ) => {
    setFormData({
      ...formData,
      specifications: {
        ...formData.specifications,
        [section]: formData.specifications[section].filter((_, rowIndex) => rowIndex !== index),
      },
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <button
          onClick={openAddModal}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded flex items-center gap-2 font-bold"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#0b1120] text-gray-400 font-medium text-sm uppercase">
            <tr>
              <th className="p-4">Product Name</th>
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
                <td colSpan={6} className="p-8 text-center">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-white">{product.name}</td>
                  <td className="p-4 text-gray-400">{getCategoryName(product.categoryId)}</td>
                  <td className="p-4">Rs. {Number(product.price || 0).toLocaleString()}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        product.stock > 0
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {product.stock} Units
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        product.status === 'inactive'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {product.status === 'inactive' ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2 justify-end">
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded"
                      aria-label={`Edit ${product.name}`}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded"
                      aria-label={`Delete ${product.name}`}
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

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#1e293b] p-8 rounded-xl max-w-3xl w-full border border-gray-700 my-4 h-[100vh] max-h-[100vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 sticky top-0 bg-[#1e293b] py-2 z-10">
              {editingProductId ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {submitError}
                </div>
              )}

              <input
                placeholder="Product Name"
                className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <select
                className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Price"
                  className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Stock"
                  className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
              <select
                className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value === 'inactive' ? 'inactive' : 'active',
                  })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`relative w-11 h-6 rounded-full transition-colors ${formData.showPrice ? 'bg-cyan-600' : 'bg-gray-600'}`}
                  onClick={() => setFormData({ ...formData, showPrice: !formData.showPrice })}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${formData.showPrice ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-gray-300 text-sm">Show Price ({formData.showPrice ? 'Visible' : 'Price on request'})</span>
              </label>
              <ImageUploader
                images={formData.images}
                pendingFiles={pendingImages}
                onAddFiles={handleAddImageFiles}
                onRemoveImage={handleRemoveUploadedImage}
                onRemovePendingFile={handleRemovePendingImage}
                uploading={imageUploading}
                error={imageUploadError}
              />
              <PdfUploader
                value={formData.pdfUrl}
                pendingFile={pendingPdf}
                onSelectFile={handleSelectPdf}
                onRemoveUploaded={handleRemoveUploadedPdf}
                onRemovePending={handleRemovePendingPdf}
                uploading={pdfUploading}
                error={pdfUploadError}
              />
              <textarea
                placeholder="Description"
                className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white h-24"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />

              <div className="border border-gray-700 rounded-lg p-4 bg-[#0f172a] space-y-4">
                <h3 className="text-lg font-semibold text-white">Technical Specifications</h3>

                <div className="space-y-5">
                  <div className="bg-[#111827] border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-semibold">Basic Information</h4>
                      <button type="button" onClick={() => addKeyValueRow('basicInformation')} className="text-cyan-400 text-sm font-medium">
                        Add
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formData.specifications.basicInformation.map((row, index) => (
                        <div key={`basic-${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-3">
                          <input
                            placeholder="Name"
                            className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white"
                            value={row.label}
                            onChange={(e) => updateKeyValueRow('basicInformation', index, 'label', e.target.value)}
                          />
                          <input
                            placeholder="Detail"
                            className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white"
                            value={row.value}
                            onChange={(e) => updateKeyValueRow('basicInformation', index, 'value', e.target.value)}
                          />
                          <button type="button" onClick={() => removeKeyValueRow('basicInformation', index)} className="px-3 text-red-400">
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#111827] border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-semibold">Operating Specifications</h4>
                      <button type="button" onClick={() => addKeyValueRow('operatingSpecifications')} className="text-cyan-400 text-sm font-medium">
                        Add
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formData.specifications.operatingSpecifications.map((row, index) => (
                        <div key={`operating-${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-3">
                          <input
                            placeholder="Name"
                            className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white"
                            value={row.label}
                            onChange={(e) => updateKeyValueRow('operatingSpecifications', index, 'label', e.target.value)}
                          />
                          <input
                            placeholder="Detail"
                            className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white"
                            value={row.value}
                            onChange={(e) => updateKeyValueRow('operatingSpecifications', index, 'value', e.target.value)}
                          />
                          <button type="button" onClick={() => removeKeyValueRow('operatingSpecifications', index)} className="px-3 text-red-400">
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {([
                    ['electricalSpecifications', 'Electrical Specifications'],
                    ['applications', 'Applications'],
                    ['features', 'Key Features'],
                    ['certifications', 'Certifications & Standards'],
                  ] as const).map(([sectionKey, title]) => (
                    <div key={sectionKey} className="bg-[#111827] border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-semibold">{title}</h4>
                        <button type="button" onClick={() => addTextRow(sectionKey)} className="text-cyan-400 text-sm font-medium">
                          Add
                        </button>
                      </div>
                      <div className="space-y-3">
                        {formData.specifications[sectionKey].map((row, index) => (
                          <div key={`${sectionKey}-${index}`} className="grid grid-cols-[1fr_auto] gap-3">
                            <input
                              placeholder="Detail"
                              className="w-full bg-[#0b1120] border border-gray-600 rounded p-3 text-white"
                              value={row}
                              onChange={(e) => updateTextRow(sectionKey, index, e.target.value)}
                            />
                            <button type="button" onClick={() => removeTextRow(sectionKey, index)} className="px-3 text-red-400">
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-cyan-600 text-white py-3 rounded font-bold hover:bg-cyan-500 disabled:opacity-60"
                >
                  {saving
                    ? (editingProductId ? 'Updating Product...' : 'Saving Product...')
                    : (editingProductId ? 'Update Product' : 'Save Product')}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 bg-transparent border border-gray-600 text-white py-3 rounded font-bold hover:bg-gray-700 disabled:opacity-60"
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

export default ProductsAdmin;
