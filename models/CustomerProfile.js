const mongoose = require('mongoose');

const customerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Saved Addresses
  addresses: [{
    label: String, // e.g., 'Home', 'Work'
    fullName: String,
    phoneNumber: String,
    emirate: String,
    area: String,
    street: String,
    building: String,
    apartment: String,
    additionalDirections: {
      ar: String,
      en: String
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  
  // Measurement Profiles (for self and family)
  measurementProfiles: [{
    name: String,
    relation: {
      type: String,
      enum: ['self', 'spouse', 'child', 'parent', 'other']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'child']
    },
    age: Number, // helpful for children sizing
    measurements: {
      // Kandura/Thobe (Men)
      height: Number,
      shoulder: Number,
      chest: Number,
      waist: Number,
      hip: Number,
      armLength: Number,
      neckCircumference: Number,
      thighCircumference: Number,
      shirtLength: Number,
      pantLength: Number,
      
      // Abaya/Dress (Women)
      shoulderWidth: Number,
      bust: Number,
      underBust: Number,
      waistWomen: Number,
      hipWomen: Number,
      dressLength: Number,
      sleeveLength: Number,
      armCircumference: Number,
      
      // Additional
      notes: {
        ar: String,
        en: String
      },
      unit: {
        type: String,
        enum: ['cm', 'inch'],
        default: 'cm'
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: Date
  }],
  
  // Order History Summary
  orderStats: {
    totalOrders: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    cancelledOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 }
  },
  
  // Favorites/Wishlist
  favoriteDesigns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Design'
  }],
  
  // Loyalty (Future)
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  loyaltyTier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  
  // Preferences
  preferredCategories: [String],
  
  // Communication preferences
  preferredContactMethod: {
    type: String,
    enum: ['phone', 'email', 'whatsapp'],
    default: 'phone'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to get default address
customerProfileSchema.methods.getDefaultAddress = function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
};

// Method to get default measurement profile
customerProfileSchema.methods.getDefaultMeasurementProfile = function() {
  return this.measurementProfiles.find(profile => profile.relation === 'self') || this.measurementProfiles[0];
};

module.exports = mongoose.model('CustomerProfile', customerProfileSchema);
