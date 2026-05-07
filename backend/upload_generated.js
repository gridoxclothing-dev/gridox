const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env' });

let MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI && (!MONGODB_URI.includes('.net/') || MONGODB_URI.endsWith('.net/'))) {
    MONGODB_URI = MONGODB_URI.replace('.net/?', '.net/gridox_db?');
}

const Banner = mongoose.model('Banner', new mongoose.Schema({
  title: String,
  imageUrl: String,
  link: String,
  createdAt: { type: Date, default: Date.now }
}));

const uploadGenerated = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const imagePath = "C:\\Users\\Gogul\\.gemini\\antigravity\\brain\\75cdf016-f314-4628-9c65-d95bfb0c48a4\\hero_banner_full_fit_1776538588041.png";
    const data = fs.readFileSync(imagePath);
    const base64 = `data:image/png;base64,${data.toString('base64')}`;
    
    await Banner.create({
      title: 'GriDox Official Hero 2026',
      imageUrl: base64,
      link: '#'
    });
    
    console.log('Successfully uploaded generated banner to Atlas!');
    process.exit(0);
  } catch (err) {
    console.error('Upload failed:', err);
    process.exit(1);
  }
};

uploadGenerated();
