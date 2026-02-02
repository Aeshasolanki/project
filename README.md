# 🎨 Mukhawar Platform - Complete Application

**Managed Digital Tailoring and Embroidery Platform for UAE**

---

## 📋 **Table of Contents**

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Running the Application](#running-the-application)
8. [API Documentation](#api-documentation)
9. [Database Schema](#database-schema)
10. [Design System](#design-system)
11. [Testing](#testing)
12. [Deployment](#deployment)

---

## 🌟 **Overview**

Mukhawar is a complete digital marketplace platform connecting customers with certified tailoring and embroidery shops in the UAE. The platform maintains a **single brand experience** where customers interact only with Mukhawar, while certified partner shops work in the background.

### **Key Principles:**
- ✅ **Customer Privacy**: Customers never see shop identities
- ✅ **Platform Governance**: Full control over certification, pricing, and quality
- ✅ **Escrow Payments**: Secure payment handling with refund capabilities
- ✅ **Managed Delivery**: Two-way logistics coordination
- ✅ **Arabic-First**: RTL support with Arabic and English

---

## ✨ **Features**

### **Customer App (B2C)**
- Browse designs by category with beautiful UI
- Measurement profiles for self and family
- Step-by-step order wizard
- Real-time order tracking
- Secure payments with Stripe
- Address management with map integration
- In-app support ticketing

### **Shop Portal (B2B)**
- Self-onboarding with KYC verification
- Design catalog management
- Order assignment and production tracking
- Performance dashboard
- Payout management

### **Admin/Operations Portal**
- Shop certification workflow
- Design moderation queue
- Order management and manual assignment
- Pricing rule configuration
- Delivery job coordination
- Dispute and refund handling
- Comprehensive reporting

---

## 🛠 **Tech Stack**

### **Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + OTP (Twilio)
- **Payments**: Stripe (UAE compliant)
- **File Storage**: Multer + AWS S3 (optional)
- **Email**: SendGrid or NodeMailer
- **Push Notifications**: Firebase Cloud Messaging (FCM)

### **Frontend**
- **Framework**: React 18+ with Hooks
- **Routing**: React Router v6
- **State Management**: Context API + useReducer
- **UI Library**: Material-UI (RTL supported)
- **Forms**: React Hook Form + Yup validation
- **Maps**: Google Maps API
- **Internationalization**: react-i18next (Arabic + English)
- **HTTP Client**: Axios with interceptors
- **Build Tool**: Create React App (CRA) or Vite

### **DevOps**
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Winston Logger + PM2
- **Hosting**: DigitalOcean / AWS / Vercel

---

## 📁 **Project Structure**

```
mukhawar-app/
├── server.js                 # Express server entry point
├── package.json              # Backend dependencies
├── .env.example              # Environment variables template
├── middleware/
│   ├── auth.js               # JWT authentication & authorization
│   ├── error.js              # Error handling middleware
│   └── upload.js             # File upload middleware
├── models/
│   ├── User.js               # User authentication model
│   ├── CustomerProfile.js    # Customer-specific data
│   ├── ShopProfile.js        # Shop certification & performance
│   ├── Design.js             # Service/design catalog
│   ├── Order.js              # Order lifecycle management
│   ├── DeliveryJob.js        # Pickup & delivery tracking
│   └── PricingRule.js        # Dynamic pricing configuration
├── routes/
│   ├── auth.js               # Login, OTP, registration
│   ├── customer.js           # Customer orders, profiles
│   ├── shop.js               # Shop operations
│   ├── admin.js              # Admin governance
│   ├── orders.js             # Order CRUD operations
│   ├── designs.js            # Design catalog
│   ├── delivery.js           # Delivery job management
│   └── payment.js            # Stripe webhooks & payments
├── controllers/
│   └── (business logic for each route)
├── utils/
│   ├── otp.js                # Twilio OTP sender
│   ├── email.js              # Email sender
│   ├── notification.js       # FCM push notifications
│   ├── maps.js               # Google Maps geocoding
│   └── pricing.js            # Pricing calculation helpers
├── uploads/                  # Local file storage
└── client/                   # React frontend
    ├── public/
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── pages/            # Page-level components
    │   ├── contexts/         # React Context providers
    │   ├── hooks/            # Custom React hooks
    │   ├── services/         # API service layer
    │   ├── utils/            # Helper functions
    │   ├── locales/          # i18n translations (ar, en)
    │   ├── theme/            # Design system (colors, fonts)
    │   ├── App.js
    │   └── index.js
    └── package.json
```

---

## 🚀 **Installation**

### **Prerequisites**
- Node.js 18+ and npm
- MongoDB 6+ (local or cloud)
- Git

### **Step 1: Clone Repository**
```bash
git clone https://github.com/yourusername/mukhawar-app.git
cd mukhawar-app
```

### **Step 2: Install Dependencies**
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### **Step 3: Environment Configuration**
```bash
cp .env.example .env
```

Edit `.env` with your credentials (see Configuration section below).

---

## ⚙️ **Configuration**

### **Required Environment Variables**

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/mukhawar

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Twilio (SMS OTP)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+971...

# SendGrid (Email)
SENDGRID_API_KEY=SG...
FROM_EMAIL=noreply@mukhawar.ae

# Google Maps
GOOGLE_MAPS_API_KEY=AIza...

# Firebase (Push Notifications)
FCM_SERVER_KEY=...

# Admin (Initial)
ADMIN_EMAIL=admin@mukhawar.ae
ADMIN_PASSWORD=ChangeThis123!
```

---

## 🏃 **Running the Application**

### **Development Mode (Full Stack)**
```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Start frontend
cd client
npm start
```

Or use concurrently:
```bash
npm run dev:full
```

Backend runs on: `http://localhost:5000`  
Frontend runs on: `http://localhost:3000`

### **Production Build**
```bash
# Build frontend
npm run build

# Start production server
NODE_ENV=production npm start
```

---

## 📡 **API Documentation**

### **Base URL**: `http://localhost:5000/api`

### **Authentication Endpoints**

#### **POST** `/auth/phone/request-otp`
Request OTP for phone-based login/registration.

**Request:**
```json
{
  "phoneNumber": "+971501234567",
  "language": "ar"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم إرسال رمز التحقق",
  "phoneNumber": "+971****567"
}
```

#### **POST** `/auth/phone/verify-otp`
Verify OTP and receive JWT token.

**Request:**
```json
{
  "phoneNumber": "+971501234567",
  "otp": "123456",
  "language": "ar"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64abc...",
    "phoneNumber": "+971501234567",
    "role": "customer",
    "language": "ar"
  }
}
```

#### **GET** `/auth/me`
Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

---

### **Customer Endpoints**

#### **GET** `/customer/designs`
Browse available designs.

**Query Parameters:**
- `category` (optional): Filter by category
- `search` (optional): Search query
- `page` (default: 1)
- `limit` (default: 20)
- `language` (ar | en)

#### **POST** `/customer/orders`
Create new order.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "designId": "64abc...",
  "measurementProfileId": "64def...",
  "deliveryAddressId": "64ghi...",
  "fabricChoice": "customer_provides",
  "specialInstructions": {
    "ar": "تطريز على الياقة فقط"
  },
  "isUrgent": false
}
```

---

### **Shop Endpoints**

#### **POST** `/shop/onboard`
Complete shop onboarding and submit for certification.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "businessName": {
    "ar": "خياطة الفخامة",
    "en": "Luxury Tailoring"
  },
  "tradeLicense": {
    "number": "CN-1234567",
    "expiryDate": "2025-12-31"
  },
  "location": {
    "emirate": "Sharjah",
    "area": "Al Qasimia"
  },
  "capabilities": ["kandura", "abaya", "hand_embroidery"]
}
```

---

### **Admin Endpoints**

#### **GET** `/admin/shops/pending-certification`
Get list of shops awaiting certification.

**Headers:** `Authorization: Bearer <admin_token>`

#### **PUT** `/admin/shops/:shopId/certify`
Approve or reject shop certification.

**Request:**
```json
{
  "action": "approve",
  "notes": "All documents verified"
}
```

---

## 🗄️ **Database Schema**

### **Collections Overview**

1. **users**: Authentication and basic profile
2. **customerprofiles**: Customer-specific data (addresses, measurements, favorites)
3. **shopprofiles**: Shop certification, performance, capacity
4. **designs**: Service catalog with pricing and images
5. **orders**: Complete order lifecycle with status history
6. **deliveryjobs**: Pickup and delivery tracking
7. **pricingrules**: Dynamic pricing configuration

For detailed schema, see model files in `/models/`

---

## 🎨 **Design System**

### **Color Palette (Moroccan Elegance Style)**

```css
/* Primary Colors */
--primary-burgundy: #4A1942;
--primary-teal: #1B4B5A;
--primary-gold: #C9A961;

/* Secondary Colors */
--secondary-sand: #E8C4A8;
--secondary-bronze: #B8956A;
--secondary-cream: #FAF7F5;

/* Text Colors */
--text-primary: #2A1A2A;
--text-secondary: #6B5D52;

/* Status Colors */
--success: #4A7C59;
--warning: #E8A03C;
--error: #C9425B;
--info: #4A8FC9;
```

### **Typography**

```css
/* Arabic Fonts */
font-family: 'Noto Naskh Arabic', 'Cairo', 'Tajawal', serif;

/* English Fonts */
font-family: 'Playfair Display', 'Lora', serif;

/* Body Text */
font-family: 'Inter', 'Roboto', sans-serif;
```

### **UI Components**

- **Moroccan Arch Cards**: Keyhole arch shape at card tops
- **Geometric Patterns**: Islamic zellige tile borders
- **Gold Accents**: Bronze-gold ornamental corners
- **RTL Layout**: Complete right-to-left support

---

## 🧪 **Testing**

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Coverage report
npm run test:coverage
```

---

## 📦 **Deployment**

### **Docker Deployment**

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### **Manual Deployment**

```bash
# Build frontend
cd client && npm run build

# Copy build to server
# Configure nginx or Apache
# Set up PM2 for Node.js process management
pm2 start server.js --name mukhawar-api
pm2 save
```

---

## 📞 **Support**

For questions or issues, contact:
- **Email**: tech@mukhawar.ae
- **Phone**: +971 50 XXX XXXX
- **GitHub**: [Issues](https://github.com/yourusername/mukhawar-app/issues)

---

## 📄 **License**

MIT License - See LICENSE file for details

---

## 👥 **Contributors**

- Sultan Al Suwaidi - Product Owner
- Development Team - Genspark AI

---

**Built with ❤️ for the UAE tailoring community**
