import React, { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { imgUrl } from '../utils/api';

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
const STATUS_LABELS = { pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing', ready: 'Ready!', delivered: 'Delivered', cancelled: 'Cancelled' };
const STATUS_COLORS = {
  pending:    { bg: 'linear-gradient(135deg,#fff3cd,#fff9e3)', fg: '#856404', dot: '#f4b400' },
  confirmed:  { bg: 'linear-gradient(135deg,#cce5ff,#e7f1ff)', fg: '#004085', dot: '#2563eb' },
  preparing:  { bg: 'linear-gradient(135deg,#fde8d0,#fff2e0)', fg: '#8a4000', dot: '#ea7c1c' },
  ready:      { bg: 'linear-gradient(135deg,#d4edda,#e8f5ec)', fg: '#155724', dot: '#22c55e' },
  delivered:  { bg: 'linear-gradient(135deg,#d4f1e0,#eaf9f0)', fg: '#1a5c38', dot: '#16a34a' },
  cancelled:  { bg: 'linear-gradient(135deg,#ffe0e0,#fff0f0)', fg: '#a02838', dot: '#dc2626' },
};
const NEXT_ACTION = {
  pending:   { label: 'Confirm Order',   next: 'confirmed' },
  confirmed: { label: 'Start Preparing', next: 'preparing' },
  preparing: { label: 'Mark Ready',      next: 'ready' },
  ready:     { label: 'Mark Delivered',  next: 'delivered' },
};

const FOOD_BG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=60';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('orders');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editItem, setEditItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', price: '', unit: '', category: 'frozen', description: '', imageFile: null });
  const [showNewItem, setShowNewItem] = useState(false);

  const loadOrders = useCallback(() => api.get('/orders').then(r => setOrders(r.data)), []);
  const loadMenu = useCallback(() => api.get('/menu?vendor=' + user._id).then(r => setMenuItems(r.data)), [user?._id]);
  const loadReviews = useCallback(async () => {
    if (!user?._id) return;
    try {
      const { data } = await api.get(`/reviews/vendor/${user._id}`);
      setReviews(data.reviews);
      setAvgRating(data.avgRating);
    } catch {}
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;
    Promise.all([loadOrders(), loadMenu(), loadReviews()]).finally(() => setLoading(false));
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [user?._id, loadOrders, loadMenu, loadReviews]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success(`Order ${STATUS_LABELS[status]}!`);
      loadOrders();
    } catch { toast.error('Failed to update status'); }
  };

  const whatsappCustomer = (order) => {
    const phone = order.customer?.phone?.replace(/[^0-9]/g, '');
    if (!phone) { toast.error('Customer phone not available'); return; }
    const num = phone.startsWith('92') ? phone : `92${phone.replace(/^0/, '')}`;
    const msg = encodeURIComponent(`Hi ${order.customer?.name}! This is ${user?.name} from Grandma's Corner. Your order #${order._id.slice(-6).toUpperCase()} status: ${STATUS_LABELS[order.status]}. Thank you! 🌿`);
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
  };

  const toggleAvailable = async (item) => {
    try {
      const formData = new FormData();
      formData.append('available', !item.available);
      await api.put(`/menu/${item._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`${item.name} ${!item.available ? 'enabled' : 'disabled'}`);
      loadMenu();
    } catch { toast.error('Failed'); }
  };

  const saveEditItem = async () => {
    try {
      const formData = new FormData();
      formData.append('name', editItem.name);
      formData.append('price', editItem.price);
      formData.append('unit', editItem.unit || '');
      formData.append('description', editItem.description || '');
      formData.append('category', editItem.category || 'frozen');
      if (editItem.imageFile) formData.append('image', editItem.imageFile);
      await api.put(`/menu/${editItem._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Item updated');
      setEditItem(null);
      loadMenu();
    } catch { toast.error('Failed to update'); }
  };

  const addNewItem = async () => {
    if (!newItem.name || !newItem.price) { toast.error('Name and price are required'); return; }
    try {
      const formData = new FormData();
      formData.append('name', newItem.name);
      formData.append('price', newItem.price);
      formData.append('unit', newItem.unit);
      formData.append('category', newItem.category);
      formData.append('description', newItem.description);
      if (newItem.imageFile) formData.append('image', newItem.imageFile);
      await api.post('/menu', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Item added!');
      setShowNewItem(false);
      setNewItem({ name: '', price: '', unit: '', category: 'frozen', description: '', imageFile: null });
      loadMenu();
    } catch { toast.error('Failed to add item'); }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try { await api.delete(`/menu/${id}`); toast.success('Deleted'); loadMenu(); }
    catch { toast.error('Failed'); }
  };

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);
  const counts = STATUS_FLOW.reduce((acc, s) => { acc[s] = orders.filter(o => o.status === s).length; return acc; }, {});
  const revenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.totalAmount, 0);

  if (loading) return <div className="spinner" style={{ marginTop: 60 }} />;

  const TABS = [['orders', '📦 Orders'], ['menu', '🍽️ Menu'], ['reviews', '⭐ Reviews']];

  // ---------- shared styles ----------
  const glass = {
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.6)',
    borderRadius: 16,
    boxShadow: '0 8px 24px rgba(61,43,31,0.08)',
    transition: 'transform .25s ease, box-shadow .25s ease',
  };
  const inputStyle = {
    padding: '10px 12px', border: '1.5px solid rgba(0,0,0,.08)',
    borderRadius: 10, fontFamily: 'Nunito,sans-serif', fontSize: 14,
    background: 'rgba(255,255,255,.85)', outline: 'none', width: '100%'
  };

  const STAT_CARDS = [
    { label: 'Pending',      val: counts.pending || 0,                                  icon: '⏳', bg: 'linear-gradient(135deg,#fff3cd,#fff9e3)', color: '#856404' },
    { label: 'Preparing',    val: (counts.confirmed || 0) + (counts.preparing || 0),   icon: '🔥', bg: 'linear-gradient(135deg,#fde8d0,#fff2e0)', color: '#8a4000' },
    { label: 'Ready',        val: counts.ready || 0,                                    icon: '✅', bg: 'linear-gradient(135deg,#d4edda,#e8f5ec)', color: '#155724' },
    { label: 'Total Orders', val: orders.length,                                        icon: '📦', bg: 'linear-gradient(135deg,#cce5ff,#e7f1ff)', color: '#004085' },
    { label: 'Revenue',      val: `Rs ${revenue.toLocaleString()}`,                     icon: '💰', bg: 'linear-gradient(135deg,#d4f1e0,#eaf9f0)', color: '#1a5c38' },
    { label: 'Rating',       val: avgRating ? `${avgRating} ★` : 'N/A',                 icon: '⭐', bg: 'linear-gradient(135deg,#fff4d6,#fff9e3)', color: '#7a5800' },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', paddingBottom: 60 }}>
      {/* Background + warm overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: -2,
        backgroundImage: `url(${FOOD_BG})`,
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
        filter: 'blur(2px)'
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: -1,
        background: 'linear-gradient(135deg, rgba(255,243,232,0.92) 0%, rgba(255,228,235,0.88) 50%, rgba(212,237,218,0.9) 100%)'
      }} />

      {/* Floating emojis */}
      {['🍕','🥐','🍰','🍩','🥗','🍔'].map((e, i) => (
        <div key={i} style={{
          position: 'fixed', fontSize: 38, opacity: 0.18, zIndex: 0,
          top: `${10 + (i * 13) % 80}%`, left: `${5 + (i * 17) % 90}%`,
          animation: `floatA ${8 + i}s ease-in-out infinite`,
          animationDelay: `${i * 0.7}s`, pointerEvents: 'none'
        }}>{e}</div>
      ))}

      <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
        {/* HEADER */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28,
          animation: 'slideDown .5s ease'
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #ff7eb3, #7ed7c1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, boxShadow: '0 8px 22px rgba(255,126,179,0.35)'
          }}>🍴</div>
          <div style={{ flex: 1 }}>
            <h1 style={{
              margin: 0, fontFamily: "'Playfair Display',serif", fontSize: 32,
              fontWeight: 700, color: '#3d2b1f', letterSpacing: '-.02em'
            }}>Vendor Dashboard</h1>
            <p style={{ margin: '4px 0 0', color: '#7a6b5d', fontSize: 13 }}>
              Welcome back, <strong style={{ color: '#5a4636' }}>{user?.name}</strong> · Auto-refreshes every 30 sec
            </p>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,.7)', backdropFilter: 'blur(10px)',
            color: '#1a5c38', padding: '8px 14px', borderRadius: 999,
            fontSize: 12, fontWeight: 800, border: '1px solid rgba(255,255,255,.6)'
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
              boxShadow: '0 0 0 4px rgba(34,197,94,.18)', animation: 'pulse 2s infinite'
            }} />
            LIVE
          </div>
        </div>

        {/* TABS */}
        <div style={{
          display: 'flex', gap: 6, padding: 6, marginBottom: 24,
          background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)',
          borderRadius: 14, border: '1px solid rgba(255,255,255,0.6)',
          flexWrap: 'wrap'
        }}>
          {TABS.map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: '1 0 auto',
              background: tab === t ? 'linear-gradient(135deg, #ff7eb3, #7ed7c1)' : 'transparent',
              border: 'none', padding: '11px 18px',
              fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 800,
              color: tab === t ? '#fff' : '#7a6b5d',
              borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap',
              boxShadow: tab === t ? '0 4px 14px rgba(255,126,179,0.35)' : 'none',
              transition: 'all .25s ease'
            }}>{label}</button>
          ))}
        </div>

        {/* STAT CARDS */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))',
          gap: 14, marginBottom: 28
        }}>
          {STAT_CARDS.map((s, i) => (
            <div key={s.label} style={{
              ...glass, background: s.bg, padding: 18,
              animation: `popIn .5s ease ${i * 0.05}s both`,
              position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(61,43,31,0.14)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 24px rgba(61,43,31,0.08)'; }}>
              <div style={{ position: 'absolute', top: 10, right: 12, fontSize: 28, opacity: .4 }}>{s.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: s.color, textTransform: 'uppercase', letterSpacing: '.08em', opacity: .85 }}>{s.label}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: s.label === 'Revenue' ? 20 : 28, fontWeight: 900, color: s.color, marginTop: 6, lineHeight: 1.1 }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          <div style={{ animation: 'fadeIn .4s ease' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {['all', ...STATUS_FLOW, 'cancelled'].map(s => {
                const active = filterStatus === s;
                const count = s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
                return (
                  <button key={s} onClick={() => setFilterStatus(s)} style={{
                    background: active ? 'linear-gradient(135deg,#ff7eb3,#7ed7c1)' : 'rgba(255,255,255,.7)',
                    color: active ? '#fff' : '#5a4636',
                    border: '1px solid rgba(255,255,255,.6)',
                    padding: '7px 14px', borderRadius: 999, backdropFilter: 'blur(8px)',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    boxShadow: active ? '0 4px 12px rgba(255,126,179,.3)' : 'none',
                    transition: 'all .2s'
                  }}>
                    {s === 'all' ? 'All' : STATUS_LABELS[s]}
                    {count > 0 && (
                      <span style={{
                        background: active ? 'rgba(255,255,255,.25)' : '#f0e9df',
                        color: active ? '#fff' : '#7a6450',
                        fontSize: 11, padding: '1px 7px', borderRadius: 999, fontWeight: 800
                      }}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {filtered.length === 0 ? (
              <div style={{ ...glass, textAlign: 'center', padding: '60px 20px', color: '#a89a8b' }}>
                <div style={{ fontSize: 56, marginBottom: 8, opacity: .55 }}>📭</div>
                <div style={{ fontWeight: 700 }}>No orders with this status</div>
              </div>
            ) : filtered.map((order, i) => {
              const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
              return (
                <div key={order._id} style={{
                  ...glass, padding: 20, marginBottom: 14,
                  borderLeft: `4px solid ${sc.dot}`,
                  animation: `popIn .4s ease ${Math.min(i, 8) * 0.04}s both`
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 30px rgba(61,43,31,0.14)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 24px rgba(61,43,31,0.08)'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#3d2b1f', fontSize: 17 }}>
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span style={{
                          background: sc.bg, color: sc.fg,
                          fontSize: 11, fontWeight: 800, padding: '4px 10px',
                          borderRadius: 999, textTransform: 'uppercase', letterSpacing: '.05em'
                        }}>
                          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: sc.dot, marginRight: 6, verticalAlign: 'middle' }} />
                          {STATUS_LABELS[order.status]}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: '#7a6b5d', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                        <span>👤 {order.customer?.name}</span>
                        <span>📞 {order.customer?.phone}</span>
                        <span style={{ color: '#a89a8b' }}>🕒 {new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 800, color: '#1a5c38' }}>
                      Rs {order.totalAmount.toLocaleString()}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,243,232,0.55)', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ fontSize: 13, color: '#5a4636', padding: '4px 0', display: 'flex', justifyContent: 'space-between', borderBottom: idx < order.items.length - 1 ? '1px dashed rgba(0,0,0,.08)' : 'none' }}>
                        <span><span style={{ fontWeight: 700 }}>{item.name}</span> <span style={{ color: '#a89a8b', fontSize: 11 }}>{item.unit}</span></span>
                        <span style={{ color: '#7a6450' }}>×{item.quantity} · <span style={{ fontWeight: 700, color: '#3d2b1f' }}>Rs {item.subtotal.toLocaleString()}</span></span>
                      </div>
                    ))}
                    {order.deliveryAddress && <div style={{ fontSize: 12, color: '#8a7a6d', marginTop: 8 }}>📍 {order.deliveryAddress}</div>}
                    {order.notes && <div style={{ fontSize: 12, color: '#8a7a6d', marginTop: 4 }}>📝 {order.notes}</div>}
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {NEXT_ACTION[order.status] && (
                      <button className="btn btn-sm btn-success" onClick={() => updateStatus(order._id, NEXT_ACTION[order.status].next)}>
                        ✓ {NEXT_ACTION[order.status].label}
                      </button>
                    )}
                    <button className="btn btn-sm btn-whatsapp" onClick={() => whatsappCustomer(order)}>💬 WhatsApp Customer</button>
                    {order.status === 'pending' && (
                      <button className="btn btn-sm btn-danger" onClick={() => updateStatus(order._id, 'cancelled')}>Cancel</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MENU TAB */}
        {tab === 'menu' && (
          <div style={{ animation: 'fadeIn .4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ color: '#5a4636', fontSize: 13, fontWeight: 700 }}>
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: '#3d2b1f', marginRight: 8 }}>🍽️ {menuItems.length}</span>
                items in your menu
              </div>
              <button onClick={() => setShowNewItem(true)} style={{
                background: 'linear-gradient(135deg,#ff7eb3,#7ed7c1)', color: '#fff',
                border: 'none', padding: '10px 18px', borderRadius: 10,
                fontWeight: 800, fontSize: 13, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(255,126,179,.35)'
              }}>+ Add New Item</button>
            </div>

            {/* ADD NEW ITEM */}
            {showNewItem && (
              <div style={{ ...glass, padding: 22, marginBottom: 18, border: '2px solid rgba(126,215,193,.6)', animation: 'popIn .3s ease' }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#3d2b1f' }}>✨ Add New Item</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Item Name</label>
                    <input style={inputStyle} value={newItem.name} onChange={e => setNewItem(n => ({ ...n, name: e.target.value }))} placeholder="e.g. Chicken Samosa" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Price (Rs)</label>
                    <input style={inputStyle} type="number" value={newItem.price} onChange={e => setNewItem(n => ({ ...n, price: e.target.value }))} placeholder="840" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Unit</label>
                    <input style={inputStyle} value={newItem.unit} onChange={e => setNewItem(n => ({ ...n, unit: e.target.value }))} placeholder="per dozen (12)" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Category</label>
                    <select style={inputStyle} value={newItem.category} onChange={e => setNewItem(n => ({ ...n, category: e.target.value }))}>
                      <option value="frozen">Frozen Snacks</option>
                      <option value="tea">Tea Party</option>
                      <option value="kids">Kids Lunch</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: 12, marginBottom: 0 }}>
                  <label>Description</label>
                  <input style={inputStyle} value={newItem.description} onChange={e => setNewItem(n => ({ ...n, description: e.target.value }))} placeholder="Short description..." />
                </div>
                <div className="form-group" style={{ marginTop: 12, marginBottom: 14 }}>
                  <label>Item Image (optional)</label>
                  <input type="file" accept="image/*" onChange={e => setNewItem(n => ({ ...n, imageFile: e.target.files[0] }))} style={{ padding: '8px 0', fontSize: 13, width: '100%' }} />
                  {newItem.imageFile && (
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,.7)', padding: 10, borderRadius: 12 }}>
                      <img src={URL.createObjectURL(newItem.imageFile)} alt="preview" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 10, border: '2px solid #7ed7c1' }} />
                      <div style={{ fontSize: 12, color: '#7a6450' }}>
                        <div style={{ fontWeight: 700, color: '#3d2b1f' }}>{newItem.imageFile.name}</div>
                        <div style={{ color: '#1a5c38', fontWeight: 700, marginTop: 2 }}>✓ Image ready</div>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={addNewItem} style={{
                    background: 'linear-gradient(135deg,#ff7eb3,#7ed7c1)', color: '#fff',
                    border: 'none', padding: '9px 18px', borderRadius: 10,
                    fontWeight: 800, fontSize: 13, cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(255,126,179,.3)'
                  }}>Add Item</button>
                  <button className="btn btn-outline btn-sm" onClick={() => { setShowNewItem(false); setNewItem({ name: '', price: '', unit: '', category: 'frozen', description: '', imageFile: null }); }}>Cancel</button>
                </div>
              </div>
            )}

            {/* MENU ITEMS */}
            <div style={{ display: 'grid', gap: 12 }}>
              {menuItems.map((item, i) => (
                <div key={item._id} style={{
                  ...glass, padding: 16, opacity: item.available ? 1 : 0.6,
                  position: 'relative', animation: `popIn .4s ease ${Math.min(i, 8) * 0.04}s both`
                }}
                onMouseEnter={e => { if (editItem?._id !== item._id) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 30px rgba(61,43,31,0.14)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 24px rgba(61,43,31,0.08)'; }}>
                  {!item.available && (
                    <div style={{
                      position: 'absolute', top: 12, right: 14,
                      background: 'linear-gradient(135deg,#ffe0e0,#fff0f0)', color: '#a02838',
                      fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 999,
                      textTransform: 'uppercase', letterSpacing: '.05em'
                    }}>Disabled</div>
                  )}

                  {editItem?._id === item._id ? (
                    <div>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, marginBottom: 14, color: '#3d2b1f', fontSize: 16 }}>✏️ Editing: {item.name}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, marginBottom: 12 }}>
                        <input style={inputStyle} value={editItem.name} onChange={e => setEditItem(i => ({ ...i, name: e.target.value }))} placeholder="Name" />
                        <input style={inputStyle} type="number" value={editItem.price} onChange={e => setEditItem(i => ({ ...i, price: Number(e.target.value) }))} placeholder="Price" />
                        <input style={inputStyle} value={editItem.unit || ''} onChange={e => setEditItem(i => ({ ...i, unit: e.target.value }))} placeholder="Unit" />
                        <input style={inputStyle} value={editItem.description || ''} onChange={e => setEditItem(i => ({ ...i, description: e.target.value }))} placeholder="Description" />
                      </div>
                      <div style={{ marginBottom: 14, padding: 12, background: 'rgba(255,243,232,.55)', borderRadius: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#7a6450', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Item Image</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          {editItem.imageFile ? (
                            <img src={URL.createObjectURL(editItem.imageFile)} alt="new" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 12, border: '2px solid #7ed7c1' }} />
                          ) : editItem.image ? (
                            <img src={imgUrl(editItem.image)} alt={editItem.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 12, border: '2px solid rgba(0,0,0,.08)' }} />
                          ) : (
                            <div style={{ width: 72, height: 72, borderRadius: 12, background: 'linear-gradient(135deg,#fff3cd,#fff9e3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🍽️</div>
                          )}
                          <div>
                            <input type="file" accept="image/*" onChange={e => setEditItem(i => ({ ...i, imageFile: e.target.files[0] }))} style={{ fontSize: 12 }} />
                            {editItem.image && !editItem.imageFile && <div style={{ fontSize: 11, color: '#a89a8b', marginTop: 4 }}>Upload to replace current image</div>}
                            {editItem.imageFile && <div style={{ fontSize: 11, color: '#1a5c38', fontWeight: 700, marginTop: 4 }}>✓ New image selected</div>}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-success btn-sm" onClick={saveEditItem}>Save Changes</button>
                        <button className="btn btn-outline btn-sm" onClick={() => setEditItem(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      {item.image ? (
                        <img src={imgUrl(item.image)} alt={item.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 12, flexShrink: 0, border: '1.5px solid rgba(0,0,0,.08)' }} />
                      ) : (
                        <div style={{ width: 72, height: 72, borderRadius: 12, background: 'linear-gradient(135deg,#fff3cd,#fde8d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>🍽️</div>
                      )}
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: '#3d2b1f' }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: '#a89a8b', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span>{item.unit}</span>
                          <span style={{ background: 'linear-gradient(135deg,#fde8d0,#fff2e0)', color: '#8a4000', padding: '2px 8px', borderRadius: 6, fontWeight: 700, fontSize: 11 }}>{item.category}</span>
                        </div>
                        {item.description && <div style={{ fontSize: 12, color: '#7a6b5d', marginTop: 5 }}>{item.description}</div>}
                      </div>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 800, color: '#1a5c38', whiteSpace: 'nowrap' }}>Rs {item.price.toLocaleString()}</div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                        <button className={`btn btn-sm ${item.available ? 'btn-outline' : 'btn-success'}`} onClick={() => toggleAvailable(item)}>{item.available ? 'Disable' : 'Enable'}</button>
                        <button className="btn btn-sm btn-outline" onClick={() => setEditItem({ ...item, imageFile: null })}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteItem(item._id)}>Del</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {tab === 'reviews' && (
          <div style={{ animation: 'fadeIn .4s ease' }}>
            <div style={{
              ...glass, display: 'flex', alignItems: 'center', gap: 24,
              marginBottom: 22, padding: '24px 28px',
              background: 'linear-gradient(135deg, rgba(255,244,214,0.9), rgba(255,232,168,0.85))'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 56, fontWeight: 800, color: '#7a5800', lineHeight: 1 }}>{avgRating || '—'}</div>
                <div style={{ fontSize: 11, color: '#7a5800', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 4 }}>out of 5</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 28, color: s <= Math.round(avgRating) ? '#f9b733' : 'rgba(255,255,255,.7)' }}>★</span>)}
                </div>
                <div style={{ fontSize: 13, color: '#7a5800', fontWeight: 700 }}>
                  Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div style={{ ...glass, textAlign: 'center', padding: '60px 20px', color: '#a89a8b' }}>
                <div style={{ fontSize: 56, marginBottom: 8, opacity: .55 }}>💬</div>
                <div style={{ fontWeight: 700 }}>No reviews yet</div>
              </div>
            ) : reviews.map((r, i) => (
              <div key={r._id} style={{
                ...glass, padding: 18, marginBottom: 12,
                animation: `popIn .4s ease ${Math.min(i, 8) * 0.04}s both`
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 30px rgba(61,43,31,0.14)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 24px rgba(61,43,31,0.08)'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#ff7eb3,#7ed7c1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, color: '#fff', fontSize: 18,
                      fontFamily: "'Playfair Display',serif",
                      boxShadow: '0 4px 12px rgba(255,126,179,.3)'
                    }}>{(r.customer?.name || '?')[0].toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#3d2b1f' }}>{r.customer?.name}</div>
                      <div style={{ fontSize: 11, color: '#a89a8b' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 16, color: s <= r.rating ? '#f9b733' : '#e6dccd' }}>★</span>)}
                  </div>
                </div>
                {r.comment && <p style={{ fontSize: 14, color: '#5a4636', lineHeight: 1.6, margin: 0, paddingLeft: 56 }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes popIn { from { opacity:0; transform:scale(.92) translateY(8px) } to { opacity:1; transform:scale(1) translateY(0) } }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,.4); }
          50% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }
        @keyframes floatA {
          0%,100% { transform:translateY(0) rotate(0deg) }
          50% { transform:translateY(-22px) rotate(8deg) }
        }
      `}</style>
    </div>
  );
}
