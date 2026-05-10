import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STATUS_LABELS = { pending:'Pending',confirmed:'Confirmed',preparing:'Preparing',ready:'Ready',delivered:'Delivered',cancelled:'Cancelled' };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  const loadAll = () => Promise.all([
    api.get('/admin/stats').then(r => setStats(r.data)),
    api.get('/admin/users').then(r => setUsers(r.data)),
    api.get('/admin/vendors').then(r => setVendors(r.data)),
    api.get('/admin/orders').then(r => setOrders(r.data)),
  ]);

  useEffect(() => { loadAll().finally(() => setLoading(false)); }, []);

  const toggleActive = async (id, name, isActive) => {
    if (!window.confirm(`${isActive ? 'Deactivate' : 'Activate'} ${name}? They will be notified by email.`)) return;
    try {
      await api.patch(`/admin/users/${id}/toggle-active`);
      toast.success(`${name} ${isActive ? 'deactivated' : 'activated'}`);
      loadAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const changeRole = async (id, name, currentRole) => {
    const newRole = currentRole === 'customer' ? 'vendor' : 'customer';
    if (!window.confirm(`Change ${name}'s role from ${currentRole} to ${newRole}? They will be notified by email.`)) return;
    try {
      await api.patch(`/admin/users/${id}/role`, { role: newRole });
      toast.success(`${name} is now a ${newRole}`);
      loadAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Permanently remove ${name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User removed & notified by email');
      loadAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const customers = users.filter(u => u.role === 'customer');
  if (loading) return <div className="spinner" style={{ marginTop: 60 }} />;

  const TABS = [['stats','📊 Overview'],['vendors','🍴 Vendors'],['orders','📦 Orders'],['customers','👥 Customers']];

  const UserStatusBadge = ({ isActive }) => (
    <span style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',borderRadius:50,fontSize:11,fontWeight:800,background:isActive!==false?'#d4edda':'#f8d7da',color:isActive!==false?'#155724':'#721c24' }}>
      {isActive!==false ? '● Active' : '● Inactive'}
    </span>
  );

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 16px 60px' }}>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, color:'#3d2b1f', marginBottom:24 }}>Admin Panel</div>

      <div style={{ display:'flex', borderBottom:'2px solid var(--border)', marginBottom:28, overflowX:'auto' }}>
        {TABS.map(([t,label]) => (
          <button key={t} onClick={() => setTab(t)} style={{ background:'none',border:'none',padding:'12px 20px',fontFamily:"'Nunito',sans-serif",fontSize:14,fontWeight:800,color:tab===t?'#3d2b1f':'#aaa',borderBottom:`2px solid ${tab===t?'var(--pink)':'transparent'}`,marginBottom:-2,cursor:'pointer',whiteSpace:'nowrap' }}>{label}</button>
        ))}
      </div>

      {/* STATS */}
      {tab==='stats' && stats && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:14, marginBottom:32 }}>
            {[
              {label:'Customers',val:stats.totalCustomers,icon:'👥',bg:'#cce5ff',color:'#004085'},
              {label:'Vendors',val:stats.totalVendors,icon:'🍴',bg:'var(--mint-light)',color:'#1a5c38'},
              {label:'Total Orders',val:stats.totalOrders,icon:'📦',bg:'#fff3cd',color:'#856404'},
              {label:'Menu Items',val:stats.totalMenuItems,icon:'🗒️',bg:'#fde8d0',color:'#8a4000'},
              {label:'Revenue',val:`Rs ${(stats.totalRevenue||0).toLocaleString()}`,icon:'💰',bg:'#d4edda',color:'#155724'},
              {label:'Pending',val:stats.pending,icon:'⏳',bg:'#fff3cd',color:'#856404'},
            ].map(s => (
              <div key={s.label} style={{ background:s.bg,borderRadius:14,padding:'16px 18px' }}>
                <div style={{ fontSize:24,marginBottom:6 }}>{s.icon}</div>
                <div style={{ fontSize:11,fontWeight:800,color:s.color,textTransform:'uppercase',letterSpacing:'.05em' }}>{s.label}</div>
                <div style={{ fontSize:22,fontWeight:900,color:s.color,fontFamily:"'Playfair Display',serif",marginTop:4 }}>{s.val}</div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily:"'Playfair Display',serif",fontSize:20,marginBottom:14,color:'#3d2b1f' }}>Recent Orders</div>
          <div className="card" style={{ overflowX:'auto' }}>
            <table style={{ width:'100%',borderCollapse:'collapse',fontSize:14 }}>
              <thead><tr style={{ borderBottom:'2px solid var(--border)' }}>
                {['Order','Customer','Vendor','Total','Status','Date'].map(h=><th key={h} style={{ padding:'10px 12px',textAlign:'left',fontSize:11,fontWeight:800,color:'#aaa',textTransform:'uppercase',letterSpacing:'.05em',whiteSpace:'nowrap' }}>{h}</th>)}
              </tr></thead>
              <tbody>{orders.slice(0,10).map(o=>(
                <tr key={o._id} style={{ borderBottom:'1px solid var(--border)' }}>
                  <td style={{ padding:'10px 12px',fontWeight:700 }}>#{o._id.slice(-6).toUpperCase()}</td>
                  <td style={{ padding:'10px 12px',color:'#555' }}>{o.customer?.name}</td>
                  <td style={{ padding:'10px 12px',color:'#888',fontSize:13 }}>{o.vendor?.name}</td>
                  <td style={{ padding:'10px 12px',fontWeight:700,color:'var(--green)',whiteSpace:'nowrap' }}>Rs {o.totalAmount.toLocaleString()}</td>
                  <td style={{ padding:'10px 12px' }}><span className={`badge badge-${o.status}`}>{STATUS_LABELS[o.status]}</span></td>
                  <td style={{ padding:'10px 12px',color:'#aaa',fontSize:12,whiteSpace:'nowrap' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* VENDORS */}
      {tab==='vendors' && (
        <div>
          <div style={{ fontWeight:700,color:'#888',fontSize:13,marginBottom:16 }}>{vendors.length} vendors registered</div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:14 }}>
            {vendors.map(v=>(
              <div key={v._id} className="card">
                <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10,marginBottom:12 }}>
                  <div style={{ display:'flex',gap:10,alignItems:'flex-start' }}>
                    <div style={{ width:46,height:46,borderRadius:'50%',background:'var(--mint-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0 }}>🍴</div>
                    <div>
                      <div style={{ fontWeight:800,fontSize:15,color:'#3d2b1f' }}>{v.name}</div>
                      <div style={{ fontSize:12,color:'#888' }}>{v.email}</div>
                      <div style={{ marginTop:4 }}><UserStatusBadge isActive={v.isActive} /></div>
                    </div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteUser(v._id, v.name)}>Remove</button>
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12 }}>
                  {[['Menu',v.itemCount],['Orders',v.orderCount],['Revenue',`Rs ${(v.revenue||0).toLocaleString()}`]].map(([l,val])=>(
                    <div key={l} style={{ background:'#f8f5f0',borderRadius:8,padding:'8px 10px',textAlign:'center' }}>
                      <div style={{ fontSize:10,fontWeight:800,color:'#aaa',textTransform:'uppercase' }}>{l}</div>
                      <div style={{ fontWeight:800,color:'#3d2b1f',fontSize:13,marginTop:2 }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
                  <button className={`btn btn-sm ${v.isActive!==false?'btn-outline':'btn-success'}`} onClick={()=>toggleActive(v._id,v.name,v.isActive!==false)}>
                    {v.isActive!==false?'🚫 Deactivate':'✅ Activate'}
                  </button>
                  <button className="btn btn-sm btn-outline" onClick={()=>changeRole(v._id,v.name,'vendor')} style={{ fontSize:11 }}>
                    → Customer
                  </button>
                </div>
                <div style={{ fontSize:11,color:'#bbb',marginTop:10 }}>Joined {new Date(v.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ORDERS */}
      {tab==='orders' && (
        <div className="card" style={{ overflowX:'auto' }}>
          <table style={{ width:'100%',borderCollapse:'collapse',fontSize:14 }}>
            <thead><tr style={{ borderBottom:'2px solid var(--border)' }}>
              {['Order','Customer','Vendor','Items','Total','Payment','Status','Date'].map(h=><th key={h} style={{ padding:'10px 12px',textAlign:'left',fontSize:11,fontWeight:800,color:'#aaa',textTransform:'uppercase',letterSpacing:'.05em',whiteSpace:'nowrap' }}>{h}</th>)}
            </tr></thead>
            <tbody>{orders.map(o=>(
              <tr key={o._id} style={{ borderBottom:'1px solid var(--border)' }}>
                <td style={{ padding:'10px 12px',fontWeight:700 }}>#{o._id.slice(-6).toUpperCase()}</td>
                <td style={{ padding:'10px 12px',color:'#555' }}>{o.customer?.name}</td>
                <td style={{ padding:'10px 12px',color:'#888',fontSize:13 }}>{o.vendor?.name}</td>
                <td style={{ padding:'10px 12px',color:'#888' }}>{o.items.length}</td>
                <td style={{ padding:'10px 12px',fontWeight:700,color:'var(--green)',whiteSpace:'nowrap' }}>Rs {o.totalAmount.toLocaleString()}</td>
                <td style={{ padding:'10px 12px',fontSize:12,color:'#888' }}>{o.paymentMethod==='cod'?'COD':'Online'}</td>
                <td style={{ padding:'10px 12px' }}><span className={`badge badge-${o.status}`}>{STATUS_LABELS[o.status]}</span></td>
                <td style={{ padding:'10px 12px',color:'#aaa',fontSize:12,whiteSpace:'nowrap' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {/* CUSTOMERS */}
      {tab==='customers' && (
        <div className="card" style={{ overflowX:'auto' }}>
          <table style={{ width:'100%',borderCollapse:'collapse',fontSize:14 }}>
            <thead><tr style={{ borderBottom:'2px solid var(--border)' }}>
              {['Name','Email','Phone','Status','Joined','Actions'].map(h=><th key={h} style={{ padding:'10px 12px',textAlign:'left',fontSize:11,fontWeight:800,color:'#aaa',textTransform:'uppercase',letterSpacing:'.05em' }}>{h}</th>)}
            </tr></thead>
            <tbody>{customers.map(u=>(
              <tr key={u._id} style={{ borderBottom:'1px solid var(--border)' }}>
                <td style={{ padding:'10px 12px',fontWeight:700 }}>{u.name}</td>
                <td style={{ padding:'10px 12px',color:'#555' }}>{u.email}</td>
                <td style={{ padding:'10px 12px',color:'#888',fontSize:12 }}>{u.phone||'—'}</td>
                <td style={{ padding:'10px 12px' }}><UserStatusBadge isActive={u.isActive} /></td>
                <td style={{ padding:'10px 12px',color:'#aaa',fontSize:12 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={{ padding:'10px 12px' }}>
                  <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
                    <button className={`btn btn-sm ${u.isActive!==false?'btn-outline':'btn-success'}`} style={{ fontSize:11 }} onClick={()=>toggleActive(u._id,u.name,u.isActive!==false)}>
                      {u.isActive!==false?'Deactivate':'Activate'}
                    </button>
                    <button className="btn btn-sm btn-outline" style={{ fontSize:11 }} onClick={()=>changeRole(u._id,u.name,'customer')}>
                      → Vendor
                    </button>
                    <button className="btn btn-sm btn-danger" style={{ fontSize:11 }} onClick={()=>deleteUser(u._id,u.name)}>Remove</button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
