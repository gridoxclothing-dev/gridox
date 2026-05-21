import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, CheckCircle, MapPin, CreditCard, ChevronRight, Check } from 'lucide-react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size: string;
  category?: string;
  productId?: string;
}

const CheckoutPage = () => {
  const navigate = useNavigate();

  // Steps: 2 = Address, 3 = Payment, 4 = Success
  const [step, setStep] = useState<number>(2);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');

  const finalTotal = Math.max(0, subtotal - discount);

  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [address, setAddress] = useState({
    name: '',
    phone: '',
    addressLine: '',
    pincode: ''
  });

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'COD' | 'ONLINE'>('ONLINE');
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);

  useEffect(() => {
    // 1. Check Auth Status
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/dashboard', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // If not logged in, they shouldn't be here. Send them to auth to complete Step 1.
          navigate('/auth?redirect=checkout');
        }
      } catch (error) {
        navigate('/auth?redirect=checkout');
      } finally {
        setAuthLoading(false);
      }
    };

    // 2. Load Cart
    const savedCart = localStorage.getItem('gridox_cart');
    if (savedCart) {
      const items = JSON.parse(savedCart);
      setCartItems(items);
      setSubtotal(items.reduce((sum: number, i: CartItem) => sum + i.price * i.quantity, 0));
    }

    checkAuth();
  }, [navigate]);

  const handleApplyPromo = () => {
    setPromoError('');
    if (!promoCode.trim()) return;

    if (promoCode.trim().toUpperCase() === 'GRIDOX10') {
      const discountAmount = Math.round(subtotal * 0.10);
      setDiscount(discountAmount);
    } else {
      setPromoError('Invalid coupon code');
      setDiscount(0);
    }
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlacingOrder(true);
    try {
      if (paymentMode === 'ONLINE') {
        console.log('[PAYMENT] Creating session...', { amount: finalTotal, customerEmail: user.email });
        const sessionResponse = await fetch('/api/payments/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalTotal,
            customerName: address.name,
            customerEmail: user.email,
            customerPhone: address.phone
          }),
          credentials: 'include'
        });

        if (!sessionResponse.ok) {
          const errData = await sessionResponse.json();
          console.error('[PAYMENT] Session creation failed:', errData);
          throw new Error(errData.message || 'Failed to create payment session');
        }

        const sessionData = await sessionResponse.json();
        console.log('[PAYMENT] Session created:', sessionData);

        // 2. Initialize Cashfree
        if (!(window as any).Cashfree) {
          console.error('[PAYMENT] Cashfree SDK not found on window object');
          throw new Error('Payment SDK failed to load. Please refresh the page.');
        }

        const cashfreeMode = sessionData.environment || "production";
        console.log('[PAYMENT] Initializing SDK. Mode detected:', cashfreeMode);

        const cashfree = (window as any).Cashfree({
          mode: cashfreeMode
        });

        const checkoutOptions = {
          paymentSessionId: sessionData.payment_session_id,
          redirectTarget: "_self", // Or "_modal" for modal-based checkout
        };

        // 3. Start Checkout
        // This will either redirect or open modal depending on SDK version and config
        // For v3 SDK, we use checkout()
        await cashfree.checkout(checkoutOptions).then(async (result: any) => {
          if (result.error) {
            console.error("Cashfree Error:", result.error);
            alert(result.error.message || "Payment failed. Please try again.");
            setIsPlacingOrder(false);
          }

          if (result.redirect) {
            // This happens when redirectTarget is _self
            console.log("Redirecting to payment...");
          }

          // If payment was success (handled by return_url or callback)
          // We'll create the actual order after successful payment verification
          // but for now, we'll create it before or use the return_url to create it.
          // Better: Create the order now with status 'PAYMENT_PENDING'
        });

        // NOTE: In a real-world scenario, we'd create the order in DB FIRST 
        // with a 'PAYMENT_PENDING' status, then update it via webhook.
        // For simplicity here, we'll create it if redirect didn't happen yet or use callback.

        // Actually, let's create the order first
        const orderData = {
          userEmail: user.email,
          items: cartItems.map(item => ({
            productId: item.productId || item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            size: item.size,
            category: item.category || ""
          })),
          address: address,
          paymentMethod: "ONLINE",
          totalAmount: finalTotal,
          status: 'Payment Pending'
        };

        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
          credentials: 'include'
        });

        if (!orderResponse.ok) {
          const errData = await orderResponse.json();
          throw new Error(errData.message || 'Failed to record order');
        }

        return; // Redirect handled by Cashfree
      }

      // COD LOGIC
      const orderData = {
        userEmail: user.email,
        items: cartItems.map(item => ({
          productId: item.productId || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          size: item.size,
          category: item.category || ""
        })),
        address: address,
        paymentMethod: "COD",
        totalAmount: finalTotal
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
        credentials: 'include'
      });

      if (response.ok) {
        setStep(4); // Success Step
        localStorage.removeItem('gridox_cart');
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        const errData = await response.json();
        alert(errData.message || "Failed to place order. Please try again.");
      }
    } catch (error: any) {
      console.error("Order error:", error);
      alert(error.message || "An error occurred. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.name || !address.phone || !address.addressLine || !address.pincode) {
      alert("Please fill all required fields.");
      return;
    }

    const pin = address.pincode.trim();
    if (!pin || pin.length !== 6 || !/^[1-9][0-9]{5}$/.test(pin)) {
      alert("Please enter a valid 6-digit Indian pincode.");
      return;
    }

    setIsCheckingPincode(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice) {
        setStep(3);
      } else {
        alert("Invalid Pincode. Please enter a valid Indian pincode.");
      }
    } catch (err) {
      console.error("Pincode check error:", err);
      // Fallback: accept format-validated pincode if API is unreachable
      setStep(3);
    } finally {
      setIsCheckingPincode(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // If no items in cart and not on success page
  if (cartItems.length === 0 && step !== 4) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <ShoppingBag size={48} className="text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-primary text-primary-foreground text-sm tracking-wider hover:opacity-90 transition-all rounded-sm">
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      {step !== 4 && (
        <div className="bg-background border-b border-border sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between text-sm">
            <button onClick={() => step === 3 ? setStep(2) : navigate('/cart')} className="flex items-center text-muted-foreground hover:text-black mb-4 md:mb-0 hidden md:flex">
              <ArrowLeft size={16} className="mr-2" /> {step === 3 ? 'Back to Address' : 'Back to Cart'}
            </button>

            {/* Stepper Header matches Nykaa style */}
            <div className="flex items-center justify-center w-full md:w-auto">
              {/* Step 1: Login */}
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-[#1e293b] text-white flex items-center justify-center text-xs">
                  <Check size={14} />
                </div>
                <span className="ml-2 font-medium text-[#1e293b] text-xs uppercase tracking-wide">Sign Up</span>
              </div>

              <div className="w-8 md:w-16 h-px bg-gray-300 mx-2 md:mx-4"></div>

              {/* Step 2: Address */}
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? (step > 2 ? 'bg-primary text-primary-foreground' : 'bg-primary text-primary-foreground') : 'bg-muted text-muted-foreground'}`}>
                  {step > 2 ? <Check size={14} /> : '2'}
                </div>
                <span className={`ml-2 text-xs uppercase tracking-wide ${step >= 2 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>Address</span>
              </div>

              <div className="w-8 md:w-16 h-px bg-gray-300 mx-2 md:mx-4"></div>

              {/* Step 3: Payment */}
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 3 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
                  3
                </div>
                <span className={`ml-2 text-xs uppercase tracking-wide ${step === 3 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>Payment</span>
              </div>
            </div>

            <div className="w-24 hidden md:block"></div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {step === 4 ? (
          // SUCCESS PAGE
          <div className="bg-background p-8 md:p-12 text-center border border-border mt-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h1 className="text-3xl font-serif mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Thank you for shopping with GriDox. Your order has been placed successfully and will be delivered soon.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigate('/my-orders')}
                className="px-8 py-3 bg-primary text-primary-foreground text-sm font-medium tracking-wider w-full sm:w-auto hover:opacity-90 transition-all"
              >
                VIEW MY ORDERS
              </button>
              <button
                onClick={() => navigate('/#categories')}
                className="px-8 py-3 border border-border text-black text-sm font-medium tracking-wider w-full sm:w-auto hover:bg-background transition-colors"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* MAIN CONTENT AREA */}
            <div className="flex-1">
              {step === 2 && (
                <div className="bg-background p-6 border border-border mb-8">
                  <div className="mb-6">
                    <h1 className="text-2xl font-serif text-[#1e293b]">Choose Address</h1>
                    <p className="text-sm text-muted-foreground mt-1">Detailed address will help our delivery partner reach your doorstep quickly</p>
                  </div>

                  <form id="address-form" onSubmit={handleAddressSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">Full Name *</label>
                      <input
                        required
                        type="text"
                        value={address.name}
                        onChange={e => setAddress({ ...address, name: e.target.value })}
                        className="w-full border border-border p-3 focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">Mobile Number *</label>
                      <input
                        required
                        type="tel"
                        pattern="[0-9]{10}"
                        title="10 digit mobile number"
                        value={address.phone}
                        onChange={e => setAddress({ ...address, phone: e.target.value })}
                        className="w-full border border-border p-3 focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">Address Line *</label>
                      <textarea
                        required
                        rows={3}
                        value={address.addressLine}
                        onChange={e => setAddress({ ...address, addressLine: e.target.value })}
                        className="w-full border border-border p-3 focus:outline-none focus:border-black"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">Pincode *</label>
                      <input
                        required
                        type="text"
                        pattern="[0-9]{6}"
                        title="6 digit pincode"
                        value={address.pincode}
                        onChange={e => setAddress({ ...address, pincode: e.target.value })}
                        className="w-full border border-border p-3 focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isCheckingPincode}
                        className="px-8 py-3 bg-primary text-primary-foreground font-medium text-sm tracking-wider hover:opacity-90 transition-all rounded-sm disabled:opacity-50"
                      >
                        {isCheckingPincode ? 'CHECKING PINCODE...' : 'DELIVER HERE'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {step === 3 && (
                <div className="bg-background p-6 border border-border">
                  <div className="mb-6 flex justify-between items-center border-b border-border pb-4">
                    <div>
                      <h2 className="text-xl font-medium flex items-center">
                        <MapPin className="mr-2" size={20} /> Delivery Address
                      </h2>
                      <p className="text-sm text-muted-foreground mt-2">{address.name}, {address.phone}</p>
                      <p className="text-sm text-muted-foreground">{address.addressLine}, {address.pincode}</p>
                    </div>
                    <button onClick={() => setStep(2)} className="text-sm font-medium border border-border px-4 py-1.5 hover:bg-background">Edit</button>
                  </div>

                  <h2 className="text-xl font-medium mb-6 flex items-center">
                    <CreditCard className="mr-2" size={20} /> Choose Payment Mode
                  </h2>

                  {/* Online Payment Option */}
                  <div
                    onClick={() => setPaymentMode('ONLINE')}
                    className={`border p-4 bg-background flex items-center justify-between mb-4 cursor-pointer relative overflow-hidden transition-all ${paymentMode === 'ONLINE' ? 'border-[#001325] shadow-sm' : 'border-border opacity-70'}`}
                  >
                    {paymentMode === 'ONLINE' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#001325]"></div>}
                    <div className="flex items-center pl-2">
                      <div className={`w-4 h-4 rounded-full border border-[#001325] mr-3 flex items-center justify-center ${paymentMode === 'ONLINE' ? 'bg-[#001325]' : ''}`}>
                        {paymentMode === 'ONLINE' && <div className="w-1.5 h-1.5 rounded-full bg-background"></div>}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground text-sm uppercase tracking-wider">Pay Online</span>
                        <span className="text-xs text-muted-foreground">UPI, Cards, Netbanking, Wallets</span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center opacity-80">
                      <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" alt="Visa" className="h-3" />
                      <img src="https://cdn-icons-png.flaticon.com/512/196/196566.png" alt="Mastercard" className="h-4" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-3" />
                    </div>
                  </div>

                  {/* COD Option */}
                  <div
                    onClick={() => setPaymentMode('COD')}
                    className={`border p-4 bg-background flex items-center justify-between mb-8 cursor-pointer relative overflow-hidden transition-all ${paymentMode === 'COD' ? 'border-[#001325] shadow-sm' : 'border-border opacity-70'}`}
                  >
                    {paymentMode === 'COD' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#001325]"></div>}
                    <div className="flex items-center pl-2">
                      <div className={`w-4 h-4 rounded-full border border-[#001325] mr-3 flex items-center justify-center ${paymentMode === 'COD' ? 'bg-[#001325]' : ''}`}>
                        {paymentMode === 'COD' && <div className="w-1.5 h-1.5 rounded-full bg-background"></div>}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground text-sm uppercase tracking-wider">Cash on Delivery (COD)</span>
                        <span className="text-xs text-muted-foreground">Pay when your order arrives</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 border border-green-100 rounded tracking-tighter">AVAILABLE</span>
                  </div>

                  <div className="border-t border-border pt-6">
                    <button
                      onClick={placeOrder}
                      disabled={isPlacingOrder}
                      className="w-full py-4 bg-primary text-primary-foreground font-medium tracking-wider hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {isPlacingOrder ? 'PLACING ORDER...' : `PLACE ORDER • ₹${finalTotal.toLocaleString()}`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ORDER SUMMARY SIDEBAR */}
            <div className="lg:w-[350px]">
              <div className="bg-background p-5 border border-border sticky top-24">
                <div className="flex justify-between items-center mb-4 border-b border-border pb-4">
                  <h3 className="font-medium text-lg">Bag</h3>
                  <span className="text-sm text-muted-foreground">{cartItems.length} Items</span>
                </div>

                <div className="space-y-4 mb-6 max-h-[30vh] overflow-y-auto pr-2">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <img src={item.image} alt={item.name} className="w-16 h-20 object-cover bg-muted" />
                      <div className="flex-1 text-sm">
                        <p className="font-medium line-clamp-1">{item.name}</p>
                        <p className="text-muted-foreground mt-0.5">Size: {item.size} • Qty: {item.quantity}</p>
                        <p className="font-medium mt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Coupon Code"
                      className="flex-1 border border-border px-3 py-2 text-sm focus:outline-none focus:border-black uppercase"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="px-4 py-2 bg-primary text-primary-foreground text-xs font-medium tracking-wider hover:opacity-90 transition-all"
                    >
                      APPLY
                    </button>
                  </div>
                  {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
                  {discount > 0 && <p className="text-green-600 text-xs mt-1 font-medium">Coupon applied! 10% discount added.</p>}
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="font-medium text-sm mb-3">Price Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">FREE</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount (10%)</span>
                        <span>-₹{discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="bg-green-50 p-2 text-center text-green-700 text-xs font-medium border border-green-100 mt-2">
                      You are enjoying FREE shipping!
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between font-bold text-base mt-2">
                      <span>Total Amount</span>
                      <span>₹{finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center p-4 bg-background border border-border text-xs text-muted-foreground gap-3">
                <img src="https://cdn-icons-png.flaticon.com/512/6062/6062646.png" alt="Secure" className="w-6 h-6 opacity-60" />
                <div>
                  <p className="font-medium text-black">Authentic Products. Secure Payments.</p>
                  <p>Easy Return & Exchange</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
      <BottomNav />
      <Footer />
    </div>
  );
};

export default CheckoutPage;
