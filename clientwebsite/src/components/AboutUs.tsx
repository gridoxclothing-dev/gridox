import { useState } from "react";
import { User, Layers, Scissors, Factory, ArrowRight, ChevronUp, MapPin, Phone, Clock, Mail } from "lucide-react";

const AboutUs = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section id="about" className="relative w-full py-12 md:py-16 bg-[#000000] text-white overflow-hidden border-t border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-8">

            {/* Header */}
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 border border-white/20 text-white/90 text-[10px] uppercase tracking-widest font-medium">
                Our Story
              </div>
              <h2 className="font-heading text-3xl md:text-4xl text-white leading-tight tracking-tight">
                About GriDox | Premium Designer Women's Fashion
              </h2>
              <p className="text-white/70 font-body text-sm md:text-base leading-relaxed max-w-xl mx-auto">
                GriDox is a leading destination for designer women's clothing, specializing in premium ethnic wear and modern contemporary styles. 
                With our own dedicated production unit, we bridge the gap between high-end couture and everyday elegance, ensuring every piece is tailored to perfection for the modern woman.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
              {[
                { icon: User,    text: "Tailored Fit",       desc: "Customized for comfort" },
                { icon: Layers,  text: "Quality Fabrics",    desc: "Premium handpicked materials" },
                { icon: Scissors,text: "Thoughtful Designs", desc: "Versatile and timeless" },
                { icon: Factory, text: "In-House Production",desc: "End-to-end quality control" },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center space-y-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-[#E6C9B5] flex items-center justify-center text-[#000000] transition-transform duration-300 hover:scale-110">
                    <item.icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-widest">{item.text}</p>
                    <p className="text-[10px] text-white/60 mt-1 max-w-[120px] mx-auto">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Manifesto */}
            <div className="w-full space-y-6 flex flex-col items-center">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="group flex items-center gap-2 text-white font-semibold tracking-widest text-xs uppercase transition-all hover:text-white/80"
              >
                {isExpanded ? "READ LESS" : "READ OUR MANIFESTO"}
                <div className={`p-1.5 rounded-full transition-all duration-300 ${isExpanded ? "bg-white/10" : "bg-white text-[#000000] group-hover:translate-x-1"}`}>
                  {isExpanded ? <ChevronUp size={14} /> : <ArrowRight size={14} />}
                </div>
              </button>

              <div className={`w-full overflow-hidden transition-all duration-700 ease-in-out ${isExpanded ? "max-h-[800px] opacity-100 pb-6" : "max-h-0 opacity-0"}`}>
                <div className="text-white/70 space-y-4 text-sm leading-relaxed max-w-2xl mx-auto text-left md:text-center px-4">
                  <p>
                    GriDox is inspired by modern women across Coimbatore, Tirupur, and all of Tamil Nadu who balance multiple roles effortlessly. That's why our collections are designed to be versatile, timeless, and easy to wear, especially suited for the local climate.
                  </p>
                  <p>
                    Unlike mass-produced fashion, we focus on limited, carefully crafted pieces—ensuring uniqueness in every outfit you own. Our designs are built to last beyond seasons, providing the perfect blend of tradition and comfort for the fashion-forward women of South India.
                  </p>
                  <div className="pt-4">
                    <p className="text-white text-base md:text-lg font-heading italic font-medium relative inline-block px-8">
                      <span className="absolute left-0 top-0 text-2xl opacity-20">"</span>
                      GriDox isn't just what you wear. It's how you feel wearing it.
                      <span className="absolute right-0 bottom-0 text-2xl opacity-20">"</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
