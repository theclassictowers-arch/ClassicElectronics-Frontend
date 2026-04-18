'use client';

import React from 'react';
import HeroSlider from '@/components/HeroSlider';
import ProductCard from '@/components/ProductCard';
import ValveCard from '@/components/ValveCard';
import { Product } from '@/context/CartContext';
import type { ValveProduct } from '@/types/valve';
import Link from 'next/link';
import { ArrowRight, Settings, Activity, Zap, Package } from 'lucide-react';

interface HomeClientProps {
  products: Product[];
}

const isValveProduct = (p: any): p is ValveProduct =>
  p && typeof p === 'object' && p.specifications && typeof p.specifications.series === 'string';

const HomeClient: React.FC<HomeClientProps> = ({ products }) => {
  const allValves = products.filter(isValveProduct);
  const regularProducts = products.filter(p => !isValveProduct(p));

  const scg353Valves = allValves.filter(v => v.specifications.series === 'SCG353').slice(0, 2);
  const scr353Valves = allValves.filter(v => v.specifications.series === 'SCR353').slice(0, 2);
  const goyenValves = allValves.filter(v => v.specifications.series === 'GOYEN').slice(0, 4);

  // Combine all potential featured valves
  const combinedValves = [...scg353Valves, ...scr353Valves, ...goyenValves];
  const seenIds = new Set<string>();
  const uniqueFeaturedValves: ValveProduct[] = [];

  // Filter out valves with duplicate _id values to ensure unique keys for React
  for (const valve of combinedValves) {
    if (!seenIds.has(valve._id)) {
      seenIds.add(valve._id);
      uniqueFeaturedValves.push(valve);
    }
  }
  const featuredValves = uniqueFeaturedValves.slice(0, 8); // Take up to 8 unique valves

  const featureIcons = [Settings, Zap, Activity];
  const features = [
    { icon: featureIcons[0], title: 'Precision Engineering', desc: 'Components designed for absolute accuracy and reliability.' },
    { icon: featureIcons[1], title: 'High Performance', desc: 'Built to withstand voltage fluctuations and rigorous use.' },
    { icon: featureIcons[2], title: 'Industrial Grade', desc: 'Tested and certified for heavy-duty industrial environments.' },
  ];

  return (
    <>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-8">
          <HeroSlider />
        </section>

        {/* Features Section */}
        <section className="bg-[#0b1120] py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div key={i} className="bg-[#1e293b] p-8 rounded-xl border border-gray-800 hover:border-cyan-600 transition-colors group">
                  <feature.icon size={40} className="text-cyan-500 mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industrial Valves Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-cyan-500 font-bold tracking-wider uppercase text-sm block mb-2">Our Specialty</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Industrial Valves Collection</h2>
              <p className="text-gray-400 mt-2 max-w-2xl">Premium quality solenoid and diaphragm valves for dust collection systems and industrial automation.</p>
            </div>
            <Link href="/clientSide/valves" className="hidden md:flex items-center gap-2 text-cyan-400 hover:text-white transition-colors font-bold uppercase text-sm tracking-wide">
              View All Valves <ArrowRight size={16} />
            </Link>
          </div>

          {/* Valve Series Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-blue-900/10 border border-blue-800 rounded-xl p-6 hover:bg-blue-900/20 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Settings className="text-blue-400" size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">SCG353 Series</h3>
              </div>
              <p className="text-gray-300 text-sm">Right Angle Type valves with threaded connections, port sizes 3/4&quot; to 3&quot;.</p>
              <div className="mt-4 flex items-center text-blue-400 text-sm">
                <Package size={14} className="mr-2" />
                {scg353Valves.length} Models Featured
              </div>
            </div>

            <div className="bg-green-900/10 border border-green-800 rounded-xl p-6 hover:bg-green-900/20 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Settings className="text-green-400" size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">SCR353 Series</h3>
              </div>
              <p className="text-gray-300 text-sm">Submerged Type valves for direct manifold mounting, 3&quot; to 3.5&quot; port sizes.</p>
              <div className="mt-4 flex items-center text-green-400 text-sm">
                <Package size={14} className="mr-2" />
                {scr353Valves.length} Models Featured
              </div>
            </div>

            <div className="bg-purple-900/10 border border-purple-800 rounded-xl p-6 hover:bg-purple-900/20 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Settings className="text-purple-400" size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">GOYEN Series</h3>
              </div>
              <p className="text-gray-300 text-sm">High-performance solenoid valves from 20mm to 76mm port sizes.</p>
              <div className="mt-4 flex items-center text-purple-400 text-sm">
                <Package size={14} className="mr-2" />
                {goyenValves.length} Models Featured
              </div>
            </div>
          </div>

          {/* Featured Valves */}
          {featuredValves.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredValves.map((valve) => (
                <ValveCard key={valve._id} valve={valve} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center md:hidden">
             <Link href="/clientSide/valves" className="inline-flex items-center gap-2 text-cyan-400 font-bold uppercase text-sm tracking-wide border border-cyan-900 bg-cyan-900/10 px-6 py-3 rounded hover:bg-cyan-900/30 transition-colors">
              View All Valves <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="bg-[#0b1120] py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-10">
              <div>
                <span className="text-cyan-500 font-bold tracking-wider uppercase text-sm block mb-2">Our Complete Range</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white">Featured Products</h2>
              </div>
              <Link href="/clientSide/products" className="hidden md:flex items-center gap-2 text-cyan-400 hover:text-white transition-colors font-bold uppercase text-sm tracking-wide">
                View All Products <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {(regularProducts.length > 0 ? regularProducts : products).slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            <div className="mt-12 text-center md:hidden">
              <Link href="/clientSide/products" className="inline-flex items-center gap-2 text-cyan-400 font-bold uppercase text-sm tracking-wide border border-cyan-900 bg-cyan-900/10 px-6 py-3 rounded hover:bg-cyan-900/30 transition-colors">
                View All Products <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Banner Section */}
        <section className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 py-20 border-y border-gray-800">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Need Custom Solutions?</h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-10 text-lg">We specialize in designing custom electronic controllers and purging systems tailored to your specific industrial requirements.</p>
            <Link href="/clientSide/contact" className="bg-white text-black hover:bg-gray-200 px-8 py-4 rounded font-bold uppercase tracking-wide transition-colors inline-block">
              Request a Quote
            </Link>
          </div>
        </section>
    </>
  );
};

export default HomeClient;
