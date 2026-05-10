const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
  address: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);
