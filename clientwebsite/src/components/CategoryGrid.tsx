import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './CategoryGrid.css';
import OptimizedImage from './OptimizedImage';

interface Category {
  id: string;
  name: string;
  thumbnailImage: string;
  image: string;
  slug: string;
}

const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [limit, setLimit] = useState(8);

  // Update limit based on screen size
  useEffect(() => {
    const updateLimit = () => {
      if (window.innerWidth <= 768) {
        setLimit(6); // 3 columns * 2 rows = 6 items
      } else {
        setLimit(8); // 4 columns * 2 rows = 8 items
      }
    };

    updateLimit();
    window.addEventListener('resize', updateLimit);
    return () => window.removeEventListener('resize', updateLimit);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/categories`);
        const data = await response.json();
        setCategories(data.map((c: any) => ({
          id: c._id,
          name: c.name,
          thumbnailImage: c.thumbnailImage,
          image: c.image,
          slug: c.slug
        })));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section id="categories" className="category-grid-section">
      <h2 className="section-title">Shop by Category</h2>
      <div className="title-underline mb-12"></div>
      <div className="category-grid">
        {categories.length > 0 ? (
          (isExpanded ? categories : categories.slice(0, limit)).map((cat) => (
            <Link to={`/category/${cat.slug}`} key={cat.id} className="category-card">
              <div className="category-image-wrapper">
                <OptimizedImage 
                  src={cat.thumbnailImage || cat.image} 
                  alt={cat.name} 
                  className="category-img"
                />
              </div>
              <div className="category-info">
                <h3 className="category-name">{cat.name}</h3>
              </div>
            </Link>
          ))
        ) : (
          /* High-end Skeleton Loaders */
          Array.from({ length: limit }).map((_, idx) => (
            <div key={`skeleton-${idx}`} className="category-card">
              <div className="category-image-wrapper skeleton" style={{ aspectRatio: '1 / 1' }}>
                <div className="category-overlay" style={{ background: 'transparent' }}>
                  <div className="skeleton" style={{ width: '60%', height: '20px', margin: '0 auto', opacity: 0.5 }}></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {categories.length > limit && (
        <div className="view-more-container">
          <button
            className="view-more-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'View Less' : 'View More'}
          </button>
        </div>
      )}
    </section>
  );
};

export default CategoryGrid;
