# 🌿 Grandma's Corner v2.0 — Full Stack Food Ordering Platform

A complete multi-vendor home-based food ordering web app built with React + Node.js + Express + MongoDB.

## 🆕 What's New in v2

| Feature | Status |
|---|---|
| 🐛 Bug Fix: `_id` error on place order | ✅ Fixed |
| 📧 Order confirmation email to customer | ✅ |
| 📧 New order notification email to vendor | ✅ |
| 📧 Account removed notification email | ✅ |
| 💬 WhatsApp customer → vendor button | ✅ |
| 💬 WhatsApp vendor → customer button | ✅ |
| ⭐ Customer reviews after delivery | ✅ |
| 🤖 AI food suggestion widget (Grok API) | ✅ |
| 🎨 Enhanced UI & Footer | ✅ |

---

## 🚀 Quick Setup

### Step 1 — MongoDB Atlas (Free)
Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free cluster → Get connection string

### Step 2 — Backend
```bash
cd backend
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET in .env
npm install
node server.js
```

### Step 3 — Frontend
```bash
cd frontend
npm install
npm start
```

---

## ⚙️ Environment Variables (backend/.env)

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key

# Email (Gmail App Password — NOT your regular password)
# Get App Password: myaccount.google.com → Security → 2FA → App Passwords
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx

# AI (optional — get from console.x.ai)
GROK_API_KEY=xai-...
```

> **Email note**: If SMTP_USER is not set, emails are simulated (logged to console). No crash.
> **AI note**: If GROK_API_KEY is not set, the AI widget uses smart keyword matching as fallback. Still works!

---

## 👤 Demo Accounts (auto-seeded)

| Role | Email | Password |
|---|---|---|
| Admin | admin@grandmas.com | admin123 |
| Vendor 1 | vendor@grandmas.com | vendor123 |
| Vendor 2 | vendor2@grandmas.com | vendor123 |

---

## 📁 Project Structure

```
grandmas-corner/
├── backend/
│   ├── models/
│   │   ├── User.js          — name, email, password, phone, whatsapp, role
│   │   ├── MenuItem.js      — name, price, unit, category, vendor
│   │   ├── Order.js         — customer, vendor, items, status, history
│   │   └── Review.js        — order, customer, vendor, rating, comment
│   ├── routes/
│   │   ├── auth.js          — register, login, me, profile
│   │   ├── menu.js          — CRUD menu items
│   │   ├── orders.js        — place, list, status update, cancel
│   │   ├── admin.js         — stats, users, vendors, orders
│   │   ├── reviews.js       — submit, list by vendor, check
│   │   └── ai.js            — Grok AI suggestion endpoint
│   ├── middleware/auth.js   — JWT verify + requireRole()
│   ├── utils/email.js       — Nodemailer email templates
│   └── server.js
└── frontend/
    └── src/
        ├── context/
        │   ├── AuthContext.js
        │   └── CartContext.js
        ├── components/
        │   ├── Navbar.js
        │   └── Footer.js
        └── pages/
            ├── Home.js          — Menu + AI chat widget
            ├── Login.js
            ├── Register.js
            ├── Cart.js          — With WhatsApp vendor button
            ├── Orders.js        — With WhatsApp vendor + review
            ├── VendorDashboard.js — Orders + Menu + Reviews tabs
            └── AdminDashboard.js  — Stats + Vendors + Orders + Customers
```

---

## 🔌 API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Register |
| POST | /api/auth/login | Public | Login |
| GET | /api/menu | Public | All menu items |
| POST | /api/menu | Vendor/Admin | Add item |
| PUT | /api/menu/:id | Vendor/Admin | Edit item |
| DELETE | /api/menu/:id | Vendor/Admin | Delete item |
| POST | /api/orders | Customer | Place order |
| GET | /api/orders/my | Customer | My orders |
| GET | /api/orders | Vendor/Admin | All orders |
| PATCH | /api/orders/:id/status | Vendor/Admin | Update status |
| PATCH | /api/orders/:id/cancel | Customer | Cancel order |
| POST | /api/reviews | Customer | Submit review |
| GET | /api/reviews/vendor/:id | Public | Vendor reviews |
| POST | /api/ai/suggest | Public | AI food suggestion |
| GET | /api/admin/stats | Admin | Dashboard stats |
| GET | /api/admin/users | Admin | All users |
| DELETE | /api/admin/users/:id | Admin | Remove user (sends email) |

---

## 🚀 Deployment (Free Tier)

**Backend → Render.com**
1. New Web Service → Connect GitHub
2. Root dir: `backend` | Build: `npm install` | Start: `node server.js`
3. Add env vars in Render dashboard

**Frontend → Vercel**
1. Import project | Root dir: `frontend`
2. Update `src/utils/api.js` baseURL to your Render URL

---

## 📋 Rubric Checklist

- ✅ Core features (forms, buttons, no errors)
- ✅ Login/Signup end-to-end with JWT
- ✅ MongoDB CRUD operations
- ✅ bcrypt password hashing
- ✅ No plain-text passwords stored
- ✅ Secure hash comparison
- ✅ Two roles: Admin + Customer (+ Vendor)
- ✅ Admin dashboard protected
- ✅ Admin can manage users
- ✅ Dynamic nav based on role
- ✅ Backend middleware role guards
- ✅ Client-side form validation
- ✅ Server-side validation
- ✅ Error messages displayed
- ✅ Working navbar on every page
- ✅ Logical page hierarchy
- ✅ Responsive design
- ✅ Session/JWT management
- ✅ Footer on all pages
- ✅ Original themed content
- ✅ Color palette & typography
- ✅ Transitions & hover effects
