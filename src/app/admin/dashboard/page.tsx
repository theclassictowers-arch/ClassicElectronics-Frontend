'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Tag, Package, ShoppingCart, Clock, CheckCircle, Truck, AlertCircle, RefreshCw } from 'lucide-react';
import { API_URL } from '@/lib/apiConfig';


type Order = {
  _id: string;
  orderId?: string;
  customerName?: string;
  customerEmail?: string;
  totalAmount?: number;
  status?: string;
  createdAt?: string;
};

type DashboardStats = {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalCategories: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
};

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [productsRes, ordersRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/orders`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/categories/admin`, { headers }).catch(() => axios.get(`${API_URL}/categories`)),
      ]);

      const products = Array.isArray(productsRes.data) ? productsRes.data : [];
      const orders: Order[] = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const categories = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];

      const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      setStats({
        totalSales,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCategories: categories.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        processingOrders: orders.filter(o => o.status === 'processing').length,
        shippedOrders: orders.filter(o => o.status === 'shipped').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={14} className="text-yellow-400" />;
      case 'processing': return <Package size={14} className="text-blue-400" />;
      case 'shipped': return <Truck size={14} className="text-cyan-400" />;
      case 'delivered': return <CheckCircle size={14} className="text-green-400" />;
      case 'cancelled': return <AlertCircle size={14} className="text-red-400" />;
      default: return <Clock size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 text-gray-400 hover:text-white px-4 py-2 rounded border border-gray-700 hover:border-gray-500 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Sales', value: `₨ ${(stats?.totalSales || 0).toLocaleString()}`, icon: ShoppingCart, color: 'text-green-400' },
          { label: 'Total Orders', value: String(stats?.totalOrders || 0), icon: ShoppingCart, color: 'text-cyan-400' },
          { label: 'Total Products', value: String(stats?.totalProducts || 0), icon: Package, color: 'text-purple-400' },
          { label: 'Total Categories', value: String(stats?.totalCategories || 0), icon: Tag, color: 'text-orange-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1e293b] p-6 rounded-xl border border-gray-800">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-400 text-sm font-medium">{stat.label}</span>
              <stat.icon size={24} className={stat.color} />
            </div>
            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Order Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#1e293b] rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-bold mb-4">Order Status Breakdown</h2>
          <div className="space-y-3">
            {[
              { label: 'Pending', count: stats?.pendingOrders || 0, color: 'bg-yellow-500', icon: <Clock size={16} className="text-yellow-400" /> },
              { label: 'Processing', count: stats?.processingOrders || 0, color: 'bg-blue-500', icon: <Package size={16} className="text-blue-400" /> },
              { label: 'Shipped', count: stats?.shippedOrders || 0, color: 'bg-cyan-500', icon: <Truck size={16} className="text-cyan-400" /> },
              { label: 'Delivered', count: stats?.deliveredOrders || 0, color: 'bg-green-500', icon: <CheckCircle size={16} className="text-green-400" /> },
              { label: 'Cancelled', count: stats?.cancelledOrders || 0, color: 'bg-red-500', icon: <AlertCircle size={16} className="text-red-400" /> },
            ].map((item) => {
              const total = stats?.totalOrders || 1;
              const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-sm text-gray-300 w-24">{item.label}</span>
                  <div className="flex-1 bg-gray-700/50 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 w-16 text-right">{item.count} ({percentage}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-[#1e293b] rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No orders yet</div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-[#0b1120] rounded-lg">
                  <div>
                    <div className="font-mono text-sm text-cyan-300">
                      #{order.orderId || order._id.slice(-8)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {order.customerName || 'Customer'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">
                      Rs. {(order.totalAmount || 0).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      {getStatusIcon(order.status || 'pending')}
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${getStatusColor(order.status || 'pending')}`}>
                        {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
