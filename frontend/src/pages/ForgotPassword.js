import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

// Inject animations + food-themed background once
const STYLE_ID = 'auth-food-styles';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.innerHTML = `
    @keyframes floatUp { 0%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-18px) rotate(8deg)} 100%{transform:translateY(0) rotate(0)} }
    @keyframes fadeInUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulseGlow { 0%,100%{box-shadow:0 8px 40px rgba(61,43,31,.10)} 50%{box-shadow:0 12px 50px rgba(61,43,31,.18)} }
    @keyframes spin { to { transform: rotate(360deg) } }
    .auth-card { animation: fadeInUp .55s ease both, pulseGlow 6s ease-in-out infinite; }
    .auth-emoji { display:inline-block; animation: floatUp 4s ease-in-out infinite; }
    .auth-bg-emoji { position:absolute; font-size:42px; opacity:.10; user-select:none; pointer-events:none; animation: floatUp 7s ease-in-out infinite; }
    .auth-btn { transition: transform .18s ease, box-shadow .18s ease, opacity .2s; }
    .auth-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(61,43,31,.25); }
    .auth-input:focus { border-color:#3d2b1f !important; box-shadow: 0 0 0 4px rgba(61,43,31,.08); }
    .auth-spinner { width:18px; height:18px; border:2.5px solid rgba(255,255,255,.35); border-top-color:#fff; border-radius:50%; animation: spin .8s linear infinite; display:inline-block; vertical-align:middle; margin-right:8px; }
  `;
  document.head.appendChild(s);
}

const FOOD_EMOJIS = [
  { e: '🍕', top: '8%',  left: '6%',  delay: '0s' },
  { e: '🥐', top: '14%', left: '82%', delay: '1.1s' },
  { e: '🍓', top: '38%', left: '4%',  delay: '2s' },
  { e: '🥗', top: '70%', left: '88%', delay: '.6s' },
  { e: '🍣', top: '82%', left: '10%', delay: '1.6s' },
  { e: '🧁', top: '55%', left: '92%', delay: '2.4s' },
  { e: '🍩', top: '28%', left: '90%', delay: '3s' },
  { e: '🥑', top: '88%', left: '50%', delay: '.3s' },
];

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', position: 'relative', overflow: 'hidden',
      background: 'radial-gradient(1200px 600px at 10% 0%, #fff3e0 0%, transparent 60%), radial-gradient(900px 500px at 100% 100%, #fdecd2 0%, transparent 55%), #fdf8f2',
      fontFamily: "'Nunito', sans-serif",
    }}>
      {FOOD_EMOJIS.map((f, i) => (
        <span key={i} className="auth-bg-emoji" style={{ top: f.top, left: f.left, animationDelay: f.delay }}>{f.e}</span>
      ))}

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="auth-emoji" style={{ fontSize: 56, marginBottom: 12 }}>🔑</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: '#3d2b1f', margin: '0 0 6px' }}>
            Forgot Password?
          </h1>
          <p style={{ color: '#7a6a5e', fontSize: 14.5, margin: 0 }}>
            No worries — we'll send a reset link to your email.
          </p>
        </div>

        <div className="auth-card" style={{
          background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(8px)',
          borderRadius: 22, padding: 32, border: '1.5px solid rgba(61,43,31,.06)',
        }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div className="auth-emoji" style={{ fontSize: 52, marginBottom: 12 }}>📧</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#3d2b1f', margin: '0 0 10px' }}>
                Check your inbox!
              </h2>
              <p style={{ color: '#7a6a5e', lineHeight: 1.6, fontSize: 14.5, marginBottom: 8 }}>
                If <strong style={{ color: '#3d2b1f' }}>{email}</strong> is registered, you'll receive a password reset link shortly. It expires in 1 hour.
              </p>
              <p style={{ color: '#a89a8c', fontSize: 12.5, marginBottom: 22 }}>
                Don't see it? Check your spam folder.
              </p>
              <Link to="/" className="auth-btn" style={{
                display: 'inline-block', background: 'linear-gradient(135deg,#3d2b1f,#5a3d2e)',
                color: 'white', padding: '12px 30px', borderRadius: 12, textDecoration: 'none', fontWeight: 800, fontSize: 14.5,
              }}>
                ← Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Email Address
              </label>
              <div style={{ position: 'relative', marginBottom: error ? 6 : 18 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>📧</span>
                <input
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  style={{
                    width: '100%', padding: '12px 14px 12px 38px',
                    border: `1.5px solid ${error ? '#e24b4a' : 'rgba(0,0,0,0.08)'}`,
                    borderRadius: 10, fontFamily: "'Nunito',sans-serif", fontSize: 15,
                    color: '#3d2b1f', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color .2s, box-shadow .2s',
                  }}
                />
              </div>
              {error && (
                <div style={{ fontSize: 12.5, color: '#e24b4a', fontWeight: 700, marginBottom: 14 }}>
                  ⚠ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="auth-btn"
                style={{
                  width: '100%', padding: '13px',
                  background: loading ? '#a89a8c' : 'linear-gradient(135deg,#3d2b1f,#5a3d2e)',
                  color: 'white', border: 'none', borderRadius: 12,
                  fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 15,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (<><span className="auth-spinner" />Sending...</>) : '📧 Send Reset Link'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#7a6a5e' }}>
                Remember it?{' '}
                <Link to="/" style={{ color: '#3d2b1f', fontWeight: 800, textDecoration: 'none', borderBottom: '1.5px solid #3d2b1f' }}>
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: '#a89a8c' }}>
          🍴 Crafted with care for food lovers
        </p>
      </div>
    </div>
  );
}
