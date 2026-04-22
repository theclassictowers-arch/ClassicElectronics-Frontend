export type AdminCategory = {
  _id: string;
  name: string;
  slug: string;
};

export type ProductCategoryRef =
  | {
      _id?: string;
      name?: string;
    }
  | string
  | null;

export type ProductSpecifications = {
  basicInformation?: Array<{ label?: string; value?: string }>;
  operatingSpecifications?: Array<{ label?: string; value?: string }>;
  electricalSpecifications?: string[];
  certifications?: string[];
  features?: string[];
  applications?: string[];
  model?: string;
  series?: string;
  type?: string;
  portSize?: string;
  connectionType?: string;
  voltageOptions?: string[];
} | null;

export type AdminProduct = {
  _id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  images?: string[];
  status?: 'active' | 'inactive';
  categoryId?: ProductCategoryRef;
  showPrice?: boolean;
  pdfUrl?: string;
  specifications?: ProductSpecifications;
};
