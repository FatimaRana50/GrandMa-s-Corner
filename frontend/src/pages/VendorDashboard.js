import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { imgUrl } from '../utils/api';

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
const STATUS_LABELS = { pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing', ready: 'Ready!', delivered: 'Delivered', cancelled: 'Cancelled' };
const NEXT_ACTION = { pending: { label: 'Confirm', next: 'confirmed', color: '#004085' }, confirmed: { label: 'Start Prep', next: 'preparing', color: '#8a4000' }, preparing: { label: 'Mark Ready', next: 'ready', color: '#155724' }, ready: { label: 'Delivered', next: 'delivered', color: 'var(--green)' } };



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

  const loadOrders = () => api.get('/orders').then(r => setOrders(r.data));
  const loadMenu = () => api.get('/menu?vendor=' + user._id).then(r => setMenuItems(r.data));
  const loadReviews = async () => {
    if (!user?._id) return;
    try {
      const { data } = await api.get(`/reviews/vendor/${user._id}`);
      setReviews(data.reviews);
      setAvgRating(data.avgRating);
    } catch {}
  };

  useEffect(() => {
    if (!user?._id) return;
    Promise.all([loadOrders(), loadMenu(), loadReviews()]).finally(() => setLoading(false));
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [user?._id]);

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

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 16px 60px' }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#3d2b1f', marginBottom: 4 }}>Vendor Dashboard</div>
      <div style={{ fontSize: 13, color: '#aaa', marginBottom: 24 }}>Welcome, {user?.name} · Auto-refreshes every 30 sec</div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Pending', val: counts.pending || 0, color: '#fff3cd', text: '#856404' },
          { label: 'Preparing', val: (counts.confirmed || 0) + (counts.preparing || 0), color: '#fde8d0', text: '#8a4000' },
          { label: 'Ready', val: counts.ready || 0, color: '#d4edda', text: '#155724' },
          { label: 'Total Orders', val: orders.length, color: 'var(--mint-light)', text: '#3d2b1f' },
          { label: 'Revenue', val: `Rs ${revenue.toLocaleString()}`, color: '#e8f5ef', text: '#1a5c38' },
          { label: 'Rating', val: avgRating ? `${avgRating}⭐` : 'N/A', color: '#fff3cd', text: '#856404' },
        ].map(s => (
          <div key={s.label} style={{ background: s.color, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: s.text, textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</div>
            <div style={{ fontSize: s.label === 'Revenue' ? 16 : 26, fontWeight: 900, color: s.text, fontFamily: "'Playfair Display', serif", marginTop: 4 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: 24, overflowX: 'auto' }}>
        {TABS.map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', padding: '12px 20px', fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 800, color: tab === t ? '#3d2b1f' : '#aaa', borderBottom: `2px solid ${tab === t ? 'var(--pink)' : 'transparent'}`, marginBottom: -2, cursor: 'pointer', whiteSpace: 'nowrap' }}>{label}</button>
        ))}
      </div>

      {/* ORDERS TAB */}
      {tab === 'orders' && (
        <div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {['all', ...STATUS_FLOW, 'cancelled'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-outline'}`}>
                {s === 'all' ? 'All' : STATUS_LABELS[s]} {s !== 'all' && orders.filter(o => o.status === s).length > 0 && `(${orders.filter(o => o.status === s).length})`}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>No orders with this status</div>
          ) : filtered.map(order => (
            <div key={order._id} className="card" style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#3d2b1f', fontSize: 15 }}>Order #{order._id.slice(-6).toUpperCase()}</div>
                  <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
                    👤 {order.customer?.name} &nbsp;·&nbsp; 📞 {order.customer?.phone}
                  </div>
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className={`badge badge-${order.status}`}>{STATUS_LABELS[order.status]}</span>
                  <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: 'var(--green)' }}>Rs {order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{ fontSize: 13, color: '#555', padding: '3px 0', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.name} <span style={{ color: '#aaa', fontSize: 11 }}>{item.unit}</span></span>
                    <span>×{item.quantity} = Rs {item.subtotal.toLocaleString()}</span>
                  </div>
                ))}
                {order.deliveryAddress && <div style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>📍 {order.deliveryAddress}</div>}
                {order.notes && <div style={{ fontSize: 12, color: '#aaa' }}>📝 {order.notes}</div>}
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
          ))}
        </div>
      )}

      {/* MENU TAB */}
      {tab === 'menu' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: '#888', fontSize: 13 }}>{menuItems.length} items</div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowNewItem(true)}>+ Add Item</button>
          </div>

          {/* ADD NEW ITEM FORM */}
          {showNewItem && (
            <div className="card" style={{ marginBottom: 16, border: '2px solid var(--mint)' }}>
              <div style={{ fontWeight: 800, marginBottom: 14, color: '#3d2b1f' }}>Add New Item</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Item Name</label>
                  <input value={newItem.name} onChange={e => setNewItem(n => ({ ...n, name: e.target.value }))} placeholder="e.g. Chicken Samosa" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Price (Rs)</label>
                  <input type="number" value={newItem.price} onChange={e => setNewItem(n => ({ ...n, price: e.target.value }))} placeholder="840" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Unit</label>
                  <input value={newItem.unit} onChange={e => setNewItem(n => ({ ...n, unit: e.target.value }))} placeholder="per dozen (12)" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Category</label>
                  <select value={newItem.category} onChange={e => setNewItem(n => ({ ...n, category: e.target.value }))}>
                    <option value="frozen">Frozen Snacks</option>
                    <option value="tea">Tea Party</option>
                    <option value="kids">Kids Lunch</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 12, marginBottom: 0 }}>
                <label>Description</label>
                <input value={newItem.description} onChange={e => setNewItem(n => ({ ...n, description: e.target.value }))} placeholder="Short description..." />
              </div>
              {/* IMAGE UPLOAD */}
              <div className="form-group" style={{ marginTop: 12, marginBottom: 12 }}>
                <label>Item Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setNewItem(n => ({ ...n, imageFile: e.target.files[0] }))}
                  style={{ padding: '8px 0', fontSize: 13, width: '100%' }}
                />
                {newItem.imageFile && (
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                      src={URL.createObjectURL(newItem.imageFile)}
                      alt="preview"
                      style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 10, border: '2px solid var(--mint)' }}
                    />
                    <div style={{ fontSize: 12, color: '#888' }}>
                      {newItem.imageFile.name}<br />
                      <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓ Image ready</span>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={addNewItem}>Add Item</button>
                <button className="btn btn-outline btn-sm" onClick={() => { setShowNewItem(false); setNewItem({ name: '', price: '', unit: '', category: 'frozen', description: '', imageFile: null }); }}>Cancel</button>
              </div>
            </div>
          )}

          {/* MENU ITEMS LIST */}
          <div style={{ display: 'grid', gap: 10 }}>
            {menuItems.map(item => (
              <div key={item._id} className="card" style={{ opacity: item.available ? 1 : 0.6 }}>

                {/* EDIT MODE */}
                {editItem?._id === item._id ? (
                  <div>
                    <div style={{ fontWeight: 800, marginBottom: 12, color: '#3d2b1f', fontSize: 14 }}>Editing: {item.name}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                      <input value={editItem.name} onChange={e => setEditItem(i => ({ ...i, name: e.target.value }))} placeholder="Name" style={{ padding: '7px 10px', border: '1.5px solid var(--border)', borderRadius: 8, fontFamily: 'Nunito,sans-serif', fontSize: 14 }} />
                      <input type="number" value={editItem.price} onChange={e => setEditItem(i => ({ ...i, price: Number(e.target.value) }))} placeholder="Price" style={{ padding: '7px 10px', border: '1.5px solid var(--border)', borderRadius: 8, fontFamily: 'Nunito,sans-serif', fontSize: 14 }} />
                      <input value={editItem.unit || ''} onChange={e => setEditItem(i => ({ ...i, unit: e.target.value }))} placeholder="Unit" style={{ padding: '7px 10px', border: '1.5px solid var(--border)', borderRadius: 8, fontFamily: 'Nunito,sans-serif', fontSize: 14 }} />
                      <input value={editItem.description || ''} onChange={e => setEditItem(i => ({ ...i, description: e.target.value }))} placeholder="Description" style={{ padding: '7px 10px', border: '1.5px solid var(--border)', borderRadius: 8, fontFamily: 'Nunito,sans-serif', fontSize: 14 }} />
                    </div>
                    {/* IMAGE UPLOAD IN EDIT MODE */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Item Image</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        {/* Show existing or new preview */}
                        {editItem.imageFile ? (
                          <img src={URL.createObjectURL(editItem.imageFile)} alt="new"
                            style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, border: '2px solid var(--mint)' }} />
                        ) : editItem.image ? (
                          <img src={imgUrl(editItem.image)} alt={editItem.name}
                            style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, border: '2px solid var(--border)' }} />
                        ) : (
                          <div style={{ width: 64, height: 64, borderRadius: 10, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🍽️</div>
                        )}
                        <div>
                          <input type="file" accept="image/*"
                            onChange={e => setEditItem(i => ({ ...i, imageFile: e.target.files[0] }))}
                            style={{ fontSize: 12 }} />
                          {editItem.image && !editItem.imageFile && (
                            <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>Upload a new image to replace the current one</div>
                          )}
                          {editItem.imageFile && (
                            <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, marginTop: 4 }}>✓ New image selected</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-success btn-sm" onClick={saveEditItem}>Save Changes</button>
                      <button className="btn btn-outline btn-sm" onClick={() => setEditItem(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  /* VIEW MODE */
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {/* Item image or placeholder */}
                    {item.image ? (
                      <img src={imgUrl(item.image)} alt={item.name}
                        style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, flexShrink: 0, border: '1.5px solid var(--border)' }} />
                    ) : (
                      <div style={{ width: 64, height: 64, borderRadius: 10, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, border: '1.5px dashed var(--border)' }}>🍽️</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: '#aaa' }}>{item.unit} · {item.category}</div>
                      {item.description && <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{item.description}</div>}
                      {!item.image && <div style={{ fontSize: 11, color: '#ccc', marginTop: 3 }}>No image · click Edit to add one</div>}
                    </div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: 'var(--green)', whiteSpace: 'nowrap' }}>Rs {item.price.toLocaleString()}</div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
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
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, background: 'var(--cream)', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 40, color: '#f9b733' }}>{avgRating || '—'}</div>
            <div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 20, color: s <= Math.round(avgRating) ? '#f9b733' : '#ddd' }}>★</span>)}
              </div>
              <div style={{ fontSize: 13, color: '#888', fontWeight: 700 }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>No reviews yet</div>
          ) : reviews.map(r => (
            <div key={r._id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{r.customer?.name}</div>
                  <div style={{ fontSize: 11, color: '#aaa' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 16, color: s <= r.rating ? '#f9b733' : '#ddd' }}>★</span>)}
                </div>
              </div>
              {r.comment && <p style={{ fontSize: 14, color: '#555', lineHeight: 1.5 }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}