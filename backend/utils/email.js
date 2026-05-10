const nodemailer = require('nodemailer');

// Create transporter dynamically to get fresh env vars
function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: process.env.SMTP_USER || '', pass: process.env.SMTP_PASS || '' },
  });
}

const TILES = 'CORNER'.split('').map((l,i)=>
  `<span style="display:inline-block;width:22px;height:22px;text-align:center;line-height:22px;font-weight:900;font-size:13px;background:${i%2===0?'#f4a7b9':'#f9e4a0'};border-radius:4px">${l}</span>`
).join('');

const wrap = (content) => `<!DOCTYPE html><html><body style="margin:0;background:#fdf8f2;font-family:Arial,sans-serif">
<div style="max-width:560px;margin:0 auto">
  <div style="background:#c2eadc;padding:16px 24px">
    <span style="font-size:22px;font-style:italic;color:#3d2b1f;font-weight:700">Grandma's</span>
    <span style="display:inline-flex;gap:3px;margin-left:6px">${TILES}</span>
  </div>
  <div style="background:white;padding:28px 24px;border:1.5px solid #e8e0d6;border-top:none">${content}</div>
  <div style="padding:16px 24px;text-align:center;font-size:12px;color:#aaa">© 2026 Grandma's Corner · Rawalpindi · 0300-5118159</div>
</div></body></html>`;

async function sendEmail({ to, subject, html }) {
  console.log('=== EMAIL DEBUG START ===');
  console.log('📧 SMTP_USER:', process.env.SMTP_USER ? '✅ SET' : '❌ NOT SET');
  console.log('📧 SMTP_HOST:', process.env.SMTP_HOST || 'smtp.gmail.com');
  console.log('📧 SMTP_PORT:', process.env.SMTP_PORT || '587');
  console.log('📧 Recipient:', to);
  console.log('📧 Subject:', subject);
  
  if (!process.env.SMTP_USER) { 
    console.log(`[EMAIL SIM] To:${to} | ${subject}`); 
    console.log('=== EMAIL DEBUG END (SIM MODE) ===');
    return true; 
  }
  try { 
    console.log(`📧 Creating transporter...`);
    const transporter = getTransporter();
    
    console.log(`📧 Attempting to send email...`);
    const info = await transporter.sendMail({ 
      from: `"Grandma's Corner" <${process.env.SMTP_USER}>`, 
      to, 
      subject, 
      html 
    }); 
    console.log(`✅ Email successfully sent to ${to}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log('=== EMAIL DEBUG END (SUCCESS) ===');
    return true; 
  }
  catch (err) { 
    console.error('=== EMAIL DEBUG END (ERROR) ===');
    console.error('❌ CRITICAL Email error:', err.message);
    console.error('Full error object:', err);
    return false; 
  }
}

async function sendOrderConfirmationToCustomer(order, customerEmail, customerName) {
  const rows = order.items.map(i => `<tr><td style="padding:8px 12px;border-bottom:1px solid #f0e8e0">${i.name} <small style="color:#aaa">${i.unit}</small></td><td style="padding:8px 12px;border-bottom:1px solid #f0e8e0;text-align:center">x${i.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #f0e8e0;text-align:right;font-weight:700;color:#2a7a5a">Rs ${i.subtotal.toLocaleString()}</td></tr>`).join('');
  const html = wrap(`<h2 style="color:#3d2b1f;margin:0 0 8px">Order Confirmed! 🎉</h2><p style="color:#666;margin:0 0 20px">Hi ${customerName}, your order has been placed successfully.</p><div style="background:#e8f5ef;border-radius:8px;padding:12px 16px;margin-bottom:20px"><strong style="color:#2a7a5a">Order #${order._id.toString().slice(-6).toUpperCase()}</strong> &nbsp;·&nbsp; <span style="color:#666">From: ${order.vendor?.name || 'Vendor'}</span></div><table style="width:100%;border-collapse:collapse;margin-bottom:20px"><thead><tr style="background:#f8f5f0"><th style="padding:8px 12px;text-align:left;font-size:11px;color:#aaa">Item</th><th style="padding:8px 12px;text-align:center;font-size:11px;color:#aaa">Qty</th><th style="padding:8px 12px;text-align:right;font-size:11px;color:#aaa">Amount</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan="2" style="padding:10px 12px;font-weight:800;color:#3d2b1f">Total</td><td style="padding:10px 12px;text-align:right;font-weight:900;font-size:18px;color:#2a7a5a">Rs ${order.totalAmount.toLocaleString()}/-</td></tr></tfoot></table><div style="background:#f8f5f0;border-radius:8px;padding:12px 16px;font-size:13px;color:#666;margin-bottom:16px">📍 <strong>Delivery:</strong> ${order.deliveryAddress}<br>📞 <strong>Phone:</strong> ${order.phone}<br>💳 <strong>Payment:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online (Simulated)'}</div><p style="font-size:13px;color:#888;background:#fff3cd;border-radius:8px;padding:10px 14px">⏱ 3 days preparation time · Min 2 dozen per item</p>`);
  return sendEmail({ to: customerEmail, subject: `Order Confirmed #${order._id.toString().slice(-6).toUpperCase()} — Grandma's Corner`, html });
}

async function sendNewOrderNotificationToVendor(order, vendorEmail, vendorName) {
  const rows = order.items.map(i => `<tr><td style="padding:8px 12px;border-bottom:1px solid #f0e8e0">${i.name}</td><td style="padding:8px 12px;border-bottom:1px solid #f0e8e0;text-align:center">x${i.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #f0e8e0;text-align:right;font-weight:700">Rs ${i.subtotal.toLocaleString()}</td></tr>`).join('');
  const html = wrap(`<h2 style="color:#3d2b1f;margin:0 0 8px">New Order Received! 🍽️</h2><p style="color:#666;margin:0 0 16px">Hi ${vendorName}, you have a new order waiting.</p><div style="background:#fff3cd;border-radius:8px;padding:12px 16px;margin-bottom:16px"><strong>Order #${order._id.toString().slice(-6).toUpperCase()}</strong> &nbsp;·&nbsp; <span style="color:#856404">⏳ Awaiting Confirmation</span></div><p style="margin-bottom:12px;font-size:14px"><strong>Customer:</strong> ${order.customer?.name} · ${order.customer?.phone}</p><table style="width:100%;border-collapse:collapse;margin-bottom:16px"><thead><tr style="background:#f8f5f0"><th style="padding:8px 12px;text-align:left;font-size:11px;color:#aaa">Item</th><th style="padding:8px 12px;text-align:center;font-size:11px;color:#aaa">Qty</th><th style="padding:8px 12px;text-align:right;font-size:11px;color:#aaa">Amount</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan="2" style="padding:10px 12px;font-weight:800">Total</td><td style="padding:10px 12px;text-align:right;font-weight:900;font-size:18px;color:#2a7a5a">Rs ${order.totalAmount.toLocaleString()}/-</td></tr></tfoot></table><p style="font-size:13px;color:#666">📍 <strong>Delivery:</strong> ${order.deliveryAddress}</p>${order.notes ? `<p style="font-size:13px;color:#666;margin-top:8px">📝 <strong>Notes:</strong> ${order.notes}</p>` : ''}<p style="margin-top:20px;font-size:13px;color:#888">Login to your dashboard to confirm this order.</p>`);
  return sendEmail({ to: vendorEmail, subject: `New Order #${order._id.toString().slice(-6).toUpperCase()} — Action Required`, html });
}

async function sendAccountRemovedEmail(userEmail, userName, role) {
  const html = wrap(`<h2 style="color:#3d2b1f;margin:0 0 8px">Account Notice</h2><p style="color:#666;margin:0 0 16px">Hi ${userName},</p><p style="color:#444;margin-bottom:16px">Your <strong>${role}</strong> account on Grandma's Corner has been removed by the administrator.</p><p style="color:#666;font-size:13px">If you believe this was an error, contact us at admin@grandmas.com or WhatsApp 0300-5118159.</p>`);
  return sendEmail({ to: userEmail, subject: "Your Grandma's Corner Account Has Been Removed", html });
}

module.exports = { sendOrderConfirmationToCustomer, sendNewOrderNotificationToVendor, sendAccountRemovedEmail, sendEmail };