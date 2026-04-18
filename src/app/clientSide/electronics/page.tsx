'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/services/api';
import { Product } from '@/context/CartContext';
import { CircuitBoard, Zap, Gauge, Package, Cpu } from 'lucide-react';
import Link from 'next/link';

const ElectronicsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [allElectronics, setAllElectronics] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getProducts();
                if (data && Array.isArray(data)) {
                    const electronics = data.filter((p: any) =>
                        p.category?.slug === 'control-boards' ||
                        p.category?.slug === 'power-supplies' ||
                        p.category?.slug === 'sensors' ||
                        p.categoryId?.slug === 'control-boards' ||
                        p.categoryId?.slug === 'power-supplies' ||
                        p.categoryId?.slug === 'sensors' ||
                        (p.category && typeof p.category === 'string' && ['Electronics', 'Sensors'].includes(p.category))
                    );
                    setAllElectronics(electronics);
                }
            } catch (error) {
                console.error('Failed to fetch electronics', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Get unique subcategories
    const subcategories = ['all', ...new Set(allElectronics.map((e: any) => e.subcategory || e.category?.name || 'Other').filter(Boolean))];

    // Filter products
    const filteredProducts = selectedCategory === 'all'
        ? allElectronics
        : allElectronics.filter((e: any) => (e.subcategory || e.category?.name) === selectedCategory);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="bg-[#1e293b] rounded-lg p-8 mb-8 border border-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <span className="text-cyan-500 font-bold uppercase tracking-wider text-xs mb-2 block">Industrial Electronics</span>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Electronics & Components</h1>
                        <p className="text-gray-400 mt-2 max-w-2xl">
                            High-quality control boards, power supplies, sensors and electronic components for industrial automation systems.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400 text-sm">{filteredProducts.length} Products Found</span>
                    </div>
                </div>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div onClick={() => setSelectedCategory('Control Boards')} className={`cursor-pointer bg-blue-900/10 border rounded-xl p-6 hover:bg-blue-900/20 transition-colors ${selectedCategory === 'Control Boards' ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-blue-800'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center"><CircuitBoard className="text-blue-400" size={20} /></div>
                        <h3 className="text-lg font-bold text-white">Control Boards</h3>
                    </div>
                    <p className="text-gray-300 text-sm">Main control boards and PCBs for industrial equipment.</p>
                </div>
                <div onClick={() => setSelectedCategory('Power Supplies')} className={`cursor-pointer bg-yellow-900/10 border rounded-xl p-6 hover:bg-yellow-900/20 transition-colors ${selectedCategory === 'Power Supplies' ? 'border-yellow-500 ring-2 ring-yellow-500/30' : 'border-yellow-800'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-yellow-900/30 rounded-lg flex items-center justify-center"><Zap className="text-yellow-400" size={20} /></div>
                        <h3 className="text-lg font-bold text-white">Power Supplies</h3>
                    </div>
                    <p className="text-gray-300 text-sm">Industrial power supplies and voltage regulators.</p>
                </div>
                <div onClick={() => setSelectedCategory('Pressure Sensors')} className={`cursor-pointer bg-green-900/10 border rounded-xl p-6 hover:bg-green-900/20 transition-colors ${selectedCategory === 'Pressure Sensors' ? 'border-green-500 ring-2 ring-green-500/30' : 'border-green-800'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center"><Gauge className="text-green-400" size={20} /></div>
                        <h3 className="text-lg font-bold text-white">Sensors</h3>
                    </div>
                    <p className="text-gray-300 text-sm">Pressure sensors and instrumentation devices.</p>
                </div>
                <div onClick={() => setSelectedCategory('all')} className={`cursor-pointer bg-purple-900/10 border rounded-xl p-6 hover:bg-purple-900/20 transition-colors ${selectedCategory === 'all' ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-purple-800'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center"><Cpu className="text-purple-400" size={20} /></div>
                        <h3 className="text-lg font-bold text-white">All Electronics</h3>
                    </div>
                    <p className="text-gray-300 text-sm">View complete electronics catalog.</p>
                    <div className="mt-4 flex items-center text-purple-400 text-sm"><Package size={14} className="mr-2" />{allElectronics.length} Products</div>
                </div>
            </div>

            {selectedCategory !== 'all' && (
                <div className="mb-6">
                    <button onClick={() => setSelectedCategory('all')} className="text-cyan-400 hover:text-white text-sm font-medium border border-cyan-900 bg-cyan-900/10 px-4 py-2 rounded hover:bg-cyan-900/30 transition-colors">Show All Electronics</button>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map(n => (<div key={n} className="bg-[#1e293b] h-[400px] rounded-lg animate-pulse border border-gray-800"></div>))}
                </div>
            ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredProducts.map(product => (<ProductCard key={product._id} product={product} />))}
                </div>
            ) : (
                <div className="text-center py-20 bg-[#1e293b] rounded-lg border border-gray-800 border-dashed">
                    <Package size={48} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl text-gray-400 font-medium">No products found in this category.</h3>
                    <p className="text-gray-500 mt-2">More products coming soon. Contact us for custom solutions.</p>
                    <Link href="/clientSide/contact" className="inline-block mt-6 text-cyan-400 hover:text-white text-sm font-medium border border-cyan-900 bg-cyan-900/10 px-6 py-3 rounded hover:bg-cyan-900/30 transition-colors">Request Custom Electronics</Link>
                </div>
            )}

            <div className="mt-16 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-lg p-8 border border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">Custom Electronics Solutions</h2>
                        <p className="text-gray-300 mb-6">Need custom control boards or specialized electronic components? We offer custom design and manufacturing services for industrial automation applications.</p>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-cyan-500 rounded-full"></span>Custom PCB Design & Manufacturing</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-cyan-500 rounded-full"></span>Industrial Grade Power Supply Systems</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-cyan-500 rounded-full"></span>Sensor Integration Solutions</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-cyan-500 rounded-full"></span>Complete Control Panel Assembly</li>
                        </ul>
                    </div>
                    <div className="text-center">
                        <Link href="/clientSide/contact" className="inline-block bg-white text-black hover:bg-gray-200 px-8 py-4 rounded font-bold uppercase tracking-wide transition-colors">Request a Quote</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ElectronicsPage;
