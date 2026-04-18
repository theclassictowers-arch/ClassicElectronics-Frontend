'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Shield, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { registerAdmin } from '@/services/api';

const AdminRegister = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const validatePassword = (pwd: string) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        return regex.test(pwd);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!validatePassword(password)) {
            setError('Password must be at least 8 characters long and contain at least one letter, one number, and one special character.');
            setLoading(false);
            return;
        }

        try {
            await registerAdmin({
                name,
                email,
                password,
                secretKey // Often used for admin registration as an extra security layer
            });

            // If registration successful but requires login
            router.push('/admin/login?registered=true');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <div className="bg-[#1e293b] p-8 md:p-12 rounded-2xl w-full max-w-md border border-gray-800 shadow-2xl">
                <div className="text-center mb-10">
                    <span className="text-cyan-500 font-bold uppercase tracking-widest text-xs mb-2 block">New Admin Access</span>
                    <h1 className="text-3xl font-bold text-white">Create Account</h1>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-1 pl-1">Full Name</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[#0b1120] border border-gray-700 text-white rounded pl-10 pr-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                placeholder="Admin Name"
                                required
                            />
                            <User size={18} className="absolute left-3 top-3.5 text-gray-500" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-1 pl-1">Email Address</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0b1120] border border-gray-700 text-white rounded pl-10 pr-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                placeholder="admin@domain.com"
                                required
                            />
                            <Mail size={18} className="absolute left-3 top-3.5 text-gray-500" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-1 pl-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#0b1120] border border-gray-700 text-white rounded pl-10 pr-10 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                            <Lock size={18} className="absolute left-3 top-3.5 text-gray-500" />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-1 pl-1">Admin Secret Key</label>
                        <div className="relative">
                            <input
                                type={showSecret ? 'text' : 'password'}
                                value={secretKey}
                                onChange={(e) => setSecretKey(e.target.value)}
                                className="w-full bg-[#0b1120] border border-gray-700 text-white rounded pl-10 pr-10 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                placeholder="Secret Key required for admin creation"
                                required
                            />
                            <Shield size={18} className="absolute left-3 top-3.5 text-gray-500" />
                            <button
                                type="button"
                                onClick={() => setShowSecret(!showSecret)}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors focus:outline-none"
                            >
                                {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded mt-4 transition-all transform active:scale-95 shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Account...' : 'Register Admin'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-500">Already have an account? </span>
                    <Link href="/admin/login" className="text-cyan-500 hover:text-cyan-400 font-medium">
                        Log in
                    </Link>
                </div>

                <div className="mt-8 text-center text-xs text-gray-500">
                    &copy; Classic Electronics. Management System v1.0
                </div>
            </div>
        </div>
    );
};

export default AdminRegister;
