'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/context/CartContext';
import ProductImage from '@/components/ProductImage';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addToCart } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
    };

    return (
        <div className="bg-[#1e293b] rounded-lg overflow-hidden group hover:shadow-xl hover:shadow-cyan-900/20 transition-all duration-300 border border-gray-800 flex flex-col h-full">
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-white/5">
                <ProductImage
                    src={product.images && product.images.length > 0 ? product.images[0] : undefined}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    fill
                />

                {/* Overlay Button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <button
                        onClick={handleAddToCart}
                        className="bg-cyan-600 text-white px-6 py-2 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform flex items-center gap-2 hover:bg-cyan-500"
                    >
                        <ShoppingCart size={18} /> Add to Cart
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <Link href={`/clientSide/item/${product.slug}`} className="block">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2 min-h-[56px]">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-auto flex items-center justify-between">
                    <div className="text-sm font-bold text-cyan-400 uppercase tracking-wide">
                        {product.showPrice ? `Rs. ${Number(product.price).toLocaleString()}` : 'Price on request'}
                    </div>
                    <Link
                        href={`/clientSide/item/${product.slug}`}
                        className="text-xs text-gray-400 hover:text-white uppercase font-bold tracking-wider hover:text-cyan-400 transition-colors"
                    >
                        View Details →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
