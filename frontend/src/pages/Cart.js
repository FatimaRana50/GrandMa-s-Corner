import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, updateQty, removeItem, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ deliveryAddress: user?.address || '', phone: user?.phone || '', notes: '', paymentMethod: 'cod' });
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState(null);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const placeOrder = async () => {
    if (!form.deliveryAddress || !form.phone) { toast.error('Please add delivery address and phone'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        items: cart.map(i => ({ menuItemId: i._id, quantity: i.qty })),
        ...form,
      });
      setPlaced(data);
      clearCart();
      toast.success('Order placed! Confirmation email sent 📧');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  if (placed) {
    const whatsappVendor = () => {
      const num = placed.vendor?.whatsapp || placed.vendor?.phone?.replace(/[^0-9]/g, '');
      if (!num) { toast.error('Vendor WhatsApp not available'); return; }
      const cleanNum = num.startsWith('92') ? num : `92${num.replace(/^0/, '')}`;
      const msg = encodeURIComponent(`Hi! I just placed Order #${placed._id.slice(-6).toUpperCase()} on Grandma's Corner. Total: Rs ${placed.totalAmount.toLocaleString()}. Looking forward to it! 🍽️`);
      window.open(`https://wa.me/${cleanNum}?text=${msg}`, '_blank');
    };

    return (
      <div style={{ maxWidth: 520, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: '#3d2b1f', marginBottom: 8 }}>Order Placed!</div>
        <p style={{ color: '#666', marginBottom: 6 }}>Order #{placed._id.slice(-6).toUpperCase()}</p>
        <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
          A confirmation email has been sent to you and the vendor has been notified.
        </p>
        <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
          Min 2 dozen per item · 3 days preparation time.
        </p>
        <div className="card" style={{ marginBottom: 20, textAlign: 'left' }}>
          <div style={{ fontWeight: 700, color: 'var(--green)', marginBottom: 10, fontSize: 14 }}>Order Summary</div>
          {placed.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '5px 0', color: '#555', borderBottom: '1px solid var(--border)' }}>
              <span>{item.name} × {item.quantity}</span>
              <span>Rs {item.subtotal.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#3d2b1f', marginTop: 10, fontSize: 16 }}>
            <span>Total</span><span>Rs {placed.totalAmount.toLocaleString()}/-</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-whatsapp" onClick={whatsappVendor}>💬 WhatsApp Vendor</button>
          <button className="btn btn-primary" onClick={() => navigate('/orders')}>View My Orders</button>
          <button className="btn btn-outline" onClick={() => navigate('/menu')}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🛒</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#3d2b1f', marginBottom: 10 }}>Your cart is empty</div>
        <p style={{ color: '#888', marginBottom: 24 }}>Add some delicious items from our menu!</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Browse Menu</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 16px 80px' }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#3d2b1f', marginBottom: 24 }}>Your Order</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        {/* Cart items */}
        <div className="card">
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: '#3d2b1f' }}>Items ({cart.length})</div>
          {cart.map(item => (
            <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#3d2b1f' }}>{item.name}</div>
                <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600 }}>{item.unit}</div>
                <div style={{ fontSize: 11, color: '#2a7a5a', fontWeight: 700, marginTop: 2 }}>🏠 {item.vendorName}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => updateQty(item._id, item.qty - 1)} style={{ width: 30, height: 30, border: '1.5px solid var(--border)', borderRadius: 8, background: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>−</button>
                <span style={{ fontSize: 14, fontWeight: 800, minWidth: 24, textAlign: 'center' }}>{item.qty}</span>
                <button onClick={() => updateQty(item._id, item.qty + 1)} style={{ width: 30, height: 30, border: '1.5px solid var(--border)', borderRadius: 8, background: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>+</button>
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: 'var(--green)', minWidth: 90, textAlign: 'right' }}>
                Rs {(item.price * item.qty).toLocaleString()}
              </div>
              <button onClick={() => removeItem(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 18, padding: 4 }}>✕</button>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontWeight: 800, fontSize: 17 }}>
            <span>Total</span>
            <span style={{ fontFamily: "'Playfair Display', serif", color: 'var(--green)', fontSize: 24 }}>Rs {total.toLocaleString()}/-</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: '#e57', background: '#fff5f5', padding: '8px 12px', borderRadius: 8, fontWeight: 600 }}>
            ⚠ Minimum 2 dozen per item · 3 days preparation · Delivery charges extra
          </div>
        </div>

        {/* Delivery details */}
        <div className="card">
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: '#3d2b1f' }}>Delivery Details</div>
          <div className="form-group">
            <label>Delivery Address</label>
            <textarea name="deliveryAddress" value={form.deliveryAddress} onChange={handle} rows={2} placeholder="Full delivery address" required style={{ resize: 'vertical' }} />
          </div>
          <div className="form-group">
            <label>WhatsApp / Phone</label>
            <input name="phone" value={form.phone} onChange={handle} placeholder="03XX-XXXXXXX" required />
          </div>
          <div className="form-group">
            <label>Special Notes</label>
            <input name="notes" value={form.notes} onChange={handle} placeholder="Any special requests..." />
          </div>
          <div className="form-group">
            <label>Payment Method</label>
            <select name="paymentMethod" value={form.paymentMethod} onChange={handle}>
              <option value="cod">Cash on Delivery</option>
              <option value="simulated">Online Payment (Simulated)</option>
            </select>
          </div>
          <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#1a5c38', fontWeight: 600, marginBottom: 14 }}>
            📧 A confirmation email will be sent to you after placing the order.
          </div>
          <button className="btn btn-primary" onClick={placeOrder} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Placing order...' : '✅ Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
