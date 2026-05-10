import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

// Inject shared animations + food-themed background once
const STYLE_ID = 'auth-food-styles';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.innerHTML = `
    @keyframes floatUp { 0%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-18px) rotate(8deg)} 100%{transform:translateY(0) rotate(0)} }
    @keyframes fadeInUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulseGlow { 0%,100%{box-shadow:0 8px 40px rgba(61,43,31,.10)} 50%{box-shadow:0 12px 50px rgba(61,43,31,.18)} }
    @keyframes spin { to { transform: rotate(360deg) } }
    @keyframes pop { 0%{transform:scale(.6);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
    .auth-card { animation: fadeInUp .55s ease both, pulseGlow 6s ease-in-out infinite; }
    .auth-emoji { display:inline-block; animation: floatUp 4s ease-in-out infinite; }
    .auth-pop { display:inline-block; animation: pop .5s ease both; }
    .auth-bg-emoji { position:absolute; font-size:42px; opacity:.10; user-select:none; pointer-events:none; animation: floatUp 7s ease-in-out infinite; }
    .auth-btn { transition: transform .18s ease, box-shadow .18s ease, opacity .2s; }
    .auth-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(61,43,31,.25); }
    .auth-input:focus { border-color:#3d2b1f !important; box-shadow: 0 0 0 4px rgba(61,43,31,.08); }
    .auth-spinner { width:18px; height:18px; border:2.5px solid rgba(255,255,255,.35); border-top-color:#fff; border-radius:50%; animation: spin .8s linear infinite; display:inline-block; vertical-align:middle; margin-right:8px; }
    .auth-spinner-lg { width:42px; height:42px; border:4px solid rgba(61,43,31,.15); border-top-color:#3d2b1f; border-radius:50%; animation: spin .8s linear infinite; }
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

const PageShell = ({ children }) => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '32px 24px', position: 'relative', overflow: 'hidden',
    background: 'radial-gradient(1200px 600px at 10% 0%, #fff3e0 0%, transparent 60%), radial-gradient(900px 500px at 100% 100%, #fdecd2 0%, transparent 55%), #fdf8f2',
    fontFamily: "'Nunito', sans-serif",
  }}>
    {FOOD_EMOJIS.map((f, i) => (
      <span key={i} className="auth-bg-emoji" style={{ top: f.top, left: f.left, animationDelay: f.delay }}>{f.e}</span>
    ))}
    <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 2 }}>{children}</div>
  </div>
);

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [done, setDone] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (!token) { setVerifying(false); return; }
    api.get(`/auth/reset-password/verify?token=${token}`)
      .then(() => setTokenValid(true))
      .catch(() => setTokenValid(false))
      .finally(() => setVerifying(false));
  }, [token]);

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColor = ['transparent', '#e24b4a', '#f9b733', '#2a7a5a'][strength];
  const strengthLabel = ['', 'Too short', 'Good', 'Strong'][strength];

  const validate = () => {
    const e = {};
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.confirm) e.confirm = 'Please confirm your password';
    else if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      setDone(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Reset failed' });
    } finally { setLoading(false); }
  };

  if (verifying) {
    return (
      <PageShell>
        <div style={{ textAlign: 'center' }}>
          <div className="auth-spinner-lg" style={{ margin: '0 auto 18px' }} />
          <p style={{ color: '#7a6a5e', fontSize: 14.5 }}>Verifying your reset link...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div className="auth-pop" style={{ fontSize: 56, marginBottom: 12 }}>
          {!tokenValid ? '❌' : done ? '✅' : '🔐'}
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#3d2b1f', margin: '0 0 6px' }}>
          {!tokenValid ? 'Link Expired' : done ? 'Password Reset!' : 'Set New Password'}
        </h1>
        <p style={{ color: '#7a6a5e', fontSize: 14, margin: 0 }}>
          {!tokenValid ? 'Time to request a fresh one.' : done ? 'You can now sign back in.' : 'Choose a strong password you’ll remember.'}
        </p>
      </div>

      <div className="auth-card" style={{
        background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(8px)',
        borderRadius: 22, padding: 32, border: '1.5px solid rgba(61,43,31,.06)',
      }}>
        {!tokenValid ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#7a6a5e', marginBottom: 22, lineHeight: 1.6, fontSize: 14.5 }}>
              This reset link is invalid or has expired. Links are valid for <strong>1 hour</strong>.
            </p>
            <Link to="/forgot-password" className="auth-btn" style={{
              display: 'inline-block', background: 'linear-gradient(135deg,#3d2b1f,#5a3d2e)',
              color: 'white', padding: '12px 30px', borderRadius: 12, textDecoration: 'none', fontWeight: 800, fontSize: 14.5,
            }}>
              Request New Link
            </Link>
          </div>
        ) : done ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#7a6a5e', marginBottom: 22, lineHeight: 1.6, fontSize: 14.5 }}>
              Your password has been reset successfully. Redirecting to login in 3 seconds...
            </p>
            <Link to="/" className="auth-btn" style={{
              display: 'inline-block', background: 'linear-gradient(135deg,#2a7a5a,#3a9170)',
              color: 'white', padding: '12px 30px', borderRadius: 12, textDecoration: 'none', fontWeight: 800, fontSize: 14.5,
            }}>
              Go to Login →
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            {errors.general && (
              <div style={{ background: '#fff5f5', border: '1.5px solid #ffd0d0', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13.5, color: '#e24b4a', fontWeight: 700 }}>
                ⚠ {errors.general}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔒</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="auth-input"
                  value={form.password}
                  onChange={(e) => { setForm((f) => ({ ...f, password: e.target.value })); setErrors((er) => ({ ...er, password: '' })); }}
                  placeholder="Min 6 characters"
                  style={{
                    width: '100%', padding: '12px 44px 12px 38px',
                    border: `1.5px solid ${errors.password ? '#e24b4a' : 'rgba(0,0,0,0.08)'}`,
                    borderRadius: 10, fontFamily: "'Nunito',sans-serif", fontSize: 15,
                    outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s, box-shadow .2s',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#aaa' }}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 4, background: '#eee', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(strength / 3) * 100}%`, background: strengthColor, borderRadius: 2, transition: 'all .3s' }} />
                  </div>
                  <div style={{ fontSize: 11, color: strengthColor, fontWeight: 700, marginTop: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    {strengthLabel}
                  </div>
                </div>
              )}
              {errors.password && <div style={{ fontSize: 12.5, color: '#e24b4a', fontWeight: 700, marginTop: 5 }}>⚠ {errors.password}</div>}
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>✅</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="auth-input"
                  value={form.confirm}
                  onChange={(e) => { setForm((f) => ({ ...f, confirm: e.target.value })); setErrors((er) => ({ ...er, confirm: '' })); }}
                  placeholder="Repeat password"
                  style={{
                    width: '100%', padding: '12px 14px 12px 38px',
                    border: `1.5px solid ${errors.confirm ? '#e24b4a' : form.confirm && form.confirm === form.password ? '#2a7a5a' : 'rgba(0,0,0,0.08)'}`,
                    borderRadius: 10, fontFamily: "'Nunito',sans-serif", fontSize: 15,
                    outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s, box-shadow .2s',
                  }}
                />
              </div>
              {form.confirm && form.confirm === form.password && (
                <div style={{ fontSize: 12.5, color: '#2a7a5a', fontWeight: 700, marginTop: 5 }}>✓ Passwords match</div>
              )}
              {errors.confirm && <div style={{ fontSize: 12.5, color: '#e24b4a', fontWeight: 700, marginTop: 5 }}>⚠ {errors.confirm}</div>}
            </div>

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
              {loading ? (<><span className="auth-spinner" />Resetting...</>) : '🔐 Reset Password'}
            </button>
          </form>
        )}
      </div>

      <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: '#a89a8c' }}>
        🍴 Crafted with care for food lovers
      </p>
    </PageShell>
  );
}
