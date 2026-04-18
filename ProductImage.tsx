import Image from 'next/image';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}

export default function ProductImage({ src, alt, className, fill, width, height }: ProductImageProps) {
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
  
  // Check if image is an absolute URL (e.g. Unsplash) or a local path
  const finalSrc = src?.startsWith('http') 
    ? src 
    : src ? `${backendURL}${src}` : '/placeholder-product.png';

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