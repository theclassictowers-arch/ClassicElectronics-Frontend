'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, Loader2, LogOut, Package, Plus, Save, ShoppingCart } from 'lucide-react';
import { createMyOrder, getMyOrders } from '@/services/api';
import type { CustomerOrderItem, CustomerOrderRecord } from '@/services/api';
import { useCart } from '@/context/CartContext';

type CurrentUser = {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

const formatCurrency = (amount: number) =>
  `Rs. ${Number(amount || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;

const getStatusClass = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'bg-emerald-500/15 text-emerald-300';
    case 'shipped':
      return 'bg-cyan-500/15 text-cyan-300';
    case 'processing':
      return 'bg-blue-500/15 text-blue-300';
    case 'cancelled':
      return 'bg-rose-500/15 text-rose-300';
    default:
      return 'bg-yellow-500/15 text-yellow-300';
  }
};

const CustomerAccountPage = () => {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [orders, setOrders] = useState<CustomerOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [phone, setPhone] = useState('');
  const [manualProductName, setManualProductName] = useState('');
  const [manualQuantity, setManualQuantity] = useState(1);
  const [manualItems, setManualItems] = useState<CustomerOrderItem[]>([]);
  const [message, setMessage] = useState('');

  const loadOrders = useCallback(async (authToken: string) => {
    if (!authToken) return;
    setLoading(true);
    setMessage('');

    try {
      const data = await getMyOrders(authToken);
      setOrders(data);
    } catch (error) {
      console.error('Failed to load customer orders', error);
      setMessage('Unable to load your orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('userToken');
    const savedUser = localStorage.getItem('currentUser');

    if (!savedToken) {
      router.push('/admin/login');
      return;
    }

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as CurrentUser;
        setUser(parsedUser);
        setPhone(parsedUser.phone || '');
      } catch {
        setUser(null);
      }
    }

    void loadOrders(savedToken);
  }, [loadOrders, router]);

  const cartItems = useMemo<CustomerOrderItem[]>(
    () =>
      cart.map((item) => ({
        productId: item._id,
        productName: item.name,
        quantity: item.quantity,
        price: Number(item.price || 0),
      })),
    [cart]
  );

  const newOrderItems = cartItems.length > 0 ? cartItems : manualItems;

  const handleAddManualItem = () => {
    if (!manualProductName.trim()) {
      alert('Please enter item name');
      return;
    }

    setManualItems((current) => [
      ...current,
      {
        productName: manualProductName.trim(),
        quantity: Math.max(Number(manualQuantity || 1), 1),
        price: 0,
      },
    ]);
    setManualProductName('');
    setManualQuantity(1);
  };

  const handleCreateOrder = async () => {
    const authToken = localStorage.getItem('userToken');
    if (!authToken) {
      router.push('/admin/login');
      return;
    }

    if (newOrderItems.length === 0) {
      alert('Add items from cart or manual request first');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const order = await createMyOrder(authToken, {
        customerPhone: phone,
        notes,
        items: newOrderItems,
      });
      setOrders((current) => [order, ...current]);
      setNotes('');
      setManualItems([]);
      if (cartItems.length > 0) clearCart();
      setMessage('Order request submitted.');
    } catch (error) {
      console.error('Failed to create customer order', error);
      setMessage('Unable to submit order request.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#0b1120]">
      <section className="border-b border-gray-800 bg-[#111827] py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">My Account</h1>
              <p className="mt-1 text-sm text-gray-400">
                {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Customer'} · {user?.email || ''}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-200 transition hover:border-rose-400 hover:text-rose-300"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </section>

      <div className="container mx-auto grid gap-6 px-4 py-8 lg:grid-cols-[380px_minmax(0,1fr)]">
        <section className="rounded-xl border border-gray-800 bg-[#1e293b] p-5">
          <div className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <Plus size={20} className="text-cyan-300" />
            New Order Request
          </div>

          {cartItems.length > 0 ? (
            <div className="mb-4 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
              Using {cartItems.length} item(s) from your cart.
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Item Name</label>
                <input
                  value={manualProductName}
                  onChange={(event) => setManualProductName(event.target.value)}
                  className="w-full rounded border border-gray-700 bg-[#0b1120] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  placeholder="Product or item required"
                />
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={manualQuantity}
                    onChange={(event) => setManualQuantity(Number(event.target.value))}
                    className="w-full rounded border border-gray-700 bg-[#0b1120] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddManualItem}
                  className="self-end rounded bg-cyan-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-cyan-500"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="mt-5 space-y-2">
            {newOrderItems.length === 0 ? (
              <div className="rounded-lg border border-gray-800 bg-[#0b1120] p-4 text-sm text-gray-500">
                Add items manually or add products to cart first.
              </div>
            ) : (
              newOrderItems.map((item, index) => (
                <div key={`${item.productName}-${index}`} className="flex justify-between gap-3 rounded-lg border border-gray-800 bg-[#0b1120] p-3 text-sm">
                  <div>
                    <div className="font-semibold text-white">{item.productName}</div>
                    <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                  </div>
                  <div className="text-right text-cyan-300">{item.price ? formatCurrency(item.price * item.quantity) : 'Quote'}</div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Phone</label>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded border border-gray-700 bg-[#0b1120] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Notes</label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="w-full rounded border border-gray-700 bg-[#0b1120] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              placeholder="Write details, model numbers, delivery instructions..."
            />
          </div>

          <button
            type="button"
            onClick={handleCreateOrder}
            disabled={saving}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded bg-cyan-600 px-4 py-3 font-bold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Submit Order
          </button>

          {message ? <div className="mt-4 rounded border border-cyan-500/30 bg-cyan-500/10 p-3 text-sm text-cyan-100">{message}</div> : null}

          <Link href="/clientSide/products" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-cyan-300 hover:text-cyan-200">
            <ShoppingCart size={16} />
            Add products from catalog
          </Link>
        </section>

        <section className="rounded-xl border border-gray-800 bg-[#1e293b] p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-lg font-bold text-white">
              <Package size={20} className="text-cyan-300" />
              My Orders & History
            </div>
            <div className="text-sm text-gray-400">{orders.length} orders</div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
              <Loader2 size={18} className="animate-spin" />
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-xl border border-gray-800 bg-[#0b1120] py-16 text-center">
              <Clock size={44} className="mx-auto mb-3 text-gray-600" />
              <h2 className="text-xl font-bold text-white">No order history yet</h2>
              <p className="mt-2 text-sm text-gray-400">Submit your first order request from this page.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <article key={order._id} className="rounded-xl border border-gray-800 bg-[#0b1120] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="font-mono text-sm font-bold text-cyan-300">#{order.orderId || order._id.slice(-8)}</div>
                      <div className="mt-1 text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded px-2 py-1 text-xs font-bold ${getStatusClass(order.status)}`}>{order.status}</span>
                      <span className="text-sm font-bold text-white">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {order.items.map((item, index) => (
                      <div key={`${order._id}-${index}`} className="flex justify-between gap-4 border-t border-gray-800 pt-2 text-sm">
                        <span className="text-gray-200">{item.productName}</span>
                        <span className="text-gray-500">Qty {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  {order.notes ? <div className="mt-3 rounded bg-slate-900 p-3 text-sm text-gray-300">{order.notes}</div> : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CustomerAccountPage;
