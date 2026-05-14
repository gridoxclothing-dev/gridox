const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: String,
  name: String,
  category: String, // Added category field
  price: Number,
  quantity: Number,
  image: String,
  size: String
});

const AddressSchema = new mongoose.Schema({
  name: String,
  phone: String,
  addressLine: String,
  pincode: String
});

const OrderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  items: [OrderItemSchema],
  address: AddressSchema,
  paymentMethod: { type: String, default: 'COD' },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
