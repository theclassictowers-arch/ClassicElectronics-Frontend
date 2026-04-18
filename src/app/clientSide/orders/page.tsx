'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Package, ArrowRight, Filter, Download, Eye, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';

const MyOrdersPage = () => {
    const { getOrders } = useOrders();
    const [filter, setFilter] = useState<string>('all');
    const orders = getOrders();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'in-transit':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'processing':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'cancelled':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered':
                return <CheckCircle size={18} />;
            case 'in-transit':
                return <Truck size={18} />;
            case 'processing':
                return <Clock size={18} />;
            case 'cancelled':
                return <XCircle size={18} />;
            default:
                return <Package size={18} />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'Delivered';
            case 'in-transit':
                return 'In Transit';
            case 'processing':
                return 'Processing';
            case 'cancelled':
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    };

    // Filter orders
    let filteredOrders = orders;
    if (filter !== 'all') {
        filteredOrders = orders.filter(order => order.status === filter);
    }

    // Show sample data if no real orders
    if (filteredOrders.length === 0 && orders.length === 0) {
        return (
            <div className="min-h-screen bg-[#0b1120]">
                {/* Header */}
                <section className="bg-gradient-to-r from-[#0b1120] to-[#1e293b] border-b border-gray-800 py-12">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center gap-4 mb-4">
                            <Package size={40} className="text-cyan-500" />
                            <div>
                                <h1 className="text-4xl font-bold text-white">My Orders</h1>
                                <p className="text-gray-400 mt-1">Track and manage your orders</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-4 py-12">
                    <div className="text-center py-16">
                        <Package size={64} className="text-gray-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">No Orders Yet</h2>
                        <p className="text-gray-400 mb-6">You haven't placed any orders. Start shopping today!</p>
                        <Link href="/clientSide/products" className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wide transition-all inline-flex items-center gap-2">
                            Start Shopping <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b1120]">
            {/* Header */}
            <section className="bg-gradient-to-r from-[#0b1120] to-[#1e293b] border-b border-gray-800 py-12">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Package size={40} className="text-cyan-500" />
                        <div>
                            <h1 className="text-4xl font-bold text-white">My Orders</h1>
                            <p className="text-gray-400 mt-1">Track and manage your orders</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12">
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all border ${
                            filter === 'all'
                                ? 'bg-cyan-600 text-white border-cyan-500'
                                : 'bg-[#1e293b] text-gray-400 border-gray-700 hover:border-cyan-500'
                        }`}
                    >
                        <Filter size={16} />
                        All Orders ({orders.length})
                    </button>
                    <button
                        onClick={() => setFilter('processing')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all border ${
                            filter === 'processing'
                                ? 'bg-yellow-600 text-white border-yellow-500'
                                : 'bg-[#1e293b] text-gray-400 border-gray-700 hover:border-yellow-500'
                        }`}
                    >
                        <Clock size={16} />
                        Processing
                    </button>
                    <button
                        onClick={() => setFilter('in-transit')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all border ${
                            filter === 'in-transit'
                                ? 'bg-blue-600 text-white border-blue-500'
                                : 'bg-[#1e293b] text-gray-400 border-gray-700 hover:border-blue-500'
                        }`}
                    >
                        <Truck size={16} />
                        In Transit
                    </button>
                    <button
                        onClick={() => setFilter('delivered')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all border ${
                            filter === 'delivered'
                                ? 'bg-green-600 text-white border-green-500'
                                : 'bg-[#1e293b] text-gray-400 border-gray-700 hover:border-green-500'
                        }`}
                    >
                        <CheckCircle size={16} />
                        Delivered
                    </button>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-16">
                        <Package size={64} className="text-gray-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">No Orders Found</h2>
                        <p className="text-gray-400 mb-6">You don't have any {filter !== 'all' ? filter : ''} orders yet.</p>
                        <Link href="/clientSide/products" className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wide transition-all inline-flex items-center gap-2">
                            Start Shopping <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden hover:border-cyan-500/50 transition-all">
                                {/* Order Header */}
                                <div className="bg-[#0f172a] p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-4 mb-2">
                                            <h3 className="text-xl font-bold text-white">{order.id}</h3>
                                            <span className={`flex items-center gap-2 px-4 py-1 rounded-full border text-sm font-bold ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm">Ordered on {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    <div className="text-right w-full md:w-auto">
                                        <p className="text-gray-400 text-sm mb-1">Order Total</p>
                                        <p className="text-cyan-400 font-bold uppercase tracking-wide">Price on request</p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-6 space-y-3">
                                    <h4 className="text-white font-bold uppercase tracking-wide text-sm mb-4">Items ({order.items.length})</h4>
                                    {order.items.map((product, idx) => (
                                        <div key={idx} className="flex justify-between items-center pb-3 border-b border-gray-700 last:border-b-0 last:pb-0">
                                            <div className="flex-grow">
                                                <p className="text-white font-medium">{product.name}</p>
                                                <p className="text-gray-400 text-sm">Quantity: {product.quantity}</p>
                                            </div>
                                            <p className="text-cyan-400 font-bold uppercase tracking-wide">Price on request</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Footer */}
                                <div className="bg-[#0f172a] p-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        {order.estimatedDelivery && (
                                            <div>
                                                <p className="text-gray-400 text-sm">Estimated Delivery</p>
                                                <p className="text-white font-bold">{new Date(order.estimatedDelivery).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <Link href={`/clientSide/track-order?orderId=${order.id}`} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-bold transition-all">
                                            <Eye size={16} />
                                            Track Order
                                        </Link>
                                        <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#1e293b] hover:bg-[#293548] text-gray-300 border border-gray-700 px-6 py-2 rounded-lg font-bold transition-all">
                                            <Download size={16} />
                                            Invoice
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrdersPage;

