import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

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
  const strengthColor = ['transparent','#e24b4a','#f9b733','#2a7a5a'][strength];
  const strengthLabel = ['','Too short','Good','Strong'][strength];

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

  if (verifying) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdf8f2', padding: '32px 24px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>{!tokenValid ? '❌' : done ? '✅' : '🔐'}</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: '#3d2b1f', marginBottom: 6 }}>
            {!tokenValid ? 'Link Expired' : done ? 'Password Reset!' : 'Set New Password'}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: '32px', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1.5px solid rgba(0,0,0,0.06)' }}>
          {!tokenValid ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#888', marginBottom: 20, lineHeight: 1.6 }}>This reset link is invalid or has expired. Links are valid for 1 hour.</p>
              <Link to="/forgot-password" style={{ display: 'inline-block', background: '#3d2b1f', color: 'white', padding: '11px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 800 }}>Request New Link</Link>
            </div>
          ) : done ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#888', marginBottom: 20 }}>Your password has been reset successfully. Redirecting to login in 3 seconds...</p>
              <Link to="/" style={{ display: 'inline-block', background: 'var(--green)', color: 'white', padding: '11px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 800 }}>Go to Login</Link>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              {errors.general && <div style={{ background: '#fff5f5', border: '1.5px solid #ffd0d0', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#e24b4a', fontWeight: 700 }}>⚠ {errors.general}</div>}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔒</span>
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(er => ({ ...er, password: '' })); }}
                    placeholder="Min 6 characters"
                    style={{ width: '100%', padding: '11px 44px 11px 38px', border: `1.5px solid ${errors.password ? '#e24b4a' : 'rgba(0,0,0,0.08)'}`, borderRadius: 10, fontFamily: "'Nunito',sans-serif", fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                  <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#aaa' }}>{showPass ? '🙈' : '👁️'}</button>
                </div>
                {form.password && <div style={{ marginTop: 8 }}><div style={{ height: 4, background: '#eee', borderRadius: 2 }}><div style={{ height: '100%', width: `${(strength/3)*100}%`, background: strengthColor, borderRadius: 2, transition: 'all .3s' }} /></div><div style={{ fontSize: 11, color: strengthColor, fontWeight: 700, marginTop: 3 }}>{strengthLabel}</div></div>}
                {errors.password && <div style={{ fontSize: 12, color: '#e24b4a', fontWeight: 700, marginTop: 5 }}>⚠ {errors.password}</div>}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>✅</span>
                  <input type={showPass ? 'text' : 'password'} value={form.confirm} onChange={e => { setForm(f => ({ ...f, confirm: e.target.value })); setErrors(er => ({ ...er, confirm: '' })); }}
                    placeholder="Repeat password"
                    style={{ width: '100%', padding: '11px 14px 11px 38px', border: `1.5px solid ${errors.confirm ? '#e24b4a' : form.confirm && form.confirm === form.password ? '#2a7a5a' : 'rgba(0,0,0,0.08)'}`, borderRadius: 10, fontFamily: "'Nunito',sans-serif", fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                {form.confirm && form.confirm === form.password && <div style={{ fontSize: 12, color: '#2a7a5a', fontWeight: 700, marginTop: 5 }}>✓ Passwords match</div>}
                {errors.confirm && <div style={{ fontSize: 12, color: '#e24b4a', fontWeight: 700, marginTop: 5 }}>⚠ {errors.confirm}</div>}
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#3d2b1f,#5a3d2e)', color: 'white', border: 'none', borderRadius: 12, fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? '⏳ Resetting...' : '🔐 Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
