'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Tag, ShoppingCart, LogOut, UserCircle, ImageIcon, FileText } from 'lucide-react';
import { getAdminProfile } from '@/services/api';

type AdminInfo = { name: string; email: string };

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);

    useEffect(() => {
        // Exclude login and register pages from auth check
        if (pathname === '/admin/login' || pathname === '/admin/register') {
            return;
        }

        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }

        getAdminProfile(token)
            .then((data) => setAdminInfo({ name: data.name || '', email: data.email || '' }))
            .catch(() => {});
    }, [router, pathname]);

    // If on login or register page, render children without the admin sidebar layout
    if (pathname === '/admin/login' || pathname === '/admin/register') {
        return <>{children}</>;
    }

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
    };

    return (
        <div className="admin-layout-shell min-h-screen bg-[#0f172a] text-white flex">
            {/* Sidebar */}
            <aside className="admin-layout-sidebar w-64 bg-[#0b1120] border-r border-gray-800 flex flex-col fixed h-full">
                <div className="p-6 border-b border-gray-800 text-center">
                    <Image src="/Classic_logo.png" alt="Classic Logo" width={140} height={60} className="rounded-sm mb-2 mx-auto" />

                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                    {[
                        { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
                        { name: 'Categories', icon: Tag, href: '/admin/categories' },
                        { name: 'Products', icon: Package, href: '/admin/products' },
                        { name: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
                        { name: 'Invoices', icon: FileText, href: '/admin/invoices' },
                        { name: 'Sliders', icon: ImageIcon, href: '/admin/sliders' },
                        { name: 'Profile', icon: UserCircle, href: '/admin/profile' },
                    ].map((item) => (
                        (() => {
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                                isActive
                                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                            );
                        })()
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800 space-y-3">
                    {adminInfo && (
                        <div className="px-4 py-2">
                            <p className="text-sm font-medium text-white truncate">{adminInfo.name || 'Admin'}</p>
                            <p className="text-xs text-gray-500 truncate">{adminInfo.email}</p>
                        </div>
                    )}
                     <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 px-4 py-3 rounded transition-colors w-full"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-layout-main ml-64 flex-1 p-8">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
