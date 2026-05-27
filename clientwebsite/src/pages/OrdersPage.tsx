import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, Loader2, Search, SlidersHorizontal, ChevronRight, ArrowLeft, Star, HelpCircle, Share2, Copy, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  expectedDeliveryDate?: string;
  statusDates?: {
    placed?: string;
    paymentVerified?: string;
    packed?: string;
    shipped?: string;
    outForDelivery?: string;
    delivered?: string;
  };
  createdAt: string;
  address: {
    name: string;
    phone: string;
    addressLine: string;
    pincode: string;
  };
  paymentMethod: string;
  trackingId?: string;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const navigate = useNavigate();

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Order cancelled successfully");
        
        // Update both lists
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'Cancelled' } : o));
        setSelectedOrder(prev => prev && prev._id === orderId ? { ...prev, status: 'Cancelled' } : prev);
      } else {
        toast.error(data.message || "Failed to cancel order");
      }
    } catch (err) {
      toast.error("Error cancelling order");
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userRes = await fetch('/api/dashboard', { credentials: 'include' });
        if (!userRes.ok) {
          toast.error("Please login to view your orders");
          navigate('/cart');
          return;
        }
        const userData = await userRes.json();
        const email = userData.user.email;

        const response = await fetch(`/api/orders/${email}`, { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </div>
    );
  }

  const renderList = () => (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <Header />
      <div className="max-w-4xl mx-auto md:my-8 bg-white md:rounded-xl md:shadow-sm md:border md:border-gray-100 overflow-hidden min-h-screen md:min-h-0">
        <div className="flex items-center px-4 py-4 md:px-6 border-b border-gray-100 bg-white">
          <button onClick={() => navigate('/')} className="mr-3 p-1 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">My Orders</h1>
        </div>



        {error ? (
          <div className="p-12 text-center text-red-500">
            <p className="font-medium">Failed to load orders.</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-primary underline">Try again</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Package size={40} className="opacity-40" />
            </div>
            <p className="text-lg font-medium text-gray-500">No orders found.</p>
            <button onClick={() => navigate('/')} className="mt-6 px-8 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {orders.map((order) =>
              order.items.map((item, index) => (
                <div key={`${order._id}-${index}`} className="group hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                  <div
                    className="p-4 md:p-6 flex gap-4 md:gap-6 items-center cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                        <h3 className="font-bold text-gray-900 text-base md:text-lg truncate">{item.name}</h3>
                        <span className={`text-[11px] md:text-xs font-bold px-2 py-1 rounded-full w-fit ${order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                          }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {order.status === 'Pending' ? 'Ordered on' : order.status + ' on'} {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
                        <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
                        <span className="text-xs text-gray-400">Size: {item.size}</span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-300 group-hover:text-primary transition-colors shrink-0" />
                  </div>

                  {/* Desktop Quick Actions */}
                  <div className="px-4 pb-4 md:px-6 md:pb-6 flex items-center justify-between">
                    <div className="flex gap-4">
                      <button onClick={() => setSelectedOrder(order)} className="text-xs font-bold text-primary hover:underline">Track Order</button>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <div className="md:hidden">
        <BottomNav />
      </div>
      <Footer />
    </div>
  );

  const renderDetails = () => {
    if (!selectedOrder) return null;
    const orderDate = new Date(selectedOrder.createdAt);

    return (
      <div className="min-h-screen bg-gray-100 pb-20 md:pb-8">
        <Header />
        <div className="max-w-4xl mx-auto md:my-8 bg-white md:rounded-2xl md:shadow-lg md:border md:border-gray-100 overflow-hidden min-h-screen md:min-h-0">
          <div className="flex items-center px-4 py-4 md:px-6 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
            <button onClick={() => setSelectedOrder(null)} className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={24} className="text-gray-700" />
            </button>
            <h1 className="flex-1 text-lg md:text-xl font-bold text-gray-800">Order Details</h1>

          </div>

          <div className="md:grid md:grid-cols-3 gap-6 p-4 md:p-8">
            <div className="md:col-span-2 space-y-6">
              {/* Product Info Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Items in this order</h3>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex gap-4 md:gap-6 mb-4 last:mb-0">
                    <div className="w-20 h-28 md:w-24 md:h-32 shrink-0 bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-base md:text-lg leading-tight">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-bold uppercase tracking-tighter">Size: {item.size}</span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-bold uppercase tracking-tighter">Qty: {item.quantity}</span>
                      </p>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-xl font-black text-gray-900">₹{item.price.toLocaleString()}</span>
                        <span className="text-xs text-green-600 font-bold">100% Secure Payment</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Tracking Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm overflow-hidden relative">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2.5 h-2.5 rounded-full ${selectedOrder.status === 'Cancelled' ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
                      <h3 className={`text-xl font-black ${selectedOrder.status === 'Cancelled' ? 'text-red-600' : 'text-gray-900'}`}>{selectedOrder.status || 'Pending'}</h3>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      {selectedOrder.status === 'Cancelled' 
                        ? 'This order has been cancelled.' 
                        : (selectedOrder.status === 'Delivered' || selectedOrder.status === 'Completed')
                          ? 'Your order has been successfully delivered.'
                          : selectedOrder.status === 'Pending' 
                            ? 'Your order is confirmed and being prepared.' 
                            : 'Your order is on the way.'}
                    </p>
                    {selectedOrder.expectedDeliveryDate && selectedOrder.status !== 'Cancelled' && (
                      <p className="text-xs text-primary font-bold mt-2">
                        {(selectedOrder.status === 'Delivered' || selectedOrder.status === 'Completed') ? '🎉 Delivered on: ' : '📅 Expected Delivery: '} 
                        {new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                      selectedOrder.status === 'Cancelled' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {selectedOrder.status === 'Cancelled' ? 'Cancelled' : 'On Track'}
                    </span>
                    {selectedOrder.trackingId && (
                      <div className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                        <span className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">Tracking ID</span>
                        <span className="text-xs font-black text-gray-900">{selectedOrder.trackingId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedOrder.status === 'Cancelled' ? (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center text-red-600 text-sm font-medium">
                    This order was cancelled. Please contact support if you have questions.
                  </div>
                ) : (
                  <div className="relative mt-6 mb-4 ml-2">
                    {/* Gray background line */}
                    <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-gray-100"></div>
                    
                    {/* Green active progress line */}
                    {(() => {
                      const getStatusIndex = (status: string) => {
                        const s = status || 'Pending';
                        if (s === 'Pending') return 0;
                        if (s === 'Confirmed' || s === 'Payment Verified') return 1;
                        if (s === 'Packed') return 2;
                        if (s === 'Shipped') return 3;
                        if (s === 'Out for Delivery') return 4;
                        if (s === 'Delivered' || s === 'Completed') return 5;
                        return 0;
                      };
                      const currentStepIndex = getStatusIndex(selectedOrder.status);
                      
                      const getShippedDesc = () => {
                        if (selectedOrder.expectedDeliveryDate) {
                          try {
                            const d = new Date(selectedOrder.expectedDeliveryDate);
                            return `Expected on ${d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`;
                          } catch (e) {
                            return `Expected on ${selectedOrder.expectedDeliveryDate}`;
                          }
                        }
                        return 'Expected in 2-3 days.';
                      };

                      const getDeliveredDesc = () => {
                        if (selectedOrder.expectedDeliveryDate) {
                          try {
                            const d = new Date(selectedOrder.expectedDeliveryDate);
                            return `Delivered on ${d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`;
                          } catch (e) {
                            return `Delivered on ${selectedOrder.expectedDeliveryDate}`;
                          }
                        }
                        return 'Delivered successfully!';
                      };

                      const formatDate = (dateStr?: string, defaultText: string = '') => {
                        if (!dateStr) return defaultText;
                        try {
                          const d = new Date(dateStr);
                          return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                        } catch (e) {
                          return dateStr;
                        }
                      };

                      const steps = [
                        { 
                          label: 'Order Placed', 
                          emoji: '✅', 
                          desc: selectedOrder.statusDates?.placed 
                            ? `Confirmed on ${formatDate(selectedOrder.statusDates.placed)}` 
                            : `Confirmed on ${orderDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}` 
                        },
                        { 
                          label: 'Payment Verified', 
                          emoji: '✅', 
                          desc: selectedOrder.statusDates?.paymentVerified 
                            ? `Payment verified on ${formatDate(selectedOrder.statusDates.paymentVerified)}` 
                            : 'Payment received and verified.' 
                        },
                        { 
                          label: 'Packed', 
                          emoji: '✅', 
                          desc: selectedOrder.statusDates?.packed 
                            ? `Your order was packed on ${formatDate(selectedOrder.statusDates.packed)}` 
                            : 'Your order is packed and ready.' 
                        },
                        { 
                          label: 'Shipped', 
                          emoji: '🚚', 
                          desc: selectedOrder.statusDates?.shipped 
                            ? `Shipped on ${formatDate(selectedOrder.statusDates.shipped)}` 
                            : getShippedDesc() 
                        },
                        { 
                          label: 'Out for Delivery', 
                          emoji: '📍', 
                          desc: selectedOrder.statusDates?.outForDelivery 
                            ? `Out for delivery on ${formatDate(selectedOrder.statusDates.outForDelivery)}` 
                            : 'Delivery partner is on the way.' 
                        },
                        { 
                          label: 'Delivered', 
                          emoji: '🎉', 
                          desc: selectedOrder.statusDates?.delivered 
                            ? `Delivered on ${formatDate(selectedOrder.statusDates.delivered)}` 
                            : getDeliveredDesc() 
                        }
                      ];

                      return (
                        <>
                          <div 
                            className="absolute left-[15px] top-2 w-[2px] bg-green-500 transition-all duration-500"
                            style={{ height: `${(currentStepIndex / 5) * 100}%` }}
                          ></div>

                          {steps.map((step, idx) => {
                            const isCompleted = idx <= currentStepIndex;
                            const isCurrent = idx === currentStepIndex;

                            return (
                              <div key={idx} className="relative flex items-start gap-4 mb-8 last:mb-0">
                                <div 
                                  className={`w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 z-10 transition-all duration-300 ${
                                    isCompleted 
                                      ? 'border-green-500 shadow-sm scale-110 bg-green-50' 
                                      : 'border-gray-200'
                                  }`}
                                >
                                  <span style={{ fontSize: '15px', filter: isCompleted ? 'none' : 'grayscale(100%) opacity(40%)' }}>
                                    {step.emoji}
                                  </span>
                                </div>
                                <div className="flex-1 -mt-0.5">
                                  <p className={`text-sm font-bold transition-colors ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {step.label}
                                  </p>
                                  <p className={`text-xs mt-0.5 transition-colors ${isCompleted ? 'text-gray-600' : 'text-gray-300'}`}>
                                    {step.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      );
                    })()}
                  </div>
                )}

                <div className="mt-8 p-4 bg-primary/5 rounded-2xl flex gap-3 items-start border border-primary/10">
                  <Package size={20} className="text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-primary uppercase mb-1">Logistics Update</p>
                    <p className="text-[11px] text-gray-600 font-medium">Tracking link and delivery executive details will be sent via email once shipped.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Shipping Details */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={18} className="text-gray-400" />
                  <h3 className="font-bold text-gray-900">Shipping Address</h3>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-black text-gray-900 mb-2">{selectedOrder.address.name}</p>
                  <p className="leading-relaxed">{selectedOrder.address.addressLine}</p>
                  <p className="font-bold text-gray-900">{selectedOrder.address.pincode}</p>
                  <div className="mt-4 pt-4 border-t border-gray-50">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Phone Number</p>
                    <p className="font-bold text-gray-900">{selectedOrder.address.phone}</p>
                  </div>
                </div>
              </div>

              {/* Price Details */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Price Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Items Total</span>
                    <span className="font-bold text-gray-900">₹{selectedOrder.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery Charges</span>
                    <span className="text-green-600 font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Tax</span>
                    <span className="font-bold text-gray-900">Included</span>
                  </div>
                  <div className="flex justify-between font-black pt-4 border-t border-gray-100 text-lg">
                    <span className="text-gray-900">Order Total</span>
                    <span className="text-primary">₹{selectedOrder.totalAmount}</span>
                  </div>
                </div>
                <div className="mt-6 p-3 bg-green-50 rounded-xl text-center border border-green-100">
                  <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Payment via {selectedOrder.paymentMethod}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {selectedOrder.status === 'Cancelled' ? (
                  <div className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold border border-red-200 text-center text-sm shadow-sm">
                    ❌ This order has been Cancelled
                  </div>
                ) : ['Shipped', 'Out for Delivery', 'Delivered', 'Completed'].includes(selectedOrder.status) ? (
                  <div className="w-full p-4 bg-gray-50 text-gray-500 rounded-2xl border border-gray-200 text-center text-xs font-semibold leading-relaxed">
                    🔒 This order is <strong>{selectedOrder.status.toLowerCase()}</strong> and cannot be cancelled anymore.
                  </div>
                ) : (
                  <button 
                    onClick={() => handleCancelOrder(selectedOrder._id)}
                    className="w-full py-4 bg-white text-red-600 border-2 border-red-600 rounded-2xl font-bold hover:bg-red-50 hover:border-red-700 hover:text-red-700 transition-all text-sm"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="md:hidden">
          <BottomNav />
        </div>
        <Footer />
      </div>
    );
  };

  return selectedOrder ? renderDetails() : renderList();
};

export default OrdersPage;
