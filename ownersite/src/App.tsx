import { useState, useEffect, useRef } from 'react'
import './App.css'

interface Banner {
  _id: string;
  title: string;
  imageUrl: string;
  mobileImageUrl?: string;
  link: string;
  createdAt: string;
}

interface InstagramPost {
  _id: string;
  imageUrl: string;
  link: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: string;
  image: string;
  gallery: string[];
  sizes: string[];
  details: string;
  category: string[];
  isCuratedLook?: boolean;
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
  image?: string;
  fullImage?: string;
  thumbnailImage?: string;
  description: string;
  slug: string;
  createdAt: string;
}

interface Lead {
  _id: string;
  email: string;
  phone?: string;
  createdAt: string;
}

interface Announcement {
  _id: string;
  text: string;
  createdAt: string;
}

const App = () => {
  const [activeTab, setActiveTab] = useState<'banners' | 'categories' | 'dresses' | 'reels' | 'instagram' | 'leads' | 'orders' | 'announcements'>('banners');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [status, setStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);


  
  // Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    originalPrice: '',
    discount: '',
    image: '',
    gallery: [] as string[],
    sizes: [] as string[],
    details: '',
    category: [] as string[],
    isNewArrival: false,
    isBestSeller: false,
    isCuratedLook: false
  });

  // Category Form State
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    fullImage: '',
    thumbnailImage: ''
  });

  // Reel Form State
  const [reelForm, setReelForm] = useState({
    videoUrl: '',
    productId: '',
    category: ''
  });

  const API_BASE = '';

  const productInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const categoryThumbInputRef = useRef<HTMLInputElement>(null);

  // Status Auto-hide
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Fetch data on load and tab change
  useEffect(() => {
    if (activeTab === 'banners') fetchBanners();
    else if (activeTab === 'categories') fetchCategories();
    else if (activeTab === 'dresses') {
      fetchProducts();
      fetchCategories();
    } else if (activeTab === 'reels') {
      fetchReels();
      fetchProducts();
      fetchCategories();
    } else if (activeTab === 'instagram') {
      fetchInstagramPosts();
    } else if (activeTab === 'leads') {
      fetchLeads();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'announcements') {
      fetchAnnouncements();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/orders`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const showStatus = (message: string, type: 'success' | 'error' = 'success') => {
    setStatus({ message, type });
  };

  const fetchBanners = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/banners`);
      if (response.ok) {
        const data = await response.json();
        setBanners(data);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const fetchProducts = async (category?: string) => {
    try {
      const url = category ? `${API_BASE}/api/products?category=${category}` : `${API_BASE}/api/products`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchReels = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/reels`);
      if (response.ok) {
        const data = await response.json();
        setReels(data);
      }
    } catch (error) {
      console.error('Error fetching reels:', error);
    }
  };

  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);

  const fetchInstagramPosts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/instagram-posts`);
      if (response.ok) {
        const data = await response.json();
        setInstagramPosts(data);
      }
    } catch (error) {
      console.error('Error fetching instagram posts:', error);
    }
  };

  const handleInstagramUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    showStatus('Uploading to Instagram feed...', 'success');

    try {
      const base64 = await optimizeImage(file);
      const response = await fetch(`${API_BASE}/api/add-instagram-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: base64, link: 'https://instagram.com/gridox.clothing' }),
      });

      const data = await response.json();

      if (response.ok) {
        showStatus('Instagram post added!');
        fetchInstagramPosts();
      } else {
        showStatus(`Upload failed: ${data.message || 'Unknown error'}`, 'error');
      }
    } catch (error: any) {
       showStatus(`Connection error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInstagram = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/instagram-posts/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showStatus('Post deleted.');
        fetchInstagramPosts();
      }
    } catch (error) {
      showStatus('Error.', 'error');
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/leads`);
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Mark as verified & remove?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/leads/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showStatus('Lead marked as verified and deleted.');
        fetchLeads();
      }
    } catch (error) {
      showStatus('Error removing lead.', 'error');
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/announcements`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const [announcementText, setAnnouncementText] = useState('');

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/add-announcement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: announcementText }),
      });

      if (response.ok) {
        showStatus('Announcement added!');
        setAnnouncementText('');
        fetchAnnouncements();
      } else {
        showStatus('Failed to add announcement.', 'error');
      }
    } catch (error) {
      showStatus('Connection error.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/announcements/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showStatus('Announcement deleted.');
        fetchAnnouncements();
      }
    } catch (error) {
      showStatus('Error deleting announcement.', 'error');
    }
  };

  const optimizeImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = Math.min(1, maxWidth / img.width);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(e.target?.result as string);
          }
        };
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'imageUrl' | 'mobileImageUrl', id?: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    showStatus(id ? `Updating ${type === 'imageUrl' ? 'Desktop' : 'Mobile'} image...` : 'Uploading new banner...', 'success');

    try {
      const base64 = await optimizeImage(file, type === 'imageUrl' ? 1920 : 1080);
      const url = id ? `${API_BASE}/api/banners/${id}` : `${API_BASE}/api/add-banner`;
      const method = id ? 'PUT' : 'POST';

      const bodyData: any = { title: `Banner - ${file.name}`, [type]: base64, link: '#' };

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        showStatus(id ? 'Updated successfully!' : 'New banner created!');
        fetchBanners();
      } else {
        showStatus('Failed to process banner.', 'error');
      }
    } catch (error) {
      showStatus('Connection error.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const standardizeNewArrival = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const TARGET_W = 1200;
          const TARGET_H = 1600;
          canvas.width = TARGET_W;
          canvas.height = TARGET_H;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, TARGET_W, TARGET_H);
            const imgRatio = img.width / img.height;
            const targetRatio = TARGET_W / TARGET_H;
            let drawW, drawH, offsetLeft, offsetTop;

            if (imgRatio > targetRatio) {
              drawH = TARGET_H;
              drawW = img.width * (TARGET_H / img.height);
              offsetLeft = (TARGET_W - drawW) / 2;
              offsetTop = 0;
            } else {
              drawW = TARGET_W;
              drawH = img.height * (TARGET_W / img.width);
              offsetLeft = 0;
              offsetTop = (TARGET_H - drawH) / 2;
            }

            ctx.drawImage(img, offsetLeft, offsetTop, drawW, drawH);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            resolve(e.target?.result as string);
          }
        };
      };
    });
  };

  const handleProductImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const base64 = await standardizeNewArrival(file);
      setProductForm(prev => ({ ...prev, image: base64 }));
    } catch (error) {
       showStatus('Error processing image.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGalleryImagesSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setIsLoading(true);
    try {
      const processedImages: string[] = [];
      const filesArray = Array.from(files).slice(0, 5);
      for (const file of filesArray) {
        const base64 = await standardizeNewArrival(file);
        processedImages.push(base64);
      }
      setProductForm(prev => ({ ...prev, gallery: processedImages }));
    } catch (error) {
      showStatus('Error processing gallery.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.image || !productForm.name || !productForm.price) {
      showStatus('Please fill name, price and image.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const dataToSend = {
        ...productForm,
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice) || undefined,
      };

      const url = editingId ? `${API_BASE}/api/products/${editingId}` : `${API_BASE}/api/add-product`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        showStatus(editingId ? 'Product updated successfully!' : 'Product added successfully!');
        resetForms();
        fetchProducts();
      } else {
        showStatus('Failed to save product.', 'error');
      }
    } catch (error) {
      showStatus('Server connection error.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = async (product: Product) => {
    setEditingId(product._id);
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/products/${product._id}`);
      if (response.ok) {
        const fullProduct = await response.json();
        setProductForm({
          name: fullProduct.name,
          price: fullProduct.price.toString(),
          originalPrice: fullProduct.originalPrice?.toString() || '',
          discount: fullProduct.discount || '',
          image: fullProduct.image,
          gallery: fullProduct.gallery || [],
          sizes: fullProduct.sizes || [],
          details: fullProduct.details || '',
          category: Array.isArray(fullProduct.category) ? fullProduct.category : (fullProduct.category ? [fullProduct.category] : []),
          isNewArrival: fullProduct.isNewArrival || false,
          isBestSeller: fullProduct.isBestSeller || false,
          isCuratedLook: fullProduct.isCuratedLook || false
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      showStatus('Error loading details.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Permanently delete this product?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showStatus('Product deleted.');
        fetchProducts();
      }
    } catch (error) {
      showStatus('Deletion failed.', 'error');
    }
  };

  const handleCategoryThumbImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const base64 = await optimizeImage(file);
      setCategoryForm(prev => ({ ...prev, thumbnailImage: base64 }));
    } catch (error) {
      showStatus('Error processing thumbnail.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.thumbnailImage || !categoryForm.name) {
      showStatus('Name and image are required.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const url = editingId ? `${API_BASE}/api/categories/${editingId}` : `${API_BASE}/api/add-category`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryForm.name,
          description: categoryForm.description,
          thumbnailImage: categoryForm.thumbnailImage
        }),
      });

      if (response.ok) {
        showStatus(editingId ? 'Category updated!' : 'Category added!');
        resetForms();
        fetchCategories();
      } else {
        showStatus('Save failed.', 'error');
      }
    } catch (error) {
      showStatus('Connection error.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingId(category._id);
    setCategoryForm({
      name: category.name,
      description: category.description,
      fullImage: category.fullImage || '',
      thumbnailImage: category.thumbnailImage || category.image || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/categories/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showStatus('Category removed.');
        fetchCategories();
      }
    } catch (error) {
      showStatus('Error deleting category.', 'error');
    }
  };

  const handleReelVideoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 10MB for Base64 storage)
    if (file.size > 10 * 1024 * 1024) {
      showStatus('Video too large. Please keep under 10MB.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        setReelForm(prev => ({ ...prev, videoUrl: e.target?.result as string }));
        setIsLoading(false);
      };
    } catch (error) {
      showStatus('Error processing video.', 'error');
      setIsLoading(false);
    }
  };

  const handleAddReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reelForm.videoUrl || !reelForm.productId) {
      showStatus('Video and Dress selection are required.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/add-reel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reelForm),
      });

      if (response.ok) {
        showStatus('Reel added successfully!');
        resetForms();
        fetchReels();
      } else {
        showStatus('Failed to save reel.', 'error');
      }
    } catch (error) {
      showStatus('Connection error.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReel = async (id: string) => {
    if (!confirm('Delete this reel?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/reels/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showStatus('Reel deleted.');
        fetchReels();
      }
    } catch (error) {
      showStatus('Error deleting reel.', 'error');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Remove this banner?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/banners/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showStatus('Banner removed.');
        fetchBanners();
      }
    } catch (error) {
      showStatus('Error removing banner.', 'error');
    }
  };

  const resetForms = () => {
    setEditingId(null);
    setProductForm({ 
      name: '', price: '', originalPrice: '', discount: '', image: '', 
      gallery: [], sizes: [], details: '', category: [],
      isNewArrival: false, isBestSeller: false, isCuratedLook: false
    });
    setCategoryForm({ name: '', description: '', fullImage: '', thumbnailImage: '' });
    setReelForm({ videoUrl: '', productId: '', category: '' });
  };

  return (
    <div className="admin-container">
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="logo" style={{fontSize: '18px'}}>GRIDOX</div>
        <button className="menu-toggle" onClick={() => setIsMobileMenuOpen(true)}>
          ☰
        </button>
      </header>

      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${isMobileMenuOpen ? 'show' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div className="logo">
              GRIDOX
              <span>OWNER PORTAL</span>
            </div>
            {isMobileMenuOpen && (
              <button className="menu-toggle" style={{background: 'transparent'}} onClick={() => setIsMobileMenuOpen(false)}>✕</button>
            )}
          </div>
        </div>
        
        <nav className="nav-menu">
          <ul>
            <li className={activeTab === 'banners' ? 'active' : ''} onClick={() => { setActiveTab('banners'); resetForms(); setIsMobileMenuOpen(false); }}>
              <span className="icon">🖼️</span> Banners
            </li>
            <li className={activeTab === 'categories' ? 'active' : ''} onClick={() => { setActiveTab('categories'); resetForms(); setIsMobileMenuOpen(false); }}>
              <span className="icon">📂</span> Categories
            </li>
            <li className={activeTab === 'dresses' ? 'active' : ''} onClick={() => { setActiveTab('dresses'); resetForms(); setIsMobileMenuOpen(false); }}>
              <span className="icon">👗</span> Dresses
            </li>
            <li className={activeTab === 'reels' ? 'active' : ''} onClick={() => { setActiveTab('reels'); resetForms(); setIsMobileMenuOpen(false); }}>
              <span className="icon">🎬</span> Reels
            </li>
            <li className={activeTab === 'instagram' ? 'active' : ''} onClick={() => { setActiveTab('instagram'); resetForms(); setIsMobileMenuOpen(false); }}>
              <span className="icon">📸</span> Instagram
            </li>
            <li className={activeTab === 'leads' ? 'active' : ''} onClick={() => { setActiveTab('leads'); resetForms(); setIsMobileMenuOpen(false); }}>
              <span className="icon">📋</span> Leads
            </li>
            <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => { setActiveTab('orders'); resetForms(); setIsMobileMenuOpen(false); }}>
              <span className="icon">📦</span> Orders
            </li>
            <li className={activeTab === 'announcements' ? 'active' : ''} onClick={() => { setActiveTab('announcements'); resetForms(); setIsMobileMenuOpen(false); }}>
              <span className="icon">📢</span> Announcements
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">👤</div>
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <span style={{fontSize: '13px', fontWeight: '600'}}>Admin Control</span>
              <span style={{fontSize: '10px', color: '#94a3b8'}}>v2.0.4</span>
            </div>
          </div>

        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Page Header */}
        <div className="page-header">
            <div className="page-title">
                <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                <p>Manage your storefront content and inventory.</p>
            </div>
            {isLoading && <div className="spinner"></div>}
        </div>

        {activeTab === 'banners' && (
          <div className="fade-in">
             <div className="content-grid">
                <div className="upload-options-card">
                    <div className="upload-option" onClick={() => {
                       const input = document.createElement('input');
                       input.type = 'file';
                       input.accept = 'image/*';
                       input.onchange = (e) => handleBannerUpload(e as any, 'imageUrl');
                       input.click();
                    }}>
                        <span className="icon">💻</span>
                        <p>New Desktop Banner</p>
                        <span className="size-hint">1920 x 800 px</span>
                    </div>
                    <div className="upload-option mobile" onClick={() => {
                       const input = document.createElement('input');
                       input.type = 'file';
                       input.accept = 'image/*';
                       input.onchange = (e) => handleBannerUpload(e as any, 'mobileImageUrl');
                       input.click();
                    }}>
                        <span className="icon">📱</span>
                        <p>New Mobile Banner</p>
                        <span className="size-hint">1080 x 1440 px</span>
                    </div>
                </div>
                {banners.map(banner => (
                    <div key={banner._id} className="item-card banner-card">
                        <div className="banner-split-view">
                          <div className="view-half">
                            <div className="item-image" style={{backgroundImage: `url("${banner.imageUrl}")`}}></div>
                            <div className="view-label">DESKTOP</div>
                            <button className="change-btn" onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e) => handleBannerUpload(e as any, 'imageUrl', banner._id);
                                input.click();
                            }}>Change</button>
                          </div>
                          <div className="view-half">
                            <div className="item-image mobile" style={{backgroundImage: `url("${banner.mobileImageUrl || banner.imageUrl}")`}}></div>
                            <div className="view-label">MOBILE</div>
                            <button className="change-btn" onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e) => handleBannerUpload(e as any, 'mobileImageUrl', banner._id);
                                input.click();
                            }}>Change</button>
                          </div>
                        </div>
                        <div className="card-actions" style={{marginTop: 'auto', borderTop: '1px solid #f1f5f9'}}>
                            <button className="btn-icon delete" onClick={() => handleDeleteBanner(banner._id)}>Remove Banner</button>
                        </div>
                    </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="fade-in">
            <div className="glass-card">
              <h2 className="form-section-title">{editingId ? 'Edit Category' : 'Create New Category'}</h2>
              <form onSubmit={handleAddCategory}>
                  <div className="form-grid">
                    <div className="upload-zone" onClick={() => categoryThumbInputRef.current?.click()}>
                        {categoryForm.thumbnailImage ? (
                            <img src={categoryForm.thumbnailImage} className="preview-full" alt="Preview" />
                        ) : (
                            <div className="upload-placeholder">
                                <span className="icon">📁</span>
                                <p>Category Image</p>
                                <p className="upload-hint">(Recommended: 600x900 Portrait)</p>
                            </div>
                        )}
                        <input type="file" ref={categoryThumbInputRef} onChange={handleCategoryThumbImageSelect} style={{display:'none'}} accept="image/*" />
                    </div>
                    <div className="form-controls">
                        <div className="form-group">
                            <label>Category Name</label>
                            <input className="input-styled" type="text" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} placeholder="e.g. LUXURY CO-ORDS" required />
                        </div>
                        <div className="form-group">
                            <label>Description (SEO)</label>
                            <textarea className="input-styled" value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} placeholder="Describe this category..." required />
                        </div>
                        <button type="submit" disabled={isLoading} className="primary-btn">
                            {editingId ? 'Update Category' : 'Save Category'}
                        </button>
                        {editingId && <button type="button" onClick={resetForms} className="secondary-btn">Cancel Edit</button>}
                    </div>
                  </div>
              </form>
            </div>

            <div className="content-grid">
                {categories.map(cat => (
                    <div key={cat._id} className="item-card">
                        <div className="item-image" style={{backgroundImage: `url("${cat.thumbnailImage || cat.image}")`}}></div>
                        <div className="item-body">
                            <h3>{cat.name}</h3>
                        </div>
                        <div className="card-actions">
                            <button className="btn-icon edit" onClick={() => handleEditCategory(cat)}>Edit</button>
                            <button className="btn-icon delete" onClick={() => handleDeleteCategory(cat._id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'dresses' && (
          <div className="fade-in">
            <div className="glass-card">
                <h2 className="form-section-title">{editingId ? 'Edit Dress Details' : 'Add New Dress to Collection'}</h2>
                <form onSubmit={handleAddProduct}>
                    <div className="form-grid">
                        <div className="image-side">
                            <div className="upload-zone" onClick={() => productInputRef.current?.click()}>
                                {productForm.image ? (
                                    <img src={productForm.image} className="preview-full" alt="Main" />
                                ) : (
                                    <div className="upload-placeholder">
                                        <span className="icon">📷</span>
                                        <p>Main Portrait Image</p>
                                        <p className="upload-hint">(Ideal: 1200x1600)</p>
                                    </div>
                                )}
                                <input type="file" ref={productInputRef} onChange={handleProductImageSelect} style={{display:'none'}} accept="image/*" />
                            </div>
                            <div className="gallery-row">
                                {[0,1,2,3,4].map(i => (
                                    <div key={i} className="gallery-box">
                                        {productForm.gallery[i] ? <img src={productForm.gallery[i]} /> : '+'}
                                    </div>
                                ))}
                                <button type="button" onClick={() => galleryInputRef.current?.click()} className="mini-btn">Upload Looks</button>
                                <input type="file" ref={galleryInputRef} onChange={handleGalleryImagesSelect} multiple style={{display:'none'}} />
                            </div>
                        </div>

                        <div className="form-side">
                            <div className="form-group">
                                <label>Dress Name</label>
                                <input className="input-styled" type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="Dress name" required />
                            </div>
                            <div className="price-row">
                                <div className="form-group">
                                    <label>Price (Rs.)</label>
                                    <input className="input-styled" type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Old Price</label>
                                    <input className="input-styled" type="number" value={productForm.originalPrice} onChange={e => setProductForm({...productForm, originalPrice: e.target.value})} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Categories</label>
                                <div className="size-pills-container">
                                    {categories.map(c => (
                                        <div key={c._id} className="size-pill">
                                            <input 
                                                type="checkbox" 
                                                id={`cat-${c._id}`}
                                                checked={productForm.category.includes(c.slug)} 
                                                onChange={e => {
                                                    const newCats = e.target.checked 
                                                        ? [...productForm.category, c.slug] 
                                                        : productForm.category.filter(s => s !== c.slug);
                                                    setProductForm({...productForm, category: newCats});
                                                }} 
                                            />
                                            <label htmlFor={`cat-${c._id}`}>{c.name}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Sizes</label>
                                <div className="size-pills-container">
                                    {['XS','S','M','L','XL','XXL','3XL'].map(sz => (
                                        <div key={sz} className="size-pill">
                                            <input 
                                                type="checkbox" 
                                                id={`size-${sz}`}
                                                checked={productForm.sizes.includes(sz)} 
                                                onChange={e => {
                                                    const newSizes = e.target.checked ? [...productForm.sizes, sz] : productForm.sizes.filter(s => s !== sz);
                                                    setProductForm({...productForm, sizes: newSizes});
                                                }} 
                                            />
                                            <label htmlFor={`size-${sz}`}>{sz}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group" style={{marginTop:'25px'}}>
                        <label>Product Details (Rich Text)</label>
                        <textarea className="input-styled" value={productForm.details} onChange={e => setProductForm({...productForm, details: e.target.value})} placeholder="Fabric, fit, care instructions..." />
                    </div>

                    <div className="flags-container">
                        <label className="flag-item">
                            <input type="checkbox" checked={productForm.isNewArrival} onChange={e => setProductForm({...productForm, isNewArrival: e.target.checked})} />
                            New Arrival 🌟
                        </label>
                        <label className="flag-item">
                            <input type="checkbox" checked={productForm.isBestSeller} onChange={e => setProductForm({...productForm, isBestSeller: e.target.checked})} />
                            Best Seller 🔥
                        </label>
                        <label className="flag-item">
                            <input type="checkbox" checked={productForm.isCuratedLook} onChange={e => setProductForm({...productForm, isCuratedLook: e.target.checked})} />
                            Curated Look ✨
                        </label>
                    </div>

                    <button type="submit" disabled={isLoading} className="primary-btn">
                        {editingId ? 'Update Dress' : 'Publish Dress'}
                    </button>
                    {editingId && <button type="button" onClick={resetForms} className="secondary-btn">Cancel Edit</button>}
                </form>
            </div>

            <div className="content-grid">
                {products.map(p => (
                    <div key={p._id} className="item-card">
                        <div className="item-image" style={{backgroundImage: `url("${p.image}")`}}>
                            {p.category && (Array.isArray(p.category) ? p.category[0] : p.category) && (
                                <span className="badge-tag">{Array.isArray(p.category) ? p.category[0] : p.category}</span>
                            )}
                        </div>
                        <div className="item-body">
                            <h3>{p.name}</h3>
                            <div className="item-price">
                                Rs. {p.price} 
                                {p.originalPrice && <span className="old">Rs. {p.originalPrice}</span>}
                            </div>
                        </div>
                        <div className="card-actions">
                            <button className="btn-icon edit" onClick={() => handleEditProduct(p)}>Edit</button>
                            <button className="btn-icon delete" onClick={() => handleDeleteProduct(p._id)}>Remove</button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'reels' && (
          <div className="fade-in">
            <div className="glass-card">
              <h2 className="form-section-title">Upload New Reel</h2>
              <form onSubmit={handleAddReel}>
                <div className="form-grid">
                  <div className="upload-zone" onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'video/mp4,video/quicktime';
                      input.onchange = (e) => handleReelVideoSelect(e as any);
                      input.click();
                  }}>
                    {reelForm.videoUrl ? (
                      <video className="preview-full" src={reelForm.videoUrl} autoPlay loop muted />
                    ) : (
                      <div className="upload-placeholder">
                        <span className="icon">🎥</span>
                        <p>Upload Video (MP4/MOV)</p>
                        <p style={{fontSize: '10px', marginTop: '5px'}}>Max size 10MB</p>
                      </div>
                    )}
                  </div>
                  <div className="form-controls">
                    <div className="form-group">
                      <label>Select Category</label>
                      <select className="select-styled" value={reelForm.category} onChange={e => setReelForm({...reelForm, category: e.target.value, productId: ''})} required>
                        <option value="">Choose category</option>
                        {categories.map(c => <option key={c._id} value={c.slug}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Link Dress</label>
                      <select 
                        className="select-styled" 
                        value={reelForm.productId} 
                        onChange={e => setReelForm({...reelForm, productId: e.target.value})} 
                        required
                      >
                        <option value="">{reelForm.category ? 'Select a dress...' : 'Choose category first'}</option>
                        {products
                          .filter(p => !reelForm.category || (Array.isArray(p.category) ? p.category.includes(reelForm.category) : p.category === reelForm.category))
                          .map(p => <option key={p._id} value={p._id}>{p.name} (Rs. {p.price})</option>)
                        }
                      </select>
                    </div>
                    <button type="submit" disabled={isLoading || !reelForm.videoUrl} className="primary-btn">
                      Publish Reel
                    </button>
                    {reelForm.videoUrl && <button type="button" onClick={resetForms} className="secondary-btn">Clear Form</button>}
                  </div>
                </div>
              </form>
            </div>

            <div className="content-grid">
              {reels.map(reel => (
                <ReelAdminCard key={reel._id} reel={reel} API_BASE={API_BASE} onDelete={() => handleDeleteReel(reel._id)} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'instagram' && (
          <div className="fade-in">
             <div className="content-grid">
                <div className="upload-zone" onClick={() => {
                   const input = document.createElement('input');
                   input.type = 'file';
                   input.accept = 'image/*';
                   input.onchange = (e) => handleInstagramUpload(e as any);
                   input.click();
                }}>
                    <div className="upload-placeholder">
                        <span className="icon">📸</span>
                        <p>Upload Instagram Post</p>
                        <p className="upload-hint">(Ideal: 1080x1080 Square)</p>
                    </div>
                </div>
                {instagramPosts.map(post => (
                    <div key={post._id} className="item-card">
                        <div className="item-image" style={{backgroundImage: `url("${post.imageUrl}")`}}></div>
                        <div className="card-actions">
                            <button className="btn-icon delete" onClick={() => handleDeleteInstagram(post._id)}>Remove</button>
                        </div>
                    </div>
                ))}
              </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="fade-in">
             <div className="glass-card">
                 <h2 className="form-section-title">Customer Leads</h2>
                 <p style={{color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px'}}>
                    Verified customer contacts captured via OTP.
                 </p>
                 <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                    {leads.length === 0 ? (
                        <div style={{textAlign: 'center', padding: '40px', opacity: 0.5}}>
                            <p>No leads captured yet.</p>
                        </div>
                    ) : leads.map(lead => (
                        <div key={lead._id} className="lead-item">
                            <div className="lead-info">
                                <h3>{lead.email}</h3>
                                <p>📞 {lead.phone || 'No phone provided'}</p>
                                <div className="lead-meta">🕒 {new Date(lead.createdAt).toLocaleString()}</div>
                            </div>
                            <button className="primary-btn" style={{width: 'auto', padding: '8px 16px'}} onClick={() => handleDeleteLead(lead._id)}>
                                Mark Verified
                            </button>
                        </div>
                    ))}
                 </div>
             </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="fade-in">
             <div className="glass-card">
                 <h2 className="form-section-title">Customer Orders</h2>
                 <p style={{color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px'}}>
                    Manage all incoming customer orders.
                 </p>
                 <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    {orders.length === 0 ? (
                        <div style={{textAlign: 'center', padding: '40px', opacity: 0.5}}>
                            <p>No orders received yet.</p>
                        </div>
                    ) : orders.map((order: any) => (
                        <div key={order._id} className="lead-item" style={{display: 'block', padding: '20px'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px'}}>
                              <div>
                                <h3 style={{fontSize: '16px', margin: 0}}>Order: {order._id.substring(0, 8).toUpperCase()}</h3>
                                <p style={{color: 'var(--text-muted)', fontSize: '12px'}}>Email: {order.userEmail}</p>
                              </div>
                              <div style={{textAlign: 'right'}}>
                                <h3 style={{fontSize: '18px', color: '#10b981', margin: 0}}>₹{order.totalAmount}</h3>
                                <span style={{display: 'inline-block', background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, marginTop: '4px'}}>
                                  {order.status || 'Pending'}
                                </span>
                              </div>
                            </div>
                            
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                              <div>
                                <h4 style={{fontSize: '13px', color: '#64748b', marginBottom: '6px'}}>Delivery Address</h4>
                                <p style={{fontSize: '14px', margin: 0}}><strong>{order.address?.name}</strong> ({order.address?.phone})</p>
                                <p style={{fontSize: '13px', margin: '4px 0 0 0', color: '#333'}}>{order.address?.addressLine}, {order.address?.pincode}</p>
                              </div>
                              <div>
                                <h4 style={{fontSize: '13px', color: '#64748b', marginBottom: '6px'}}>Items Ordered</h4>
                                <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '13px'}}>
                                  {order.items?.map((item: any, i: number) => (
                                    <li key={i} style={{marginBottom: '4px'}}>
                                      {item.quantity}x {item.name} <span style={{color: '#888'}}>(Size: {item.size})</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <div className="lead-meta" style={{marginTop: '16px', paddingTop: '10px', borderTop: '1px dashed #eee'}}>
                              🕒 {new Date(order.createdAt).toLocaleString()} • Payment: {order.paymentMethod}
                            </div>
                        </div>
                    ))}
                 </div>
             </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="fade-in">
            <div className="glass-card">
              <h2 className="form-section-title">New Announcement</h2>
              <form onSubmit={handleAddAnnouncement}>
                <div className="form-group">
                  <label>Announcement Text</label>
                  <div style={{display: 'flex', gap: '10px'}}>
                    <input 
                      className="input-styled" 
                      type="text" 
                      value={announcementText} 
                      onChange={e => setAnnouncementText(e.target.value)} 
                      placeholder="Enter your announcement text here..." 
                      required 
                    />
                    <button type="submit" disabled={isLoading || !announcementText.trim()} className="primary-btn" style={{width: 'auto', whiteSpace: 'nowrap'}}>
                      Upload
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="glass-card" style={{marginTop: '24px'}}>
              <h2 className="form-section-title">Active Announcements</h2>
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                {announcements.length === 0 ? (
                  <div style={{textAlign: 'center', padding: '20px', opacity: 0.5}}>
                    <p>No active announcements.</p>
                  </div>
                ) : announcements.map(a => (
                  <div key={a._id} className="lead-item">
                    <div className="lead-info">
                      <h3 style={{fontSize: '15px'}}>{a.text}</h3>
                      <div className="lead-meta">🕒 {new Date(a.createdAt).toLocaleString()}</div>
                    </div>
                    <button className="btn-icon delete" onClick={() => handleDeleteAnnouncement(a._id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Status Toast */}
        {status && (
          <div className={`status-toast ${status.type}`}>
            {status.type === 'success' ? '✅' : '❌'} {status.message}
          </div>
        )}
      </main>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
    </div>
  )
}

// Sub-component for lazy loading video in Admin Card
function ReelAdminCard({ reel, API_BASE, onDelete }: any) {
    const [videoSrc, setVideoSrc] = useState<string | null>(null);

    useEffect(() => {
        if (reel.videoUrl) {
            setVideoSrc(reel.videoUrl);
            return;
        }
        const load = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/reels/video/${reel._id}`);
                if (res.ok) {
                    const data = await res.json();
                    setVideoSrc(data.url);
                }
            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, [reel._id]);

    return (
        <div className="item-card">
            <div className="item-image" style={{padding: 0}}>
                {videoSrc ? (
                    <video src={videoSrc} style={{width: '100%', height: '100%', objectFit: 'cover'}} muted loop onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => e.currentTarget.pause()} />
                ) : (
                    <div className="spinner" style={{marginTop: '40%'}}></div>
                )}
            </div>
            <div className="item-body">
                <h3>{reel.productId?.name || 'Unknown Dress'}</h3>
                <p style={{fontSize: '11px', color: '#64748b'}}>Category: {reel.category}</p>
            </div>
            <div className="card-actions">
                <button className="btn-icon delete" onClick={onDelete}>Remove</button>
            </div>
        </div>
    );
}

export default App
