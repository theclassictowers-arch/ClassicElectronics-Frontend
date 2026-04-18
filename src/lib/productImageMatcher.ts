type ProductLike = {
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  images?: unknown;
};

type ExplicitImageRule = {
  patterns: RegExp[];
  images: string[];
};

const EXPLICIT_IMAGE_RULES: ExplicitImageRule[] = [
  {
    patterns: [/\bSCG353A043\b/, /\bAMF-?Z-?20\b/],
    images: ['/images/products/AMF-Z-20_AMF-Z-25.png'],
  },
  {
    patterns: [/\bSCG353A044\b/, /\bAMF-?Z-?25\b/],
    images: ['/images/products/AMF-Z-20_AMF-Z-25.png'],
  },
  {
    patterns: [/\bSCG353A047\b/, /\bAMF-?Z-?40S\b/],
    images: ['/images/products/AMF-Z-40S_AMF-Z-50S_AMF-Z-62S.png'],
  },
  {
    patterns: [/\bSCG353A050\b/, /\bSCG353A051\b/, /\bAMF-?Z-?50S\b/, /\bAMF-?Z-?62S\b/],
    images: ['/images/products/AMF-Z-40S_AMF-Z-50S_AMF-Z-62S.png'],
  },
  {
    patterns: [/\bSCR353A230\b/, /\bSCR353A235\b/, /\bAMF-?Z-?76S\b/, /\bAMF-?Y-?76S\b/],
    images: ['/images/products/AMF-Y-76S.png'],
  },
  {
    patterns: [/\bSCXE353[.\- ]?060\b/, /\bAMF-?Z-?20J\b/, /\bAMF-?Z-?25J\b/],
    images: ['/images/products/AMF-Z-20j_AMF-Z-25j.png'],
  },
  {
    patterns: [/\bTMF-?Z-?25DD\b/, /\bTMF-?Z-?45DD\b/],
    images: ['/images/products/TMF-Z-25DD_TMF-Z-45DD.png'],
  },
  {
    patterns: [/\bTMF-?Y-?50S\b/, /\bTMF-?Y-?62S\b/, /\bTMF-?Y-?76S\b/],
    images: ['/images/products/TMF-Y50S_TMF-Y-62S_TMF-Y-76S.png'],
  },
  {
    patterns: [/\bTMF-?Y-?89S\b/],
    images: ['/images/products/TMF-Y-89S.png'],
  },
  {
    patterns: [/\bTMF-?Z-?20\b/, /\bTMF-?Z-?25\b/, /\bTMF-?Z-?40S\b/, /\bTMF-?Z-?50S\b/, /\bTMF-?Z-?62S\b/, /\bTMF-?Z-?76S\b/],
    images: ['/images/products/TMF-Z-20_TMF-Z-62S_TMF-Z-25_TMF-Z-40S_TMF-Z-50S_TMF-Z-76S.png'],
  },
  {
    patterns: [/\bC113-?443\b/],
    images: ['/images/products/C113-443.png'],
  },
  {
    patterns: [/\bC113-?685\b/],
    images: ['/images/products/C113-685.png'],
  },
  {
    patterns: [/\bC113-?827\b/],
    images: ['/images/products/C113-827.png'],
  },
  {
    patterns: [/\bDB16\b/, /\bDB18\b/],
    images: ['/images/products/DB16-DB18.png'],
  },
  {
    patterns: [/\bDB11\b/, /\bDB112\b/, /\bDB114\b/, /\bDB116\b/, /\bDB120\b/],
    images: ['/images/products/DB112-DB116+16-DB114+DB16-DB120+DB16.png'],
  },
  {
    patterns: [/\bK2003\b/, /\bK2007\b/],
    images: ['/images/products/K2003&K2007.png', '/images/products/K2003@2007spring.png'],
  },
  {
    patterns: [/\bK2051\b/, /\bK2501\b/, /\bK2502\b/, /\bK2503\b/],
    images: ['/images/products/k2051&K2503.png', '/images/products/K2501&K2502spring.png'],
  },
  {
    patterns: [/\bK4502\b/, /\bK4503\b/],
    images: ['/images/products/K4502&K4503.png'],
  },
  {
    patterns: [/\bK4000\b/],
    images: ['/images/products/K4000.png'],
  },
  {
    patterns: [/\bK5000\b/, /\bK5004\b/],
    images: ['/images/products/K5004&K5000.png'],
  },
  {
    patterns: [/\bM25\b/],
    images: ['/images/products/M25.png'],
  },
  {
    patterns: [/\bM40\b/, /\bM50\b/, /\bM75\b/],
    images: ['/images/products/M40+M25-M50+M25-M75+M25.png'],
  },
];

const GENERIC_IMAGE_PATTERNS = [
  /images\.unsplash\.com/i,
  /placehold\.co/i,
  /\/valves-\d\.png$/i,
  /\/valvessliderimg\.jpeg$/i,
  /\/filtersliderimg\.jpeg$/i,
  /\/valve-placeholder-/i,
  /\/default-product\.(jpe?g|png)$/i,
];

const toStringValue = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const toImageList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const dedupe = (items: string[]): string[] => {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const item of items) {
    const key = item.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }

  return output;
};

const normalizeText = (value: string): string => value.toUpperCase();

export const matchImagesByProductName = (name: string, slug: string = '', description: string = ''): string[] => {
  const source = normalizeText(`${name} ${slug} ${description}`.trim());
  if (!source) return [];

  const matchedImages: string[] = [];
  for (const rule of EXPLICIT_IMAGE_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(source))) {
      matchedImages.push(...rule.images);
    }
  }

  return dedupe(matchedImages);
};

const isGenericImage = (image: string): boolean => GENERIC_IMAGE_PATTERNS.some((pattern) => pattern.test(image));

const shouldReplaceExistingImages = (images: string[]): boolean => images.length === 0 || images.every(isGenericImage);

export const resolveProductImages = (product: ProductLike): string[] => {
  const existingImages = toImageList(product.images);
  const name = toStringValue(product.name);
  const slug = toStringValue(product.slug);
  const description = toStringValue(product.description);
  const matchedImages = matchImagesByProductName(name, slug, description);

  if (matchedImages.length === 0) {
    return existingImages;
  }

  if (shouldReplaceExistingImages(existingImages)) {
    return matchedImages;
  }

  return dedupe([...existingImages, ...matchedImages]);
};

export const withMatchedImages = <T extends ProductLike>(product: T): T => {
  const resolvedImages = resolveProductImages(product);
  return {
    ...product,
    images: resolvedImages,
  };
};

export const withMatchedImagesInList = <T extends ProductLike>(products: T[]): T[] => products.map((product) => withMatchedImages(product));
