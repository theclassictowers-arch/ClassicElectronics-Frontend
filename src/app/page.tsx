import React from 'react';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomeClient from '@/components/HomeClient';
import { getHomepageData } from '@/services/api';
import { CartProvider, type Product } from '@/context/CartContext';

export default async function Home() {
    let { products } = await getHomepageData();

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
