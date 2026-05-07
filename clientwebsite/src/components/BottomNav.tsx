import { Home, Menu, Search, MapPin, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SearchModal from "./SearchModal";

const BottomNav = () => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  const items = [
    { icon: Home,         label: "HOME",    path: "/" },
    { icon: Menu,         label: "MENU",    onClick: () => window.dispatchEvent(new Event('openMobileMenu')) },
    { icon: Search,       label: "SEARCH",  onClick: () => setSearchOpen(true) },
    { icon: MapPin,       label: "ADDRESS", path: "/store-locator" },
    { icon: ShoppingCart, label: "CART",    path: "/cart" },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-[1001] px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center py-3">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.path) navigate(item.path);
                if (item.onClick) item.onClick();
              }}
              className="flex flex-col items-center gap-1.5 text-foreground hover:text-primary active:scale-90 transition-all bg-transparent border-none cursor-pointer flex-1"
            >
              <item.icon size={20} strokeWidth={1.5} />
              <span className="text-[9px] font-bold tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default BottomNav;
