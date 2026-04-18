import type { Product } from '@/context/CartContext';

export interface ValveSpecification {
  model: string;
  series: string;
  type: string;
  portSize: string;
  connectionType: string;
  workingPressure: {
    mpa: [number, number];
    psi: [number, number];
  };
  voltageOptions: string[];
  diaphragmMaterial: string;
  temperatureRange: {
    min: number;
    max: number;
    unit: string;
  };
  diaphragmLifeCycles: string;
  certifications: string[];
  description: string;
  features: string[];
  applications: string[];
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
  stockStatus: string;
  category: string;
  subcategory: string;
}
