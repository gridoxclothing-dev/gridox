const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('dotenv').config({ path: '../.env' });
require('./passport-config'); // Load passport configuration

const path = require('path');
const app = express();

app.set('trust proxy', 1);
// CORS Configuration - Ensure Vercel can talk to Render
const corsOptions = {
  origin: [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'https://gridox-store.vercel.app',
    'https://gridox-owner.vercel.app',
    'https://griddox.vercel.app',
    'https://ownersite-psi.vercel.app',
    'https://www.gridox.in',
    'https://gridox.in'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-request-with']
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); // Enable pre-flight for all routes

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(passport.initialize());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 3001;

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper to upload Base64 to Cloudinary
const uploadToCloudinary = async (base64Data, folder = 'gridox', resourceType = 'auto') => {
  if (!base64Data || !base64Data.startsWith('data:')) return base64Data;
  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: folder,
      resource_type: resourceType
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};

// MongoDB Connection
let MONGODB_URI = process.env.MONGODB_URI;

console.log('Connecting to MongoDB...');
// Log URI with password masked for safety
const maskedURI = MONGODB_URI ? MONGODB_URI.replace(/:([^@]+)@/, ':****@') : 'MISSING';
console.log('Target URI:', maskedURI);

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds instead of hanging
})
  .then(() => console.log(`Successfully connected to MongoDB Atlas (database: ${mongoose.connection.name})!`))
  .catch(err => {
    console.error('❌ MONGODB CONNECTION ERROR:', err.message);
  });


// Schema
const BannerSchema = new mongoose.Schema({
  title: String,
  imageUrl: String, // Desktop
  mobileImageUrl: String, // Mobile
  link: String,
  createdAt: { type: Date, default: Date.now }
});

const Banner = mongoose.model('Banner', BannerSchema);

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: Number,
  discount: String,
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isCuratedLook: { type: Boolean, default: false },
  image: String, // Main image (Base64)
  gallery: [String], // Array of 5 look images (Base64)
  sizes: [String], // Array of available sizes (e.g. S, M, L, XL)
  details: String, // Rich text or long description
  category: { type: [String], default: [], index: true }, // Changed to array for multiple categories
  createdAt: { type: Date, default: Date.now, index: true } // Added index for faster sorting
});

const Product = mongoose.model('Product', ProductSchema);

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: String, // Keeping for backward compatibility
  fullImage: String,
  thumbnailImage: String,
  description: String,
  slug: String,
  createdAt: { type: Date, default: Date.now }
});

const Category = mongoose.model('Category', CategorySchema);

const ReelSchema = new mongoose.Schema({
  videoUrl: { type: String, required: true }, // Base64 or URL
  videoType: { type: String, default: 'video/mp4' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  category: String, // Category slug
  createdAt: { type: Date, default: Date.now }
});

const Reel = mongoose.model('Reel', ReelSchema);

const InstagramPostSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  link: String,
  createdAt: { type: Date, default: Date.now }
});

const InstagramPost = mongoose.model('InstagramPost', InstagramPostSchema);

const LeadSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

const Lead = mongoose.model('Lead', LeadSchema);

const authRoutes = require('./routes/auth');
const { verifyToken } = require('./middleware/auth');
const User = require('./models/User');
const Order = require('./models/Order');

app.use('/api/auth', authRoutes);

// Auth Status Check for debugging
app.get('/api/auth/status', (req, res) => {
  res.json({
    googleConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    callbackURL: "https://griddox-1.onrender.com/api/auth/google/callback",
    frontendURL: process.env.FRONTEND_URL,
    clientIdPrefix: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 10) + "..." : "NONE"
  });
});

// Protected Dashboard Route
app.get('/api/dashboard', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -refreshToken');
    res.status(200).json({ message: 'Welcome to your dashboard', user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// Create Order
app.post('/api/orders', verifyToken, async (req, res) => {
  try {
    const { userEmail, items, address, paymentMethod, totalAmount } = req.body;
    const newOrder = new Order({
      userEmail, items, address, paymentMethod, totalAmount
    });
    await newOrder.save();

    // Send email notifications via Resend
    try {
      if (process.env.RESEND_API_KEY) {
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: 'Gridox <no-reply@gridox.in>',
          to: [userEmail, 'igowthamgk@gmail.com'], // Send to BOTH customer and admin
          subject: `Order Confirmation - Gridox Fashion`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
              <h2 style="color: #000; text-align: center;">Gridox Order Confirmed</h2>
              <p>Thank you for your order!</p>
              <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h3 style="margin-top: 0;">Delivery Details:</h3>
                <p><strong>Name:</strong> ${address.name}</p>
                <p><strong>Phone:</strong> ${address.phone}</p>
                <p><strong>Address:</strong> ${address.addressLine}, ${address.pincode}</p>
              </div>
              <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Summary</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${items.map(i => `
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                      <strong>${i.name}</strong><br/>
                      <small style="color: #666;">Size: ${i.size} | Qty: ${i.quantity}</small>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">
                      ₹${(i.price * i.quantity).toLocaleString()}
                    </td>
                  </tr>
                `).join('')}
              </table>
              <div style="margin-top: 20px; text-align: right; font-size: 18px;">
                <strong>Total Amount: ₹${totalAmount.toLocaleString()}</strong>
              </div>
              <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
                Your order will be processed shortly. If you have any questions, reply to this email.
              </p>
            </div>
          `
        });
        console.log(`[ORDER] Confirmation email sent successfully to ${userEmail} and admin`);
      } else {
        console.log(`[ORDER] RESEND_API_KEY missing. Order saved but confirmation email skipped.`);
      }
    } catch (err) {
      console.error('[ORDER] Email notification failed, but order saved:', err);
    }

    res.status(201).json({ message: 'Order placed successfully', orderId: newOrder._id });
  } catch (error) {
    res.status(500).json({ message: 'Error placing order', error: error.message });
  }
});

// Get User Orders
app.get('/api/orders/:email', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get ALL Orders for Admin
app.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all orders' });
  }
});

app.get('/api/check-auth', verifyToken, (req, res) => {
  res.status(200).json({ authenticated: true, user: req.user });
});

app.post('/api/add-banner', async (req, res) => {
  try {
    const { title, imageUrl, mobileImageUrl, link } = req.body;

    const cloudUrl = await uploadToCloudinary(imageUrl, 'gridox_banners');
    const mobileCloudUrl = await uploadToCloudinary(mobileImageUrl, 'gridox_banners');

    const newBanner = new Banner({
      title,
      imageUrl: cloudUrl,
      mobileImageUrl: mobileCloudUrl || cloudUrl, // Fallback to desktop if mobile not provided
      link
    });
    const savedBanner = await newBanner.save();

    res.status(201).send({ message: 'Banner added successfully', data: savedBanner });
  } catch (error) {
    console.error('Error adding banner:', error);
    res.status(500).send({
      message: error.message.includes('authentication failed')
        ? 'Database Authentication Failed. Please check your password in .env'
        : 'Error adding banner to database',
      error: error.message
    });
  }
});

app.delete('/api/banners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to remove banner with ID: ${id}`);
    const deleted = await Banner.findByIdAndDelete(id);
    if (deleted) {
      console.log(`Successfully removed banner: ${deleted.title}`);
      res.status(200).send({ message: 'Banner removed successfully' });
    } else {
      console.log(`No banner found with ID: ${id}`);
      res.status(404).send({ message: 'Banner not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error removing banner', error: error.message });
  }
});

app.put('/api/banners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, imageUrl, mobileImageUrl, link } = req.body;

    const updateData = { title, link };

    if (imageUrl && imageUrl.startsWith('data:')) {
      updateData.imageUrl = await uploadToCloudinary(imageUrl, 'gridox_banners');
    } else if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    if (mobileImageUrl && mobileImageUrl.startsWith('data:')) {
      updateData.mobileImageUrl = await uploadToCloudinary(mobileImageUrl, 'gridox_banners');
    } else if (mobileImageUrl) {
      updateData.mobileImageUrl = mobileImageUrl;
    }

    const updated = await Banner.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).send({ message: 'Banner updated successfully', data: updated });
  } catch (error) {
    res.status(500).send({ message: 'Error updating banner', error: error.message });
  }
});

app.get('/api/banners', async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.status(200).send(banners);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching banners', error: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { category, isNewArrival, isBestSeller, isCuratedLook } = req.query;
    let query = {};
    if (category) query.category = category;
    if (isNewArrival === 'true') query.isNewArrival = true;
    if (isBestSeller === 'true') query.isBestSeller = true;
    if (isCuratedLook === 'true') query.isCuratedLook = true;

    // PROJECT fields to exclude heavy images (gallery) and long details when fetching a list
    const products = await Product.find(query)
      .select('-gallery -details -__v')
      .sort({ createdAt: -1 })
      .lean(); // Faster query execution

    res.status(200).send(products);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching products', error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).lean();
    if (!product) return res.status(404).send({ message: 'Product not found' });
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching product', error: error.message });
  }
});

app.post('/api/add-product', async (req, res) => {
  try {
    const productData = req.body;

    // Upload images to Cloudinary
    if (productData.image) productData.image = await uploadToCloudinary(productData.image, 'gridox_products');
    if (productData.gallery && Array.isArray(productData.gallery)) {
      productData.gallery = await Promise.all(productData.gallery.map(img => uploadToCloudinary(img, 'gridox_products')));
    }

    const newProduct = new Product(productData);
    const saved = await newProduct.save();
    res.status(201).send({ message: 'Product added successfully', data: saved });
  } catch (error) {
    res.status(500).send({ message: 'Error adding product', error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.status(200).send({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error removing product', error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;

    if (productData.image) productData.image = await uploadToCloudinary(productData.image, 'gridox_products');
    if (productData.gallery && Array.isArray(productData.gallery)) {
      productData.gallery = await Promise.all(productData.gallery.map(img => uploadToCloudinary(img, 'gridox_products')));
    }

    const updated = await Product.findByIdAndUpdate(id, productData, { new: true });
    res.status(200).send({ message: 'Product updated successfully', data: updated });
  } catch (error) {
    res.status(500).send({ message: 'Error updating product', error: error.message });
  }
});

// Category Routes
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    res.status(200).send(categories);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching categories', error: error.message });
  }
});

app.post('/api/add-category', async (req, res) => {
  try {
    const { name, thumbnailImage, description } = req.body;
    const cloudUrl = await uploadToCloudinary(thumbnailImage, 'gridox_categories');

    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const newCategory = new Category({
      name,
      thumbnailImage: cloudUrl,
      image: cloudUrl, // sync for legacy
      description,
      slug
    });
    const saved = await newCategory.save();
    res.status(201).send({ message: 'Category added successfully', data: saved });
  } catch (error) {
    res.status(500).send({ message: 'Error adding category', error: error.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.status(200).send({ message: 'Category removed successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error removing category', error: error.message });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, thumbnailImage, description } = req.body;

    const updateData = { name, description };
    if (thumbnailImage && thumbnailImage.startsWith('data:')) {
      updateData.thumbnailImage = await uploadToCloudinary(thumbnailImage, 'gridox_categories');
      updateData.image = updateData.thumbnailImage;
    }
    if (name) updateData.slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const updated = await Category.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).send({ message: 'Category updated successfully', data: updated });
  } catch (error) {
    res.status(500).send({ message: 'Error updating category', error: error.message });
  }
});

// Reel Routes
app.get('/api/reels', async (req, res) => {
  try {
    // Return all reels, but we'll selectively clean the videoUrl in the results
    const reels = await Reel.find().populate('productId').sort({ createdAt: -1 });

    const optimizedReels = reels.map(r => {
      const reelObj = r.toObject();
      // If it's heavy Base64, remove it from list to keep response small
      if (reelObj.videoUrl && reelObj.videoUrl.startsWith('data:')) {
        reelObj.videoUrl = ''; // Frontend will fetch it lazily
        reelObj.isBase64 = true;
      } else {
        reelObj.isBase64 = false;
      }
      return reelObj;
    });

    res.status(200).send(optimizedReels);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching reels', error: error.message });
  }
});

// New endpoint to fetch only the video content for a specific reel
app.get('/api/reels/video/:id', async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).send('Not found');

    // If it's a URL, redirect or return the URL
    if (!reel.videoUrl.startsWith('data:')) {
      return res.status(200).send({ url: reel.videoUrl, isBase64: false });
    }

    // If it's Base64, return it
    res.status(200).send({ url: reel.videoUrl, isBase64: true });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/api/add-reel', async (req, res) => {
  try {
    const { videoUrl, videoType, productId, category } = req.body;
    if (!videoUrl || !productId) {
      return res.status(400).send({ message: 'Missing video or product association' });
    }

    const cloudUrl = await uploadToCloudinary(videoUrl, 'gridox_reels', 'video');

    const newReel = new Reel({ videoUrl: cloudUrl, videoType, productId, category });
    const saved = await newReel.save();
    res.status(201).send({ message: 'Reel added successfully', data: saved });
  } catch (error) {
    res.status(500).send({ message: 'Error adding reel', error: error.message });
  }
});

app.delete('/api/reels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Reel.findByIdAndDelete(id);
    res.status(200).send({ message: 'Reel removed successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error removing reel', error: error.message });
  }
});

// Instagram Feed Routes
app.get('/api/instagram-posts', async (req, res) => {
  try {
    const posts = await InstagramPost.find().sort({ createdAt: -1 });
    res.status(200).send(posts);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching instagram posts', error: error.message });
  }
});

app.post('/api/add-instagram-post', async (req, res) => {
  try {
    const { imageUrl, link } = req.body;
    console.log('Instagram Upload Attempted. Link:', link);

    if (!imageUrl) return res.status(400).send({ message: 'No image provided' });

    const cloudUrl = await uploadToCloudinary(imageUrl, 'gridox_instagram');
    const newPost = new InstagramPost({ imageUrl: cloudUrl, link });
    const saved = await newPost.save();

    console.log('Instagram Post Saved Successfully:', saved._id);
    res.status(201).send({ message: 'Instagram post added successfully', data: saved });
  } catch (error) {
    console.error('SERVER ERROR (Instagram Upload):', error);
    res.status(500).send({ message: 'Error adding instagram post', error: error.message });
  }
});

app.delete('/api/instagram-posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await InstagramPost.findByIdAndDelete(id);
    res.status(200).send({ message: 'Instagram post removed successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error removing instagram post', error: error.message });
  }
});

// OTP Route
const { Resend } = require('resend');

app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    let messagesSent = [];
    let isMock = false;

    // --- EMAIL DISPATCH ---
    if (email) {
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        // Fire and forget email to avoid UI lag
        resend.emails.send({
          from: 'Gridox <no-reply@gridox.in>',
          to: email,
          subject: "Your Gridox Verification Code",
          text: `Use this code to verify your account and get 10% off: ${otp}`,
          html: `<div style="font-family: sans-serif; padding: 20px;">
                  <h2 style="color: #000;">Gridox</h2>
                  <p>Thanks for joining! Use the code below to verify your account:</p>
                  <h1 style="letter-spacing: 5px; color: #000; background: #f4f4f4; padding: 10px; display: inline-block; border-radius: 5px;">${otp}</h1>
                  <p>Get ready for exclusive fashion drops.</p>
                 </div>`
        }).then(() => console.log(`OTP emailed successfully to ${email}`))
          .catch(err => console.error("OTP email failed:", err));

        messagesSent.push('email');
      } else {
        console.log(`RESEND API keys missing! (mocking OTP dispatch): EMAIL to ${email} -> OTP: ${otp}`);
        messagesSent.push('mock-email');
        isMock = true;
      }
    } else {
      return res.status(400).send({ message: 'Email is required' });
    }

    res.status(200).send({
      success: true,
      message: isMock ? 'Mock OTP sent (Keys missing)' : 'OTP sent successfully',
      dispatchedVia: messagesSent
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).send({ message: 'Error sending OTP', error: error.message });
  }
});

// Lead Capture Route
app.post('/api/leads', async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email) {
      return res.status(400).send({ message: 'Email is required for lead generation' });
    }

    const newLead = new Lead({ email, phone });
    const saved = await newLead.save();
    console.log(`Lead Captured Successfully: ${email} | ${phone || 'No Phone'}`);

    // Setup Lead Notification Email
    const smtpUser = process.env.SMTP_EMAIL;
    const smtpPass = process.env.SMTP_PASSWORD;
    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      // Fire and forget lead notification to avoid UI lag
      transporter.sendMail({
        from: `"Gridox Notification" <${smtpUser}>`,
        to: smtpUser, // Send to gridoxclothing@gmail.com
        subject: "🎉 New Verified Lead Captured",
        html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; max-width: 500px;">
                <h2 style="color: #d11243; margin-top: 0;">New Lead Alert</h2>
                <p>A new customer has successfully verified their email to claim the discount code.</p>
                <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                  <p style="margin: 0 0 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                  <p style="margin: 0;"><strong>Phone:</strong> ${phone || '<i>Not provided</i>'}</p>
                </div>
                <p style="font-size: 12px; color: #888;">This lead has been saved to your MongoDB Atlas dashboard.</p>
               </div>`
      }).catch(err => console.error("Lead alert email failed:", err)); // Fail silently if mail errors out
    }

    res.status(201).send({ message: 'Lead created successfully', data: saved });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).send({ message: 'Error creating lead', error: error.message });
  }
});

// Fetch all leads
app.get('/api/leads', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.status(200).send(leads);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching leads', error: error.message });
  }
});

// Delete a lead
app.delete('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Lead.findByIdAndDelete(id);
    res.status(200).send({ message: 'Lead removed successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error removing lead', error: error.message });
  }
});

app.get('/', (req, res) => {
  res.status(200).json({ status: 'API Online', service: 'Gridox Engine' });
});

app.listen(process.env.PORT || 3001, '0.0.0.0', () => {
  console.log(`Server running on port ${process.env.PORT || 3001}`);
});
