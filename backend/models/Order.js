const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: String,
  price: Number,
  unit: String,
  quantity: { type: Number, required: true, min: 1 },
  subtotal: Number,
});

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending',
  },
  deliveryAddress: { type: String, required: true },
  phone: { type: String, required: true },
  notes: { type: String, default: '' },
  paymentMethod: { type: String, enum: ['cod', 'simulated'], default: 'cod' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    note: String,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
