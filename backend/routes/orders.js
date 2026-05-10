const router = require('express').Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');
const { sendOrderConfirmationToCustomer, sendNewOrderNotificationToVendor } = require('../utils/email');

// Place order (BUG FIX: populate vendor properly before checking _id)
router.post('/', protect, requireRole('customer'), async (req, res) => {
  try {
    const { items, deliveryAddress, phone, notes, paymentMethod } = req.body;
    if (!items || items.length === 0)
      return res.status(400).json({ message: 'No items in order' });

    let totalAmount = 0;
    const orderItems = [];
    let vendorId = null;

    for (const item of items) {
      // BUG FIX: use populate('vendor') and check vendor exists
      const menuItem = await MenuItem.findById(item.menuItemId).populate('vendor', '_id name email phone whatsapp');
      if (!menuItem) return res.status(404).json({ message: `Item not found: ${item.menuItemId}` });
      if (!menuItem.available) return res.status(400).json({ message: `${menuItem.name} is currently unavailable` });
      if (!menuItem.vendor) return res.status(400).json({ message: `Vendor not found for item: ${menuItem.name}` });

      const itemVendor = menuItem.vendor._id.toString();
      if (!vendorId) vendorId = itemVendor;
      else if (vendorId !== itemVendor)
        return res.status(400).json({ message: 'All items must be from the same vendor per order' });

      const subtotal = menuItem.price * item.quantity;
      totalAmount += subtotal;
      orderItems.push({
        menuItem: menuItem._id, name: menuItem.name,
        price: menuItem.price, unit: menuItem.unit,
        quantity: item.quantity, subtotal,
      });
    }

    const order = await Order.create({
      customer: req.user._id,
      vendor: vendorId,
      items: orderItems,
      totalAmount,
      deliveryAddress: deliveryAddress || req.user.address || '',
      phone: phone || req.user.phone || '',
      notes,
      paymentMethod: paymentMethod || 'cod',
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
    });

    await order.populate('customer', 'name email phone');
    await order.populate('vendor', 'name email phone whatsapp');

    // Send emails (non-blocking)
    sendOrderConfirmationToCustomer(order, order.customer.email, order.customer.name).catch(console.error);
    sendNewOrderNotificationToVendor(order, order.vendor.email, order.vendor.name).catch(console.error);

    res.status(201).json(order);
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ message: err.message });
  }
});

// My orders (customer)
router.get('/my', protect, requireRole('customer'), async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .sort('-createdAt')
      .populate('vendor', 'name phone whatsapp');
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('vendor', 'name phone whatsapp');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your order' });
    if (req.user.role === 'vendor' && order.vendor._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your order' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// All orders
router.get('/', protect, requireRole('vendor', 'admin'), async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'vendor') filter.vendor = req.user._id;
    if (req.query.status) filter.status = req.query.status;
    const orders = await Order.find(filter)
      .sort('-createdAt')
      .populate('customer', 'name email phone')
      .populate('vendor', 'name phone whatsapp');
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update status
router.patch('/:id/status', protect, requireRole('vendor', 'admin'), async (req, res) => {
  try {
    const { status, note } = req.body;
    const allowed = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.role === 'vendor' && order.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your order' });

    order.status = status;
    order.statusHistory.push({ status, note: note || '' });
    if (status === 'delivered') order.paymentStatus = 'paid';
    await order.save();
    await order.populate('customer', 'name email phone');
    await order.populate('vendor', 'name phone whatsapp');
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Cancel (customer)
router.patch('/:id/cancel', protect, requireRole('customer'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.customer.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your order' });
    if (order.status !== 'pending')
      return res.status(400).json({ message: 'Can only cancel pending orders' });
    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', note: 'Cancelled by customer' });
    await order.save();
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;