import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STATUS_LABELS = { pending:'Pending',confirmed:'Confirmed',preparing:'Preparing',ready:'Ready',delivered:'Delivered',cancelled:'Cancelled' };

const FOOD_BG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=60';

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

  const cardStyle = {
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.6)',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0 8px 24px rgba(61,43,31,0.08)',
    transition: 'transform .25s ease, box-shadow .25s ease',
  };

  return (
    <div style={{ position:'relative', minHeight:'100vh', overflow:'hidden' }}>
      {/* Background image + warm overlay */}
      <div style={{
        position:'fixed', inset:0, zIndex:-2,
        backgroundImage:`url(${FOOD_BG})`,
        backgroundSize:'cover', backgroundPosition:'center',
        filter:'blur(6px) brightness(0.95)', transform:'scale(1.05)'
      }} />
      <div style={{
        position:'fixed', inset:0, zIndex:-1,
        background:'linear-gradient(135deg, rgba(255,243,232,0.92) 0%, rgba(255,228,225,0.88) 50%, rgba(220,237,225,0.92) 100%)'
      }} />

      {/* Floating ingredient emojis */}
      {['🍕','🥐','🍰','🍩','🥗','🍔'].map((e,i) => (
        <div key={i} style={{
          position:'fixed', fontSize:32, opacity:0.18, pointerEvents:'none', zIndex:-1,
          top:`${10 + i*14}%`, left:`${(i*17)%90}%`,
          animation:`floatA ${8 + i*2}s ease-in-out infinite`,
          animationDelay:`${i*0.7}s`
        }}>{e}</div>
      ))}

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 16px 60px', animation:'fadeIn .5s ease' }}>
        {/* Header */}
        <div style={{
          display:'flex', alignItems:'center', gap:14, marginBottom:24,
          animation:'slideDown .5s ease'
        }}>
          <div style={{
            width:54, height:54, borderRadius:16,
            background:'linear-gradient(135deg, var(--pink, #ff7eb3), var(--mint, #7ed7c1))',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:28, boxShadow:'0 6px 20px rgba(255,126,179,0.35)'
          }}>👨‍🍳</div>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:30, color:'#3d2b1f', fontWeight:800, lineHeight:1 }}>Admin Panel</div>
            <div style={{ fontSize:13, color:'#7a6b5d', marginTop:4 }}>Manage your kitchen, vendors & orders</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display:'flex', gap:6, marginBottom:28, overflowX:'auto',
          background:'rgba(255,255,255,0.7)', backdropFilter:'blur(10px)',
          padding:6, borderRadius:14, boxShadow:'0 4px 16px rgba(61,43,31,0.06)'
        }}>
          {TABS.map(([t,label]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:'1 0 auto', background: tab===t ? 'linear-gradient(135deg, var(--pink, #ff7eb3), var(--mint, #7ed7c1))' : 'transparent',
              border:'none', padding:'11px 18px', fontFamily:"'Nunito',sans-serif",
              fontSize:14, fontWeight:800,
              color: tab===t ? '#fff' : '#7a6b5d',
              borderRadius:10, cursor:'pointer', whiteSpace:'nowrap',
              boxShadow: tab===t ? '0 4px 14px rgba(255,126,179,0.35)' : 'none',
              transition:'all .25s ease'
            }}>{label}</button>
          ))}
        </div>

        {/* STATS */}
        {tab==='stats' && stats && (
          <div style={{ animation:'fadeIn .4s ease' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:14, marginBottom:32 }}>
              {[
                {label:'Customers',val:stats.totalCustomers,icon:'👥',bg:'linear-gradient(135deg,#cce5ff,#e7f1ff)',color:'#004085'},
                {label:'Vendors',val:stats.totalVendors,icon:'🍴',bg:'linear-gradient(135deg,#d4f1e0,#eaf9f0)',color:'#1a5c38'},
                {label:'Total Orders',val:stats.totalOrders,icon:'📦',bg:'linear-gradient(135deg,#fff3cd,#fff9e3)',color:'#856404'},
                {label:'Menu Items',val:stats.totalMenuItems,icon:'🗒️',bg:'linear-gradient(135deg,#fde8d0,#fff2e0)',color:'#8a4000'},
                {label:'Revenue',val:`Rs ${(stats.totalRevenue||0).toLocaleString()}`,icon:'💰',bg:'linear-gradient(135deg,#d4edda,#e8f5ec)',color:'#155724'},
                {label:'Pending',val:stats.pending,icon:'⏳',bg:'linear-gradient(135deg,#ffe0e0,#fff0f0)',color:'#a02838'},
              ].map((s,i) => (
                <div key={s.label} style={{
                  background:s.bg, borderRadius:16, padding:'18px 18px',
                  boxShadow:'0 6px 20px rgba(61,43,31,0.08)',
                  border:'1px solid rgba(255,255,255,0.7)',
                  animation:`popIn .4s ease both`, animationDelay:`${i*0.06}s`,
                  transition:'transform .25s ease, box-shadow .25s ease',
                  cursor:'default'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 28px rgba(61,43,31,0.14)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 6px 20px rgba(61,43,31,0.08)'; }}
                >
                  <div style={{ fontSize:28, marginBottom:6 }}>{s.icon}</div>
                  <div style={{ fontSize:11, fontWeight:800, color:s.color, textTransform:'uppercase', letterSpacing:'.05em', opacity:.85 }}>{s.label}</div>
                  <div style={{ fontSize:24, fontWeight:900, color:s.color, fontFamily:"'Playfair Display',serif", marginTop:4 }}>{s.val}</div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily:"'Playfair Display',serif",fontSize:22,marginBottom:14,color:'#3d2b1f',fontWeight:800 }}>🕒 Recent Orders</div>
            <div style={{ ...cardStyle, padding:0, overflowX:'auto' }}>
              <table style={{ width:'100%',borderCollapse:'collapse',fontSize:14 }}>
                <thead><tr style={{ borderBottom:'2px solid rgba(61,43,31,0.08)', background:'rgba(255,243,232,0.5)' }}>
                  {['Order','Customer','Vendor','Total','Status','Date'].map(h=><th key={h} style={{ padding:'12px 14px',textAlign:'left',fontSize:11,fontWeight:800,color:'#7a6b5d',textTransform:'uppercase',letterSpacing:'.05em',whiteSpace:'nowrap' }}>{h}</th>)}
                </tr></thead>
                <tbody>{orders.slice(0,10).map(o=>(
                  <tr key={o._id} style={{ borderBottom:'1px solid rgba(61,43,31,0.06)', transition:'background .2s' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(255,243,232,0.5)'}
                    onMouseLeave={e => e.currentTarget.style.background=''}>
                    <td style={{ padding:'12px 14px',fontWeight:700 }}>#{o._id.slice(-6).toUpperCase()}</td>
                    <td style={{ padding:'12px 14px',color:'#555' }}>{o.customer?.name}</td>
                    <td style={{ padding:'12px 14px',color:'#888',fontSize:13 }}>{o.vendor?.name}</td>
                    <td style={{ padding:'12px 14px',fontWeight:700,color:'var(--green, #1a5c38)',whiteSpace:'nowrap' }}>Rs {o.totalAmount.toLocaleString()}</td>
                    <td style={{ padding:'12px 14px' }}><span className={`badge badge-${o.status}`}>{STATUS_LABELS[o.status]}</span></td>
                    <td style={{ padding:'12px 14px',color:'#aaa',fontSize:12,whiteSpace:'nowrap' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* VENDORS */}
        {tab==='vendors' && (
          <div style={{ animation:'fadeIn .4s ease' }}>
            <div style={{ fontWeight:700,color:'#7a6b5d',fontSize:13,marginBottom:16 }}>🍴 {vendors.length} vendors registered</div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:14 }}>
              {vendors.map((v,i)=>(
                <div key={v._id} style={{ ...cardStyle, animation:'popIn .4s ease both', animationDelay:`${i*0.05}s` }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 14px 30px rgba(61,43,31,0.14)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 8px 24px rgba(61,43,31,0.08)'; }}>
                  <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10,marginBottom:12 }}>
                    <div style={{ display:'flex',gap:10,alignItems:'flex-start' }}>
                      <div style={{ width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg, #d4f1e0, #b6e4cc)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,boxShadow:'0 4px 12px rgba(26,92,56,0.18)' }}>🍴</div>
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
                      <div key={l} style={{ background:'linear-gradient(135deg,#fff7ec,#fdeede)',borderRadius:10,padding:'10px 8px',textAlign:'center' }}>
                        <div style={{ fontSize:10,fontWeight:800,color:'#a08c7a',textTransform:'uppercase' }}>{l}</div>
                        <div style={{ fontWeight:800,color:'#3d2b1f',fontSize:13,marginTop:3 }}>{val}</div>
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
          <div style={{ ...cardStyle, padding:0, overflowX:'auto', animation:'fadeIn .4s ease' }}>
            <table style={{ width:'100%',borderCollapse:'collapse',fontSize:14 }}>
              <thead><tr style={{ borderBottom:'2px solid rgba(61,43,31,0.08)', background:'rgba(255,243,232,0.5)' }}>
                {['Order','Customer','Vendor','Items','Total','Payment','Status','Date'].map(h=><th key={h} style={{ padding:'12px 14px',textAlign:'left',fontSize:11,fontWeight:800,color:'#7a6b5d',textTransform:'uppercase',letterSpacing:'.05em',whiteSpace:'nowrap' }}>{h}</th>)}
              </tr></thead>
              <tbody>{orders.map(o=>(
                <tr key={o._id} style={{ borderBottom:'1px solid rgba(61,43,31,0.06)', transition:'background .2s' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,243,232,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.background=''}>
                  <td style={{ padding:'12px 14px',fontWeight:700 }}>#{o._id.slice(-6).toUpperCase()}</td>
                  <td style={{ padding:'12px 14px',color:'#555' }}>{o.customer?.name}</td>
                  <td style={{ padding:'12px 14px',color:'#888',fontSize:13 }}>{o.vendor?.name}</td>
                  <td style={{ padding:'12px 14px',color:'#888' }}>{o.items.length}</td>
                  <td style={{ padding:'12px 14px',fontWeight:700,color:'var(--green, #1a5c38)',whiteSpace:'nowrap' }}>Rs {o.totalAmount.toLocaleString()}</td>
                  <td style={{ padding:'12px 14px',fontSize:12,color:'#888' }}>{o.paymentMethod==='cod'?'COD':'Online'}</td>
                  <td style={{ padding:'12px 14px' }}><span className={`badge badge-${o.status}`}>{STATUS_LABELS[o.status]}</span></td>
                  <td style={{ padding:'12px 14px',color:'#aaa',fontSize:12,whiteSpace:'nowrap' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {/* CUSTOMERS */}
        {tab==='customers' && (
          <div style={{ ...cardStyle, padding:0, overflowX:'auto', animation:'fadeIn .4s ease' }}>
            <table style={{ width:'100%',borderCollapse:'collapse',fontSize:14 }}>
              <thead><tr style={{ borderBottom:'2px solid rgba(61,43,31,0.08)', background:'rgba(255,243,232,0.5)' }}>
                {['Name','Email','Phone','Status','Joined','Actions'].map(h=><th key={h} style={{ padding:'12px 14px',textAlign:'left',fontSize:11,fontWeight:800,color:'#7a6b5d',textTransform:'uppercase',letterSpacing:'.05em' }}>{h}</th>)}
              </tr></thead>
              <tbody>{customers.map(u=>(
                <tr key={u._id} style={{ borderBottom:'1px solid rgba(61,43,31,0.06)', transition:'background .2s' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,243,232,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.background=''}>
                  <td style={{ padding:'12px 14px',fontWeight:700 }}>{u.name}</td>
                  <td style={{ padding:'12px 14px',color:'#555' }}>{u.email}</td>
                  <td style={{ padding:'12px 14px',color:'#888',fontSize:12 }}>{u.phone||'—'}</td>
                  <td style={{ padding:'12px 14px' }}><UserStatusBadge isActive={u.isActive} /></td>
                  <td style={{ padding:'12px 14px',color:'#aaa',fontSize:12 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding:'12px 14px' }}>
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

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes popIn { from { opacity:0; transform:scale(.92) translateY(8px) } to { opacity:1; transform:scale(1) translateY(0) } }
        @keyframes floatA {
          0%,100% { transform:translateY(0) rotate(0deg) }
          50% { transform:translateY(-22px) rotate(8deg) }
        }
      `}</style>
    </div>
  );
}
