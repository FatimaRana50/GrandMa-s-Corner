const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { protect } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

const signToken = (id, rememberMe = false) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: rememberMe ? '30d' : '24h' });

// Validation helpers
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isStrongPassword = (p) => p && p.length >= 6;

// Register
router.post('/register', async (req, res) => {
  try {
    let { name, email, password, phone, address, role } = req.body;
    // Server-side validation
    const errors = {};
    if (!name || name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
    if (!email || !isValidEmail(email)) errors.email = 'Please enter a valid email address';
    if (!isStrongPassword(password)) errors.password = 'Password must be at least 6 characters';
    if (Object.keys(errors).length > 0) return res.status(400).json({ message: 'Validation failed', errors });

    email = email.toLowerCase().trim();
    name = name.trim();

    if (await User.findOne({ email }))
      return res.status(409).json({ message: 'Email already registered', errors: { email: 'This email is already registered' } });

    const allowedRole = ['customer', 'vendor'].includes(role) ? role : 'customer';
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, phone: phone?.trim(), address: address?.trim(), role: allowedRole });
    const token = signToken(user._id);
    res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    if (user.isActive === false)
      return res.status(403).json({ message: 'Your account has been deactivated. Contact admin.' });
    const token = signToken(user._id, rememberMe);
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get current user
router.get('/me', protect, (req, res) => res.json({ user: req.user }));

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, address }, { new: true }).select('-password');
    res.json({ user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Forgot password — send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email))
      return res.status(400).json({ message: 'Please enter a valid email address' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // Always respond success to prevent email enumeration
    if (!user) return res.json({ message: 'If this email exists, a reset link has been sent.' });

    // Invalidate old tokens
    await PasswordReset.deleteMany({ user: user._id });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await PasswordReset.create({ user: user._id, token, expiresAt });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fdf8f2;padding:32px;border-radius:16px">
        <div style="text-align:center;margin-bottom:24px">
          <span style="font-size:24px;font-style:italic;color:#3d2b1f;font-family:Georgia,serif">Grandma's</span>
          <span style="display:inline-flex;gap:3px;margin-left:6px">
            ${[...'CORNER'].map((l,i)=>`<span style="display:inline-block;width:22px;height:22px;text-align:center;line-height:22px;font-weight:900;font-size:12px;background:${i%2===0?'#f4a7b9':'#f9e4a0'};border-radius:4px">${l}</span>`).join('')}
          </span>
        </div>
        <h2 style="color:#3d2b1f;margin:0 0 8px">Reset Your Password</h2>
        <p style="color:#666;margin:0 0 20px">Hi ${user.name}, click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
        <div style="text-align:center;margin:28px 0">
          <a href="${resetUrl}" style="background:#3d2b1f;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:800;font-size:15px;display:inline-block">Reset Password →</a>
        </div>
        <p style="color:#aaa;font-size:13px;margin:0">If you didn't request this, ignore this email. Your password will not change.</p>
        <p style="color:#ccc;font-size:11px;margin-top:16px">Link expires: ${expiresAt.toLocaleString()}</p>
      </div>`;

    await sendEmail({ to: user.email, subject: "Reset Your Grandma's Corner Password", html });
    res.json({ message: 'If this email exists, a reset link has been sent.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and new password are required' });
    if (!isStrongPassword(password)) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const record = await PasswordReset.findOne({ token, used: false });
    if (!record) return res.status(400).json({ message: 'Reset link is invalid or has already been used' });
    if (record.expiresAt < new Date()) return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });

    const hash = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(record.user, { password: hash });
    await PasswordReset.findByIdAndUpdate(record._id, { used: true });

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Verify reset token (check if valid before showing form)
router.get('/reset-password/verify', async (req, res) => {
  try {
    const { token } = req.query;
    const record = await PasswordReset.findOne({ token, used: false });
    if (!record || record.expiresAt < new Date())
      return res.status(400).json({ valid: false, message: 'Link is invalid or expired' });
    res.json({ valid: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
