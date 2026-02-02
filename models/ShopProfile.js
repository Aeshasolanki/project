const mongoose = require('mongoose');

const shopProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Business Information
  businessName: {
    ar: { type: String, required: true },
    en: String
  },
  tradeLicense: {
    number: { type: String, required: true },
    expiryDate: Date,
    document: String, // file path
    verified: { type: Boolean, default: false }
  },
  
  // Location
  location: {
    emirate: {
      type: String,
      enum: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'],
      required: true
    },
    area: String,
    fullAddress: {
      ar: String,
      en: String
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    googlePlaceId: String
  },
  
  // Capabilities and Specializations
  capabilities: [{
    type: String,
    enum: [
      'kandura',
      'abaya',
      'womens_clothing',
      'hand_embroidery',
      'machine_embroidery',
      'alterations',
      'bridal',
      'uniforms',
      'children_clothing'
    ]
  }],
  
  specializations: [String],
  
  // Capacity
  weeklyCapacity: {
    type: Number,
    default: 10 // orders per week
  },
  currentLoad: {
    type: Number,
    default: 0
  },
  blackoutDates: [{
    start: Date,
    end: Date,
    reason: String
  }],
  
  // Portfolio
  portfolio: [{
    images: [String],
    description: {
      ar: String,
      en: String
    },
    category: String
  }],
  
  // Banking
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    iban: String,
    swiftCode: String,
    verified: { type: Boolean, default: false }
  },
  
  // Certification Status
  certificationStatus: {
    type: String,
    enum: ['pending', 'in_review', 'approved', 'rejected', 'needs_fixes'],
    default: 'pending'
  },
  certificationLevel: {
    type: String,
    enum: ['certified', 'premium', 'specialist'],
    default: 'certified'
  },
  certificationNotes: String,
  certificationHistory: [{
    status: String,
    notes: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Performance Metrics
  performance: {
    totalOrders: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    onTimeDeliveryRate: { type: Number, default: 100 }, // percentage
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    reworkRate: { type: Number, default: 0 }, // percentage
    complaintRate: { type: Number, default: 0 }, // percentage
    acceptanceRate: { type: Number, default: 100 }, // percentage of assignments accepted
    responseTime: { type: Number, default: 0 } // average in hours
  },
  
  // SLA Agreement
  slaAccepted: {
    type: Boolean,
    default: false
  },
  slaAcceptedDate: Date,
  
  // Contact (Internal use only - never exposed to customers)
  contactPerson: String,
  internalPhone: String,
  internalEmail: String,
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  canPublishDesigns: {
    type: Boolean,
    default: false // only after certification
  },
  canReceiveOrders: {
    type: Boolean,
    default: false
  },
  
  // Settings
  notificationSettings: {
    newOrder: { type: Boolean, default: true },
    orderUpdates: { type: Boolean, default: true },
    payouts: { type: Boolean, default: true }
  },
  
  // Timestamps
  submittedForCertification: Date,
  certifiedDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for available capacity
shopProfileSchema.virtual('availableCapacity').get(function() {
  return Math.max(0, this.weeklyCapacity - this.currentLoad);
});

// Method to check if shop can accept orders
shopProfileSchema.methods.canAcceptOrder = function() {
  return (
    this.certificationStatus === 'approved' &&
    this.canReceiveOrders &&
    this.isActive &&
    this.currentLoad < this.weeklyCapacity
  );
};

module.exports = mongoose.model('ShopProfile', shopProfileSchema);
