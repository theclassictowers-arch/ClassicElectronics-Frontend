'use client';

import React, { useState, useEffect } from 'react';
import { GripVertical, Save, Loader2, Filter } from 'lucide-react';
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

interface SortableItem {
  _id: string;
  name: string;
  order?: number;
  category?: string;
}

interface AdminMenuSorterProps {
  categories: string[];
  fetchItemsByCategory: (category: string) => Promise<SortableItem[]>;
  onSave: (orderedIds: string[]) => Promise<void>;
  title: string;
}

/* ------------------------------------------------------------------ */
/*  Sortable Row Item Component                                       */
/* ------------------------------------------------------------------ */

const SortableProductRow = ({ item }: { item: SortableItem }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-3 rounded border transition-colors ${
        isDragging 
          ? 'bg-cyan-900/40 border-cyan-500 shadow-2xl scale-[1.02]' 
          : 'bg-[#0b1120] border-gray-700 hover:border-gray-500'
      }`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="text-gray-500 cursor-grab active:cursor-grabbing hover:text-cyan-400 p-1"
      >
        <GripVertical size={20} />
      </div>
      <div className="flex-1 text-white font-medium select-none">
        {item.name}
      </div>
      <div className="text-[10px] text-gray-500 font-mono bg-gray-800 px-2 py-1 rounded">
        ID: {item._id.slice(-6)}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main Sorter Component                                             */
/* ------------------------------------------------------------------ */

export const AdminMenuSorter: React.FC<AdminMenuSorterProps> = ({ 
  categories, 
  fetchItemsByCategory, 
  onSave, 
  title 
}) => {
  const [items, setItems] = useState<SortableItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (selectedCategory) {
      (async () => {
        setLoading(true);
        const data = await fetchItemsByCategory(selectedCategory);
        setItems(data);
        setLoading(false);
      })();
    }
  }, [selectedCategory, fetchItemsByCategory]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i._id === active.id);
        const newIndex = prev.findIndex((i) => i._id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const orderedIds = items.map(item => item._id);
    await onSave(orderedIds);
    setSaving(false);
  };

  return (
    <div className="bg-[#1e293b] p-4 md:p-6 rounded-xl border border-gray-800 shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {title}
          </h2>
          <p className="text-gray-400 text-sm mt-1">Drag handle to reorder products within a category.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#0b1120] text-white pl-10 pr-4 py-2 rounded border border-gray-700 focus:border-cyan-500 outline-none transition-all appearance-none"
            >
              <option value="">Select Category...</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <button
            disabled={items.length === 0 || saving}
            onClick={handleSave}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors font-bold uppercase text-xs h-[42px]"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Order
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-cyan-500"><Loader2 className="animate-spin" size={40} /></div>
      ) : items.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item) => (
                <SortableProductRow key={item._id} item={item} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-lg text-gray-500 italic">
          {selectedCategory ? 'No products found in this category.' : 'Please select a category to start reordering.'}
        </div>
      )}
    </div>
  );
};