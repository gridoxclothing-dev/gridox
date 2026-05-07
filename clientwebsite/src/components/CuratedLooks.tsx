import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import './CuratedLooks.css';

interface Look {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string[];
}

const CuratedLooks: React.FC = () => {
  const [looks, setLooks] = useState<Look[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLooks = async () => {
      try {
        const response = await fetch(`/api/products?isCuratedLook=true&limit=8`);
        if (response.ok) {
          const data = await response.json();
          setLooks(data);
        }
      } catch (error) {
        console.error('Error fetching curated looks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLooks();
  }, []);

  if (loading) return (
    <div className="curated-looks-skeleton py-20 bg-gray-50 flex flex-col items-center gap-10">
      <div className="skeleton h-12 w-64"></div>
      <div className="flex gap-6 overflow-hidden w-full justify-center">
        <div className="skeleton aspect-[2/3] w-64 rounded-2xl opacity-50"></div>
        <div className="skeleton aspect-[2/3] w-80 rounded-2xl"></div>
        <div className="skeleton aspect-[2/3] w-64 rounded-2xl opacity-50"></div>
      </div>
    </div>
  );

  if (!loading && looks.length === 0) return null;

  return (
    <section id="curated-looks" className="curated-looks-section">
      <div className="container mx-auto px-4 text-center mb-10">
        <h2 className="curated-title">Curated Trending Looks</h2>
        <div className="title-underline"></div>
      </div>

      {/* MOBILE / TABLET VIEWS (Preserved exactly as original) */}
      <div className="curated-slider-container lg:hidden">
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={1.4}
          breakpoints={{
            640: { slidesPerView: 3 }
          }}
          initialSlide={3}
          loop={true}
          watchSlidesProgress={true}
          speed={800}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          coverflowEffect={{
            rotate: 0,
            stretch: -10,
            depth: 350,
            modifier: 1,
            slideShadows: false,
          }}
          navigation={{
            nextEl: '.curated-next',
            prevEl: '.curated-prev',
          }}
          modules={[EffectCoverflow, Navigation, Pagination, Autoplay]}
          className="curated-swiper"
        >
          {looks.map((look) => (
            <SwiperSlide key={look._id} className="curated-slide">
              <div className="look-card" onClick={() => {
                const mainCat = Array.isArray(look.category) ? look.category[0] : look.category;
                navigate(`/category/${mainCat}/product/${look._id}`);
              }}>
                <img src={look.image} alt={`GriDox Premium Ethnic Wear - ${look.name}`} title={`GriDox Fashion | ${look.name}`} className="look-image" />
                <button className="look-shop-btn" onClick={(e) => {
                  e.stopPropagation();
                  const mainCat = Array.isArray(look.category) ? look.category[0] : look.category;
                  navigate(`/category/${mainCat}/product/${look._id}`);
                }}>
                  <ShoppingBag size={14} />
                  <span>Shop Now</span>
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button className="curated-nav-btn curated-prev">
          <ChevronLeft size={28} />
        </button>
        <button className="curated-nav-btn curated-next">
          <ChevronRight size={28} />
        </button>
      </div>

      {/* COMPLETELY NEW DESKTOP VIEW (1024px+) */}
      <div className="desktop-curated-container hidden lg:block relative max-w-[1500px] mx-auto px-20">
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          loop={true}
          speed={800}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 0,
            modifier: 1,
            scale: 0.8, // Perfectly scales without overlapping
            slideShadows: false,
          }}
          navigation={{
            nextEl: '.desktop-curated-next',
            prevEl: '.desktop-curated-prev',
          }}
          modules={[EffectCoverflow, Navigation]}
          className="desktop-curated-swiper py-10"
        >
          {looks.map((look) => (
            <SwiperSlide key={`desktop-${look._id}`} className="desktop-curated-slide">
              <div className="desktop-look-card group" onClick={() => {
                const mainCat = Array.isArray(look.category) ? look.category[0] : look.category;
                navigate(`/category/${mainCat}/product/${look._id}`);
              }}>
                <img src={look.image} alt={`GriDox Premium Ethnic Wear - ${look.name}`} title={`GriDox Fashion | ${look.name}`} className="desktop-look-image" />
                <button className="desktop-shop-btn" onClick={(e) => {
                  e.stopPropagation();
                  const mainCat = Array.isArray(look.category) ? look.category[0] : look.category;
                  navigate(`/category/${mainCat}/product/${look._id}`);
                }}>
                  <ShoppingBag size={14} />
                  <span>Shop Now</span>
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button className="desktop-nav-btn desktop-curated-prev absolute left-4 top-1/2 -translate-y-1/2 z-20">
          <ChevronLeft size={28} />
        </button>
        <button className="desktop-nav-btn desktop-curated-next absolute right-4 top-1/2 -translate-y-1/2 z-20">
          <ChevronRight size={28} />
        </button>
      </div>
    </section>
  );
};

export default CuratedLooks;
