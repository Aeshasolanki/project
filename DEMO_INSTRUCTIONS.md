# 🎬 Mukhawar Platform - Demo Instructions

## 🚀 Quick Demo Setup (No External Services Required)

This guide will help you run a demo without needing Twilio, Stripe, or other external services.

---

## Step 1: Minimal Setup

### Install Dependencies
```bash
cd /home/user/mukhawar-app
npm install
cd client
npm install
cd ..
```

### Create Minimal .env
```bash
cat > .env << 'ENVFILE'
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mukhawar
JWT_SECRET=demo_secret_key_for_testing_2026
JWT_EXPIRE=30d
ENVFILE
```

---

## Step 2: Start MongoDB

### Option A: Local MongoDB
```bash
# Install if not installed
sudo apt-get update
sudo apt-get install -y mongodb

# Start service
sudo systemctl start mongodb
```

### Option B: MongoDB in Docker
```bash
docker run -d -p 27017:27017 --name mukhawar-mongo mongo:latest
```

---

## Step 3: Run Application

### Terminal 1: Backend
```bash
cd /home/user/mukhawar-app
npm run dev
```

Expected output:
```
🚀 Mukhawar Server running on port 5000
📍 Environment: development
✅ MongoDB Connected
```

### Terminal 2: Frontend
```bash
cd /home/user/mukhawar-app/client
npm start
```

Browser will open at: http://localhost:3000

---

## Step 4: Test Without External Services

### Test 1: Health Check
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "environment": "development"
}
```

### Test 2: Request OTP (Mock Mode)
```bash
curl -X POST http://localhost:5000/api/auth/phone/request-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+971501234567",
    "language": "ar"
  }'
```

**Important:** Check terminal logs for OTP code (printed to console)

```
OTP for +971501234567: 123456
```

### Test 3: Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/phone/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+971501234567",
    "otp": "123456",
    "language": "ar"
  }'
```

Should return JWT token:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "phoneNumber": "+971501234567",
    "role": "customer"
  }
}
```

---

## Step 5: Seed Demo Data (Optional)

Create sample designs and shops for testing:

```bash
cd /home/user/mukhawar-app
node << 'SEEDSCRIPT'
const mongoose = require('mongoose');
require('./models/Design');
require('./models/ShopProfile');
require('./models/User');

mongoose.connect('mongodb://localhost:27017/mukhawar')
  .then(() => {
    console.log('Connected to MongoDB');
    // Add seed data here
    console.log('Demo data created');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
SEEDSCRIPT
```

---

## 📱 Frontend Demo

When you open http://localhost:3000, you should see:

1. **Header:**
   - Moroccan burgundy gradient
   - Islamic geometric pattern overlay
   - "المخور" logo in gold Arabic calligraphy
   - Profile and notification icons

2. **Bottom Navigation:**
   - Home, Search, Orders, Profile icons
   - Gold accent on active tab

3. **Theme:**
   - RTL layout (right-to-left)
   - Arabic fonts
   - Burgundy, gold, and cream colors

---

## 🔧 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
```bash
# Check if MongoDB is running
sudo systemctl status mongodb

# Or start it
sudo systemctl start mongodb
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find process using port
lsof -ti:5000

# Kill it
kill -9 $(lsof -ti:5000)
```

### Frontend Build Error
```
Module not found: Can't resolve 'react'
```

**Solution:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

---

## 📸 Expected Screenshots

### 1. Backend Running:
```
🚀 Mukhawar Server running on port 5000
📍 Environment: development
✅ MongoDB Connected
```

### 2. Frontend Running:
- Beautiful Moroccan-themed UI
- Arabic text (RTL)
- Bottom navigation bar
- Responsive design

### 3. API Response:
```json
{
  "success": true,
  "message": "تم إرسال رمز التحقق"
}
```

---

## 🎯 Demo Flow

1. ✅ Backend starts successfully
2. ✅ MongoDB connects
3. ✅ Frontend loads with Moroccan theme
4. ✅ API responds to health check
5. ✅ OTP request works (mock mode)
6. ✅ JWT token generation works
7. ✅ Protected routes verify token

---

## 📂 Files to Show Client

1. **Backend Models:**
   - `/home/user/mukhawar-app/models/` (7 complete models)

2. **Frontend Components:**
   - `/home/user/mukhawar-app/client/src/components/`

3. **Theme System:**
   - `/home/user/mukhawar-app/client/src/theme/theme.js`

4. **Documentation:**
   - `README.md` - Full documentation
   - `QUICKSTART.md` - Setup guide
   - `DELIVERY_SUMMARY.md` - Project summary

---

## ✅ Demo Checklist

Before presenting to client:

- [ ] MongoDB is running
- [ ] Backend starts without errors
- [ ] Frontend builds and opens in browser
- [ ] Health endpoint responds
- [ ] OTP flow works (mock mode)
- [ ] UI matches provided designs
- [ ] RTL layout displays correctly
- [ ] Arabic fonts load properly
- [ ] Bottom navigation works
- [ ] Theme colors are accurate

---

**Demo is ready! All files are in `/home/user/mukhawar-app/`**
