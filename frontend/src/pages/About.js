import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Users, Clock, ShieldCheck, 
  ArrowRight, Mail, Phone, ChefHat, ShoppingBag, Truck
} from 'lucide-react';

export default function About() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: "'Inter', sans-serif" }}>
      
      {/* ================= HERO SECTION ================= */}
      <section style={{ 
        position: 'relative', height: '550px', display: 'flex', alignItems: 'center', 
        justifyContent: 'center', color: '#fff', textAlign: 'center', overflow: 'hidden' 
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=2070')`,
          backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0, transform: 'scale(1.1)', filter: 'blur(1px)'
        }} />
        
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 800, padding: '0 20px' }}>
          <div style={{ display: 'inline-block', background: '#f4a7bb', color: '#3d2b1f', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px' }}>Our Story</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '64px', fontStyle: 'italic', marginBottom: '20px', textShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
            Grandma's Corner
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.9, lineHeight: '1.6', fontWeight: 300 }}>
            Bringing the soul of Rawalpindi's home kitchens directly to your table. <br/>
            Real recipes. Real people. Real love.
          </p>
        </div>
      </section>

      {/* ================= STORY CARDS ================= */}
      <section style={{ maxWidth: '1100px', margin: '-80px auto 80px', position: 'relative', zIndex: 10, padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          {[
            { icon: <ChefHat size={32} />, title: 'Born at Home', text: "Every item is crafted in real home kitchens using recipes passed down through generations. No industrial factories here." },
            { icon: <Heart size={32} />, title: 'Made with Love', text: "Our vendors pour their hearts into every batch. From frozen samosas to walnut brownies, it's fresh and preservative-free." },
            { icon: <Users size={32} />, title: 'Empowering Women', text: "We provide a platform for local food entrepreneurs to build sustainable livelihoods from their culinary mastery." },
          ].map((item, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: '#fff', borderRadius: '24px', transform: 'rotate(2deg)', border: '1px solid #eee', zIndex: -1 }} />
              <div style={{ 
                background: '#fff', padding: '40px 30px', borderRadius: '24px', 
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #eee', height: '100%'
              }}>
                <div style={{ color: i % 2 === 0 ? '#f4a7bb' : '#fce38a', marginBottom: '20px' }}>{item.icon}</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', color: '#3d2b1f', marginBottom: '15px' }}>{item.title}</h3>
                <p style={{ color: '#777', fontSize: '15px', lineHeight: '1.7' }}>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= HOW THE MAGIC HAPPENS (Atmospheric Background) ================= */}
      <section style={{ 
        padding: '120px 0', position: 'relative', overflow: 'hidden', 
        backgroundImage: `linear-gradient(rgba(31, 22, 16, 0.85), rgba(31, 22, 16, 0.85)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070')`,
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#fff', fontSize: '48px', marginBottom: '10px' }}>How the Magic Happens</h2>
          <p style={{ color: '#fce38a', fontSize: '14px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '60px', fontWeight: 600 }}>The Journey of your Meal</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { step: '01', icon: <ShoppingBag />, label: 'Browse', text: 'Explore our rotating menu of authentic items.' },
              { step: '02', icon: <Clock />, label: 'Wait 3 Days', text: 'Giving chefs time to source fresh ingredients.' },
              { step: '03', icon: <ShieldCheck />, label: 'Quality Control', text: 'Every vendor is verified for hygiene and taste.' },
              { step: '04', icon: <Truck />, label: 'Fresh Delivery', text: 'Warm, homemade goodness at your doorstep.' },
            ].map((s, i) => (
              <div key={i} style={{ 
                background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(15px)', 
                border: '1px solid rgba(255,255,255,0.15)', padding: '40px 20px', borderRadius: '24px', color: '#fff',
                transition: 'transform 0.3s ease'
              }}>
                <div style={{ 
                    fontSize: '14px', fontWeight: 900, color: '#fce38a', marginBottom: '20px', 
                    background: 'rgba(252, 227, 138, 0.1)', display: 'inline-block', padding: '5px 12px', borderRadius: '8px'
                }}>
                    {s.step}
                </div>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', color: '#f4a7bb' }}>
                    {React.cloneElement(s.icon, { size: 32 })}
                </div>
                <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '10px', fontFamily: 'serif' }}>{s.label}</div>
                <div style={{ fontSize: '13px', opacity: 0.7, lineHeight: '1.5' }}>{s.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STATS & CTA ================= */}
      <section style={{ padding: '100px 20px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '60px', alignItems: 'center' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[
              { val: '28+', label: 'Menu Items', color: '#f4a7bb' },
              { val: '3 Days', label: 'Prep Time', color: '#fce38a' },
              { val: '100%', label: 'Homemade', color: '#a8d5ba' },
              { val: '24/7', label: 'Support', color: '#fde8d0' },
            ].map((stat, i) => (
              <div key={i} style={{ background: stat.color, padding: '45px 20px', borderRadius: '28px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: 800, color: '#3d2b1f' }}>{stat.val}</div>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#3d2b1f', opacity: 0.6, letterSpacing: '1px' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{ paddingLeft: '20px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '48px', color: '#3d2b1f', marginBottom: '25px', lineHeight: 1.1 }}>Be part of our<br/>growing family.</h2>
            <p style={{ color: '#777', lineHeight: '1.8', marginBottom: '35px', fontSize: '17px' }}>
              Whether you are a food lover seeking authentic flavors or a home chef ready to share your talent, Grandma's Corner is where community meets the kitchen.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#3d2b1f', fontWeight: 600 }}>
                <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}><Phone size={20} style={{color: '#3d2b1f'}}/></div> 0300-5118159
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#3d2b1f', fontWeight: 600 }}>
                <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}><Mail size={20} style={{color: '#3d2b1f'}}/></div> admin@grandmas.com
              </div>
            </div>

            <Link to="/register" style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '12px', background: '#3d2b1f', color: '#fff', 
              padding: '20px 40px', borderRadius: '18px', textDecoration: 'none', fontWeight: 700, fontSize: '16px', boxShadow: '0 15px 30px rgba(61, 43, 31, 0.25)' 
            }}>
              Join as Vendor <ArrowRight size={22} />
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}