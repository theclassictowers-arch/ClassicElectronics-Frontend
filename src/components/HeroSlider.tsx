'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import { getSliders, DEFAULT_SLIDES, type Slide } from '@/services/api';
import { resolveAssetUrl } from '@/lib/apiConfig';


const fallbackSlides: Slide[] = DEFAULT_SLIDES.map((s, i) => ({ ...s, _id: String(i + 1) }));

const HeroSlider = () => {
  const [slides, setSlides] = useState<Slide[]>(fallbackSlides);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    getSliders().then((data) => {
      const active = data.filter(s => s.isActive).sort((a, b) => a.order - b.order);
      if (active.length > 0) setSlides(active);
    }).catch(() => {});
  }, []);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

  const prevSlide = () =>
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  const goToSlide = (index: number) => setCurrentSlide(index);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative h-[430px] md:h-[540px] w-full overflow-hidden rounded-xl group">
      {slides.map((slide, index) => (
        <div
          key={slide._id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#3d475f] via-[#424c65] to-[#fcfcfc]">
            <div
              className="absolute inset-0 bg-center bg-cover opacity-10 mix-blend-overlay transition-transform duration-[10000ms]"
              style={{
                backgroundImage: `url('${resolveAssetUrl(slide.bgImage)}')`,
                transform: index === currentSlide ? 'scale(1.1)' : 'scale(1)',
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full container mx-auto px-8 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            {/* LEFT TEXT */}
            <div
              className={`transition-all duration-700 ${
                index === currentSlide
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <span className="inline-block py-1 px-3 rounded bg-cyan-900/30 text-cyan-400 border border-cyan-800 text-xs font-bold tracking-widest uppercase mb-4">
                Premium Industrial Components
              </span>

              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                {slide.title.replace(slide.highlight, '')}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  {slide.highlight}
                </span>
              </h1>

              <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-lg">
                {slide.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={slide.link}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded font-bold uppercase tracking-wide transition-all flex items-center gap-2 justify-center"
                >
                  Explore Products <ArrowRight size={18} />
                </Link>

                <Link
                  href="/contact"
                  className="border border-gray-600 hover:border-white text-gray-300 hover:text-white px-8 py-3 rounded font-bold uppercase tracking-wide transition-all flex items-center justify-center"
                >
                  Contact Sales
                </Link>
              </div>
            </div>

            {/* RIGHT IMAGE (FULL, NO CROP) */}
            <div
              className={`hidden md:flex items-center justify-center transition-all duration-700 ${
                index === currentSlide
                  ? 'translate-x-0 opacity-100'
                  : 'translate-x-10 opacity-0'
              }`}
            >
              <div
                className="w-full h-[360px] bg-no-repeat bg-center bg-contain"
                style={{
                  backgroundImage: `url('${resolveAssetUrl(slide.bgImage)}')`,
                }}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-cyan-600/80 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-20"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-cyan-600/80 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-20"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1 rounded-full transition-all ${
              index === currentSlide
                ? 'w-8 bg-cyan-500'
                : 'w-2 bg-gray-600 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
