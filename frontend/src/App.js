import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import About from './pages/About';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';
import './theme.css';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

const NO_CHROME = ['/', '/register', '/forgot-password', '/reset-password'];

function Layout() {
  const location = useLocation();
  const noChrome =
    NO_CHROME.includes(location.pathname) ||
    location.pathname.startsWith('/reset-password');

  return (
    <>
      {!noChrome && <Navbar />}
      <main style={{ minHeight: noChrome ? '100vh' : 'calc(100vh - 64px)' }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/menu" element={<ProtectedRoute roles={['customer','vendor','admin']}><Home /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute roles={['customer']}><Cart /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute roles={['customer']}><Orders /></ProtectedRoute>} />
          <Route path="/vendor" element={<ProtectedRoute roles={['vendor','admin']}><VendorDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!noChrome && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Layout />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                borderRadius: 12,
                background: '#fff',
                color: '#3d2b1f',
                boxShadow: '0 8px 28px rgba(61,43,31,0.10)',
                border: '1px solid rgba(61,43,31,0.06)',
              },
              duration: 3000,
            }}
          />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}