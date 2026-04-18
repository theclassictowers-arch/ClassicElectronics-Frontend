'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Trash2, ArrowRight, ShoppingBag, Truck, Lock } from 'lucide-react';

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const [shippingCost, setShippingCost] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
    const [couponInput, setCouponInput] = useState('');
    
    const coupons = {
        'SAVE10': 0.10,
        'SAVE20': 0.20,
        'WELCOME': 0.15
    };

    const handleApplyCoupon = () => {
        if (couponInput in coupons) {
            setAppliedCoupon(couponInput);
            setCouponInput('');
        } else {
            alert('Invalid coupon code');
        }
    };

    const calculateDiscount = () => {
        if (appliedCoupon && appliedCoupon in coupons) {
            return cartTotal * coupons[appliedCoupon as keyof typeof coupons];
        }
        return 0;
    };

    const discount = calculateDiscount();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-[#0b1120]">
                {/* Header */}
                <section className="bg-gradient-to-r from-[#0b1120] to-[#1e293b] border-b border-gray-800 py-12">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl font-bold text-white">Shopping Cart</h1>
                        <p className="text-gray-400 mt-2">Your shopping bag is currently empty</p>
                    </div>
                </section>

                <div className="container mx-auto px-4 py-20">
                    <div className="bg-[#1e293b] p-12 rounded-2xl max-w-2xl mx-auto border border-gray-800 text-center">
                        <ShoppingBag size={64} className="mx-auto text-gray-600 mb-6" />
                        <h2 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h2>
                        <p className="text-gray-400 mb-8 text-lg">Looks like you haven't added anything to your cart yet.</p>
                        <Link href="/clientSide/products" className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded font-bold uppercase tracking-wide transition-all inline-flex items-center gap-2">
                            Continue Shopping <ArrowRight size={18} />
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
                    <h1 className="text-4xl font-bold text-white">Shopping Cart</h1>
                    <p className="text-gray-400 mt-2">{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="flex-grow space-y-6">
                        {cart.map((item) => (
                            <div key={item._id} className="bg-[#1e293b] p-6 rounded-xl border border-gray-800 flex flex-col sm:flex-row items-center gap-6 hover:border-cyan-500/50 transition-all">
                                 {/* Image */}
                                <div className="w-28 h-28 bg-white/5 rounded-lg overflow-hidden shrink-0">
                                    <img
                                        src={item.images?.[0] || 'https://placehold.co/100x100/1e293b/f8fafc?text=Img'}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-grow text-center sm:text-left">
                                    <Link href={`/clientSide/product/${item.slug || item._id}`} className="block">
                                        <h3 className="text-lg font-bold text-white hover:text-cyan-400 transition-colors mb-2">{item.name}</h3>
                                    </Link>
                                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                                        <p className="text-cyan-400 font-bold text-sm uppercase tracking-wide">Price on request</p>
                                        <p className="text-gray-500 text-sm">x {item.quantity}</p>
                                    </div>
                                </div>

                                {/* Quantity */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center bg-[#0f172a] rounded-lg border border-gray-700">
                                        <button
                                            onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                                            className="px-4 py-2 text-gray-300 hover:text-white hover:bg-cyan-500/20 transition-all"
                                        >
                                            −
                                        </button>
                                        <span className="px-4 py-2 text-white font-bold w-12 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                            className="px-4 py-2 text-gray-300 hover:text-white hover:bg-cyan-500/20 transition-all"
                                        >
                                            +
                                        </button>
                                    </div>

                                     {/* Remove */}
                                    <button
                                        onClick={() => removeFromCart(item._id)}
                                        className="text-red-500 hover:text-red-400 p-3 rounded-lg hover:bg-red-500/10 transition-all"
                                        title="Remove Item"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Cart Summary */}
                    <div className="lg:w-96 shrink-0 space-y-6">
                        {/* Coupon Section */}
                        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-800">
                            <h3 className="text-white font-bold mb-4 uppercase tracking-wide text-sm">Apply Coupon</h3>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={couponInput}
                                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                    placeholder="Enter coupon code"
                                    className="flex-grow bg-[#0f172a] border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-cyan-500"
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded font-bold transition-all"
                                >
                                    Apply
                                </button>
                            </div>
                            <p className="text-gray-400 text-xs">Try: SAVE10, SAVE20, or WELCOME</p>
                            {appliedCoupon && (
                                <div className="mt-3 p-3 bg-green-500/20 border border-green-500/50 rounded text-green-400 text-sm">
                                    ✓ Coupon applied: {appliedCoupon}
                                </div>
                            )}
                        </div>

                        {/* Shipping Section */}
                        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-800">
                            <h3 className="text-white font-bold mb-4 uppercase tracking-wide text-sm flex items-center gap-2">
                                <Truck size={16} />
                                Shipping Options
                            </h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer p-3 bg-[#0f172a] rounded border border-gray-700 hover:border-cyan-500 transition-all">
                                    <input
                                        type="radio"
                                        name="shipping"
                                        value="0"
                                        checked={shippingCost === 0}
                                        onChange={(e) => setShippingCost(parseFloat(e.target.value))}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-white font-medium">Standard (5-7 days)</span>
                                    <span className="ml-auto text-gray-400">To be confirmed</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer p-3 bg-[#0f172a] rounded border border-gray-700 hover:border-cyan-500 transition-all">
                                    <input
                                        type="radio"
                                        name="shipping"
                                        value="500"
                                        checked={shippingCost === 500}
                                        onChange={(e) => setShippingCost(parseFloat(e.target.value))}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-white font-medium">Express (2-3 days)</span>
                                    <span className="ml-auto text-gray-400">To be confirmed</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer p-3 bg-[#0f172a] rounded border border-gray-700 hover:border-cyan-500 transition-all">
                                    <input
                                        type="radio"
                                        name="shipping"
                                        value="1000"
                                        checked={shippingCost === 1000}
                                        onChange={(e) => setShippingCost(parseFloat(e.target.value))}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-white font-medium">Overnight</span>
                                    <span className="ml-auto text-gray-400">To be confirmed</span>
                                </label>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-800 sticky top-24">
                            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wide">Order Summary</h2>

                            <div className="space-y-3 text-gray-300 mb-6">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>To be confirmed</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-400">
                                        <span>Coupon ({appliedCoupon})</span>
                                        <span>Applied</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>
                                        {shippingCost === 0 ? 'Standard' : shippingCost === 500 ? 'Express' : 'Overnight'}
                                    </span>
                                </div>
                                <div className="border-t border-gray-700 pt-3 flex justify-between text-white font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-cyan-400 uppercase tracking-wide">Price on request</span>
                                </div>
                            </div>

                            <Link href="/clientSide/checkout"  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-lg font-bold uppercase tracking-wide transition-all shadow-lg shadow-cyan-900/30 mb-3 flex items-center justify-center gap-2">
                                <Lock size={18} />
                                Proceed to Checkout
                            </Link>
                            <button
                                onClick={clearCart}
                                className="w-full bg-transparent border border-gray-600 text-gray-400 hover:text-white hover:border-white py-3 rounded-lg font-bold uppercase tracking-wide transition-all text-sm"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;

