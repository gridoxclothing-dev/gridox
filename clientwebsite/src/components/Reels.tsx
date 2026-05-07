import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, X, Volume2, VolumeX, Heart, Share2, Play, ChevronUp, ChevronDown } from "lucide-react";
// import { reelsData, Reel } from "@/data/reelsData"; // Replaced by API
import "./Reels.css";

interface Reel {
  _id: string;
  videoUrl: string;
  productId: {
    _id: string;
    name: string;
    category: string;
  };
  category: string;
  isBase64?: boolean;
}

const Reels: React.FC = () => {
  const [reelsData, setReelsData] = useState<Reel[]>([]);
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const API_BASE = '/api';

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const response = await fetch(`${API_BASE}/reels`);
      if (response.ok) {
        const data = await response.json();
        setReelsData(data);
      }
    } catch (error) {
      console.error("Error fetching reels:", error);
    }
  };

  const handleAddToCart = (product: any) => {
    if (!product) return;
    // Dynamic navigation based on category and ID
    navigate(`/category/${product.category}/product/${product._id}`);
    closeReel();
  };

  const handleScroll = () => {
    if (sliderRef.current) {
      const scrollPosition = sliderRef.current.scrollLeft;
      const cardElement = sliderRef.current.children[0] as HTMLElement;
      if (!cardElement) return;
      const cardWidth = cardElement.clientWidth;
      const gap = 24; // Corresponding to gap-6 (24px)
      const index = Math.round(scrollPosition / (cardWidth + gap));
      if (index >= 0 && index < reelsData.length) {
        setCurrentFocusIndex(index);
      }
    }
  };

  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "right" ? 300 : -300;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const openReel = (index: number) => {
    setActiveReelIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeReel = () => {
    setActiveReelIndex(null);
    document.body.style.overflow = "auto";
  };

  const nextReel = () => {
    if (activeReelIndex !== null && activeReelIndex < reelsData.length - 1) {
      setActiveReelIndex(activeReelIndex + 1);
    }
  };

  const prevReel = () => {
    if (activeReelIndex !== null && activeReelIndex > 0) {
      setActiveReelIndex(activeReelIndex - 1);
    }
  };

  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartPos.current === null) return;
    
    const touchEndPos = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };
    
    const diffX = touchStartPos.current.x - touchEndPos.x;
    const diffY = touchStartPos.current.y - touchEndPos.y;

    // Detect if it's a primary horizontal or vertical swipe
    if (Math.abs(diffY) > Math.abs(diffX)) {
      // Vertical swipe (Up/Down)
      if (Math.abs(diffY) > 50) {
        if (diffY > 0) nextReel(); // Swipe up -> Next
        else prevReel(); // Swipe down -> Prev
      }
    } else {
      // Horizontal swipe (Left/Right)
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) nextReel(); // Swipe left -> Next
        else prevReel(); // Swipe right -> Prev
      }
    }
    
    touchStartPos.current = null;
  };

  const wheelThrottleRef = useRef(false);

  // Add mouse wheel support for vertical scrolling through reels
  useEffect(() => {
    if (activeReelIndex === null) return;

    const handleWheel = (e: WheelEvent) => {
      if (wheelThrottleRef.current) return;

      if (Math.abs(e.deltaY) > 40) {
        wheelThrottleRef.current = true;
        if (e.deltaY > 0) nextReel();
        else prevReel();
        
        setTimeout(() => {
          wheelThrottleRef.current = false;
        }, 1000); // 1s throttle for UX
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [activeReelIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeReelIndex === null) return;
      if (e.key === "Escape") closeReel();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") nextReel();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prevReel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeReelIndex]);

  return (
    <section className="reels-container">
      <h2 className="reels-title text-foreground">Feel the Reel</h2>
      <div className="title-underline mb-12"></div>
      
      <div className="reels-slider-wrapper">
        <div 
          className="reels-slider" 
          ref={sliderRef}
          onScroll={handleScroll}
        >
          {reelsData.map((reel, index) => (
            <ReelItem 
              key={reel._id} 
              reel={reel} 
              index={index}
              isActive={activeReelIndex === index}
              isFocused={currentFocusIndex === index}
              currentFocusIndex={currentFocusIndex}
              openReel={() => openReel(index)}
              handleAddToCart={() => handleAddToCart(reel.productId)}
              API_BASE={API_BASE}
            />
          ))}
        </div>
        
        <button 
          className="reels-nav-button" 
          onClick={() => scrollSlider("right")}
          aria-label="Next reels"
        >
          <ChevronRight size={24} className="text-foreground" />
        </button>
      </div>

      {/* Modal View */}
      {activeReelIndex !== null && (
        <ReelModal 
          reel={reelsData[activeReelIndex]}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          closeReel={closeReel}
          nextReel={nextReel}
          prevReel={prevReel}
          handleAddToCart={() => handleAddToCart(reelsData[activeReelIndex].productId)}
          isFirst={activeReelIndex === 0}
          isLast={activeReelIndex === reelsData.length - 1}
          handleTouchStart={handleTouchStart}
          handleTouchEnd={handleTouchEnd}
          API_BASE={API_BASE}
        />
      )}
    </section>
  );
};

// Sub-component for individual Reel Card to handle lazy loading
const ReelItem: React.FC<{
  reel: Reel;
  index: number;
  isActive: boolean;
  isFocused: boolean;
  currentFocusIndex: number;
  openReel: () => void;
  handleAddToCart: () => void;
  API_BASE: string;
}> = ({ reel, index, isActive, isFocused, currentFocusIndex, openReel, handleAddToCart, API_BASE }) => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Now that we are on Cloudinary, we can load all small counts of reels immediately
    // for a better "full" visual experience.
    loadVideo();
  }, [reel._id]);

  const loadVideo = async () => {
    if (videoSrc) return;
    
    // If the reel already has a URL (non-base64), use it immediately!
    if (reel.videoUrl) {
        setVideoSrc(reel.videoUrl);
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/reels/video/${reel._id}`);
        if (res.ok) {
            const data = await res.json();
            setVideoSrc(data.url);
        }
    } catch (e) {
        console.error("Video load failed", e);
    }
  };

  return (
    <div className="reel-card group" onClick={openReel}>
      {videoSrc ? (
        <video 
          ref={videoRef}
          className="reel-video-preview object-cover w-full h-full"
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          src={videoSrc}
        />
      ) : (
        <div className="reel-video-preview bg-muted flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Loading</span>
            </div>
        </div>
      )}
      
      <div className="reel-play-icon">
        <Play fill="white" size={48} />
      </div>
      
      <div className={`reel-overlay flex flex-col justify-end items-center reel-focuser ${isFocused ? 'active-focus' : ''}`}>
        <button 
          className="shop-now-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
        >
          Shop Now
        </button>
      </div>
    </div>
  );
};

// Sub-component for Modal to handle its own video loading
const ReelModal: React.FC<{
  reel: Reel;
  isMuted: boolean;
  setIsMuted: (m: boolean) => void;
  closeReel: () => void;
  nextReel: () => void;
  prevReel: () => void;
  handleAddToCart: () => void;
  isFirst: boolean;
  isLast: boolean;
  handleTouchStart: (e: any) => void;
  handleTouchEnd: (e: any) => void;
  API_BASE: string;
}> = ({ reel, isMuted, setIsMuted, closeReel, nextReel, prevReel, handleAddToCart, isFirst, isLast, handleTouchStart, handleTouchEnd, API_BASE }) => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  useEffect(() => {
    // If the reel already has a URL (non-base64), use it immediately!
    if (reel.videoUrl) {
        setVideoSrc(reel.videoUrl);
        return;
    }

    const loadModalVideo = async () => {
        try {
            const res = await fetch(`${API_BASE}/reels/video/${reel._id}`);
            if (res.ok) {
                const data = await res.json();
                setVideoSrc(data.url);
            }
        } catch (e) {
            console.error("Modal video load failed", e);
        }
    };
    loadModalVideo();
  }, [reel._id, reel.videoUrl]);

  return (
    <div className="reel-modal-overlay" onClick={closeReel}>
      <div 
        className="reel-modal-container" 
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {videoSrc ? (
            <video 
              className="reel-modal-video"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              src={videoSrc}
            />
        ) : (
            <div className="reel-modal-video bg-black flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        )}

        <button className="fixed top-8 left-8 text-white z-[2001] hover:scale-110 transition-transform" onClick={closeReel}>
          <X size={32} strokeWidth={2.5} />
        </button>

        <div className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-[2001]">
          <button 
            className={`p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all ${isFirst ? 'opacity-30 cursor-not-allowed' : ''}`}
            onClick={prevReel}
            disabled={isFirst}
          >
            <ChevronUp size={28} />
          </button>
          <button 
            className={`p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all ${isLast ? 'opacity-30 cursor-not-allowed' : ''}`}
            onClick={nextReel}
            disabled={isLast}
          >
            <ChevronDown size={28} />
          </button>
        </div>

        <div className="reel-modal-header flex justify-between items-start p-6 absolute top-0 left-0 right-0 z-[2000] pointer-events-none">
          <div className="pointer-events-auto">
            <h3 className="text-white font-medium text-sm tracking-wide drop-shadow-md">
              {reel.productId?.name}
            </h3>
          </div>
          <div className="flex items-center gap-4 pointer-events-auto pr-2">
            <button className="text-white hover:scale-110 transition-transform" onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
            </button>
            <button className="text-white hover:scale-110 transition-transform">
              <Share2 size={22} />
            </button>
          </div>
        </div>

        <div className="reel-modal-product-overlay flex justify-center">
          <button className="reel-shop-now-modal" onClick={handleAddToCart}>
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reels;
