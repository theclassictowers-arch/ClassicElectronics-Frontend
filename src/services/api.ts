import axios from 'axios';
import { API_URL } from '@/lib/apiConfig';
import { withMatchedImages, withMatchedImagesInList } from '@/lib/productImageMatcher';
import type { Product } from '@/context/CartContext';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

const handleApiError = <T,>(error: unknown, fallbackData: T): T => {
  const message = error instanceof Error ? error.message : String(error);
  console.warn('API Error:', message);
  if (error && typeof error === 'object') {
    const maybeAxiosError = error as { response?: unknown; request?: unknown };
    if (!maybeAxiosError.response && maybeAxiosError.request) {
      console.warn('Network error - is the backend running?');
    }
  }
  return fallbackData;
};

export const getCategories = async () => {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      cache: 'force-cache',
      next: { revalidate: 3600 } // Optional: revalidate every hour
    });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return await res.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
};

export type GetProductsParams = Partial<{
  categorySlug: string;
  q: string;
  includeSpecs: boolean;
  status: 'active' | 'inactive';
  limit: number;
  page: number;
}>;

export const getProducts = async (params?: GetProductsParams) => {
  try {
    const response = await api.get('products', {
      params: params
        ? {
            ...params,
            includeSpecs: params.includeSpecs ? '1' : undefined,
          }
        : undefined,
    });
    const data = response.data as unknown;
    if (!Array.isArray(data)) return data;
    return withMatchedImagesInList(data as Array<Record<string, unknown>>);
  } catch (error) {
    return handleApiError(error, [] as unknown[]);
  }
};

export const getProduct = async (id: string) => {
  try {
    const response = await api.get(`products/${id}`);
    const data = response.data as unknown;
    if (!data || typeof data !== 'object' || Array.isArray(data)) return data;
    return withMatchedImages(data as Record<string, unknown>);
  } catch (error) {
    console.warn("Failed to fetch specific product", error);
    return null;
  }
};

export const getProductBySlug = async (slug: string) => {
  try {
    const response = await api.get('products/by-slug', { params: { slug } });
    const data = response.data as unknown;
    if (!data || typeof data !== 'object' || Array.isArray(data)) return data;
    return withMatchedImages(data as Record<string, unknown>);
  } catch (error) {
    console.warn("Failed to fetch product by slug", error);
    return null;
  }
};

export type SeedProductInput = Pick<Product, 'name' | 'price' | 'images' | 'slug' | 'description'> & {
  _id?: string;
};

type SeedCategory = { _id: string; slug: string; name?: string };

export type SeedProductsResult = {
  total: number;
  created: number;
  skipped: number;
  failed: number;
  failures: Array<{ slug: string; reason: string }>;
};

const DUMMY_PRODUCT_CATEGORY_CANDIDATES: Record<string, string[]> = {
  'industrial-timer-module': ['sequential-timer-controllers', 'timers-relays'],
  'pneumatic-solenoid-valve': ['solenoid-valves/asco-type', 'solenoid-valves'],
  'pressure-gauge-digital': ['sensors', 'differential-pressure-controllers'],
  'control-panel-interface': ['control-boards', 'plc-based-controllers'],
  // ASCO Diaphragm Repair Kits
  'diaphragm-asco-c113-443': ['diaphragm-valves/asco-type', 'diaphragm-valves'],
  'diaphragm-asco-c113-827': ['diaphragm-valves/asco-type', 'diaphragm-valves'],
  'diaphragm-asco-c113-685': ['diaphragm-valves/asco-type', 'diaphragm-valves'],
  // Goyen Diaphragm Repair Kits
  'diaphragm-goyen-k2003-k2007': ['diaphragm-valves/goyen-type', 'diaphragm-valves'],
  'diaphragm-goyen-k2501-k2503': ['diaphragm-valves/goyen-type', 'diaphragm-valves'],
  'diaphragm-goyen-k4502-k4503': ['diaphragm-valves/goyen-type', 'diaphragm-valves'],
  'diaphragm-goyen-k5004-k5000': ['diaphragm-valves/goyen-type', 'diaphragm-valves'],
  'diaphragm-goyen-k4000': ['diaphragm-valves/goyen-type', 'diaphragm-valves'],
  // Turbo Diaphragm Repair Kits
  'diaphragm-turbo-m25': ['diaphragm-valves/turbo-type', 'diaphragm-valves'],
  'diaphragm-turbo-m40-m25': ['diaphragm-valves/turbo-type', 'diaphragm-valves'],
  'diaphragm-turbo-m50-m25': ['diaphragm-valves/turbo-type', 'diaphragm-valves'],
  'diaphragm-turbo-m75-m25': ['diaphragm-valves/turbo-type', 'diaphragm-valves'],
  // Mecair Diaphragm Repair Kits
  'diaphragm-mecair-db16': ['diaphragm-valves/mecair-type', 'diaphragm-valves'],
  'diaphragm-mecair-db18': ['diaphragm-valves/mecair-type', 'diaphragm-valves'],
  'diaphragm-mecair-db112': ['diaphragm-valves/mecair-type', 'diaphragm-valves'],
  'diaphragm-mecair-db11-db16': ['diaphragm-valves/mecair-type', 'diaphragm-valves'],
  'diaphragm-mecair-db116-db16': ['diaphragm-valves/mecair-type', 'diaphragm-valves'],
  'diaphragm-mecair-db120-db16': ['diaphragm-valves/mecair-type', 'diaphragm-valves'],
};

const normalizeSlug = (value: string): string =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: unknown } | undefined;
    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message.trim();
    }
  }
  return error instanceof Error ? error.message : String(error);
};

const findCategoryIdForDummyProduct = (
  product: SeedProductInput,
  categories: SeedCategory[],
): string | null => {
  const categoryBySlug = new Map(categories.map((category) => [String(category.slug).toLowerCase(), category._id]));

  const normalizedProductSlug = normalizeSlug(product.slug || product.name);
  const candidateSlugs = DUMMY_PRODUCT_CATEGORY_CANDIDATES[normalizedProductSlug] ?? [];

  for (const candidateSlug of candidateSlugs) {
    const categoryId = categoryBySlug.get(candidateSlug.toLowerCase());
    if (categoryId) return categoryId;
  }

  return categories[0]?._id ?? null;
};

const productExistsBySlug = async (slug: string): Promise<boolean> => {
  try {
    await api.get('products/by-slug', { params: { slug } });
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return false;
    }
    throw error;
  }
};

export const seedProductsIfMissing = async (
  products: SeedProductInput[],
  adminToken: string,
): Promise<SeedProductsResult> => {
  if (!adminToken?.trim()) {
    throw new Error('Admin token is required to seed products');
  }

  const categoriesResponse = await api.get('categories');
  const categories = Array.isArray(categoriesResponse.data)
    ? (categoriesResponse.data as SeedCategory[]).filter(
        (category) => typeof category?._id === 'string' && typeof category?.slug === 'string',
      )
    : [];

  if (categories.length === 0) {
    throw new Error('No categories available to map dummy products');
  }

  const headers = { Authorization: `Bearer ${adminToken}` };
  const result: SeedProductsResult = {
    total: products.length,
    created: 0,
    skipped: 0,
    failed: 0,
    failures: [],
  };

  const seenSlugs = new Set<string>();

  for (const product of products) {
    const normalizedSlug = normalizeSlug(product.slug || product.name);

    if (!normalizedSlug) {
      result.failed += 1;
      result.failures.push({
        slug: product.slug || product.name || 'unknown',
        reason: 'Invalid slug/name',
      });
      continue;
    }

    if (seenSlugs.has(normalizedSlug)) {
      result.skipped += 1;
      continue;
    }
    seenSlugs.add(normalizedSlug);

    const exists = await productExistsBySlug(normalizedSlug);
    if (exists) {
      result.skipped += 1;
      continue;
    }

    const categoryId = findCategoryIdForDummyProduct(product, categories);
    if (!categoryId) {
      result.failed += 1;
      result.failures.push({
        slug: normalizedSlug,
        reason: 'Unable to map category',
      });
      continue;
    }

    const payload = {
      name: product.name,
      slug: normalizedSlug,
      categoryId,
      price: Number(product.price) || 0,
      description: product.description || product.name,
      stock: 10,
      images: Array.isArray(product.images) ? product.images : [],
      status: 'active' as const,
    };

    try {
      const createResponse = await api.post('/products', payload, { headers });
      const createdId = (createResponse.data as { _id?: unknown })?._id;
      const createdSlug = normalizeSlug(String((createResponse.data as { slug?: unknown })?.slug || ''));

      // If backend auto-mutates slug (e.g. adds "-2"), it means base slug already existed.
      // Remove it to keep seed operation idempotent.
      if (createdSlug && createdSlug !== normalizedSlug && typeof createdId === 'string') {
        await api.delete(`/products/${createdId}`, { headers });
        result.skipped += 1;
        continue;
      }

      result.created += 1;
    } catch (error) {
      result.failed += 1;
      result.failures.push({
        slug: normalizedSlug,
        reason: extractErrorMessage(error),
      });
    }
  }

  return result;
};

// ---------------------------------------------------------------------------
// Category seeding
// ---------------------------------------------------------------------------

export type SeedCategoryInput = {
  name: string;
  slug: string;
  parentSlug?: string;
};

export type SeedCategoriesResult = {
  total: number;
  created: number;
  skipped: number;
  failed: number;
  failures: Array<{ slug: string; reason: string }>;
};

const DIAPHRAGM_CATEGORIES: SeedCategoryInput[] = [
  { name: 'Diaphragm Valves', slug: 'diaphragm-valves' },
  { name: 'ASCO Type (Diaphragm)', slug: 'diaphragm-valves/asco-type', parentSlug: 'diaphragm-valves' },
  { name: 'GOYEN Type (Diaphragm)', slug: 'diaphragm-valves/goyen-type', parentSlug: 'diaphragm-valves' },
  { name: 'TURBO Type (Diaphragm)', slug: 'diaphragm-valves/turbo-type', parentSlug: 'diaphragm-valves' },
  { name: 'MECAIR Type (Diaphragm)', slug: 'diaphragm-valves/mecair-type', parentSlug: 'diaphragm-valves' },
];

export const seedCategoriesIfMissing = async (
  adminToken: string,
): Promise<SeedCategoriesResult> => {
  if (!adminToken?.trim()) {
    throw new Error('Admin token is required to seed categories');
  }

  const headers = { Authorization: `Bearer ${adminToken}` };

  // Fetch existing categories
  const categoriesResponse = await api.get('/categories');
  const existingCategories: SeedCategory[] = Array.isArray(categoriesResponse.data)
    ? (categoriesResponse.data as SeedCategory[])
    : [];
  const existingSlugs = new Set(existingCategories.map((c) => c.slug?.toLowerCase()));

  const result: SeedCategoriesResult = {
    total: DIAPHRAGM_CATEGORIES.length,
    created: 0,
    skipped: 0,
    failed: 0,
    failures: [],
  };

  // Keep track of newly created categories so children can reference parent IDs
  const slugToId = new Map(existingCategories.map((c) => [c.slug?.toLowerCase(), c._id]));

  for (const cat of DIAPHRAGM_CATEGORIES) {
    const lowerSlug = cat.slug.toLowerCase();

    if (existingSlugs.has(lowerSlug)) {
      result.skipped += 1;
      continue;
    }

    const payload: Record<string, string> = {
      name: cat.name,
      slug: cat.slug,
      status: 'active',
    };

    // Attach parent ID if this is a subcategory
    if (cat.parentSlug) {
      const parentId = slugToId.get(cat.parentSlug.toLowerCase());
      if (parentId) {
        payload.parentId = parentId;
      }
    }

    try {
      const res = await api.post('/categories', payload, { headers });
      const created = res.data as { _id?: string };
      if (created._id) {
        slugToId.set(lowerSlug, created._id);
      }
      existingSlugs.add(lowerSlug);
      result.created += 1;
    } catch (error) {
      result.failed += 1;
      result.failures.push({
        slug: cat.slug,
        reason: extractErrorMessage(error),
      });
    }
  }

  return result;
};

export type NavbarItem = { _id: string; name: string; slug: string };
export type NavbarChild = NavbarItem & { items?: NavbarItem[] };
export type NavbarCategory = NavbarItem & { children?: NavbarChild[] };

/** New dynamic format: array of root menus with nested children/items */
export type NavMenuNode = NavbarItem & {
  children?: NavMenuNode[];
  items?: NavbarItem[];
};
export type NavbarData = {
  menus: NavMenuNode[];
};

export const getNavbarData = async (): Promise<NavbarData | null> => {
  try {
    const response = await api.get('/categories/nav');
    const data = response.data as NavbarData;
    if (data && typeof data === 'object' && Array.isArray(data.menus)) {
      return data;
    }
    return null;
  } catch (error) {
    console.warn('Failed to fetch navbar data', error);
    return null;
  }
};

export const getValveProducts = async (series?: string) => {
  try {
    const params: Record<string, string> = { includeSpecs: '1' };
    if (series) params.series = series;
    const response = await api.get('/products', { params });
    const data = response.data as unknown;
    if (!Array.isArray(data)) return [];
    return withMatchedImagesInList(data as Array<Record<string, unknown>>);
  } catch (error) {
    return handleApiError(error, [] as unknown[]);
  }
};

export const getHomepageData = async () => {
  try {
    const [productsRes, categoriesRes] = await Promise.allSettled([
      api.get('/products', { params: { limit: 20, includeSpecs: '1' } }),
      api.get('/categories'),
    ]);
    const productsData =
      productsRes.status === 'fulfilled' && Array.isArray(productsRes.value.data)
        ? productsRes.value.data
        : [];
    const categoriesData =
      categoriesRes.status === 'fulfilled' && Array.isArray(categoriesRes.value.data)
        ? categoriesRes.value.data
        : [];

    const products = Array.isArray(productsData)
      ? withMatchedImagesInList(productsData as Array<Record<string, unknown>>)
      : [];

    if (productsRes.status === 'rejected' || categoriesRes.status === 'rejected') {
      console.warn('Homepage API partially unavailable, using fallback data where needed');
    }

    const categories = Array.isArray(categoriesData) ? categoriesData : [];
    return { products, categories };
  } catch (error) {
    console.warn('Failed to fetch homepage data', error);
    return { products: [], categories: [] };
  }
};

export const getTheme = async () => {
  try {
    const response = await api.get('/theme');
    return response.data;
  } catch (error) {
    console.warn("Theme API unreachable, using default", error);
    return null;
  }
};

export const registerAdmin = async (userData: Record<string, unknown>) => {
    const response = await api.post('/admin/register', userData);
    return response.data;
};

export const loginAdmin = async (credentials: Record<string, unknown>) => {
    const response = await api.post('/admin/login', credentials);
    return response.data;
};

export const getAdminProfile = async (token: string) => {
    const response = await api.get('/admin/me', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const updateAdminProfile = async (token: string, data: Record<string, unknown>) => {
    const response = await api.put('/admin/profile', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const uploadAdminProfileImage = async (token: string, file: File) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    const response = await api.post('/admin/profile/upload', formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// ---------------------------------------------------------------------------
// Slider CRUD
// ---------------------------------------------------------------------------

export type Slide = {
  _id: string;
  badge?: string;
  title: string;
  subtitle: string;
  highlight: string;
  bgImage: string;
  primaryButtonText?: string;
  link: string;
  secondaryButtonText?: string;
  secondaryLink?: string;
  order: number;
  isActive: boolean;
};

export const getSliders = async (): Promise<Slide[]> => {
  try {
    const response = await api.get('/sliders');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    return handleApiError(error, []);
  }
};

export const createSlider = async (token: string, data: Omit<Slide, '_id'>) => {
  const response = await api.post('/sliders', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateSlider = async (token: string, id: string, data: Partial<Slide>) => {
  const response = await api.put(`/sliders/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteSlider = async (token: string, id: string) => {
  const response = await api.delete(`/sliders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const DEFAULT_SLIDES: Omit<Slide, '_id'>[] = [
  {
    badge: "Premium Industrial Components",
    title: "Pneumatic Purging Valves",
    subtitle: "Engineered for long life in tough industrial conditions.",
    highlight: "Purging Valves",
    bgImage: "/images/products/valvesSliderimg.jpeg",
    primaryButtonText: "Explore Products",
    link: "/clientSide/category/purging-valves",
    secondaryButtonText: "Contact Sales",
    secondaryLink: "/clientSide/contact",
    order: 0,
    isActive: true,
  },
  {
    badge: "Premium Industrial Components",
    title: "Bag Filter Controllers",
    subtitle: "Advanced sequential timers for efficient dust collection systems.",
    highlight: "Filter Controllers",
    bgImage: "/images/products/filtersliderimg.jpeg",
    primaryButtonText: "Explore Products",
    link: "/clientSide/category/bag-filter-controllers",
    secondaryButtonText: "Contact Sales",
    secondaryLink: "/clientSide/contact",
    order: 1,
    isActive: true,
  },
  {
    badge: "Premium Industrial Components",
    title: "Diaphragm Valve Repair Kits",
    subtitle: "Reliable diaphragm and spring kits for pulse valve maintenance.",
    highlight: "Diaphragm Valves",
    bgImage: "/images/products/K4502&K4503.png",
    primaryButtonText: "Explore Products",
    link: "/clientSide/category/diaphragm-valves",
    secondaryButtonText: "Contact Sales",
    secondaryLink: "/clientSide/contact",
    order: 2,
    isActive: true,
  },
  {
    badge: "Premium Industrial Components",
    title: "Industrial Sensors",
    subtitle: "Precision sensors for accurate monitoring and control.",
    highlight: "Smart Sensors",
    bgImage: "https://images.unsplash.com/photo-1531297461136-82lw8z0e0w0g?auto=format&fit=crop&q=80",
    primaryButtonText: "Explore Products",
    link: "/clientSide/category/sensors",
    secondaryButtonText: "Contact Sales",
    secondaryLink: "/clientSide/contact",
    order: 3,
    isActive: true,
  },
];

export const seedSlidersIfMissing = async (token: string): Promise<{ created: number; skipped: number }> => {
  if (!token?.trim()) throw new Error('Admin token is required to seed sliders');

  const existing = await getSliders();
  if (existing.length > 0) {
    return { created: 0, skipped: DEFAULT_SLIDES.length };
  }

  let created = 0;
  for (const slide of DEFAULT_SLIDES) {
    try {
      await createSlider(token, slide);
      created++;
    } catch (error) {
      console.error('Failed to seed slide:', slide.title, error);
    }
  }
  return { created, skipped: DEFAULT_SLIDES.length - created };
};

export const reorderSliders = async (token: string, orderedIds: string[]) => {
  const response = await api.put('/sliders/reorder', { orderedIds }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const reorderCategories = async (token: string, orderedIds: string[]) => {
  const response = await api.put('categories/reorder', { orderedIds }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const reorderProducts = async (token: string, orderedIds: string[]) => {
  // Backend fix: Filter out any null/undefined IDs to avoid 400 errors
  const cleanIds = orderedIds.filter(id => id && typeof id === 'string');
  const response = await api.put('products/reorder', { orderedIds: cleanIds }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ---------------------------------------------------------------------------
// Page Content CRUD
// ---------------------------------------------------------------------------

export type PageContent = {
  slug: string;
  content: Record<string, unknown>;
};

export const getPageContent = async (slug: string): Promise<PageContent | null> => {
  try {
    const response = await api.get(`/pages/${slug}`);
    return response.data as PageContent;
  } catch (error) {
    console.warn(`Failed to fetch page content for ${slug}`, error);
    return null;
  }
};

export const updatePageContent = async (token: string, slug: string, content: Record<string, unknown>) => {
  const response = await api.put(`/pages/${slug}`, { content }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export default api;
