import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  ShoppingBag, Trash2, Plus, Minus, MapPin, Phone, 
  MessageCircle, CreditCard, Truck, Coffee, Sparkles,
  CheckCircle, ArrowLeft, ShoppingCart, Gift, Clock,
  FileText, Send, Heart
} from 'lucide-react';

// Reliable food background images from free CDN
const FOOD_BG = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop';
const SECONDARY_BG = 'https://images.pexels.com/photos/6287765/pexels-photo-6287765.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop';

export default function Cart() {
  const { cart, updateQty, removeItem, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ deliveryAddress: user?.address || '', phone: user?.phone || '', notes: '', paymentMethod: 'cod' });
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState(null);

  useEffect(() => {
    document.body.classList.add('cart-route');
    return () => document.body.classList.remove('cart-route');
  }, []);

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
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF9F5 0%, #FAF4EA 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          maxWidth: 520, width: '100%', background: '#fff', borderRadius: 32,
          padding: 40, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          animation: 'slideUp 0.6s ease-out'
        }}>
          <div style={{
            width: 80, height: 80, background: 'linear-gradient(135deg,#c5e0b4,#a8d8ea)',
            borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', animation: 'bounce 0.6s ease-out'
          }}>
            <CheckCircle size={48} color="#fff" />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#3d2b1f', marginBottom: 12 }}>
            Order Confirmed! 🎉
          </h2>
          <p style={{ color: '#666', marginBottom: 6, fontSize: 14 }}>
            Order #{placed._id.slice(-6).toUpperCase()}
          </p>
          <div style={{
            background: '#fef3cd', padding: '12px 16px', borderRadius: 16,
            margin: '20px 0', textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Clock size={16} color="#b7791f" />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#b7791f' }}>Important Info</span>
            </div>
            <p style={{ fontSize: 12, color: '#8a6e3d', margin: '4px 0' }}>✓ Minimum 2 dozen per item</p>
            <p style={{ fontSize: 12, color: '#8a6e3d', margin: '4px 0' }}>✓ 3 days preparation time</p>
            <p style={{ fontSize: 12, color: '#8a6e3d', margin: '4px 0' }}>✓ Delivery charges apply separately</p>
          </div>
          <div style={{
            background: '#faf8f5', borderRadius: 20, padding: 20, marginBottom: 20,
            textAlign: 'left'
          }}>
            <div style={{ fontWeight: 700, color: '#3d2b1f', marginBottom: 12, fontSize: 15 }}>
              Order Summary
            </div>
            {placed.items.map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', fontSize: 14,
                padding: '8px 0', color: '#555', borderBottom: '1px solid #e8e0d5'
              }}>
                <span>{item.name} × {item.quantity}</span>
                <span style={{ fontWeight: 600 }}>Rs {item.subtotal.toLocaleString()}</span>
              </div>
            ))}
            <div style={{
              display: 'flex', justifyContent: 'space-between', fontWeight: 800,
              color: '#3d2b1f', marginTop: 12, paddingTop: 12, borderTop: '2px solid #e8e0d5',
              fontSize: 18
            }}>
              <span>Total</span>
              <span style={{ color: '#f4a7bb' }}>Rs {placed.totalAmount.toLocaleString()}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={whatsappVendor}
              style={{
                padding: '12px 24px', background: '#25D366', color: '#fff', border: 'none',
                borderRadius: 40, fontWeight: 600, cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: 8, transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <MessageCircle size={18} /> WhatsApp Vendor
            </button>
            <button
              onClick={() => navigate('/orders')}
              style={{
                padding: '12px 24px', background: '#3d2b1f', color: '#fff', border: 'none',
                borderRadius: 40, fontWeight: 600, cursor: 'pointer'
              }}
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/menu')}
              style={{
                padding: '12px 24px', background: '#f5f2ed', color: '#666', border: 'none',
                borderRadius: 40, fontWeight: 600, cursor: 'pointer'
              }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${FOOD_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(3px)',
          transform: 'scale(1.05)',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(255,249,245,0.92) 0%, rgba(250,244,234,0.96) 100%)',
          zIndex: 0
        }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
          <div style={{
            maxWidth: 500, width: '100%', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
            borderRadius: 32, padding: 60, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            animation: 'slideUp 0.6s ease-out'
          }}>
            <div style={{
              width: 100, height: 100, background: '#faf8f5', borderRadius: 50,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <ShoppingBag size={48} color="#ddd" />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#3d2b1f', marginBottom: 12 }}>
              Your Cart is Empty
            </h2>
            <p style={{ color: '#888', marginBottom: 32 }}>Add some delicious items from our menu!</p>
            <button
              onClick={() => navigate('/menu')}
              style={{
                padding: '14px 32px', background: '#3d2b1f', color: '#fff', border: 'none',
                borderRadius: 40, fontWeight: 600, cursor: 'pointer', fontSize: 16
              }}
            >
              Browse Menu →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Background Image */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${FOOD_BG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(2px)',
        transform: 'scale(1.05)',
        zIndex: 0
      }} />
      
      {/* Gradient Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(255,249,245,0.92) 0%, rgba(250,244,234,0.96) 50%, rgba(244,167,187,0.15) 100%)',
        zIndex: 0
      }} />

      {/* Floating elements */}
      <div style={{ position: 'absolute', top: '10%', left: '3%', fontSize: 45, opacity: 0.2, animation: 'float 8s ease-in-out infinite', zIndex: 0, pointerEvents: 'none' }}>🍪</div>
      <div style={{ position: 'absolute', bottom: '15%', right: '2%', fontSize: 55, opacity: 0.2, animation: 'float 10s ease-in-out infinite reverse', zIndex: 0, pointerEvents: 'none' }}>☕</div>
      <div style={{ position: 'absolute', top: '25%', right: '5%', fontSize: 40, opacity: 0.15, animation: 'float 12s ease-in-out infinite', zIndex: 0, pointerEvents: 'none' }}>🍰</div>
      <div style={{ position: 'absolute', bottom: '30%', left: '4%', fontSize: 35, opacity: 0.15, animation: 'float 9s ease-in-out infinite 2s', zIndex: 0, pointerEvents: 'none' }}>🥐</div>
      <div style={{ position: 'absolute', top: '50%', left: '2%', fontSize: 30, opacity: 0.12, animation: 'float 11s ease-in-out infinite 1s', zIndex: 0, pointerEvents: 'none' }}>🧁</div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1000, margin: '0 auto', padding: '32px 20px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40, animation: 'slideUp 0.6s ease-out' }}>
          <div style={{
            width: 80, height: 80, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
            borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <ShoppingCart size={36} color="#f4a7bb" />
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 42,
            color: '#3d2b1f', marginBottom: 8, fontWeight: 700,
            textShadow: '0 2px 4px rgba(255,255,255,0.5)'
          }}>
            Your Cart
          </h1>
          <p style={{ color: '#7a6a5a', fontSize: 15, fontWeight: 500 }}>
            {cart.length} {cart.length === 1 ? 'item' : 'items'} · Total: ₨{total.toLocaleString()}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, '@media (max-width: 768px)': { gridTemplateColumns: '1fr' } }}>
          {/* Cart Items Column */}
          <div style={{ animation: 'slideUp 0.6s ease-out 0.1s both' }}>
            <div style={{
              background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
              borderRadius: 28, padding: 28, boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '1px solid rgba(240,232,220,0.5)'
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 20, paddingBottom: 15, borderBottom: '2px solid #f0e8dc'
              }}>
                <span style={{ fontWeight: 800, fontSize: 18, color: '#3d2b1f' }}>
                  <ShoppingBag size={18} style={{ display: 'inline', marginRight: 8 }} />
                  Order Items
                </span>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    style={{
                      background: 'none', border: 'none', color: '#e24b4a',
                      fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <Trash2 size={14} /> Clear All
                  </button>
                )}
              </div>

              {cart.map((item, idx) => (
                <div
                  key={item._id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '16px 0', borderBottom: idx < cart.length - 1 ? '1px solid #f0e8dc' : 'none',
                    animation: `fadeIn 0.3s ease-out ${idx * 0.05}s both`
                  }}
                >
                  <div style={{
                    width: 56, height: 56, background: 'linear-gradient(135deg,#fce38a,#f4a7bb)',
                    borderRadius: 14, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 28
                  }}>
                    🍽️
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#3d2b1f' }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#aaa', fontWeight: 500 }}>{item.unit}</div>
                    <div style={{
                      fontSize: 11, color: '#f4a7bb', fontWeight: 600, marginTop: 3,
                      display: 'flex', alignItems: 'center', gap: 4
                    }}>
                      <Heart size={10} fill="#f4a7bb" /> {item.vendorName}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => updateQty(item._id, item.qty - 1)}
                        style={{
                          width: 34, height: 34, border: '1.5px solid #e8e0d5',
                          borderRadius: 10, background: '#fff', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f5f2ed'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                      >
                        <Minus size={14} color="#888" />
                      </button>
                      <span style={{ fontSize: 16, fontWeight: 700, minWidth: 30, textAlign: 'center', color: '#3d2b1f' }}>
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item._id, item.qty + 1)}
                        style={{
                          width: 34, height: 34, border: '1.5px solid #e8e0d5',
                          borderRadius: 10, background: '#fff', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f5f2ed'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                      >
                        <Plus size={14} color="#888" />
                      </button>
                    </div>
                  </div>
                  <div style={{ minWidth: 100, textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#f4a7bb' }}>
                      ₨{(item.price * item.qty).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 10, color: '#bbb' }}>
                      ₨{item.price.toLocaleString()}/each
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item._id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#ddd', padding: 6, transition: 'color 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#e24b4a'}
                    onMouseLeave={e => e.currentTarget.style.color = '#ddd'}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '2px solid #f0e8dc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: 14, color: '#888' }}>Subtotal</span>
                    <div style={{ fontWeight: 800, fontSize: 24, color: '#3d2b1f' }}>
                      ₨{total.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 12, color: '#888' }}>+ Delivery charges</span>
                    <div style={{ fontSize: 13, color: '#f4a7bb', fontWeight: 600 }}>Calculated at checkout</div>
                  </div>
                </div>
                <div style={{
                  marginTop: 16, background: '#fef3cd', padding: '12px 16px',
                  borderRadius: 14, fontSize: 12, color: '#b7791f', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 10
                }}>
                  <Clock size={16} /> Minimum 2 dozen per item · 3 days preparation
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Details Column */}
          <div style={{ animation: 'slideUp 0.6s ease-out 0.2s both' }}>
            <div style={{
              background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
              borderRadius: 28, padding: 28, boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '1px solid rgba(240,232,220,0.5)'
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 24, paddingBottom: 15, borderBottom: '2px solid #f0e8dc'
              }}>
                <Truck size={20} color="#f4a7bb" />
                <span style={{ fontWeight: 800, fontSize: 18, color: '#3d2b1f' }}>Delivery Details</span>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#666', marginBottom: 8 }}>
                  <MapPin size={14} style={{ display: 'inline', marginRight: 6 }} /> Delivery Address
                </label>
                <textarea
                  name="deliveryAddress"
                  value={form.deliveryAddress}
                  onChange={handle}
                  rows={3}
                  placeholder="Enter your full delivery address"
                  style={{
                    width: '100%', padding: 12, borderRadius: 16, border: '1px solid #e8e0d5',
                    fontFamily: 'inherit', fontSize: 14, resize: 'vertical', boxSizing: 'border-box',
                    transition: 'border 0.2s'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#f4a7bb'}
                  onBlur={e => e.currentTarget.style.borderColor = '#e8e0d5'}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#666', marginBottom: 8 }}>
                  <Phone size={14} style={{ display: 'inline', marginRight: 6 }} /> WhatsApp / Phone
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handle}
                  placeholder="03XX-XXXXXXX"
                  style={{
                    width: '100%', padding: 12, borderRadius: 16, border: '1px solid #e8e0d5',
                    fontFamily: 'inherit', fontSize: 14, boxSizing: 'border-box',
                    transition: 'border 0.2s'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#f4a7bb'}
                  onBlur={e => e.currentTarget.style.borderColor = '#e8e0d5'}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#666', marginBottom: 8 }}>
                  <FileText size={14} style={{ display: 'inline', marginRight: 6 }} /> Special Notes (Optional)
                </label>
                <input
                  name="notes"
                  value={form.notes}
                  onChange={handle}
                  placeholder="Any special requests or instructions..."
                  style={{
                    width: '100%', padding: 12, borderRadius: 16, border: '1px solid #e8e0d5',
                    fontFamily: 'inherit', fontSize: 14, boxSizing: 'border-box',
                    transition: 'border 0.2s'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#f4a7bb'}
                  onBlur={e => e.currentTarget.style.borderColor = '#e8e0d5'}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#666', marginBottom: 8 }}>
                  <CreditCard size={14} style={{ display: 'inline', marginRight: 6 }} /> Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handle}
                  style={{
                    width: '100%', padding: 12, borderRadius: 16, border: '1px solid #e8e0d5',
                    fontFamily: 'inherit', fontSize: 14, cursor: 'pointer', background: '#fff'
                  }}
                >
                  <option value="cod">💵 Cash on Delivery</option>
                  <option value="simulated">💳 Online Payment (Simulated)</option>
                </select>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #e8f5e9, #c8e6d9)',
                borderRadius: 16, padding: '14px 16px', marginBottom: 24,
                display: 'flex', alignItems: 'center', gap: 12
              }}>
                <Send size={20} color="#2e7d32" />
                <div style={{ fontSize: 12, color: '#1b5e20', fontWeight: 500, lineHeight: 1.4 }}>
                  A confirmation email will be sent to you after placing the order
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={loading}
                style={{
                  width: '100%', padding: '16px', background: loading ? '#ccc' : '#3d2b1f',
                  color: '#fff', border: 'none', borderRadius: 50, fontWeight: 700,
                  fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {loading ? (
                  <><span style={{ animation: 'spin 1s linear infinite' }}>⏳</span> Placing order...</>
                ) : (
                  <><Gift size={20} /> Place Order</>
                )}
              </button>

              <button
                onClick={() => navigate('/menu')}
                style={{
                  width: '100%', marginTop: 12, padding: '12px', background: '#f5f2ed',
                  color: '#666', border: 'none', borderRadius: 50, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#efe6dc'}
                onMouseLeave={e => e.currentTarget.style.background = '#f5f2ed'}
              >
                <ArrowLeft size={16} /> Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        body.cart-route {
          min-height: 100vh;
        }
        body.cart-route #root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          isolation: isolate;
        }
        body.cart-route main {
          flex: 1 0 auto;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
        }
        body.cart-route footer {
          position: relative;
          z-index: 9999;
          margin-top: 0 !important;
          background: #3d2b1f !important;
          color: rgba(255,255,255,0.85) !important;
        }
        body.cart-route footer * {
          opacity: 1;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}