import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const OrderStatusPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        setStatus('failed');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/payments/verify/${orderId}`, { credentials: 'include' });
        const data = await response.json();

        if (data.status === 'SUCCESS') {
          setStatus('success');
          // Clear cart on success
          localStorage.removeItem('gridox_cart');
          window.dispatchEvent(new Event('cartUpdated'));
        } else if (data.status === 'PENDING') {
          setStatus('pending');
        } else {
          setStatus('failed');
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus('failed');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-border p-8 text-center shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center">
              <Loader2 size={48} className="text-primary animate-spin mb-4" />
              <h2 className="text-xl font-medium">Verifying Payment...</h2>
              <p className="text-muted-foreground mt-2">Please do not close this window.</p>
            </div>
          ) : (
            <>
              {status === 'success' && (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h1 className="text-2xl font-serif mb-2">Payment Successful!</h1>
                  <p className="text-muted-foreground mb-8">
                    Your order has been placed successfully. Order ID: {orderId}
                  </p>
                  <button 
                    onClick={() => navigate('/my-orders')}
                    className="w-full py-3 bg-primary text-primary-foreground text-sm font-medium tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    VIEW MY ORDERS <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {status === 'failed' && (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <XCircle size={32} className="text-red-600" />
                  </div>
                  <h1 className="text-2xl font-serif mb-2">Payment Failed</h1>
                  <p className="text-muted-foreground mb-8">
                    We couldn't process your payment. If any amount was deducted, it will be refunded automatically.
                  </p>
                  <div className="flex flex-col gap-3 w-full">
                    <button 
                      onClick={() => navigate('/checkout')}
                      className="w-full py-3 bg-primary text-primary-foreground text-sm font-medium tracking-wider hover:opacity-90 transition-all"
                    >
                      RETRY PAYMENT
                    </button>
                    <button 
                      onClick={() => navigate('/')}
                      className="w-full py-3 border border-border text-sm font-medium tracking-wider hover:bg-background"
                    >
                      GO TO HOME
                    </button>
                  </div>
                </div>
              )}

              {status === 'pending' && (
                <div className="flex flex-col items-center">
                  <Loader2 size={48} className="text-yellow-500 animate-spin mb-4" />
                  <h1 className="text-2xl font-serif mb-2">Payment Pending</h1>
                  <p className="text-muted-foreground mb-8">
                    Your payment status is still being processed. We will update you once it's confirmed.
                  </p>
                  <button 
                    onClick={() => navigate('/my-orders')}
                    className="w-full py-3 bg-primary text-primary-foreground text-sm font-medium tracking-wider"
                  >
                    GO TO MY ORDERS
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderStatusPage;
