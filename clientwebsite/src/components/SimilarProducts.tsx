import { Link } from "react-router-dom";


interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  image: string;
}

interface SimilarProductsProps {
  products: Product[];
  currentProductId: string;
  categorySlug: string;
}

const SimilarProducts = ({ products, currentProductId, categorySlug }: SimilarProductsProps) => {
  // Filter out the current product and take only first 6 similar ones
  const similarOnes = products
    .filter((p) => p._id !== currentProductId)
    .slice(0, 4); // Show 4 for cleaner grid

  if (similarOnes.length === 0) return null;

  return (
    <section className="py-12 border-t border-muted">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-8">
          SIMILAR PRODUCTS
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {similarOnes.map((product) => (
            <Link
              key={product._id}
              to={`/category/${categorySlug}/product/${product._id}`}
              className="group"
              onClick={() => window.scrollTo(0, 0)}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg mb-3 shadow-sm border border-black/5">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
              </div>
              <div className="space-y-1">
                <h3 className="text-[11px] font-bold tracking-widest uppercase line-clamp-1 group-hover:text-[#8b231a] transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#000000]">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SimilarProducts;
