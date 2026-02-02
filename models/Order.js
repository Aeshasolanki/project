const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Order Number (visible to customer)
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // Customer
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerProfile'
  },
  
  // Design/Service
  design: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Design',
    required: true
  },
  
  // Assigned Shop (Internal - NOT visible to customer)
  assignedShop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShopProfile'
  },
  assignmentMethod: {
    type: String,
    enum: ['auto', 'manual'],
    default: 'auto'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // admin who manually assigned
  },
  assignedAt: Date,
  
  // Order Details
  selectedVariants: [{
    variantName: String,
    selectedOption: String,
    priceAdjustment: Number
  }],
  
  fabricChoice: {
    type: String,
    enum: ['customer_provides', 'platform_provides'],
    required: true
  },
  selectedFabric: {
    name: String,
    cost: Number
  },
  
  // Measurements
  measurementProfile: {
    type: mongoose.Schema.Types.ObjectId
  },
  measurements: mongoose.Schema.Types.Mixed, // snapshot of measurements at time of order
  
  // Special Instructions
  specialInstructions: {
    ar: String,
    en: String
  },
  attachments: [String], // reference images, etc.
  
  // Urgency
  isUrgent: {
    type: Boolean,
    default: false
  },
  requestedDeliveryDate: Date,
  
  // Addresses
  pickupAddress: {
    fullName: String,
    phoneNumber: String,
    emirate: String,
    area: String,
    street: String,
    building: String,
    apartment: String,
    additionalDirections: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  deliveryAddress: {
    fullName: String,
    phoneNumber: String,
    emirate: String,
    area: String,
    street: String,
    building: String,
    apartment: String,
    additionalDirections: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // Pricing Breakdown
  pricing: {
    itemPrice: { type: Number, required: true }, // what customer sees
    shopCost: { type: Number, required: true }, // what shop gets
    deliveryCost: { type: Number, default: 0 },
    urgencyFee: { type: Number, default: 0 },
    subtotal: Number,
    vat: { type: Number, default: 0 },
    vatPercentage: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    platformMargin: Number, // calculated
    currency: { type: String, default: 'AED' }
  },
  
  // Payment
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'held_escrow', 'released', 'refunded', 'partial_refund'],
    default: 'pending'
  },
  paymentMethod: String,
  paymentIntentId: String, // Stripe payment intent
  transactionId: String,
  paidAt: Date,
  
  // Escrow
  escrowStatus: {
    type: String,
    enum: ['none', 'held', 'released_to_shop', 'refunded_to_customer'],
    default: 'none'
  },
  escrowReleasedAt: Date,
  
  // Order Status (Customer Visible)
  status: {
    type: String,
    enum: [
      'payment_confirmed',
      'in_review',
      'in_production',
      'ready',
      'out_for_delivery',
      'delivered',
      'completed',
      'cancelled',
      'refunded'
    ],
    default: 'payment_confirmed'
  },
  
  // Status Timeline
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  
  // SLA Tracking
  sla: {
    expectedProductionStart: Date,
    expectedProductionComplete: Date,
    expectedDelivery: Date,
    actualProductionStart: Date,
    actualProductionComplete: Date,
    actualDelivery: Date,
    isLate: { type: Boolean, default: false },
    delayReason: String
  },
  
  // Shop Actions
  shopAcceptance: {
    accepted: Boolean,
    acceptedAt: Date,
    rejectionReason: String
  },
  
  // Production Updates (from shop)
  productionUpdates: [{
    message: {
      ar: String,
      en: String
    },
    images: [String],
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Delivery Jobs
  pickupJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryJob'
  },
  deliveryJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryJob'
  },
  
  // Quality and Issues
  issues: [{
    type: {
      type: String,
      enum: ['wrong_size', 'quality', 'delay', 'damage', 'other']
    },
    description: String,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedAt: {
      type: Date,
      default: Date.now
    },
    resolution: String,
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Rating and Review
  rating: {
    score: Number, // 1-5
    review: {
      ar: String,
      en: String
    },
    reviewedAt: Date
  },
  
  // Refund
  refund: {
    amount: Number,
    reason: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    processedAt: Date,
    refundTransactionId: String
  },
  
  // Admin Notes (Internal)
  adminNotes: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  cancelledAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    this.orderNumber = `ORD-${timestamp}${random}`;
  }
  next();
});

// Method to calculate platform margin
orderSchema.methods.calculatePlatformMargin = function() {
  return this.pricing.itemPrice - this.pricing.shopCost;
};

// Method to check if order is late
orderSchema.methods.checkSLA = function() {
  if (this.sla.expectedDelivery && !this.sla.actualDelivery) {
    this.sla.isLate = new Date() > new Date(this.sla.expectedDelivery);
  }
  return this.sla.isLate;
};

// Index for efficient queries
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ assignedShop: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);
