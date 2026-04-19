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
  // Check if image is an absolute URL (e.g. Unsplash) or a relative backend path
  const finalSrc = src?.startsWith('http')
    ? src
    : src
      ? `${SERVER_BASE}${src}`
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