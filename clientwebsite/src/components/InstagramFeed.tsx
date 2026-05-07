import React, { useRef } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import './InstagramFeed.css';

const InstagramFeed: React.FC = () => {
  const gridRef = useRef<HTMLDivElement>(null);

  const scrollGrid = (direction: 'left' | 'right') => {
    if (gridRef.current) {
      const scrollAmount = direction === 'right' ? 400 : -400;
      gridRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const [posts, setPosts] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch(`/api/instagram-posts`)
      .then(res => res.json())
      .then(data => {
          if (data && data.length > 0) setPosts(data);
          else setPosts(mockPosts); // Fallback
      })
      .catch(() => setPosts(mockPosts)); // Fallback on error
  }, []);

  const INSTA_URL = "https://www.instagram.com/gridox.clothing?igsh=MWhqN2ZoNHM4ODI3aQ==";

  // Static fallback data
  const mockPosts = [
    { _id: "m1", imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600" },
    { _id: "m2", imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600" },
    { _id: "m3", imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600" },
    { _id: "m4", imageUrl: "https://images.unsplash.com/photo-1539109132314-34a95bfad718?w=600" },
    { _id: "m5", imageUrl: "https://images.unsplash.com/photo-1534033641177-111042981cc1?w=600" },
    { _id: "m6", imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600" }
  ];

  return (
    <section className="insta-feed-section">
      <h2 className="insta-feed-title">STYLED FOR EVERY MOMENT</h2>
      <div className="title-underline mb-12"></div>
      
      <div className="insta-grid-wrapper">
        <div className="insta-posts-grid" ref={gridRef}>
          {posts.map((post) => (
            <div key={post.id} className="insta-card">
              {/* Header - Clickable to Instagram */}
              <a href={INSTA_URL} target="_blank" rel="noopener noreferrer" className="insta-card-link">
                <div className="insta-card-header">
                  <div className="insta-profile-info">
                    <div className="insta-avatar-wrapper">
                      <div className="insta-avatar-gradient">
                        <div className="insta-avatar-logo">GriDox</div>
                      </div>
                    </div>
                    <div className="insta-user-meta">
                      <span className="insta-username">GriDox.clothing</span>
                    </div>
                  </div>
                  <MoreHorizontal size={16} className="insta-more-icon" />
                </div>
              </a>

              {/* Content Area - Clickable */}
              <a href={INSTA_URL} target="_blank" rel="noopener noreferrer" className="insta-image-link">
                <div className="insta-image-container group">
                  <img src={post.imageUrl || post.image} alt="Instagram Post" className="insta-post-image" />
                </div>
              </a>

              {/* Icons Row */}
              <div className="insta-card-footer">
                <div className="insta-main-actions">
                  <div className="insta-left-actions">
                    <Heart size={21} fill="#ff3040" color="#ff3040" className="insta-action-icon" />
                    <MessageCircle size={21} className="insta-action-icon" />
                    <Send size={21} className="insta-action-icon" />
                  </div>
                  
                  {/* Dots indicator in the middle of icons as per reference */}
                  <div className="insta-dots-indicator">
                    <span className="dot active"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>

                  <Bookmark size={21} className="insta-action-icon" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Outer Navigation Arrows */}
        <button className="insta-grid-nav prev" onClick={() => scrollGrid('left')}>
          <ChevronLeft size={24} />
        </button>
        <button className="insta-grid-nav next" onClick={() => scrollGrid('right')}>
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
};

export default InstagramFeed;
