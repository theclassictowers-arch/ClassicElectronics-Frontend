'use client';

import React from 'react';
import Image from 'next/image';
import { ModeToggle } from '@/components/ModeToggle';
import { CLASSIC_LOGO_SRC } from '@/lib/brandAssets';

const TopHeader = () => {
  return (
    <div className="bg-slate-950 text-white text-xs py-2 px-4 border-b border-gray-800 hidden md:block">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image
              src={CLASSIC_LOGO_SRC}
              alt="Classic Electronics Logo"
              width={40}
              height={40}
              className="object-contain h-8 w-auto"
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
            <ModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
