import React from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import AnnouncementBar from "@/components/AnnouncementBar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { Printer, ShieldCheck, HelpCircle } from "lucide-react";

interface PolicySection {
  id: number;
  anchor: string;
  title: string;
  points: string[];
  elaboration?: string;
  listTitle?: string;
  subLists?: { title: string; items: string[] }[];
}

const RefundPolicy = () => {
  const sections: PolicySection[] = [
    {
      id: 1,
      anchor: "cancellation",
      title: "1. Cancellation Policy",
      points: [
        "Orders can be cancelled within 12 hours of placing the order.",
        "Once the order is processed or shipped, cancellation will not be possible.",
        "To request a cancellation, contact our support team with your Order ID.",
        "If the order is cancelled successfully, the refund will be processed to the original payment method within 5–7 business days."
      ]
    },
    {
      id: 2,
      anchor: "return-exchange",
      title: "2. Return & Exchange Eligibility",
      points: [
        "You received a damaged product.",
        "You received the wrong item / wrong size different from your order.",
        "The product has a major manufacturing defect."
      ],
      listTitle: "We only accept returns or exchanges if:"
    },
    {
      id: 3,
      anchor: "conditions",
      title: "3. Conditions for Returns",
      points: [
        "Request must be raised within 48 hours of delivery.",
        "Product must be unused, unwashed, and with original tags & packaging.",
        "Clear unboxing video and product photos are required for verification.",
        "Exchange is subject to stock availability."
      ]
    },
    {
      id: 4,
      anchor: "non-returnable",
      title: "4. Non-Returnable Items",
      points: [
        "Sale or discounted products.",
        "Products damaged after use.",
        "Minor color variations due to lighting/screen differences."
      ]
    },
    {
      id: 5,
      anchor: "refunds",
      title: "5. Refund Processing",
      points: [
        "Refunds are initiated only after the returned item passes quality inspection.",
        "Approved refunds will be processed within 5–7 business days.",
        "Refund amount will be credited to the original payment method or bank account.",
        "Shipping charges paid during order placement are non-refundable unless the mistake was from our side."
      ]
    },
    {
      id: 6,
      anchor: "shipping-costs",
      title: "6. Shipping Costs for Returns",
      points: [
        "If the return is due to a damaged, defective, or wrong product, GriDox (gridox.in) will bear the return shipping charges.",
        "If the customer requests an exchange for personal reasons (size preference, change of mind, etc.), the customer may need to pay the return shipping cost.",
        "Reverse pickup availability depends on serviceability in your location."
      ]
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
        <title>Refund & Cancellation Policy | GriDox Premium Fashion Store</title>
        <meta name="description" content="Read the GriDox cancellation, return, and refund policies. Learn how to cancel orders, return damaged items, or request exchanges." />
        <meta property="og:title" content="Refund & Cancellation Policy | GriDox" />
        <meta property="og:description" content="Understand the returns and refund criteria for shopping at GriDox Premium Fashion." />
        <meta name="keywords" content="GriDox refund, GriDox return policy, GriDox cancellation, boutique returns Coimbatore" />
        <link rel="canonical" href="https://gridox.in/refund-policy" />
      </Helmet>

      <AnnouncementBar />
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        {/* Editorial Page Header */}
        <div className="border-b border-zinc-200 pb-12 mb-16 text-center md:text-left">
          <div className="flex justify-center md:justify-between items-end flex-wrap gap-6">
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#8b231a] font-bold block">
                Customer Care & Guarantee
              </span>
              <h1 className="font-heading italic text-4xl md:text-6xl text-black leading-tight">
                Refund & Return Policy
              </h1>
              <p className="text-zinc-550 text-sm md:text-base max-w-2xl font-medium">
                Our policy details our cancellation procedures, eligibility rules for return requests, and guidelines for processing refunds.
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

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Sticky Sidebar: Table of Contents */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-28 space-y-8 p-6 bg-[#fcfaf8] border-l-2 border-[#8b231a]">
              <div className="flex items-center gap-2.5 text-zinc-950 font-bold text-xs uppercase tracking-widest pb-3 border-b border-zinc-200">
                <ShieldCheck className="w-4 h-4 text-[#8b231a]" />
                Policy Sections
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
              
              {/* Contact Block in Sidebar */}
              <div className="pt-6 border-t border-zinc-200 text-xs text-zinc-650 space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-black block mb-1">
                  Support Desk
                </span>
                <p>
                  <strong>Email:</strong> <br />
                  <a href="mailto:gridoxclothing@gmail.com" className="text-[#8b231a] hover:underline font-semibold">
                    gridoxclothing@gmail.com
                  </a>
                </p>
                <p>
                  <strong>WhatsApp:</strong> <br />
                  <a href="https://wa.me/918110911118" target="_blank" rel="noopener noreferrer" className="text-[#8b231a] hover:underline font-semibold">
                    +91 81109 11118
                  </a>
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-150 text-[10px] text-zinc-400 font-medium">
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
                
                <div className="bg-[#fcfaf8] p-6 border-l-2 border-[#8b231a] space-y-3">
                  {section.listTitle && (
                    <p className="font-bold text-zinc-900 text-sm md:text-base mb-2">
                      {section.listTitle}
                    </p>
                  )}
                  <ul className="space-y-2.5">
                    {section.points.map((point, idx) => (
                      <li key={idx} className="text-zinc-750 text-xs md:text-sm leading-relaxed flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8b231a] shrink-0 mt-2" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ))}

            {/* Mobile Contact Information */}
            <div className="lg:hidden p-6 bg-[#fcfaf8] border-l-2 border-[#8b231a] space-y-3">
              <h3 className="text-xs uppercase tracking-wider font-bold text-black">
                Need Assistance?
              </h3>
              <p className="text-xs">
                To request a return or cancellation, reach our team directly:
              </p>
              <div className="text-xs space-y-1.5 pt-1">
                <p><strong>Email:</strong> <a href="mailto:gridoxclothing@gmail.com" className="text-[#8b231a] hover:underline font-semibold">gridoxclothing@gmail.com</a></p>
                <p><strong>WhatsApp:</strong> <a href="https://wa.me/918110911118" target="_blank" rel="noopener noreferrer" className="text-[#8b231a] hover:underline font-semibold">+91 81109 11118</a></p>
              </div>
            </div>

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

export default RefundPolicy;
