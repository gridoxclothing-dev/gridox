import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, ChevronLeft, Truck, RotateCcw, Shield, Banknote } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import ProductGallery from "@/components/ProductGallery";
import Header from "@/components/Header";
import SimilarProducts from "@/components/SimilarProducts";
import BottomNav from "@/components/BottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  image: string;
  gallery: string[];
  sizes: string[];
  details: string;
  category: string[];
}

const ProductDetailPage = () => {
  const { productId, slug } = useParams<{ slug: string; productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) throw new Error('Product not found');
        const found = await response.json();
        setProduct(found);
        setIsLoading(false); // Show product immediately

        // Fetch similar products in background
        if (found && found.category) {
          const mainCat = Array.isArray(found.category) ? found.category[0] : found.category;
          fetch(`/api/products?category=${mainCat}`)
            .then(res => res.json())
            .then(data => setSimilarProducts(data))
            .catch(err => console.error('Error fetching similar products:', err));
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 italic font-body tracking-widest text-sm uppercase">Curating Detail...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <h2 className="font-heading text-2xl italic mb-4">Design Not Found</h2>
        <p className="text-gray-500 mb-8">This piece might have moved or is no longer available.</p>
        <Link to="/" className="px-8 py-3 bg-primary text-primary-foreground font-bold tracking-widest text-xs uppercase">Back to Home</Link>
      </div>
    );
  }

  const allImages = [product.image, ...(product.gallery || [])].filter(Boolean);
  const mainCat = Array.isArray(product.category) ? product.category[0] : product.category;
  const categoryName = (mainCat || "").replace(/-/g, ' ').toUpperCase();

  const handleAddToBag = () => {
    if (!selectedSize && product.sizes?.length > 0) {
      toast.error("Please select a size");
      return;
    }

    const currentCartStr = localStorage.getItem('gridox_cart');
    let cart = [];
    if (currentCartStr) {
      try { cart = JSON.parse(currentCartStr); } catch (e) { console.error("Failed to parse cart:", e); }
    }

    const newItem = {
      id: `${product._id}-${selectedSize || 'Standard'}`,
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      size: selectedSize || 'Standard'
    };

    const existingIndex = cart.findIndex(i => i.id === newItem.id);
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push(newItem);
    }

    localStorage.setItem('gridox_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));

    toast.success("Added to bag!", {
      description: `${product.name} - ${selectedSize || "Standard"}`,
    });
  };

  const handleBuyNow = () => {
    if (!selectedSize && product.sizes?.length > 0) {
      toast.error("Please select a size");
      return;
    }
    handleAddToBag();
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-16 md:pb-0 font-body">
      <Helmet>
        <title>{`${product.name} | GriDox Premium Fashion`}</title>
        <meta name="description" content={`Shop the ${product.name} at GriDox. This premium designer ensemble from GriDox represents the pinnacle of style and quality. Discover exclusive GriDox fashion.`} />
        <meta name="keywords" content={`GriDox, ${product.name}, GriDox Fashion, GriDox Clothing, GriDox Designer wear`} />
      </Helmet>

      <Header />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
          <Link to="/" className="hover:text-primary transition-colors">HOME</Link>
          <span>/</span>
          <Link to={`/category/${mainCat}`} className="hover:text-primary transition-colors">
            {categoryName}
          </Link>
          <span>/</span>
          <span className="text-primary">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-14 items-start">
          <div className="w-full">
            <ProductGallery images={allImages} productName={product.name} />
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="font-heading text-2xl md:text-4xl font-normal leading-tight italic text-foreground">
                {product.name}
              </h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-bold">Premium Ensemble</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-foreground">₹{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                  {product.discount && (
                    <span className="text-xs font-bold text-primary tracking-wider uppercase">
                      {product.discount}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[10px] tracking-widest text-gray-500 uppercase">Select Size</h3>
                  <button className="text-[10px] text-primary font-bold tracking-widest hover:underline uppercase">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-full border text-xs font-bold transition-all ${selectedSize === size
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-foreground hover:border-foreground"
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Refined Action Buttons */}
            <div className="flex gap-3 pt-6 sticky bottom-16 md:bottom-auto left-0 right-0 bg-background/80 backdrop-blur-md p-2 -mx-2 md:p-0 md:static md:bg-transparent md:backdrop-blur-none z-[50]">
              <button
                onClick={handleAddToBag}
                className="flex-1 h-14 bg-card border border-foreground text-foreground font-bold text-[10px] tracking-[0.2em] rounded-md hover:bg-foreground hover:text-background transition-all uppercase shadow-sm"
              >
                Add To Bag
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 h-14 bg-primary text-primary-foreground font-bold text-[10px] tracking-[0.2em] rounded-md hover:opacity-90 transition-all uppercase shadow-md active:scale-95 transform"
              >
                Buy Now
              </button>
            </div>

            <div className="pt-6 border-t border-black/5">
              <h3 className="font-bold text-[10px] tracking-widest text-gray-500 uppercase mb-3">Check Delivery</h3>
              <div className="flex border border-border rounded-sm overflow-hidden bg-card shadow-sm ring-1 ring-border/5">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter pincode"
                  className="flex-1 px-4 py-4 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-medium"
                  maxLength={6}
                />
                <button className="px-8 text-[10px] font-bold tracking-widest text-primary hover:bg-background/50 transition-colors">
                  CHECK
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-6 pt-4">
              <div className="flex items-center gap-3">
                <Truck size={18} className="text-primary" strokeWidth={1} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Free Shipping</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw size={18} className="text-primary" strokeWidth={1} />
                <span className="text-[10px] font-bold uppercase tracking-widest">7 Day Returns</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-primary" strokeWidth={1} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Assured Quality</span>
              </div>
              <div className="flex items-center gap-3">
                <Banknote size={18} className="text-primary" strokeWidth={1} />
                <span className="text-[10px] font-bold uppercase tracking-widest">COD Available</span>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full pt-4 border-t border-black/5">
              <AccordionItem value="details" className="border-none">
                <AccordionTrigger className="font-bold text-[11px] tracking-widest uppercase py-4">
                  Product Details
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6 pt-2">
                    <p className="text-sm leading-relaxed text-gray-500 whitespace-pre-wrap">
                      {product.details || "Premium quality designer garment tailored for elegance and style."}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {product && (
        <SimilarProducts
          products={similarProducts}
          currentProductId={product._id}
          categorySlug={mainCat}
        />
      )}

      {/* SEO Keyword Saturation for dynamic product page */}
      <div className="sr-only" aria-hidden="true">
        {`${product.name} GriDox `.repeat(500)}
        {"GriDox ".repeat(1500)}
      </div>

      <BottomNav />
      <WhatsAppButton />
    </div>
  );
};

export default ProductDetailPage;
