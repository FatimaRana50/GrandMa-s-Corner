import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/menu?search=${encodeURIComponent(search.trim())}`);
    setSearch('');
    setSearching(false);
  };

  // Close search on outside click
  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearching(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dashLink = user?.role === 'admin' ? '/admin' : user?.role === 'vendor' ? '/vendor' : '/orders';

  return (
    <nav style={{ background:'white', borderBottom:'1.5px solid rgba(0,0,0,0.07)', padding:'0 24px', position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:64, gap:12 }}>

        {/* Logo */}
        <Link to="/menu" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontStyle:'italic', color:'#3d2b1f' }}>Grandma's</div>
          <div style={{ display:'flex', gap:3 }}>
            {'CORNER'.split('').map((l,i) => (
              <div key={i} style={{ width:22,height:22,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Nunito',sans-serif",fontWeight:900,fontSize:12,background:i%2===0?'#f4a7b9':'#f9e4a0',borderRadius:4,boxShadow:'1px 1px 0 rgba(0,0,0,0.12)',color:'#3d2b1f' }}>{l}</div>
            ))}
          </div>
        </Link>

        {/* Search bar */}
        <div ref={searchRef} style={{ flex:1, maxWidth:320, position:'relative' }}>
          <form onSubmit={handleSearch}>
            <div style={{ display:'flex', alignItems:'center', background:'#f8f5f0', borderRadius:10, padding:'0 12px', border:`1.5px solid ${searching?'var(--mint)':'transparent'}`, transition:'all .2s' }}>
              <span style={{ fontSize:14, marginRight:8, color:'#aaa' }}>🔍</span>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                onFocus={() => setSearching(true)}
                placeholder="Search menu items..."
                style={{ flex:1, border:'none', background:'transparent', padding:'10px 0', fontFamily:"'Nunito',sans-serif", fontSize:13, color:'#3d2b1f', outline:'none' }}
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#ccc', fontSize:16, padding:0 }}>✕</button>
              )}
            </div>
          </form>
        </div>

        {/* Nav links */}
        <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
          <Link to="/menu" style={{ textDecoration:'none', padding:'8px 12px', fontSize:14, fontWeight:700, color:'#666', borderRadius:8, whiteSpace:'nowrap' }}>Menu</Link>
          <Link to="/about" style={{ textDecoration:'none', padding:'8px 12px', fontSize:14, fontWeight:700, color:'#666', borderRadius:8, whiteSpace:'nowrap' }}>About</Link>

          {user ? (
            <>
              <Link to={dashLink} style={{ textDecoration:'none', padding:'8px 12px', fontSize:14, fontWeight:700, color:'#666', borderRadius:8, whiteSpace:'nowrap' }}>
                {user.role==='admin'?'⚙️ Admin':user.role==='vendor'?'🍴 Dashboard':'📦 Orders'}
              </Link>
              <div style={{ fontSize:13, color:'#aaa', padding:'8px 6px', fontWeight:700, whiteSpace:'nowrap' }}>Hi, {user.name.split(' ')[0]}!</div>
              <button onClick={handleLogout} style={{ background:'none', border:'1.5px solid rgba(0,0,0,0.08)', padding:'8px 14px', borderRadius:8, fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700, color:'#666', cursor:'pointer', transition:'all .15s', whiteSpace:'nowrap' }}
                onMouseEnter={e=>{e.target.style.borderColor='#3d2b1f';e.target.style.color='#3d2b1f';}}
                onMouseLeave={e=>{e.target.style.borderColor='rgba(0,0,0,0.08)';e.target.style.color='#666';}}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/"><button style={{ background:'none',border:'1.5px solid rgba(0,0,0,0.08)',padding:'8px 14px',borderRadius:8,fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,color:'#666',cursor:'pointer' }}>Login</button></Link>
              <Link to="/register"><button style={{ background:'#3d2b1f',border:'none',padding:'8px 14px',borderRadius:8,fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,color:'white',cursor:'pointer',marginLeft:4 }}>Sign Up</button></Link>
            </>
          )}

          {user?.role==='customer' && (
            <Link to="/cart" style={{ textDecoration:'none', marginLeft:4 }}>
              <button style={{ background:'#3d2b1f',color:'white',border:'none',borderRadius:10,padding:'8px 14px',cursor:'pointer',fontWeight:800,fontSize:14,position:'relative',display:'flex',alignItems:'center',gap:4 }}>
                🛒
                {count>0 && <span style={{ background:'#f4a7b9',color:'#3d2b1f',borderRadius:'50%',width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,position:'absolute',top:-6,right:-6 }}>{count}</span>}
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
