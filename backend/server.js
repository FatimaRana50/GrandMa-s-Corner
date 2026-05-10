const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: ['http://localhost:3000', 'https://localhost:3000'], credentials: true }));
app.use(express.json());

app.use('/uploads', express.static('uploads'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/ai', require('./routes/ai'));
app.use('/uploads', express.static('uploads'));
require('./models/PasswordReset');

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await seedDatabase();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server on port ${PORT}`));
  })
  .catch(err => { console.error(err.message); process.exit(1); });

async function seedDatabase() {
  const MenuItem = require('./models/MenuItem');
  const User = require('./models/User');
  const bcrypt = require('bcryptjs');

  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    const hash = await bcrypt.hash('admin123', 10);
    await User.create({ name: 'Admin', email: 'admin@grandmas.com', password: hash, role: 'admin', phone: '03005118159' });
  }
  let vendor1 = await User.findOne({ email: 'vendor@grandmas.com' });
  if (!vendor1) {
    const hash = await bcrypt.hash('vendor123', 10);
    vendor1 = await User.create({ name: "Grandma's Kitchen", email: 'vendor@grandmas.com', password: hash, role: 'vendor', phone: '03005118159', whatsapp: '923005118159' });
  }
  let vendor2 = await User.findOne({ email: 'vendor2@grandmas.com' });
  if (!vendor2) {
    const hash = await bcrypt.hash('vendor123', 10);
    vendor2 = await User.create({ name: "Auntie's Bakes", email: 'vendor2@grandmas.com', password: hash, role: 'vendor', phone: '03335160869', whatsapp: '923335160869' });
  }
  const count = await MenuItem.countDocuments();
  if (count === 0) {
    const items = [
      { name: 'Alu Samosa', price: 600, unit: 'per dozen (12)', category: 'frozen', description: 'Crispy potato-filled samosas, ready to fry', available: true, vendor: vendor1._id },
      { name: 'Chicken Samosa', price: 840, unit: 'per dozen (12)', category: 'frozen', description: 'Spiced chicken filling in flaky pastry', available: true, vendor: vendor1._id },
      { name: 'Beef Qeema Samosa', price: 960, unit: 'per dozen (12)', category: 'frozen', description: 'Rich beef mince samosas', available: true, vendor: vendor1._id },
      { name: 'Chicken Kofta', price: 780, unit: 'per dozen (12)', category: 'frozen', description: 'Juicy chicken meatballs', available: true, vendor: vendor1._id },
      { name: 'Chicken Shami Kabab', price: 840, unit: 'per dozen (12)', category: 'frozen', description: 'Classic shami kabab with chicken', available: true, vendor: vendor1._id },
      { name: 'Beef Shami Kabab', price: 960, unit: 'per dozen (12)', category: 'frozen', description: 'Traditional beef shami kabab', available: true, vendor: vendor1._id },
      { name: 'Chicken Maggie Kabab', price: 720, unit: 'per dozen (12)', category: 'frozen', description: 'Unique Maggie-style chicken kabab', available: true, vendor: vendor1._id },
      { name: 'Beef Zeera Kabab', price: 720, unit: 'per dozen (12)', category: 'frozen', description: 'Cumin-infused beef kabab', available: true, vendor: vendor1._id },
      { name: 'Chicken Sandwich', price: 250, unit: 'per piece', category: 'tea', description: 'Soft chicken sandwich for tea time', available: true, vendor: vendor1._id },
      { name: 'BBQ Chicken Sandwich', price: 400, unit: 'per piece', category: 'tea', description: 'Smoky BBQ chicken in soft bread', available: true, vendor: vendor1._id },
      { name: 'Signature Club Sandwich', price: 500, unit: 'per piece', category: 'tea', description: 'Our signature triple-decker club', available: true, vendor: vendor1._id },
      { name: 'Chicken Croissant', price: 1200, unit: 'per dozen (12)', category: 'tea', description: 'Buttery croissants with chicken filling', available: true, vendor: vendor1._id },
      { name: 'Chicken Bread', price: 1200, unit: 'per loaf', category: 'tea', description: 'Stuffed chicken bread loaf', available: true, vendor: vendor1._id },
      { name: 'Mini Pizza', price: 1440, unit: 'per dozen (12)', category: 'tea', description: 'Bite-sized pizzas everyone loves', available: true, vendor: vendor1._id },
      { name: 'Plain Tea Cake', price: 850, unit: 'per piece', category: 'tea', description: 'Classic soft tea cake', available: true, vendor: vendor1._id },
      { name: 'Fudgy Brownie', price: 1200, unit: 'per dozen (12)', category: 'tea', description: 'Rich dense chocolate brownies', available: true, vendor: vendor1._id },
      { name: 'Signature Walnut Brownie', price: 1200, unit: 'per dozen (12)', category: 'tea', description: 'Fudgy brownies loaded with walnuts', available: true, vendor: vendor1._id },
      { name: 'Date Squares', price: 850, unit: 'per dozen (12)', category: 'tea', description: 'Sweet date-filled squares', available: true, vendor: vendor1._id },
      { name: 'Garlic Bread', price: 400, unit: 'per dozen (12)', category: 'tea', description: 'Buttery garlic bread pieces', available: true, vendor: vendor1._id },
      { name: 'One Bite Chicken Samosa', price: 720, unit: 'frozen, 12 pcs', category: 'kids', description: 'Mini chicken samosas for lunchboxes', available: true, vendor: vendor1._id },
      { name: 'Tender Pops', price: 1200, unit: 'frozen, 25-28 pcs', category: 'kids', description: 'Crispy chicken tender pops', available: true, vendor: vendor1._id },
      { name: 'Chicken Nuggets', price: 1200, unit: 'frozen, 26-28 pcs', category: 'kids', description: 'Golden chicken nuggets', available: true, vendor: vendor1._id },
      { name: 'Burger Patty', price: 1080, unit: 'frozen, 6 pcs', category: 'kids', description: 'Homemade chicken burger patties', available: true, vendor: vendor1._id },
      { name: 'Red Velvet Cake Slice', price: 350, unit: 'per slice', category: 'tea', description: 'Moist red velvet with cream cheese frosting', available: true, vendor: vendor2._id },
      { name: 'Banana Bread Loaf', price: 900, unit: 'per loaf', category: 'tea', description: 'Classic banana bread, perfectly moist', available: true, vendor: vendor2._id },
      { name: 'Date Bread', price: 850, unit: 'per loaf', category: 'tea', description: 'Wholesome date-studded bread', available: true, vendor: vendor2._id },
      { name: 'Chana Chat', price: 300, unit: 'per serving', category: 'tea', description: 'Tangy spiced chickpea chat', available: true, vendor: vendor2._id },
      { name: 'Dahi Phulkian', price: 400, unit: 'per dozen', category: 'kids', description: 'Soft phulkian in creamy yogurt', available: true, vendor: vendor2._id },
    ];
    await MenuItem.insertMany(items);
    console.log('Menu seeded');
  }
}
