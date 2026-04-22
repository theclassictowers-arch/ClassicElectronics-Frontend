'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api, { reorderCategories } from '@/services/api';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Save, Loader2, LayoutGrid } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

const SortableCategoryRow = ({ category }: { category: Category }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category._id });

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
      <div {...attributes} {...listeners} className="text-gray-500 cursor-grab active:cursor-grabbing hover:text-cyan-400 p-1">
        <GripVertical size={22} />
      </div>
      <div className="flex-1">
        <p className="text-white font-bold">{category.name}</p>
        <p className="text-xs text-gray-400 font-mono">/{category.slug}</p>
      </div>
    </div>
  );
};

const NavbarMenuSorterPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('categories');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to load categories', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCategories((prev) => {
        const oldIndex = prev.findIndex((c) => c._id === active.id);
        const newIndex = prev.findIndex((c) => c._id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return alert('Admin login required');

    setSaving(true);
    try {
      const orderedIds = categories.map(c => c._id);
      await reorderCategories(token, orderedIds);
      alert('Navbar menu sequence saved successfully!');
    } catch (error) {
      console.error('Failed to save order', error);
      alert('Failed to save sequence');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <LayoutGrid className="text-cyan-400" size={28} />
          <h1 className="text-3xl font-bold text-white">Navbar Menu Sorter</h1>
        </div>
        <button onClick={handleSave} disabled={loading || saving} className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Order
        </button>
      </div>

      {loading ? <div className="text-center py-20 text-cyan-400">Loading...</div> : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={categories.map(c => c._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {categories.map(category => <SortableCategoryRow key={category._id} category={category} />)}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default NavbarMenuSorterPage;