import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, Loader2, Search, SlidersHorizontal, ChevronRight, ArrowLeft, Star, HelpCircle, Share2, Copy, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

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
  createdAt: string;
  address: {
    name: string;
    phone: string;
    addressLine: string;
    pincode: string;
  };
  paymentMethod: string;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const navigate = useNavigate();

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

        {/* Search & Filter Bar */}
        <div className="p-4 md:px-6 flex flex-col md:flex-row gap-3 border-b border-border/10 bg-background/50">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search your orders..."
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/60 font-body"
            />
          </div>
          <button className="flex items-center justify-center px-6 py-2.5 bg-card border border-border/30 rounded-xl gap-2 text-sm font-bold text-foreground/80 hover:bg-background hover:text-primary transition-all shadow-sm">
            <SlidersHorizontal size={16} /> Filters
          </button>
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
                      <button className="text-xs font-bold text-primary hover:underline">Track Order</button>
                      <button className="text-xs font-bold text-gray-500 hover:underline">Need Help?</button>
                    </div>
                    {order.status !== 'Pending' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Rate product:</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => <Star key={star} size={14} className="text-gray-200 hover:text-amber-400 cursor-pointer transition-colors" />)}
                        </div>
                      </div>
                    )}
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
            <div className="flex gap-3">
              <button className="hidden md:flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"><HelpCircle size={16} /> Help Center</button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Share2 size={20} className="text-gray-600" /></button>
            </div>
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
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <h3 className="text-xl font-black text-gray-900">{selectedOrder.status}</h3>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      {selectedOrder.status === 'Pending' ? 'Your order is confirmed and being prepared.' : 'Your order is on the way.'}
                    </p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">On Track</span>
                </div>

                <div className="relative mt-4 mb-4 ml-2">
                  <div className="absolute left-[9px] top-0 bottom-0 w-[2px] bg-gray-100"></div>
                  <div className="absolute left-[9px] top-0 h-[50%] w-[2px] bg-green-500"></div>

                  <div className="relative flex items-start gap-4 mb-10">
                    <div className="bg-white ring-4 ring-white z-10"><CheckCircle2 size={20} className="text-green-500 fill-white" /></div>
                    <div className="flex-1 -mt-0.5">
                      <p className="text-sm font-bold text-gray-900">Order Confirmed</p>
                      <p className="text-xs text-gray-500 mt-0.5">{orderDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="relative flex items-start gap-4 mb-10">
                    <div className="bg-white ring-4 ring-white z-10">
                      {selectedOrder.status !== 'Pending' ? <CheckCircle2 size={20} className="text-green-500 fill-white" /> : <Circle size={20} className="text-gray-200 fill-white" />}
                    </div>
                    <div className="flex-1 -mt-0.5">
                      <p className="text-sm font-bold text-gray-900">Shipped</p>
                      <p className="text-xs text-gray-400 mt-0.5">Expected in 2-3 days</p>
                    </div>
                  </div>

                  <div className="relative flex items-start gap-4">
                    <div className="bg-white ring-4 ring-white z-10"><Circle size={20} className="text-gray-100 fill-white" /></div>
                    <div className="flex-1 -mt-0.5">
                      <p className="text-sm font-bold text-gray-400">Delivery</p>
                      <p className="text-xs text-gray-300 mt-0.5">Estimated by {new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-primary/5 rounded-2xl flex gap-3 items-start border border-primary/10">
                  <Package size={20} className="text-primary shrink-0" />
                  <div>
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
                <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-200">Download Invoice</button>
                <button className="w-full py-4 bg-white text-gray-900 border-2 border-gray-900 rounded-2xl font-bold hover:bg-gray-50 transition-all">Cancel Order</button>
              </div>
            </div>
          </div>
        </div>
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    );
  };

  return selectedOrder ? renderDetails() : renderList();
};

export default OrdersPage;
