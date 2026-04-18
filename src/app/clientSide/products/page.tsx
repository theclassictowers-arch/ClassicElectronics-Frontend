'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/services/api';
import { Product } from '@/context/CartContext';
import { allValves as localAscoValves } from '@/data/valvesData';
import { allGoyenValves as localGoyenValves } from '@/data/goyenValvesData';
import { fallbackProducts } from '@/data/dummyData';
import { Package } from 'lucide-react';

const ProductsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('default');
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getProducts();
                if (data && Array.isArray(data)) {
                    setAllProducts(data);
                }
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Get unique categories
    const categories = ['all', ...new Set(allProducts.map((p: any) => p.category?.name || p.category || 'Other').filter(Boolean))];

    // Filter products
    let filteredProducts = selectedCategory === 'all'
        ? allProducts
        : allProducts.filter((p: any) => (p.category?.name || p.category) === selectedCategory);

    // Sort products
    if (sortBy === 'name') {
        filteredProducts = [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name));
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-[#1e293b] rounded-lg p-8 mb-8 border border-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <span className="text-cyan-500 font-bold uppercase tracking-wider text-xs mb-2 block">Our Complete Range</span>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">All Products</h1>
                        <p className="text-gray-400 mt-2 max-w-2xl">Browse our complete catalog of industrial valves, controllers, electronics, and more.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400 text-sm">{filteredProducts.length} Products Found</span>
                    </div>
                </div>
            </div>

            {!loading && allProducts.length > 0 && (
                <div className="bg-[#1e293b] rounded-lg p-6 mb-8 border border-gray-800">
                    <div className="flex flex-wrap gap-6 items-center justify-between">
                        <div className="flex flex-wrap gap-6">
                            <div className="flex items-center gap-3">
                                <label className="text-gray-400 text-sm font-medium">Category:</label>
                                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="bg-[#0f172a] text-white px-4 py-2 rounded border border-gray-700 focus:border-cyan-500 outline-none">
                                    {categories.map(cat => (<option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>))}
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-gray-400 text-sm font-medium">Sort By:</label>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-[#0f172a] text-white px-4 py-2 rounded border border-gray-700 focus:border-cyan-500 outline-none">
                                    <option value="default">Default</option>
                                    <option value="name">Name: A to Z</option>
                                </select>
                            </div>
                        </div>
                        {selectedCategory !== 'all' && (
                            <button onClick={() => setSelectedCategory('all')} className="text-cyan-400 hover:text-white text-sm font-medium border border-cyan-900 bg-cyan-900/10 px-4 py-2 rounded hover:bg-cyan-900/30 transition-colors">Clear Filter</button>
                        )}
                    </div>
                </div>
            )}

            {!loading && categories.filter(c => c !== 'all').length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {categories.filter(c => c !== 'all').map(category => (
                        <div key={category} onClick={() => setSelectedCategory(category)} className={`cursor-pointer bg-[#1e293b] border rounded-lg p-4 hover:border-cyan-600 transition-colors ${selectedCategory === category ? 'border-cyan-500 ring-2 ring-cyan-500/30' : 'border-gray-800'}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-cyan-900/30 rounded-lg flex items-center justify-center"><Package className="text-cyan-400" size={20} /></div>
                                <div>
                                    <h3 className="text-white font-medium">{category}</h3>
                                    <p className="text-gray-400 text-xs">{allProducts.filter((p: any) => (p.category?.name || p.category) === category).length} Products</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (<div key={n} className="bg-[#1e293b] h-[400px] rounded-lg animate-pulse border border-gray-800"></div>))}
                </div>
            ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredProducts.map(product => (<ProductCard key={product._id} product={product} />))}
                </div>
            ) : (
                <div className="text-center py-20 bg-[#1e293b] rounded-lg border border-gray-800 border-dashed">
                    <h3 className="text-xl text-gray-400 font-medium">No products found.</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your filters.</p>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;
