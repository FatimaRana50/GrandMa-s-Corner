import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  ShoppingBag, Clock, CheckCircle, Truck, Coffee,
  Star, MessageCircle, XCircle, Calendar,
  MapPin, Phone, FileText, CreditCard,
  Package, Utensils, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';

const STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
const STATUS_LABELS = { pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing', ready: 'Ready!', delivered: 'Delivered', cancelled: 'Cancelled' };
const STATUS_ICONS = {
  pending: <Clock size={18} />,
  confirmed: <CheckCircle size={18} />,
  preparing: <Utensils size={18} />,
  ready: <Truck size={18} />,
  delivered: <Package size={18} />,
};
const STATUS_COLORS = {
  pending: '#f4a7bb',
  confirmed: '#fce38a',
  preparing: '#b8e1d4',
  ready: '#a8d8ea',
  delivered: '#c5e0b4',
  cancelled: '#ddd'
};

// Subtle, free-to-use food photo from Unsplash (warm tones, fits theme)
const FOOD_BG = 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1920&q=70';

function ChefHat({ size = 14 }) {
  return <span style={{ fontSize: size + 2, lineHeight: 1 }}>👨‍🍳</span>;
}

function StarRating({ value, onChange, readonly }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span
          key={s}
          onClick={() => !readonly && onChange(s)}
          onMouseEnter={() => !readonly && setHover(s)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{
            fontSize: 32,
            cursor: readonly ? 'default' : 'pointer',
            color: (hover || value) >= s ? '#f4a7bb' : '#e8e0d5',
            transition: 'transform 0.15s, color 0.15s',
            transform: hover === s ? 'scale(1.2)' : 'scale(1)',
          }}
        >★</span>
      ))}
    </div>
  );
}

function ReviewModal({ order, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const ratingTexts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'];
  const ratingEmojis = ['', '😞', '😐', '🙂', '😊', '🤩'];

  const submit = async () => {
    if (!rating) { toast.error('Please select a rating'); return; }
    setLoading(true);
    try {
      await api.post('/reviews', { orderId: order._id, rating, comment });
      toast.success('Review submitted! Thank you 🎉');
      onSubmit();
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit'); }
    finally { setLoading(false); }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(61,43,31,0.55)',
        backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 1000, padding: 20,
        animation: 'fadeIn 0.25s ease-out'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 28, padding: 32, maxWidth: 480, width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'popIn 0.35s cubic-bezier(.2,.9,.3,1.2)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, margin: '0 auto 12px', borderRadius: 32,
            background: 'linear-gradient(135deg,#fce38a,#f4a7bb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize: 24, color: '#3d2b1f', margin: '0 0 6px', fontFamily: "'Playfair Display', serif" }}>Love What You Ate?</h2>
          <div style={{ fontSize: 13, color: '#888' }}>
            Order #{order._id.slice(-6).toUpperCase()} · {order.vendor?.name}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#666', marginBottom: 12 }}>How was your experience?</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <StarRating value={rating} onChange={setRating} />
          </div>
          {rating > 0 && (
            <div style={{ marginTop: 10, fontSize: 14, color: '#3d2b1f', fontWeight: 500 }}>
              {ratingEmojis[rating]} {ratingTexts[rating]}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#666', marginBottom: 8 }}>
            Share your thoughts (optional)
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={4}
            placeholder="What did you love? Any suggestions?"
            style={{
              width: '100%', padding: 12, borderRadius: 16, border: '1px solid #e8e0d5',
              fontFamily: 'inherit', fontSize: 14, resize: 'vertical', boxSizing: 'border-box',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={submit}
            disabled={loading}
            style={{
              flex: 1, padding: 14, background: '#3d2b1f', color: '#fff', border: 'none',
              borderRadius: 40, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            {loading ? 'Submitting...' : <><Sparkles size={18} /> Submit Review</>}
          </button>
          <button
            onClick={onClose}
            style={{ padding: '14px 24px', background: '#f5f2ed', border: 'none', borderRadius: 40, cursor: 'pointer', fontWeight: 500 }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, onCancel, onReview, index }) {
  const [open, setOpen] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [checkingReview, setCheckingReview] = useState(false);
  const statusIdx = STATUSES.indexOf(order.status);

  useEffect(() => {
    if (order.status === 'delivered') {
      setCheckingReview(true);
      api.get(`/reviews/check/${order._id}`).then(r => setReviewed(r.data.reviewed)).finally(() => setCheckingReview(false));
    }
  }, [order._id, order.status]);

  const whatsappVendor = () => {
    const num = order.vendor?.whatsapp || order.vendor?.phone?.replace(/[^0-9]/g, '');
    if (!num) { toast.error('Vendor WhatsApp not available'); return; }
    const msg = encodeURIComponent(`Hi! I'm reaching out regarding Order #${order._id.slice(-6).toUpperCase()} placed on Grandma's Corner.`);
    window.open(`https://wa.me/${num.replace(/^0/, '92')}?text=${msg}`, '_blank');
  };

  return (
    <div
      className="order-card"
      style={{
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
        borderRadius: 24, marginBottom: 20, padding: 20,
        boxShadow: '0 4px 20px rgba(61,43,31,0.06)',
        border: '1px solid #f0e8dc',
        animation: `slideUp 0.5s ease-out both`,
        animationDelay: `${index * 0.07}s`
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{
              width: 8, height: 8, borderRadius: 4,
              background: STATUS_COLORS[order.status] || '#ddd',
              boxShadow: `0 0 0 4px ${STATUS_COLORS[order.status]}30`,
              animation: order.status !== 'delivered' && order.status !== 'cancelled' ? 'pulse 2s infinite' : 'none'
            }} />
            <span style={{ fontWeight: 700, fontSize: 16, color: '#3d2b1f' }}>
              #{order._id.slice(-6).toUpperCase()}
            </span>
            <span style={{ fontSize: 12, color: '#bbb' }}>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888' }}>
              <Calendar size={12} />
              {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img
              src={order.vendor?.logo || `https://ui-avatars.com/api/?name=${order.vendor?.name || 'Vendor'}&background=f4a7bb&color=fff&rounded=true`}
              style={{ width: 24, height: 24, borderRadius: 12 }}
              alt=""
            />
            <span style={{ fontSize: 13, color: '#666' }}>{order.vendor?.name || 'Restaurant'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 20,
            background: `${STATUS_COLORS[order.status]}30`,
            color: '#3d2b1f',
            fontSize: 12, fontWeight: 600
          }}>
            {STATUS_ICONS[order.status]}
            {STATUS_LABELS[order.status]}
          </span>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#3d2b1f' }}>
            ₨{order.totalAmount.toLocaleString()}
          </div>
          <button
            onClick={() => setOpen(!open)}
            style={{
              background: '#f5f2ed', border: 'none', padding: '8px 16px',
              borderRadius: 30, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
            }}
          >
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {open ? 'Hide' : 'Details'}
          </button>
        </div>
      </div>

      {/* Status Tracker */}
      {order.status !== 'cancelled' && (
        <div style={{ margin: '24px 0 16px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            {STATUSES.map((s, i) => {
              const isActive = i <= statusIdx;
              const isCurrent = i === statusIdx;
              return (
                <div key={s} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    width: 40, height: 40, margin: '0 auto 8px',
                    background: isActive ? (isCurrent ? '#3d2b1f' : STATUS_COLORS[s]) : '#f0f0f0',
                    borderRadius: 40, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: isActive ? '#fff' : '#bbb',
                    position: 'relative', zIndex: 2,
                    boxShadow: isCurrent ? '0 0 0 4px rgba(61,43,31,0.15)' : 'none',
                    animation: isCurrent ? 'bounce 2s ease-in-out infinite' : 'none',
                    transition: 'background 0.4s'
                  }}>
                    {isActive && i < statusIdx ? <CheckCircle size={20} /> : STATUS_ICONS[s]}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: isActive ? '#3d2b1f' : '#bbb', marginBottom: 4 }}>
                    {STATUS_LABELS[s]}
                  </div>
                  {isCurrent && order.status === 'ready' && (
                    <div style={{ fontSize: 10, color: '#f4a7bb', fontWeight: 600 }}>Ready for pickup!</div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{
            position: 'absolute', top: 20, left: '8%', right: '8%',
            height: 3, background: '#f0e8dc', zIndex: 0, borderRadius: 2, overflow: 'hidden'
          }}>
            <div style={{
              width: `${(statusIdx / (STATUSES.length - 1)) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg,#f4a7bb,#fce38a,#b8e1d4)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s linear infinite',
              transition: 'width 0.6s ease'
            }} />
          </div>
        </div>
      )}

      {/* Expanded */}
      {open && (
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f0e8dc', animation: 'fadeIn 0.3s' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Utensils size={16} color="#f4a7bb" />
              <span style={{ fontWeight: 600, fontSize: 14 }}>Order Items</span>
            </div>
            <div style={{ background: '#faf8f5', borderRadius: 16, padding: 12 }}>
              {order.items.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: i < order.items.length - 1 ? '1px solid #e8e0d5' : 'none'
                }}>
                  <div>
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                    {item.unit && <span style={{ fontSize: 11, color: '#aaa', marginLeft: 6 }}>({item.unit})</span>}
                    <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>×{item.quantity}</span>
                  </div>
                  <span>₨{item.subtotal.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, fontWeight: 700, color: '#3d2b1f' }}>
                <span>Total</span>
                <span>₨{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
            {[
              { icon: <MapPin size={18} color="#f4a7bb" />, label: 'Delivery Address', value: order.deliveryAddress },
              { icon: <Phone size={18} color="#f4a7bb" />, label: 'Contact', value: order.phone },
              { icon: <CreditCard size={18} color="#f4a7bb" />, label: 'Payment', value: order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment' },
              ...(order.notes ? [{ icon: <FileText size={18} color="#f4a7bb" />, label: 'Special Notes', value: order.notes }] : [])
            ].map((info, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: '#faf8f5', borderRadius: 12 }}>
                {info.icon}
                <div style={{ fontSize: 13 }}>
                  <div style={{ fontWeight: 500 }}>{info.label}</div>
                  <div style={{ color: '#666' }}>{info.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={whatsappVendor}
              style={{
                padding: '10px 20px', background: '#25D366', color: '#fff', border: 'none',
                borderRadius: 40, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              <MessageCircle size={16} /> Chat with Vendor
            </button>

            {order.status === 'pending' && (
              <button
                onClick={() => onCancel(order._id)}
                style={{
                  padding: '10px 20px', background: '#fff', color: '#e24b4a', border: '1.5px solid #e24b4a',
                  borderRadius: 40, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8
                }}
              >
                <XCircle size={16} /> Cancel Order
              </button>
            )}

            {order.status === 'delivered' && !checkingReview && !reviewed && (
              <button
                onClick={() => onReview(order)}
                style={{
                  padding: '10px 20px', background: 'linear-gradient(135deg,#fef3cd,#fce38a)',
                  color: '#b7791f', border: 'none',
                  borderRadius: 40, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8
                }}
              >
                <Star size={16} /> Rate Your Meal
              </button>
            )}

            {order.status === 'delivered' && reviewed && (
              <span style={{
                padding: '10px 20px', background: '#e8f5e9', color: '#2e7d32', borderRadius: 40,
                fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8
              }}>
                <CheckCircle size={16} /> Thank You for Your Review!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('orders-route');
    return () => document.body.classList.remove('orders-route');
  }, []);

  const load = () => api.get('/orders/my').then(r => { setOrders(r.data); setLoading(false); });
  useEffect(() => { load(); }, [refresh]);

  const cancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try { await api.patch(`/orders/${id}/cancel`); toast.success('Order cancelled'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Cannot cancel'); }
  };

  const filteredOrders = orders.filter(o => filter === 'all' ? true : o.status === filter);
  const stats = {
    total: orders.length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    pending: orders.filter(o => o.status === 'pending').length
  };

  const floatingEmojis = ['🍪', '☕', '🥐', '🍰', '🥧', '🧁'];

  return (
    <>
      <div style={{ minHeight: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Food background image */}
        <div style={{
          position: 'fixed', inset: 0,
          backgroundImage: `url(${FOOD_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(2px)',
          transform: 'scale(1.05)',
          zIndex: 0
        }} />
        {/* Warm gradient overlay to keep theme */}
        <div style={{
          position: 'fixed', inset: 0,
          background: 'linear-gradient(135deg, rgba(255,249,245,0.94) 0%, rgba(250,244,234,0.96) 50%, rgba(244,167,187,0.18) 100%)',
          zIndex: 0
        }} />

        {/* Floating food emojis */}
        {floatingEmojis.map((emoji, i) => (
          <div
            key={i}
            style={{
              position: 'fixed',
              left: `${(i * 17 + 8) % 90}%`,
              top: `${(i * 23 + 10) % 80}%`,
              fontSize: 28 + (i % 3) * 6,
              opacity: 0.18,
              zIndex: 0,
              animation: `float ${8 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.6}s`,
              pointerEvents: 'none'
            }}
          >
            {emoji}
          </div>
        ))}

        <div style={{ position: 'relative', zIndex: 1, flex: 1, width: '100%' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>
          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: 40, animation: 'slideUp 0.6s ease-out' }}>
            <div style={{
              width: 88, height: 88,
              background: 'linear-gradient(135deg,#fff,#faf4ea)',
              borderRadius: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 12px 40px rgba(244,167,187,0.3)',
              animation: 'bounce 3s ease-in-out infinite'
            }}>
              <Coffee size={40} color="#f4a7bb" />
            </div>
            <h1 style={{
              fontSize: 42, fontFamily: "'Playfair Display', serif",
              color: '#3d2b1f', marginBottom: 12, fontWeight: 700, letterSpacing: '-0.5px'
            }}>
              Your Orders
            </h1>
            <p style={{ color: '#7a6a5a', fontSize: 15, maxWidth: 450, margin: '0 auto' }}>
              Track your delicious journey with us ✨
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { value: stats.total, label: 'Total Orders', color: '#3d2b1f' },
              { value: stats.delivered, label: 'Delivered 🎉', color: '#7cb342' },
              { value: stats.pending, label: 'In Progress', color: '#f4a7bb' }
            ].map((s, i) => (
              <div
                key={i}
                className="stat-card"
                style={{
                  background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
                  borderRadius: 20, padding: 22, textAlign: 'center',
                  boxShadow: '0 4px 20px rgba(61,43,31,0.06)', border: '1px solid #f0e8dc',
                  animation: `slideUp 0.5s ease-out both`, animationDelay: `${0.1 + i * 0.1}s`,
                  transition: 'transform 0.25s, box-shadow 0.25s'
                }}
              >
                <div style={{ fontSize: 34, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#888' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { value: 'all', label: 'All', icon: <ShoppingBag size={14} /> },
              { value: 'pending', label: 'Pending', icon: <Clock size={14} /> },
              { value: 'confirmed', label: 'Confirmed', icon: <CheckCircle size={14} /> },
              { value: 'preparing', label: 'Preparing', icon: <ChefHat size={14} /> },
              { value: 'ready', label: 'Ready', icon: <Truck size={14} /> },
              { value: 'delivered', label: 'Delivered', icon: <Package size={14} /> }
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px',
                  background: filter === f.value ? '#3d2b1f' : 'rgba(255,255,255,0.85)',
                  color: filter === f.value ? '#fff' : '#666',
                  border: filter === f.value ? 'none' : '1px solid #e0d5ca',
                  borderRadius: 40, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  transition: 'all 0.25s',
                  boxShadow: filter === f.value ? '0 6px 18px rgba(61,43,31,0.25)' : 'none',
                  transform: filter === f.value ? 'translateY(-1px)' : 'none'
                }}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <div style={{
                width: 60, height: 60, border: '3px solid #f0e8dc',
                borderTopColor: '#f4a7bb', borderRadius: '50%',
                animation: 'spin 1s linear infinite', margin: '0 auto 20px'
              }} />
              <div style={{ color: '#888' }}>Loading your orders...</div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: 80,
              background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
              borderRadius: 32, border: '1px solid #f0e8dc',
              animation: 'slideUp 0.5s ease-out'
            }}>
              <div style={{
                width: 100, height: 100, background: '#faf8f5', borderRadius: 50,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <ShoppingBag size={48} color="#ddd" />
              </div>
              <h3 style={{ fontSize: 20, color: '#3d2b1f', marginBottom: 8 }}>No orders yet</h3>
              <p style={{ color: '#888', marginBottom: 24 }}>Ready to satisfy your cravings?</p>
              <button style={{
                background: '#3d2b1f', color: '#fff', border: 'none',
                padding: '12px 28px', borderRadius: 40, fontWeight: 600,
                cursor: 'pointer', boxShadow: '0 8px 20px rgba(61,43,31,0.25)'
              }} onClick={() => navigate('/menu')}>
                Explore Menu →
              </button>
            </div>
          ) : (
            filteredOrders.map((o, i) => <OrderCard key={o._id} order={o} index={i} onCancel={cancel} onReview={setReviewOrder} />)
          )}
          </div>

        {reviewOrder && <ReviewModal order={reviewOrder} onClose={() => setReviewOrder(null)} onSubmit={() => setRefresh(r => r + 1)} />}

        <style>{`
          body.orders-route {
            min-height: 100vh;
          }
          body.orders-route #root {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          body.orders-route main {
            flex: 1 0 auto;
            display: flex;
            flex-direction: column;
          }
          body.orders-route main > * {
            flex: 1 0 auto;
            width: 100%;
          }
          body.orders-route footer {
            position: relative;
            z-index: 20;
            margin-top: 0 !important;
            flex-shrink: 0;
            opacity: 1;
          }
          body.orders-route footer * {
            opacity: 1;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes popIn {
            0% { opacity: 0; transform: scale(0.85); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @keyframes float {
            0%, 100% { transform: translate(0,0) rotate(0deg); }
            50% { transform: translate(15px,-25px) rotate(10deg); }
          }
          @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 4px rgba(244,167,187,0.3); }
            50% { box-shadow: 0 0 0 8px rgba(244,167,187,0.1); }
          }
          @keyframes shimmer {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
          }
          .order-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(61,43,31,0.1) !important; transition: all 0.3s; }
          .stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(61,43,31,0.1) !important; }
        `}</style>
      </div>

    </div>
    </>
  );
}