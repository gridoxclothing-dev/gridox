const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const ProductSchema = new mongoose.Schema({
  name: String,
  image: String,
  gallery: [String]
}, { strict: false });

const Product = mongoose.model('Product', ProductSchema);

async function checkImages() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const products = await Product.find().limit(5);
    console.log('\n--- Checking Sample Products ---');
    products.forEach(p => {
      console.log(`Product: ${p.name}`);
      console.log(`Main Image: ${p.image ? p.image.substring(0, 100) + (p.image.length > 100 ? '...' : '') : 'NONE'}`);
      if (p.gallery && p.gallery.length > 0) {
        console.log(`Gallery[0]: ${p.gallery[0].substring(0, 100)}...`);
      }
      console.log('---------------------------');
    });

    const categories = await mongoose.connection.db.collection('categories').find().limit(5).toArray();
    console.log('\n--- Checking Sample Categories ---');
    categories.forEach(c => {
      console.log(`Category: ${c.name}`);
      console.log(`Image: ${c.thumbnailImage ? c.thumbnailImage.substring(0, 100) : 'NONE'}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkImages();
