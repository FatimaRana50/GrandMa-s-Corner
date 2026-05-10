const router = require('express').Router();
const Review = require('../models/Review');
const Order = require('../models/Order');
const { protect, requireRole } = require('../middleware/auth');

// Submit review (customer, only for delivered orders)
router.post('/', protect, requireRole('customer'), async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    if (!orderId || !rating) return res.status(400).json({ message: 'orderId and rating are required' });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.customer.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your order' });
    if (order.status !== 'delivered')
      return res.status(400).json({ message: 'Can only review delivered orders' });

    const existing = await Review.findOne({ order: orderId, customer: req.user._id });
    if (existing) return res.status(409).json({ message: 'Already reviewed this order' });

    const review = await Review.create({
      order: orderId, customer: req.user._id,
      vendor: order.vendor, rating, comment,
    });
    await review.populate('customer', 'name');
    res.status(201).json(review);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get reviews for a vendor
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const reviews = await Review.find({ vendor: req.params.vendorId })
      .populate('customer', 'name')
      .sort('-createdAt')
      .limit(50);
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    res.json({ reviews, avgRating: Math.round(avg * 10) / 10, count: reviews.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Check if customer can review an order
router.get('/check/:orderId', protect, async (req, res) => {
  try {
    const existing = await Review.findOne({ order: req.params.orderId, customer: req.user._id });
    res.json({ reviewed: !!existing, review: existing });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
