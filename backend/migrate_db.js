const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

// URIs
const SOURCE_URI = process.env.MONGODB_URI;
const DEST_URI = "mongodb+srv://gogul:admin123@cluster0.ycdwfuv.mongodb.net/gridox?retryWrites=true&w=majority";

async function migrate() {
  let sourceConn, destConn;
  try {
    console.log('Connecting to Source DB...');
    sourceConn = await mongoose.createConnection(SOURCE_URI).asPromise();
    console.log('Connecting to Destination DB...');
    destConn = await mongoose.createConnection(DEST_URI).asPromise();

    const collections = ['users', 'products', 'categories', 'banners', 'orders', 'otps', 'reels', 'instagramposts'];

    for (const colName of collections) {
      console.log(`Migrating collection: ${colName}...`);
      const sourceCol = sourceConn.collection(colName);
      const destCol = destConn.collection(colName);

      const data = await sourceCol.find({}).toArray();
      if (data.length > 0) {
        // Clear destination first to avoid duplicates
        await destCol.deleteMany({});
        await destCol.insertMany(data);
        console.log(`✅ Migrated ${data.length} documents for ${colName}`);
      } else {
        console.log(`ℹ️ No data found for ${colName}`);
      }
    }

    console.log('--- MIGRATION COMPLETE ---');
  } catch (error) {
    console.error('Migration Error:', error);
  } finally {
    if (sourceConn) await sourceConn.close();
    if (destConn) await destConn.close();
    process.exit(0);
  }
}

migrate();
