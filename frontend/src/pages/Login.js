import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Clock,
  Settings, ChefHat, ShoppingBag, Sparkles, Heart, Star, MessageCircle, UtensilsCrossed, Coffee
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Field = ({ Icon, error, children }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ position: 'relative' }}>
      <Icon size={18}
        style={{
          position: 'absolute', left: 16, top: '50%',
          transform: 'translateY(-50%)', color: 'var(--text-soft)', zIndex: 1,
        }} />
      {children}
    </div>
    {error && (
      <div style={{
        fontSize: 12.5, color: '#e24b4a', fontWeight: 600,
        marginTop: 6, paddingLeft: 4,
        display: 'inline-flex', alignItems: 'center', gap: 4,
      }}>
        <AlertCircle size={13} /> {error}
      </div>
    )}
  </div>
);

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    if (params.get('reason') === 'inactivity') {
      toast('Logged out due to inactivity', { icon: <Clock size={16} /> });
    }
  }, [params]);

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((e2) => ({ ...e2, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(form.email, form.password, form.rememberMe);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : user.role === 'vendor' ? '/vendor' : '/menu');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setErrors({ general: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { Icon: Sparkles, text: '28+ homemade items' },
    { Icon: Heart,    text: 'Curated local home vendors' },
    { Icon: Star,     text: 'Verified customer reviews' },
    { Icon: MessageCircle, text: 'Direct WhatsApp support' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--cream)', position: 'relative', overflow: 'hidden' }}>
      
      {/* ================= LEFT BRAND PANEL (STABLE) ================= */}
      <aside className="login-left" style={{
        display: 'none', flex: '0 0 500px', position: 'relative', padding: '64px 48px',
        flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', color: '#fff'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'blur(3px) brightness(0.45)', transform: 'scale(1.1)', zIndex: 0
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(61,43,31,0.6) 0%, transparent 100%)', zIndex: 1 }} />

        <div className="gc-fade-up" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontStyle: 'italic', color: 'var(--mint)', marginBottom: 14 }}>
            Grandma's
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {'CORNER'.split('').map((l, i) => (
              <div key={i} style={{
                width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 18, background: i % 2 === 0 ? 'var(--pink)' : 'var(--yellow)',
                borderRadius: 10, color: 'var(--brown)', boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
              }}>{l}</div>
            ))}
          </div>
        </div>

        <div className="gc-fade-up" style={{ position: 'relative', zIndex: 2, animationDelay: '120ms' }}>
          <h1 style={{ fontSize: 42, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 20, fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
            Hand-cooked,<br />delivered with love.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 17, lineHeight: 1.6, maxWidth: 380 }}>
            Rawalpindi's finest home kitchens, just one sign-in away. Taste the tradition.
          </p>
        </div>

        <div className="gc-stagger" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, position: 'relative', zIndex: 2 }}>
          {benefits.map(({ Icon, text }) => (
            <div key={text} style={{
              background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 16, padding: '16px', color: '#fff', fontSize: 13, fontWeight: 600, display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <Icon size={20} style={{ color: 'var(--mint)' }} />
              {text}
            </div>
          ))}
        </div>
      </aside>

      {/* ================= RIGHT FORM PANEL (CURATED KITCHEN DESIGN) ================= */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', minHeight: '100vh', position: 'relative',
        background: '#FAF9F6', // Subtle linen-white
      }}>
        
        {/* Visual Embellishments - Floating Icons */}
        <UtensilsCrossed size={120} style={{ position: 'absolute', top: '5%', right: '5%', color: 'var(--brown)', opacity: 0.03, transform: 'rotate(15deg)' }} />
        <Coffee size={100} style={{ position: 'absolute', bottom: '8%', left: '5%', color: 'var(--brown)', opacity: 0.03, transform: 'rotate(-10deg)' }} />

        {/* Textured Tiling Background Effect */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.4, zIndex: 0,
          backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")`
        }} />

        <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
          
          {/* Handwritten "Welcome" Note Style */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ 
              display: 'inline-block', transform: 'rotate(-2deg)', background: 'var(--yellow)', 
              padding: '8px 24px', borderRadius: '4px', boxShadow: '5px 5px 0 rgba(0,0,0,0.05)',
              marginBottom: 16
            }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 14, color: 'var(--brown)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Pull up a chair
              </span>
            </div>
            <h2 style={{ fontSize: 44, color: 'var(--brown)', marginBottom: 8, fontStyle: 'italic', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
              Welcome back
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, fontWeight: 500 }}>
              Rawalpindi's favorite flavors are waiting.
            </p>
          </div>

          {/* Layered Form Card */}
          <div style={{ position: 'relative' }}>
            {/* The "Paper" stack effect behind the main card */}
            <div style={{ position: 'absolute', inset: 0, background: '#fff', borderRadius: '32px', transform: 'rotate(1.5deg)', border: '1px solid var(--border)', zIndex: -1 }} />
            
            <div style={{
              background: '#fff', borderRadius: '32px', padding: '48px 40px',
              boxShadow: '0 40px 80px rgba(61,43,31,0.08)', border: '1px solid var(--border)',
            }}>
              {errors.general && (
                <div className="gc-fade-in" style={{
                  background: '#fff5f5', border: '1px solid #ffd0d0', borderRadius: 14, padding: '14px 18px', 
                  marginBottom: 24, fontSize: 13.5, color: '#c93b3a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <AlertCircle size={16} /> {errors.general}
                </div>
              )}

              <form onSubmit={submit} noValidate>
                <Field Icon={Mail} error={errors.email}>
                  <input
                    name="email" type="email" value={form.email} onChange={handle}
                    placeholder="you@example.com"
                    className={`gc-input has-icon ${errors.email ? 'error' : ''}`}
                    style={{ height: 56, borderRadius: 16, background: 'var(--cream)', border: '1px solid transparent' }}
                  />
                </Field>

                <Field Icon={Lock} error={errors.password}>
                  <input
                    name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handle}
                    placeholder="••••••••"
                    className={`gc-input has-icon ${errors.password ? 'error' : ''}`}
                    style={{ paddingRight: 44, height: 56, borderRadius: 16, background: 'var(--cream)', border: '1px solid transparent' }}
                  />
                  <button type="button" onClick={() => setShowPass((s) => !s)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', padding: 4, display: 'flex' }}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </Field>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>
                    <input
                      type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={handle}
                      style={{ width: 18, height: 18, accentColor: 'var(--mint-deep)', cursor: 'pointer' }}
                    />
                    Keep me signed in
                  </label>
                  <Link to="/forgot-password" style={{ fontSize: 14, color: 'var(--mint-deep)', fontWeight: 800, textDecoration: 'none', borderBottom: '2px solid var(--mint-bg)' }}>
                    Forgot?
                  </Link>
                </div>

                <button
                  type="submit" disabled={loading}
                  className="gc-btn gc-btn-primary gc-btn-lg"
                  style={{ width: '100%', borderRadius: 18, height: 60, fontSize: 17, boxShadow: '0 10px 25px rgba(42,74,58,0.2)' }}
                >
                  {loading ? 'Entering Kitchen...' : <>Sign In <ArrowRight size={20} style={{ marginLeft: 8 }} /></>}
                </button>
              </form>

              <div style={{ margin: '32px 0 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 11, color: 'var(--text-soft)', fontWeight: 800, letterSpacing: '2px' }}>OR</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <div style={{ textAlign: 'center', fontSize: 15, color: 'var(--text-muted)', fontWeight: 500 }}>
                Not a member yet?{' '}
                <Link to="/register" style={{ color: 'var(--pink-deep)', fontWeight: 800, textDecoration: 'none' }}>
                  Create an account
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Access Grid - Much cleaner, button-like appearance */}
          <div style={{ marginTop: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '1.5px', textAlign: 'center', marginBottom: 20 }}>
              Quick Access Demo
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { role: 'Admin', email: 'admin@grandmas.com', pass: 'admin123', Icon: Settings, bg: 'var(--yellow)' },
                { role: 'Vendor', email: 'vendor@grandmas.com', pass: 'vendor123', Icon: ChefHat, bg: 'var(--mint-bg)' },
                { role: 'User', email: 'customer@test.com', pass: 'test123', Icon: ShoppingBag, bg: 'var(--pink)' },
              ].map(({ role, email, pass, Icon, bg }) => (
                <button
                  key={role} type="button" onClick={() => setForm((f) => ({ ...f, email, password: pass }))}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 8px',
                    borderRadius: 20, background: '#fff', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'var(--mint)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown)' }}>
                    <Icon size={18} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--brown)' }}>{role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .login-left { display: flex !important; }
          .login-mobile-logo { display: none !important; }
        }
        .gc-input:focus {
          border-color: var(--mint) !important;
          background: #fff !important;
          box-shadow: 0 0 0 4px var(--mint-bg) !important;
        }
      `}</style>
    </div>
  );
}