# 🚀 MUKHAWAR - DEPLOY TO TEST SERVER NOW

**Quick Start Guide - Get Online in 20 Minutes**

---

## 🎯 WHAT YOU'RE DEPLOYING

A fully functional MVP with:
- ✅ Complete backend API (60+ endpoints)
- ✅ Admin portal (4 pages: Dashboard, Certifications, Orders, Pricing)
- ✅ Customer authentication
- ✅ 7 database models
- ✅ Test data included

---

## ⚡ FASTEST DEPLOYMENT (Railway + Vercel)

### **STEP 1: Set Up MongoDB (5 minutes)**

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Click "Build a Database" → Choose "M0 Free"
4. Select provider: AWS
5. Region: **ap-south-1 (Mumbai)** (closest to UAE)
6. Click "Create"
7. Create database user:
   - Username: `mukhawar`
   - Password: Generate secure password (SAVE THIS!)
8. Network Access → "Allow Access from Anywhere" (0.0.0.0/0)
9. Click "Connect" → "Connect your application"
10. Copy connection string:
    ```
    mongodb+srv://mukhawar:<password>@cluster0.xxxxx.mongodb.net/mukhawar
    ```
    Replace `<password>` with your actual password

---

### **STEP 2: Deploy Backend to Railway (5 minutes)**

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Connect this Mukhawar repository
6. Go to "Variables" tab
7. Add these environment variables:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://mukhawar:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/mukhawar
JWT_SECRET=your-super-secret-jwt-key-change-this-now
FRONTEND_URL=https://mukhawar-mvp.vercel.app
PLATFORM_MARGIN=0.15
ADMIN_EMAIL=admin@mukhawar.ae
ADMIN_PASSWORD=YOUR_SECURE_PASSWORD
```

8. Click "Deploy"
9. Wait 2-3 minutes
10. Copy your backend URL: `https://mukhawar-production-xxxx.up.railway.app`

---

### **STEP 3: Deploy Frontend to Vercel (5 minutes)**

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New Project"
4. Import this Mukhawar repository
5. Configure:
   - Root Directory: `client`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add environment variables:

```env
VITE_API_URL=https://mukhawar-production-xxxx.up.railway.app
VITE_APP_NAME=Mukhawar
VITE_APP_VERSION=1.0.0-pilot
VITE_APP_ENV=production
VITE_PAYMENT_MODE=test
```

7. Click "Deploy"
8. Wait 2-3 minutes
9. Your site is live at: `https://mukhawar-mvp.vercel.app`

---

### **STEP 4: Update CORS (1 minute)**

1. Go back to Railway dashboard
2. Find `FRONTEND_URL` variable
3. Update with your actual Vercel URL
4. Railway will auto-redeploy

---

### **STEP 5: Seed Database (2 minutes)**

**Option A: Via Railway CLI (Recommended)**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run seed
railway run npm run seed
```

**Option B: Locally (if you have MongoDB connection string)**
```bash
# In your local project
MONGODB_URI=your-connection-string npm run seed
```

---

### **STEP 6: Test Everything (2 minutes)**

1. **Test Health Endpoint:**
   ```bash
   curl https://your-railway-url.up.railway.app/health
   ```
   Expected: `{"status":"healthy",...}`

2. **Access Admin Portal:**
   - URL: `https://mukhawar-mvp.vercel.app/admin/dashboard`
   - Email: `admin@mukhawar.ae`
   - Password: (the one you set in Railway)

3. **Test Pages:**
   - ✅ Dashboard (should show stats)
   - ✅ Certifications (should show pending shops)
   - ✅ Orders (should show 5 test orders)
   - ✅ Pricing (should show pricing rules)

4. **Test Customer Registration:**
   - Go to: `https://mukhawar-mvp.vercel.app/register`
   - Create a new account
   - Verify login works

---

## 🎉 YOU'RE LIVE!

Your Mukhawar platform is now running on:
- **Backend:** https://your-railway-url.up.railway.app
- **Frontend:** https://mukhawar-mvp.vercel.app
- **Admin:** https://mukhawar-mvp.vercel.app/admin/dashboard

---

## 🔑 TEST ACCOUNTS (After Seeding)

### Admin:
- Email: `admin@mukhawar.ae`
- Password: (what you set)

### Shop Owner:
- Email: `alnoor@mukhawar.ae`
- Password: `Shop123!`

### Customer:
- Email: `ahmed.m@email.ae`
- Password: `Customer123!`

---

## 📊 WHAT'S INCLUDED

### Test Data (5 minutes):
- 1 Admin account
- 3 Shop accounts (2 certified, 1 pending)
- 5 Customer accounts
- 4 Sample designs
- 5 Sample orders
- 16 Pricing rules

### Working Features:
- ✅ Complete admin portal
- ✅ Customer login/registration
- ✅ Shop certification workflow
- ✅ Order management
- ✅ Pricing management
- ✅ API endpoints (60+)

---

## 🚨 TROUBLESHOOTING

### Backend won't start:
- Check MongoDB connection string format
- Verify IP whitelist in MongoDB Atlas (should be 0.0.0.0/0)
- Check Railway logs

### Frontend can't reach backend:
- Verify `VITE_API_URL` in Vercel matches your Railway URL
- Check `FRONTEND_URL` in Railway matches your Vercel URL
- Test CORS with: `curl -H "Origin: https://mukhawar-mvp.vercel.app" https://your-railway-url/health`

### Can't login to admin:
- Verify you ran the seed script
- Check admin password matches what's in Railway environment variables
- Try registering a new account to test auth flow

---

## 💰 COSTS

**Monthly (Pilot):**
- Railway: $5/month (after free trial)
- Vercel: $0 (free tier)
- MongoDB Atlas: $0 (free M0 cluster)
- **Total: $5/month**

**Free Tiers Include:**
- Railway: $5 credit/month
- Vercel: 100 GB bandwidth
- MongoDB: 512 MB storage

---

## 📞 NEED HELP?

1. **Check full guide:** DEPLOYMENT_GUIDE.md
2. **Review status:** DEPLOYMENT_STATUS.md
3. **Local testing:** QUICKSTART.md

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] MongoDB Atlas account created
- [ ] Database connection string obtained
- [ ] Railway account created
- [ ] Backend deployed to Railway
- [ ] Environment variables set in Railway
- [ ] Vercel account created
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] CORS URLs updated
- [ ] Seed script executed
- [ ] Health check passes
- [ ] Admin login works
- [ ] Test order visible

---

**Estimated Time:** 20 minutes  
**Difficulty:** Easy  
**Cost:** $0-5/month  
**Result:** Fully functional MVP live on the internet

🚀 **START DEPLOYING NOW!**
