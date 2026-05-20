import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";
import { MapPin, Phone, Mail, Clock, Navigation, Star, Sparkles, Shirt } from "lucide-react";

// Colors: Mahogany (#8b231a), Ivory (#fcfaf7), Charcoal (#000000)

const StoreLocator = () => {
  const address = "Sakthi Theatre Rd, Shrinagar, Pitchampalayam Pudur, Tiruppur, Chettipalayam, Tamil Nadu 641603";
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=17&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 font-body">
      <Header />

      {/* Hero Section - Sleeker and more minimalist */}
      <section className="relative h-[30vh] md:h-[50vh] flex items-center justify-center overflow-hidden bg-[#000000]">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 to-[#000000] z-10" />
        <img
          src="/store_locator_hero_1775658520224.png"
          alt="GriDox Store Interior"
          className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[0.3]"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000";
          }}
        />
        <div className="relative z-20 text-center space-y-4 md:space-y-6 px-4">
          <div className="inline-block px-3 py-1.5 md:px-4 border border-white/20 text-white text-[9px] uppercase tracking-[0.4em] font-semibold backdrop-blur-sm mb-2 md:mb-2">
            Boutique Destination
          </div>
          <h1 className="font-heading text-3xl md:text-6xl lg:text-7xl text-white font-light tracking-tight">
            Our <span className="italic font-normal text-[#e5d5c5]">Boutique</span> Store
          </h1>
          <div className="w-12 md:w-16 h-px bg-[#8b231a] mx-auto" />
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 md:gap-16 items-start">

            {/* Left Content: The "Neat" details */}
            <div className="lg:col-span-5 space-y-12 md:space-y-16 w-full">
              <div className="space-y-6 md:space-y-8">
                <div className="space-y-3 md:space-y-4">
                  <h2 className="font-heading text-3xl md:text-4xl text-[#000000] leading-tight">
                    Our Boutique in <span className="text-[#8b231a] italic">Tiruppur</span>
                  </h2>
                  <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-md">
                    Experience our latest collections and personalized styling in our signature boutique setting.
                  </p>
                </div>

                {/* Info List */}
                <div className="space-y-8 md:space-y-10">
                  {/* Address */}
                  <div className="group flex gap-4 md:gap-6">
                    <div className="flex-shrink-0 w-10 h-10 border border-[#8b231a]/10 flex items-center justify-center text-[#8b231a] group-hover:bg-[#8b231a] group-hover:text-white transition-all duration-300">
                      <MapPin size={18} />
                    </div>
                    <div className="space-y-1 md:space-y-2">
                      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Address</p>
                      <p className="text-[#000000] font-medium leading-relaxed italic text-sm md:text-base">
                        {address}
                      </p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                    <div className="group flex gap-4 md:gap-6">
                      <div className="flex-shrink-0 w-10 h-10 border border-[#8b231a]/10 flex items-center justify-center text-[#8b231a] group-hover:bg-[#8b231a] group-hover:text-white transition-all duration-300">
                        <Phone size={18} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Call</p>
                        <a href="tel:+918110911118" className="text-[#000000] text-sm md:text-base font-semibold hover:text-[#8b231a] transition-colors">+91 81109 11118</a>
                      </div>
                    </div>
                    <div className="group flex gap-4 md:gap-6">
                      <div className="flex-shrink-0 w-10 h-10 border border-[#8b231a]/10 flex items-center justify-center text-[#8b231a] group-hover:bg-[#8b231a] group-hover:text-white transition-all duration-300">
                        <Mail size={18} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Email</p>
                        <a href="mailto:gridoxclothing@gmail.com" className="text-[#000000] text-sm md:text-base font-semibold hover:text-[#8b231a] transition-colors">gridoxclothing@gmail.com</a>
                      </div>
                    </div>
                  </div>

                  {/* Hours - Neat Table */}
                  <div className="p-6 md:p-8 bg-background border border-[#8b231a]/5 shadow-sm space-y-4 md:space-y-6">
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-[#8b231a]" />
                      <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#000000]">Boutique Hours</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                        <span className="text-gray-500">Mon - Sat</span>
                        <span className="text-[#000000] font-medium uppercase tracking-tight">10:00 - 21:00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Sunday</span>
                        <span className="text-[#8b231a] font-bold uppercase tracking-tight">11:00 - 20:00</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 md:pt-4">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-center w-full md:inline-flex md:w-auto items-center gap-4 bg-[#8b231a] text-white px-8 md:px-10 py-4 md:py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-[#000000] transition-all group shadow-sm"
                  >
                    Get Directions
                    <Navigation size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Map - Cinematic look */}
            <div className="lg:col-span-7 w-full">
              <div className="relative w-full aspect-[4/3] md:aspect-square lg:aspect-auto lg:h-[750px] shadow-sm lg:shadow-[0_40px_80px_-20px_rgba(139,35,26,0.15)] overflow-hidden rounded-md lg:rounded-none">
                <iframe
                  title="Store Location"
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "sepia(0.2) contrast(1.1) brightness(1.05)" }}
                  loading="lazy"
                  className="absolute inset-0 grayscale-[0.2]"
                />
                <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-[#8b231a]/10 rounded-md lg:rounded-none" />
              </div>
            </div>

          </div>
        </div>
      </main>



      <BottomNav />
      <WhatsAppButton />
      <Footer />
    </div>
  );
};

export default StoreLocator;
