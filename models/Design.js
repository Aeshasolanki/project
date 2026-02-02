const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
  // Owner (Shop)
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShopProfile',
    required: true
  },
  
  // Basic Information
  title: {
    ar: { type: String, required: true },
    en: String
  },
  description: {
    ar: String,
    en: String
  },
  
  // Category
  category: {
    type: String,
    required: true,
    enum: [
      'kandura',
      'abaya',
      'womens_dress',
      'womens_top',
      'embroidery_service',
      'alteration',
      'bridal',
      'children',
      'uniform'
    ]
  },
  subcategory: String,
  tags: [String],
  
  // Images
  images: {
    type: [{
      url: { type: String, required: true },
      order: Number,
      caption: {
        ar: String,
        en: String
      }
    }],
    required: true,
    validate: [arrayMinLength, 'At least one image is required']
  },
  
  // Variants and Options
  variants: [{
    name: {
      ar: String,
      en: String
    },
    options: [{
      label: {
        ar: String,
        en: String
      },
      value: String,
      priceAdjustment: Number, // + or - from base price
      image: String
    }]
  }],
  
  // Fabric Options
  fabricOptions: {
    customerProvides: { type: Boolean, default: true },
    platformProvides: { type: Boolean, default: false },
    fabricChoices: [{
      name: {
        ar: String,
        en: String
      },
      description: {
        ar: String,
        en: String
      },
      pricePerMeter: Number,
      image: String
    }]
  },
  
  // Pricing (Internal - Shop Cost)
  shopCost: {
    baseCost: { type: Number, required: true },
    currency: { type: String, default: 'AED' }
  },
  
  // Customer Pricing (Calculated by platform)
  customerPrice: {
    basePrice: Number, // calculated: shopCost + platform margin
    currency: { type: String, default: 'AED' },
    priceRange: {
      min: Number,
      max: Number
    }
  },
  
  // Lead Time
  estimatedLeadTime: {
    min: { type: Number, required: true }, // in days
    max: { type: Number, required: true },
    unit: { type: String, default: 'days' }
  },
  
  // Requirements
  requiresMeasurements: {
    type: Boolean,
    default: true
  },
  requiredMeasurementFields: [String], // which specific fields are needed
  
  allowsCustomization: {
    type: Boolean,
    default: true
  },
  customizationNotes: {
    ar: String,
    en: String
  },
  
  // Status and Moderation
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'rejected', 'archived'],
    default: 'draft'
  },
  moderationNotes: String,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  
  // Visibility
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Stats
  stats: {
    views: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
  },
  
  // SEO
  seo: {
    metaTitle: {
      ar: String,
      en: String
    },
    metaDescription: {
      ar: String,
      en: String
    },
    keywords: [String]
  },
  
  // Timestamps
  publishedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Validator function
function arrayMinLength(val) {
  return val.length >= 1;
}

// Virtual for shop name (hidden from customer)
designSchema.virtual('shopName').get(function() {
  return this.shop ? this.shop.businessName : null;
});

// Index for search
designSchema.index({ 
  'title.ar': 'text', 
  'title.en': 'text', 
  'description.ar': 'text', 
  'description.en': 'text',
  tags: 'text'
});

// Method to check if design can be ordered
designSchema.methods.canBeOrdered = function() {
  return (
    this.status === 'approved' &&
    this.isActive
  );
};

module.exports = mongoose.model('Design', designSchema);
