const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOTP, verifyOTP } = require('../utils/otp');
const { sendEmail } = require('../utils/email');

// @desc    Register/Login with Phone (OTP)
// @route   POST /api/auth/phone/request-otp
// @access  Public
router.post('/phone/request-otp', async (req, res) => {
  try {
    const { phoneNumber, language } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: language === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required'
      });
    }
    
    // Find or create user
    let user = await User.findOne({ phoneNumber });
    
    if (!user) {
      user = await User.create({
        phoneNumber,
        language: language || 'ar',
        role: 'customer'
      });
    }
    
    // Generate OTP
    const otp = user.generateOTP();
    await user.save();
    
    // Send OTP via SMS (Twilio)
    await sendOTP(phoneNumber, otp, language);
    
    res.json({
      success: true,
      message: language === 'ar' 
        ? 'تم إرسال رمز التحقق' 
        : 'OTP sent successfully',
      phoneNumber: phoneNumber.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') // masked
    });
    
  } catch (error) {
    console.error('OTP Request Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Verify OTP and Login
// @route   POST /api/auth/phone/verify-otp
// @access  Public
router.post('/phone/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp, language } = req.body;
    
    const user = await User.findOne({ 
      phoneNumber,
      otp,
      otpExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: language === 'ar' 
          ? 'رمز التحقق غير صحيح أو منتهي الصلاحية' 
          : 'Invalid or expired OTP'
      });
    }
    
    // Clear OTP
    user.otp = undefined;
    user.otpExpire = undefined;
    user.isPhoneVerified = true;
    user.lastLogin = Date.now();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        role: user.role,
        fullName: user.fullName,
        language: user.language
      }
    });
    
  } catch (error) {
    console.error('OTP Verify Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // Middleware should attach user to req
    const user = await User.findById(req.user.id)
      .populate('customerProfile')
      .populate('shopProfile');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', async (req, res) => {
  try {
    const { fullName, email, language, profileImage } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (language) user.language = language;
    if (profileImage) user.profileImage = profileImage;
    
    await user.save();
    
    res.json({
      success: true,
      user
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Register device token for push notifications
// @route   POST /api/auth/device-token
// @access  Private
router.post('/device-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user.deviceTokens.includes(token)) {
      user.deviceTokens.push(token);
      await user.save();
    }
    
    res.json({
      success: true,
      message: 'Device token registered'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
