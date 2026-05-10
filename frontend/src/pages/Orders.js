import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  ShoppingBag, Clock, CheckCircle, Truck, Coffee, 
  Star, MessageCircle, XCircle, Calendar,
  MapPin, Phone, FileText, CreditCard,
  Package, Utensils, Award, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';

const STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
const STATUS_LABELS = { pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing', ready: 'Ready!', delivered: 'Delivered', cancelled: 'Cancelled' };
const STATUS_ICONS = { 
  pending: <Clock size={14} />, 
  confirmed: <CheckCircle size={14} />, 
  preparing: <ChefHat size={14} />, 
  ready: <Truck size={14} />, 
  delivered: <Package size={14} /> 
};
const STATUS_COLORS = {
  pending: '#f4a7bb',
  confirmed: '#fce38a',
  preparing: '#b8e1d4',
  ready: '#a8d8ea',
  delivered: '#c5e0b4',
  cancelled: '#ddd'
};

// Helper component for ChefHat since it wasn't imported
function ChefHat({ size, color }) {
  return <span style={{ fontSize: size, color: color }}>👨‍🍳</span>;
}

function StarRating({ value, onChange, readonly }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          style={{
            background: 'none',
            border: 'none',
            fontSize: 32,
            cursor: readonly ? 'default' : 'pointer',
            color: s <= (hover || value) ? '#f9b733' : '#e0e0e0',
            transition: 'transform 0.1s ease',
            padding: 0
          }}
          onClick={() => !readonly && onChange(s)}
          onMouseEnter={() => !readonly && setHover(s)}
          onMouseLeave={() => !readonly && setHover(0)}
        >
          ★
        </button>
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
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 32, maxWidth: 500, width: '100%',
        padding: 32, position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 70, height: 70, background: '#fff3e0', borderRadius: 35,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Award size={40} color="#f4a7bb" />
          </div>
          <h3 style={{ fontSize: 26, fontFamily: "'Playfair Display', serif", color: '#3d2b1f', marginBottom: 8 }}>Love What You Ate?</h3>
          <p style={{ color: '#888', fontSize: 14 }}>
            Order #{order._id.slice(-6).toUpperCase()} · {order.vendor?.name}
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#666', marginBottom: 12, textAlign: 'center' }}>
            How was your experience?
          </div>
          <div style={{ textAlign: 'center' }}>
            <StarRating value={rating} onChange={setRating} />
            {rating > 0 && (
              <div style={{ marginTop: 12, fontSize: 18, fontWeight: 600, color: '#f9b733' }}>
                {ratingEmojis[rating]} {ratingTexts[rating]}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#3d2b1f', marginBottom: 8 }}>
            Share your thoughts (optional)
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={4}
            placeholder="What did you love? Any suggestions for improvement?"
            style={{
              width: '100%', padding: 12, borderRadius: 16, border: '1px solid #e8e0d5',
              fontFamily: 'inherit', fontSize: 14, resize: 'vertical'
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

function OrderCard({ order, onCancel, onReview }) {
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
    const msg = encodeURIComponent(`Hi! I'm reaching out regarding Order #${order._id.slice(-6).toUpperCase()} placed on Grandma's Corner. Could you please provide an update?`);
    window.open(`https://wa.me/${num.replace(/^0/, '92')}?text=${msg}`, '_blank');
  };

  return (
    <div style={{
      background: '#fff', borderRadius: 24, marginBottom: 20,
      padding: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      border: '1px solid #f0e8dc', transition: 'all 0.2s ease'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{
              width: 8, height: 8, borderRadius: 4,
              background: STATUS_COLORS[order.status] || '#ddd'
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
            background: `${STATUS_COLORS[order.status]}20`,
            color: STATUS_COLORS[order.status]?.replace(/^#/, '') === 'ddd' ? '#666' : '#3d2b1f',
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
              display: 'flex', alignItems: 'center', gap: 6
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
                    boxShadow: isCurrent ? '0 0 0 3px rgba(61,43,31,0.2)' : 'none'
                  }}>
                    {isActive && i < statusIdx ? <CheckCircle size={20} /> : STATUS_ICONS[s]}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: isActive ? '#3d2b1f' : '#bbb', marginBottom: 4 }}>
                    {STATUS_LABELS[s]}
                  </div>
                  {isCurrent && order.status === 'ready' && (
                    <div style={{ fontSize: 10, color: '#f4a7bb' }}>Ready for pickup!</div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Progress bar */}
          <div style={{
            position: 'absolute', top: 20, left: '8%', right: '8%',
            height: 2, background: '#f0f0f0', zIndex: 0
          }}>
            <div style={{
              width: `${(statusIdx / (STATUSES.length - 1)) * 100}%`,
              height: 2, background: '#3d2b1f', transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {/* Expanded Details */}
      {open && (
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f0e8dc' }}>
          {/* Items */}
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

          {/* Delivery Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: '#faf8f5', borderRadius: 12 }}>
              <MapPin size={18} color="#f4a7bb" />
              <div style={{ fontSize: 13 }}>
                <div style={{ fontWeight: 500 }}>Delivery Address</div>
                <div style={{ color: '#666' }}>{order.deliveryAddress}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: '#faf8f5', borderRadius: 12 }}>
              <Phone size={18} color="#f4a7bb" />
              <div style={{ fontSize: 13 }}>
                <div style={{ fontWeight: 500 }}>Contact</div>
                <div style={{ color: '#666' }}>{order.phone}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: '#faf8f5', borderRadius: 12 }}>
              <CreditCard size={18} color="#f4a7bb" />
              <div style={{ fontSize: 13 }}>
                <div style={{ fontWeight: 500 }}>Payment</div>
                <div style={{ color: '#666' }}>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</div>
              </div>
            </div>
            {order.notes && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: '#faf8f5', borderRadius: 12 }}>
                <FileText size={18} color="#f4a7bb" />
                <div style={{ fontSize: 13 }}>
                  <div style={{ fontWeight: 500 }}>Special Notes</div>
                  <div style={{ color: '#666' }}>{order.notes}</div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
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
                  padding: '10px 20px', background: '#fef3cd', color: '#b7791f', border: 'none',
                  borderRadius: 40, fontSize: 13, fontWeight: 500, cursor: 'pointer',
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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF9F5 0%, #FAF4EA 100%)' }}>
      {/* Background Pattern */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30c0-1.1.9-2 2-2h8a2 2 0 0 1 0 4h-8a2 2 0 0 1-2-2z' fill='%23f4a7bb' fill-opacity='0.03'/%3E%3C/svg%3E")`,
        pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 80, height: 80, background: '#fff', borderRadius: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}>
            <Coffee size={36} color="#f4a7bb" />
          </div>
          <h1 style={{
            fontSize: 38, fontFamily: "'Playfair Display', serif",
            color: '#3d2b1f', marginBottom: 12, fontWeight: 700
          }}>
            Your Orders
          </h1>
          <p style={{ color: '#888', fontSize: 15, maxWidth: 450, margin: '0 auto' }}>
            Track your delicious journey with us
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 20, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f0e8dc' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#3d2b1f' }}>{stats.total}</div>
            <div style={{ fontSize: 13, color: '#888' }}>Total Orders</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 20, padding: 20, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f0e8dc' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#c5e0b4' }}>{stats.delivered}</div>
            <div style={{ fontSize: 13, color: '#888' }}>Delivered 🎉</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 20, padding: 20, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f0e8dc' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#f4a7bb' }}>{stats.pending}</div>
            <div style={{ fontSize: 13, color: '#888' }}>In Progress</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { value: 'all', label: 'All Orders', icon: <ShoppingBag size={14} /> },
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
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px',
                background: filter === f.value ? '#3d2b1f' : '#fff',
                color: filter === f.value ? '#fff' : '#666',
                border: filter === f.value ? 'none' : '1px solid #e0d5ca',
                borderRadius: 40, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
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
            textAlign: 'center', padding: 80, background: '#fff', borderRadius: 32,
            border: '1px solid #f0e8dc'
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
              cursor: 'pointer'
            }} onClick={() => navigate('/menu')}>
              Explore Menu →
            </button>
          </div>
        ) : (
          filteredOrders.map(o => <OrderCard key={o._id} order={o} onCancel={cancel} onReview={setReviewOrder} />)
        )}
      </div>

      {reviewOrder && <ReviewModal order={reviewOrder} onClose={() => setReviewOrder(null)} onSubmit={() => setRefresh(r => r + 1)} />}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}