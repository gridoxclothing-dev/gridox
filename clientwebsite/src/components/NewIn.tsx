import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OptimizedImage from "./OptimizedImage";
import { Heart, ShoppingBag } from "lucide-react";

const NewIn = () => {
  const navigate = useNavigate(); // fix: home product links
  const [activeProducts, setActiveProducts] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch from unified backend
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await fetch('/api/products?isNewArrival=true');
        if (response.ok) {

          const data = await response.json();
          if (data && data.length > 0) {
            setActiveProducts(data);
          }
        }
      } catch (error) {
        console.error("Error fetching New Arrivals:", error);
      }
    };
    fetchNewArrivals();
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollPosition = scrollRef.current.scrollLeft;
      const cardElement = scrollRef.current.children[0] as HTMLElement;
      if (!cardElement) return;
      const cardWidth = cardElement.clientWidth;
      const index = Math.round(scrollPosition / cardWidth);
      if (index >= 0 && index < activeProducts.length) {
        setActiveIndex(index);
      }
    }
  };

  const scrollTo = (index: number) => {
    if (scrollRef.current) {
      const cardElement = scrollRef.current.children[0] as HTMLElement;
      if (!cardElement) return;
      const cardWidth = cardElement.clientWidth;
      const gap = 12; // Corresponding to gap-3 (12px)
      scrollRef.current.scrollTo({
        left: index * (cardWidth + gap),
        behavior: "smooth"
      });
      setActiveIndex(index);
    }
  };

  return (
    <section id="new-arrivals" className="py-10 md:py-16 w-full max-w-5xl mx-auto">
      <div className="text-center px-4 mb-8">
        <h2 className="font-heading text-3xl md:text-4xl font-normal mb-3 text-foreground italic text-center">GriDox New Arrivals</h2>
        <div className="w-12 h-[3px] bg-primary mx-auto rounded-full mb-3"></div>
        <p className="text-sm md:text-base text-foreground max-w-md mx-auto">
          Discover the latest trends and fresh picks in our new collection.
        </p>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory gap-3 px-4 pb-4 md:grid md:grid-cols-4 md:gap-6 md:px-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {activeProducts.length > 0 ? (
            (isExpanded ? activeProducts : activeProducts.slice(0, 8)).map((product: any) => (
              <div
                key={product._id || product.id}
                className="w-[38vw] sm:w-[32vw] md:w-full snap-start shrink-0 flex flex-col group cursor-pointer"
                onClick={() => {
                  const categorySlug = (Array.isArray(product.category) ? product.category[0] : product.category) || 'new-arrivals';
                  const productId = product._id;
                  navigate(`/category/${categorySlug}/product/${productId}`);
                }}
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-background shadow-sm border border-border/50">
                  <OptimizedImage
                    src={product.image}
                    alt={`GriDox Fashion - ${product.name}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    isProductImage
                  />
                  {product.discount && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-1 rounded-sm uppercase tracking-tighter">
                      {product.discount}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="mt-4 text-center">
                  <h3 className="text-sm text-foreground font-medium line-clamp-1">{product.name}</h3>
                  <div className="mt-1.5 flex items-center justify-center gap-2">
                    <span className="text-primary font-bold text-[15px]">Rs. {product.price.toLocaleString()}</span>
                    {product.originalPrice && (
                      <span className="text-muted-foreground line-through text-[13px]">Rs. {product.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Premium Skeletons */
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={`skel-new-${idx}`} className="w-[38vw] sm:w-[32vw] md:w-full snap-start shrink-0 flex flex-col">
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden skeleton"></div>
                <div className="mt-4 text-center flex flex-col items-center gap-2">
                  <div className="skeleton-text skeleton" style={{ width: '80%' }}></div>
                  <div className="skeleton-text skeleton" style={{ width: '40%' }}></div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* View More Button */}
        {activeProducts.length > 8 && !isExpanded && (
          <div className="mt-12 hidden md:flex justify-center">
            <button
              onClick={() => setIsExpanded(true)}
              className="px-10 py-3.5 bg-primary border-none text-primary-foreground text-[10px] font-bold uppercase tracking-[0.2em] rounded-md hover:opacity-90 transition-all duration-300 shadow-lg active:scale-95"
            >
              View More GriDox Collection
            </button>
          </div>
        )}

        {/* Pagination Dots (Mobile Only) */}
        <div className="flex justify-center gap-2 mt-8 md:hidden">
          {(isExpanded ? activeProducts : activeProducts.slice(0, 8)).map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollTo(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${activeIndex === idx ? "bg-primary" : "bg-muted"
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewIn;
