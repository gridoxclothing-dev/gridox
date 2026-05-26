const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config({ path: '../.env' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const orders = await Order.find({ trackingId: { $ne: null, $ne: "" } });
  console.log("Tracking IDs in DB:");
  orders.forEach(o => console.log(o._id, o.trackingId));
  process.exit(0);
}
check();
