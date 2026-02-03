const express = require('express');
const router = express.Router();
const ShopProfile = require('../models/ShopProfile');
const Design = require('../models/Design');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @route   POST /api/shop/onboard
// @desc    Shop onboarding/registration
// @access  Private (new shop user)
router.post('/onboard', protect, async (req, res) => {
  try {
    if (req.user.role !== 'shop') {
      return res.status(403).json({ success: false, message: 'User must have shop role' });
    }

    // Check if shop profile already exists
    const existingShop = await ShopProfile.findOne({ userId: req.user.id });
    if (existingShop) {
      return res.status(400).json({ success: false, message: 'Shop profile already exists' });
    }

    const shopData = {
      userId: req.user.id,
      ...req.body,
      certificationStatus: 'pending',
      certificationSubmittedAt: new Date()
    };

    const shop = new ShopProfile(shopData);
    await shop.save();

    res.status(201).json({ success: true, data: shop });
  } catch (error) {
    console.error('Error onboarding shop:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/shop/profile
// @desc    Get shop profile (own)
// @access  Private (Shop)
router.get('/profile', protect, async (req, res) => {
  try {
    if (req.user.role !== 'shop') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const shop = await ShopProfile.findOne({ userId: req.user.id });

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop profile not found' });
    }

    res.json({ success: true, data: shop });
  } catch (error) {
    console.error('Error fetching shop profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/shop/profile
// @desc    Update shop profile
// @access  Private (Shop)
router.put('/profile', protect, async (req, res) => {
  try {
    if (req.user.role !== 'shop') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const shop = await ShopProfile.findOne({ userId: req.user.id });

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop profile not found' });
    }

    // Don't allow updating certification status directly
    delete req.body.certificationStatus;
    delete req.body.certificationLevel;

    Object.assign(shop, req.body);
    await shop.save();

    res.json({ success: true, data: shop });
  } catch (error) {
    console.error('Error updating shop profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/shop/dashboard
// @desc    Get shop dashboard stats
// @access  Private (Shop)
router.get('/dashboard', protect, async (req, res) => {
  try {
    if (req.user.role !== 'shop') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const shop = await ShopProfile.findOne({ userId: req.user.id });

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop profile not found' });
    }

    // Get order statistics
    const totalOrders = await Order.countDocuments({ shopId: req.user.id });
    const activeOrders = await Order.countDocuments({
      shopId: req.user.id,
      status: { $in: ['in_review', 'in_production', 'ready_for_delivery'] }
    });
    const completedOrders = await Order.countDocuments({
      shopId: req.user.id,
      status: 'completed'
    });

    // Get revenue (completed orders only)
    const revenueData = await Order.aggregate([
      {
        $match: {
          shopId: mongoose.Types.ObjectId(req.user.id),
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.shopPayout' }
        }
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Get design statistics
    const publishedDesigns = await Design.countDocuments({
      shopId: req.user.id,
      status: 'published'
    });

    const draftDesigns = await Design.countDocuments({
      shopId: req.user.id,
      status: 'draft'
    });

    // Recent orders
    const recentOrders = await Order.find({ shopId: req.user.id })
      .populate('designId', 'nameAr nameEn images')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        shop: {
          businessName: shop.businessNameAr,
          certificationStatus: shop.certificationStatus,
          certificationLevel: shop.certificationLevel,
          rating: shop.rating,
          reviewCount: shop.reviewCount
        },
        statistics: {
          orders: {
            total: totalOrders,
            active: activeOrders,
            completed: completedOrders
          },
          designs: {
            published: publishedDesigns,
            draft: draftDesigns
          },
          revenue: {
            total: totalRevenue,
            currency: 'AED'
          }
        },
        recentOrders
      }
    });
  } catch (error) {
    console.error('Error fetching shop dashboard:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/shop/designs
// @desc    Get shop's own designs
// @access  Private (Shop)
router.get('/designs', protect, async (req, res) => {
  try {
    if (req.user.role !== 'shop') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { status, page = 1, limit = 10 } = req.query;

    const query = { shopId: req.user.id };
    if (status) query.status = status;

    const designs = await Design.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Design.countDocuments(query);

    res.json({
      success: true,
      data: designs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching shop designs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/shop/orders
// @desc    Get shop's orders
// @access  Private (Shop)
router.get('/orders', protect, async (req, res) => {
  try {
    if (req.user.role !== 'shop') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { status, page = 1, limit = 10 } = req.query;

    const query = { shopId: req.user.id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('designId', 'nameAr nameEn images')
      .populate('customerId', 'nameAr nameEn phone')
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
    console.error('Error fetching shop orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/shop/analytics
// @desc    Get shop analytics
// @access  Private (Shop)
router.get('/analytics', protect, async (req, res) => {
  try {
    if (req.user.role !== 'shop') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = {
      shopId: mongoose.Types.ObjectId(req.user.id)
    };

    if (Object.keys(dateFilter).length > 0) {
      matchStage.createdAt = dateFilter;
    }

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue over time
    const revenueByMonth = await Order.aggregate([
      {
        $match: {
          ...matchStage,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' }
          },
          revenue: { $sum: '$pricing.shopPayout' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top designs
    const topDesigns = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$designId',
          orders: { $sum: 1 },
          revenue: { $sum: '$pricing.shopPayout' }
        }
      },
      { $sort: { orders: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'designs',
          localField: '_id',
          foreignField: '_id',
          as: 'design'
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        ordersByStatus,
        revenueByMonth,
        topDesigns
      }
    });
  } catch (error) {
    console.error('Error fetching shop analytics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
