import { Star, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { useRef } from "react";

const reviews = [
  {
    id: 1,
    name: "Sneha",
    image: "/reviews/review7.avif",
    text: "GriDox Verified\nReview",
    rating: 5,
    tag: "GriDox!"
  },
  {
    id: 2,
    name: "Ritika",
    image: "/reviews/revire2.avif",
    text: "GriDox Verified\nReview",
    rating: 5,
    tag: "GriDox!"
  },
  {
    id: 3,
    name: "Nisha",
    image: "/reviews/review1.avif",
    text: "GriDox Verified\nReview",
    rating: 5,
    tag: "GriDox!"
  },
  {
    id: 4,
    name: "Nisha",
    image: "/reviews/review5.avif",
    text: "GriDox Verified\nReview",
    rating: 4,
    tag: "GriDox!"
  },
  {
    id: 5,
    name: "Anjali",
    image: "/reviews/review4.avif",
    text: "GriDox Verified\nReview",
    rating: 5,
    tag: "GriDox!"
  },
  {
    id: 6,
    name: "Vidhya",
    image: "/reviews/review3.avif",
    text: "GriDox Verified\nReview",
    rating: 5,
    tag: "GriDox!"
  },
  {
    id: 7,
    name: "Megha",
    image: "/reviews/review6.avif",
    text: "Received my Peplum set within 24 hours. Perfect fit!",
    rating: 5,
    tag: "GriDox!"
  },
  {
    id: 8,
    name: "Kavya",
    image: "/reviews/revire8.avif",
    text: "The raw silk quality is amazing. Best festive wear collection.",
    rating: 5,
    tag: "GriDox!"
  }
];

const CustomerReviews = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 3 : scrollLeft + clientWidth / 3;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-8 mb-16">
          <h2 className="font-heading text-3xl md:text-4xl text-[#000000] font-normal tracking-tight">
            Loved by 4 Lakh+ Women
          </h2>

          <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="fill-black text-black" />
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-medium text-gray-900">4.89</span>
              <Star size={12} className="fill-black text-black" />
              <span className="text-gray-400">(1,719)</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#eefaf4] text-[#108548] text-[10px] font-bold uppercase tracking-wider rounded-sm">
              <CheckCircle2 size={14} className="fill-[#108548] text-white" />
              Verified
            </div>
          </div>
        </div>

        <div className="relative group max-w-6xl mx-auto">
          {/* Controls */}
          <button
            onClick={() => scroll('left')}
            className="absolute -left-12 top-[40%] z-20 text-gray-400 hover:text-black transition-colors hidden lg:block"
            aria-label="Previous"
          >
            <ChevronLeft size={48} strokeWidth={1} />
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute -right-12 top-[40%] z-20 text-gray-400 hover:text-black transition-colors hidden lg:block"
            aria-label="Next"
          >
            <ChevronRight size={48} strokeWidth={1} />
          </button>

          {/* Slider */}
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-12"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex-shrink-0 w-[190px] md:w-[220px] snap-start bg-background overflow-hidden"
              >
                <div className="aspect-[1/1.2] overflow-hidden rounded-md mb-4 shadow-sm">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="py-4 px-2 flex flex-col items-center text-center space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-500 font-medium whitespace-pre-line leading-tight">
                      {review.text}
                    </p>
                  </div>

                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={`${i < review.rating ? 'fill-[#108548] text-[#108548]' : 'text-[#108548]'}`}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>

                  <p className="text-sm font-bold text-[#000000] tracking-wide">{review.name}</p>

                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">{review.tag}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
