import Image from 'next/image';
import { SERVER_BASE } from '@/lib/apiConfig';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}

export default function ProductImage({ src, alt, className, fill, width, height }: ProductImageProps) {
  // Agar image ka path khali ho toh placeholder message show karein
  if (!src || src === '') {
    return (
      <div className={`flex flex-col items-center justify-center bg-[#0b1120] border border-gray-800 text-gray-500 rounded-lg p-6 text-center h-full min-h-[200px] ${className}`}>
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-600">Classic Electronics</span>
        <p className="text-[10px] mt-2 opacity-60 italic">Product image coming soon</p>
      </div>
    );
  }

  // Hamesha absolute (full) URL construct karein taake production mein routing issues na hon
  const finalSrc = src.startsWith('http')
    ? src
    : `${SERVER_BASE.replace(/\/$/, '')}/${src.replace(/^\//, '')}`;

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