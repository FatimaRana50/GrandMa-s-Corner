import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdf8f2', padding: '32px 24px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔑</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: '#3d2b1f', marginBottom: 6 }}>Forgot Password?</div>
          <p style={{ color: '#aaa', fontSize: 14 }}>No worries — we'll send a reset link to your email.</p>
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: '32px', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1.5px solid rgba(0,0,0,0.06)' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
              <div style={{ fontWeight: 800, color: '#3d2b1f', fontSize: 18, marginBottom: 10 }}>Check your inbox!</div>
              <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                If <strong>{email}</strong> is registered, you'll receive a password reset link shortly. It expires in <strong>1 hour</strong>.
              </p>
              <p style={{ fontSize: 13, color: '#aaa', marginBottom: 20 }}>Don't see it? Check your spam folder.</p>
              <Link to="/" style={{ display: 'inline-block', background: '#3d2b1f', color: 'white', padding: '11px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 800, fontSize: 14 }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>📧</span>
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@example.com"
                    style={{ width: '100%', padding: '11px 14px 11px 38px', border: `1.5px solid ${error ? '#e24b4a' : 'rgba(0,0,0,0.08)'}`, borderRadius: 10, fontFamily: "'Nunito',sans-serif", fontSize: 15, color: '#3d2b1f', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                {error && <div style={{ fontSize: 12, color: '#e24b4a', fontWeight: 700, marginTop: 5 }}>⚠ {error}</div>}
              </div>
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#3d2b1f,#5a3d2e)', color: 'white', border: 'none', borderRadius: 12, fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1 }}>
                {loading ? '⏳ Sending...' : '📧 Send Reset Link'}
              </button>
            </form>
          )}
          {!sent && (
            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#888' }}>
              Remember it? <Link to="/" style={{ color: 'var(--green)', fontWeight: 800, textDecoration: 'none' }}>Sign in</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
