'use client';

import React from 'react';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CartProvider } from '@/context/CartContext';
import { OrderProvider } from '@/context/OrderContext';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <OrderProvider>
                <CartProvider>
                    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
                        <Header navbar={<Navbar />} />
                        <main className="flex-grow">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </CartProvider>
            </OrderProvider>
        </ThemeProvider>
    );
}
