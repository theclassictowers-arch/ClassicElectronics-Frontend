'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, Truck, Menu, X, Package, Shield } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { CLASSIC_LOGO_SRC } from '@/lib/brandAssets';

interface MainHeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const MainHeader: React.FC<MainHeaderProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { cartCount } = useCart();
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="bg-[#0b1120] from-slate-900 to-slate-800 border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Image
                src={CLASSIC_LOGO_SRC}
                alt="Classic Electronics Logo"
                width={150}
                height={50}
                className="object-contain h-auto w-auto max-h-[60px]"
              />
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
            <label htmlFor="search-desktop" className="sr-only">Search products</label>
            <input
              id="search-desktop"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, controllers, valves..."
              className="w-full bg-slate-700/50 text-white pl-4 pr-12 py-3 rounded-full border border-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-light"
            />
            <button
              aria-label="Search"
              onClick={handleSearch}
              className="absolute right-0 top-0 bottom-0 bg-gradient-to-r from-cyan-600 to-blue-600 px-6 rounded-r-full hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center justify-center text-white"
            >
              <Search size={20} />
            </button>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-6">
          
            <div className="flex items-center gap-6 text-foreground dark:text-white">
              <Link href="/admin/login" className="hidden md:flex flex-col items-center cursor-pointer hover:text-cyan-400 transition-colors group">
                <Shield size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase font-bold tracking-wide">Admin</span>
              </Link>

              <Link href="/clientSide/orders" className="hidden md:flex flex-col items-center cursor-pointer hover:text-cyan-400 transition-colors group">
                <Package size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase font-bold tracking-wide">Orders</span>
              </Link>

              <Link href="/clientSide/track-order" className="hidden md:flex flex-col items-center cursor-pointer hover:text-cyan-400 transition-colors group">
                <Truck size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase font-bold tracking-wide">Track</span>
              </Link>

              <Link href="/clientSide/cart" className="flex flex-col items-center cursor-pointer hover:text-cyan-400 transition-colors group relative">
                <ShoppingCart size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase font-bold tracking-wide">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            <button
              className="md:hidden"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-4 relative">
          <label htmlFor="search-mobile" className="sr-only">Search products</label>
          <input
            id="search-mobile"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-slate-700/50 text-white pl-4 pr-12 py-3 rounded-md border border-slate-600 focus:outline-none focus:border-cyan-500 font-light"
          />
          <button
            aria-label="Search"
            onClick={handleSearch}
            className="absolute right-2 top-2 bottom-2 bg-cyan-600 px-4 rounded hover:bg-cyan-500 text-white transition-all flex items-center justify-center"
          >
            <Search size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
