const router = require('express').Router();
const MenuItem = require('../models/MenuItem');
const { protect, requireRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only jpg, png, webp images allowed'));
  },
});

// Get all menu items (public)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.available === 'true') filter.available = true;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.vendor) filter.vendor = req.query.vendor;
    const items = await MenuItem.find(filter).populate('vendor', 'name phone whatsapp').sort('category name');
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add menu item with optional image
router.post('/', protect, requireRole('vendor', 'admin'), upload.single('image'), async (req, res) => {
  try {
    const { name, price, unit, category, description } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'Name and price are required' });
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    const item = await MenuItem.create({ name, price, unit, category, description, image, vendor: req.user._id });
    await item.populate('vendor', 'name phone whatsapp');
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update menu item with optional image
router.put('/:id', protect, requireRole('vendor', 'admin'), upload.single('image'), async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    const orderVendorId = item.vendor?._id ? item.vendor._id.toString() : item.vendor.toString();
    if (req.user.role === 'vendor' && orderVendorId !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your item' });

    const { name, price, unit, category, description, available } = req.body;
    if (name !== undefined) item.name = name;
    if (price !== undefined) item.price = Number(price);
    if (unit !== undefined) item.unit = unit;
    if (category !== undefined) item.category = category;
    if (description !== undefined) item.description = description;
    if (available !== undefined) item.available = available === 'true' || available === true;

    // If new image uploaded, delete old one and save new
    if (req.file) {
      if (item.image) {
        const oldPath = '.' + item.image;
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      item.image = `/uploads/${req.file.filename}`;
    }

    await item.save();
    await item.populate('vendor', 'name phone whatsapp');
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete menu item
router.delete('/:id', protect, requireRole('vendor', 'admin'), async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    const orderVendorId = item.vendor?._id ? item.vendor._id.toString() : item.vendor.toString();
    if (req.user.role === 'vendor' && orderVendorId !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your item' });
    // Delete image file too
    if (item.image) {
      const imgPath = '.' + item.image;
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;