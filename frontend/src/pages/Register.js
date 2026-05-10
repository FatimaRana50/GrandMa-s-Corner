import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Mail, Lock, User, Phone, MapPin, Eye, EyeOff, 
  ArrowRight, ShoppingBag, Store, ChefHat, Sparkles,
  Coffee, Heart, Star, Truck, CreditCard, Shield
} from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '', role: 'customer' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handle = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }));
  };

  const submit = async (e) => {
    e.preventDefault();
    // Simple validation
    const newErrors = {};
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (form.password && form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`🎉 Welcome, ${user.name}!`);
      navigate(user.role === 'vendor' ? '/vendor' : '/menu');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const inputStyle = (error, isFocused = false) => ({
    width: '100%',
    padding: '14px 14px 14px 42px',
    borderRadius: '14px',
    border: error ? '1.5px solid #e24b4a' : (isFocused ? '1.5px solid #3d2b1f' : '1px solid #e8e0d5'),
    background: 'white',
    fontSize: '14px',
    color: '#3d2b1f',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    boxShadow: isFocused ? '0 0 0 3px rgba(61,43,31,0.1)' : 'none'
  });

  // Feature cards data
  const features = [
    { icon: <ChefHat size={22} />, title: "Homemade Recipes", desc: "Authentic flavors passed down generations" },
    { icon: <Truck size={22} />, title: "Free Delivery", desc: "On orders above Rs. 1000 within Rawalpindi" },
    { icon: <Heart size={22} />, title: "Love Guarantee", desc: "100% satisfaction or full refund" },
    { icon: <Star size={22} />, title: "Rewards Points", desc: "Earn points on every order" }
  ];

  const testimonials = [
    { text: "Best samosas in town! Just like grandma used to make.", name: "Ayesha K.", rating: 5 },
    { text: "The biryani is absolutely delicious. Will order again!", name: "Bilal A.", rating: 5 }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      
      {/* ================= HEADER ================= */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 48px', borderBottom: '1px solid rgba(0,0,0,0.05)', 
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: '#f4a7bb', width: 40, height: 40, borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Coffee size={22} color="#3d2b1f" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 22, color: '#3d2b1f', letterSpacing: -0.5 }}>
            Grandma's <span style={{ color: '#f4a7bb' }}>Corner</span>
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, fontSize: 14, fontWeight: 500 }}>
          <Link to="/menu" style={{ textDecoration: 'none', color: '#3d2b1f' }}>Menu</Link>
          <Link to="/about" style={{ textDecoration: 'none', color: '#3d2b1f' }}>Our Story</Link>
          <Link to="/contact" style={{ textDecoration: 'none', color: '#3d2b1f' }}>Contact</Link>
          <Link to="/" style={{ 
            background: '#3d2b1f', padding: '8px 20px', borderRadius: '40px', 
            color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600
          }}>Sign In</Link>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 73px)' }}>
        
        {/* ================= LEFT PANEL - Enhanced Glassmorphism ================= */}
        <aside style={{
          flex: '0 0 48%', position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '48px 40px'
        }}>
          {/* Premium Food Background Image */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2070')`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'brightness(0.45) blur(0px)', transform: 'scale(1)', zIndex: 0
          }} />
          
          {/* Gradient Overlay for better readability */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)',
            zIndex: 1
          }} />

          {/* Content Wrapper */}
          <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
            
            {/* Hero Badge */}
            <div style={{
              display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)',
              padding: '8px 16px', borderRadius: '40px', marginBottom: '40px'
            }}>
              <Sparkles size={16} color="#fce38a" />
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>Rawalpindi's Favorites Since 1985</span>
            </div>

            {/* Main Quote */}
            <div style={{ maxWidth: '90%', marginBottom: '60px' }}>
              <h1 style={{ 
                fontSize: 52, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 20,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)', letterSpacing: -1
              }}>
                Taste the warmth<br />
                of <span style={{ color: '#fce38a', fontStyle: 'italic' }}>homemade</span> love.
              </h1>
              <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, marginBottom: 30 }}>
                Every dish is crafted with the same care and secrets from grandma's kitchen.
              </p>
              
              {/* Stats */}
              <div style={{ display: 'flex', gap: 40, marginTop: 20 }}>
                {[
                  { value: '15k+', label: 'Happy Families' },
                  { value: '120+', label: 'Signature Dishes' },
                  { value: '30min', label: 'Avg Delivery' }
                ].map((stat, idx) => (
                  <div key={idx}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{stat.value}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Glass Feature Grid - Enhanced */}
            <div style={{ 
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px',
              marginTop: 'auto'
            }}>
              {features.map((card, i) => (
                <div key={i} style={{
                  background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '20px',
                  padding: '18px', transition: 'all 0.3s ease'
                }}>
                  <div style={{ marginBottom: 12, color: '#fce38a' }}>{card.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 6 }}>{card.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{card.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ================= RIGHT PANEL - Refined Registration Form ================= */}
        <main style={{
          flex: 1, background: '#fcfaf7', position: 'relative',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '40px'
        }}>
          
          {/* Testimonial strip above form */}
          <div style={{
            display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center'
          }}>
            {testimonials.map((t, idx) => (
              <div key={idx} style={{
                background: 'white', padding: '8px 16px', borderRadius: '40px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #f0e8dc',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill={i < t.rating ? '#f4a7bb' : 'none'} color="#f4a7bb" />
                  ))}
                </div>
                <span style={{ fontSize: 12, color: '#666' }}>"{t.text.slice(0, 40)}..."</span>
              </div>
            ))}
          </div>

          <div style={{ 
            background: '#fff', borderRadius: '32px', padding: '40px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.08)', border: '1px solid #f0e8dc',
            width: '100%', maxWidth: 520
          }}>
            
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{
                width: 60, height: 60, background: '#fef3e8', borderRadius: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <User size={28} color="#3d2b1f" />
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: '#3d2b1f', marginBottom: 8 }}>Create Account</h2>
              <p style={{ color: '#888', fontSize: 14 }}>Join our food family for exclusive offers</p>
            </div>

            {/* Role Toggle - Sleeker Design */}
            <div style={{ display: 'flex', background: '#f5f2ed', padding: '6px', borderRadius: '60px', marginBottom: '28px' }}>
              <button 
                type="button"
                onClick={() => setForm({...form, role: 'customer'})}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', border: 'none', borderRadius: '40px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, background: form.role === 'customer' ? '#fff' : 'transparent', color: form.role === 'customer' ? '#3d2b1f' : '#999', boxShadow: form.role === 'customer' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>
                <ShoppingBag size={16} /> I want to order
              </button>
              <button 
                type="button"
                onClick={() => setForm({...form, role: 'vendor'})}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', border: 'none', borderRadius: '40px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, background: form.role === 'vendor' ? '#fff' : 'transparent', color: form.role === 'vendor' ? '#3d2b1f' : '#999', boxShadow: form.role === 'vendor' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>
                <Store size={16} /> I'm a vendor
              </button>
            </div>

            <form onSubmit={submit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Name Field */}
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: errors.name ? '#e24b4a' : '#aaa', zIndex: 1 }} />
                  <input 
                    name="name" value={form.name} onChange={handle} 
                    onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                    placeholder="Full Name" 
                    style={inputStyle(errors.name, focusedField === 'name')} 
                  />
                  {errors.name && <span style={{ fontSize: 11, color: '#e24b4a', marginTop: 4, display: 'block', paddingLeft: 12 }}>{errors.name}</span>}
                </div>

                {/* Email Field */}
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: errors.email ? '#e24b4a' : '#aaa', zIndex: 1 }} />
                  <input 
                    name="email" type="email" value={form.email} onChange={handle}
                    onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                    placeholder="Email Address" 
                    style={inputStyle(errors.email, focusedField === 'email')} 
                  />
                  {errors.email && <span style={{ fontSize: 11, color: '#e24b4a', marginTop: 4, display: 'block', paddingLeft: 12 }}>{errors.email}</span>}
                </div>

                {/* Password Field */}
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: errors.password ? '#e24b4a' : '#aaa', zIndex: 1 }} />
                  <input 
                    name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handle}
                    onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                    placeholder="Password (min. 6 characters)" 
                    style={inputStyle(errors.password, focusedField === 'password')} 
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', zIndex: 1 }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {errors.password && <span style={{ fontSize: 11, color: '#e24b4a', marginTop: 4, display: 'block', paddingLeft: 12 }}>{errors.password}</span>}
                </div>

                {/* Phone & Address Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa', zIndex: 1 }} />
                    <input name="phone" value={form.phone} onChange={handle} placeholder="Phone" style={inputStyle()} />
                  </div>

                  <div style={{ position: 'relative' }}>
                    <MapPin size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa', zIndex: 1 }} />
                    <input name="address" value={form.address} onChange={handle} placeholder="Delivery Address" style={inputStyle()} />
                  </div>
                </div>

                {/* Submit Button */}
                <button type="submit" disabled={loading} style={{
                  padding: '16px', background: '#3d2b1f', color: '#fff', border: 'none',
                  borderRadius: '40px', fontWeight: 600, fontSize: '16px', cursor: 'pointer',
                  marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'all 0.2s', opacity: loading ? 0.7 : 1
                }}>
                  {loading ? (
                    <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  ) : (
                    <>
                      Get Started <ArrowRight size={18} />
                    </>
                  )}
                </button>

                {/* Terms */}
                <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: 8 }}>
                  By signing up, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </form>

            {/* Login Link */}
            <div style={{ textAlign: 'center', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #f0e8dc' }}>
              <span style={{ fontSize: 14, color: '#888' }}>Already have an account? </span>
              <Link to="/" style={{ color: '#3d2b1f', fontWeight: 700, textDecoration: 'none' }}>Sign In →</Link>
            </div>
          </div>

          {/* Trust Badges */}
          <div style={{ display: 'flex', gap: 24, marginTop: 32, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={16} color="#3d2b1f" />
              <span style={{ fontSize: 12, color: '#666' }}>Secure Payments</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={16} color="#3d2b1f" />
              <span style={{ fontSize: 12, color: '#666' }}>100% Safe</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Heart size={16} color="#f4a7bb" />
              <span style={{ fontSize: 12, color: '#666' }}>Family Loved</span>
            </div>
          </div>
        </main>
      </div>

      {/* Keyframe animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}