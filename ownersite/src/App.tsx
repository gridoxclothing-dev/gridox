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
  sizesWithStock?: { size: string; quantity: number }[];
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

interface Coupon {
  _id: string;
  couponCode: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate: string;
  minimumPurchase: number;
  usageLimit: number | null;
  usedCount: number;
  activeStatus: boolean;
  applicableProducts: { _id: string, name: string }[];
  createdAt: string;
}

const App = () => {
  const [activeTab, setActiveTab] = useState<'banners' | 'categories' | 'dresses' | 'reels' | 'instagram' | 'leads' | 'orders' | 'completed_orders' | 'cancelled_orders' | 'announcements' | 'coupons'>('banners');
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
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStockProductId, setEditingStockProductId] = useState<string | null>(null);
  const [tempStock, setTempStock] = useState<{ size: string; quantity: number }[]>([]);

  const handleSaveInlineStock = async (productId: string) => {
    try {
      setIsLoading(true);
      // Filter out sizes that are checked (quantity > 0 or present in tempStock)
      const newSizes = tempStock.map(s => s.size);

      const res = await fetch(`${API_BASE}/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sizes: newSizes,
          sizesWithStock: tempStock
        })
      });

      if (res.ok) {
        showStatus('Stock updated successfully!');
        setEditingStockProductId(null);
        fetchProducts(); // Refresh list to get new stock
      } else {
        showStatus('Failed to update stock', 'error');
      }
    } catch (err) {
      showStatus('Error saving stock', 'error');
    } finally {
      setIsLoading(false);
    }
  };



  // Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    originalPrice: '',
    discount: '',
    image: '',
    gallery: [] as string[],
    sizes: [] as string[],
    sizesWithStock: [] as { size: string; quantity: number }[],
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

  // Coupon Form State
  const [couponForm, setCouponForm] = useState({
    couponCode: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    expiryDate: '',
    minimumPurchase: '0',
    usageLimit: '',
    activeStatus: true,
    applicableProducts: [] as string[]
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
    } else if (activeTab === 'coupons') {
      fetchCoupons();
      fetchProducts(); // needed for selecting applicable products
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

  const handleUpdateOrderDate = async (orderId: string, milestone: string, dateStr: string) => {
    // Optimistic update locally to prevent focus loss!
    setOrders(prevOrders => prevOrders.map(o =>
      o._id === orderId
        ? { ...o, statusDates: { ...(o.statusDates || {}), [milestone]: dateStr } }
        : o
    ));

    // Only save when the date is fully cleared OR contains a completed 4-digit year (between 2020 and 2100)
    const isComplete = !dateStr || (() => {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return false;
      const year = parseInt(parts[0], 10);
      return year >= 2020 && year <= 2100;
    })();

    if (!isComplete) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statusDates: {
            [milestone]: dateStr
          }
        })
      });
      if (res.ok) {
        showStatus('Order milestone date saved!');
        // Do NOT call fetchOrders() here. 
        // Calling it recreates the array and steals focus from the input while typing!
      } else {
        showStatus('Failed to update milestone date', 'error');
        fetchOrders(); // Revert to DB state on failure
      }
    } catch (err) {
      showStatus('Error updating milestone date', 'error');
      fetchOrders(); // Revert on failure
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

  const fetchCoupons = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/coupons`);
      if (response.ok) {
        const data = await response.json();
        setCoupons(data);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const dataToSend = {
        ...couponForm,
        discountValue: Number(couponForm.discountValue),
        minimumPurchase: Number(couponForm.minimumPurchase) || 0,
        usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : null
      };

      const url = editingId ? `${API_BASE}/api/admin/coupons/${editingId}` : `${API_BASE}/api/admin/coupons`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        showStatus(editingId ? 'Coupon updated!' : 'Coupon added!');
        resetForms();
        fetchCoupons();
      } else {
        const errData = await response.json();
        showStatus(errData.message || 'Failed to save coupon', 'error');
      }
    } catch (error) {
      showStatus('Connection error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingId(coupon._id);
    setCouponForm({
      couponCode: coupon.couponCode,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
      minimumPurchase: coupon.minimumPurchase.toString(),
      usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : '',
      activeStatus: coupon.activeStatus,
      applicableProducts: coupon.applicableProducts.map(p => p._id)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showStatus('Coupon removed.');
        fetchCoupons();
      }
    } catch (error) {
      showStatus('Error deleting coupon.', 'error');
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
          sizesWithStock: fullProduct.sizesWithStock || (fullProduct.sizes || []).map((sz: string) => ({ size: sz, quantity: 10 })),
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
      gallery: [], sizes: [], sizesWithStock: [], details: '', category: [],
      isNewArrival: false, isBestSeller: false, isCuratedLook: false
    });
    setCategoryForm({ name: '', description: '', fullImage: '', thumbnailImage: '' });
    setReelForm({ videoUrl: '', productId: '', category: '' });
    setCouponForm({
      couponCode: '', discountType: 'percentage', discountValue: '', expiryDate: '',
      minimumPurchase: '0', usageLimit: '', activeStatus: true, applicableProducts: []
    });
  };

  return (
    <div className="admin-container">
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="logo" style={{ fontSize: '18px' }}>GRIDOX</div>
        <button className="menu-toggle" onClick={() => setIsMobileMenuOpen(true)}>
          ☰
        </button>
      </header>

      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${isMobileMenuOpen ? 'show' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="logo">
              GRIDOX
              <span>OWNER PORTAL</span>
            </div>
            {isMobileMenuOpen && (
              <button className="menu-toggle" style={{ background: 'transparent' }} onClick={() => setIsMobileMenuOpen(false)}>✕</button>
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
            <li className={activeTab === 'coupons' ? 'active' : ''} onClick={() => { setActiveTab('coupons'); resetForms(); setIsMobileMenuOpen(false); }}>
              <span className="icon">🎟️</span> Coupons
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
            <li className={activeTab === 'completed_orders' ? 'active' : ''} onClick={() => { setActiveTab('completed_orders'); resetForms(); setIsMobileMenuOpen(false); }}>
              <span className="icon">✅</span> Completed Orders
            </li>
            <li className={activeTab === 'cancelled_orders' ? 'active' : ''} onClick={() => { setActiveTab('cancelled_orders'); resetForms(); setIsMobileMenuOpen(false); }}>
              <span className="icon">❌</span> Cancelled Orders
            </li>
            <li className={activeTab === 'announcements' ? 'active' : ''} onClick={() => { setActiveTab('announcements'); resetForms(); setIsMobileMenuOpen(false); }}>
              <span className="icon">📢</span> Announcements
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">👤</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Admin Control</span>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>v2.0.4</span>
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
                      <div className="item-image" style={{ backgroundImage: `url("${banner.imageUrl}")` }}></div>
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
                      <div className="item-image mobile" style={{ backgroundImage: `url("${banner.mobileImageUrl || banner.imageUrl}")` }}></div>
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
                  <div className="card-actions" style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9' }}>
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
                    <input type="file" ref={categoryThumbInputRef} onChange={handleCategoryThumbImageSelect} style={{ display: 'none' }} accept="image/*" />
                  </div>
                  <div className="form-controls">
                    <div className="form-group">
                      <label>Category Name</label>
                      <input className="input-styled" type="text" value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="e.g. LUXURY CO-ORDS" required />
                    </div>
                    <div className="form-group">
                      <label>Description (SEO)</label>
                      <textarea className="input-styled" value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} placeholder="Describe this category..." required />
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
                  <div className="item-image" style={{ backgroundImage: `url("${cat.thumbnailImage || cat.image}")` }}></div>
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
                      <input type="file" ref={productInputRef} onChange={handleProductImageSelect} style={{ display: 'none' }} accept="image/*" />
                    </div>
                    <div className="gallery-row">
                      {[0, 1, 2, 3, 4].map(i => (
                        <div key={i} className="gallery-box">
                          {productForm.gallery[i] ? <img src={productForm.gallery[i]} /> : '+'}
                        </div>
                      ))}
                      <button type="button" onClick={() => galleryInputRef.current?.click()} className="mini-btn">Upload Looks</button>
                      <input type="file" ref={galleryInputRef} onChange={handleGalleryImagesSelect} multiple style={{ display: 'none' }} />
                    </div>
                  </div>

                  <div className="form-side">
                    <div className="form-group">
                      <label>Dress Name</label>
                      <input className="input-styled" type="text" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} placeholder="Dress name" required />
                    </div>
                    <div className="price-row">
                      <div className="form-group">
                        <label>Price (Rs.)</label>
                        <input className="input-styled" type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label>Old Price</label>
                        <input className="input-styled" type="number" value={productForm.originalPrice} onChange={e => setProductForm({ ...productForm, originalPrice: e.target.value })} />
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
                                setProductForm({ ...productForm, category: newCats });
                              }}
                            />
                            <label htmlFor={`cat-${c._id}`}>{c.name}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Sizes & Stock Quantity</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map(sz => {
                          const stockObj = productForm.sizesWithStock.find(item => item.size === sz);
                          const isChecked = !!stockObj;
                          const quantity = stockObj ? stockObj.quantity : 0;
                          return (
                            <div key={sz} style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="checkbox"
                                  id={`size-${sz}`}
                                  checked={isChecked}
                                  onChange={e => {
                                    let newSizesWithStock = [...productForm.sizesWithStock];
                                    let newSizes = [...productForm.sizes];
                                    if (e.target.checked) {
                                      if (!newSizesWithStock.some(item => item.size === sz)) {
                                        newSizesWithStock.push({ size: sz, quantity: 10 }); // default to 10
                                      }
                                      if (!newSizes.includes(sz)) {
                                        newSizes.push(sz);
                                      }
                                    } else {
                                      newSizesWithStock = newSizesWithStock.filter(item => item.size !== sz);
                                      newSizes = newSizes.filter(s => s !== sz);
                                    }
                                    setProductForm({ ...productForm, sizes: newSizes, sizesWithStock: newSizesWithStock });
                                  }}
                                  style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                                />
                                <label htmlFor={`size-${sz}`} style={{ fontSize: '13px', fontWeight: 600, margin: 0, textTransform: 'none', letterSpacing: 'normal', cursor: 'pointer', color: '#1e293b' }}>{sz}</label>
                              </div>
                              {isChecked && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ fontSize: '10px', color: '#64748b' }}>Stock:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={quantity}
                                    onChange={e => {
                                      const qty = parseInt(e.target.value) || 0;
                                      const newSizesWithStock = productForm.sizesWithStock.map(item =>
                                        item.size === sz ? { ...item, quantity: qty } : item
                                      );
                                      setProductForm({ ...productForm, sizesWithStock: newSizesWithStock });
                                    }}
                                    style={{
                                      width: '60px',
                                      padding: '2px 4px',
                                      border: '1px solid var(--border)',
                                      borderRadius: '4px',
                                      fontSize: '12px',
                                      textAlign: 'center'
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '25px' }}>
                  <label>Product Details (Rich Text)</label>
                  <textarea className="input-styled" value={productForm.details} onChange={e => setProductForm({ ...productForm, details: e.target.value })} placeholder="Fabric, fit, care instructions..." />
                </div>

                <div className="flags-container">
                  <label className="flag-item">
                    <input type="checkbox" checked={productForm.isNewArrival} onChange={e => setProductForm({ ...productForm, isNewArrival: e.target.checked })} />
                    New Arrival 🌟
                  </label>
                  <label className="flag-item">
                    <input type="checkbox" checked={productForm.isBestSeller} onChange={e => setProductForm({ ...productForm, isBestSeller: e.target.checked })} />
                    Best Seller 🔥
                  </label>
                  <label className="flag-item">
                    <input type="checkbox" checked={productForm.isCuratedLook} onChange={e => setProductForm({ ...productForm, isCuratedLook: e.target.checked })} />
                    Curated Look ✨
                  </label>
                </div>

                <button type="submit" disabled={isLoading} className="primary-btn">
                  {editingId ? 'Update Dress' : 'Publish Dress'}
                </button>
                {editingId && <button type="button" onClick={resetForms} className="secondary-btn">Cancel Edit</button>}
              </form>
            </div>

            <div className="content-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {products.map(p => {
                const isEditingStock = editingStockProductId === p._id;

                return (
                  <div key={p._id} className="item-card" style={{ paddingBottom: '12px' }}>
                    <div className="item-image" style={{ backgroundImage: `url("${p.image}")` }}>
                      {p.category && (Array.isArray(p.category) ? p.category[0] : p.category) && (
                        <span className="badge-tag">{Array.isArray(p.category) ? p.category[0] : p.category}</span>
                      )}
                    </div>
                    <div className="item-body" style={{ flexGrow: 1 }}>
                      <h3>{p.name}</h3>
                      <div className="item-price">
                        Rs. {p.price}
                        {p.originalPrice && <span className="old">Rs. {p.originalPrice}</span>}
                      </div>

                      {/* Stock Details Panel */}
                      <div style={{ marginTop: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Sizes & Stock Quantity
                          </span>
                        </div>

                        {isEditingStock ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map(sz => {
                              const matchObj = tempStock.find(s => s.size === sz);
                              const isActive = !!matchObj;
                              const quantity = matchObj ? matchObj.quantity : 0;

                              return (
                                <div key={sz} style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                  <label style={{ fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', margin: 0 }}>
                                    <input
                                      type="checkbox"
                                      checked={isActive}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setTempStock(prev => [...prev, { size: sz, quantity: 10 }]);
                                        } else {
                                          setTempStock(prev => prev.filter(s => s.size !== sz));
                                        }
                                      }}
                                    />
                                    {sz}
                                  </label>
                                  {isActive && (
                                    <input
                                      type="number"
                                      min="0"
                                      value={quantity}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value, 10) || 0;
                                        setTempStock(prev => prev.map(s => s.size === sz ? { ...s, quantity: val } : s));
                                      }}
                                      style={{ width: '45px', fontSize: '11px', padding: '2px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center', color: '#0f172a', background: '#ffffff', backgroundColor: '#ffffff' }}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map(sz => {
                              const stockObj = p.sizesWithStock?.find((s: any) => s.size === sz);
                              const hasSize = p.sizes?.includes(sz) || !!stockObj;
                              const quantity = stockObj ? stockObj.quantity : 0;

                              return (
                                <span
                                  key={sz}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '3px 6px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    background: hasSize ? (quantity <= 5 ? '#fef2f2' : '#f0fdf4') : '#f8fafc',
                                    color: hasSize ? (quantity <= 5 ? '#ef4444' : '#166534') : '#94a3b8',
                                    border: `1px solid ${hasSize ? (quantity <= 5 ? '#fee2e2' : '#bbf7d0') : '#e2e8f0'}`
                                  }}
                                >
                                  {sz}: {hasSize ? quantity : '-'}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="card-actions" style={{ display: 'flex', gap: '6px', padding: '12px 16px 4px 16px', borderTop: '1px solid #f1f5f9' }}>
                      {isEditingStock ? (
                        <>
                          <button
                            className="btn-icon edit"
                            style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', flex: 1 }}
                            onClick={() => handleSaveInlineStock(p._id)}
                          >
                            Save Stock
                          </button>
                          <button
                            className="btn-icon delete"
                            style={{ background: '#64748b', color: '#fff', border: 'none', borderRadius: '6px', flex: 1 }}
                            onClick={() => setEditingStockProductId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-icon edit"
                            onClick={() => {
                              setEditingStockProductId(p._id);
                              setTempStock(p.sizesWithStock || []);
                            }}
                            style={{ background: '#0f172a', color: '#fff' }}
                          >
                            ✏️ Stock
                          </button>
                          <button className="btn-icon edit" onClick={() => handleEditProduct(p)}>Edit</button>
                          <button className="btn-icon delete" onClick={() => handleDeleteProduct(p._id)}>Remove</button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="fade-in">
            <div className="glass-card">
              <h2 className="form-section-title">{editingId ? 'Edit Coupon' : 'Create New Coupon'}</h2>
              <form onSubmit={handleAddCoupon}>
                <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="form-controls">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div className="form-group">
                        <label>Coupon Code</label>
                        <input className="input-styled" type="text" value={couponForm.couponCode} onChange={e => setCouponForm({ ...couponForm, couponCode: e.target.value.toUpperCase() })} placeholder="e.g. SAVE20" required />
                      </div>
                      <div className="form-group">
                        <label>Expiry Date</label>
                        <input className="input-styled" type="date" value={couponForm.expiryDate} onChange={e => setCouponForm({ ...couponForm, expiryDate: e.target.value })} required />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div className="form-group">
                        <label>Discount Type</label>
                        <select className="select-styled" value={couponForm.discountType} onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value as 'percentage' | 'fixed' })}>
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (₹)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Discount Value</label>
                        <input className="input-styled" type="number" min="0" value={couponForm.discountValue} onChange={e => setCouponForm({ ...couponForm, discountValue: e.target.value })} placeholder={couponForm.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'} required />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div className="form-group">
                        <label>Minimum Purchase (Optional)</label>
                        <input className="input-styled" type="number" min="0" value={couponForm.minimumPurchase} onChange={e => setCouponForm({ ...couponForm, minimumPurchase: e.target.value })} placeholder="e.g. 1500" />
                      </div>
                      <div className="form-group">
                        <label>Total Usage Limit (Optional)</label>
                        <input className="input-styled" type="number" min="1" value={couponForm.usageLimit} onChange={e => setCouponForm({ ...couponForm, usageLimit: e.target.value })} placeholder="e.g. 100 uses" />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Applicable Products (Leave empty for all products)</label>
                      <div className="size-pills-container" style={{ maxHeight: '200px', overflowY: 'auto', padding: '10px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                        {products.map(p => (
                          <div key={p._id} className="size-pill">
                            <input
                              type="checkbox"
                              id={`prod-${p._id}`}
                              checked={couponForm.applicableProducts.includes(p._id)}
                              onChange={e => {
                                const newProds = e.target.checked
                                  ? [...couponForm.applicableProducts, p._id]
                                  : couponForm.applicableProducts.filter(id => id !== p._id);
                                setCouponForm({ ...couponForm, applicableProducts: newProds });
                              }}
                            />
                            <label htmlFor={`prod-${p._id}`}>{p.name} (₹{p.price})</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                      <input 
                        type="checkbox" 
                        id="activeStatus" 
                        checked={couponForm.activeStatus} 
                        onChange={e => setCouponForm({ ...couponForm, activeStatus: e.target.checked })} 
                        style={{ width: '18px', height: '18px' }}
                      />
                      <label htmlFor="activeStatus" style={{ margin: 0, cursor: 'pointer' }}>Coupon is Active</label>
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                      <button type="submit" disabled={isLoading} className="primary-btn" style={{ flex: 1 }}>
                        {editingId ? 'Update Coupon' : 'Create Coupon'}
                      </button>
                      {editingId && <button type="button" onClick={resetForms} className="secondary-btn" style={{ flex: 1 }}>Cancel Edit</button>}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="content-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {coupons.map(coupon => (
                <div key={coupon._id} className="item-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '2px dashed #cbd5e1' }}>
                      <h3 style={{ margin: 0, letterSpacing: '2px', color: '#0f172a', fontWeight: 'bold' }}>{coupon.couponCode}</h3>
                    </div>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '11px', 
                      fontWeight: 'bold', 
                      background: coupon.activeStatus ? '#dcfce7' : '#fee2e2', 
                      color: coupon.activeStatus ? '#166534' : '#991b1b' 
                    }}>
                      {coupon.activeStatus ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <div style={{ fontSize: '14px', marginBottom: '15px' }}>
                    <p style={{ margin: '0 0 5px 0' }}><strong>Discount:</strong> {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</p>
                    <p style={{ margin: '0 0 5px 0' }}><strong>Valid Until:</strong> {new Date(coupon.expiryDate).toLocaleDateString()}</p>
                    <p style={{ margin: '0 0 5px 0' }}><strong>Usage:</strong> {coupon.usedCount} / {coupon.usageLimit || '∞'}</p>
                    {coupon.minimumPurchase > 0 && <p style={{ margin: '0 0 5px 0' }}><strong>Min. Purchase:</strong> ₹{coupon.minimumPurchase}</p>}
                  </div>

                  {coupon.applicableProducts && coupon.applicableProducts.length > 0 && (
                    <div style={{ marginTop: 'auto', marginBottom: '15px', background: '#f1f5f9', padding: '10px', borderRadius: '6px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#64748b' }}>APPLICABLE TO ({coupon.applicableProducts.length} PRODUCTS):</p>
                      <p style={{ fontSize: '12px', margin: 0, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {coupon.applicableProducts.map(p => p.name).join(', ')}
                      </p>
                    </div>
                  )}

                  <div className="card-actions" style={{ display: 'flex', gap: '10px', marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                    <button className="btn-icon edit" onClick={() => handleEditCoupon(coupon)} style={{ flex: 1 }}>Edit</button>
                    <button className="btn-icon delete" onClick={() => handleDeleteCoupon(coupon._id)} style={{ flex: 1 }}>Delete</button>
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
                        <p style={{ fontSize: '10px', marginTop: '5px' }}>Max size 10MB</p>
                      </div>
                    )}
                  </div>
                  <div className="form-controls">
                    <div className="form-group">
                      <label>Select Category</label>
                      <select className="select-styled" value={reelForm.category} onChange={e => setReelForm({ ...reelForm, category: e.target.value, productId: '' })} required>
                        <option value="">Choose category</option>
                        {categories.map(c => <option key={c._id} value={c.slug}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Link Dress</label>
                      <select
                        className="select-styled"
                        value={reelForm.productId}
                        onChange={e => setReelForm({ ...reelForm, productId: e.target.value })}
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
                  <div className="item-image" style={{ backgroundImage: `url("${post.imageUrl}")` }}></div>
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
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                Verified customer contacts captured via OTP.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {leads.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                    <p>No leads captured yet.</p>
                  </div>
                ) : leads.map(lead => (
                  <div key={lead._id} className="lead-item">
                    <div className="lead-info">
                      <h3>{lead.email}</h3>
                      <p>📞 {lead.phone || 'No phone provided'}</p>
                      <div className="lead-meta">🕒 {new Date(lead.createdAt).toLocaleString()}</div>
                    </div>
                    <button className="primary-btn" style={{ width: 'auto', padding: '8px 16px' }} onClick={() => handleDeleteLead(lead._id)}>
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
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                Manage all incoming customer orders.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.filter((o: any) => o.status !== 'Cancelled' && o.status !== 'Completed').length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                    <p>No active orders.</p>
                  </div>
                ) : orders.filter((o: any) => o.status !== 'Cancelled' && o.status !== 'Completed').map((order: any) => (
                  <div key={order._id} className="lead-item" style={{ display: 'block', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', margin: 0 }}>Order: {order._id.substring(0, 8).toUpperCase()}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Email: {order.userEmail}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <h3 style={{ fontSize: '18px', color: '#10b981', margin: 0 }}>₹{order.totalAmount}</h3>

                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>UPDATE STATUS</label>
                          <select
                            value={order.status || 'Pending'}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              try {
                                setIsLoading(true);
                                const res = await fetch(`${API_BASE}/api/admin/orders/${order._id}/status`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: newStatus })
                                });
                                if (res.ok) {
                                  showStatus('Order status updated successfully!');
                                  fetchOrders();
                                } else {
                                  showStatus('Failed to update status', 'error');
                                }
                              } catch (err) {
                                showStatus('Error updating status', 'error');
                              } finally {
                                setIsLoading(false);
                              }
                            }}
                            style={{
                              background: order.status === 'Cancelled' ? '#fee2e2' : (order.status === 'Pending' || !order.status) ? '#fef3c7' : '#d1fae5',
                              color: order.status === 'Cancelled' ? '#991b1b' : (order.status === 'Pending' || !order.status) ? '#d97706' : '#065f46',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                              marginTop: '4px',
                              border: `1px solid ${order.status === 'Cancelled' ? '#fca5a5' : (order.status === 'Pending' || !order.status) ? '#d97706' : '#34d399'}`,
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            {['Pending', 'Payment Verified', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].map(status => {
                              const statuses = ['Pending', 'Payment Verified', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
                              const currentIndex = statuses.indexOf(order.status || 'Pending');
                              const itemIndex = statuses.indexOf(status);

                              // If it's the current status or a previous status, color it red.
                              // The user requested: "upto packed every text need to be red"
                              const isPastOrCurrent = itemIndex <= currentIndex && currentIndex !== -1;

                              return (
                                <option
                                  key={status}
                                  value={status}
                                  style={{ color: isPastOrCurrent ? '#ef4444' : '#0f172a', fontWeight: isPastOrCurrent ? 'bold' : 'normal' }}
                                >
                                  {isPastOrCurrent ? `✓ ${status}` : status}
                                </option>
                              );
                            })}
                            <option value="Cancelled" style={{ color: '#ef4444', fontWeight: 'bold' }}>Cancelled</option>
                          </select>
                          
                          {order.status === 'Delivered' && (
                            <button
                              onClick={async () => {
                                try {
                                  setIsLoading(true);
                                  const res = await fetch(`${API_BASE}/api/admin/orders/${order._id}/status`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'Completed' })
                                  });
                                  if (res.ok) {
                                    showStatus('Order moved to Completed Orders!');
                                    fetchOrders();
                                  } else {
                                    showStatus('Failed to update status', 'error');
                                  }
                                } catch (err) {
                                  showStatus('Error updating status', 'error');
                                } finally {
                                  setIsLoading(false);
                                }
                              }}
                              style={{
                                marginTop: '8px',
                                padding: '6px 12px',
                                background: '#10b981',
                                color: '#fff',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              Mark as Completed
                            </button>
                          )}
                        </div>

                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>EXPECTED DELIVERY</label>
                          <input
                            type="date"
                            value={order.expectedDeliveryDate || ''}
                            onChange={async (e) => {
                              const newDate = e.target.value;

                              // Optimistically update local state to feel responsive and avoid focus theft
                              setOrders(prevOrders => prevOrders.map(o =>
                                o._id === order._id ? { ...o, expectedDeliveryDate: newDate } : o
                              ));

                              // Only save when the date is fully cleared OR contains a completed 4-digit year (between 2020 and 2100)
                              const isComplete = !newDate || (() => {
                                const parts = newDate.split('-');
                                if (parts.length !== 3) return false;
                                const year = parseInt(parts[0], 10);
                                return year >= 2020 && year <= 2100;
                              })();

                              if (!isComplete) return;

                              try {
                                const res = await fetch(`${API_BASE}/api/admin/orders/${order._id}/status`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ expectedDeliveryDate: newDate })
                                });
                                if (res.ok) {
                                  showStatus('Expected delivery date updated!');
                                } else {
                                  showStatus('Failed to update expected delivery date', 'error');
                                  fetchOrders(); // Revert to database state on failure
                                }
                              } catch (err) {
                                showStatus('Error updating expected delivery date', 'error');
                                fetchOrders();
                              }
                            }}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              border: '1px solid #ddd',
                              background: '#fff',
                              cursor: 'pointer',
                              outline: 'none',
                              color: '#333'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <h4 style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>Delivery Address</h4>
                        <p style={{ fontSize: '14px', margin: 0 }}><strong>{order.address?.name}</strong> ({order.address?.phone})</p>
                        <p style={{ fontSize: '13px', margin: '4px 0 0 0', color: '#333' }}>{order.address?.addressLine}, {order.address?.pincode}</p>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>Items Ordered</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
                          {order.items?.map((item: any, i: number) => (
                            <li key={i} style={{ marginBottom: '4px' }}>
                              {item.quantity}x {item.name} <span style={{ color: '#888' }}>(Size: {item.size})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #eee' }}>
                      <h4 style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px', fontWeight: 600 }}>Tracking Milestone Dates</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Order Placed</label>
                          <input
                            type="date"
                            value={order.statusDates?.placed || ''}
                            onChange={(e) => handleUpdateOrderDate(order._id, 'placed', e.target.value)}
                            style={{
                              padding: '6px 10px',
                              fontSize: '12px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              background: '#fff',
                              color: '#0f172a',
                              width: '100%',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Payment Verified</label>
                          <input
                            type="date"
                            value={order.statusDates?.paymentVerified || ''}
                            onChange={(e) => handleUpdateOrderDate(order._id, 'paymentVerified', e.target.value)}
                            style={{
                              padding: '6px 10px',
                              fontSize: '12px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              background: '#fff',
                              color: '#0f172a',
                              width: '100%',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Packed</label>
                          <input
                            type="date"
                            value={order.statusDates?.packed || ''}
                            onChange={(e) => handleUpdateOrderDate(order._id, 'packed', e.target.value)}
                            style={{
                              padding: '6px 10px',
                              fontSize: '12px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              background: '#fff',
                              color: '#0f172a',
                              width: '100%',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Shipped</label>
                          <input
                            type="date"
                            value={order.statusDates?.shipped || ''}
                            onChange={(e) => handleUpdateOrderDate(order._id, 'shipped', e.target.value)}
                            style={{
                              padding: '6px 10px',
                              fontSize: '12px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              background: '#fff',
                              color: '#0f172a',
                              width: '100%',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Out for Delivery</label>
                          <input
                            type="date"
                            value={order.statusDates?.outForDelivery || ''}
                            onChange={(e) => handleUpdateOrderDate(order._id, 'outForDelivery', e.target.value)}
                            style={{
                              padding: '6px 10px',
                              fontSize: '12px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              background: '#fff',
                              color: '#0f172a',
                              width: '100%',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Delivered</label>
                          <input
                            type="date"
                            value={order.statusDates?.delivered || ''}
                            onChange={(e) => handleUpdateOrderDate(order._id, 'delivered', e.target.value)}
                            style={{
                              padding: '6px 10px',
                              fontSize: '12px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              background: '#fff',
                              color: '#0f172a',
                              width: '100%',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="lead-meta" style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px dashed #eee' }}>
                      🕒 {new Date(order.createdAt).toLocaleString()} • Payment: {order.paymentMethod}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'completed_orders' && (
          <div className="fade-in">
            <div className="glass-card">
              <h2 className="form-section-title">Completed Orders</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                View all completed and delivered customer orders.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.filter((o: any) => o.status === 'Completed').length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                    <p>No completed orders.</p>
                  </div>
                ) : orders.filter((o: any) => o.status === 'Completed').map((order: any) => (
                  <div key={order._id} className="lead-item" style={{ display: 'block', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', margin: 0, color: '#10b981' }}>Order: {order._id.substring(0, 8).toUpperCase()}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Email: {order.userEmail}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <h3 style={{ fontSize: '18px', color: '#10b981', margin: 0 }}>₹{order.totalAmount}</h3>
                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                           <span style={{
                              padding: '6px 12px',
                              background: '#d1fae5',
                              color: '#065f46',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 700,
                              border: '1px solid #34d399'
                           }}>✅ Completed</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <h4 style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>Delivery Address</h4>
                        <p style={{ fontSize: '14px', margin: 0 }}><strong>{order.address?.name}</strong> ({order.address?.phone})</p>
                        <p style={{ fontSize: '13px', margin: '4px 0 0 0', color: '#333' }}>{order.address?.addressLine}, {order.address?.pincode}</p>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>Items Ordered</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
                          {order.items?.map((item: any, i: number) => (
                            <li key={i} style={{ marginBottom: '4px' }}>
                              {item.quantity}x {item.name} <span style={{ color: '#888' }}>(Size: {item.size})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="lead-meta" style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px dashed #eee' }}>
                      🕒 {new Date(order.createdAt).toLocaleString()} • Payment: {order.paymentMethod}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cancelled_orders' && (
          <div className="fade-in">
            <div className="glass-card">
              <h2 className="form-section-title">Cancelled Orders</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                View all cancelled customer orders.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.filter((o: any) => o.status === 'Cancelled').length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                    <p>No cancelled orders.</p>
                  </div>
                ) : orders.filter((o: any) => o.status === 'Cancelled').map((order: any) => (
                  <div key={order._id} className="lead-item" style={{ display: 'block', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', margin: 0, color: '#ef4444', textDecoration: 'line-through' }}>Order: {order._id.substring(0, 8).toUpperCase()}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Email: {order.userEmail}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <h3 style={{ fontSize: '18px', color: '#ef4444', margin: 0 }}>₹{order.totalAmount}</h3>
                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>UPDATE STATUS</label>
                          <select
                            value={order.status || 'Pending'}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              try {
                                setIsLoading(true);
                                const res = await fetch(`${API_BASE}/api/admin/orders/${order._id}/status`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: newStatus })
                                });
                                if (res.ok) {
                                  showStatus('Order status updated successfully!');
                                  fetchOrders();
                                } else {
                                  showStatus('Failed to update status', 'error');
                                }
                              } catch (err) {
                                showStatus('Error updating status', 'error');
                              } finally {
                                setIsLoading(false);
                              }
                            }}
                            style={{
                              background: '#fee2e2',
                              color: '#991b1b',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                              marginTop: '4px',
                              border: '1px solid #fca5a5',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Payment Verified">Payment Verified</option>
                            <option value="Packed">Packed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <h4 style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>Delivery Address</h4>
                        <p style={{ fontSize: '14px', margin: 0 }}><strong>{order.address?.name}</strong> ({order.address?.phone})</p>
                        <p style={{ fontSize: '13px', margin: '4px 0 0 0', color: '#333' }}>{order.address?.addressLine}, {order.address?.pincode}</p>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>Items Ordered</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
                          {order.items?.map((item: any, i: number) => (
                            <li key={i} style={{ marginBottom: '4px' }}>
                              {item.quantity}x {item.name} <span style={{ color: '#888' }}>(Size: {item.size})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="lead-meta" style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px dashed #eee' }}>
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
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      className="input-styled"
                      type="text"
                      value={announcementText}
                      onChange={e => setAnnouncementText(e.target.value)}
                      placeholder="Enter your announcement text here..."
                      required
                    />
                    <button type="submit" disabled={isLoading || !announcementText.trim()} className="primary-btn" style={{ width: 'auto', whiteSpace: 'nowrap' }}>
                      Upload
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="glass-card" style={{ marginTop: '24px' }}>
              <h2 className="form-section-title">Active Announcements</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {announcements.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>
                    <p>No active announcements.</p>
                  </div>
                ) : announcements.map(a => (
                  <div key={a._id} className="lead-item">
                    <div className="lead-info">
                      <h3 style={{ fontSize: '15px' }}>{a.text}</h3>
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
      <div className="item-image" style={{ padding: 0 }}>
        {videoSrc ? (
          <video src={videoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted loop onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => e.currentTarget.pause()} />
        ) : (
          <div className="spinner" style={{ marginTop: '40%' }}></div>
        )}
      </div>
      <div className="item-body">
        <h3>{reel.productId?.name || 'Unknown Dress'}</h3>
        <p style={{ fontSize: '11px', color: '#64748b' }}>Category: {reel.category}</p>
      </div>
      <div className="card-actions">
        <button className="btn-icon delete" onClick={onDelete}>Remove</button>
      </div>
    </div>
  );
}

export default App
