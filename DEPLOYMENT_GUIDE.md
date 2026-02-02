# 🚀 MUKHAWAR MVP - DEPLOYMENT GUIDE
**Pilot Version - Test Server Deployment**

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ **Completed:**
- [x] Backend API (17 files, 60+ endpoints)
- [x] Frontend React App (28+ components)
- [x] Admin Portal (4 complete pages)
- [x] Database models (7 models)
- [x] Authentication system (JWT)
- [x] Security middleware (helmet, rate limiting, CORS)
- [x] Moroccan Elegance design system
- [x] RTL Arabic support
- [x] Environment configuration
- [x] Build scripts
- [x] Deployment configs (Railway, Vercel)

### ⏳ **Required Before Launch:**
- [ ] MongoDB Atlas account + connection string
- [ ] Domain name (optional, can use subdomains)
- [ ] Payment gateway credentials (test mode OK for pilot)
- [ ] Email service API key (SendGrid/AWS SES)
- [ ] SMS service credentials (Twilio)

---

## 🎯 DEPLOYMENT OPTIONS

### **Option 1: Quick Test Deployment (RECOMMENDED FOR PILOT)**
**Platform:** Railway + Vercel Free Tiers  
**Cost:** $0/month  
**Time:** 15-20 minutes  
**Best for:** MVP testing, pilot with 50-100 users

#### **Step 1: Deploy Backend to Railway**

1. **Create Railway Account:**
   ```
   https://railway.app
   → Sign up with GitHub
   ```

2. **Create New Project:**
   ```
   → New Project
   → Deploy from GitHub repo
   → Connect your Mukhawar repository
   ```

3. **Set Environment Variables in Railway:**
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-secure-random-string>
   FRONTEND_URL=https://mukhawar-mvp.vercel.app
   PLATFORM_MARGIN=0.15
   ADMIN_EMAIL=admin@mukhawar.ae
   ADMIN_PASSWORD=<secure-password>
   ```

4. **Deploy:**
   ```
   → Railway will auto-deploy
   → Get your backend URL: https://mukhawar-api-production.up.railway.app
   ```

#### **Step 2: Deploy Frontend to Vercel**

1. **Create Vercel Account:**
   ```
   https://vercel.com
   → Sign up with GitHub
   ```

2. **Import Project:**
   ```
   → Add New Project
   → Import Git Repository
   → Select Mukhawar repo
   → Root Directory: ./client
   ```

3. **Configure Build Settings:**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Set Environment Variables in Vercel:**
   ```
   VITE_API_URL=https://mukhawar-api-production.up.railway.app
   VITE_APP_NAME=Mukhawar
   VITE_APP_VERSION=1.0.0-pilot
   VITE_APP_ENV=production
   VITE_PAYMENT_MODE=test
   ```

5. **Deploy:**
   ```
   → Vercel will auto-deploy
   → Get your frontend URL: https://mukhawar-mvp.vercel.app
   ```

#### **Step 3: Update Backend CORS**
```
Go back to Railway → Environment Variables
→ Update FRONTEND_URL=https://mukhawar-mvp.vercel.app
→ Redeploy
```

---

### **Option 2: Single Server Deployment**
**Platform:** Railway (Backend + Frontend together)  
**Cost:** $5/month after free tier  
**Time:** 10 minutes  
**Best for:** Simplified management

1. **Deploy to Railway:**
   ```
   → New Project from GitHub
   → Build Command: npm run railway:build
   → Start Command: npm start
   ```

2. **Environment Variables:**
   ```
   (Same as Option 1, but no FRONTEND_URL needed)
   ```

3. **Access:**
   ```
   Backend: https://mukhawar-production.up.railway.app/api
   Frontend: https://mukhawar-production.up.railway.app
   ```

---

### **Option 3: Full Production (Custom Domain)**
**Platform:** DigitalOcean Droplet or AWS  
**Cost:** $12-20/month  
**Time:** 2-3 hours  
**Best for:** Production launch

*(Full guide available if needed)*

---

## 🗄️ DATABASE SETUP (REQUIRED)

### **MongoDB Atlas (Free Tier - M0)**

1. **Create Account:**
   ```
   https://www.mongodb.com/cloud/atlas/register
   ```

2. **Create Cluster:**
   ```
   → Build a Database
   → Shared (Free)
   → Provider: AWS
   → Region: ap-south-1 (Mumbai) or me-south-1 (Bahrain) [closest to UAE]
   → Cluster Name: mukhawar-pilot
   ```

3. **Database Access:**
   ```
   → Database Access
   → Add New Database User
   → Username: mukhawar-admin
   → Password: <generate-secure-password>
   → Database User Privileges: Atlas Admin
   ```

4. **Network Access:**
   ```
   → Network Access
   → Add IP Address
   → Allow Access from Anywhere (0.0.0.0/0)
   → (For production, restrict to specific IPs)
   ```

5. **Get Connection String:**
   ```
   → Databases → Connect
   → Connect your application
   → Copy connection string:
   
   mongodb+srv://mukhawar-admin:<password>@mukhawar-pilot.xxxxx.mongodb.net/mukhawar?retryWrites=true&w=majority
   
   → Replace <password> with your actual password
   ```

---

## 🔐 SECURITY CHECKLIST

### **Before Going Live:**
- [ ] Change default admin password
- [ ] Generate strong JWT_SECRET (min 32 characters)
- [ ] Enable MongoDB IP whitelist (restrict to Railway IPs)
- [ ] Add rate limiting to sensitive endpoints
- [ ] Enable HTTPS only (automatic with Railway/Vercel)
- [ ] Set secure cookie flags
- [ ] Enable Content Security Policy
- [ ] Add logging/monitoring (Sentry)

### **Generate Secure Secrets:**
```bash
# JWT Secret
openssl rand -base64 32

# Admin Password
openssl rand -base64 16
```

---

## 📊 POST-DEPLOYMENT TESTING

### **1. Health Check:**
```bash
curl https://mukhawar-api-production.up.railway.app/health

Expected response:
{
  "status": "healthy",
  "timestamp": "2026-02-02T12:00:00.000Z",
  "environment": "production"
}
```

### **2. Test Registration:**
```bash
curl -X POST https://mukhawar-api-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@mukhawar.ae",
    "password": "Test123!",
    "name": "Test User",
    "phone": "+971501234567",
    "role": "Customer"
  }'
```

### **3. Test Login:**
```bash
curl -X POST https://mukhawar-api-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@mukhawar.ae",
    "password": "Test123!"
  }'
```

### **4. Access Admin Portal:**
```
URL: https://mukhawar-mvp.vercel.app/admin/dashboard
Email: admin@mukhawar.ae
Password: <your-admin-password>
```

---

## 🎯 PILOT TEST PLAN

### **Week 1: Internal Testing**
- [ ] Create 5 test customer accounts
- [ ] Create 2 test shop accounts
- [ ] Upload 10 sample designs
- [ ] Process 5 end-to-end test orders
- [ ] Test all admin functions
- [ ] Verify notifications (email/SMS mock)

### **Week 2: Soft Launch**
- [ ] Onboard 1-2 real shops (Dubai/Sharjah)
- [ ] Invite 10-20 beta customers
- [ ] Monitor daily for issues
- [ ] Collect feedback

### **Week 3: Pilot Expansion**
- [ ] Onboard 2-3 more shops
- [ ] Invite 50-100 customers
- [ ] Enable real payments (test mode)
- [ ] Track KPIs:
  - Order completion rate (target: 95%+)
  - Average delivery time
  - Customer satisfaction
  - Platform stability

---

## 🐛 TROUBLESHOOTING

### **Backend won't connect to database:**
```
→ Check MONGODB_URI format
→ Verify IP whitelist in MongoDB Atlas
→ Check Railway logs: railway logs
```

### **Frontend can't reach backend:**
```
→ Verify VITE_API_URL in Vercel
→ Check FRONTEND_URL in Railway
→ Test CORS settings
→ Check Railway deployment logs
```

### **Build fails:**
```
→ Check Node version (should be 18+)
→ Clear cache: railway run npm cache clean --force
→ Verify all dependencies in package.json
```

---

## 📈 MONITORING

### **Railway Dashboard:**
```
Metrics: CPU, Memory, Network
Logs: Real-time server logs
Deployments: History and rollbacks
```

### **Vercel Dashboard:**
```
Analytics: Page views, performance
Logs: Build and function logs
Bandwidth: Data transfer usage
```

### **MongoDB Atlas:**
```
Performance: Query analytics
Storage: Database size
Connections: Active connections
```

---

## 💰 COST ESTIMATE (PILOT PHASE)

| Service | Plan | Cost |
|---------|------|------|
| Railway | Hobby (5GB RAM) | $5/month |
| Vercel | Free (Hobby) | $0/month |
| MongoDB Atlas | M0 (Free) | $0/month |
| **Total** | | **$5/month** |

### **With 100 Users:**
| Item | Usage | Cost |
|------|-------|------|
| SMS (Twilio) | 500 SMS/month | ~$7.50 |
| Email (SendGrid) | 5,000 emails/month | $0 (free tier) |
| Storage (AWS S3) | 10GB images | ~$3 |
| **Total** | | **~$15.50/month** |

---

## 🚀 READY TO DEPLOY?

### **Quick Start:**
```bash
# 1. Set up MongoDB Atlas (get connection string)
# 2. Deploy to Railway (set environment variables)
# 3. Deploy to Vercel (set VITE_API_URL)
# 4. Test health endpoint
# 5. Create admin account
# 6. Start pilot testing
```

### **Deployment Checklist:**
- [ ] MongoDB Atlas cluster created
- [ ] Connection string obtained
- [ ] Railway project created
- [ ] Environment variables configured
- [ ] Backend deployed successfully
- [ ] Vercel project created
- [ ] Frontend deployed successfully
- [ ] CORS configured correctly
- [ ] Health check passes
- [ ] Admin login works
- [ ] Test order flow works

---

## 📞 SUPPORT

### **Deployment Issues:**
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com

### **Next Steps After Deployment:**
1. Complete remaining customer pages
2. Integrate payment gateway (Telr/PayTabs)
3. Set up email/SMS notifications
4. Add file upload (S3/Cloudinary)
5. Enable analytics and monitoring

---

**Last Updated:** 2026-02-02  
**Version:** 1.0.0-pilot  
**Status:** Ready for Test Deployment 🚀
