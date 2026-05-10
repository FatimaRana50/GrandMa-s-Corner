import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#3d2b1f', color: 'rgba(255,255,255,0.8)', padding: '40px 24px 24px', marginTop: 60 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontStyle: 'italic', color: 'white' }}>Grandma's</span>
              <div style={{ display: 'flex', gap: 3 }}>
                {'CORNER'.split('').map((l, i) => (
                  <div key={i} style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, background: i % 2 === 0 ? '#f4a7b9' : '#f9e4a0', borderRadius: 4, color: '#3d2b1f' }}>{l}</div>
                ))}
              </div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>Home-baked with love from Rawalpindi. Bringing grandma's recipes to your table.</p>
            {/* Social Links */}
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { href: 'https://wa.me/923005118159', icon: '💬', label: 'WhatsApp', color: '#25d366' },
                { href: 'https://instagram.com', icon: '📸', label: 'Instagram', color: '#e1306c' },
                { href: 'https://facebook.com', icon: '👍', label: 'Facebook', color: '#1877f2' },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.label}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, textDecoration: 'none', transition: 'background .18s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 800, color: 'white', marginBottom: 12, fontSize: 14 }}>Quick Links</div>
            {[
              { to: '/menu', label: 'Browse Menu' },
              { to: '/about', label: 'About Us' },
              { to: '/register', label: 'Sign Up as Vendor' },
              { to: '/', label: 'Login' },
            ].map(l => (
              <div key={l.label} style={{ marginBottom: 8 }}>
                <Link to={l.to} style={{ fontSize: 13, opacity: 0.7, textDecoration: 'none', color: 'rgba(255,255,255,0.7)', transition: 'opacity .15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0.7}>{l.label}</Link>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontWeight: 800, color: 'white', marginBottom: 12, fontSize: 14 }}>Contact Us</div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>📞 0300-5118159</div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>💬 WhatsApp: 0300-5118159</div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>📧 admin@grandmas.com</div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>📍 Rawalpindi, Pakistan</div>
          </div>

          <div>
            <div style={{ fontWeight: 800, color: 'white', marginBottom: 12, fontSize: 14 }}>Order Info</div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>⏱ 3 days lead time</div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>📦 Min 2 dozen per item</div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>🚗 Delivery charges extra</div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>💳 Cash on delivery</div>
            <div style={{ marginTop: 16 }}>
              <Link to="/about" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none', transition: 'background .18s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                Learn More →
              </Link>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.5 }}>© 2026 Grandma's Corner. All rights reserved.</div>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <span key={l} style={{ fontSize: 12, opacity: 0.5, cursor: 'pointer', transition: 'opacity .15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
