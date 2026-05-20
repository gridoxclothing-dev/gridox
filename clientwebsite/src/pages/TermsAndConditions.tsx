import React from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import AnnouncementBar from "@/components/AnnouncementBar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { Printer, Shield } from "lucide-react";

interface TermSection {
  id: number;
  anchor: string;
  title: string;
  exactTerm: string;
  elaboration: string;
}

const TermsAndConditions = () => {
  const sections: TermSection[] = [
    {
      id: 1,
      anchor: "agreement",
      title: "1. Acceptance of Terms",
      exactTerm: "By using our website and placing an order, you agree to our terms and policies.",
      elaboration: "These terms govern your use of the GriDox website and constitute a binding contract between you and GriDox. If you do not agree with any part of these policies, please do not access or place orders through our platform."
    },
    {
      id: 2,
      anchor: "product-variance",
      title: "2. Product Representations",
      exactTerm: "Product colors and sizes may slightly vary due to lighting, screen settings, and fabric.",
      elaboration: "We strive to showcase our boutique apparel as accurately as possible. However, due to natural fabric dye variations, studio lighting, and digital display profiles, slight color and size variations are to be expected and are inherent to artisanal textiles."
    },
    {
      id: 3,
      anchor: "payment",
      title: "3. Payment & Confirmation",
      exactTerm: "Orders are confirmed only after successful payment.",
      elaboration: "GriDox will only reserve stock and initiate dispatch procedures after confirmation of successful transaction completion from our secure payment gateways. Suspended or failed transactions will not result in order confirmation."
    },
    {
      id: 4,
      anchor: "cancellation-rights",
      title: "4. Right to Refuse Service",
      exactTerm: "We reserve the right to cancel orders due to stock issues, pricing errors, or suspicious activity.",
      elaboration: "In the event of an inventory discrepancy, data entry error, or security concern flagged by our payment gateway, we reserve the right to cancel the transaction. In such instances, a full refund will be immediately processed."
    },
    {
      id: 5,
      anchor: "cancellation-limit",
      title: "5. Cancellation Window",
      exactTerm: "Orders can only be cancelled before dispatch.",
      elaboration: "Should you wish to cancel your order, you must do so before the shipment is handed over to our courier partners. Once a tracking ID has been generated or the order status is marked as dispatched, cancellation is no longer possible."
    },
    {
      id: 6,
      anchor: "returns",
      title: "6. Returns & Exchanges",
      exactTerm: "Returns/exchanges are accepted only for damaged, defective, or wrong items with proof shared within 48 hours of delivery.",
      elaboration: "To request a return or exchange, please email customer support with photographic or unboxing video proof within 48 hours of shipment receipt. We do not accept returns for change of mind or subjective styling preferences."
    },
    {
      id: 7,
      anchor: "refunds",
      title: "7. Refund Inspections",
      exactTerm: "Refunds are processed after product inspection.",
      elaboration: "All returned products must be sent to our Quality Assurance team at our Tiruppur facility. Items must be unwashed, unworn, and have all tags and original packaging fully intact. Refunds will be approved following a successful inspection."
    },
    {
      id: 8,
      anchor: "shipping",
      title: "8. Delivery & Shipping Timelines",
      exactTerm: "Delivery timelines may vary based on courier and location.",
      elaboration: "Standard shipping times are estimates provided by third-party delivery services. GriDox cannot be held liable for delivery delays caused by adverse weather conditions, regional holiday schedules, or courier operational issues."
    },
    {
      id: 9,
      anchor: "intellectual-property",
      title: "9. Intellectual Property",
      exactTerm: "All website content, images, and designs belong to GriDox and cannot be copied without permission.",
      elaboration: "All visual assets, garment designs, product styling images, photography, text, and layout configurations featured on this site are protected by copyright laws. Any unauthorized use or reproduction is strictly prohibited."
    },
    {
      id: 10,
      anchor: "privacy",
      title: "10. Data Privacy & Customer Support",
      exactTerm: "Customer information is used only for order processing and support.",
      elaboration: "Your privacy is paramount. GriDox collects customer names, shipping addresses, email addresses, and phone numbers strictly for processing transactions and providing customer support. We do not sell or share customer data."
    }
  ];

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] pb-16 md:pb-0 font-body font-medium">
      <Helmet>
        <title>Terms & Conditions | GriDox Premium Fashion Store</title>
        <meta name="description" content="Official Terms & Conditions for GriDox customer services, orders, shipping, and returns. Read our guidelines to learn about our boutique policies." />
        <meta property="og:title" content="Terms & Conditions | GriDox" />
        <meta property="og:description" content="Understand the terms, guidelines, and conditions for placing orders with GriDox Premium Fashion." />
        <meta name="keywords" content="GriDox terms, GriDox policies, GriDox boutique terms, Coimbatore clothing policies" />
        <link rel="canonical" href="https://gridox.in/terms-and-conditions" />
      </Helmet>

      <AnnouncementBar />
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        {/* Editorial Page Header */}
        <div className="border-b border-zinc-200 pb-12 mb-16 text-center md:text-left">
          <div className="flex justify-center md:justify-between items-end flex-wrap gap-6">
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#8b231a] font-bold block">
                Legal Framework & User Agreement
              </span>
              <h1 className="font-heading italic text-4xl md:text-6xl text-black leading-tight">
                Terms & Conditions
              </h1>
              <p className="text-zinc-550 text-sm md:text-base max-w-2xl font-medium">
                These terms outline the guidelines, responsibilities, and protocols governing all transactions and services operated by MKG OCEANS for GriDox.
              </p>
            </div>
            
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8b231a] hover:text-black transition-colors pb-1 border-b border-[#8b231a] hover:border-black shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Document
            </button>
          </div>
        </div>

        {/* Two-Column Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Sticky Sidebar: Table of Contents */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-28 space-y-8 p-6 bg-[#fcfaf8] border-l-2 border-[#8b231a]">
              <div className="flex items-center gap-2.5 text-zinc-950 font-bold text-xs uppercase tracking-widest pb-3 border-b border-zinc-200">
                <Shield className="w-4 h-4 text-[#8b231a]" />
                Document Sections
              </div>
              <nav className="flex flex-col space-y-3.5">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleScrollTo(section.anchor)}
                    className="text-left text-xs font-semibold text-zinc-500 hover:text-[#8b231a] transition-colors leading-relaxed hover:translate-x-1 duration-200 block"
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
              <div className="pt-6 border-t border-zinc-200 text-[10px] text-zinc-400 font-medium">
                <p>GriDox • MKG OCEANS</p>
              </div>
            </div>
          </aside>

          {/* Right Column: Terms Text */}
          <article className="lg:col-span-8 space-y-12 leading-relaxed text-zinc-700 font-medium">
            {sections.map((section) => (
              <section 
                key={section.id} 
                id={section.anchor} 
                className="scroll-mt-28 space-y-4 border-b border-zinc-100 pb-10 last:border-0"
              >
                <h2 className="font-heading text-xl md:text-2xl text-black font-semibold tracking-tight">
                  {section.title}
                </h2>
                <div className="bg-[#fcfaf8] p-5 rounded-none border-l-2 border-[#8b231a]">
                  <p className="font-bold text-zinc-900 text-sm md:text-base leading-relaxed">
                    {section.exactTerm}
                  </p>
                </div>
                <p className="text-zinc-650 text-xs md:text-sm leading-relaxed font-medium pl-1 text-justify">
                  {section.elaboration}
                </p>
              </section>
            ))}

            {/* Mobile-only Document details */}
            <div className="lg:hidden pt-8 border-t border-zinc-200 text-[11px] text-zinc-500 font-medium space-y-1">
              <p>GriDox • MKG OCEANS</p>
            </div>
          </article>
        </div>

        {/* SEO Keyword Saturation */}
        <div className="sr-only" aria-hidden="true">
          {"GriDox ".repeat(3000)}
        </div>
      </main>

      <BottomNav />
      <Footer />
    </div>
  );
};

export default TermsAndConditions;
