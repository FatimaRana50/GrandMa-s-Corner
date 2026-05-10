const router = require('express').Router();
const User = require('../models/User');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { protect, requireRole } = require('../middleware/auth');
const { sendAccountRemovedEmail, sendEmail } = require('../utils/email');

const guard = [protect, requireRole('admin')];

router.get('/stats', guard, async (req, res) => {
  try {
    const [totalCustomers, totalVendors, totalOrders, totalMenuItems, orders] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'vendor' }),
      Order.countDocuments(),
      MenuItem.countDocuments(),
      Order.find().select('totalAmount status'),
    ]);
    const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.totalAmount, 0);
    const pending = orders.filter(o => o.status === 'pending').length;
    const active = orders.filter(o => ['confirmed','preparing','ready'].includes(o.status)).length;
    res.json({ totalCustomers, totalVendors, totalOrders, totalMenuItems, totalRevenue, pending, active });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/users', guard, async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Toggle active/inactive
router.patch('/users/:id/toggle-active', guard, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot deactivate admin' });
    user.isActive = !user.isActive;
    await user.save();

    // Notify user by email
    const subject = user.isActive ? "Your Grandma's Corner Account Has Been Reactivated" : "Your Grandma's Corner Account Has Been Deactivated";
    const html = `<div style="font-family:Arial,sans-serif;padding:24px;max-width:500px">
      <h2 style="color:#3d2b1f">Account ${user.isActive ? 'Reactivated ✅' : 'Deactivated ⚠️'}</h2>
      <p>Hi ${user.name}, your account has been <strong>${user.isActive ? 'reactivated' : 'deactivated'}</strong> by the administrator.</p>
      ${user.isActive ? '<p>You can now log in normally.</p>' : '<p>You cannot log in until your account is reactivated. Contact admin@grandmas.com if you think this is a mistake.</p>'}
    </div>`;
    sendEmail({ to: user.email, subject, html }).catch(console.error);

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Change role
router.patch('/users/:id/role', guard, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'vendor'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot change admin role' });
    user.role = role;
    await user.save();

    const html = `<div style="font-family:Arial,sans-serif;padding:24px;max-width:500px">
      <h2 style="color:#3d2b1f">Role Updated</h2>
      <p>Hi ${user.name}, your account role has been changed to <strong>${role}</strong> by the administrator.</p>
      <p>Please log out and log back in for changes to take effect.</p>
    </div>`;
    sendEmail({ to: user.email, subject: "Your Grandma's Corner Role Has Been Updated", html }).catch(console.error);

    res.json({ message: `Role changed to ${role}`, user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete user
router.delete('/users/:id', guard, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin' });
    if (user.role === 'vendor') await MenuItem.deleteMany({ vendor: user._id });
    sendAccountRemovedEmail(user.email, user.name, user.role).catch(console.error);
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/vendors', guard, async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' }).select('-password').sort('-createdAt');
    const withStats = await Promise.all(vendors.map(async v => {
      const [itemCount, orderCount, orders] = await Promise.all([
        MenuItem.countDocuments({ vendor: v._id }),
        Order.countDocuments({ vendor: v._id }),
        Order.find({ vendor: v._id }).select('totalAmount status'),
      ]);
      const revenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.totalAmount, 0);
      return { ...v.toObject(), itemCount, orderCount, revenue };
    }));
    res.json(withStats);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/orders', guard, async (req, res) => {
  try {
    const filter = {};
    if (req.query.vendor) filter.vendor = req.query.vendor;
    const orders = await Order.find(filter).sort('-createdAt')
      .populate('customer', 'name email phone')
      .populate('vendor', 'name');
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
