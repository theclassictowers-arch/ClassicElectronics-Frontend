'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, FileText, Package, Shield, ShoppingCart, Truck, Wrench } from 'lucide-react';
import { getProductBySlug, getProducts } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { matchImagesByProductName } from '@/lib/productImageMatcher';
import { resolveAssetUrl } from '@/lib/apiConfig';
import ProductImage from '@/components/ProductImage';
import { allValves } from '@/data/valvesData';
import { allGoyenValves } from '@/data/goyenValvesData';

type ProductLookup = {
  _id?: string;
  name?: string;
  slug?: string;
  description?: string;
  images?: string[];
  category?: { name?: string; slug?: string } | string;
  subcategory?: string;
  price?: number;
  showPrice?: boolean;
  stock?: number;
  stockStatus?: string;
  pdfUrl?: string;
  specifications?: {
    basicInformation?: Array<{ label?: string; value?: string }>;
    operatingSpecifications?: Array<{ label?: string; value?: string }>;
    electricalSpecifications?: string[];
    features?: string[];
    applications?: string[];
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
  features?: string[];
};

const isProductLookup = (value: unknown): value is ProductLookup =>
  !!value && typeof value === 'object';

export default function ValveItemDetailPage() {
  const params = useParams();
  const slugArray = params.slug as string[];
  const slug = slugArray.join('/');
  const [itemData, setItemData] = useState<ProductLookup | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchItemData = async () => {
      setLoading(true);
      try {
        const lastSegment = slug.includes('/') ? slug.split('/').pop() || slug : slug;
        let product: unknown = (await getProductBySlug(lastSegment)) || (await getProductBySlug(slug));

        if (!product) {
          const searchResults = await getProducts({ q: lastSegment });
          if (Array.isArray(searchResults) && searchResults.length > 0) {
            product =
              searchResults.find((p: unknown) => {
                if (!isProductLookup(p)) return false;

                return (
                  p.slug === lastSegment ||
                  p.slug === slug ||
                  p.slug?.includes(lastSegment) ||
                  p.name?.toLowerCase().includes(lastSegment.toLowerCase())
                );
              }) ||
              searchResults[0];
          }
        }

        if (Array.isArray(product) && product.length > 0) {
          product = product[0];
        } else if (Array.isArray(product) && product.length === 0) {
          product = null;
        }

        if (!isProductLookup(product) || !product.name) {
          const allLocal = [...allValves, ...allGoyenValves];
          product =
            allLocal.find((v) => v.slug === lastSegment || v.slug === slug || v.slug.includes(lastSegment)) || null;
        }

        if (isProductLookup(product) && product.name) {
          setItemData(product);
        } else {
          setItemData(null);
        }
      } catch (error) {
        console.error('Failed to load item data', error);
        setItemData(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchItemData();
    }
  }, [slug]);

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

  if (!itemData) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Item Not Found</h1>
        <p className="text-gray-400">The item you are looking for does not exist or has been removed.</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-400">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    );
  }

  const categoryObject = itemData.category && typeof itemData.category === 'object' ? itemData.category : undefined;
  const parentCategory =
    categoryObject?.name || (typeof itemData.category === 'string' ? itemData.category : 'Products');
  const categorySlug = categoryObject?.slug || slug.split('/').slice(0, -1).join('/') || 'products';
  const matchedImages = matchImagesByProductName(itemData.name || '', itemData.slug || slug, itemData.description || '');
  const productImages = Array.isArray(itemData.images) ? itemData.images : [];
  const images =
    productImages.length > 0
      ? productImages
      : matchedImages.length > 0
        ? matchedImages
        : ['/images/products/valvesSliderimg.jpeg'];
  const stockLabel = itemData.stockStatus || (itemData.stock ? `${itemData.stock} in stock` : 'In Stock');
  const pdfDownloadUrl = itemData.pdfUrl
    ? resolveAssetUrl(itemData.pdfUrl)
    : '';
  const features = itemData.specifications?.features || itemData.features || [
    'Built with industrial-grade materials',
    'Reliable performance in demanding environments',
    'Easy installation and maintenance',
  ];
  const applications = itemData.specifications?.applications || [
    'Industrial automation',
    'Dust collection systems',
    'Pneumatic control setups',
  ];
  const basicInformation =
    itemData.specifications?.basicInformation?.filter((item) => item?.label || item?.value) || [
      { label: 'Model', value: itemData.specifications?.model || itemData.name || 'N/A' },
      { label: 'Series', value: itemData.specifications?.series || 'SCG353' },
      { label: 'Type', value: itemData.specifications?.type || 'Solenoid Valve' },
      { label: 'Port Size', value: itemData.specifications?.portSize || 'N/A' },
    ];
  const operatingSpecifications =
    itemData.specifications?.operatingSpecifications?.filter((item) => item?.label || item?.value) || [
      {
        label: 'Working Pressure',
        value: `${itemData.specifications?.workingPressure?.mpa?.[0] ?? 0.3} - ${itemData.specifications?.workingPressure?.mpa?.[1] ?? 0.8} MPa`,
      },
      {
        label: 'Working Pressure (PSI)',
        value: `${itemData.specifications?.workingPressure?.psi?.[0] ?? 43.5} - ${itemData.specifications?.workingPressure?.psi?.[1] ?? 116} PSI`,
      },
      {
        label: 'Temperature Range',
        value: `${itemData.specifications?.temperatureRange?.min ?? -5}°${itemData.specifications?.temperatureRange?.unit ?? 'C'} to ${itemData.specifications?.temperatureRange?.max ?? 80}°${itemData.specifications?.temperatureRange?.unit ?? 'C'}`,
      },
      {
        label: 'Diaphragm Material',
        value: itemData.specifications?.diaphragmMaterial || 'NBR',
      },
      {
        label: 'Connection Type',
        value: itemData.specifications?.connectionType || 'Threaded (G/NPT)',
      },
    ];
  const electricalSpecifications =
    itemData.specifications?.electricalSpecifications ||
    itemData.specifications?.voltageOptions || ['AC110V', 'AC220V', 'DC24V'];
  const certifications = itemData.specifications?.certifications || ['CE', 'ISO9001'];
  const hasStoredSpecifications =
    !!itemData.specifications &&
    (
      (Array.isArray(itemData.specifications.basicInformation) && itemData.specifications.basicInformation.some((item) => item?.label || item?.value)) ||
      (Array.isArray(itemData.specifications.operatingSpecifications) && itemData.specifications.operatingSpecifications.some((item) => item?.label || item?.value)) ||
      (Array.isArray(itemData.specifications.electricalSpecifications) && itemData.specifications.electricalSpecifications.some(Boolean)) ||
      (Array.isArray(itemData.specifications.applications) && itemData.specifications.applications.some(Boolean)) ||
      (Array.isArray(itemData.specifications.features) && itemData.specifications.features.some(Boolean)) ||
      (Array.isArray(itemData.specifications.certifications) && itemData.specifications.certifications.some(Boolean))
    );

  const handleAddToCart = () => {
    addToCart(
      {
        _id: itemData._id || itemData.slug || itemData.name || 'unknown-product',
        name: itemData.name || 'Product',
        price: itemData.price || 0,
        images,
        slug: itemData.slug || slug,
        description: itemData.description || '',
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
          <Link href={`/clientSide/category/${categorySlug}`} className="hover:text-white transition-colors">
            {parentCategory}
          </Link>
          <span>/</span>
          <span className="text-white">
            {itemData.name}
            {(itemData.specifications?.model || (itemData as any).code) && (
              <span className="opacity-60 ml-1">({itemData.specifications?.model || (itemData as any).code})</span>
            )}
          </span>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="bg-[#1e293b] rounded-xl overflow-hidden border border-gray-700 p-8">
            <ProductImage
              src={images[selectedImage]}
              alt={itemData.name || 'Product image'}
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
                    alt={`${itemData.name} view ${index + 1}`}
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
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {itemData.name}
              {(itemData.specifications?.model || (itemData as any).code) && (
                <span className="text-xl md:text-2xl font-medium text-cyan-500/90 ml-3">[{itemData.specifications?.model || (itemData as any).code}]</span>
              )}
            </h1>
          </div>

          <div className="flex items-center justify-between border-b border-gray-800 pb-6 gap-4">
            <div>
              {itemData.showPrice ? (
                <span className="text-2xl font-bold text-cyan-400">Rs. {Number(itemData.price || 0).toLocaleString()}</span>
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
              <Wrench size={20} /> Product Overview
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {itemData.description || `High-quality ${itemData.name} for industrial applications.`}
            </p>
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
                className={`w-full px-8 py-4 rounded font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${
                  added ? 'bg-green-600 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                }`}
              >
                {added ? <><Check size={20} /> Added to Cart</> : <><ShoppingCart size={20} /> Add to Cart</>}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/clientSide/contact"
                className="flex-1 px-8 py-4 rounded font-bold uppercase tracking-wide transition-all bg-transparent border border-gray-600 text-gray-300 hover:border-white hover:text-white flex items-center justify-center gap-2"
              >
                <FileText size={20} /> Request Quote
              </Link>
              {pdfDownloadUrl && (
                <a
                  href={pdfDownloadUrl}
                  download={`${itemData.name?.replace(/\s+/g, '_') || 'product'}_specifications.pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 px-8 py-4 rounded font-bold uppercase tracking-wide transition-all bg-transparent border border-gray-600 text-gray-300 hover:border-white hover:text-white flex items-center justify-center gap-2"
                >
                  <FileText size={20} /> Download Specs (PDF)
                </a>
              )}
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
        </div>
      </div>

      {hasStoredSpecifications && (
        <div className="mt-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Technical Specifications</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {basicInformation.length > 0 && (
              <div className="bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                <div className="space-y-4">
                  {basicInformation.map((item, index) => (
                    <div
                      key={`${item.label}-${index}`}
                      className={`flex justify-between gap-4 ${index !== basicInformation.length - 1 ? 'border-b border-gray-800 pb-3' : ''}`}
                    >
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-white font-medium text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {operatingSpecifications.length > 0 && (
              <div className="bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Operating Specifications</h3>
                <div className="space-y-4">
                  {operatingSpecifications.map((item, index) => (
                    <div
                      key={`${item.label}-${index}`}
                      className={`flex justify-between gap-4 ${index !== operatingSpecifications.length - 1 ? 'border-b border-gray-800 pb-3' : ''}`}
                    >
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-white font-medium text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {electricalSpecifications.length > 0 && (
              <div className="bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Electrical Specifications</h3>
                <div className="flex flex-wrap gap-2">
                  {electricalSpecifications.map((voltage) => (
                    <span
                      key={voltage}
                      className="px-3 py-1.5 rounded-full border border-cyan-800 bg-cyan-900/20 text-cyan-300 text-sm"
                    >
                      {voltage}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {applications.length > 0 && (
              <div className="bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Applications</h3>
                <ul className="space-y-3">
                  {applications.map((application, index) => (
                    <li key={`${application}-${index}`} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2" />
                      <span className="text-gray-300">{application}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {certifications.length > 0 && (
              <div className="bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Certifications & Standards</h3>
                <div className="flex flex-wrap gap-2">
                  {certifications.map((cert) => (
                    <span
                      key={cert}
                      className="px-3 py-1.5 rounded-full border border-gray-700 bg-[#111827] text-gray-200 text-sm"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {features.length > 0 && (
              <div className="bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Key Features</h3>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={`${feature}-${index}`} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-12">
        <div className="bg-[#1e293b] rounded-xl border border-gray-800 p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Need More Information?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Contact our sales team for bulk orders, technical support, or custom specifications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/clientSide/contact"
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-semibold transition text-center"
            >
              Contact Sales
            </Link>
            {pdfDownloadUrl && (
              <a
                href={pdfDownloadUrl}
                download={`${itemData.name?.replace(/\s+/g, '_') || 'product'}_specifications.pdf`}
                target="_blank"
                rel="noreferrer"
                className="bg-transparent border border-gray-600 text-gray-200 hover:border-white hover:text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                Download Specs (PDF)
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
