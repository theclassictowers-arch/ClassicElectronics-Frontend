'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ModeToggle } from '@/components/ModeToggle';

const TopHeader = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-slate-950 text-white text-xs py-2 px-4 border-b border-gray-800 hidden md:block">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-8">
            <Image
              src="/Classic_logo.png"
              alt="Classic Electronics Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-gray-400">|</span>
          <span className="text-gray-400">
            Creator of New Ideas · Industrial Electronics & Purging Solutions
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="mailto:support@classicelectronics.com.pk"
            className="hover:text-cyan-400 transition-colors"
          >
            sales@classicelectronics.com.pk
          </a>
          <a
            href="tel:+923335114499"
            className="hover:text-cyan-400 transition-colors"
          >
            +923 111 777 510
          </a>
          <div className="border-l border-gray-700 pl-4">
            {mounted && <ModeToggle />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
