const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  unit: { type: String, required: true },
  category: { type: String, enum: ['frozen', 'tea', 'kids'], required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' }, 
  available: { type: Boolean, default: true },
  image: { type: String, default: '' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
