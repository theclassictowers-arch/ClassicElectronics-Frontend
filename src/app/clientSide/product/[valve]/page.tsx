'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, FileText, Package, Shield, ShoppingCart, Truck, Wrench } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getProductBySlug } from '@/services/api';
import { resolveProductImages } from '@/lib/productImageMatcher';
import ProductImage from '@/components/ProductImage';
import { allValves } from '@/data/valvesData';
import { allGoyenValves } from '@/data/goyenValvesData';

type ValveSpecs = {
  features?: string[];
  model?: string;
  series?: string;
  type?: string;
  portSize?: string;
  connectionType?: string;
  workingPressure?: {
    mpa?: [number, number];
    psi?: [number, number];
  };
  voltageOptions?: string[];
  diaphragmMaterial?: string;
  temperatureRange?: {
    min?: number;
    max?: number;
    unit?: string;
  };
  certifications?: string[];
};

type ValveRecord = {
  _id?: string;
  name?: string;
  slug?: string;
  price?: number;
  description?: string;
  images?: string[];
  showPrice?: boolean;
  stock?: number;
  stockStatus?: string;
  category?: string | { name?: string; slug?: string };
  subcategory?: string;
  specifications?: ValveSpecs;
};

const isValveRecord = (value: unknown): value is ValveRecord =>
  !!value && typeof value === 'object';

export default function ValveDetailPage({ params }: { params: Promise<{ valve: string }> }) {
  const { valve: valveSlug } = React.use(params);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [valve, setValve] = useState<ValveRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchValve = async () => {
      setLoading(true);
      try {
        let result: unknown = await getProductBySlug(valveSlug);

        if (!isValveRecord(result) || !result.name) {
          const allLocal = [...allValves, ...allGoyenValves];
          result = allLocal.find((v) => v.slug === valveSlug) || null;
        }

        if (isValveRecord(result) && result.name) {
          setValve(result);
        } else {
          setValve(null);
        }
      } catch (error) {
        console.error('Failed to fetch valve', error);
        setValve(null);
      } finally {
        setLoading(false);
      }
    };

    fetchValve();
  }, [valveSlug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-[#1e293b] aspect-square rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 bg-[#1e293b] w-2/3 rounded" />
            <div className="h-6 bg-[#1e293b] w-1/3 rounded" />
            <div className="h-36 bg-[#1e293b] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!valve) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Product Not Found</h1>
        <p className="text-gray-400">The product you are looking for does not exist.</p>
        <Link href="/clientSide/valves" className="mt-6 inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-400">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>
    );
  }

  const resolvedImages = resolveProductImages({
    name: valve.name,
    slug: valve.slug,
    description: valve.description,
    images: valve.images,
  });
  const images = resolvedImages.length > 0 ? resolvedImages : ['/images/products/valvesSliderimg.jpeg'];
  const categoryObject = valve.category && typeof valve.category === 'object' ? valve.category : undefined;
  const parentCategory =
    categoryObject?.name || (typeof valve.category === 'string' ? valve.category : 'Products');
  const categorySlug = categoryObject?.slug || 'valves';
  const specs = {
    model: valve.specifications?.model || valve.name || 'N/A',
    series: valve.specifications?.series || 'SCG353',
    type: valve.specifications?.type || 'Solenoid Valve',
    portSize: valve.specifications?.portSize || 'N/A',
    connectionType: valve.specifications?.connectionType || 'Threaded (G/NPT)',
    workingPressure: valve.specifications?.workingPressure || { mpa: [0.3, 0.8] as [number, number], psi: [43.5, 116] as [number, number] },
    voltageOptions: valve.specifications?.voltageOptions || ['AC110V', 'AC220V', 'DC24V'],
    diaphragmMaterial: valve.specifications?.diaphragmMaterial || 'NBR',
    temperatureRange: valve.specifications?.temperatureRange || { min: -5, max: 80, unit: 'C' },
    certifications: valve.specifications?.certifications || ['CE', 'ISO9001'],
  };
  const features = valve.specifications?.features || [
    'Built with industrial-grade materials',
    'Reliable performance in demanding environments',
    'Easy installation and maintenance',
  ];
  const stockLabel = valve.stockStatus || (valve.stock ? `${valve.stock} in stock` : 'In Stock');

  const handleAddToCart = () => {
    addToCart(
      {
        _id: valve._id || valve.slug || valve.name || 'unknown-product',
        name: valve.name || 'Product',
        price: valve.price || 0,
        images,
        slug: valve.slug || valveSlug,
        description: valve.description || '',
      },
      quantity,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/clientSide/valves" className="hover:text-white transition-colors">Catalog</Link>
          <span>/</span>
          <Link href={`/clientSide/category/${categorySlug}`} className="hover:text-white transition-colors">
            {parentCategory}
          </Link>
          <span>/</span>
          <span className="text-white">{valve.name}</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="bg-[#1e293b] rounded-xl overflow-hidden border border-gray-700 p-8">
            <ProductImage
              src={images[selectedImage]}
              alt={valve.name || 'Product image'}
              className="w-full h-auto max-h-[500px] object-contain"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <ProductImage
                    src={img}
                    alt={`${valve.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                    width={80}
                    height={80}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div>
            <span className="text-cyan-500 font-bold uppercase tracking-wider text-sm mb-2 block">
              {parentCategory}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{valve.name}</h1>
            <p className="text-gray-300 leading-relaxed">
              {valve.description || `High-quality ${valve.name} for industrial applications.`}
            </p>
          </div>

          <div className="flex items-center justify-between border-b border-gray-800 pb-6 gap-4">
            <div>
              {valve.showPrice ? (
                <span className="text-2xl font-bold text-cyan-400">Rs. {Number(valve.price || 0).toLocaleString()}</span>
              ) : (
                <>
                  <span className="text-lg font-bold text-cyan-400 uppercase tracking-wide">Price on request</span>
                  <span className="text-sm text-gray-500 ml-2">Contact sales for quote</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 bg-green-900/20 border border-green-800 px-4 py-2 rounded-lg">
              <Package size={16} className="text-green-400" />
              <span className="text-green-400 font-medium">{stockLabel}</span>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Wrench size={20} /> Key Features
            </h3>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={`${feature}-${index}`} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6 pt-6 border-t border-gray-800">
            <div className="flex items-center gap-4">
              <span className="text-gray-400 font-medium">Quantity:</span>
              <div className="flex items-center bg-[#1e293b] rounded border border-gray-700">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10"
                >
                  -
                </button>
                <span className="px-4 py-2 text-white font-bold w-12 text-center border-x border-gray-700">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={added}
                className={`flex-1 px-8 py-4 rounded font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${
                  added ? 'bg-green-600 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                }`}
              >
                {added ? <><Check size={20} /> Added to Cart</> : <><ShoppingCart size={20} /> Add to Cart</>}
              </button>
              <Link
                href="/clientSide/contact"
                className="px-8 py-4 rounded font-bold uppercase tracking-wide transition-all bg-transparent border border-gray-600 text-gray-300 hover:border-white hover:text-white flex items-center justify-center gap-2"
              >
                <FileText size={20} /> Request Quote
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-800">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Shield className="text-cyan-500" size={20} />
                <span>1 Year Warranty</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Truck className="text-cyan-500" size={20} />
                <span>Available nationwide</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-800">
            <p className="text-gray-400 mb-3">More from this category:</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/clientSide/category/${categorySlug}`}
                className="px-4 py-2 bg-[#1e293b] hover:bg-[#243145] text-gray-300 rounded border border-gray-700 transition-colors text-sm"
              >
                All {parentCategory}
              </Link>
              <Link
                href="/clientSide/valves"
                className="px-4 py-2 bg-[#1e293b] hover:bg-[#243145] text-gray-300 rounded border border-gray-700 transition-colors text-sm"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Technical Specifications</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#1e293b] rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between gap-4 border-b border-gray-800 pb-3">
                <span className="text-gray-400">Model</span>
                <span className="text-white font-medium text-right">{specs.model}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-gray-800 pb-3">
                <span className="text-gray-400">Series</span>
                <span className="text-white font-medium text-right">{specs.series}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-gray-800 pb-3">
                <span className="text-gray-400">Type</span>
                <span className="text-white font-medium text-right">{specs.type}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-gray-800 pb-3">
                <span className="text-gray-400">Port Size</span>
                <span className="text-white font-medium text-right">{specs.portSize}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Connection Type</span>
                <span className="text-white font-medium text-right">{specs.connectionType}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Operating Specifications</h3>
            <div className="space-y-4">
              <div className="flex justify-between gap-4 border-b border-gray-800 pb-3">
                <span className="text-gray-400">Working Pressure</span>
                <span className="text-white font-medium text-right">
                  {specs.workingPressure.mpa?.[0]} - {specs.workingPressure.mpa?.[1]} MPa
                </span>
              </div>
              <div className="flex justify-between gap-4 border-b border-gray-800 pb-3">
                <span className="text-gray-400">Working Pressure (PSI)</span>
                <span className="text-white font-medium text-right">
                  {specs.workingPressure.psi?.[0]} - {specs.workingPressure.psi?.[1]} PSI
                </span>
              </div>
              <div className="flex justify-between gap-4 border-b border-gray-800 pb-3">
                <span className="text-gray-400">Temperature Range</span>
                <span className="text-white font-medium text-right">
                  {specs.temperatureRange.min}°{specs.temperatureRange.unit} to {specs.temperatureRange.max}°{specs.temperatureRange.unit}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Diaphragm Material</span>
                <span className="text-white font-medium text-right">{specs.diaphragmMaterial}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Electrical Specifications</h3>
            <div className="flex flex-wrap gap-2">
              {specs.voltageOptions.map((voltage) => (
                <span
                  key={voltage}
                  className="px-3 py-1.5 rounded-full border border-cyan-800 bg-cyan-900/20 text-cyan-300 text-sm"
                >
                  {voltage}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {specs.certifications.map((cert) => (
                <span
                  key={cert}
                  className="px-3 py-1.5 rounded-full border border-gray-700 bg-[#111827] text-gray-200 text-sm"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
