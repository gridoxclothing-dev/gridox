import React from "react";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  isProductImage?: boolean;
  isBanner?: boolean;
}

/**
 * OptimizedImage Component
 * 
 * Features:
 * 1. Automatic loading strategy (lazy for below-the-fold, eager for priority)
 * 2. High fetching priority for Hero images
 * 3. Modern decoding for faster main thread execution
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  priority = false,
  isProductImage = false,
  isBanner = false,
  onClick,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (isProductImage) {
      // Show promotional modal, without stopping propagation if they're clicking a link
      window.dispatchEvent(new CustomEvent('openPromoModal', { detail: { src } }));
    }
    if (onClick) onClick(e);
  };

  // Apply Cloudinary transformations if it's a Cloudinary URL
  let optimizedSrc = src;
  if (src && src.includes('cloudinary.com')) {
    // For Hero banners or priority images, we use q_100 and original resolution to prevent pixel dropping
    if (priority || isBanner) {
      optimizedSrc = src.replace('/upload/', '/upload/f_auto,q_100/');
    } else {
      optimizedSrc = src.replace('/upload/', '/upload/f_auto,q_80,w_800/');
    }
  }

  // Create a tiny blur placeholder URL
  const lowResSrc = src && src.includes('cloudinary.com')
    ? src.replace('/upload/', '/upload/f_auto,q_10,w_50,e_blur:1000/')
    : src;

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      onClick={handleClick}
      style={{
        backgroundImage: `url(${lowResSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      {...props}
    />
  );
};

export default OptimizedImage;
