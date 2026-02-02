const mongoose = require('mongoose');

const pricingRuleSchema = new mongoose.Schema({
  name: {
    ar: { type: String, required: true },
    en: { type: String, required: true }
  },
  
  // Rule Type
  ruleType: {
    type: String,
    enum: ['platform_margin', 'delivery_cost'],
    required: true
  },
  
  // Platform Margin Rules
  marginConfig: {
    fixedAmount: { type: Number, default: 0 }, // Fixed AED
    percentageOfShopCost: { type: Number, default: 0 }, // %
    minimumMargin: { type: Number, default: 0 }
  },
  
  // Delivery Cost Rules
  deliveryConfig: {
    zone: {
      type: String,
      enum: ['Z1', 'Z2', 'Z3', 'Z4']
    },
    itemBucket: {
      type: String,
      enum: ['B1', 'B2', 'B3', 'B4'] // 1-3, 4-6, 7-10, 11+
    },
    baseFee: Number,
    upliftPercentage: { type: Number, default: 0 },
    perItemFee: { type: Number, default: 0 }
  },
  
  // Applicability
  applicableCategories: [String], // empty = all categories
  applicableShopTiers: [String], // empty = all tiers
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Validity Period
  validFrom: Date,
  validUntil: Date,
  
  // Priority (higher number = higher priority)
  priority: {
    type: Number,
    default: 0
  },
  
  // Audit
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to calculate customer price
pricingRuleSchema.statics.calculateCustomerPrice = async function(shopCost, category) {
  const rule = await this.findOne({
    ruleType: 'platform_margin',
    isActive: true,
    $or: [
      { applicableCategories: { $size: 0 } },
      { applicableCategories: category }
    ]
  }).sort({ priority: -1 });
  
  if (!rule) {
    // Default 20% margin
    return shopCost * 1.2;
  }
  
  const margin = rule.marginConfig.fixedAmount + 
                 (shopCost * rule.marginConfig.percentageOfShopCost / 100);
  
  return Math.max(
    shopCost + margin,
    shopCost + rule.marginConfig.minimumMargin
  );
};

// Method to calculate delivery cost
pricingRuleSchema.statics.calculateDeliveryCost = async function(zone, itemCount) {
  const bucket = itemCount <= 3 ? 'B1' :
                 itemCount <= 6 ? 'B2' :
                 itemCount <= 10 ? 'B3' : 'B4';
  
  const rule = await this.findOne({
    ruleType: 'delivery_cost',
    isActive: true,
    'deliveryConfig.zone': zone,
    'deliveryConfig.itemBucket': bucket
  });
  
  if (!rule) {
    // Default pricing
    const defaults = {
      Z1: { B1: 15, B2: 20, B3: 30, B4: 50 },
      Z2: { B1: 25, B2: 35, B3: 45, B4: 70 },
      Z3: { B1: 35, B2: 45, B3: 60, B4: 90 },
      Z4: { B1: 50, B2: 65, B3: 85, B4: 120 }
    };
    return defaults[zone][bucket] || 30;
  }
  
  const baseFee = rule.deliveryConfig.baseFee;
  const uplift = baseFee * (rule.deliveryConfig.upliftPercentage / 100);
  const itemFee = itemCount * rule.deliveryConfig.perItemFee;
  
  return baseFee + uplift + itemFee;
};

module.exports = mongoose.model('PricingRule', pricingRuleSchema);
