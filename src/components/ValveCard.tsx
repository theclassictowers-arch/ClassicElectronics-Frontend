'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Info, Settings } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { ValveProduct } from '@/types/valve';
import { resolveProductImages } from '@/lib/productImageMatcher';
import ProductImage from '@/components/ProductImage';

interface ValveCardProps {
    valve: ValveProduct;
}

const ValveCard: React.FC<ValveCardProps> = ({ valve }) => {
    const { addToCart } = useCart();
    const resolvedImages = resolveProductImages({
        name: valve.name,
        slug: valve.slug,
        description: valve.description,
        images: valve.images,
    });

    const imageSrc = resolvedImages.length > 0
        ? resolvedImages[0]
        : '/images/products/valvesSliderimg.jpeg';

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(valve);
    };

    // Get valve series color
    const getSeriesColor = (series: string) => {
        switch (series) {
            case 'SCG353': return 'bg-blue-900/30 border-blue-700';
            case 'SCR353': return 'bg-green-900/30 border-green-700';
            case 'GOYEN': return 'bg-purple-900/30 border-purple-700';
            default: return 'bg-gray-900/30 border-gray-700';
        }
    };

    const seriesColor = getSeriesColor(valve.specifications?.series);

    return (
        <div className="bg-[#1e293b] rounded-lg overflow-hidden group hover:shadow-xl hover:shadow-cyan-900/20 transition-all duration-300 border border-gray-800 flex flex-col h-full">
            {/* Series Badge */}
            <div className={`px-4 py-2 ${seriesColor} border-b border-gray-800 flex items-center justify-between`}>
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                    {valve.specifications?.series} Series
                </span>
                <span className="text-xs font-bold text-white/80">
                    {valve.category}
                </span>
            </div>

            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-white/5">
                <ProductImage
                    src={resolvedImages.length > 0 ? resolvedImages[0] : undefined}
                    alt={valve.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    fill
                />

                {/* Overlay Buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 gap-3">
                    <button
                        onClick={handleAddToCart}
                        className="bg-cyan-600 text-white px-6 py-2 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform flex items-center gap-2 hover:bg-cyan-500 w-48 justify-center"
                    >
                        <ShoppingCart size={18} /> Add to Cart
                    </button>
                    <Link
                        href={`/clientSide/item/${valve.slug}`}
                        className="bg-gray-800/80 text-white px-6 py-2 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform flex items-center gap-2 hover:bg-gray-700 w-48 justify-center"
                    >
                        <Info size={18} /> View Specs
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <Link href={`/clientSide/item/${valve.slug}`} className="block">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                                {valve.name}
                            </h3>
                            <p className="text-sm text-gray-400 mb-2">
                                {valve.specifications?.type}
                            </p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${seriesColor.replace('bg-', 'text-').replace('/30', '')}`}>
                            {valve.specifications?.portSize}
                        </span>
                    </div>

                    {/* Quick Specs */}
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Settings size={14} className="text-cyan-500" />
                            <span className="text-gray-300">Port: </span>
                            <span className="text-white font-medium">{valve.specifications?.portSize}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Settings size={14} className="text-cyan-500" />
                            <span className="text-gray-300">Pressure: </span>
                            <span className="text-white font-medium">
                                {valve.specifications?.workingPressure?.mpa?.[0]}-{valve.specifications?.workingPressure?.mpa?.[1]} Mpa
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Settings size={14} className="text-cyan-500" />
                            <span className="text-gray-300">Voltage: </span>
                            <span className="text-white font-medium">
                                {valve.specifications?.voltageOptions?.join('/')}
                            </span>
                        </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[40px]">
                        {valve.description}
                    </p>
                </Link>

                <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-cyan-400 uppercase tracking-wide">
                            {(valve as any).showPrice ? `Rs. ${Number(valve.price).toLocaleString()}` : 'Price on request'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${valve.stockStatus === 'In Stock' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                            {valve.stockStatus}
                        </span>
                    </div>
                    <Link
                        href={`/clientSide/item/${valve.slug}`}
                        className="text-xs text-gray-400 hover:text-white uppercase font-bold tracking-wider flex items-center gap-1"
                    >
                        Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ValveCard;
