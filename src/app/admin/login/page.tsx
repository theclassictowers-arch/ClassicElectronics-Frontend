'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

import Link from 'next/link';
import { loginAdmin } from '@/services/api';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false); 
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await loginAdmin({ email, password });

            // Store token
            localStorage.setItem('adminToken', data.token);
            router.push('/admin/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <div className="bg-[#1e293b] p-8 md:p-12 rounded-2xl w-full max-w-md border border-gray-800 shadow-2xl">
                <div className="text-center mb-10">
                    <span className="text-cyan-500 font-bold uppercase tracking-widest text-xs mb-2 block">Restricted Access</span>
                    <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2 pl-1">Email Address</label>
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
                        <label className="block text-gray-400 text-sm font-medium mb-2 pl-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#0b1120] border border-gray-700 text-white rounded pl-10 pr-10 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                placeholder="••••••••"
                                required
                            />
                            <Lock size={18} className="absolute left-3 top-3.5 text-gray-500" />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <Link
                            href="/admin/duplicate-user-request"
                            className="text-cyan-500 hover:text-cyan-400 text-sm font-medium transition-colors"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded transition-all transform active:scale-95 shadow-lg shadow-cyan-900/20"
                    >
                        Secure Login
                    </button>

                    <div className="text-center mt-4">
                        <Link
                            href="/admin/register"
                            className="text-gray-400 hover:text-white text-sm transition-colors block border-t border-gray-800 pt-4"
                        >
                            Need an account? <span className="text-cyan-500 font-bold ml-1">Request Access</span>
                        </Link>
                    </div>
                </form>

                <div className="mt-8 text-center text-xs text-gray-500">
                    &copy; Classic Electronics. Management System v1.0
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
