'use client';

import React, { useState } from 'react';
import { Truck, Search, Package, MapPin, CheckCircle } from 'lucide-react';

const TrackOrderPage = () => {
    const [orderId, setOrderId] = useState('');
    const [trackingResult, setTrackingResult] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId) return;

        setIsSearching(true);
        // Simulate API call
        setTimeout(() => {
            setTrackingResult({
                id: orderId,
                status: 'In Transit',
                date: '2023-10-25',
                items: 3,
                steps: [
                    { status: 'Order Placed', date: '2023-10-24 10:00 AM', completed: true },
                    { status: 'Processing', date: '2023-10-24 02:00 PM', completed: true },
                    { status: 'Shipped', date: '2023-10-25 09:00 AM', completed: true },
                    { status: 'Out for Delivery', date: null, completed: false },
                    { status: 'Delivered', date: null, completed: false },
                ]
            });
            setIsSearching(false);
        }, 1500);
    };

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <Truck size={48} className="text-cyan-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-white mb-2">Track Your Order</h1>
                    <p className="text-gray-400">Enter your Order ID to track the status of your shipment.</p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleTrack} className="bg-[#1e293b] p-8 rounded-xl border border-gray-800 shadow-xl mb-12">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="Enter Order ID (e.g., #CE-8921)"
                            className="flex-grow bg-[#0f172a] border border-gray-700 text-white px-6 py-4 rounded focus:outline-none focus:border-cyan-500 font-medium"
                        />
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-white px-8 py-4 rounded font-bold uppercase tracking-wide transition-all flex items-center gap-2"
                        >
                            {isSearching ? 'Searching...' : <><Search size={20} /> Track</>}
                        </button>
                    </div>
                </form>

                {/* Result */}
                {trackingResult && (
                    <div className="bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden animate-fade-in-up">
                        <div className="bg-[#0b1120] p-6 border-b border-gray-800 flex justify-between items-center">
                            <div>
                                <span className="text-gray-400 text-sm block">Order ID</span>
                                <span className="text-xl font-bold text-white">{trackingResult.id}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-gray-400 text-sm block">Current Status</span>
                                <span className="text-cyan-400 font-bold uppercase tracking-wider">{trackingResult.status}</span>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="relative border-l-2 border-gray-700 ml-4 space-y-12">
                                {trackingResult.steps.map((step: any, index: number) => (
                                    <div key={index} className="relative pl-8">
                                        <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${
                                            step.completed ? 'bg-cyan-500 border-cyan-500' : 'bg-[#0b1120] border-gray-600'
                                        }`}></div>
                                        <div>
                                            <h4 className={`font-bold text-lg ${step.completed ? 'text-white' : 'text-gray-500'}`}>
                                                {step.status}
                                            </h4>
                                            {step.date && <p className="text-sm text-gray-400 mt-1">{step.date}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrderPage;
