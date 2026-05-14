# Complete Code Flow Explanation – Grandma's Corner

---

## PART 1: Difficult Terms Explained (No CS Background Needed)

### CORS (Cross-Origin Resource Sharing)
**What it is:** A security rule that prevents one website from secretly talking to another website on behalf of a user.

**Why it exists:** If evil-site.com could secretly ask bank.com to transfer money without your knowledge, that would be bad. Browsers enforce CORS to stop that.

**In your app:**
- Frontend runs on `localhost:3000` (React dev server)
- Backend runs on `localhost:5000` (Express server)
- They are **different origins** (different ports = different origin)
- Without CORS headers, browser blocks the frontend from talking to backend
- Your backend in [server.js#L7](backend/server.js#L7) manually sets CORS headers to say "I allow localhost:3000 to talk to me"
- Preflight (OPTIONS) request is when browser asks "can I send this request?" and backend says "yes" in [server.js#L33](backend/server.js#L33)

**Simple analogy:** It's like having a security guard at the entrance. Your app says "allow requests from these people" and the guard checks IDs.

---

### JWT (JSON Web Token)
**What it is:** A secure ticket that proves you are logged in. Server gives you a token, and you carry it with every request.

**How it works:**
1. User logs in with email/password
2. Server validates password using bcrypt (see below)
3. Server creates a JWT token with user's ID inside: `{ id: "user123", expires: "24 hours" }`
4. Server encodes this with a secret password so user can't fake it
5. User keeps this token in localStorage (browser's memory)
6. For every next request, user adds token to the Authorization header
7. Server checks: "Is this token valid? Is it not expired? Does the secret match?"

**In your app:**
- Token creation: [auth.js#L10](backend/routes/auth.js#L10) - `signToken` function
- Token expiry: 24 hours normally, 30 days if "remember me" checked in [auth.js#L11](backend/routes/auth.js#L11)
- Token is checked by protect middleware in [middleware/auth.js#L4](backend/middleware/auth.js#L4)

**Simple analogy:** JWT is like a concert ticket. Venue gives you a ticket with your name and barcode. You show it at every entrance. The barcode can't be faked because venue knows the special marking.

---

### bcrypt (Password Hashing)
**What it is:** A special math function that turns passwords into nonsense so even server admins can't see actual passwords.

**How it works:**
- User password: `myPassword123`
- After bcrypt: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86U...` (looks like random garbage)
- Bcrypt is **one-way**: can't reverse it to get original password
- Every time user logs in, bcrypt hashes their input and compares the garbage
- If garbage matches stored garbage, password is correct

**In your app:**
- Hashing on signup: [auth.js#L35](backend/routes/auth.js#L35) - `bcrypt.hash(password, 10)`
- Comparing on login: [auth.js#L48](backend/routes/auth.js#L48) - `bcrypt.compare(password, user.password)`

**Simple analogy:** It's like turning a photo into a fingerprint. Can't reverse a fingerprint back to a photo, but you can recognize someone if fingerprints match.

---

### Middleware
**What it is:** Functions that run **before** your main route handler. Like security checkpoints.

**How it works:**
```
Request comes in → Middleware 1 checks → Middleware 2 checks → Route handler → Response
```

**In your app:**
- CORS middleware runs on every request in [server.js#L7](backend/server.js#L7)
- JSON parsing middleware runs in [server.js#L44](backend/server.js#L44)
- `protect` middleware checks JWT in [middleware/auth.js#L4](backend/middleware/auth.js#L4)
- `requireRole` middleware checks user role in [middleware/auth.js#L18](backend/middleware/auth.js#L18)

**Simple analogy:** It's like a nightclub. Door person (CORS) checks if you're on the list. ID checker (protect) sees your ID. VIP checker (requireRole) checks if you're admin.

---

### Interceptor
**What it is:** A function that runs before and after every API call automatically.

**In your app:**
- Request interceptor in [api.js#L6](frontend/src/utils/api.js#L6) adds JWT token to every request:
  ```
  Before any request: Get token from localStorage → Add to Authorization header
  ```
- Response interceptor in [api.js#L13](frontend/src/utils/api.js#L13) handles 401 errors:
  ```
  If server says "unauthorized" → Clear localStorage → Redirect to login
  ```

**Simple analogy:** It's like a mail sorting center. Every letter gets stamped before sending, and returned letters get special handling.

---

### Populate (MongoDB)
**What it is:** When you have a database reference (like user ID), `populate` fetches the actual user data instead of just showing the ID.

**Example:**
- Order has `vendor: "507f1f77bcf86cd799439011"` (just the ID)
- Without populate: You see `vendor: "507f1f77bcf86cd799439011"`
- With populate: You see `vendor: { name: "Grandma's Kitchen", phone: "0300..." }`

**In your app:** [orders.js#L57](backend/routes/orders.js#L57)
```javascript
await order.populate('customer', 'name email phone');
await order.populate('vendor', 'name email phone whatsapp');
```

---

### Seeding Database
**What it is:** Pre-loading sample data when server starts.

**In your app:**
- When you first run the server, it creates demo users and menu items automatically
- Happens in `seedDatabase()` function starting at [server.js#L78](backend/server.js#L78)
- Creates admin, vendor1, vendor2, and menu items so you have data to test with

---

## PART 2: Complete Request Flow (Step-by-Step)

### **Example 1: User Login Flow**

**Step 1: User clicks "Sign In" button**
- Location: [Login.js#L62](frontend/src/pages/Login.js#L62)
- Email: `vendor@grandmas.com`, Password: `vendor123`

**Step 2: Frontend form validation**
- Location: [Login.js#L53](frontend/src/pages/Login.js#L53)
- Checks: Email format correct? Password entered?
- If validation fails: Show red error message in [Login.js#L186](frontend/src/pages/Login.js#L186)

**Step 3: Frontend sends API request**
- Location: [AuthContext.js#L40](frontend/src/context/AuthContext.js#L40)
- Request: `POST /api/auth/login`
- Body: `{ email: "vendor@grandmas.com", password: "vendor123", rememberMe: false }`
- Interceptor in [api.js#L6](frontend/src/utils/api.js#L6) runs first (no token yet on login)

**Step 4: Request arrives at backend**
- CORS middleware checks origin in [server.js#L16](backend/server.js#L16) - allows localhost:3000 ✓
- JSON parser parses body in [server.js#L44](backend/server.js#L44)
- Request reaches route handler [auth.js#L43](backend/routes/auth.js#L43)

**Step 5: Backend validates email/password**
- Location: [auth.js#L46](backend/routes/auth.js#L46)
- Finds user by email: `User.findOne({ email: "vendor@grandmas.com" })`
- If no user: Return 401 error
- If user found: Go to next step

**Step 6: Backend compares password using bcrypt**
- Location: [auth.js#L48](backend/routes/auth.js#L48)
- Stored password hash: `$2a$10$N9qo8...` (from signup)
- Input password: `vendor123`
- Bcrypt checks if they match
- If no match: Return 401 "Invalid email or password"
- If match: Go to next step

**Step 7: Backend creates JWT token**
- Location: [auth.js#L52](backend/routes/auth.js#L52)
- Calls `signToken(user._id, rememberMe)`
- In [auth.js#L10](backend/routes/auth.js#L10):
  - Creates payload: `{ id: "507f1f77bcf86cd799439011" }`
  - Sets expiry: `rememberMe` is false, so `expiresIn: '24h'`
  - Encodes with secret: Result is JWT token

**Step 8: Backend returns response**
- Location: [auth.js#L53](backend/routes/auth.js#L53)
- Response: `{ token: "eyJhbGc...", user: { _id, name, email, role, phone } }`

**Step 9: Frontend receives response**
- Interceptor doesn't trigger (status 200, not 401)
- AuthContext saves token in [AuthContext.js#L42](frontend/src/context/AuthContext.js#L42)
- localStorage: `gc_token = "eyJhbGc..."`
- AuthContext saves user state

**Step 10: Frontend redirects**
- Location: [Login.js#L69](frontend/src/pages/Login.js#L69)
- Role is "vendor", so redirect to `/vendor`
- ProtectedRoute in [App.js#L49](frontend/src/App.js#L49) allows access ✓

---

### **Example 2: Vendor Places Menu Item**

**Step 1: Vendor fills form and submits**
- Location: [VendorDashboard.js#L406](frontend/src/pages/VendorDashboard.js#L406)
- Data: `{ name: "Biryani", price: 500, unit: "per plate", category: "frozen" }`

**Step 2: Frontend validates**
- Checks: Name? Price? Category?
- If invalid: Show error

**Step 3: Frontend sends request**
- Location: [VendorDashboard.js#L413](frontend/src/pages/VendorDashboard.js#L413)
- Request: `POST /api/menu` (multipart form data with image)
- Interceptor runs in [api.js#L6](frontend/src/utils/api.js#L6)
  - Reads token from localStorage
  - Adds header: `Authorization: Bearer eyJhbGc...`

**Step 4: Request reaches backend**
- CORS allowed ✓
- JSON parsed
- Route handler [menu.js#L43](backend/routes/menu.js#L43): `router.post('/', protect, requireRole('vendor', 'admin'), ...)`

**Step 5: Protect middleware checks**
- Location: [middleware/auth.js#L4](backend/middleware/auth.js#L4)
- Extracts token from Authorization header
- Verifies JWT signature using secret (must match)
- Decodes JWT to get user ID
- Fetches user from database
- If invalid/expired: Return 401, interceptor clears token, redirects to login
- If valid: Continue ✓

**Step 6: RequireRole middleware checks**
- Location: [middleware/auth.js#L18](backend/middleware/auth.js#L18)
- User role is "vendor"
- Allowed roles are ['vendor', 'admin']
- Match ✓ Continue

**Step 7: Backend validates input**
- Location: [menu.js#L46](backend/routes/menu.js#L46)
- Checks: name? price?
- If missing: Return 400 error with message

**Step 8: Backend handles file upload**
- Location: [menu.js#L8-22](backend/routes/menu.js#L8)
- Multer saves file to `/uploads` folder
- File size limit: 5MB in [menu.js#L22](backend/routes/menu.js#L22)
- Allowed types: jpg, png, webp in [menu.js#L24](backend/routes/menu.js#L24)

**Step 9: Backend creates menu item**
- Location: [menu.js#L48](backend/routes/menu.js#L48)
- Saves to MongoDB: `MenuItem.create({ name, price, unit, vendor: req.user._id, image: "/uploads/..." })`
- Vendor field automatically set to current user's ID

**Step 10: Backend returns response**
- Response: `{ _id, name, price, vendor: { name, phone, whatsapp } }`

**Step 11: Frontend receives and updates**
- Add to menu list in state
- Show success toast: "Item added!"

---

### **Example 3: Customer Places Order**

**Step 1: Customer adds items to cart**
- Items stored in CartContext in [CartContext.js](frontend/src/context/CartContext.js)
- Cart state: `[{ _id, name, qty, price, vendor }]`

**Step 2: Customer clicks "Place Order"**
- Location: [Cart.js#L33](frontend/src/pages/Cart.js#L33)

**Step 3: Frontend validates**
- Checks: Delivery address? Phone? Items?
- Checks: All items from same vendor? (one order = one vendor)
- If invalid: Show error

**Step 4: Frontend sends request**
- Request: `POST /api/orders`
- Body: `{ items: [{ menuItemId, quantity }], deliveryAddress, phone, notes, paymentMethod }`
- Interceptor adds JWT token

**Step 5: Backend protect middleware checks**
- Location: [middleware/auth.js#L4](backend/middleware/auth.js#L4)
- Verifies token ✓

**Step 6: Backend requireRole checks**
- Location: [orders.js#L9](backend/routes/orders.js#L9)
- Only "customer" role allowed
- User is "customer" ✓

**Step 7: Backend validates items exist**
- For each item in request:
  - Find in database: `MenuItem.findById(menuItemId)`
  - Check: available? vendor matches?
  - If not found: Return 404
  - Calculate subtotal: price × quantity

**Step 8: Backend checks vendor consistency**
- All items must be from same vendor
- If not: Return error "All items must be from same vendor per order"

**Step 9: Backend creates order**
- Location: [orders.js#L40](backend/routes/orders.js#L40)
- Saves to MongoDB with:
  - `customer: req.user._id` (current user)
  - `vendor: vendorId` (from items)
  - `items: [{ menuItem, name, price, quantity, subtotal }]`
  - `totalAmount: sum of subtotals`
  - `status: 'pending'`
  - `statusHistory: [{ status: 'pending', note: 'Order placed' }]`

**Step 10: Backend populates references**
- Location: [orders.js#L52](backend/routes/orders.js#L52)
- Fetches full customer data: `name, email, phone`
- Fetches full vendor data: `name, email, phone, whatsapp`

**Step 11: Backend sends emails**
- Location: [orders.js#L57](backend/routes/orders.js#L57)
- Email to customer: "Your order confirmed!"
- Email to vendor: "New order received!"
- These are non-blocking (don't delay response)

**Step 12: Backend returns response**
- Response: `{ _id, customer, vendor, items, totalAmount, status }`

**Step 13: Frontend shows success**
- Location: [Cart.js#L91](frontend/src/pages/Cart.js#L91)
- Shows order confirmation screen
- Clears cart
- Offers "View My Orders" button

---

### **Example 4: Admin Deactivates User**

**Step 1: Admin clicks "Deactivate" on user**
- Location: [AdminDashboard.js#L31](frontend/src/pages/AdminDashboard.js#L31)
- User: "vendor@grandmas.com"

**Step 2: Confirmation dialog**
- Shows: "Deactivate vendor@grandmas.com? They will be notified by email."

**Step 3: Frontend sends request**
- Request: `PATCH /api/admin/users/{userId}/toggle-active`
- Body: Empty (toggle based on current state)
- Interceptor adds admin's JWT token

**Step 4: Backend protect middleware checks**
- Verifies JWT ✓

**Step 5: Backend requireRole checks**
- Location: [admin.js#L8](backend/routes/admin.js#L8)
- Only "admin" allowed
- User is "admin" ✓

**Step 6: Backend finds user and toggles**
- Location: [admin.js#L39](backend/routes/admin.js#L39)
- `user.isActive = !user.isActive` (flips true to false)
- Saves to database

**Step 7: Backend sends email to user**
- Location: [admin.js#L44-47](backend/routes/admin.js#L44)
- Subject: "Your account has been deactivated"
- Message: "Contact admin@grandmas.com if this is a mistake"

**Step 8: Backend returns response**
- Response: `{ message: "User deactivated", user }`

**Step 9: Frontend updates**
- Refreshes user list
- Shows status badge as "● Inactive"

**Step 10: Next time user tries to login**
- Backend checks in [auth.js#L51](backend/routes/auth.js#L51)
- If `isActive === false`: Return 403 error
- User sees: "Your account has been deactivated. Contact admin."

---

## PART 3: Special Flows

### **Password Reset Flow**

**Step 1: User clicks "Forgot Password"**
- Location: [Login.js#L224](frontend/src/pages/Login.js#L224)
- Enters email: `vendor@grandmas.com`

**Step 2: Frontend sends request**
- Request: `POST /api/auth/forgot-password`
- Body: `{ email: "vendor@grandmas.com" }`

**Step 3: Backend finds user**
- Location: [auth.js#L76](backend/routes/auth.js#L76)
- If not found: Still return success (don't reveal if email exists - security)

**Step 4: Backend creates reset token**
- Location: [auth.js#L81](backend/routes/auth.js#L81)
- Generates random token: `crypto.randomBytes(32).toString('hex')`
- Sets expiry: 1 hour from now
- Saves to PasswordReset collection with TTL index in [PasswordReset.js#L8](backend/models/PasswordReset.js#L8)

**Step 5: Backend sends reset email**
- Location: [auth.js#L87](backend/routes/auth.js#L87)
- Email contains link: `http://localhost:3000/reset-password?token={tokenhere}`

**Step 6: User clicks link in email**
- Frontend loads [ResetPassword.js](frontend/src/pages/ResetPassword.js)

**Step 7: Frontend verifies token**
- Location: [ResetPassword.js#L68](frontend/src/pages/ResetPassword.js#L68)
- Sends: `GET /api/auth/reset-password/verify?token={token}`
- Backend checks: Is token valid? Not expired? Not already used?
- If valid: Show form
- If invalid: Show "Link expired"

**Step 8: User enters new password**
- Validates in frontend

**Step 9: Frontend sends reset**
- Request: `POST /api/auth/reset-password`
- Body: `{ token: "...", password: "newPassword123" }`

**Step 10: Backend validates**
- Location: [auth.js#L114](backend/routes/auth.js#L114)
- Finds token in database
- Checks: not used? not expired?

**Step 11: Backend hashes and saves**
- Location: [auth.js#L122](backend/routes/auth.js#L122)
- Hashes password with bcrypt
- Updates user: `User.findByIdAndUpdate(record.user, { password: hash })`
- Marks token as used in [auth.js#L123](backend/routes/auth.js#L123)

**Step 12: User can now login**
- With new password

---

### **Session Timeout Flow**

**Step 1: User logs in**
- JWT created with 24h expiry
- Inactivity timer started in [AuthContext.js#L20](frontend/src/context/AuthContext.js#L20)

**Step 2: User inactive for 30 minutes**
- Location: [AuthContext.js#L5](frontend/src/context/AuthContext.js#L5)
- Timer fires

**Step 3: Frontend auto-logs out**
- Location: [AuthContext.js#L23](frontend/src/context/AuthContext.js#L23)
- Clears localStorage
- Redirects to login with reason: `?reason=inactivity`

**Step 4: User sees message**
- Location: [Login.js#L82](frontend/src/pages/Login.js#L82)
- Toast: "Logged out due to inactivity"

---

### **AI Suggestion Flow**

**Step 1: User types in chat**
- Location: [Home.js#L26](frontend/src/pages/Home.js#L26)
- Message: "I want something sweet"

**Step 2: Frontend sends request**
- Request: `POST /api/ai/suggest`
- Body: `{ message: "I want something sweet" }`

**Step 3: Backend fetches menu**
- Location: [ai.js#L8](backend/routes/ai.js#L8)
- Gets available items with vendor names

**Step 4: If Grok API key exists**
- Location: [ai.js#L14](backend/routes/ai.js#L14)
- Sends to Grok API with system prompt
- Grok responds with recommendation

**Step 5: If Grok API key missing**
- Location: [ai.js#L17](backend/routes/ai.js#L17)
- Uses fallback: keyword matching
- If message includes "sweet": suggest desserts
- If message includes "frozen": suggest frozen items

**Step 6: Backend parses response**
- Extracts item names from AI response
- Finds matching items in menu

**Step 7: Backend returns**
- Response: `{ reply: "Here are my recommendations...", suggestions: [items] }`

**Step 8: Frontend displays**
- Shows AI reply
- Shows suggestion cards with "Add" buttons

---

## PART 4: Database Schema (What's Stored)

### **User Collection**
```
{
  _id: ObjectId,
  name: "Vendor Name",
  email: "vendor@grandmas.com",
  password: "$2a$10$N9qo8..." (bcrypt hash),
  phone: "0300-...",
  whatsapp: "92300-...",
  role: "vendor" | "customer" | "admin",
  address: "Street address",
  isActive: true,
  createdAt: Date,
  updatedAt: Date
}
```

### **MenuItem Collection**
```
{
  _id: ObjectId,
  name: "Biryani",
  price: 500,
  unit: "per plate",
  category: "frozen" | "tea" | "kids",
  description: "...",
  image: "/uploads/...",
  available: true,
  vendor: ObjectId (reference to User),
  createdAt: Date,
  updatedAt: Date
}
```

### **Order Collection**
```
{
  _id: ObjectId,
  customer: ObjectId (reference to User),
  vendor: ObjectId (reference to User),
  items: [
    {
      menuItem: ObjectId,
      name: "Biryani",
      price: 500,
      unit: "per plate",
      quantity: 2,
      subtotal: 1000
    }
  ],
  totalAmount: 1000,
  deliveryAddress: "123 Main St",
  phone: "0300-...",
  notes: "Extra spicy",
  paymentMethod: "cod",
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled",
  statusHistory: [
    { status: "pending", note: "Order placed" },
    { status: "confirmed", note: "..." }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### **Review Collection**
```
{
  _id: ObjectId,
  order: ObjectId (reference to Order),
  customer: ObjectId (reference to User),
  vendor: ObjectId (reference to User),
  rating: 5,
  comment: "Delicious!",
  createdAt: Date
}
```

### **PasswordReset Collection**
```
{
  _id: ObjectId,
  user: ObjectId (reference to User),
  token: "random32bytestring",
  expiresAt: Date,
  used: false,
  createdAt: Date
}
(Auto-deletes after expiresAt time)
```

---

## PART 5: File Structure & Purpose

```
backend/
├── server.js                 ← App starts here. Sets up CORS, routes, database
├── middleware/
│   └── auth.js              ← protect & requireRole functions (security checkpoints)
├── models/
│   ├── User.js              ← User schema
│   ├── MenuItem.js          ← Menu item schema
│   ├── Order.js             ← Order schema
│   ├── Review.js            ← Review schema
│   └── PasswordReset.js     ← Token for password resets
├── routes/
│   ├── auth.js              ← Login, signup, password reset (no auth needed)
│   ├── menu.js              ← View, create, edit, delete menu items (vendor/admin only)
│   ├── orders.js            ← Create, view, update, cancel orders
│   ├── admin.js             ← Admin functions (admin only)
│   ├── reviews.js           ← Submit, view reviews
│   └── ai.js                ← AI food suggestions
└── utils/
    └── email.js             ← Email templates & sender

frontend/
├── src/
│   ├── App.js               ← Routes and ProtectedRoute component
│   ├── index.js             ← App entry point
│   ├── theme.css            ← Color variables, responsive styles
│   ├── context/
│   │   ├── AuthContext.js   ← User login state, inactivity timer
│   │   └── CartContext.js   ← Shopping cart state
│   ├── components/
│   │   ├── Navbar.js        ← Navigation header (shows links based on role)
│   │   └── Footer.js        ← Footer (contact info, social links)
│   ├── pages/
│   │   ├── Login.js         ← Login form (form validation, interceptor redirect)
│   │   ├── Register.js      ← Signup form (role selection)
│   │   ├── Home.js          ← Menu browsing & AI chat widget
│   │   ├── Cart.js          ← Shopping cart & checkout
│   │   ├── Orders.js        ← Customer's order history & review modal
│   │   ├── VendorDashboard.js ← Vendor's orders, menu management, reviews
│   │   ├── AdminDashboard.js  ← Admin's stats, users, vendors, orders
│   │   ├── About.js         ← About page
│   │   ├── ForgotPassword.js ← Password reset request
│   │   └── ResetPassword.js ← Password reset form (token verification)
│   └── utils/
│       └── api.js           ← Axios instance with interceptors
```

---

## PART 6: Key Security Measures

1. **CORS Whitelist** [server.js#L12](backend/server.js#L12)
   - Only allowed origins can call your API

2. **Bcrypt Password Hashing** [auth.js#L35](backend/routes/auth.js#L35)
   - Never store plain passwords

3. **JWT Token Expiry** [auth.js#L11](backend/routes/auth.js#L11)
   - Token expires after 24h (or 30d if remember-me)
   - Prevents old stolen tokens from working forever

4. **Protect Middleware** [middleware/auth.js#L4](backend/middleware/auth.js#L4)
   - Every sensitive route checks JWT

5. **Role-Based Access** [middleware/auth.js#L18](backend/middleware/auth.js#L18)
   - Admin routes only accessible to admins
   - Vendor routes only accessible to vendors/admins

6. **Server-Side Validation** [auth.js#L23-26](backend/routes/auth.js#L23)
   - Don't trust client validation
   - Backend re-validates everything

7. **Email Verification for Resets** [auth.js#L83](backend/routes/auth.js#L83)
   - Reset tokens expire after 1 hour
   - Can only be used once

8. **Account Deactivation** [auth.js#L51](backend/routes/auth.js#L51)
   - Admin can disable accounts without deletion

---

## PART 7: Common Error Scenarios

### Scenario 1: User Gets 401 "Not Authorized"
**Cause:** JWT token missing or invalid
**Where it happens:** [middleware/auth.js#L7](backend/middleware/auth.js#L7)
**What user sees:** Interceptor in [api.js#L14](frontend/src/utils/api.js#L14) clears token and redirects to login

### Scenario 2: User Gets 403 "Access Denied"
**Cause:** User is logged in, but doesn't have required role
**Example:** Non-admin tries to access /admin/users
**Where it happens:** [middleware/auth.js#L20](backend/middleware/auth.js#L20)

### Scenario 3: Email Send Fails
**Cause:** SMTP credentials wrong or email service down
**Impact:** User doesn't receive reset link or order confirmation
**Fallback:** Logged to console, but request still succeeds
**Location:** [email.js](backend/utils/email.js)

### Scenario 4: File Upload Too Large
**Cause:** User tries to upload image > 5MB
**Where it happens:** [menu.js#L22](backend/routes/menu.js#L22)
**Error:** 413 Payload Too Large

### Scenario 5: Same Item Ordered from Multiple Vendors
**Cause:** User adds item from vendor1 and vendor2 to same cart
**Impact:** Only items from one vendor allowed per order
**Where checked:** [orders.js#L28](backend/routes/orders.js#L28)
**Error:** "All items must be from same vendor per order"

---

## PART 8: How Frontend State Flows

### AuthContext (User logged in state)
- Location: [AuthContext.js](frontend/src/context/AuthContext.js)
- Holds: `{ user: {}, token: "" }`
- Available to all components via `useAuth()`
- When changes: ProtectedRoute re-checks access in [App.js#L21](frontend/src/App.js#L21)
- When empty: User redirected to login

### CartContext (Shopping cart)
- Location: [CartContext.js](frontend/src/context/CartContext.js)
- Holds: Array of items in cart
- Functions: `addItem, removeItem, updateQty, clearCart`
- Persisted in: localStorage (survives page refresh)
- Used in: Home.js (add buttons), Cart.js (checkout)

### Component State (Local form state)
- Example: [Login.js#L33](frontend/src/pages/Login.js#L33)
- Holds: `{ email: "", password: "", rememberMe: false }`
- Cleared when: Form submitted successfully

---

## Summary: What Happens When Someone Orders

1. Customer browses menu (Home.js fetches /api/menu) ✓
2. Customer clicks add to cart (CartContext updates) ✓
3. Customer goes to cart, enters address/phone ✓
4. Customer clicks "Place Order" ✓
5. Frontend calls POST /api/orders with items ✓
6. Backend protect middleware verifies JWT ✓
7. Backend requireRole checks user is "customer" ✓
8. Backend validates items exist and same vendor ✓
9. Backend creates Order document in MongoDB ✓
10. Backend sends email to customer ✓
11. Backend sends email to vendor ✓
12. Frontend shows "Order Confirmed!" ✓
13. Vendor logs in, sees order in /api/orders ✓
14. Vendor updates status to "preparing" via PATCH ✓
15. Backend protect & requireRole verify ✓
16. Customer sees status update in real-time ✓
17. After delivery, customer leaves review ✓
18. Review saved to Reviews collection ✓
19. Admin can see all stats, users, orders in /admin ✓

**This entire flow is secured by:** CORS → JWT → Roles → Validation → Database

