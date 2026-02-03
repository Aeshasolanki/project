const express = require('express');
const router = express.Router();
const CustomerProfile = require('../models/CustomerProfile');
const Order = require('../models/Order');
const Design = require('../models/Design');
const { protect } = require('../middleware/auth');

// @route   GET /api/customer/profile
// @desc    Get customer profile
// @access  Private (Customer)
router.get('/profile', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let profile = await CustomerProfile.findOne({ userId: req.user.id });

    if (!profile) {
      // Create profile if doesn't exist
      profile = new CustomerProfile({ userId: req.user.id });
      await profile.save();
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/customer/profile
// @desc    Update customer profile
// @access  Private (Customer)
router.put('/profile', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let profile = await CustomerProfile.findOne({ userId: req.user.id });

    if (!profile) {
      profile = new CustomerProfile({
        userId: req.user.id,
        ...req.body
      });
    } else {
      Object.assign(profile, req.body);
    }

    await profile.save();

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/customer/measurements
// @desc    Add measurement profile
// @access  Private (Customer)
router.post('/measurements', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const profile = await CustomerProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const measurement = {
      ...req.body,
      createdAt: new Date()
    };

    profile.measurements.push(measurement);
    await profile.save();

    res.status(201).json({ success: true, data: profile.measurements });
  } catch (error) {
    console.error('Error adding measurement:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/customer/measurements/:id
// @desc    Update measurement profile
// @access  Private (Customer)
router.put('/measurements/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const profile = await CustomerProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const measurement = profile.measurements.id(req.params.id);

    if (!measurement) {
      return res.status(404).json({ success: false, message: 'Measurement not found' });
    }

    Object.assign(measurement, req.body);
    await profile.save();

    res.json({ success: true, data: profile.measurements });
  } catch (error) {
    console.error('Error updating measurement:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/customer/measurements/:id
// @desc    Delete measurement profile
// @access  Private (Customer)
router.delete('/measurements/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const profile = await CustomerProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    profile.measurements.pull(req.params.id);
    await profile.save();

    res.json({ success: true, message: 'Measurement deleted' });
  } catch (error) {
    console.error('Error deleting measurement:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/customer/addresses
// @desc    Add delivery address
// @access  Private (Customer)
router.post('/addresses', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const profile = await CustomerProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const address = {
      ...req.body,
      createdAt: new Date()
    };

    // If this is the first address or marked as default, set as default
    if (profile.addresses.length === 0 || req.body.isDefault) {
      profile.addresses.forEach(addr => {
        addr.isDefault = false;
      });
      address.isDefault = true;
    }

    profile.addresses.push(address);
    await profile.save();

    res.status(201).json({ success: true, data: profile.addresses });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/customer/addresses/:id
// @desc    Update delivery address
// @access  Private (Customer)
router.put('/addresses/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const profile = await CustomerProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const address = profile.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // If setting as default, unset other defaults
    if (req.body.isDefault) {
      profile.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    Object.assign(address, req.body);
    await profile.save();

    res.json({ success: true, data: profile.addresses });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/customer/addresses/:id
// @desc    Delete delivery address
// @access  Private (Customer)
router.delete('/addresses/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const profile = await CustomerProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const address = profile.addresses.id(req.params.id);
    const wasDefault = address?.isDefault;

    profile.addresses.pull(req.params.id);

    // If deleted address was default, set first remaining as default
    if (wasDefault && profile.addresses.length > 0) {
      profile.addresses[0].isDefault = true;
    }

    await profile.save();

    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/customer/favorites/:designId
// @desc    Add design to favorites
// @access  Private (Customer)
router.post('/favorites/:designId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const design = await Design.findById(req.params.designId);

    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }

    const profile = await CustomerProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    if (profile.favorites.includes(req.params.designId)) {
      return res.status(400).json({ success: false, message: 'Design already in favorites' });
    }

    profile.favorites.push(req.params.designId);
    await profile.save();

    res.json({ success: true, data: profile.favorites });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/customer/favorites/:designId
// @desc    Remove design from favorites
// @access  Private (Customer)
router.delete('/favorites/:designId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const profile = await CustomerProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    profile.favorites.pull(req.params.designId);
    await profile.save();

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/customer/favorites
// @desc    Get customer's favorite designs
// @access  Private (Customer)
router.get('/favorites', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const profile = await CustomerProfile.findOne({ userId: req.user.id })
      .populate({
        path: 'favorites',
        populate: { path: 'shopId', select: 'businessNameAr businessNameEn rating' }
      });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.json({ success: true, data: profile.favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/customer/orders
// @desc    Get customer's orders
// @access  Private (Customer)
router.get('/orders', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { status, page = 1, limit = 10 } = req.query;

    const query = { customerId: req.user.id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('designId', 'nameAr nameEn images pricing')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Order.countDocuments(query);

    // Remove shop identity
    const sanitizedOrders = orders.map(order => {
      const orderObj = order.toObject();
      delete orderObj.shopId;
      delete orderObj.pricing.shopPayout;
      orderObj.shopAnonymous = true;
      return orderObj;
    });

    res.json({
      success: true,
      data: sanitizedOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
