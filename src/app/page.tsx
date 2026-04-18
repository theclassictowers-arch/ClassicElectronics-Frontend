import React from 'react';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomeClient from '@/components/HomeClient';
import { getHomepageData } from '@/services/api';
import { CartProvider, type Product } from '@/context/CartContext';
import { allValves } from '@/data/valvesData';
import { allGoyenValves } from '@/data/goyenValvesData';
import { fallbackProducts } from '@/data/dummyData';

export default async function Home() {
    let { products } = await getHomepageData();
    // Fallback to local data when API returns empty
    if (!products || (Array.isArray(products) && products.length === 0)) {
        products = [...allValves, ...allGoyenValves, ...fallbackProducts] as unknown as Record<string, unknown>[];
    }

    return (
        <CartProvider>
            <div className="min-h-screen flex flex-col">
                <Header navbar={<Navbar />} />

                <main className="flex-grow">
                    <HomeClient products={products as unknown as Product[]} />
                </main>

                <Footer />
            </div>
        </CartProvider>
    );
}
