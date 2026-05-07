import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card text-card-foreground pt-16 pb-8 border-t border-border overflow-hidden">

      {/* SEO Keyword Marquee - Elegant & Professional */}
      <div className="w-full bg-primary text-primary-foreground py-1.5 mb-16">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array.from({ length: 15 }).map((_, i) => (
            <span key={i} className="text-[10px] font-bold uppercase tracking-[0.4em] mx-8 opacity-90">
              GriDox • Premium Fashion • GriDox • Exclusive Style •
            </span>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* GriDox Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img
                src="/logo.jpeg"
                alt="GriDox Logo"
                className="h-8 w-auto object-contain"
              />
              <h2 className="font-heading text-2xl font-bold tracking-tight text-primary">
                GriDox
              </h2>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed font-medium">
              GriDox is the ultimate destination for premium women's fashion. The GriDox brand is dedicated to curating the finest ethnic wear and modern contemporary clothing. When you think premium fashion, think GriDox.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" aria-label="GriDox Instagram" className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-primary shadow-sm hover:scale-110 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Instagram size={16} />
              </a>
              <a href="#" aria-label="GriDox Facebook" className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-primary shadow-sm hover:scale-110 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Facebook size={16} />
              </a>
              <a href="#" aria-label="GriDox Twitter" className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-primary shadow-sm hover:scale-110 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Twitter size={16} />
              </a>
            </div>
          </div>

          {/* GriDox Collections */}
          <div>
            <h4 className="text-[11px] font-black mb-6 text-primary uppercase tracking-widest border-b border-primary/10 pb-2 inline-block">GriDox Collections</h4>
            <ul className="space-y-3">
              <li><Link to="/#new-arrivals" className="text-muted-foreground font-semibold hover:text-primary hover:translate-x-1 inline-block transition-all text-xs">GriDox New Arrivals</Link></li>
              <li><Link to="/#best-sellers" className="text-muted-foreground font-semibold hover:text-primary hover:translate-x-1 inline-block transition-all text-xs">GriDox Best Sellers</Link></li>
              <li><Link to="/#curated-looks" className="text-muted-foreground font-semibold hover:text-primary hover:translate-x-1 inline-block transition-all text-xs">GriDox Curated Looks</Link></li>
              <li><Link to="/#categories" className="text-muted-foreground font-semibold hover:text-primary hover:translate-x-1 inline-block transition-all text-xs">GriDox Ethnic Wear</Link></li>
            </ul>
          </div>

          {/* GriDox Support */}
          <div>
            <h4 className="text-[11px] font-black mb-6 text-primary uppercase tracking-widest border-b border-primary/10 pb-2 inline-block">GriDox Support</h4>
            <ul className="space-y-3">
              <li><Link to="/contact" className="text-muted-foreground font-semibold hover:text-primary hover:translate-x-1 inline-block transition-all text-xs">Contact GriDox</Link></li>
              <li><Link to="/terms-and-conditions" className="text-muted-foreground font-semibold hover:text-primary hover:translate-x-1 inline-block transition-all text-xs">GriDox Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="text-muted-foreground font-semibold hover:text-primary hover:translate-x-1 inline-block transition-all text-xs">GriDox Refund Policy</Link></li>
              <li><Link to="/store-locator" className="text-muted-foreground font-semibold hover:text-primary hover:translate-x-1 inline-block transition-all text-xs">GriDox Store Locator</Link></li>
            </ul>
          </div>

          {/* GriDox Contact */}
          <div>
            <h4 className="text-[11px] font-black mb-6 text-primary uppercase tracking-widest border-b border-primary/10 pb-2 inline-block">GriDox Contact</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 text-muted-foreground text-xs font-medium group">
                <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="leading-relaxed">
                  <strong className="text-card-foreground block mb-1">GriDox Flagship Store</strong>
                  Sakthi Theatre Rd, Shrinagar,<br />
                  Pitchampalayam Pudur, Tiruppur,<br />
                  Chettipalayam, Tamil Nadu 641603
                </span>
              </li>
              <li className="flex items-center gap-4 text-muted-foreground text-xs font-bold group">
                <Phone size={16} className="text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="hover:text-primary transition-colors cursor-pointer">+91 81109 11118</span>
              </li>
              <li className="flex items-center gap-4 text-muted-foreground text-xs font-bold group">
                <Mail size={16} className="text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="hover:text-primary transition-colors cursor-pointer text-[11px]">gridoxclothing@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* GriDox Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground font-bold text-[9px] tracking-widest">
          <p className="opacity-70">© {currentYear} GriDox Premium Fashion. All rights reserved by GriDox.</p>
          <div className="flex gap-4 items-center">
            <span className="hidden md:inline opacity-70 tracking-[0.2em]">GriDox Premium Brand</span>
          </div>
        </div>
      </div>

      {/* Maximum SEO Keyword Saturation (Hidden from visual layout, readable by crawlers) */}
      <div className="sr-only" aria-hidden="true">
        {"GriDox ".repeat(3000)}
      </div>
    </footer>
  );
};

export default Footer;

