'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff, Upload, X, Loader2, ImagePlus, ChevronUp, ChevronDown, Link as LinkIcon, Type, AlignLeft, Sparkles } from 'lucide-react';
import { API_URL as API_BASE, SERVER_BASE } from '@/lib/apiConfig';
import { getSliders, createSlider, updateSlider, deleteSlider, reorderSliders, type Slide } from '@/services/api';

const getFullUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${SERVER_BASE}${url}`;
  return url;
};

type SlideFormData = {
  title: string;
  subtitle: string;
  highlight: string;
  bgImage: string;
  link: string;
  isActive: boolean;
};

const EMPTY_FORM: SlideFormData = {
  title: '',
  subtitle: '',
  highlight: '',
  bgImage: '',
  link: '',
  isActive: true,
};

const SlidersAdmin = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SlideFormData>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSliders();
      setSlides(data.sort((a, b) => a.order - b.order));
    } catch {
      console.error('Failed to load slides');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSlides(); }, [fetchSlides]);

  const getToken = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) { alert('Please login as admin first'); return null; }
    return token;
  };

  // Image upload handler
  const handleImageUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];

    for (const file of fileArray) {
      if (!allowedTypes.includes(file.type)) {
        alert(`"${file.name}" is not supported. Use JPEG, PNG, WebP, SVG, or GIF.`);
        return;
      }
      if (file.size > maxSize) {
        alert(`"${file.name}" is too large. Maximum 5MB.`);
        return;
      }
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const fd = new FormData();
      fileArray.forEach((file) => fd.append('images', file));

      const res = await axios.post(`${API_BASE}/upload/images`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const urls = res.data.urls as string[];
      if (urls && urls.length > 0) {
        setFormData(prev => ({ ...prev, bgImage: urls[0] }));
      }
    } catch {
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    try {
      if (editingId) {
        await updateSlider(token, editingId, formData);
      } else {
        if (slides.length >= 9) { alert('Maximum 9 slides allowed'); return; }
        await createSlider(token, { ...formData, order: slides.length });
      }
      setShowModal(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);
      await fetchSlides();
    } catch (error) {
      console.error('Failed to save slide', error);
      alert('Error saving slide');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slide?')) return;
    const token = getToken();
    if (!token) return;
    try {
      await deleteSlider(token, id);
      await fetchSlides();
    } catch (error) {
      console.error('Failed to delete slide', error);
    }
  };

  const handleToggleActive = async (slide: Slide) => {
    const token = getToken();
    if (!token) return;
    try {
      await updateSlider(token, slide._id, { isActive: !slide.isActive });
      await fetchSlides();
    } catch (error) {
      console.error('Failed to toggle slide', error);
    }
  };

  const moveSlide = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= slides.length) return;
    const token = getToken();
    if (!token) return;

    const reordered = [...slides];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    setSlides(reordered);

    try {
      await reorderSliders(token, reordered.map(s => s._id));
    } catch (error) {
      console.error('Failed to reorder', error);
      await fetchSlides();
    }
  };

  const openEdit = (slide: Slide) => {
    setEditingId(slide._id);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      highlight: slide.highlight,
      bgImage: slide.bgImage,
      link: slide.link,
      isActive: slide.isActive,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Slider Management</h1>
          <p className="text-gray-400 text-sm mt-1">Manage hero slider slides for the homepage</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setEditingId(null); setFormData(EMPTY_FORM); setShowModal(true); }}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded flex items-center gap-2 font-bold transition-colors"
            disabled={slides.length >= 9}
          >
            <Plus size={18} /> Add Slide
          </button>
        </div>
      </div>

      {/* Slides List */}
      <div className="bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : slides.length === 0 ? (
          <div className="p-12 text-center">
            <ImagePlus size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 mb-2">No slides found</p>
            <p className="text-gray-500 text-sm">Add your first slide or seed default slides to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {slides.map((slide, index) => (
              <div key={slide._id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                {/* Reorder */}
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveSlide(index, -1)} disabled={index === 0} className="text-gray-500 hover:text-white disabled:opacity-20 p-1 transition-colors">
                    <ChevronUp size={16} />
                  </button>
                  <button onClick={() => moveSlide(index, 1)} disabled={index === slides.length - 1} className="text-gray-500 hover:text-white disabled:opacity-20 p-1 transition-colors">
                    <ChevronDown size={16} />
                  </button>
                </div>

                {/* Order Number */}
                <span className="text-gray-600 text-xs font-mono w-5 text-center">{index + 1}</span>

                {/* Thumbnail */}
                <div className="w-28 h-16 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0 border border-gray-700">
                  {slide.bgImage ? (
                    <img src={getFullUrl(slide.bgImage)} alt={slide.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <ImagePlus size={20} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{slide.title}</h3>
                  <p className="text-gray-400 text-sm truncate">{slide.subtitle}</p>
                  <p className="text-gray-500 text-xs truncate mt-0.5">{slide.link}</p>
                </div>

                {/* Status Badge */}
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${slide.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {slide.isActive ? 'Active' : 'Inactive'}
                </span>

                {/* Actions */}
                <div className="flex gap-1">
                  <button onClick={() => handleToggleActive(slide)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title={slide.isActive ? 'Deactivate' : 'Activate'}>
                    {slide.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button onClick={() => openEdit(slide)} className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors" title="Edit">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(slide._id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-gray-500 text-sm mt-4">{slides.length} / 9 slides used</p>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#1e293b] rounded-2xl max-w-2xl w-full border border-gray-700 my-8 shadow-2xl">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">
                {editingId ? 'Edit Slide' : 'Add New Slide'}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {editingId ? 'Update the slide details below' : 'Fill in the details to create a new hero slide'}
              </p>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">

              {/* Slide Title */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Type size={14} className="text-cyan-400" />
                  Slide Title <span className="text-red-400">*</span>
                </label>
                <input
                  placeholder="e.g. Pneumatic Purging Valves"
                  className="w-full bg-[#0b1120] border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <p className="text-gray-500 text-xs mt-1">The main heading displayed on the slide</p>
              </div>

              {/* Highlight Text */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Sparkles size={14} className="text-cyan-400" />
                  Highlight Text <span className="text-red-400">*</span>
                </label>
                <input
                  placeholder="e.g. Purging Valves"
                  className="w-full bg-[#0b1120] border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
                  value={formData.highlight}
                  onChange={(e) => setFormData({ ...formData, highlight: e.target.value })}
                  required
                />
                <p className="text-gray-500 text-xs mt-1">This part of the title will be shown in gradient color (cyan to blue)</p>
              </div>

              {/* Subtitle */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <AlignLeft size={14} className="text-cyan-400" />
                  Subtitle <span className="text-red-400">*</span>
                </label>
                <textarea
                  placeholder="e.g. Engineered for long life in tough industrial conditions."
                  className="w-full bg-[#0b1120] border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors resize-none h-20"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  required
                />
                <p className="text-gray-500 text-xs mt-1">A short description shown below the title</p>
              </div>

              {/* Background Image */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <ImagePlus size={14} className="text-cyan-400" />
                  Background Image <span className="text-red-400">*</span>
                </label>

                {/* Current Image Preview */}
                {formData.bgImage ? (
                  <div className="relative mb-3 rounded-xl overflow-hidden border border-gray-700 group">
                    <img
                      src={getFullUrl(formData.bgImage)}
                      alt="Slide preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, bgImage: '' })}
                        className="bg-red-500 hover:bg-red-400 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-gray-300 text-xs px-2 py-1 rounded">
                      {formData.bgImage.length > 50 ? '...' + formData.bgImage.slice(-50) : formData.bgImage}
                    </div>
                  </div>
                ) : null}

                {/* Upload Zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-cyan-400 bg-cyan-500/10'
                      : 'border-gray-600 hover:border-gray-500 bg-[#0b1120]'
                  } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleImageUpload(e.target.files);
                        e.target.value = '';
                      }
                    }}
                    className="hidden"
                  />

                  {uploading ? (
                    <div className="flex flex-col items-center gap-2 text-cyan-400">
                      <Loader2 size={32} className="animate-spin" />
                      <span className="text-sm font-medium">Uploading image...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Upload size={28} />
                      <span className="text-sm">
                        Drag & drop an image here, or <span className="text-cyan-400 underline">browse files</span>
                      </span>
                      <span className="text-xs text-gray-500">JPEG, PNG, WebP, SVG, GIF — Max 5MB</span>
                    </div>
                  )}
                </div>

                {/* OR separator + URL input */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 h-px bg-gray-700"></div>
                  <span className="text-gray-500 text-xs font-medium">OR enter URL</span>
                  <div className="flex-1 h-px bg-gray-700"></div>
                </div>
                <input
                  placeholder="https://example.com/image.jpg or /images/products/photo.png"
                  className="w-full bg-[#0b1120] border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors mt-3 text-sm"
                  value={formData.bgImage}
                  onChange={(e) => setFormData({ ...formData, bgImage: e.target.value })}
                />
              </div>

              {/* Link */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <LinkIcon size={14} className="text-cyan-400" />
                  Button Link <span className="text-red-400">*</span>
                </label>
                <input
                  placeholder="e.g. /category/purging-valves"
                  className="w-full bg-[#0b1120] border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  required
                />
                <p className="text-gray-500 text-xs mt-1">Where the &quot;Explore Products&quot; button will navigate to</p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between bg-[#0b1120] border border-gray-600 rounded-lg p-4">
                <div>
                  <p className="text-sm font-medium text-gray-300">Slide Visibility</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formData.isActive ? 'This slide is visible on the homepage' : 'This slide is hidden from the homepage'}
                  </p>
                </div>
                <div
                  className={`relative w-12 h-7 rounded-full cursor-pointer transition-colors ${formData.isActive ? 'bg-cyan-600' : 'bg-gray-600'}`}
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                >
                  <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform shadow-md ${formData.isActive ? 'translate-x-5' : ''}`} />
                </div>
              </div>

              {/* Live Preview */}
              {(formData.title || formData.bgImage) && (
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Live Preview</label>
                  <div className="relative h-36 rounded-xl overflow-hidden border border-gray-700">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3d475f] via-[#424c65] to-[#fcfcfc]">
                      {formData.bgImage && (
                        <div
                          className="absolute inset-0 bg-center bg-cover opacity-10 mix-blend-overlay"
                          style={{ backgroundImage: `url('${getFullUrl(formData.bgImage)}')` }}
                        />
                      )}
                    </div>
                    <div className="relative z-10 h-full flex items-center px-6">
                      <div>
                        <p className="text-xs text-cyan-400 font-bold tracking-widest uppercase mb-1">Preview</p>
                        <h3 className="text-xl font-black text-white leading-tight">
                          {formData.title ? formData.title.replace(formData.highlight, '') : 'Slide Title'}
                          {formData.highlight && (
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"> {formData.highlight}</span>
                          )}
                        </h3>
                        <p className="text-gray-300 text-sm mt-1 max-w-md">{formData.subtitle || 'Subtitle goes here'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>

            {/* Modal Footer */}
            <div className="px-8 py-5 border-t border-gray-700 flex gap-4">
              <button
                type="submit"
                onClick={handleSubmit}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-lg font-bold transition-colors"
              >
                {editingId ? 'Update Slide' : 'Create Slide'}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 bg-transparent border border-gray-600 text-white py-3 rounded-lg font-bold hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlidersAdmin;
