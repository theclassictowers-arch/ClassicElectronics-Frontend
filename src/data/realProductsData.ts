/**
 * Real Products Data - Enhanced with Valve Database
 * ==================================================
 * This file combines dummy data with real valve data for comprehensive product catalog.
 * Replaces the old dummyData.ts with actual valve specifications.
 */

import { Product } from '@/context/CartContext';
import { allValves } from './valvesData';
import { allGoyenValves } from './goyenValvesData';
import { allProducts } from './productsDatabase';

// ============================================================================
// REAL PRODUCTS - Using actual valve data
// ============================================================================

export const realProducts: Product[] = [
  // Valve Products from SCG353 Series
  {
    _id: 'scg353-a043',
    name: 'SCG353A043 - Right Angle Type Valve (3/4")',
    price: 12500,
    images: ['/images/products/valvesSliderimg.jpeg'],
    slug: 'scg353a043-right-angle-valve',
    description: 'SCG353 series right angle type solenoid valve, 3/4" port size with threaded G/NPT connections. CE and ISO9001 certified.'
  },
  {
    _id: 'scg353-a044',
    name: 'SCG353A044 - Right Angle Type Valve (1")',
    price: 13500,
    images: ['/images/products/valvesSliderimg.jpeg'],
    slug: 'scg353a044-right-angle-valve',
    description: 'SCG353 series right angle type solenoid valve, 1" port size with threaded G/NPT connections.'
  },
  {
    _id: 'scg353-a047',
    name: 'SCG353A047 - Right Angle Type Valve (1-1/4")',
    price: 14500,
    images: ['/images/products/valvesSliderimg.jpeg'],
    slug: 'scg353a047-right-angle-valve',
    description: 'SCG353 series right angle type solenoid valve, 1-1/4" port size for medium flow applications.'
  },

  // Valve Products from SCR353 Series
  {
    _id: 'scr353-a230',
    name: 'SCR353A230 - Submerged Type Valve (3")',
    price: 19500,
    images: ['/images/products/valvesSliderimg.jpeg'],
    slug: 'scr353a230-submerged-valve',
    description: 'SCR353 series submerged type solenoid valve, 3" immersion-type designed for direct manifold box mounting.'
  },
  {
    _id: 'scr353-a235',
    name: 'SCR353A235 - Submerged Type Valve (3.5")',
    price: 21500,
    images: ['/images/products/valvesSliderimg.jpeg'],
    slug: 'scr353a235-submerged-valve',
    description: 'SCR353 series submerged type solenoid valve, 3.5" immersion-type for larger manifold applications.'
  },

  // GOYEN Type Valves
  {
    _id: 'goyen-1',
    name: 'TMF-Z-20 - GOYEN Solenoid Valve',
    price: 20933,
    images: ['/images/products/filtersliderimg.jpeg'],
    slug: 'tmf-z-20-goyen-valve',
    description: 'High-quality TMF-Z-20 for industrial applications. This Solenoid Valves product is built to meet international standards and ensure reliable performance in demanding environments.'
  },
  {
    _id: 'goyen-2',
    name: 'TMF-Z-25 - GOYEN Solenoid Valve',
    price: 22933,
    images: ['/images/products/filtersliderimg.jpeg'],
    slug: 'tmf-z-25-goyen-valve',
    description: 'TMF-Z-25 solenoid valve with 25mm port size. Enhanced version for higher flow applications.'
  },
  {
    _id: 'goyen-3',
    name: 'TMF-Z-40S - GOYEN Solenoid Valve',
    price: 26933,
    images: ['/images/products/filtersliderimg.jpeg'],
    slug: 'tmf-z-40s-goyen-valve',
    description: 'TMF-Z-40S solenoid valve with 40mm port size. Specialized version for industrial applications.'
  },

  // Other Products
  {
    _id: 'ctrl-001',
    name: 'Sequential Timer Controller',
    price: 18900,
    images: ['/images/products/default-product.jpeg'],
    slug: 'sequential-timer-controller',
    description: 'Advanced sequential timer controller for industrial automation with multiple channel control.'
  },
  {
    _id: 'ctrl-002',
    name: 'PLC Based Controller',
    price: 32500,
    images: ['/images/products/default-product.jpeg'],
    slug: 'plc-based-controller',
    description: 'Programmable Logic Controller based industrial automation system.'
  },
  {
    _id: 'elec-001',
    name: 'Control Board for Dust Collector',
    price: 8500,
    images: ['/images/products/default-product.jpeg'],
    slug: 'control-board-dust-collector',
    description: 'Main control board for industrial dust collection systems.'
  },
  {
    _id: 'elec-002',
    name: 'Industrial Power Supply 24V DC',
    price: 4200,
    images: ['/images/products/default-product.jpeg'],
    slug: 'industrial-power-supply-24v-dc',
    description: '24V DC industrial power supply for automation equipment.'
  },
  {
    _id: 'sensor-001',
    name: 'Differential Pressure Sensor',
    price: 12500,
    images: ['/images/products/default-product.jpeg'],
    slug: 'differential-pressure-sensor',
    description: 'High accuracy differential pressure sensor for industrial applications.'
  }
];

// ============================================================================
// ENHANCED CATEGORIES WITH REAL PRODUCT DATA
// ============================================================================

export const valveCategories = [
  {
    name: 'Solenoid Valves',
    slug: 'solenoid-valves',
    _id: 'valve-cat-1',
    children: [
      {
        name: 'ASCO Type / Equivalent',
        slug: 'solenoid-valves/asco-type',
        _id: 'asco-valves',
        items: allValves
          .filter(valve => valve.specifications.series.includes('SCG') || valve.specifications.series.includes('SCR'))
          .map(valve => ({
            name: valve.name,
            slug: valve.slug,
            _id: valve._id,
            price: valve.price,
            description: valve.description,
            stockStatus: valve.stockStatus
          }))
      },
      {
        name: 'GOYEN Type',
        slug: 'solenoid-valves/goyen-type',
        _id: 'goyen-valves',
        items: allGoyenValves.map(valve => ({
          name: valve.name,
          slug: valve.slug,
          _id: valve._id,
          price: valve.price,
          description: valve.description,
          stockStatus: valve.stockStatus
        }))
      }
    ]
  },
  {
    name: 'Diaphragm Valves & Repair Kits',
    slug: 'diaphragm-valves',
    _id: 'valve-cat-2',
    children: [
      {
        name: 'ASCO Type Repair Kits',
        slug: 'diaphragm-valves/asco-repair-kits',
        _id: 'asco-repair-kits',
        items: [
          {
            name: 'C113-443: Diaphragm + Spring (3/4" Angle Type Valve)',
            slug: 'diaphragm/asco/c113-443',
            _id: 'asco-rk-1',
            price: 3200,
            description: 'Complete diaphragm and spring repair kit for 3/4" angle type valves',
            stockStatus: 'In Stock'
          },
          {
            name: 'C113-827: Diaphragm + Spring (1.5" Solenoid Pulse Valve)',
            slug: 'diaphragm/asco/c113-827',
            _id: 'asco-rk-2',
            price: 4500,
            description: 'Diaphragm and spring repair kit for 1.5" solenoid pulse valves',
            stockStatus: 'In Stock'
          }
        ]
      },
      {
        name: 'Goyen Type Repair Kits',
        slug: 'diaphragm-valves/goyen-repair-kits',
        _id: 'goyen-repair-kits',
        items: [
          {
            name: 'K2003 & K2007: Diaphragm + Spring',
            slug: 'diaphragm/goyen/k2003-k2007',
            _id: 'goyen-rk-1',
            price: 2800,
            description: 'Complete diaphragm and spring kit for GOYEN K2003 & K2007 valves',
            stockStatus: 'In Stock'
          },
          {
            name: 'K2501 & K2503: Diaphragm + Spring',
            slug: 'diaphragm/goyen/k2501-k2503',
            _id: 'goyen-rk-2',
            price: 3200,
            description: 'Diaphragm and spring repair kit for GOYEN K2501 & K2503 valves',
            stockStatus: 'In Stock'
          }
        ]
      }
    ]
  }
];

export const controllerCategories = [
  {
    name: 'Sequential Timer Controllers',
    slug: 'sequential-timer-controllers',
    _id: 'controller-1',
    items: allProducts
      .filter(p => p.category === 'Controllers' && p.subcategory === 'Sequential Timer Controllers')
      .map(p => ({
        name: p.name,
        slug: p.slug,
        _id: p._id,
        price: p.price,
        description: p.description,
        stockStatus: p.stockStatus
      }))
  },
  {
    name: 'PLC Based Controllers',
    slug: 'plc-based-controllers',
    _id: 'controller-2',
    items: allProducts
      .filter(p => p.category === 'Controllers' && p.subcategory === 'PLC Based Controllers')
      .map(p => ({
        name: p.name,
        slug: p.slug,
        _id: p._id,
        price: p.price,
        description: p.description,
        stockStatus: p.stockStatus
      }))
  }
];

export const electronicsCategories = [
  {
    name: 'Control Boards',
    slug: 'control-boards',
    _id: 'electronics-1',
    items: allProducts
      .filter(p => p.category === 'Electronics' && p.subcategory === 'Control Boards')
      .map(p => ({
        name: p.name,
        slug: p.slug,
        _id: p._id,
        price: p.price,
        description: p.description,
        stockStatus: p.stockStatus
      }))
  },
  {
    name: 'Power Supplies',
    slug: 'power-supplies',
    _id: 'electronics-2',
    items: allProducts
      .filter(p => p.category === 'Electronics' && p.subcategory === 'Power Supplies')
      .map(p => ({
        name: p.name,
        slug: p.slug,
        _id: p._id,
        price: p.price,
        description: p.description,
        stockStatus: p.stockStatus
      }))
  }
];

// ============================================================================
// FEATURED PRODUCTS SECTION
// ============================================================================

export const featuredProducts = realProducts.slice(0, 6); // First 6 products as featured

export const homePageFeatures = [
  {
    icon: 'Settings',
    title: 'Precision Engineering',
    description: 'Components designed for absolute accuracy and reliability.'
  },
  {
    icon: 'Zap',
    title: 'High Performance',
    description: 'Built to withstand voltage fluctuations and rigorous use.'
  },
  {
    icon: 'Activity',
    title: 'Industrial Grade',
    description: 'Tested and certified for heavy-duty industrial environments.'
  },
  {
    icon: 'Shield',
    title: 'Quality Certified',
    description: 'ISO 9001 and CE certified products for guaranteed quality.'
  },
  {
    icon: 'Package',
    title: 'Ready Stock',
    description: 'Most valves and components available for immediate delivery.'
  },
  {
    icon: 'Tool',
    title: 'Technical Support',
    description: 'Expert technical support for installation and maintenance.'
  }
];

// ============================================================================
// STATISTICS AND SUMMARY
// ============================================================================

export const REAL_DATA_SUMMARY = {
  products: {
    count: realProducts.length,
    valvesCount: allValves.length + allGoyenValves.length,
    controllersCount: controllerCategories.reduce((sum, cat) => sum + (cat.items?.length || 0), 0),
    electronicsCount: electronicsCategories.reduce((sum, cat) => sum + (cat.items?.length || 0), 0),
    location: 'src/data/realProductsData.ts',
    apiEndpoint: '/api/products',
    usedWhen: 'Real product data available'
  },
  categories: {
    count: {
      valves: valveCategories.length,
      controllers: controllerCategories.length,
      electronics: electronicsCategories.length
    },
    totalProducts: realProducts.length,
    location: 'src/components/Navbar.tsx',
    apiEndpoint: '/api/categories',
    usedWhen: 'Real categories with actual product data'
  },
  features: {
    count: homePageFeatures.length,
    location: 'src/components/HomeClient.tsx',
    apiEndpoint: 'N/A (static content)',
    usedWhen: 'Always shown'
  },
  technicalSpecs: {
    valveSeries: ['SCG353 (Right Angle)', 'SCR353 (Submerged)', 'GOYEN TMF Series'],
    certifications: ['CE', 'ISO9001'],
    workingPressure: '0.3-0.8 Mpa (43.5-116 PSI)',
    diaphragmLife: '1 million+ cycles'
  }
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  realProducts,
  valveCategories,
  controllerCategories,
  electronicsCategories,
  featuredProducts,
  homePageFeatures,
  REAL_DATA_SUMMARY,

  // Utility exports
  getAllValves: () => [...allValves, ...allGoyenValves],
  getProductBySlug: (slug: string) => realProducts.find(p => p.slug === slug),
  getProductsByCategory: (category: string) => {
    if (category === 'valves') {
      return realProducts.filter(p => p._id.includes('scg') || p._id.includes('scr') || p._id.includes('goyen'));
    }
    if (category === 'controllers') {
      return realProducts.filter(p => p._id.includes('ctrl'));
    }
    if (category === 'electronics') {
      return realProducts.filter(p => p._id.includes('elec'));
    }
    return [];
  }
};
