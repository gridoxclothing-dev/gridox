const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '../.env' });

// Configure with YOUR current account (dqn4l6hc1)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const OLD_CLOUD_NAME = 'dxhet7ynl';

async function migrateImage(url, folder) {
  if (!url || !url.includes(OLD_CLOUD_NAME)) return url;
  
  try {
    console.log(`Migrating: ${url}`);
    // Cloudinary can upload directly from a URL
    const result = await cloudinary.uploader.upload(url, { folder: folder });
    return result.secure_url;
  } catch (err) {
    console.error(`Failed to migrate ${url}:`, err.message);
    return url;
  }
}

async function startMigration() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected. Starting migration to new Cloudinary account...');

    // 1. Products
    const products = await mongoose.connection.db.collection('products').find().toArray();
    console.log(`Checking ${products.length} products...`);
    for (const p of products) {
      let updated = false;
      const newImage = await migrateImage(p.image, 'gridox_products');
      if (newImage !== p.image) { p.image = newImage; updated = true; }

      if (p.gallery && p.gallery.length > 0) {
        const newGallery = [];
        for (const img of p.gallery) {
          const migrated = await migrateImage(img, 'gridox_products');
          newGallery.push(migrated);
          if (migrated !== img) updated = true;
        }
        p.gallery = newGallery;
      }

      if (updated) {
        await mongoose.connection.db.collection('products').updateOne(
          { _id: p._id }, 
          { $set: { image: p.image, gallery: p.gallery } }
        );
        console.log(`Updated Product: ${p.name || p._id}`);
      }
    }

    // 2. Categories
    const categories = await mongoose.connection.db.collection('categories').find().toArray();
    console.log(`Checking ${categories.length} categories...`);
    for (const c of categories) {
      const newThumb = await migrateImage(c.thumbnailImage, 'gridox_categories');
      if (newThumb !== c.thumbnailImage) {
        await mongoose.connection.db.collection('categories').updateOne(
          { _id: c._id }, 
          { $set: { thumbnailImage: newThumb, image: newThumb } }
        );
        console.log(`Updated Category: ${c.name}`);
      }
    }

    // 3. Banners
    const banners = await mongoose.connection.db.collection('banners').find().toArray();
    console.log(`Checking ${banners.length} banners...`);
    for (const b of banners) {
      const newImg = await migrateImage(b.imageUrl, 'gridox_banners');
      if (newImg !== b.imageUrl) {
        await mongoose.connection.db.collection('banners').updateOne(
          { _id: b._id }, 
          { $set: { imageUrl: newImg } }
        );
        console.log(`Updated Banner: ${b.title || b._id}`);
      }
    }

    // 4. Reels
    const reels = await mongoose.connection.db.collection('reels').find().toArray();
    console.log(`Checking ${reels.length} reels...`);
    for (const r of reels) {
      if (r.videoUrl && r.videoUrl.includes(OLD_CLOUD_NAME)) {
        try {
          console.log(`Migrating Video: ${r.videoUrl}`);
          const result = await cloudinary.uploader.upload(r.videoUrl, { 
            folder: 'gridox_reels',
            resource_type: 'video'
          });
          await mongoose.connection.db.collection('reels').updateOne(
            { _id: r._id },
            { $set: { videoUrl: result.secure_url } }
          );
          console.log(`Updated Reel: ${r._id}`);
        } catch (err) {
          console.error(`Failed video migration: ${r.videoUrl}`, err.message);
        }
      }
    }

    console.log('Migration finished!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

startMigration();
