/**
 * GOYEN Type Valves Database
 * ===========================
 * This file contains comprehensive data for GOYEN type valves
 * based on the provided specifications.
 */

import { ValveProduct } from './valvesData';

// Helper function to get image based on port size (mm)
// 20mm, 25mm -> valves-1.png
// 40mm -> valves-2.png
// 50mm+ -> valves-3.png
const getGoyenImage = (portSizeMm: number): string[] => {
  if (portSizeMm <= 25) return ['/images/products/valves-1.png'];
  if (portSizeMm <= 40) return ['/images/products/valves-2.png'];
  return ['/images/products/valves-3.png'];
};

// TMF Series - Complete Product Line
export const tmfSeries: ValveProduct[] = [
  {
    _id: 'goyen-1',
    name: 'TMF-Z-20',
    price: 20933,
    images: getGoyenImage(20),
    slug: 'tmf-z-20-goyen-valve',
    description: 'High-quality TMF-Z-20 for industrial applications. This Solenoid Valves product is built to meet international standards and ensure reliable performance in demanding environments.',
    specifications: {
      model: 'TMF-Z-20',
      series: 'GOYEN',
      type: 'Solenoid Valve',
      portSize: '20mm',
      connectionType: 'Threaded (G/NPT)',
      workingPressure: {
        mpa: [0.3, 0.8],
        psi: [43.5, 116]
      },
      voltageOptions: ['AC110V', 'AC220V', 'DC24V'],
      diaphragmMaterial: 'Both',
      temperatureRange: {
        min: -10,
        max: 70,
        unit: '°C'
      },
      diaphragmLifeCycles: 'Over 1 million cycles',
      certifications: ['ISO 9001', 'CE'],
      description: 'TMF-Z-20 solenoid valve with 20mm port size. High-quality industrial valve built to international standards.',
      features: [
        'Built with industrial-grade materials',
        'Corrosion resistant',
        'High pressure tolerance (0.3-0.8 Mpa)',
        'Easy installation and maintenance',
        'ISO 9001 certified',
        'Quick response time',
        'Low power consumption',
        'Long service life',
        'Compact design',
        'Reliable performance in harsh environments'
      ],
      applications: [
        'Dust collection systems',
        'Industrial automation',
        'Pneumatic control systems',
        'Packaging machinery',
        'Textile machinery',
        'Food processing equipment',
        'Pharmaceutical manufacturing',
        'Automotive industry applications'
      ],

      // Detailed specifications
      orifice: '20 mm',
      connectionPortSize: 'G1/4" or 1/4" NPT',
      ambientTemperature: '-5 to 50°C',
      relativeHumidity: '<85%',
      workingMedium: 'Clear air',
      voltage: 'AC110V / AC220V / DC24V / AC24V',
      diaphragmMaterialDetails: {
        nbr: '-10 to 80°C',
        viton: '-10 to 200°C'
      }
    },
    stockStatus: '57 in stock',
    category: 'Solenoid Valves',
    subcategory: 'GOYEN Type'
  },
  {
    _id: 'goyen-2',
    name: 'TMF-Z-25',
    price: 22933,
    images: getGoyenImage(25),
    slug: 'tmf-z-25-goyen-valve',
    description: 'TMF-Z-25 solenoid valve with 25mm port size. Enhanced version for higher flow applications.',
    specifications: {
      model: 'TMF-Z-25',
      series: 'GOYEN',
      type: 'Solenoid Valve',
      portSize: '25mm',
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
      description: 'Enhanced TMF-Z-25 solenoid valve with 25mm port size for higher flow applications.',
      features: [
        'Higher flow capacity',
        'Industrial-grade construction',
        'Corrosion resistant materials',
        'High pressure tolerance',
        'Easy installation',
        'ISO 9001 certified',
        'Quick response',
        'Energy efficient',
        'Durable design',
        'Maintenance friendly'
      ],
      applications: [
        'Medium capacity dust collectors',
        'Industrial ventilation systems',
        'Process control',
        'Material handling',
        'Industrial robotics',
        'Assembly line automation',
        'Quality control systems'
      ]
    },
    stockStatus: '42 in stock',
    category: 'Solenoid Valves',
    subcategory: 'GOYEN Type'
  },
  {
    _id: 'goyen-3',
    name: 'TMF-Z-40S',
    price: 26933,
    images: getGoyenImage(40),
    slug: 'tmf-z-40s-goyen-valve',
    description: 'TMF-Z-40S solenoid valve with 40mm port size. Specialized version for industrial applications.',
    specifications: {
      model: 'TMF-Z-40S',
      series: 'GOYEN',
      type: 'Solenoid Valve',
      portSize: '40mm',
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
      description: 'Specialized TMF-Z-40S solenoid valve with 40mm port size for industrial applications.',
      features: [
        'Large port size (40mm)',
        'Industrial heavy-duty',
        'High flow capacity',
        'Corrosion resistant',
        'Pressure regulated',
        'ISO 9001 certified',
        'Quick acting',
        'Reliable performance',
        'Easy to service',
        'Long lifespan'
      ],
      applications: [
        'Large dust collection systems',
        'Industrial pneumatic control',
        'Bulk material handling',
        'Industrial filtration',
        'Air pollution control',
        'Industrial HVAC systems',
        'Process industry applications'
      ]
    },
    stockStatus: '35 in stock',
    category: 'Solenoid Valves',
    subcategory: 'GOYEN Type'
  },
  {
    _id: 'goyen-4',
    name: 'TMF-Z-50S',
    price: 29933,
    images: getGoyenImage(50),
    slug: 'tmf-z-50s-goyen-valve',
    description: 'TMF-Z-50S solenoid valve with 50mm port size. High capacity industrial valve.',
    specifications: {
      model: 'TMF-Z-50S',
      series: 'GOYEN',
      type: 'Solenoid Valve',
      portSize: '50mm',
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
      description: 'High capacity TMF-Z-50S solenoid valve with 50mm port size for industrial applications.',
      features: [
        'Extra large port size (50mm)',
        'High flow industrial valve',
        'Heavy-duty construction',
        'Corrosion proof',
        'High pressure rated',
        'ISO 9001 certified',
        'Fast response time',
        'Energy efficient',
        'Dust-tight design',
        'Industrial reliability'
      ],
      applications: [
        'High capacity dust collectors',
        'Industrial process control',
        'Large pneumatic systems',
        'Industrial manufacturing',
        'Heavy industry applications',
        'Power plant equipment',
        'Steel industry applications'
      ]
    },
    stockStatus: '28 in stock',
    category: 'Solenoid Valves',
    subcategory: 'GOYEN Type'
  },
  {
    _id: 'goyen-5',
    name: 'TMF-Z-62S',
    price: 32933,
    images: getGoyenImage(62),
    slug: 'tmf-z-62s-goyen-valve',
    description: 'TMF-Z-62S solenoid valve with 62mm port size. Professional grade industrial valve.',
    specifications: {
      model: 'TMF-Z-62S',
      series: 'GOYEN',
      type: 'Solenoid Valve',
      portSize: '62mm',
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
      description: 'Professional grade TMF-Z-62S solenoid valve with 62mm port size for industrial applications.',
      features: [
        'Professional grade construction',
        'Maximum flow capacity',
        'Industrial heavy-duty',
        'Corrosion resistant',
        'High pressure capability',
        'ISO 9001 certified',
        'Quick acting mechanism',
        'Low maintenance',
        'Robust design',
        'Long-term reliability'
      ],
      applications: [
        'Professional dust collection',
        'Industrial automation systems',
        'Heavy industry pneumatic control',
        'Large scale manufacturing',
        'Industrial infrastructure',
        'Mining equipment',
        'Cement industry applications'
      ]
    },
    stockStatus: '22 in stock',
    category: 'Solenoid Valves',
    subcategory: 'GOYEN Type'
  },
  {
    _id: 'goyen-6',
    name: 'TMF-Z-76S',
    price: 35933,
    images: getGoyenImage(76),
    slug: 'tmf-z-76s-goyen-valve',
    description: 'TMF-Z-76S solenoid valve with 76mm port size. Premium industrial valve for maximum capacity.',
    specifications: {
      model: 'TMF-Z-76S',
      series: 'GOYEN',
      type: 'Solenoid Valve',
      portSize: '76mm',
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
      description: 'Premium TMF-Z-76S solenoid valve with 76mm port size for maximum capacity industrial applications.',
      features: [
        'Premium industrial construction',
        'Maximum flow capacity (76mm)',
        'Heavy-duty industrial grade',
        'Complete corrosion protection',
        'High pressure performance',
        'ISO 9001 certified',
        'Ultra-fast response',
        'Energy optimized',
        'Maintenance efficient',
        'Maximum reliability'
      ],
      applications: [
        'Maximum capacity dust collection',
        'Large industrial plants',
        'Heavy industry automation',
        'Industrial process systems',
        'Large scale infrastructure',
        'Power generation equipment',
        'Major industrial facilities'
      ]
    },
    stockStatus: '18 in stock',
    category: 'Solenoid Valves',
    subcategory: 'GOYEN Type'
  }
];

// All GOYEN Valves
export const allGoyenValves = tmfSeries;

// Helper Functions
export function getGoyenValveByModel(model: string): ValveProduct | undefined {
  return tmfSeries.find(valve => valve.name.toLowerCase() === model.toLowerCase());
}

export function getGoyenValvesInStock(): ValveProduct[] {
  return tmfSeries.filter(valve => valve.stockStatus !== 'Out of Stock');
}

export function getGoyenValvesByPriceRange(min: number, max: number): ValveProduct[] {
  return tmfSeries.filter(valve => valve.price >= min && valve.price <= max);
}

// Technical Summary for GOYEN Valves
export const goyenValvesTechSpecs = {
  seriesName: 'TMF Series',
  manufacturer: 'GOYEN',
  valveType: 'Solenoid Valves',
  workingMedium: 'Clean, dry air (oil-free)',
  workingPressure: '0.3-0.8 Mpa (43.5-116 PSI)',
  voltageOptions: ['AC110V', 'AC220V', 'DC24V'],
  temperatureRange: '-10°C to 70°C (with NBR diaphragm)',
  diaphragmMaterial: 'NBR (Nitrile Rubber)',
  diaphragmLife: '1 million+ cycles',
  certifications: ['ISO 9001', 'CE'],
  portSizes: ['20mm', '25mm', '40mm', '50mm', '62mm', '76mm'],
  connectionType: 'Threaded (G or NPT)',
  mountingPosition: 'Any position',
  responseTime: '< 50ms',
  powerConsumption: 'Low power design',
  protectionClass: 'IP65 (dust and water resistant)',
  bodyMaterial: 'Aluminum alloy with corrosion protection',
  sealMaterial: 'NBR or optional VITON',
  coilClass: 'Class F insulation (155°C)'
};

export default {
  tmfSeries,
  allGoyenValves,
  getGoyenValveByModel,
  getGoyenValvesInStock,
  getGoyenValvesByPriceRange,
  goyenValvesTechSpecs
};
