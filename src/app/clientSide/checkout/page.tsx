'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrderContext';
import { Lock, Check, Truck, MapPin, CreditCard, User } from 'lucide-react';

const CheckoutPage = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const { addOrder } = useOrders();
    const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
    const [orderId, setOrderId] = useState<string>('');
    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Pakistan'
    });

    const [paymentInfo, setPaymentInfo] = useState({
        cardName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });

    const shippingCost = 500;
    const total = cartTotal + shippingCost;

    const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setShippingInfo({
            ...shippingInfo,
            [e.target.name]: e.target.value
        });
    };

    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPaymentInfo({
            ...paymentInfo,
            [e.target.name]: e.target.value
        });
    };

    const handleShippingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (shippingInfo.fullName && shippingInfo.email && shippingInfo.address) {
            setStep('payment');
        }
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (paymentInfo.cardName && paymentInfo.cardNumber && paymentInfo.expiryDate && paymentInfo.cvv) {
            // Create order object
            const newOrder = {
                id: `#ORD-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`,
                date: new Date().toISOString().split('T')[0],
                status: 'processing' as const,
                items: cart.map(item => ({
                    _id: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    slug: item.slug
                })),
                total: total,
                shippingInfo: shippingInfo,
                estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };

            // Add order to context
            addOrder(newOrder);
            setOrderId(newOrder.id);
            
            // Clear cart
            clearCart();
            
            // Move to confirmation
            setStep('confirmation');
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-[#0b1120]">
                <div className="container mx-auto px-4 py-20">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
                        <p className="text-gray-400 mb-8">Please add items before proceeding to checkout</p>
                        <Link href="/clientSide/products" className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-bold uppercase">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b1120]">
            {/* Header */}
            <section className="bg-gradient-to-r from-[#0b1120] to-[#1e293b] border-b border-gray-800 py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                        <Lock size={32} className="text-cyan-500" />
                        Secure Checkout
                    </h1>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Checkout Form */}
                    <div className="lg:col-span-2">
                        {/* Steps */}
                        <div className="flex items-center gap-4 mb-12">
                            <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold ${
                                step === 'shipping' || step === 'payment' || step === 'confirmation'
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-gray-700 text-gray-300'
                            }`}>
                                {step === 'confirmation' ? <Check size={24} /> : '1'}
                            </div>
                            <div className={`flex-1 h-1 ${step === 'payment' || step === 'confirmation' ? 'bg-cyan-600' : 'bg-gray-700'}`}></div>

                            <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold ${
                                step === 'payment' || step === 'confirmation'
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-gray-700 text-gray-300'
                            }`}>
                                {step === 'confirmation' ? <Check size={24} /> : '2'}
                            </div>
                            <div className={`flex-1 h-1 ${step === 'confirmation' ? 'bg-cyan-600' : 'bg-gray-700'}`}></div>

                            <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold ${
                                step === 'confirmation'
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-gray-700 text-gray-300'
                            }`}>
                                <Check size={24} />
                            </div>
                        </div>

                        {/* Shipping Step */}
                        {step === 'shipping' && (
                            <form onSubmit={handleShippingSubmit} className="bg-[#1e293b] p-8 rounded-xl border border-gray-800">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                    <MapPin size={24} className="text-cyan-500" />
                                    Shipping Address
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-white font-semibold mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={shippingInfo.fullName}
                                            onChange={handleShippingChange}
                                            className="w-full bg-[#0f172a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-cyan-500"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-white font-semibold mb-2">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={shippingInfo.email}
                                                onChange={handleShippingChange}
                                                className="w-full bg-[#0f172a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-cyan-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-white font-semibold mb-2">Phone</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={shippingInfo.phone}
                                                onChange={handleShippingChange}
                                                className="w-full bg-[#0f172a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-cyan-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-white font-semibold mb-2">Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={shippingInfo.address}
                                            onChange={handleShippingChange}
                                            className="w-full bg-[#0f172a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-cyan-500"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-white font-semibold mb-2">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={shippingInfo.city}
                                                onChange={handleShippingChange}
                                                className="w-full bg-[#0f172a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-cyan-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-white font-semibold mb-2">Postal Code</label>
                                            <input
                                                type="text"
                                                name="postalCode"
                                                value={shippingInfo.postalCode}
                                                onChange={handleShippingChange}
                                                className="w-full bg-[#0f172a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-cyan-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-white font-semibold mb-2">Country</label>
                                            <input
                                                type="text"
                                                value={shippingInfo.country}
                                                disabled
                                                className="w-full bg-[#0f172a] border border-gray-700 text-gray-400 px-4 py-3 rounded"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full mt-8 bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-lg font-bold uppercase tracking-wide transition-all"
                                >
                                    Continue to Payment
                                </button>
                            </form>
                        )}

                        {/* Payment Step */}
                        {step === 'payment' && (
                            <form onSubmit={handlePaymentSubmit} className="bg-[#1e293b] p-8 rounded-xl border border-gray-800">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                    <CreditCard size={24} className="text-cyan-500" />
                                    Payment Information
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-white font-semibold mb-2">Cardholder Name</label>
                                        <input
                                            type="text"
                                            name="cardName"
                                            value={paymentInfo.cardName}
                                            onChange={handlePaymentChange}
                                            className="w-full bg-[#0f172a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-cyan-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-white font-semibold mb-2">Card Number</label>
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            value={paymentInfo.cardNumber}
                                            onChange={handlePaymentChange}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength={19}
                                            className="w-full bg-[#0f172a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-cyan-500"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-white font-semibold mb-2">Expiry Date</label>
                                            <input
                                                type="text"
                                                name="expiryDate"
                                                value={paymentInfo.expiryDate}
                                                onChange={handlePaymentChange}
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                className="w-full bg-[#0f172a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-cyan-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-white font-semibold mb-2">CVV</label>
                                            <input
                                                type="text"
                                                name="cvv"
                                                value={paymentInfo.cvv}
                                                onChange={handlePaymentChange}
                                                placeholder="123"
                                                maxLength={3}
                                                className="w-full bg-[#0f172a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-cyan-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <p className="text-gray-400 text-sm mt-4">
                                        💡 Use test card: 4532 1234 5678 9010
                                    </p>
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setStep('shipping')}
                                        className="flex-1 bg-transparent border border-gray-600 text-gray-400 hover:text-white py-4 rounded-lg font-bold uppercase transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-lg font-bold uppercase tracking-wide transition-all"
                                    >
                                        Complete Order
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Confirmation Step */}
                        {step === 'confirmation' && (
                            <div className="bg-[#1e293b] p-8 rounded-xl border border-gray-800 text-center">
                                <div className="w-20 h-20 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check size={40} className="text-green-400" />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h2>
                                <p className="text-gray-400 mb-6">Thank you for your purchase. Your order has been placed successfully.</p>
                                
                                <div className="bg-[#0f172a] p-4 rounded border border-gray-700 mb-8">
                                    <p className="text-gray-400 text-sm mb-1">Order Number</p>
                                    <p className="text-2xl font-bold text-cyan-400">{orderId}</p>
                                </div>

                                <div className="space-y-3">
                                    <Link href="/clientSide/orders" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-lg font-bold uppercase transition-all block">
                                        View My Orders
                                    </Link>
                                    <Link href="/clientSide/products" className="w-full bg-transparent border border-gray-600 text-gray-400 hover:text-white py-3 rounded-lg font-bold uppercase transition-all block">
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-800 sticky top-24 space-y-6">
                            <h3 className="text-xl font-bold text-white uppercase tracking-wide">Order Summary</h3>

                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {cart.map((item) => (
                                    <div key={item._id} className="flex justify-between text-gray-300 border-b border-gray-700 pb-3 last:border-b-0">
                                        <div>
                                            <p className="text-white font-semibold text-sm">{item.name}</p>
                                            <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-cyan-400 font-bold uppercase tracking-wide">Price on request</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 border-t border-gray-700 pt-4">
                                <div className="flex justify-between text-gray-300">
                                    <span>Subtotal</span>
                                    <span>To be confirmed</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Shipping</span>
                                    <span>To be confirmed</span>
                                </div>
                                <div className="border-t border-gray-700 pt-3 flex justify-between text-white font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-cyan-400 uppercase tracking-wide">Price on request</span>
                                </div>
                            </div>

                            {step === 'confirmation' && (
                                <div className="bg-green-500/20 border border-green-500/50 rounded p-4">
                                    <p className="text-green-400 font-semibold text-sm">✓ Payment Successful</p>
                                    <p className="text-green-400 text-xs mt-1">We've received your order</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;

