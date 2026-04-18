'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ValveCard from '@/components/ValveCard';
import type { ValveProduct } from '@/types/valve';
import { getProducts } from '@/services/api';
import { allValves as localAscoValves } from '@/data/valvesData';
import { allGoyenValves as localGoyenValves } from '@/data/goyenValvesData';
import { Settings, Package, ArrowLeft, Filter } from 'lucide-react';
import Link from 'next/link';

const isValveProduct = (p: any): p is ValveProduct =>
    p && typeof p === 'object' && p.specifications && typeof p.specifications.series === 'string';

const ValveSeriesPage = () => {
    const params = useParams();
    const seriesSlug = (params.series as string).toUpperCase();

    const [selectedType, setSelectedType] = useState<string>('all');
    const [seriesValves, setSeriesValves] = useState<ValveProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchValves = async () => {
            setLoading(true);
            try {
                const data = await getProducts({ includeSpecs: true });
                const localFallback = [...localAscoValves, ...localGoyenValves];
                const source = (data && Array.isArray(data) && data.length > 0) ? data : localFallback;
                const allValves = source.filter(isValveProduct);
                const filtered = allValves.filter(v =>
                    v.specifications.series.toUpperCase() === seriesSlug
                );
                // Deduplicate
                const unique = filtered.filter(
                    (valve, index, self) => index === self.findIndex(v => v._id === valve._id)
                );
                setSeriesValves(unique);
            } catch (error) {
                console.error('Failed to fetch valves', error);
                // Fallback to local data on error
                const localFallback = [...localAscoValves, ...localGoyenValves];
                const filtered = localFallback.filter(v =>
                    v.specifications.series.toUpperCase() === seriesSlug
                );
                setSeriesValves(filtered);
            } finally {
                setLoading(false);
            }
        };
        fetchValves();
    }, [seriesSlug]);

    // Get unique types for this series
    const types = ['all', ...new Set(seriesValves.map(v => v.specifications.type))];

    // Filter by type if selected
    const filteredValves = selectedType === 'all'
        ? seriesValves
        : seriesValves.filter(v => v.specifications.type === selectedType);

    // Series info
    const seriesInfo: Record<string, { name: string; description: string; color: string; bgColor: string }> = {
        'SCG353': {
            name: 'SCG353 Series',
            description: 'Right Angle Type valves with threaded connections. Port sizes from 3/4" to 3". Ideal for dust collection systems and industrial automation.',
            color: 'text-blue-400',
            bgColor: 'bg-blue-900/20 border-blue-800'
        },
        'SCR353': {
            name: 'SCR353 Series',
            description: 'Submerged Type valves designed for direct manifold mounting. Port sizes 3" to 3.5". Perfect for large industrial dust collectors.',
            color: 'text-green-400',
            bgColor: 'bg-green-900/20 border-green-800'
        },
        'GOYEN': {
            name: 'GOYEN Series',
            description: 'High-performance solenoid valves from 20mm to 76mm port sizes. Japanese quality standards with international certifications.',
            color: 'text-purple-400',
            bgColor: 'bg-purple-900/20 border-purple-800'
        }
    };

    const currentSeries = seriesInfo[seriesSlug] || {
        name: seriesSlug + ' Series',
        description: 'Industrial valves for automation applications.',
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-900/20 border-cyan-800'
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="mb-6">
                <Link href="/clientSide/valves" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                    Back to All Valves
                </Link>
            </div>

            {/* Header */}
            <div className={`rounded-lg p-8 mb-8 border ${currentSeries.bgColor}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${currentSeries.bgColor}`}>
                                <Settings className={currentSeries.color} size={24} />
                            </div>
                            <span className={`${currentSeries.color} font-bold uppercase tracking-wider text-sm`}>{seriesSlug} Series</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">{currentSeries.name}</h1>
                        <p className="text-gray-300 mt-3 max-w-2xl">
                            {currentSeries.description}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 ${currentSeries.color}`}>
                            <Package size={18} />
                            <span className="font-bold">{filteredValves.length} Products</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Type Filter */}
            {!loading && types.length > 2 && (
                <div className="bg-[#1e293b] rounded-lg p-6 mb-8 border border-gray-800">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Filter size={18} />
                            <span className="font-medium">Filter by Type:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {types.map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        selectedType === type
                                            ? 'bg-cyan-600 text-white'
                                            : 'bg-[#0f172a] text-gray-300 hover:bg-cyan-900/30 border border-gray-700'
                                    }`}
                                >
                                    {type === 'all' ? 'All Types' : type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Specifications Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#1e293b] rounded-lg p-4 border border-gray-800 text-center">
                    <div className="text-2xl font-bold text-white mb-1">{filteredValves.length}</div>
                    <div className="text-gray-400 text-sm">Models Available</div>
                </div>
                <div className="bg-[#1e293b] rounded-lg p-4 border border-gray-800 text-center">
                    <div className="text-2xl font-bold text-white mb-1">0.3-0.8</div>
                    <div className="text-gray-400 text-sm">Working Pressure (Mpa)</div>
                </div>
                <div className="bg-[#1e293b] rounded-lg p-4 border border-gray-800 text-center">
                    <div className="text-2xl font-bold text-white mb-1">1M+</div>
                    <div className="text-gray-400 text-sm">Life Cycles</div>
                </div>
                <div className="bg-[#1e293b] rounded-lg p-4 border border-gray-800 text-center">
                    <div className="text-2xl font-bold text-white mb-1">CE/ISO</div>
                    <div className="text-gray-400 text-sm">Certified</div>
                </div>
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="bg-[#1e293b] h-[400px] rounded-lg animate-pulse border border-gray-800"></div>
                    ))}
                </div>
            ) : filteredValves.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredValves.map(valve => (
                        <ValveCard key={valve._id} valve={valve} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-[#1e293b] rounded-lg border border-gray-800 border-dashed">
                    <Package size={48} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl text-gray-400 font-medium">No valves found in this series.</h3>
                    <p className="text-gray-500 mt-2">Try selecting a different type or browse all valves.</p>
                    <Link href="/clientSide/valves" className="inline-block mt-6 text-cyan-400 hover:text-white font-medium">
                        View All Valves
                    </Link>
                </div>
            )}

            {/* Features Section */}
            <div className="mt-16 bg-[#0b1120] rounded-lg p-8 border border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-6">Series Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Settings className="text-cyan-400" size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold mb-1">High Quality Materials</h3>
                            <p className="text-gray-400 text-sm">Built with industrial-grade materials for durability and reliability.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Settings className="text-cyan-400" size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold mb-1">Multiple Voltage Options</h3>
                            <p className="text-gray-400 text-sm">Available in AC110V, AC220V, and DC24V configurations.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Settings className="text-cyan-400" size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold mb-1">Long Service Life</h3>
                            <p className="text-gray-400 text-sm">Over 1 million cycles guaranteed with proper maintenance.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ValveSeriesPage;
