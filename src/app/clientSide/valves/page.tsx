'use client';

import React, { useState, useEffect } from 'react';
import ValveCard from '@/components/ValveCard';
import type { ValveProduct } from '@/types/valve';
import { getProducts } from '@/services/api';
import { allValves as localAscoValves } from '@/data/valvesData';
import { allGoyenValves as localGoyenValves } from '@/data/goyenValvesData';
import { Filter, Settings, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const isValveProduct = (p: any): p is ValveProduct =>
    p && typeof p === 'object' && p.specifications && typeof p.specifications.series === 'string';

const ValvesPage = () => {
    const [selectedSeries, setSelectedSeries] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [allValvesCombined, setAllValvesCombined] = useState<ValveProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchValves = async () => {
            setLoading(true);
            try {
                const data = await getProducts({ includeSpecs: true });
                if (data && Array.isArray(data) && data.length > 0) {
                    const valves = data.filter(isValveProduct);
                    // Deduplicate by _id
                    const unique = valves.filter(
                        (valve, index, self) => index === self.findIndex(v => v._id === valve._id)
                    );
                    setAllValvesCombined(unique);
                } else {
                    // Fallback to local data when API returns empty
                    setAllValvesCombined([...localAscoValves, ...localGoyenValves]);
                }
            } catch (error) {
                console.error('Failed to fetch valves', error);
                // Fallback to local data on error
                setAllValvesCombined([...localAscoValves, ...localGoyenValves]);
            } finally {
                setLoading(false);
            }
        };
        fetchValves();
    }, []);

    // Get unique series and types for filters
    const series = ['all', ...new Set(allValvesCombined.map(v => v.specifications.series))];
    const types = ['all', ...new Set(allValvesCombined.map(v => v.specifications.type))];

    // Filter valves
    const filteredValves = allValvesCombined.filter(valve => {
        const matchesSeries = selectedSeries === 'all' || valve.specifications.series === selectedSeries;
        const matchesType = selectedType === 'all' || valve.specifications.type === selectedType;
        return matchesSeries && matchesType;
    });

    // Group valves by series for counts
    const scg353Count = allValvesCombined.filter(v => v.specifications.series === 'SCG353').length;
    const scr353Count = allValvesCombined.filter(v => v.specifications.series === 'SCR353').length;
    const goyenCount = allValvesCombined.filter(v => v.specifications.series === 'GOYEN').length;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="bg-[#1e293b] rounded-lg p-8 mb-8 border border-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <span className="text-cyan-500 font-bold uppercase tracking-wider text-xs mb-2 block">Industrial Solutions</span>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Industrial Valves Collection</h1>
                        <p className="text-gray-400 mt-2 max-w-2xl">
                            Premium quality solenoid and diaphragm valves for dust collection systems and industrial automation.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400 text-sm">{filteredValves.length} Products Found</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            {!loading && allValvesCombined.length > 0 && (
                <div className="bg-[#1e293b] rounded-lg p-6 mb-8 border border-gray-800">
                    <div className="flex flex-wrap gap-6">
                        {/* Series Filter */}
                        <div className="flex items-center gap-3">
                            <label className="text-gray-400 text-sm font-medium">Series:</label>
                            <select
                                value={selectedSeries}
                                onChange={(e) => setSelectedSeries(e.target.value)}
                                className="bg-[#0f172a] text-white px-4 py-2 rounded border border-gray-700 focus:border-cyan-500 outline-none"
                            >
                                {series.map(s => (
                                    <option key={s} value={s}>{s === 'all' ? 'All Series' : s}</option>
                                ))}
                            </select>
                        </div>

                        {/* Type Filter */}
                        <div className="flex items-center gap-3">
                            <label className="text-gray-400 text-sm font-medium">Type:</label>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="bg-[#0f172a] text-white px-4 py-2 rounded border border-gray-700 focus:border-cyan-500 outline-none"
                            >
                                {types.map(t => (
                                    <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Series Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <Link
                    href="/clientSide/valves/scg353"
                    className="bg-blue-900/10 border border-blue-800 rounded-xl p-6 hover:bg-blue-900/20 hover:border-blue-500 transition-colors group"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Settings className="text-blue-400" size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-white">SCG353 Series</h3>
                    </div>
                    <p className="text-gray-300 text-sm">Right Angle Type valves with threaded connections, port sizes 3/4" to 3".</p>
                    <div className="mt-4 flex items-center justify-between">
                        <span className="flex items-center text-blue-400 text-sm">
                            <Package size={14} className="mr-2" />
                            {scg353Count} Models Available
                        </span>
                        <ArrowRight size={16} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                <Link
                    href="/clientSide/valves/scr353"
                    className="bg-green-900/10 border border-green-800 rounded-xl p-6 hover:bg-green-900/20 hover:border-green-500 transition-colors group"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center">
                            <Settings className="text-green-400" size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-white">SCR353 Series</h3>
                    </div>
                    <p className="text-gray-300 text-sm">Submerged Type valves for direct manifold mounting, 3" to 3.5" port sizes.</p>
                    <div className="mt-4 flex items-center justify-between">
                        <span className="flex items-center text-green-400 text-sm">
                            <Package size={14} className="mr-2" />
                            {scr353Count} Models Available
                        </span>
                        <ArrowRight size={16} className="text-green-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                <Link
                    href="/clientSide/valves/goyen"
                    className="bg-purple-900/10 border border-purple-800 rounded-xl p-6 hover:bg-purple-900/20 hover:border-purple-500 transition-colors group"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <Settings className="text-purple-400" size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-white">GOYEN Series</h3>
                    </div>
                    <p className="text-gray-300 text-sm">High-performance solenoid valves from 20mm to 76mm port sizes.</p>
                    <div className="mt-4 flex items-center justify-between">
                        <span className="flex items-center text-purple-400 text-sm">
                            <Package size={14} className="mr-2" />
                            {goyenCount} Models Available
                        </span>
                        <ArrowRight size={16} className="text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>
            </div>

            {/* Clear Filter Button */}
            {(selectedSeries !== 'all' || selectedType !== 'all') && (
                <div className="mb-6">
                    <button
                        onClick={() => { setSelectedSeries('all'); setSelectedType('all'); }}
                        className="text-cyan-400 hover:text-white text-sm font-medium border border-cyan-900 bg-cyan-900/10 px-4 py-2 rounded hover:bg-cyan-900/30 transition-colors"
                    >
                        Clear All Filters
                    </button>
                </div>
            )}

            {/* Product Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
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
                    <h3 className="text-xl text-gray-400 font-medium">No valves found matching your criteria.</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your filters.</p>
                </div>
            )}
        </div>
    );
};

export default ValvesPage;
