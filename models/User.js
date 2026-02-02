const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true // allows multiple null values
  },
  password: {
    type: String,
    select: false // Don't return password by default
  },
  
  // Profile
  fullName: {
    ar: String,
    en: String
  },
  profileImage: String,
  
  // Role and Status
  role: {
    type: String,
    enum: ['customer', 'shop', 'admin', 'operations'],
    default: 'customer'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_verification'],
    default: 'active'
  },
  
  // Verification
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationExpire: Date,
  
  // OTP for login
  otp: String,
  otpExpire: Date,
  
  // Preferences
  language: {
    type: String,
    enum: ['ar', 'en'],
    default: 'ar'
  },
  notificationPreferences: {
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true }
  },
  
  // Device tokens for push notifications
  deviceTokens: [String],
  
  // Timestamps
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

// Virtual for customer profile
userSchema.virtual('customerProfile', {
  ref: 'CustomerProfile',
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

// Virtual for shop profile
userSchema.virtual('shopProfile', {
  ref: 'ShopProfile',
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

module.exports = mongoose.model('User', userSchema);
