/**
 * Valves Database - ASCO Series 353 Equivalent Valves
 * ====================================================
 * This file contains comprehensive technical data for all valve models
 * mentioned in the specifications provided.
 *
 * Valve Specifications:
 * - Series: SCG353 (Right Angle Type) and SCR353 (Submerged Type)
 * - Working Medium: Clear air
 * - Working Pressure: 0.3-0.8 Mpa (approx. 43.5-116 PSI)
 * - Voltage: AC110V/AC220V/DC24V (standard options)
 * - Ambient Temperature: -5 to 50°C (varies by diaphragm material)
 * - Diaphragm Material: NBR (Nitrile) or VITON
 * - Diaphragm Life Cycles: Over 1 million cycles
 * - Certification: CE and ISO9001
 */

import { Product } from '@/context/CartContext';

export interface ValveSpecification {
  model: string;
  series: 'SCG353' | 'SCR353' | 'GOYEN';
  type: 'Right Angle Type' | 'Submerged Type' | 'Solenoid Valve';
  portSize: string;
  connectionType: 'Threaded (G/NPT)' | 'Submerged';
  workingPressure: {
    mpa: [number, number];
    psi: [number, number];
  };
  voltageOptions: string[];
  diaphragmMaterial: 'NBR' | 'VITON' | 'Both';
  temperatureRange: {
    min: number;
    max: number;
    unit: '°C';
  };
  diaphragmLifeCycles: string;
  certifications: string[];
  description: string;
  features: string[];
  applications: string[];

  // New detailed specifications
  orifice?: string;
  connectionPortSize?: string;
  ambientTemperature?: string;
  relativeHumidity?: string;
  workingMedium?: string;
  voltage?: string;
  diaphragmMaterialDetails?: {
    nbr: string;
    viton: string;
  };
}

export interface ValveProduct extends Product {
  specifications: ValveSpecification;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' | string;
  category: 'Solenoid Valves' | 'Diaphragm Valves';
  subcategory: 'ASCO Type' | 'GOYEN Type' | 'MECAIR Type' | 'TURBO Type';
}

// Helper function to get image based on port size
// 1" or smaller -> valves-1.png
// 1.5" or 1-1/2" -> valves-2.png
// Larger than 1.5" -> valves-3.png
const getValveImage = (portSize: string): string[] => {
  // Parse port size - extract numeric value
  const sizeStr = portSize.toLowerCase().replace(/['"]/g, '');

  // Check for specific sizes
  if (sizeStr.includes('3/4') || sizeStr === '1' || sizeStr.includes('20mm') || sizeStr.includes('25mm')) {
    return ['/images/products/valves-1.png'];
  }
  if (sizeStr.includes('1-1/2') || sizeStr.includes('1.5') || sizeStr.includes('1 1/2') || sizeStr.includes('40')) {
    return ['/images/products/valves-2.png'];
  }
  // Anything larger (2", 2.5", 3", etc.)
  return ['/images/products/valves-3.png'];
};

// SCG353 Series (Right Angle Type)
export const scg353Series: ValveProduct[] = [
  {
    _id: 'scg353-a043',
    name: 'SCG353A043',
    price: 12500, // Sample price in INR
    images: getValveImage('3/4"'),
    slug: 'scg353a043-right-angle-valve',
    description: 'SCG353 series right angle type solenoid valve, 3/4" port size with threaded G/NPT connections. CE and ISO9001 certified.',
    specifications: {
      model: 'SCG353A043',
      series: 'SCG353',
      type: 'Right Angle Type',
      portSize: '3/4"',
      connectionType: 'Threaded (G/NPT)',
      workingPressure: {
        mpa: [0.3, 0.8],
        psi: [43.5, 116]
      },
      voltageOptions: ['AC110V', 'AC220V', 'DC24V'],
      diaphragmMaterial: 'NBR',
      temperatureRange: {
        min: -10,
        max: 70,
        unit: '°C'
      },
      diaphragmLifeCycles: 'Over 1 million cycles',
      certifications: ['CE', 'ISO9001'],
      description: 'Right angle type solenoid valve with 3/4" port size. Suitable for dust collection systems and industrial automation.',
      features: [
        'Compact right-angle design',
        'Quick response time',
        'High reliability',
        'Easy installation',
        'Low power consumption'
      ],
      applications: [
        'Dust collection systems',
        'Pneumatic automation',
        'Industrial cleaning equipment',
        'Material handling systems'
      ],

      // Detailed specifications
      orifice: 'As per model',
      connectionPortSize: 'As per model',
      ambientTemperature: '-5 to 50°C',
      relativeHumidity: '<85%',
      workingMedium: 'Clear air',
      voltage: 'AC110V / AC220V / DC24V',
      diaphragmMaterialDetails: {
        nbr: '-10 to 80°C',
        viton: '-10 to 200°C'
      }
    },
    stockStatus: 'In Stock',
    category: 'Solenoid Valves',
    subcategory: 'ASCO Type'
  },
  {
    _id: 'scg353-a044',
    name: 'SCG353A044',
    price: 13500,
    images: getValveImage('1"'),
    slug: 'scg353a044-right-angle-valve',
    description: 'SCG353 series right angle type solenoid valve, 1" port size with threaded G/NPT connections.',
    specifications: {
      model: 'SCG353A044',
      series: 'SCG353',
      type: 'Right Angle Type',
      portSize: '1"',
      connectionType: 'Threaded (G/NPT)',
      workingPressure: {
        mpa: [0.3, 0.8],
        psi: [43.5, 116]
      },
      voltageOptions: ['AC110V', 'AC220V', 'DC24V'],
      diaphragmMaterial: 'NBR',
      temperatureRange: {
        min: -10,
        max: 70,
        unit: '°C'
      },
      diaphragmLifeCycles: '1 million+',
      certifications: ['CE', 'ISO9001'],
      description: 'Right angle type solenoid valve with 1" port size. Enhanced flow capacity for industrial applications.',
      features: [
        'Increased flow capacity',
        'Robust construction',
        'Corrosion-resistant materials',
        'Long service life',
        'Easy maintenance'
      ],
      applications: [
        'Large dust collectors',
        'Industrial pneumatic systems',
        'Process automation',
        'Packaging machinery'
      ]
    },
    stockStatus: 'In Stock',
    category: 'Solenoid Valves',
    subcategory: 'ASCO Type'
  },
  {
    _id: 'scg353-a047',
    name: 'SCG353A047',
    price: 14500,
    images: getValveImage('1-1/4"'),
    slug: 'scg353a047-right-angle-valve',
    description: 'SCG353 series right angle type solenoid valve, 1-1/4" port size for medium flow applications.',
    specifications: {
      model: 'SCG353A047',
      series: 'SCG353',
      type: 'Right Angle Type',
      portSize: '1-1/4"',
      connectionType: 'Threaded (G/NPT)',
      workingPressure: {
        mpa: [0.3, 0.8],
        psi: [43.5, 116]
      },
      voltageOptions: ['AC110V', 'AC220V', 'DC24V'],
      diaphragmMaterial: 'NBR',
      temperatureRange: {
        min: -10,
        max: 70,
        unit: '°C'
      },
      diaphragmLifeCycles: '1 million+',
      certifications: ['CE', 'ISO9001'],
      description: 'Medium flow right angle type solenoid valve with 1-1/4" port size.',
      features: [
        'Medium flow capacity',
        'Precision engineering',
        'Energy efficient',
        'Quiet operation',
        'Dust-tight design'
      ],
      applications: [
        'Medium capacity dust collectors',
        'Industrial ventilation',
        'Air handling units',
        'Process control systems'
      ]
    },
    stockStatus: 'In Stock',
    category: 'Solenoid Valves',
    subcategory: 'ASCO Type'
  },
  {
    _id: 'scg353-a050',
    name: 'SCG353A050',
    price: 16500,
    images: getValveImage('2"'),
    slug: 'scg353a050-right-angle-valve',
    description: 'SCG353 series right angle type solenoid valve, 2" port size for high flow applications.',
    specifications: {
      model: 'SCG353A050',
      series: 'SCG353',
      type: 'Right Angle Type',
      portSize: '2"',
      connectionType: 'Threaded (G/NPT)',
      workingPressure: {
        mpa: [0.3, 0.8],
        psi: [43.5, 116]
      },
      voltageOptions: ['AC110V', 'AC220V', 'DC24V'],
      diaphragmMaterial: 'NBR',
      temperatureRange: {
        min: -10,
        max: 70,
        unit: '°C'
      },
      diaphragmLifeCycles: '1 million+',
      certifications: ['CE', 'ISO9001'],
      description: 'High flow right angle type solenoid valve with 2" port size.',
      features: [
        'High flow capacity',
        'Heavy-duty construction',
        'Quick response',
        'Reliable performance',
        'Industrial grade'
      ],
      applications: [
        'Large industrial dust collectors',
        'High capacity pneumatic systems',
        'Industrial filtration',
        'Bulk material handling'
      ]
    },
    stockStatus: 'In Stock',
    category: 'Solenoid Valves',
    subcategory: 'ASCO Type'
  },
  {
    _id: 'scg353-a051',
    name: 'SCG353A051',
    price: 17500,
    images: getValveImage('2-1/2"'),
    slug: 'scg353a051-right-angle-valve',
    description: 'SCG353 series right angle type solenoid valve, 2-1/2" port size for large industrial applications.',
    specifications: {
      model: 'SCG353A051',
      series: 'SCG353',
      type: 'Right Angle Type',
      portSize: '2-1/2"',
      connectionType: 'Threaded (G/NPT)',
      workingPressure: {
        mpa: [0.3, 0.8],
        psi: [43.5, 116]
      },
      voltageOptions: ['AC110V', 'AC220V', 'DC24V'],
      diaphragmMaterial: 'NBR',
      temperatureRange: {
        min: -10,
        max: 70,
        unit: '°C'
      },
      diaphragmLifeCycles: '1 million+',
      certifications: ['CE', 'ISO9001'],
      description: 'Large capacity right angle type solenoid valve with 2-1/2" port size.',
      features: [
        'Extra large flow capacity',
        'Industrial heavy-duty design',
        'High pressure rating',
        'Durable construction',
        'Easy to service'
      ],
      applications: [
        'Industrial dust collection plants',
        'Large pneumatic systems',
        'Industrial process control',
        'Heavy industry applications'
      ]
    },
    stockStatus: 'In Stock',
    category: 'Solenoid Valves',
    subcategory: 'ASCO Type'
  },
  {
    _id: 'scxe353-060',
    name: 'SCXE353.060',
    price: 18500,
    images: getValveImage('3"'),
    slug: 'scxe353-060-right-angle-valve',
    description: 'Extended version with 3" port size, suitable for extra large flow requirements.',
    specifications: {
      model: 'SCXE353.060',
      series: 'SCG353',
      type: 'Right Angle Type',
      portSize: '3"',
      connectionType: 'Threaded (G/NPT)',
      workingPressure: {
        mpa: [0.3, 0.8],
        psi: [43.5, 116]
      },
      voltageOptions: ['AC110V', 'AC220V', 'DC24V'],
      diaphragmMaterial: 'NBR',
      temperatureRange: {
        min: -10,
        max: 70,
        unit: '°C'
      },
      diaphragmLifeCycles: '1 million+',
      certifications: ['CE', 'ISO9001'],
      description: 'Extended right angle type solenoid valve with 3" port size for maximum flow capacity.',
      features: [
        'Maximum flow capacity',
        'Extended design',
        'Industrial heavy-duty',
        'High efficiency',
        'Rugged construction'
      ],
      applications: [
        'Maximum capacity dust collectors',
        'Large industrial plants',
        'High volume pneumatic systems',
        'Industrial air handling'
      ]
    },
    stockStatus: 'In Stock',
    category: 'Solenoid Valves',
    subcategory: 'ASCO Type'
  }
];

// SCR353 Series (Submerged Type)
export const scr353Series: ValveProduct[] = [
  {
    _id: 'scr353-a230',
    name: 'SCR353A230',
    price: 19500,
    images: getValveImage('3"'),
    slug: 'scr353a230-submerged-valve',
    description: 'SCR353 series submerged type solenoid valve, 3" immersion-type designed for direct manifold box mounting.',
    specifications: {
      model: 'SCR353A230',
      series: 'SCR353',
      type: 'Submerged Type',
      portSize: '3"',
      connectionType: 'Submerged',
      workingPressure: {
        mpa: [0.3, 0.8],
        psi: [43.5, 116]
      },
      voltageOptions: ['AC110V', 'AC220V', 'DC24V'],
      diaphragmMaterial: 'VITON',
      temperatureRange: {
        min: -5,
        max: 50,
        unit: '°C'
      },
      diaphragmLifeCycles: '1 million+',
      certifications: ['CE', 'ISO9001'],
      description: 'Submerged type solenoid valve designed for direct mounting on manifold boxes. 3" immersion-type.',
      features: [
        'Submerged design',
        'Direct manifold mounting',
        'Compact installation',
        'High temperature resistance',
        'Corrosion protection'
      ],
      applications: [
        'Dust collector manifold boxes',
        'Submerged valve applications',
        'Compact industrial systems',
        'Space-constrained installations'
      ]
    },
    stockStatus: 'In Stock',
    category: 'Solenoid Valves',
    subcategory: 'ASCO Type'
  },
  {
    _id: 'scr353-a235',
    name: 'SCR353A235',
    price: 21500,
    images: getValveImage('3.5"'),
    slug: 'scr353a235-submerged-valve',
    description: 'SCR353 series submerged type solenoid valve, 3.5" immersion-type for larger manifold applications.',
    specifications: {
      model: 'SCR353A235',
      series: 'SCR353',
      type: 'Submerged Type',
      portSize: '3.5"',
      connectionType: 'Submerged',
      workingPressure: {
        mpa: [0.3, 0.8],
        psi: [43.5, 116]
      },
      voltageOptions: ['AC110V', 'AC220V', 'DC24V'],
      diaphragmMaterial: 'VITON',
      temperatureRange: {
        min: -5,
        max: 50,
        unit: '°C'
      },
      diaphragmLifeCycles: '1 million+',
      certifications: ['CE', 'ISO9001'],
      description: 'Large submerged type solenoid valve with 3.5" port size for extended manifold applications.',
      features: [
        'Extended submerged design',
        'Large port size',
        'High flow capacity',
        'Industrial grade materials',
        'Easy maintenance access'
      ],
      applications: [
        'Large manifold box installations',
        'Industrial dust collection',
        'High capacity submerged applications',
        'Industrial automation systems'
      ]
    },
    stockStatus: 'In Stock',
    category: 'Solenoid Valves',
    subcategory: 'ASCO Type'
  }
];

// GOYEN Type Valves
export const goyenSeries: ValveProduct[] = [
  {
    _id: 'goyen-1',
    name: 'TMF-Z-20',
    price: 20933,
    images: getValveImage('20mm'),
    slug: 'tmf-z-20-goyen-valve',
    description: 'High-quality TMF-Z-20 for industrial applications. This Solenoid Valves product is built to meet international standards and ensure reliable performance in demanding environments.',
    specifications: {
      model: 'TMF-Z-20',
      series: 'GOYEN',
      type: 'Solenoid Valve',
      portSize: 'To be specified',
      connectionType: 'Threaded (G/NPT)',
      workingPressure: {
        mpa: [0.3, 0.8],
        psi: [43.5, 116]
      },
      voltageOptions: ['AC110V', 'AC220V', 'DC24V'],
      diaphragmMaterial: 'NBR',
      temperatureRange: {
        min: -10,
        max: 70,
        unit: '°C'
      },
      diaphragmLifeCycles: '1 million+',
      certifications: ['ISO 9001', 'CE'],
      description: 'High-quality TMF-Z-20 solenoid valve for industrial applications. Built to meet international standards and ensure reliable performance in demanding environments.',
      features: [
        'Built with industrial-grade materials',
        'AC110V - AC220V - DC24V',
        
        'Corrosion resistant',
        'High pressure tolerance',
        'Easy installation and maintenance',
        'ISO 9001 certified'
      ],
      applications: [
        'Industrial automation',
        'Pneumatic control systems',
        'Manufacturing equipment',
        'Process control applications'
      ]
    },
    stockStatus: 'In Stock',
    category: 'Solenoid Valves',
    subcategory: 'GOYEN Type'
  }
];

// MECAIR Diaphragm Valves - Dust-300 Series
export const mecairDust300Series: ValveProduct[] = [
  {
    _id: 'mecair-dust-300-3-4',
    name: 'Mecair Dust-300 3/4"',
    price: 15000,
    images: ['/images/products/valve-placeholder-mecair-1.svg'],
    slug: 'mecair-dust-300-3-4-diaphragm-valve',
    description: 'Mecair Series 300 diaphragm valve, 3/4" port size, designed for dust collector applications with reverse pulse jet filter cleaning.',
    specifications: {
      model: 'Dust-300-3/4',
      series: 'SCG353',
      type: 'Solenoid Valve',
      portSize: '3/4"',
      connectionType: 'Threaded (G/NPT)',
      workingPressure: {
        mpa: [0.3, 0.8],
        psi: [43.5, 116]
      },
      voltageOptions: ['AC110V', 'AC220V', 'DC24V'],
      diaphragmMaterial: 'NBR',
      temperatureRange: {
        min: -5,
        max: 80,
        unit: '°C'
      },
      diaphragmLifeCycles: '1 million+',
      certifications: ['CE', 'ISO9001'],
      description: 'Mecair Series 300 diaphragm valve for dust collector reverse pulse jet filter cleaning. Inlet port at 90 degree to outlet port. Quick connection to untreaded pipes.',
      features: [
        'Series 300 diaphragm design',
        'Quick connection capability',
        'Inlet at 90 degree to outlet',
        'Direct pipe fitting',
        'Suitable for filter bag cleaning',
        'Reverse pulse jet compatible'
      ],
      applications: [
        'Dust collector systems',
        'Reverse pulse filter cleaning',
        'Filter bag applications',
        'Cartridge filters',
        'Envelope filters',
        'Ceramic filters',
        'Sintered metal fibre filters'
      ]
    },
    stockStatus: 'In Stock',
    category: 'Diaphragm Valves',
    subcategory: 'MECAIR Type'
  },
  {
    _id: 'mecair-dust-300-1',
    name: 'Mecair Dust-300 1"',
    price: 16500,
    images: ['/images/products/valve-placeholder-mecair-2.svg'],
    slug: 'mecair-dust-300-1-diaphragm-valve',
    description: 'Mecair Series 300 diaphragm valve, 1" port size for medium capacity dust collection systems.',
    specifications: {
      model: 'Dust-300-1"',
      series: 'SCG353',
      type: 'Solenoid Valve',
      portSize: '1"',
      connectionType: 'Threaded (G/NPT)',
      workingPressure: {
        mpa: [0.3, 0.8],
        psi: [43.5, 116]
      },
      voltageOptions: ['AC110V', 'AC220V', 'DC24V'],
      diaphragmMaterial: 'NBR',
      temperatureRange: {
        min: -5,
        max: 80,
        unit: '°C'
      },
      diaphragmLifeCycles: '1 million+',
      certifications: ['CE', 'ISO9001'],
      description: 'Medium capacity Mecair Series 300 diaphragm valve with 1" port size.',
      features: [
        'Medium flow capacity',
        'Reliable diaphragm design',
        'Industrial grade construction',
        'Long service life',
        'Easy maintenance'
      ],
      applications: [
        'Medium dust collectors',
        'Industrial filter applications',
        'Pneumatic pulse systems'
      ]
    },
    stockStatus: 'In Stock',
    category: 'Diaphragm Valves',
    subcategory: 'MECAIR Type'
  },
  {
    _id: 'mecair-dust-300-1-5',
    name: 'Mecair Dust-300 1.5"',
    price: 18000,
    images: ['/images/products/valve-placeholder-mecair-3.svg'],
    slug: 'mecair-dust-300-1-5-diaphragm-valve',
    description: 'Mecair Series 300 diaphragm valve, 1.5" port size for large capacity dust collection applications.',
    specifications: {
      model: 'Dust-300-1.5"',
      series: 'SCG353',
      type: 'Solenoid Valve',
      portSize: '1.5"',
      connectionType: 'Threaded (G/NPT)',
      workingPressure: {
        mpa: [0.3, 0.8],
        psi: [43.5, 116]
      },
      voltageOptions: ['AC110V', 'AC220V', 'DC24V'],
      diaphragmMaterial: 'NBR',
      temperatureRange: {
        min: -5,
        max: 80,
        unit: '°C'
      },
      diaphragmLifeCycles: '1 million+',
      certifications: ['CE', 'ISO9001'],
      description: 'Large capacity Mecair Series 300 diaphragm valve with 1.5" port size for industrial dust collection.',
      features: [
        'Large flow capacity',
        'Heavy-duty construction',
        'High reliability',
        'Industrial design',
        'Compact installation'
      ],
      applications: [
        'Large dust collectors',
        'Industrial filtration plants',
        'High-capacity pulse systems'
      ]
    },
    stockStatus: 'In Stock',
    category: 'Diaphragm Valves',
    subcategory: 'MECAIR Type'
  }
];

// BEOT Solenoid Valves  
export const beotSeries: ValveProduct[] = [
  {
    _id: 'beot-1-8',
    name: 'BEOT Standard 1/8"',
    price: 8500,
    images: ['/images/products/valve-placeholder-beot-1.svg'],
    slug: 'beot-standard-1-8-solenoid-valve',
    description: 'BEOT standard solenoid valve, 1/8" port size. Direct-acting type with multiple voltage options.',
    specifications: {
      model: 'BEOT-1/8-STD',
      series: 'SCG353',
      type: 'Solenoid Valve',
      portSize: '1/8"',
      connectionType: 'Threaded (G/NPT)',
      workingPressure: {
        mpa: [0.3, 0.8],
        psi: [43.5, 116]
      },
      voltageOptions: ['AC110V', 'AC220V', 'DC24V'],
      diaphragmMaterial: 'NBR',
      temperatureRange: {
        min: -5,
        max: 80,
        unit: '°C'
      },
      diaphragmLifeCycles: '1 million+',
      certifications: ['CE'],
      description: 'BEOT standard series solenoid valve with direct-acting design. Compact 1/8" port size.',
      features: [
        'Direct-acting design',
        'Compact size',
        'Low power consumption',
        'Quick response',
        'Durable construction'
      ],
      applications: [
        'Small pneumatic systems',
        'Compact automation',
        'Control applications',
        'Testing equipment'
      ]
    },
    stockStatus: 'In Stock',
    category: 'Solenoid Valves',
    subcategory: 'ASCO Type'
  },
  {
    _id: 'beot-1-4',
    name: 'BEOT Standard 1/4"',
    price: 9500,
    images: ['/images/products/valve-placeholder-beot-2.svg'],
    slug: 'beot-standard-1-4-solenoid-valve',
    description: 'BEOT standard solenoid valve, 1/4" port size. Suitable for medium flow applications.',
    specifications: {
      model: 'BEOT-1/4-STD',
      series: 'SCG353',
      type: 'Solenoid Valve',
      portSize: '1/4"',
      connectionType: 'Threaded (G/NPT)',
      workingPressure: {
        mpa: [0.3, 0.8],
        psi: [43.5, 116]
      },
      voltageOptions: ['AC110V', 'AC220V', 'DC24V'],
      diaphragmMaterial: 'NBR',
      temperatureRange: {
        min: -5,
        max: 80,
        unit: '°C'
      },
      diaphragmLifeCycles: '1 million+',
      certifications: ['CE'],
      description: 'BEOT standard series with medium 1/4" port size.',
      features: [
        'Medium flow capacity',
        'Standard design',
        'Reliable performance',
        'Easy installation',
        'Cost-effective'
      ],
      applications: [
        'Medium automation systems',
        'Control circuits',
        'Pneumatic tools',
        'Industrial equipment'
      ]
    },
    stockStatus: 'In Stock',
    category: 'Solenoid Valves',
    subcategory: 'ASCO Type'
  }
];

// Combined Valves Database
export const allValves: ValveProduct[] = [...scg353Series, ...scr353Series, ...goyenSeries, ...mecairDust300Series, ...beotSeries];

// Helper Functions
export function getValveByModel(model: string): ValveProduct | undefined {
  return allValves.find(valve => valve.name.toLowerCase() === model.toLowerCase());
}

export function getValvesBySeries(series: 'SCG353' | 'SCR353'): ValveProduct[] {
  return allValves.filter(valve => valve.specifications.series === series);
}

export function getValvesByCategory(category: ValveProduct['category']): ValveProduct[] {
  return allValves.filter(valve => valve.category === category);
}

export function getValvesBySubcategory(subcategory: ValveProduct['subcategory']): ValveProduct[] {
  return allValves.filter(valve => valve.subcategory === subcategory);
}

// Technical Specifications Summary
export const valvesTechnicalSpecs = {
  workingMedium: 'Clear air',
  workingPressureRange: '0.3-0.8 Mpa (approx. 43.5-116 PSI)',
  standardVoltageOptions: ['AC110V', 'AC220V', 'DC24V'],
  ambientTemperatureRange: '-5 to 50°C (varies by diaphragm material)',
  diaphragmMaterials: [
    { material: 'NBR (Nitrile)', temperatureRange: '-10°C to 70°C' },
    { material: 'VITON', temperatureRange: '-5°C to 50°C (higher temp rating)' }
  ],
  diaphragmLife: 'Over 1 million cycles',
  certifications: ['CE', 'ISO9001'],
  commonApplications: [
    'Dust collection systems',
    'Industrial automation',
    'Pneumatic control systems',
    'Material handling equipment',
    'Process control industries'
  ]
};

const valvesData = {
  scg353Series,
  scr353Series,
  allValves,
  getValveByModel,
  getValvesBySeries,
  getValvesByCategory,
  getValvesBySubcategory,
  valvesTechnicalSpecs
};

export default valvesData;
