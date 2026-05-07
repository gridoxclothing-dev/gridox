import { useParams, Link } from "react-router-dom";
import { Heart, ChevronLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";


interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: string;
  image: string;
}

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProducts = async () => {
      try {
        const response = await fetch(`/api/products?category=${slug}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [slug]);

  const categoryName = slug?.replace(/-/g, ' ').toUpperCase();

  return (
    <div className="min-h-screen bg-background text-[#000000] pb-16 md:pb-0 font-body">
      <Helmet>
        <title>{`${categoryName} | Women's Fashion | GriDox`}</title>
        <meta name="description" content={`Discover the latest ${categoryName} collection at GriDox. Shop high-quality designer wear.`} />
      </Helmet>

      <Header />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-[10px] tracking-widest font-bold text-gray-400">
          <Link to="/" className="hover:text-black transition-colors flex items-center gap-1">
            <ChevronLeft size={12} />
            HOME
          </Link>
          <span>/</span>
          <span className="text-[#8b231a]">{categoryName}</span>
        </div>
      </div>

      {/* Title */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-normal tracking-tight text-[#000000] italic">{categoryName}</h1>
        <p className="text-gray-500 text-xs tracking-wider uppercase mt-2 font-medium">
          {isLoading ? "Fetching designs..." : `${products.length} Designs Found`}
        </p>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="animate-pulse bg-gray-100 aspect-[3/4] rounded-lg"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {products.map((product) => (
              <Link to={`/category/${slug}/product/${product._id}`} key={product._id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-black/5">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="w-full aspect-[3/4] object-cover object-top transition-transform duration-700 group-hover:scale-110"
                  />
                  {product.discount && (
                    <div className="absolute top-0 left-0 bg-[#000000] text-white text-[9px] font-bold px-3 py-1.5 tracking-widest uppercase">
                      {product.discount}
                    </div>
                  )}
                  <button className="absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-lg">
                    <Heart size={16} className="text-gray-400" />
                  </button>
                </div>
                <div className="mt-5 space-y-2 text-center md:text-left">
                  <h3 className="text-sm font-medium text-[#000000] leading-relaxed line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                    <span className="text-base font-bold text-[#000000]">₹{product.price.toLocaleString()}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 italic">No designs found in this category yet.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default CategoryPage;
