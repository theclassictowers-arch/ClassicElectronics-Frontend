'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, CheckCircle, Clock, AlertCircle, Search, X } from 'lucide-react';
import { API_URL } from '@/lib/apiConfig';

const OrdersAdmin = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API_URL}/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders(); // Refresh list
    } catch (error) {
      console.error("Failed to update order status", error);
      alert("Error updating status");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="text-yellow-400" size={16} />;
      case 'processing': return <Package className="text-blue-400" size={16} />;
      case 'shipped': return <Truck className="text-cyan-400" size={16} />;
      case 'delivered': return <CheckCircle className="text-green-400" size={16} />;
      case 'cancelled': return <AlertCircle className="text-red-400" size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'processing': return 'bg-blue-500/20 text-blue-400';
      case 'shipped': return 'bg-cyan-500/20 text-cyan-400';
      case 'delivered': return 'bg-green-500/20 text-green-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderId?.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <div className="text-sm text-gray-400">
          <span className="font-bold text-white">{stats.total}</span> Total Orders
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">Total Orders</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-800">
          <div className="text-yellow-400 text-sm mb-1">Pending</div>
          <div className="text-2xl font-bold text-white">{stats.pending}</div>
        </div>
        <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-800">
          <div className="text-blue-400 text-sm mb-1">Processing</div>
          <div className="text-2xl font-bold text-white">{stats.processing}</div>
        </div>
        <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-800">
          <div className="text-green-400 text-sm mb-1">Delivered</div>
          <div className="text-2xl font-bold text-white">{stats.delivered}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1e293b] rounded-xl border border-gray-800 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search orders by ID, customer name or email..."
              className="w-full bg-[#0b1120] border border-gray-700 text-white rounded pl-10 pr-4 py-2 focus:outline-none focus:border-cyan-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="bg-[#0b1120] border border-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:border-cyan-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#0b1120] text-gray-400 font-medium text-sm uppercase">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center">Loading orders...</td></tr>
            ) : filteredOrders.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No orders found</td></tr>
            ) : filteredOrders.map((order) => (
              <tr key={order._id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-mono text-sm text-cyan-300">#{order.orderId || order._id.slice(-8)}</td>
                <td className="p-4">
                  <div className="font-medium text-white">{order.customerName || 'Customer'}</div>
                  <div className="text-xs text-gray-400">{order.customerEmail || ''}</div>
                </td>
                <td className="p-4 text-gray-400 text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 font-bold text-white">
                  ₨ {order.totalAmount?.toLocaleString() || '0'}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(order.status)}`}>
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex gap-2 justify-end">
                    <select
                      className="bg-[#0b1120] border border-gray-700 text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-cyan-500"
                      value={order.status || 'pending'}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded font-bold"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Status Legend */}
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <Clock size={14} className="text-yellow-400" /> Pending
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Package size={14} className="text-blue-400" /> Processing
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Truck size={14} className="text-cyan-400" /> Shipped
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <CheckCircle size={14} className="text-green-400" /> Delivered
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <AlertCircle size={14} className="text-red-400" /> Cancelled
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl border border-gray-700 bg-[#111827] p-5 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Order Details</div>
                <h2 className="mt-1 text-2xl font-bold text-white">
                  #{selectedOrder.orderId || selectedOrder._id?.slice(-8)}
                </h2>
                <div className="mt-2 text-sm text-gray-400">
                  {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : '---'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 text-gray-300 transition hover:border-red-400 hover:text-red-300"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-gray-800 bg-[#0b1120] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Customer</div>
                <div className="mt-2 font-semibold text-white">{selectedOrder.customerName || 'Customer'}</div>
                <div className="mt-1 break-all text-sm text-gray-400">{selectedOrder.customerEmail || 'No email'}</div>
                <div className="mt-1 text-sm text-gray-400">{selectedOrder.customerPhone || 'No phone'}</div>
              </div>
              <div className="rounded-lg border border-gray-800 bg-[#0b1120] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Status</div>
                <div className="mt-3 flex items-center gap-2">
                  {getStatusIcon(selectedOrder.status)}
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status || 'pending'}
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-gray-800 bg-[#0b1120] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Total</div>
                <div className="mt-2 text-2xl font-bold text-white">
                  Rs. {Number(selectedOrder.totalAmount || 0).toLocaleString('en-PK')}
                </div>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-lg border border-gray-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0b1120] text-xs uppercase tracking-[0.16em] text-gray-500">
                  <tr>
                    <th className="p-3">Item</th>
                    <th className="w-24 p-3 text-center">Qty</th>
                    <th className="w-32 p-3 text-right">Price</th>
                    <th className="w-36 p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item: any, index: number) => {
                      const quantity = Number(item.quantity || 0);
                      const price = Number(item.price || 0);

                      return (
                        <tr key={`${item.productId || item.productName}-${index}`}>
                          <td className="p-3 font-medium text-white">{item.productName || 'Item'}</td>
                          <td className="p-3 text-center text-gray-300">{quantity}</td>
                          <td className="p-3 text-right text-gray-300">Rs. {price.toLocaleString('en-PK')}</td>
                          <td className="p-3 text-right font-semibold text-white">
                            Rs. {(quantity * price).toLocaleString('en-PK')}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-500">No items found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {selectedOrder.notes ? (
              <div className="mt-5 rounded-lg border border-gray-800 bg-[#0b1120] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Notes</div>
                <div className="mt-2 whitespace-pre-wrap text-sm text-gray-200">{selectedOrder.notes}</div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersAdmin;
