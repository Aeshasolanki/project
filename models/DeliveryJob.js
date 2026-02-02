const mongoose = require('mongoose');

const deliveryJobSchema = new mongoose.Schema({
  // Job Type
  type: {
    type: String,
    enum: ['pickup', 'delivery'],
    required: true
  },
  
  // Related Order
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  
  // Job Number
  jobNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // From/To Addresses
  pickupAddress: {
    fullName: String,
    phoneNumber: String,
    emirate: String,
    area: String,
    fullAddress: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    specialInstructions: String
  },
  
  dropoffAddress: {
    fullName: String,
    phoneNumber: String,
    emirate: String,
    area: String,
    fullAddress: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    specialInstructions: String
  },
  
  // Package Details
  packageDescription: String,
  itemCount: Number,
  estimatedWeight: Number,
  
  // Delivery Partner
  deliveryPartner: {
    name: String,
    apiProviderId: String, // external delivery service ID
    driverName: String,
    driverPhone: String,
    vehicleInfo: String
  },
  
  // Status
  status: {
    type: String,
    enum: [
      'requested',
      'assigned',
      'accepted',
      'picked_up',
      'in_transit',
      'arrived',
      'delivered',
      'failed',
      'cancelled',
      'rescheduled'
    ],
    default: 'requested'
  },
  
  // Status Timeline
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    location: {
      lat: Number,
      lng: Number
    },
    notes: String
  }],
  
  // Scheduling
  requestedPickupTime: Date,
  scheduledPickupTime: Date,
  actualPickupTime: Date,
  
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  
  // Proof of Delivery
  pod: {
    signature: String, // image URL or base64
    photos: [String],
    receiverName: String,
    receiverRelation: String,
    notes: String,
    timestamp: Date
  },
  
  // Tracking
  trackingUrl: String,
  trackingNumber: String,
  
  // Delivery Zone
  zone: {
    type: String,
    enum: ['Z1', 'Z2', 'Z3', 'Z4'],
    required: true
  },
  distance: Number, // in km
  
  // Pricing
  deliveryCost: {
    type: Number,
    required: true
  },
  
  // Failed Delivery
  failureReason: String,
  attemptCount: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  
  // Rescheduling
  rescheduledTo: Date,
  rescheduledReason: String,
  
  // Priority
  priority: {
    type: String,
    enum: ['normal', 'urgent', 'express'],
    default: 'normal'
  },
  
  // Internal Notes
  internalNotes: String,
  
  // Created By
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate job number
deliveryJobSchema.pre('save', async function(next) {
  if (!this.jobNumber) {
    const prefix = this.type === 'pickup' ? 'PU' : 'DL';
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.jobNumber = `${prefix}-${timestamp}${random}`;
  }
  next();
});

// Method to calculate zone based on emirate pair
deliveryJobSchema.methods.calculateZone = function() {
  const from = this.pickupAddress.emirate;
  const to = this.dropoffAddress.emirate;
  
  // Same emirate
  if (from === to) {
    return this.distance < 20 ? 'Z1' : 'Z2';
  }
  
  // Cross emirate
  const longDistance = ['Abu Dhabi', 'Al Ain', 'Fujairah'];
  if (longDistance.includes(from) || longDistance.includes(to)) {
    return 'Z4';
  }
  
  return 'Z3';
};

// Index
deliveryJobSchema.index({ order: 1 });
deliveryJobSchema.index({ status: 1, createdAt: -1 });
deliveryJobSchema.index({ jobNumber: 1 });

module.exports = mongoose.model('DeliveryJob', deliveryJobSchema);
