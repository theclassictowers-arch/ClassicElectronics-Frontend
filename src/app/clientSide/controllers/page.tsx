'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/services/api';
import { Product } from '@/context/CartContext';
import { Settings, Cpu, Activity, Timer, Package } from 'lucide-react';
import Link from 'next/link';

const ControllersPage = () => {
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
    const [controllers, setControllers] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getProducts();
                if (data && Array.isArray(data)) {
                    const filtered = data.filter((p: any) =>
                        p.category?.slug?.includes('controller') ||
                        p.categoryId?.slug?.includes('controller') ||
                        (p.category && typeof p.category === 'string' && p.category === 'Controllers')
                    );
                    setControllers(filtered);
                }
            } catch (error) {
                console.error('Failed to fetch controllers', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Get subcategories
    const subcategories = ['all', ...new Set(controllers.map((c: any) => c.subcategory || c.category?.name || 'Other').filter(Boolean))];

    // Filter controllers
    const filteredControllers = selectedSubcategory === 'all'
        ? controllers
        : controllers.filter((c: any) => (c.subcategory || c.category?.name) === selectedSubcategory);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-[#1e293b] rounded-lg p-8 mb-8 border border-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <span className="text-cyan-500 font-bold uppercase tracking-wider text-xs mb-2 block">Industrial Automation</span>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Controllers</h1>
                        <p className="text-gray-400 mt-2 max-w-2xl">Advanced sequential timer controllers and PLC-based systems for industrial automation and dust collection systems.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400 text-sm">{filteredControllers.length} Products Found</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div onClick={() => setSelectedSubcategory('Sequential Timer Controllers')} className={`cursor-pointer bg-orange-900/10 border rounded-xl p-6 hover:bg-orange-900/20 transition-colors ${selectedSubcategory === 'Sequential Timer Controllers' ? 'border-orange-500 ring-2 ring-orange-500/30' : 'border-orange-800'}`}>
                    <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 bg-orange-900/30 rounded-lg flex items-center justify-center"><Timer className="text-orange-400" size={20} /></div><h3 className="text-lg font-bold text-white">Sequential Timer</h3></div>
                    <p className="text-gray-300 text-sm">Programmable sequential timer controllers with multiple outputs.</p>
                </div>
                <div onClick={() => setSelectedSubcategory('PLC Based Controllers')} className={`cursor-pointer bg-blue-900/10 border rounded-xl p-6 hover:bg-blue-900/20 transition-colors ${selectedSubcategory === 'PLC Based Controllers' ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-blue-800'}`}>
                    <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center"><Cpu className="text-blue-400" size={20} /></div><h3 className="text-lg font-bold text-white">PLC Based</h3></div>
                    <p className="text-gray-300 text-sm">Programmable Logic Controllers for complex automation needs.</p>
                </div>
                <div onClick={() => setSelectedSubcategory('Differential Pressure Controllers')} className={`cursor-pointer bg-green-900/10 border rounded-xl p-6 hover:bg-green-900/20 transition-colors ${selectedSubcategory === 'Differential Pressure Controllers' ? 'border-green-500 ring-2 ring-green-500/30' : 'border-green-800'}`}>
                    <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center"><Activity className="text-green-400" size={20} /></div><h3 className="text-lg font-bold text-white">Differential Pressure</h3></div>
                    <p className="text-gray-300 text-sm">Controllers for pressure monitoring and automated control.</p>
                </div>
                <div onClick={() => setSelectedSubcategory('Multi-Channel Controllers')} className={`cursor-pointer bg-purple-900/10 border rounded-xl p-6 hover:bg-purple-900/20 transition-colors ${selectedSubcategory === 'Multi-Channel Controllers' ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-purple-800'}`}>
                    <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center"><Settings className="text-purple-400" size={20} /></div><h3 className="text-lg font-bold text-white">Multi-Channel</h3></div>
                    <p className="text-gray-300 text-sm">Multi-channel controllers for large-scale industrial systems.</p>
                </div>
            </div>

            {selectedSubcategory !== 'all' && (
                <div className="mb-6"><button onClick={() => setSelectedSubcategory('all')} className="text-cyan-400 hover:text-white text-sm font-medium border border-cyan-900 bg-cyan-900/10 px-4 py-2 rounded hover:bg-cyan-900/30 transition-colors">Show All Controllers</button></div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map(n => (<div key={n} className="bg-[#1e293b] h-[400px] rounded-lg animate-pulse border border-gray-800"></div>))}
                </div>
            ) : filteredControllers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredControllers.map(product => (<ProductCard key={product._id} product={product} />))}
                </div>
            ) : (
                <div className="text-center py-20 bg-[#1e293b] rounded-lg border border-gray-800 border-dashed">
                    <Package size={48} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl text-gray-400 font-medium">No controllers found in this category.</h3>
                    <p className="text-gray-500 mt-2">More products coming soon. Contact us for custom solutions.</p>
                    <Link href="/clientSide/contact" className="inline-block mt-6 text-cyan-400 hover:text-white text-sm font-medium border border-cyan-900 bg-cyan-900/10 px-6 py-3 rounded hover:bg-cyan-900/30 transition-colors">Request Custom Controller</Link>
                </div>
            )}

            <div className="mt-16 bg-[#0b1120] rounded-lg p-8 border border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-6">Controller Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-4"><div className="w-12 h-12 bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0"><Timer className="text-cyan-400" size={24} /></div><div><h3 className="text-white font-bold mb-2">Precise Timing</h3><p className="text-gray-400 text-sm">Accurate timing control with programmable intervals for optimal valve sequencing.</p></div></div>
                    <div className="flex items-start gap-4"><div className="w-12 h-12 bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0"><Cpu className="text-cyan-400" size={24} /></div><div><h3 className="text-white font-bold mb-2">Advanced Logic</h3><p className="text-gray-400 text-sm">PLC-based controllers with programmable logic for complex automation needs.</p></div></div>
                    <div className="flex items-start gap-4"><div className="w-12 h-12 bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0"><Activity className="text-cyan-400" size={24} /></div><div><h3 className="text-white font-bold mb-2">Real-time Monitoring</h3><p className="text-gray-400 text-sm">Monitor pressure differentials and system status in real-time.</p></div></div>
                </div>
            </div>
        </div>
    );
};

export default ControllersPage;
