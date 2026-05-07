import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const saved = localStorage.getItem("gridox_recent_searches");
      if (saved) {
        try { setRecentSearches(JSON.parse(saved)); } catch (e) {}
      }
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  useEffect(() => {
    const searchProducts = async () => {
      if (!query.trim()) {
        setProducts([]);
        return;
      }
      try {
        const res = await fetch(`/api/products`);
        if (res.ok) {
          const data = await res.json();
          const filtered = data.filter((p: any) => p.name.toLowerCase().includes(query.toLowerCase()));
          setProducts(filtered.slice(0, 4));
        }
      } catch (err) {}
    };
    
    const timeout = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleProductClick = (id: string, slug: string) => {
    onClose();
    navigate(`/category/${slug}/product/${id}`);
    
    if (query.trim()) {
      const newRecent = [query.trim(), ...recentSearches.filter(s => s !== query.trim())].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem("gridox_recent_searches", JSON.stringify(newRecent));
    }
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-border/20">
        <div className="p-6 border-b border-border/20 flex items-center justify-between">
          <div className="relative flex-1 mr-4">
            <input 
              autoFocus
              type="text" 
              placeholder="Search..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border-b border-border/30 py-2 outline-none text-lg bg-transparent placeholder:text-muted-foreground/60 font-body font-medium pb-2 focus:border-primary transition-colors text-foreground"
            />
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-primary transition-colors">
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {query.trim() && products.length > 0 && (
            <div className="mb-8">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Products</p>
              <div className="grid grid-cols-2 gap-4">
                {products.map(p => (
                  <div key={p._id} onClick={() => handleProductClick(p._id, p.category || 'all')} className="cursor-pointer group">
                    <div className="aspect-[3/4] bg-gray-50 mb-2 overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <h4 className="text-sm font-heading font-medium text-foreground leading-tight group-hover:text-primary transition-colors">{p.name}</h4>
                    <p className="text-xs text-primary/70 font-body mt-1">₹{p.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!query.trim() && (
            <div className="space-y-8">
              {recentSearches.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-8">Your Recent Searches</p>
                  <div className="flex flex-col gap-4">
                    {recentSearches.map((term, i) => (
                      <button key={i} onClick={() => handleRecentClick(term)} className="text-left text-sm font-medium text-gray-800 hover:text-[#8b231a]">
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-8 mt-8 opacity-80">Popular Searches</p>
                  <div className="flex flex-col gap-4">
                      <button onClick={() => handleRecentClick("dresses")} className="text-left text-sm font-body font-medium text-foreground/80 hover:text-primary transition-colors">dresses</button>
                      <button onClick={() => handleRecentClick("shirt")} className="text-left text-sm font-body font-medium text-foreground/80 hover:text-primary transition-colors">shirt</button>
                      <button onClick={() => handleRecentClick("jumpsuit")} className="text-left text-sm font-body font-medium text-foreground/80 hover:text-primary transition-colors">jumpsuit</button>
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
