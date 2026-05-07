import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

const ProductGallery = ({ images, productName }: ProductGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 50;

  const handleThumbnailClick = useCallback((index: number) => {
    setActiveIndex(index);
    setIsZoomed(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  }, []);

  const handleMouseEnter = useCallback(() => setIsZoomed(true), []);
  const handleMouseLeave = useCallback(() => setIsZoomed(false), []);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) >= minSwipeDistance) {
      if (distance > 0 && activeIndex < images.length - 1) {
        setActiveIndex((prev) => prev + 1);
      } else if (distance < 0 && activeIndex > 0) {
        setActiveIndex((prev) => prev - 1);
      }
    }
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "ArrowRight") handleNext();
    },
    [images.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (!thumbnailContainerRef.current) return;
    const container = thumbnailContainerRef.current;
    const activeThumb = container.children[activeIndex] as HTMLElement;
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [activeIndex]);

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full">
      {/* Desktop: Vertical thumbnails on left */}
      <div className="hidden md:flex flex-col gap-2 w-[80px] flex-shrink-0">
        <div
          ref={thumbnailContainerRef}
          className="flex flex-col gap-2 max-h-[600px] overflow-y-auto scrollbar-hide"
        >
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`relative w-[80px] aspect-[3/4] rounded-md overflow-hidden border transition-all duration-200 flex-shrink-0 ${
                activeIndex === index
                  ? "border-white shadow-lg opacity-100"
                  : "border-gray-900 opacity-40 hover:opacity-80"
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={img}
                alt={`GriDox Premium Ethnic Wear - ${productName} view ${index + 1}`}
                title={`GriDox Fashion | ${productName}`}
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
            </button>
          ))}
        </div>
        {images.length > 5 && (
          <button className="flex items-center justify-center w-8 h-8 mx-auto rounded-full bg-muted/80">
            <ChevronDown size={16} />
          </button>
        )}
      </div>

      {/* Main image */}
      <div className="relative flex-1 min-w-0">
        <div
          ref={mainImageRef}
          className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-[#111] border border-black cursor-crosshair shadow-2xl"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Sale badge */}
          <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded">
            Sale
          </div>

          {/* Main image with fade transition */}
          <div className="relative w-full h-full">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`GriDox Premium Ethnic Wear - ${productName} ${index === 0 ? "Front" : index === 1 ? "Side" : index === 2 ? "Back" : index === 3 ? "Walking" : "Detail"}`}
                title={`GriDox Fashion | ${productName} ${index === 0 ? "Front View" : index === 1 ? "Side View" : index === 2 ? "Back View" : "Detail"}`}
                className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 ${
                  activeIndex === index ? "opacity-100" : "opacity-0"
                }`}
                style={
                  activeIndex === index && isZoomed
                    ? {
                        transform: "scale(2)",
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        transition: "transform 0.1s ease-out, opacity 0.5s ease",
                      }
                    : undefined
                }
                loading={index === 0 ? "eager" : "lazy"}
                width={640}
                height={896}
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openPromoModal', { detail: { src: img } }));
                }}
              />
            ))}
          </div>

          {/* Navigation arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
            aria-label="Next image"
          >
            <ChevronRight size={18} />
          </button>

          {/* Image dots indicator (mobile) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 md:hidden">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeIndex === index
                    ? "bg-foreground w-5"
                    : "bg-foreground/40"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Mobile: Horizontal thumbnails below */}
        <div className="flex md:hidden gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1 px-1">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`relative w-[60px] aspect-[3/4] rounded-md overflow-hidden border transition-all duration-200 flex-shrink-0 ${
                activeIndex === index
                  ? "border-white shadow-lg opacity-100"
                  : "border-gray-900 opacity-40 hover:opacity-80"
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={img}
                alt={`GriDox Premium Ethnic Wear - ${productName} thumbnail ${index + 1}`}
                title={`GriDox Fashion | ${productName}`}
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductGallery;
