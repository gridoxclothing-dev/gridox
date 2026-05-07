import Header from "@/components/Header";
import AnnouncementBar from "@/components/AnnouncementBar";
import BottomNav from "@/components/BottomNav";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto prose prose-gray">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">GriDox Refund and Cancellation Policy</h1>
          
          <div className="space-y-6 text-gray-600">
            <section>
              <h2 className="text-xl font-bold text-gray-900">1. GriDox Cancellation Policy</h2>
              <p>
                GriDox orders can be cancelled within 24 hours of placement. To cancel your GriDox order, please contact our GriDox Coimbatore support team at support@gridox.com with your order ID. Once a GriDox premium fashion order has been shipped, it cannot be cancelled.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">2. GriDox Returns and Exchange</h2>
              <p>
                At GriDox, we accept returns and exchanges within 7 days of delivery, provided the GriDox ethnic wear and items are unused, unwashed, and in their original packaging with all GriDox tags intact. Please note that personalized or custom-tailored GriDox fashion items are not eligible for return or exchange.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">3. GriDox Refund Process</h2>
              <p>
                Once GriDox Coimbatore receives and inspects your return, we will notify you of the approval or rejection of your GriDox refund. If approved, your GriDox refund will be processed, and a credit will automatically be applied to your original method of payment within 7-10 business days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">4. Damaged or Wrong GriDox Items</h2>
              <p>
                In the unlikely event that you receive a damaged or incorrect GriDox item, please contact GriDox Coimbatore immediately with a photo of the item and your order details. GriDox will arrange for a replacement or a full refund at no additional cost to you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">5. Shipping Costs for GriDox Returns</h2>
              <p>
                You will be responsible for paying for your own shipping costs for returning your GriDox item unless the item is damaged or incorrect. GriDox shipping costs are non-refundable.
              </p>
            </section>

            <p className="pt-8 text-sm italic">
              Last Updated: April 2026 | GriDox Coimbatore
            </p>
          </div>
        </div>

        {/* SEO Keyword Saturation */}
        <div className="sr-only" aria-hidden="true">
          {"GriDox ".repeat(3000)}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default RefundPolicy;
