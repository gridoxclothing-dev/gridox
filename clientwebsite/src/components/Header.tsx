import { Search, ShoppingCart, Menu, X, MapPin, User, LogOut, Package, Truck, ChevronRight, Instagram } from "lucide-react";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { NAV_TARGETS } from "@/fixes/navConfig"; // fix: nav scroll links
import SearchModal from "./SearchModal";

const navLinks = [
  { name: "HOME" },
  { name: "CATEGORIES" },
  { name: "ADDRESS" },
  { name: "BULK QUERIES" },
  { name: "ABOUT US" },
];

function handleNavClick(name: string, navigate: ReturnType<typeof useNavigate>) { // fix: nav scroll links
  const target = NAV_TARGETS[name];
  if (!target) return;
  if (target.type === "path") {
    navigate(target.value);
  } else {
    const el = document.getElementById(target.value);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      // If not on home page, navigate home then scroll
      navigate(`/#${target.value}`);
    }
  }
}

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate(); // fix: nav scroll links
  const [userData, setUserData] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateCartCount = () => {
      const saved = localStorage.getItem('gridox_cart');
      if (saved) {
        try {
          const items = JSON.parse(saved);
          const count = items.length;
          setCartCount(count);
        } catch (e) { }
      } else {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);

    const handleOpenMenu = () => setMenuOpen(true);
    window.addEventListener('openMobileMenu', handleOpenMenu);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('openMobileMenu', handleOpenMenu);
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/dashboard', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
        }
      } catch (error) {
        // silently fail
      }
    };
    fetchUserData();

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setUserData(null);
      setProfileOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed');
    }
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-[1000]">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        {/* Mobile menu button */}
        <button
          className="md:hidden text-foreground flex items-center justify-center bg-transparent border-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <img
            src="/logo.jpeg"
            alt="GriDox Logo"
            className="h-8 md:h-10 w-auto object-contain"
          />
          <h1 className="font-heading text-xl md:text-2xl font-bold tracking-tight text-foreground m-0">
            GriDox
          </h1>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.name, navigate)} // fix: nav scroll links
              className="text-sm font-medium tracking-wider text-foreground hover:text-accent transition-colors whitespace-nowrap bg-transparent border-none cursor-pointer"
            >
              {link.name}
            </button>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="hidden md:block text-foreground hover:text-accent transition-colors bg-transparent border-none"
          >
            <Search size={20} />
          </button>

          {userData ? (
            <div className="relative" ref={profileRef}>
              <button
                aria-label="Profile Menu"
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-8 h-8 rounded-full bg-accent border border-border flex items-center justify-center text-primary font-bold hover:bg-accent/80 transition-colors cursor-pointer"
              >
                {userData.name.charAt(0).toUpperCase()}
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-50 flex flex-col">
                    <span className="text-sm font-bold text-gray-900 truncate">{userData.name}</span>
                    <span className="text-xs text-gray-500 truncate">{userData.email}</span>
                  </div>
                  <div className="p-2 flex flex-col gap-1">
                    <button
                      onClick={() => { setProfileOpen(false); navigate('/my-orders'); }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <Package size={16} className="opacity-70" />
                      My Orders
                    </button>
                    <button
                      onClick={() => { setProfileOpen(false); navigate('/my-orders'); }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <Truck size={16} className="opacity-70" />
                      Track Orders
                    </button>
                    <div className="h-[1px] bg-gray-100 my-1 mx-2"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              aria-label="Account"
              onClick={() => navigate("/auth")}
              className="text-foreground hover:text-accent transition-colors bg-transparent border-none cursor-pointer"
            >
              <User size={20} />
            </button>
          )}

          <button aria-label="Cart" onClick={() => navigate("/cart")} className="text-foreground hover:text-accent transition-colors relative bg-transparent border-none cursor-pointer"> {/* fix: cart route */}
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

        </div>
      </div>

      {/* Mobile Menu Side Drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[2000] flex">
          {/* Dark Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-[85%] max-w-[340px] bg-background h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 overflow-y-auto">

            {/* Close Button Inside Drawer */}
            <button
              className="absolute top-3 right-3 p-2 bg-muted rounded-full z-10 border-none cursor-pointer"
              onClick={() => setMenuOpen(false)}
            >
              <X size={20} className="text-foreground" />
            </button>

            {/* Top Promotional Banner */}
            <div
              className="bg-secondary p-5 flex items-center justify-between cursor-pointer border-b border-border"
              onClick={() => {
                setMenuOpen(false);
                window.dispatchEvent(new CustomEvent('openPromoModal', { detail: { src: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=60' } }));
              }}
            >
              <div>
                <span className="inline-block bg-primary text-primary-foreground text-[10px] font-extrabold px-2 py-0.5 rounded-sm mb-1.5 tracking-wider shadow-sm">10% OFF</span>
                <h3 className="text-foreground font-black text-lg leading-none tracking-tight">FLAT 10% OFF</h3>
                <p className="text-[11px] text-muted-foreground mt-1 font-bold tracking-wide">ON YOUR 1ST ORDER</p>
                <p className="text-[10px] font-bold text-primary mt-2 tracking-wider flex items-center">
                  SIGN UP. LOGIN <ChevronRight size={12} className="ml-0.5" />
                </p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&auto=format&fit=crop&q=60"
                alt="Promo"
                className="w-[72px] h-[72px] object-cover rounded-full shadow-md border-2 border-white"
              />
            </div>

            {/* Primary Navigation Links */}
            <div className="py-2">
              {['HOME', 'CATEGORIES', 'BULK QUERIES', 'ABOUT US'].map((name) => (
                <button
                  key={name}
                  onClick={() => { handleNavClick(name, navigate); setMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-6 py-4 bg-background border-none cursor-pointer hover:bg-muted active:bg-muted transition-colors"
                >
                  <span className="font-bold text-foreground text-[15px] tracking-wide capitalize">{name.toLowerCase()}</span>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </button>
              ))}
            </div>

            <div className="h-2 bg-gray-50 border-y border-gray-100"></div>

            {/* Secondary Navigation Links */}
            <div className="py-2">
              <button onClick={() => {
                setMenuOpen(false);
                if (window.location.pathname !== "/") {
                  navigate("/");
                  setTimeout(() => document.getElementById('best-sellers')?.scrollIntoView({ behavior: "smooth" }), 100);
                } else {
                  document.getElementById('best-sellers')?.scrollIntoView({ behavior: "smooth" });
                }
              }} className="w-full flex items-center px-6 py-3.5 bg-background border-none cursor-pointer hover:bg-muted active:bg-muted text-left">
                <span className="text-muted-foreground text-[14px] font-medium tracking-wide">Best Sellers</span>
                <span className="ml-3 text-[9px] text-primary-foreground font-bold border border-primary px-1.5 py-0.5 rounded-sm bg-primary">NEW</span>
              </button>
              <button onClick={() => {
                setMenuOpen(false);
                if (window.location.pathname !== "/") {
                  navigate("/");
                  setTimeout(() => document.getElementById('curated-looks')?.scrollIntoView({ behavior: "smooth" }), 100);
                } else {
                  document.getElementById('curated-looks')?.scrollIntoView({ behavior: "smooth" });
                }
              }} className="w-full flex items-center px-6 py-3.5 bg-background border-none cursor-pointer hover:bg-muted active:bg-muted text-left">
                <span className="text-muted-foreground text-[14px] font-medium tracking-wide">Trending</span>
                <span className="ml-3 text-[9px] text-primary-foreground font-bold border border-primary px-1.5 py-0.5 rounded-sm bg-primary">NEW</span>
              </button>

              <button onClick={() => {
                setMenuOpen(false);
                if (window.location.pathname !== "/") {
                  navigate("/");
                  setTimeout(() => document.getElementById('new-arrivals')?.scrollIntoView({ behavior: "smooth" }), 100);
                } else {
                  document.getElementById('new-arrivals')?.scrollIntoView({ behavior: "smooth" });
                }
              }} className="w-full flex items-center px-6 py-3.5 bg-background border-none cursor-pointer hover:bg-muted active:bg-muted text-left">
                <span className="text-muted-foreground text-[14px] font-medium tracking-wide">New Arrival</span>
              </button>

              {['Gift Cards', 'Contact Us', 'FAQs', 'Legal'].map((item) => (
                <button
                  key={item}
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center px-6 py-3.5 bg-background border-none cursor-pointer hover:bg-muted active:bg-muted text-left"
                >
                  <span className="text-muted-foreground text-[14px] font-medium tracking-wide">{item}</span>
                </button>
              ))}

              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center px-6 py-3.5 bg-background border-none cursor-pointer hover:bg-muted active:bg-muted text-left decoration-transparent"
              >
                <Instagram size={18} className="text-primary mr-3" />
                <span className="text-muted-foreground text-[14px] font-medium tracking-wide">Follow on Instagram</span>
              </a>
            </div>

            <div className="flex-1"></div>

            {/* Bottom Promotional Banner */}
            <div
              className="bg-accent p-6 mt-4 flex items-center justify-center cursor-pointer border-t border-border/50"
              onClick={() => { handleNavClick('CATEGORIES', navigate); setMenuOpen(false); }}
            >
              <div className="flex flex-col items-center text-center">
                <img src="https://cdn-icons-png.flaticon.com/512/3081/3081559.png" alt="Shop" className="w-8 h-8 mb-2 opacity-60" />
                <h4 className="font-extrabold text-foreground text-[13px] tracking-widest uppercase">Enjoy The Best</h4>
                <h4 className="font-extrabold text-foreground text-[13px] tracking-widest uppercase mt-0.5">Shopping Experience!</h4>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};

export default Header;
