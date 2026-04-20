'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getProducts, getProductBySlug, getNavbarData } from '@/services/api';
import { allValves as localAscoValves } from '@/data/valvesData';
import { allGoyenValves as localGoyenValves } from '@/data/goyenValvesData';
import { valveCategories, controllerCategories, electronicsCategories } from '@/data/dummyData';
import { Product, useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import ValveCard from '@/components/ValveCard';
import type { ValveProduct } from '@/types/valve';
import { Package, ArrowLeft, ShoppingCart, Check, Shield, Truck, Settings, Wrench } from 'lucide-react';
import Link from 'next/link';
import { matchImagesByProductName } from '@/lib/productImageMatcher';

const isValveProduct = (p: any): p is ValveProduct =>
    p && typeof p === 'object' && p.specifications && typeof p.specifications.series === 'string';

// Item Detail Component
const ItemDetailView = ({ itemData, categorySlug }: { itemData: any, categorySlug: string }) => {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

    const handleAddToCart = () => {
        addToCart({
            _id: itemData._id || itemData.item?._id || categorySlug,
            name: itemData.name || itemData.item?.name || '',
            price: itemData.price || 0,
            images: itemData.images || [],
            slug: itemData.slug || itemData.item?.slug || categorySlug,
            description: itemData.description || ''
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const images = itemData.images?.length > 0
        ? itemData.images
        : ['/images/products/valvesSliderimg.jpeg', '/images/products/filtersliderimg.jpeg'];

    const parentCategory = itemData.parentCategory || itemData.category?.name || 'Products';
    const subCategory = itemData.subCategory || itemData.subcategory || '';
    const itemName = itemData.name || itemData.item?.name || '';
    const description = itemData.description || `High-quality ${itemName} for industrial applications.`;
    const features = itemData.features || itemData.specifications?.features || [
        'Built with industrial-grade materials',
        'Corrosion resistant',
        'High pressure tolerance (0.3-0.8 Mpa)',
        'Easy installation and maintenance',
        'ISO 9001 certified',
        'Quick response time',
        'Low power consumption',
        'Long service life'
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="mb-6">
                <Link href={`/clientSide/category/${itemData.categorySlug || categorySlug.split('/').slice(0, -1).join('/')}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                    Back to {parentCategory}
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Image Gallery */}
                <div>
                    <div className="bg-[#1e293b] rounded-xl overflow-hidden border border-gray-800 mb-4 group cursor-pointer">
                        <div className="relative overflow-hidden">
                            <img
                                src={images[selectedImage]}
                                alt={itemName}
                                className="w-full h-[450px] object-contain bg-white/5 transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                                <span className="bg-cyan-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full">{parentCategory}</span>
                                <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">{selectedImage + 1} / {images.length}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {images.map((img: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedImage(idx)}
                                className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${selectedImage === idx ? 'border-cyan-500 ring-2 ring-cyan-500/30' : 'border-gray-700 hover:border-cyan-400'}`}
                            >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div>
                    <div className="mb-4">
                        <span className="text-cyan-500 font-bold uppercase tracking-wider text-sm">{parentCategory}</span>
                        {subCategory && (
                            <>
                                <span className="text-gray-500 mx-2">/</span>
                                <span className="text-gray-400 text-sm">{subCategory}</span>
                            </>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {itemName}
                        {itemData.specifications?.model && <span className="text-xl md:text-2xl font-normal text-gray-400 ml-2">({itemData.specifications.model})</span>}
                    </h1>

                    <p className="text-gray-300 leading-relaxed mb-6">{description}</p>

                    {/* Stock & Availability */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-2 bg-green-900/20 border border-green-800 px-4 py-2 rounded-lg">
                            <Package size={16} className="text-green-400" />
                            <span className="text-green-400 font-medium">In Stock</span>
                        </div>
                        <span className="text-gray-400">Contact for pricing</span>
                    </div>

                    {/* Features */}
                    <div className="bg-[#1e293b] rounded-xl p-6 border border-gray-800 mb-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Settings size={18} className="text-cyan-400" />
                            Features
                        </h3>
                        <ul className="space-y-3">
                            {features.map((feature: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-3 text-gray-300">
                                    <Check size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <button
                            onClick={handleAddToCart}
                            disabled={added}
                            className={`flex-1 py-4 px-8 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${added ? 'bg-green-600 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}`}
                        >
                            {added ? (
                                <>
                                    <Check size={20} />
                                    Added to Cart
                                </>
                            ) : (
                                <>
                                    <ShoppingCart size={20} />
                                    Add to Cart
                                </>
                            )}
                        </button>
                        <Link
                            href="/clientSide/contact"
                            className="flex-1 py-4 px-8 rounded-lg font-bold bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 text-center transition-colors"
                        >
                            Request Quote
                        </Link>
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#1e293b] rounded-lg p-4 border border-gray-800">
                            <div className="flex items-center gap-3">
                                <Shield size={20} className="text-cyan-400" />
                                <div>
                                    <div className="text-white font-medium">Warranty</div>
                                    <div className="text-gray-400 text-sm">1 Year</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#1e293b] rounded-lg p-4 border border-gray-800">
                            <div className="flex items-center gap-3">
                                <Truck size={20} className="text-cyan-400" />
                                <div>
                                    <div className="text-white font-medium">Delivery</div>
                                    <div className="text-gray-400 text-sm">Nationwide</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Specifications */}
            <div className="mt-12 bg-[#1e293b] rounded-xl p-8 border border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Wrench size={24} className="text-cyan-400" />
                    Technical Specifications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-[#0f172a] rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1">Working Pressure</div>
                        <div className="text-white font-medium">0.3 - 0.8 Mpa</div>
                    </div>
                    <div className="bg-[#0f172a] rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1">Voltage Options</div>
                        <div className="text-white font-medium">AC110V / AC220V / DC24V</div>
                    </div>
                    <div className="bg-[#0f172a] rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1">Working Medium</div>
                        <div className="text-white font-medium">Clear Air</div>
                    </div>
                    <div className="bg-[#0f172a] rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1">Temperature Range</div>
                        <div className="text-white font-medium">-5°C to 50°C</div>
                    </div>
                    <div className="bg-[#0f172a] rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1">Diaphragm Life</div>
                        <div className="text-white font-medium">1 Million+ Cycles</div>
                    </div>
                    <div className="bg-[#0f172a] rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1">Certification</div>
                        <div className="text-white font-medium">CE / ISO 9001</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Category List View Component
const CategoryListView = ({ categorySlug, categoryName, categoryDescription, valves, products, loading }: {
    categorySlug: string;
    categoryName: string;
    categoryDescription: string;
    valves: ValveProduct[];
    products: Product[];
    loading: boolean;
}) => {
    const totalItems = valves.length + products.length;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="mb-6">
                <Link href="/clientSide/valves" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                    Back to Valves
                </Link>
            </div>

            {/* Header */}
            <div className="bg-[#1e293b] rounded-lg p-8 mb-8 border border-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <span className="text-cyan-500 font-bold uppercase tracking-wider text-xs mb-2 block">Category</span>
                        <h1 className="text-3xl font-bold text-white capitalize">{categoryName}</h1>
                        {categoryDescription && (
                            <p className="text-gray-400 mt-2 max-w-2xl">{categoryDescription}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-cyan-400">
                            <Package size={18} />
                            <span className="font-bold">{totalItems} Products Found</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(n => (
                        <div key={n} className="bg-[#1e293b] h-[400px] rounded-lg animate-pulse border border-gray-800"></div>
                    ))}
                </div>
            ) : totalItems > 0 ? (
                <>
                    {valves.length > 0 && (
                        <div className="mb-12">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Package size={20} className="text-cyan-400" />
                                Valves ({valves.length})
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {valves.map((valve) => (
                                    <ValveCard key={valve._id} valve={valve} />
                                ))}
                            </div>
                        </div>
                    )}

                    {products.length > 0 && (
                        <div>
                            {valves.length > 0 && (
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Package size={20} className="text-cyan-400" />
                                    Products ({products.length})
                                </h2>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20 bg-[#1e293b] rounded-lg border border-gray-800 border-dashed">
                    <Package size={48} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl text-gray-400 font-medium">No products found in this category.</h3>
                    <p className="text-gray-500 mt-2">Check back later for new additions or browse our other categories.</p>
                    <Link href="/clientSide/valves" className="inline-block mt-6 text-cyan-400 hover:text-white font-medium border border-cyan-900 bg-cyan-900/10 px-6 py-3 rounded hover:bg-cyan-900/30 transition-colors">
                        Browse All Valves
                    </Link>
                </div>
            )}
        </div>
    );
};

const CategoryPage = () => {
    const params = useParams();
    const slugParam = params.slug;
    const categorySlug = Array.isArray(slugParam) ? slugParam.join('/') : (slugParam as string);

    const [valves, setValves] = useState<ValveProduct[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [itemData, setItemData] = useState<any>(null);
    const [isItemPage, setIsItemPage] = useState(false);
    const [categoryName, setCategoryName] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // First try to find as a single product by slug
                const slugToTry = categorySlug.includes('/') ? categorySlug.split('/').pop()! : categorySlug;
                let productResult = await getProductBySlug(slugToTry);
                // Fallback to local data if API returns nothing
                if (!productResult) {
                    const allLocal = [...localAscoValves, ...localGoyenValves];
                    productResult = allLocal.find(v => v.slug === slugToTry || v.slug === categorySlug) || null;
                }

                if (productResult && typeof productResult === 'object' && !Array.isArray(productResult)) {
                    const product = productResult as any;
                    // It's an item detail page
                    const matchedImages = matchImagesByProductName(
                        product.name || '',
                        product.slug || slugToTry,
                        product.description || ''
                    );
                    setItemData({
                        ...product,
                        item: { _id: product._id, name: product.name, slug: product.slug, description: product.description },
                        parentCategory: product.category?.name || product.categoryName || 'Products',
                        subCategory: product.subcategory || '',
                        categorySlug: product.category?.slug || categorySlug.split('/').slice(0, -1).join('/'),
                        images: product.images?.length > 0 ? product.images : matchedImages.length > 0 ? matchedImages : undefined,
                        features: product.specifications?.features || product.features,
                    });
                    setIsItemPage(true);
                } else {
                    // It's a category listing page - fetch products for this category
                    const allProducts = await getProducts({ categorySlug });
                    if (allProducts && Array.isArray(allProducts)) {
                        const fetchedValves = allProducts.filter(isValveProduct);
                        const fetchedProducts = allProducts.filter((p: any) => !isValveProduct(p));
                        setValves(fetchedValves);
                        setProducts(fetchedProducts);
                    }

                    // Get category name from navbar data or fallback
                    const navData = await getNavbarData();
                    const findCategoryName = (cats: any[], slug: string): { name: string; desc: string } | null => {
                        for (const cat of cats) {
                            if (cat.slug === slug) return { name: cat.name, desc: cat.description || '' };
                            if (cat.children) {
                                const found = findCategoryName(cat.children, slug);
                                if (found) return found;
                            }
                        }
                        return null;
                    };
                    let found = null;
                    if (navData) {
                        found = findCategoryName(navData.menus || [], categorySlug);
                    }
                    // Fallback to dummy data categories
                    if (!found) {
                        found = findCategoryName(valveCategories, categorySlug)
                            || findCategoryName(controllerCategories, categorySlug)
                            || findCategoryName(electronicsCategories, categorySlug);
                    }
                    if (found) {
                        setCategoryName(found.name);
                        setCategoryDescription(found.desc);
                    }
                }
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };

        if (categorySlug) {
            fetchData();
        }
    }, [categorySlug]);

    // Render item detail page
    if (isItemPage && itemData) {
        return <ItemDetailView itemData={itemData} categorySlug={categorySlug} />;
    }

    // Render category list page
    const displayName = categoryName || categorySlug.replace(/-/g, ' ').replace(/\//g, ' - ');

    return (
        <CategoryListView
            categorySlug={categorySlug}
            categoryName={displayName}
            categoryDescription={categoryDescription}
            valves={valves}
            products={products}
            loading={loading}
        />
    );
};

export default CategoryPage;
