'use client';

import React from 'react';
import { ShoppingCart, CheckCircle, Zap, Thermometer, Droplets, Settings, Activity } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { ValveProduct } from '@/types/valve';

interface ValveDetailCardProps {
    valve: ValveProduct;
    showFullSpecs?: boolean;
}

const ValveDetailCard: React.FC<ValveDetailCardProps> = ({ valve, showFullSpecs = false }) => {
    const { addToCart } = useCart();
    const specs = valve.specifications;

    // Get valve series color
    const getSeriesColor = (series: string) => {
        switch (series) {
            case 'SCG353': return 'bg-blue-900/20 text-blue-400 border-blue-800';
            case 'SCR353': return 'bg-green-900/20 text-green-400 border-green-800';
            case 'GOYEN': return 'bg-purple-900/20 text-purple-400 border-purple-800';
            default: return 'bg-gray-900/20 text-gray-400 border-gray-800';
        }
    };

    const seriesColor = getSeriesColor(specs.series);

    return (
        <div className="bg-[#1e293b] rounded-xl overflow-hidden border border-gray-800">
            {/* Header with Series Info */}
            <div className={`px-6 py-4 ${seriesColor.replace('bg-', 'bg-').replace('/20', '/10')} border-b border-gray-800`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {valve.name}
                            {specs.model && <span className="text-lg font-normal text-gray-400 ml-2">({specs.model})</span>}
                        </h1>
                        <p className="text-gray-300 mt-1">{specs.type} • {specs.series} Series</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${seriesColor}`}>
                            {specs.portSize}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${valve.stockStatus === 'In Stock' ? 'bg-green-900/20 text-green-400 border border-green-800' : 'bg-red-900/20 text-red-400 border border-red-800'}`}>
                            {valve.stockStatus}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Product Description */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-white mb-3">Product Description</h2>
                    <p className="text-gray-300 leading-relaxed">{valve.description}</p>
                </div>

                {/* Detailed Specifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Technical Specifications */}
                    <div className="bg-gray-900/30 rounded-lg p-5 border border-gray-800">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Settings className="text-cyan-500" size={20} />
                            Technical Specifications
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Orifice:</span>
                                <span className="text-white font-medium">{specs.orifice || 'As per model'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Connection Port Size:</span>
                                <span className="text-white font-medium">{specs.connectionPortSize || 'As per model'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Working Pressure:</span>
                                <span className="text-white font-medium">{specs.workingPressure.mpa[0]}-{specs.workingPressure.mpa[1]} Mpa ({specs.workingPressure.psi[0]}-{specs.workingPressure.psi[1]} PSI)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Ambient Temperature:</span>
                                <span className="text-white font-medium">{specs.ambientTemperature || '-5 to 50°C'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Relative Humidity:</span>
                                <span className="text-white font-medium">{specs.relativeHumidity || '<85%'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Working Medium:</span>
                                <span className="text-white font-medium">{specs.workingMedium || 'Clear air'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Electrical & Material Specs */}
                    <div className="bg-gray-900/30 rounded-lg p-5 border border-gray-800">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Zap className="text-cyan-500" size={20} />
                            Electrical & Material
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Voltage:</span>
                                <span className="text-white font-medium">{specs.voltage || 'AC110V / AC220V / DC24V / AC24V'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Diaphragm Material:</span>
                                <span className="text-white font-medium">{specs.diaphragmMaterial}</span>
                            </div>
                            {specs.diaphragmMaterialDetails && (
                                <>
                                    <div className="flex justify-between ml-4">
                                        <span className="text-gray-400">• NBR (Nitrile):</span>
                                        <span className="text-white font-medium">{specs.diaphragmMaterialDetails.nbr}</span>
                                    </div>
                                    <div className="flex justify-between ml-4">
                                        <span className="text-gray-400">• VITON:</span>
                                        <span className="text-white font-medium">{specs.diaphragmMaterialDetails.viton}</span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-400">Diaphragm Life Cycles:</span>
                                <span className="text-white font-medium">{specs.diaphragmLifeCycles}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Temperature Range:</span>
                                <span className="text-white font-medium">{specs.temperatureRange.min} to {specs.temperatureRange.max} {specs.temperatureRange.unit}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Full Specifications if requested */}
                {showFullSpecs && (
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Activity className="text-cyan-500" size={20} />
                            Complete Specifications
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-900/20 p-4 rounded-lg">
                                <h4 className="text-sm font-bold text-gray-300 mb-2">Certifications</h4>
                                <div className="flex flex-wrap gap-2">
                                    {specs.certifications.map((cert, index) => (
                                        <span key={index} className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded">
                                            {cert}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gray-900/20 p-4 rounded-lg">
                                <h4 className="text-sm font-bold text-gray-300 mb-2">Key Features</h4>
                                <ul className="space-y-1">
                                    {specs.features.slice(0, 3).map((feature, index) => (
                                        <li key={index} className="text-sm text-gray-400 flex items-center gap-2">
                                            <CheckCircle size={14} className="text-green-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-gray-900/20 p-4 rounded-lg">
                                <h4 className="text-sm font-bold text-gray-300 mb-2">Applications</h4>
                                <ul className="space-y-1">
                                    {specs.applications.slice(0, 3).map((app, index) => (
                                        <li key={index} className="text-sm text-gray-400">
                                            • {app}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 border-t border-gray-800">
                    <div className="text-sm text-gray-400">
                        Contact us for pricing and availability
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => addToCart(valve)}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
                        >
                            <ShoppingCart size={20} />
                            Add to Cart
                        </button>
                        <button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold border border-gray-700 transition-colors">
                            Request Quote
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ValveDetailCard;