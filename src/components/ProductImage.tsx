import Image from 'next/image';
import { resolveAssetUrl } from '@/lib/apiConfig';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}

export default function ProductImage({ src, alt, className, fill, width, height }: ProductImageProps) {
  // If image path is empty, show placeholder message
  if (!src || src === '') {
    return (
      <div className={`flex flex-col items-center justify-center bg-[#0b1120] border border-gray-800 text-gray-500 rounded-lg p-6 text-center h-full min-h-[200px] ${className}`}>
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-600">Classic Electronics</span>
        <p className="text-[10px] mt-2 opacity-60 italic">Product image coming soon</p>
      </div>
    );
  }

  const finalSrc = resolveAssetUrl(src) || '/placeholder-product.png';

  return (
    <Image
      src={finalSrc}
      alt={alt}
      className={className}
      fill={fill}
      width={!fill ? (width || 800) : undefined}
      height={!fill ? (height || 800) : undefined}
      unoptimized={true}
    />
  );
}