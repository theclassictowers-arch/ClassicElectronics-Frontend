/**
 * Products Database - Complete Product Catalog
 * =============================================
 * This file serves as the main products database for Classic Electronics.
 * It combines all valves data with other product categories.
 */

import { Product } from '@/context/CartContext';
import { ValveProduct, allValves } from './valvesData';
import { allGoyenValves } from './goyenValvesData';

// Base Product Interface Extension
export interface ProductDetails extends Product {
  category: string;
  subcategory: string;
  brand?: string;
  technicalSpecs?: Record<string, any>;
  stockStatus: string;
  sku: string;
  weight?: string;
  dimensions?: string;
  warranty?: string;
  minimumOrderQuantity?: number;
  leadTime?: string;
  tags?: string[];
  relatedProducts?: string[];
}

// Combine all valves from different sources
const allValvesCombined: ProductDetails[] = [
  ...allValves.map(valve => ({
    ...valve,
    category: valve.category,
    subcategory: valve.subcategory,
    brand: 'ASCO/Equivalent',
    technicalSpecs: valve.specifications,
    sku: `VALVE-${valve.name}`,
    stockStatus: valve.stockStatus,
    weight: 'Varies by model',
    dimensions: 'Compact industrial design',
    warranty: '1 year manufacturer warranty',
    minimumOrderQuantity: 1,
    leadTime: 'In stock - ready to ship',
    tags: ['valve', 'solenoid', 'industrial', 'pneumatic', 'automation'],
    relatedProducts: []
  })),
  ...allGoyenValves.map(valve => ({
    ...valve,
    category: valve.category,
    subcategory: valve.subcategory,
    brand: 'GOYEN',
    technicalSpecs: valve.specifications,
    sku: `GOYEN-${valve.name}`,
    stockStatus: valve.stockStatus,
    weight: 'Varies by port size',
    dimensions: 'Standard industrial valve',
    warranty: '1 year manufacturer warranty',
    minimumOrderQuantity: 1,
    leadTime: 'In stock - ready to ship',
    tags: ['goyen', 'valve', 'solenoid', 'industrial', 'japanese'],
    relatedProducts: []
  }))
];

// Other Product Categories
export const industrialControllers: ProductDetails[] = [
  {
    _id: 'ctrl-001',
    name: 'Sequential Timer Controller',
    price: 18900,
    images: ['/images/products/default-product.jpeg'],
    slug: 'sequential-timer-controller',
    description: 'Advanced sequential timer controller for industrial automation with multiple channel control.',
    category: 'Controllers',
    subcategory: 'Sequential Timer Controllers',
    brand: 'Classic Electronics',
    stockStatus: 'In Stock',
    sku: 'CTRL-SEQ-001',
    weight: '2.5 kg',
    dimensions: '200x150x80 mm',
    warranty: '2 years',
    minimumOrderQuantity: 1,
    leadTime: '1-2 weeks',
    tags: ['controller', 'timer', 'industrial', 'automation', 'plc'],
    relatedProducts: ['ctrl-002', 'ctrl-003']
  },
  {
    _id: 'ctrl-002',
    name: 'PLC Based Controller',
    price: 32500,
    images: ['/images/products/default-product.jpeg'],
    slug: 'plc-based-controller',
    description: 'Programmable Logic Controller based industrial automation system.',
    category: 'Controllers',
    subcategory: 'PLC Based Controllers',
    brand: 'Siemens Equivalent',
    stockStatus: 'In Stock',
    sku: 'CTRL-PLC-002',
    weight: '3.2 kg',
    dimensions: '250x180x100 mm',
    warranty: '3 years',
    minimumOrderQuantity: 1,
    leadTime: '2-3 weeks',
    tags: ['plc', 'controller', 'industrial', 'automation', 'programmable'],
    relatedProducts: ['ctrl-001', 'ctrl-004']
  }
];

export const electronicsComponents: ProductDetails[] = [
  {
    _id: 'elec-001',
    name: 'Control Board for Dust Collector',
    price: 8500,
    images: ['/images/products/default-product.jpeg'],
    slug: 'control-board-dust-collector',
    description: 'Main control board for industrial dust collection systems.',
    category: 'Electronics',
    subcategory: 'Control Boards',
    brand: 'Classic Electronics',
    stockStatus: 'In Stock',
    sku: 'ELEC-CB-001',
    weight: '1.2 kg',
    dimensions: '180x120x40 mm',
    warranty: '1 year',
    minimumOrderQuantity: 1,
    leadTime: 'In stock',
    tags: ['control board', 'electronics', 'dust collector', 'pcb'],
    relatedProducts: ['elec-002', 'ctrl-001']
  },
  {
    _id: 'elec-002',
    name: 'Industrial Power Supply 24V DC',
    price: 4200,
    images: ['/images/products/default-product.jpeg'],
    slug: 'industrial-power-supply-24v-dc',
    description: '24V DC industrial power supply for automation equipment.',
    category: 'Electronics',
    subcategory: 'Power Supplies',
    brand: 'Mean Well Equivalent',
    stockStatus: 'In Stock',
    sku: 'ELEC-PS-002',
    weight: '0.8 kg',
    dimensions: '150x100x50 mm',
    warranty: '2 years',
    minimumOrderQuantity: 1,
    leadTime: 'In stock',
    tags: ['power supply', '24v', 'dc', 'industrial', 'power'],
    relatedProducts: ['elec-001', 'elec-003']
  }
];

export const sensorsInstrumentation: ProductDetails[] = [
  {
    _id: 'sensor-001',
    name: 'Differential Pressure Sensor',
    price: 12500,
    images: ['/images/products/default-product.jpeg'],
    slug: 'differential-pressure-sensor',
    description: 'High accuracy differential pressure sensor for industrial applications.',
    category: 'Sensors',
    subcategory: 'Pressure Sensors',
    brand: 'Siemens Equivalent',
    stockStatus: 'In Stock',
    sku: 'SENS-DP-001',
    weight: '0.5 kg',
    dimensions: '100x80x60 mm',
    warranty: '1 year',
    minimumOrderQuantity: 1,
    leadTime: '2-3 weeks',
    tags: ['sensor', 'pressure', 'differential', 'industrial', 'measurement'],
    relatedProducts: ['sensor-002', 'ctrl-002']
  }
];

// Complete Products Database
export const allProducts: ProductDetails[] = [
  ...allValvesCombined,
  ...industrialControllers,
  ...electronicsComponents,
  ...sensorsInstrumentation
];

// Helper Functions
export function getProductById(productId: string): ProductDetails | undefined {
  return allProducts.find(product => product._id === productId);
}

export function getProductBySlug(slug: string): ProductDetails | undefined {
  return allProducts.find(product => product.slug === slug);
}

export function getProductsByCategory(category: string): ProductDetails[] {
  return allProducts.filter(product => product.category === category);
}

export function getProductsBySubcategory(category: string, subcategory: string): ProductDetails[] {
  return allProducts.filter(product =>
    product.category === category && product.subcategory === subcategory
  );
}

export function searchProducts(searchTerm: string): ProductDetails[] {
  const term = searchTerm.toLowerCase();
return allProducts.filter(product =>
  product.name.toLowerCase().includes(term) ||
  (product.description ?? '').toLowerCase().includes(term) ||
  product.category.toLowerCase().includes(term) ||
  product.tags?.some(tag => tag.toLowerCase().includes(term))
);

}

export function getProductsInStock(): ProductDetails[] {
  return allProducts.filter(product =>
    !product.stockStatus.includes('Out of Stock') &&
    !product.stockStatus.includes('0 in stock')
  );
}

export function getProductsByPriceRange(min: number, max: number): ProductDetails[] {
  return allProducts.filter(product => product.price >= min && product.price <= max);
}

export function getFeaturedProducts(): ProductDetails[] {
  // Return best selling or featured products
  return allProducts
    .filter(product => product.stockStatus.includes('In Stock'))
    .sort((a, b) => b.price - a.price) // Sort by price (highest first)
    .slice(0, 8); // Top 8 products
}

export function getRelatedProducts(productId: string): ProductDetails[] {
  const product = getProductById(productId);
  if (!product || !product.relatedProducts || product.relatedProducts.length === 0) {
    // Fallback: return products from same category
    return getProductsByCategory(product?.category || '')
      .filter(p => p._id !== productId)
      .slice(0, 4);
  }

  return product.relatedProducts
    .map(id => getProductById(id))
    .filter((p): p is ProductDetails => p !== undefined)
    .slice(0, 4);
}

// Category Statistics
export const categoryStats = {
  totalProducts: allProducts.length,
  categories: {
    valves: allValvesCombined.length,
    controllers: industrialControllers.length,
    electronics: electronicsComponents.length,
    sensors: sensorsInstrumentation.length
  },
  stockStatus: {
    inStock: allProducts.filter(p => p.stockStatus.includes('In Stock') || p.stockStatus.includes('in stock')).length,
    lowStock: allProducts.filter(p => p.stockStatus.includes('Low Stock') || p.stockStatus.includes('low stock')).length,
    outOfStock: allProducts.filter(p => p.stockStatus.includes('Out of Stock') || p.stockStatus.includes('out of stock')).length
  },
  priceRange: {
    min: Math.min(...allProducts.map(p => p.price)),
    max: Math.max(...allProducts.map(p => p.price)),
    average: Math.round(allProducts.reduce((sum, p) => sum + p.price, 0) / allProducts.length)
  }
};

// Export Summary
export default {
  allProducts,
  allValvesCombined,
  industrialControllers,
  electronicsComponents,
  sensorsInstrumentation,

  // Helper Functions
  getProductById,
  getProductBySlug,
  getProductsByCategory,
  getProductsBySubcategory,
  searchProducts,
  getProductsInStock,
  getProductsByPriceRange,
  getFeaturedProducts,
  getRelatedProducts,

  // Statistics
  categoryStats
};
