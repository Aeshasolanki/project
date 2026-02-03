const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ShopProfile = require('../models/ShopProfile');
const Order = require('../models/Order');
const Design = require('../models/Design');
const PricingRule = require('../models/PricingRule');
const { protect } = require('../middleware/auth');

// Admin authorization middleware
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard overview
// @access  Private (Admin)
router.get('/dashboard', protect, adminAuth, async (req, res) => {
  try {
    // User statistics
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalShops = await User.countDocuments({ role: 'shop' });

    // Shop certification statistics
    const pendingCertifications = await ShopProfile.countDocuments({
      certificationStatus: 'pending'
    });
    const certifiedShops = await ShopProfile.countDocuments({
      certificationStatus: 'certified'
    });

    // Order statistics
    const totalOrders = await Order.countDocuments();
    const activeOrders = await Order.countDocuments({
      status: { $in: ['payment_confirmed', 'in_review', 'in_production', 'ready_for_delivery', 'out_for_delivery'] }
    });
    const completedOrders = await Order.countDocuments({ status: 'completed' });

    // Revenue statistics
    const revenueData = await Order.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.total' },
          platformRevenue: { $sum: '$pricing.platformFee' }
        }
      }
    ]);

    const revenue = revenueData.length > 0 ? revenueData[0] : { totalRevenue: 0, platformRevenue: 0 };

    // Design statistics
    const totalDesigns = await Design.countDocuments({ status: 'published' });

    // Recent activities
    const recentOrders = await Order.find()
      .populate('customerId', 'nameAr nameEn')
      .populate('shopId', 'businessNameAr businessNameEn')
      .populate('designId', 'nameAr nameEn')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        users: {
          customers: totalCustomers,
          shops: totalShops
        },
        certifications: {
          pending: pendingCertifications,
          certified: certifiedShops
        },
        orders: {
          total: totalOrders,
          active: activeOrders,
          completed: completedOrders
        },
        revenue: {
          total: revenue.totalRevenue,
          platform: revenue.platformRevenue,
          currency: 'AED'
        },
        designs: {
          published: totalDesigns
        },
        recentOrders
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/certifications/pending
// @desc    Get pending shop certifications
// @access  Private (Admin)
router.get('/certifications/pending', protect, adminAuth, async (req, res) => {
  try {
    const pendingShops = await ShopProfile.find({ certificationStatus: 'pending' })
      .populate('userId', 'nameAr nameEn email phone')
      .sort({ certificationSubmittedAt: 1 });

    res.json({ success: true, data: pendingShops });
  } catch (error) {
    console.error('Error fetching pending certifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/certifications/:shopId/approve
// @desc    Approve shop certification
// @access  Private (Admin)
router.put('/certifications/:shopId/approve', protect, adminAuth, async (req, res) => {
  try {
    const { certificationLevel = 'certified', notes } = req.body;

    const shop = await ShopProfile.findById(req.params.shopId);

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    shop.certificationStatus = 'certified';
    shop.certificationLevel = certificationLevel;
    shop.certificationApprovedAt = new Date();
    shop.certificationNotes = notes;

    await shop.save();

    // TODO: Send notification to shop

    res.json({ success: true, data: shop });
  } catch (error) {
    console.error('Error approving certification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/certifications/:shopId/reject
// @desc    Reject shop certification
// @access  Private (Admin)
router.put('/certifications/:shopId/reject', protect, adminAuth, async (req, res) => {
  try {
    const { reason } = req.body;

    const shop = await ShopProfile.findById(req.params.shopId);

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    shop.certificationStatus = 'rejected';
    shop.certificationNotes = reason;

    await shop.save();

    // TODO: Send notification to shop

    res.json({ success: true, data: shop });
  } catch (error) {
    console.error('Error rejecting certification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders (admin view)
// @access  Private (Admin)
router.get('/orders', protect, adminAuth, async (req, res) => {
  try {
    const { status, shopId, customerId, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (shopId) query.shopId = shopId;
    if (customerId) query.customerId = customerId;

    const orders = await Order.find(query)
      .populate('customerId', 'nameAr nameEn email phone')
      .populate('shopId', 'businessNameAr businessNameEn phone')
      .populate('designId', 'nameAr nameEn')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/orders/:id/override
// @desc    Admin override order status
// @access  Private (Admin)
router.put('/orders/:id/override', protect, adminAuth, async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    order.timeline.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user.id,
      note: `[ADMIN OVERRIDE] ${note}`,
      isAdminAction: true
    });

    await order.save();

    // TODO: Send notifications

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error overriding order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/shops
// @desc    Get all shops
// @access  Private (Admin)
router.get('/shops', protect, adminAuth, async (req, res) => {
  try {
    const { certificationStatus, page = 1, limit = 20 } = req.query;

    const query = {};
    if (certificationStatus) query.certificationStatus = certificationStatus;

    const shops = await ShopProfile.find(query)
      .populate('userId', 'nameAr nameEn email phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await ShopProfile.countDocuments(query);

    res.json({
      success: true,
      data: shops,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching shops:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/pricing
// @desc    Get pricing rules
// @access  Private (Admin)
router.get('/pricing', protect, adminAuth, async (req, res) => {
  try {
    const { ruleType } = req.query;

    const query = {};
    if (ruleType) query.ruleType = ruleType;

    const pricingRules = await PricingRule.find(query).sort({ createdAt: -1 });

    res.json({ success: true, data: pricingRules });
  } catch (error) {
    console.error('Error fetching pricing rules:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/pricing
// @desc    Create pricing rule
// @access  Private (Admin)
router.post('/pricing', protect, adminAuth, async (req, res) => {
  try {
    const pricingRule = new PricingRule(req.body);
    await pricingRule.save();

    res.status(201).json({ success: true, data: pricingRule });
  } catch (error) {
    console.error('Error creating pricing rule:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/pricing/:id
// @desc    Update pricing rule
// @access  Private (Admin)
router.put('/pricing/:id', protect, adminAuth, async (req, res) => {
  try {
    const pricingRule = await PricingRule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!pricingRule) {
      return res.status(404).json({ success: false, message: 'Pricing rule not found' });
    }

    res.json({ success: true, data: pricingRule });
  } catch (error) {
    console.error('Error updating pricing rule:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/pricing/:id
// @desc    Delete pricing rule
// @access  Private (Admin)
router.delete('/pricing/:id', protect, adminAuth, async (req, res) => {
  try {
    const pricingRule = await PricingRule.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!pricingRule) {
      return res.status(404).json({ success: false, message: 'Pricing rule not found' });
    }

    res.json({ success: true, message: 'Pricing rule deactivated' });
  } catch (error) {
    console.error('Error deleting pricing rule:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/reports/revenue
// @desc    Get revenue report
// @access  Private (Admin)
router.get('/reports/revenue', protect, adminAuth, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    const matchStage = { status: 'completed' };

    if (startDate || endDate) {
      matchStage.completedAt = {};
      if (startDate) matchStage.completedAt.$gte = new Date(startDate);
      if (endDate) matchStage.completedAt.$lte = new Date(endDate);
    }

    let groupStage;
    if (groupBy === 'day') {
      groupStage = {
        year: { $year: '$completedAt' },
        month: { $month: '$completedAt' },
        day: { $dayOfMonth: '$completedAt' }
      };
    } else if (groupBy === 'month') {
      groupStage = {
        year: { $year: '$completedAt' },
        month: { $month: '$completedAt' }
      };
    } else {
      groupStage = {
        year: { $year: '$completedAt' }
      };
    }

    const revenueData = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupStage,
          totalRevenue: { $sum: '$pricing.total' },
          platformRevenue: { $sum: '$pricing.platformFee' },
          shopPayout: { $sum: '$pricing.shopPayout' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({ success: true, data: revenueData });
  } catch (error) {
    console.error('Error generating revenue report:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/reports/performance
// @desc    Get shop performance metrics
// @access  Private (Admin)
router.get('/reports/performance', protect, adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const shopPerformance = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$shopId',
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalRevenue: { $sum: '$pricing.shopPayout' },
          avgOrderValue: { $avg: '$pricing.total' }
        }
      },
      {
        $lookup: {
          from: 'shopprofiles',
          localField: '_id',
          foreignField: 'userId',
          as: 'shop'
        }
      },
      { $unwind: '$shop' },
      {
        $project: {
          shopName: '$shop.businessNameAr',
          totalOrders: 1,
          completedOrders: 1,
          cancelledOrders: 1,
          totalRevenue: 1,
          avgOrderValue: 1,
          completionRate: {
            $multiply: [
              { $divide: ['$completedOrders', '$totalOrders'] },
              100
            ]
          }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json({ success: true, data: shopPerformance });
  } catch (error) {
    console.error('Error generating performance report:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
