import { useState } from "react";
import { Trash2, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";

// TODO: Replace with real cart items fetched from MongoDB
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size: string;
}

const MOCK_CART: CartItem[] = [
  // TODO: fetch from MongoDB — db.collection("carts").findOne({ userId })
];

const CartPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('gridox_cart');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error("Failed to parse cart:", e); }
    }
    return [];
  });

  const remove = (id: string) => {
    const newItems = items.filter((i) => i.id !== id);
    setItems(newItems);
    localStorage.setItem('gridox_cart', JSON.stringify(newItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateQty = (id: string, qty: number) => {
    const newItems = items.map((i) => (i.id === id ? { ...i, quantity: qty } : i));
    setItems(newItems);
    localStorage.setItem('gridox_cart', JSON.stringify(newItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleCheckoutClick = async () => {
    try {
      const response = await fetch('/api/dashboard', { credentials: 'include' });
      if (response.ok) {
        navigate('/checkout');
      } else {
        navigate('/auth?redirect=checkout');
      }
    } catch (e) {
      navigate('/auth?redirect=checkout');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-16 md:pb-0">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-wide mb-6">Your Cart</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
            <ShoppingBag size={48} strokeWidth={1} />
            <p className="text-lg">Your cart is empty</p>
            <button
              onClick={() => navigate("/")}
              className="mt-2 px-6 py-2 bg-primary text-primary-foreground text-sm font-medium tracking-wider hover:opacity-80 transition-opacity"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Items */}
            <div className="flex-1 divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4">
                  <img src={item.image} alt={item.name} className="w-20 h-28 object-cover rounded-sm bg-muted" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Size: {item.size}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-border">
                        <button
                          className="px-2 py-1 text-sm hover:bg-muted transition-colors"
                          onClick={() => item.quantity > 1 && updateQty(item.id, item.quantity - 1)}
                        >−</button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <button
                          className="px-2 py-1 text-sm hover:bg-muted transition-colors"
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                        >+</button>
                      </div>
                      <span className="font-medium text-sm">₹{(item.price * item.quantity).toLocaleString()}</span>
                      <button onClick={() => remove(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="md:w-72 border border-border rounded-sm p-5 h-fit space-y-4">
              <h2 className="font-medium tracking-wide text-sm">ORDER SUMMARY</h2>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3 bg-primary text-primary-foreground text-sm font-medium tracking-wider hover:opacity-90 transition-opacity rounded-sm"
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
      <Footer />
    </div>
  );
};

export default CartPage;
