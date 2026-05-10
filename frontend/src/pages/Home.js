import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, X, Plus, Minus, ShoppingCart, Bot, Send, Phone, Clock,
  Truck, Package, Sparkles, ArrowRight, Snowflake, Coffee, Backpack,
  UtensilsCrossed, Home as HomeIcon, Star, MessageCircle, Heart,
} from 'lucide-react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { imgUrl } from '../utils/api';

const CATS = [
  { key: 'all',    label: 'All Items',    Icon: UtensilsCrossed },
  { key: 'frozen', label: 'Frozen Snacks', Icon: Snowflake },
  { key: 'tea',    label: 'Tea Party',     Icon: Coffee },
  { key: 'kids',   label: 'Kids Lunch',    Icon: Backpack },
];
const CAT_LABELS = { frozen: 'Frozen Snacks', tea: 'Tea Party Fun Snacks', kids: 'Kids Lunch' };
const CAT_ICONS  = { frozen: Snowflake, tea: Coffee, kids: Backpack };
const CAT_COLORS = { frozen: 'var(--pink)', tea: 'var(--yellow)', kids: 'var(--mint)' };

/* -------------------- AI Chat Widget -------------------- */
function AIWidget({ onAddItem }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! 👋 Tell me what you're in the mood for and I'll suggest something delicious from our menu." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const { data } = await api.post('/ai/suggest', { message: msg });
      setMessages((m) => [...m, { role: 'ai', text: data.reply, suggestions: data.suggestions }]);
    } catch {
      setMessages((m) => [...m, { role: 'ai', text: "Sorry, I'm having trouble right now. Browse our menu and pick something delicious! 😊" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open AI assistant"
          style={{
            position: 'fixed', bottom: 28, right: 28,
            width: 60, height: 60, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--mint-deep), #1f6048)',
            color: '#fff', border: 'none', cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(42,122,90,0.40)',
            zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform var(--t-base) var(--ease)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Bot size={26} />
        </button>
      )}

      {open && (
        <div className="gc-fade-up" style={{
          position: 'fixed', bottom: 28, right: 28,
          width: 360, maxWidth: 'calc(100vw - 32px)', height: 520,
          background: '#fff', borderRadius: 22,
          boxShadow: '0 24px 60px rgba(61,43,31,0.22)',
          zIndex: 200, display: 'flex', flexDirection: 'column',
          border: '1px solid var(--border)', overflow: 'hidden',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--brown), var(--brown-soft))',
            padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12, background: 'var(--mint)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown)',
              }}>
                <Bot size={20} />
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Grandma's Food AI</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11.5 }}>Tell me what you're craving!</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close"
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.75)', cursor: 'pointer', padding: 4, display: 'flex' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{
            flex: 1, overflowY: 'auto', padding: 16,
            display: 'flex', flexDirection: 'column', gap: 12,
            background: 'linear-gradient(180deg, var(--cream-50), #fff)',
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column',
                alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 6,
              }}>
                <div className={m.role === 'user' ? 'user-bubble' : 'ai-bubble'} style={{ maxWidth: '85%' }}>
                  {m.text}
                </div>
                {m.suggestions && m.suggestions.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                    {m.suggestions.map((s) => (
                      <div key={s._id} style={{
                        background: '#fff', borderRadius: 12, padding: '10px 12px',
                        border: '1px solid var(--border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
                        boxShadow: 'var(--shadow-xs)',
                      }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--brown)' }}>{s.name}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--mint-deep)', fontWeight: 700 }}>
                            Rs {s.price?.toLocaleString()}
                          </div>
                        </div>
                        <button className="gc-btn gc-btn-mint gc-btn-sm" onClick={() => onAddItem(s)}>
                          <Plus size={14} /> Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="ai-bubble" style={{ maxWidth: '70%' }}>Thinking...</div>}
            <div ref={bottomRef} />
          </div>

          <div style={{
            padding: '12px 14px', borderTop: '1px solid var(--border)',
            display: 'flex', gap: 8, background: '#fff',
          }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="e.g. I want something sweet..."
              className="gc-input"
              style={{ padding: '10px 12px', fontSize: 13 }}
            />
            <button onClick={send} disabled={loading}
              className="gc-btn gc-btn-primary"
              style={{ padding: '10px 14px' }}>
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* -------------------- Product Card -------------------- */
function ProductCard({ item, qtyInCart, onAdd, onRemove }) {
  return (
    <article className="gc-card gc-card-hover" style={{
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      padding: 0,
    }}>
      <div style={{
        position: 'relative',
        height: 180,
        background: 'linear-gradient(135deg, var(--cream-100), var(--mint-bg))',
        overflow: 'hidden',
      }}>
        {item.image ? (
          <img
            src={imgUrl(item.image)}
            alt={item.name}
            loading="lazy"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 600ms var(--ease)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-soft)',
          }}>
            <UtensilsCrossed size={42} />
          </div>
        )}

        {qtyInCart > 0 && (
          <div className="gc-pop" style={{
            position: 'absolute', top: 12, right: 12,
            background: '#fff', color: 'var(--mint-deep)',
            borderRadius: 'var(--r-pill)', padding: '4px 10px',
            fontSize: 12, fontWeight: 700,
            boxShadow: 'var(--shadow-sm)',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <ShoppingCart size={12} /> ×{qtyInCart}
          </div>
        )}

        <div style={{
          position: 'absolute', bottom: 12, left: 12,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          borderRadius: 'var(--r-pill)', padding: '4px 10px',
          fontSize: 11.5, fontWeight: 700, color: 'var(--brown)',
          display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          <HomeIcon size={11} /> {item.vendor?.name || 'Home Vendor'}
        </div>
      </div>

      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 18, fontWeight: 600, color: 'var(--brown)',
          marginBottom: 4, lineHeight: 1.25,
        }}>
          {item.name}
        </h3>
        <div style={{ fontSize: 12, color: 'var(--text-soft)', fontWeight: 600, marginBottom: 8 }}>
          {item.unit}
        </div>
        {item.description && (
          <p style={{
            fontSize: 13, color: 'var(--text-muted)',
            lineHeight: 1.5, marginBottom: 14, flex: 1,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {item.description}
          </p>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 'auto', gap: 10,
        }}>
          <div>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22, fontWeight: 700, color: 'var(--mint-deep)',
            }}>
              Rs {item.price.toLocaleString()}
            </span>
          </div>

          {qtyInCart > 0 ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'var(--mint-bg)', borderRadius: 'var(--r-pill)',
              border: '1.5px solid var(--mint)',
              overflow: 'hidden',
            }}>
              <button
                onClick={() => onRemove(item)}
                aria-label="Decrease quantity"
                style={{
                  width: 34, height: 34, border: 'none', background: 'transparent',
                  cursor: 'pointer', color: 'var(--mint-deep)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Minus size={15} />
              </button>
              <span style={{
                minWidth: 22, textAlign: 'center', fontWeight: 700,
                color: 'var(--brown)', fontSize: 14,
              }}>
                {qtyInCart}
              </span>
              <button
                onClick={() => onAdd(item)}
                aria-label="Increase quantity"
                style={{
                  width: 34, height: 34, border: 'none', background: 'transparent',
                  cursor: 'pointer', color: 'var(--mint-deep)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Plus size={15} />
              </button>
            </div>
          ) : (
            <button onClick={() => onAdd(item)} className="gc-btn gc-btn-mint gc-btn-sm">
              <Plus size={15} /> Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* -------------------- Page -------------------- */
export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('all');
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const { addItem, removeItem, cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/menu?available=true').then((r) => {
      setItems(r.data);
      setLoading(false);
    });
  }, []);

  const searchFiltered = searchQuery
    ? items.filter(
        (i) =>
          i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  const filtered = cat === 'all' ? searchFiltered : searchFiltered.filter((i) => i.category === cat);
  
  const grouped = ['frozen', 'tea', 'kids'].reduce((acc, c) => {
    acc[c] = filtered.filter((i) => i.category === c);
    return acc;
  }, {});

  const inCart = (id) => cart.find((i) => i._id === id)?.qty || 0;
  const cartVendorId = cart.length > 0 ? (cart[0].vendor?._id || cart[0].vendor) : null;

  const handleAdd = (item) => {
    if (!user) { toast.error('Please login to add items'); navigate('/'); return; }
    if (user.role !== 'customer') { toast.error('Only customers can place orders'); return; }
    const itemVendorId = item.vendor?._id || item.vendor;
    if (cartVendorId && cartVendorId !== itemVendorId?.toString()) {
      if (window.confirm(`Your cart has items from "${cart[0].vendorName}". Adding this item will clear your current cart. Continue?`)) {
        clearCart();
      } else return;
    }
    addItem({ ...item, vendorName: item.vendor?.name || '' });
    toast.success(`${item.name} added!`, { icon: '✅', duration: 1500 });
  };

  const handleRemove = (item) => {
    if (typeof removeItem === 'function') removeItem(item._id);
  };

  const scrollToMenu = () => {
    document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      
      {/* ================= UPDATED HERO SECTION ================= */}
      <section style={{
        position: 'relative',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 24px',
        overflow: 'hidden',
      }}>
        {/* BACKGROUND IMAGE WITH BLUR */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=2070')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(3px) brightness(0.50)', 
          transform: 'scale(1.05)',
          zIndex: 0
        }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', textAlign: 'center', zIndex: 1 }}>
          <div className="gc-fade-up" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '100px',
            padding: '8px 20px',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--yellow)',
            marginBottom: 32,
          }}>
            <Sparkles size={16} />
            FRESH FROM RAWALPINDI'S HOME KITCHENS
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(50px, 10vw, 90px)',
            fontStyle: 'italic',
            fontWeight: 600,
            color: '#fff',
            lineHeight: 0.9,
            marginBottom: 32,
          }}>
            Grandma's
          </h1>

          <div style={{
            display: 'flex', justifyContent: 'center', gap: 12,
            flexWrap: 'wrap', marginBottom: 40,
          }}>
            {'CORNER'.split('').map((l, i) => (
              <div key={i} style={{
                width: 'clamp(50px, 7vw, 70px)', height: 'clamp(50px, 7vw, 70px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 'clamp(24px, 3vw, 36px)',
                background: i % 2 === 0 ? 'var(--pink)' : 'var(--yellow)',
                borderRadius: 16,
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                color: 'var(--brown)',
                animation: `gc-fade-up 600ms var(--ease) both`,
                animationDelay: `${100 + i * 70}ms`,
              }}>{l}</div>
            ))}
          </div>

          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: 'clamp(18px, 2vw, 22px)',
            lineHeight: 1.6,
            maxWidth: 600,
            margin: '0 auto 48px',
          }}>
            Every dish is hand-prepared by local home chefs using time-honoured recipes. 
            Order ahead, taste the love.
          </p>

          <div style={{ display: 'inline-flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={scrollToMenu} className="gc-btn gc-btn-mint gc-btn-lg" style={{ boxShadow: '0 20px 40px rgba(42,122,90,0.3)' }}>
              Explore the Menu <ArrowRight size={18} />
            </button>
            <a href="https://wa.me/923005118159" target="_blank" rel="noreferrer">
              <button className="gc-btn gc-btn-lg" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid #fff', color: '#fff' }}>
                <MessageCircle size={18} /> Chat on WhatsApp
              </button>
            </a>
          </div>

          {/* GLASS STAT CARDS */}
          <div style={{
            marginTop: 80,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 20,
            maxWidth: 900,
            marginInline: 'auto'
          }}>
            {[
              { Icon: UtensilsCrossed, label: 'Menu items', value: '28+', color: 'var(--pink)' },
              { Icon: HomeIcon, label: 'Home Chefs', value: '12+', color: 'var(--yellow)' },
              { Icon: Star, label: 'Avg rating', value: '4.9', color: 'var(--mint)' },
              { Icon: Heart, label: 'Happy orders', value: '1.2k+', color: '#fff' },
            ].map(({ Icon, label, value, color }) => (
              <div key={label} style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(16px)',
                borderRadius: '28px',
                padding: '24px 16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center'
              }}>
                <Icon size={22} style={{ color: color, marginBottom: 8 }} />
                <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', fontFamily: "'Playfair Display', serif" }}>{value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== HOW IT WORKS ============== */}
      <section style={{ padding: '88px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: 'var(--mint-deep)',
              letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12,
            }}>
              How it works
            </div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(30px, 4vw, 42px)',
              color: 'var(--brown)', fontStyle: 'italic',
            }}>
              Three simple steps to a homemade feast
            </h2>
          </div>

          <div className="gc-stagger" style={{
            display: 'grid', gap: 28,
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          }}>
            {[
              { n: '01', Icon: Search,        title: 'Browse the Menu',    text: 'Discover frozen snacks, tea-time treats and kids lunches from local home chefs.' },
              { n: '02', Icon: ShoppingCart,  title: 'Place Your Order',   text: 'Add a minimum of 2 dozen per item and check out — cash on delivery, no hassle.' },
              { n: '03', Icon: Truck,         title: 'Fresh Delivery',     text: 'Allow 3 days lead time. We deliver fresh, never frozen long-term, never stale.' },
            ].map(({ n, Icon, title, text }) => (
              <div key={n} className="gc-card gc-hover-lift" style={{ padding: 28 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 18,
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: 'var(--mint-bg)', color: 'var(--mint-deep)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={24} />
                  </div>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 38, fontStyle: 'italic',
                    color: 'var(--cream-200)', fontWeight: 600,
                  }}>{n}</div>
                </div>
                <h3 style={{ fontSize: 22, marginBottom: 8 }}>{title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.6 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== INFO BAR ============== */}
      <div style={{
        background: '#fff',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        padding: '20px 24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: 32
        }}>
          {[
            { Icon: Package, text: 'Min. 2 Dozen/Item' },
            { Icon: Clock, text: '3 Days Lead Time' },
            { Icon: Truck, text: 'Delivery Charges Extra' },
            { Icon: Phone, text: '0300-5118159' },
          ].map(({ Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: 'var(--brown)' }}>
              <div style={{ padding: 8, background: 'var(--mint-bg)', borderRadius: 10 }}>
                <Icon size={18} style={{ color: 'var(--mint-deep)' }} />
              </div>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* ============== CATEGORY TABS ============== */}
      <div id="menu-section" style={{
        background: '#fff',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        position: 'sticky', top: 68, zIndex: 90,
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', gap: 6, overflowX: 'auto',
        }}>
          {CATS.map((c) => {
            const Icon = c.Icon;
            const active = cat === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                style={{
                  background: 'none', border: 'none',
                  padding: '18px 4px', marginRight: 18,
                  fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
                  color: active ? 'var(--brown)' : 'var(--text-muted)',
                  borderBottom: `3px solid ${active ? 'var(--mint-deep)' : 'transparent'}`,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all var(--t-base) var(--ease)',
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                }}
              >
                <Icon size={15} /> {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============== MIXED VENDOR WARNING ============== */}
      {cart.length > 0 && (
        <div style={{
          background: '#fff8e1',
          borderBottom: '1px solid rgba(200,150,0,0.18)',
          padding: '11px 24px', textAlign: 'center',
          fontSize: 13.5, color: '#7c5e10', fontWeight: 600,
        }}>
          <ShoppingCart size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Cart has items from <strong>{cart[0].vendorName || 'a vendor'}</strong>. Adding from another vendor will clear it.
        </div>
      )}

      {/* ============== SEARCH BANNER ============== */}
      {searchQuery && (
        <div style={{
          background: 'var(--mint-bg)',
          borderBottom: '1px solid rgba(42,122,90,0.15)',
          padding: '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{
            fontSize: 14, color: 'var(--mint-deep)', fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            <Search size={14} />
            Results for "<strong>{searchQuery}</strong>" — {searchFiltered.length} item{searchFiltered.length !== 1 ? 's' : ''}
          </div>
          <button onClick={() => navigate('/menu')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, color: 'var(--mint-deep)', fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <X size={13} /> Clear search
          </button>
        </div>
      )}

      {/* ============== MENU GRID ============== */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 120px' }}>
        {loading ? (
          <div className="gc-spinner" />
        ) : searchQuery && searchFiltered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-soft)' }}>
            <Search size={42} style={{ marginBottom: 14, color: 'var(--text-soft)' }} />
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6, color: 'var(--brown)' }}>
              No results for "{searchQuery}"
            </div>
            <div style={{ fontSize: 14, marginBottom: 22 }}>Try a different search term or browse all categories</div>
            <button onClick={() => navigate('/menu')} className="gc-btn gc-btn-primary">Browse All</button>
          </div>
        ) : (
          Object.entries(grouped).map(([category, catItems]) =>
            catItems.length === 0 ? null : (
              <div key={category} style={{ marginBottom: 64 }}>
                <header style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  marginBottom: 28, paddingBottom: 14,
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14,
                    background: CAT_COLORS[category],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--brown)',
                    boxShadow: 'var(--shadow-xs)',
                  }}>
                    {React.createElement(CAT_ICONS[category], { size: 22 })}
                  </div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: 'var(--brown)' }}>
                    {CAT_LABELS[category]}
                  </h2>
                  <div style={{
                    marginLeft: 'auto', fontSize: 12, fontWeight: 700,
                    color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    {catItems.length} items
                  </div>
                </header>

                <div className="gc-stagger" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 22,
                }}>
                  {catItems.map((item) => (
                    <ProductCard
                      key={item._id}
                      item={item}
                      qtyInCart={inCart(item._id)}
                      onAdd={handleAdd}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              </div>
            )
          )
        )}

        <div style={{
          background: 'linear-gradient(135deg, #fdf3d0, #fef8e0)',
          border: '1px dashed rgba(200,160,0,0.35)',
          borderRadius: 'var(--r-lg)', padding: '18px 22px',
          fontSize: 14, color: '#7a6010', fontWeight: 600,
          lineHeight: 1.6, marginTop: 24,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Sparkles size={20} style={{ color: '#b58a00', flexShrink: 0 }} />
          <span>
            Also available: Banana Bread, Red Velvet Cake, Lemon Cake, Date Bread —
            <a href="https://wa.me/923005118159" target="_blank" rel="noreferrer"
               style={{ color: 'var(--mint-deep)', fontWeight: 700, marginLeft: 4 }}>
              WhatsApp for specials →
            </a>
          </span>
        </div>
      </div>

      <AIWidget onAddItem={handleAdd} />
    </div>
  );
}