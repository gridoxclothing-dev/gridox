import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import OptimizedImage from "./OptimizedImage";

interface Banner {
  _id?: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  offer?: string;
  cta?: string;
  link?: string;
  mobileImageUrl?: string;
}

const HeroCarousel = () => {
  const SLIDE_DURATION = 5000; // 5 seconds
  const [slides, setSlides] = useState<Banner[]>([
    {
      imageUrl: "https://res.cloudinary.com/dts769o9h/image/upload/v1721564400/static_banner_placeholder.jpg",
      title: "Premium Fashion Collection",
      subtitle: "Discover Your Style",
      cta: "Explore Now"
    }
  ]);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch from unified backend
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`/api/banners`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setSlides(data);

            // 🔥 Dynamic Preload (Best Practice #6)
            // Preload the very first banner image as soon as we know the URL
            const preloadLink = document.createElement("link");
            preloadLink.rel = "preload";
            preloadLink.as = "image";
            // Match the Cloudinary optimization used in OptimizedImage
            const firstImg = data[0].imageUrl;
            if (firstImg.includes('cloudinary.com')) {
              preloadLink.href = firstImg.replace('/upload/', '/upload/f_auto,q_100/');
            } else {
              preloadLink.href = firstImg;
            }
            document.head.appendChild(preloadLink);
          }
        }
      } catch (error) {
        console.log("No live banners found in database");
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeSlides = slides.filter(slide => isMobile ? !!slide.mobileImageUrl : !!slide.imageUrl);

  // Reset current if it's out of bounds after resize/filter
  useEffect(() => {
    if (current >= activeSlides.length && activeSlides.length > 0) {
      setCurrent(0);
    }
  }, [isMobile, activeSlides.length]);

  const next = useCallback(() => {
    if (activeSlides.length === 0) return;
    setCurrent((c) => (c + 1) % activeSlides.length);
  }, [activeSlides.length]);

  useEffect(() => {
    setProgress(0); // Reset progress on slide change
    const interval = 50; // Update every 50ms
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          next();
          return 0;
        }
        return prev + (interval / SLIDE_DURATION) * 100;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [next, current, activeSlides.length]);

  const handleSwipeEnd = useCallback(() => {
    if (!touchStart || !touchEnd || activeSlides.length === 0) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) {
      setCurrent((c) => (c + 1) % activeSlides.length); // Swipe left
    } else if (distance < -50) {
      setCurrent((c) => (c === 0 ? activeSlides.length - 1 : c - 1)); // Swipe right
    }
    setTouchStart(0);
    setTouchEnd(0);
  }, [touchStart, touchEnd, activeSlides.length]);

  const prev = useCallback(() => {
    if (activeSlides.length === 0) return;
    setCurrent((c) => (c === 0 ? activeSlides.length - 1 : c - 1));
    setProgress(0);
  }, [activeSlides.length]);

  const handleNextClick = () => {
    next();
    setProgress(0);
  };

  // Always render the container even if fetching (to avoid layout shift)
  return (
    <div
      className={`relative w-full overflow-hidden select-none cursor-grab active:cursor-grabbing bg-[#FDFBF9] ${
        isMobile ? "aspect-[3/4]" : "md:h-auto"
      }`}
      style={{ isolation: 'isolate' }}
      onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
      onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)}
      onTouchEnd={handleSwipeEnd}
      onMouseDown={(e) => {
        setTouchStart(e.clientX);
        setIsDragging(true);
      }}
      onMouseMove={(e) => {
        if (!isDragging) return;
        setTouchEnd(e.clientX);
      }}
      onMouseUp={() => {
        if (!isDragging) return;
        handleSwipeEnd();
        setIsDragging(false);
      }}
      onMouseLeave={() => {
        if (!isDragging) return;
        handleSwipeEnd();
        setIsDragging(false);
      }}
    >
      <div
        className="flex h-full"
        style={{ 
          transform: `translateX(-${current * 100}%)`,
          transition: 'transform 1000ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {activeSlides.map((slide, i) => {
          const isActive = i === current;
          const isNext = i === (current + 1) % activeSlides.length;
          const isPrev = i === (current - 1 + activeSlides.length) % activeSlides.length;
          const shouldLoad = isActive || isNext || isPrev;

          return (
            <a
              key={slide._id || i}
              href={slide.link || "#"}
              className="relative w-full flex-shrink-0 overflow-hidden flex items-center justify-center p-0"
              onClick={(e) => { if (!slide.link) e.preventDefault(); }}
            >
              <OptimizedImage
                src={shouldLoad ? (isMobile ? slide.mobileImageUrl! : slide.imageUrl!) : ""}
                alt={`GriDox Premium Fashion - ${slide.title || "Latest Collection"}`}
                title={`GriDox Fashion | ${slide.title || "Exclusive Styles"}`}
                priority={i === 0}
                isBanner={true}
                className={`w-full ${isMobile ? "h-full object-cover" : "h-auto object-contain"} ${
                  isActive ? "animate-hero-zoom-out" : ""
                }`}
              />
            </a>
          );
        })}
      </div>

      {/* Navigation Arrows (minimalist) */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 text-black/40 hover:text-black transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft size={32} strokeWidth={1.5} />
      </button>
      <button
        onClick={handleNextClick}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 text-black/40 hover:text-black transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight size={32} strokeWidth={1.5} />
      </button>

      {/* Responsive Pagination Dots */}
      <div className={`absolute left-1/2 -translate-x-1/2 flex items-center z-10 ${
        isMobile ? "bottom-5 gap-6" : "bottom-6 gap-2"
      }`}>
        {activeSlides.map((_, i) => (
          isMobile ? (
            // Mobile Only.in style circular dots
            <button
              key={i}
              onClick={() => { setCurrent(i); setProgress(0); }}
              className="relative flex items-center justify-center w-4 h-4 bg-transparent border-none cursor-pointer"
              aria-label={`Slide ${i + 1}`}
            >
              <svg className="absolute w-full h-full rotate-[-90deg]">
                <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1" fill="none" className="opacity-20" />
                {i === current && (
                  <circle
                    cx="8" cy="8" r="6" stroke="white" strokeWidth="1" fill="none"
                    strokeDasharray="37.7"
                    strokeDashoffset={37.7 - (37.7 * progress) / 100}
                    className="transition-all duration-100 linear opacity-100"
                  />
                )}
              </svg>
              <div className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white opacity-100' : 'bg-white opacity-40'}`} />
            </button>
          ) : (
            // Desktop GitHub style bar dots
            <button
              key={i}
              onClick={() => { setCurrent(i); setProgress(0); }}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === current ? "w-8 bg-black shadow-sm" : "w-3 bg-black/20 hover:bg-black/40"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          )
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
