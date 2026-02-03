const express = require('express');
const router = express.Router();
const DeliveryJob = require('../models/DeliveryJob');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @route   POST /api/delivery/jobs
// @desc    Create delivery job (auto-triggered or manual)
// @access  Private (Admin/System)
router.post('/jobs', protect, async (req, res) => {
  try {
    if (!['admin', 'system'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { orderId, pickupAddress, deliveryAddress, deliveryZone } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const jobData = {
      jobNumber: `DEL-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      orderId: order._id,
      customerId: order.customerId,
      shopId: order.shopId,
      type: 'standard',
      pickup: {
        address: pickupAddress,
        zone: deliveryZone
      },
      delivery: {
        address: deliveryAddress,
        zone: deliveryZone
      },
      status: 'pending_assignment',
      pricing: {
        baseFee: order.delivery.fee,
        totalFee: order.delivery.fee
      },
      timeline: [{
        status: 'pending_assignment',
        timestamp: new Date(),
        note: 'Delivery job created'
      }]
    };

    const deliveryJob = new DeliveryJob(jobData);
    await deliveryJob.save();

    // Update order with delivery job ID
    order.delivery.jobId = deliveryJob._id;
    order.delivery.status = 'pending_assignment';
    await order.save();

    res.status(201).json({ success: true, data: deliveryJob });
  } catch (error) {
    console.error('Error creating delivery job:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/delivery/jobs
// @desc    Get delivery jobs
// @access  Private
router.get('/jobs', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};

    // Role-based filtering
    if (req.user.role === 'delivery_partner') {
      query.partnerId = req.user.id;
    } else if (req.user.role === 'shop') {
      query.shopId = req.user.id;
    } else if (req.user.role === 'customer') {
      query.customerId = req.user.id;
    }
    // Admin sees all

    if (status) query.status = status;

    const jobs = await DeliveryJob.find(query)
      .populate('orderId', 'orderNumber')
      .populate('partnerId', 'nameAr nameEn phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await DeliveryJob.countDocuments(query);

    // Privacy: hide shop/customer details based on role
    const sanitizedJobs = jobs.map(job => {
      const jobObj = job.toObject();
      if (req.user.role === 'customer') {
        delete jobObj.shopId;
        delete jobObj.pickup;
      }
      return jobObj;
    });

    res.json({
      success: true,
      data: sanitizedJobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching delivery jobs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/delivery/jobs/:id
// @desc    Get delivery job details
// @access  Private
router.get('/jobs/:id', protect, async (req, res) => {
  try {
    const job = await DeliveryJob.findById(req.params.id)
      .populate('orderId', 'orderNumber items')
      .populate('partnerId', 'nameAr nameEn phone vehicle');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Delivery job not found' });
    }

    // Authorization
    const allowedRoles = ['admin'];
    if (req.user.role === 'customer' && job.customerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (req.user.role === 'shop' && job.shopId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (req.user.role === 'delivery_partner' && job.partnerId?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const jobObj = job.toObject();
    if (req.user.role === 'customer') {
      delete jobObj.shopId;
      delete jobObj.pickup;
    }

    res.json({ success: true, data: jobObj });
  } catch (error) {
    console.error('Error fetching delivery job:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/delivery/jobs/:id/assign
// @desc    Assign delivery partner to job
// @access  Private (Admin)
router.put('/jobs/:id/assign', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { partnerId } = req.body;

    const job = await DeliveryJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Delivery job not found' });
    }

    job.partnerId = partnerId;
    job.status = 'assigned';
    job.timeline.push({
      status: 'assigned',
      timestamp: new Date(),
      note: 'Delivery partner assigned'
    });

    await job.save();

    // Update order delivery status
    await Order.findByIdAndUpdate(job.orderId, {
      'delivery.status': 'assigned'
    });

    // TODO: Send notification to delivery partner

    res.json({ success: true, data: job });
  } catch (error) {
    console.error('Error assigning delivery job:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/delivery/jobs/:id/pickup
// @desc    Mark pickup completed
// @access  Private (Delivery Partner)
router.put('/jobs/:id/pickup', protect, async (req, res) => {
  try {
    if (req.user.role !== 'delivery_partner') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { signature, photo, note } = req.body;

    const job = await DeliveryJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Delivery job not found' });
    }

    if (job.partnerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not assigned to this job' });
    }

    job.pickup.completedAt = new Date();
    job.pickup.signature = signature;
    job.pickup.photo = photo;
    job.status = 'picked_up';
    job.timeline.push({
      status: 'picked_up',
      timestamp: new Date(),
      note: note || 'Item picked up from shop'
    });

    await job.save();

    // Update order status
    const order = await Order.findById(job.orderId);
    order.status = 'out_for_delivery';
    order.timeline.push({
      status: 'out_for_delivery',
      timestamp: new Date(),
      note: 'Order out for delivery'
    });
    await order.save();

    res.json({ success: true, data: job });
  } catch (error) {
    console.error('Error updating pickup:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/delivery/jobs/:id/deliver
// @desc    Mark delivery completed
// @access  Private (Delivery Partner)
router.put('/jobs/:id/deliver', protect, async (req, res) => {
  try {
    if (req.user.role !== 'delivery_partner') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { signature, photo, note } = req.body;

    const job = await DeliveryJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Delivery job not found' });
    }

    if (job.partnerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not assigned to this job' });
    }

    job.delivery.completedAt = new Date();
    job.delivery.signature = signature;
    job.delivery.photo = photo;
    job.status = 'completed';
    job.completedAt = new Date();
    job.timeline.push({
      status: 'completed',
      timestamp: new Date(),
      note: note || 'Item delivered to customer'
    });

    await job.save();

    // Update order status
    const order = await Order.findById(job.orderId);
    order.status = 'delivered';
    order.delivery.status = 'completed';
    order.timeline.push({
      status: 'delivered',
      timestamp: new Date(),
      note: 'Order delivered successfully'
    });
    await order.save();

    // TODO: Trigger payment release from escrow
    // TODO: Send notification to customer

    res.json({ success: true, data: job });
  } catch (error) {
    console.error('Error completing delivery:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/delivery/jobs/:id/location
// @desc    Update delivery partner location
// @access  Private (Delivery Partner)
router.put('/jobs/:id/location', protect, async (req, res) => {
  try {
    if (req.user.role !== 'delivery_partner') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { latitude, longitude } = req.body;

    const job = await DeliveryJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Delivery job not found' });
    }

    if (job.partnerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not assigned to this job' });
    }

    if (!job.tracking) {
      job.tracking = { locationHistory: [] };
    }

    job.tracking.currentLocation = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };

    job.tracking.locationHistory.push({
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      timestamp: new Date()
    });

    job.tracking.lastUpdated = new Date();

    await job.save();

    res.json({ success: true, message: 'Location updated' });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/delivery/zones
// @desc    Get delivery zones and pricing
// @access  Public
router.get('/zones', async (req, res) => {
  try {
    const PricingRule = require('../models/PricingRule');

    const zones = await PricingRule.find({
      ruleType: 'delivery',
      isActive: true
    }).select('zone zoneName customerPrice estimatedTime');

    res.json({ success: true, data: zones });
  } catch (error) {
    console.error('Error fetching delivery zones:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
