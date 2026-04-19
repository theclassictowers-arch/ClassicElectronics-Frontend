import Image from 'next/image';
import { SERVER_BASE } from '@/lib/apiConfig';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}

export default function ProductImage({ src, alt, className, fill, width, height }: ProductImageProps) {
  // Full URL ensures production requests reach the backend for static files
  const finalSrc = src?.startsWith('http')
    ? src
    : src
      ? `${SERVER_BASE.replace(/\/$/, '')}/${src.replace(/^\//, '')}`
      : '/placeholder-product.png';

  return (
    <Image
      src={finalSrc}
      alt={alt}
      className={className}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      unoptimized={true} // Taake local server se image fetch hone mein issue na ho
    />
  );
}