const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Design = require('../models/Design');
const { protect } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create new order (Customer only)
// @access  Private (Customer)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Only customers can create orders' });
    }

    const { designId, customizations, measurements, deliveryAddress, deliveryZone } = req.body;

    // Validate design exists and is published
    const design = await Design.findById(designId);
    if (!design || design.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Design not available' });
    }

    // Calculate pricing
    const PricingRule = require('../models/PricingRule');
    const deliveryRule = await PricingRule.findOne({
      ruleType: 'delivery',
      zone: deliveryZone,
      isActive: true
    });

    if (!deliveryRule) {
      return res.status(400).json({ success: false, message: 'Delivery not available for this zone' });
    }

    const subtotal = design.pricing.basePrice + (customizations?.additionalCost || 0);
    const deliveryFee = deliveryRule.customerPrice;
    const total = subtotal + deliveryFee;

    // Calculate platform margin
    const platformMargin = total * 0.15; // 15% platform fee
    const shopPayout = subtotal - platformMargin;

    const orderData = {
      orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      customerId: req.user.id,
      shopId: design.shopId,
      designId: design._id,
      items: [{
        designId: design._id,
        quantity: 1,
        unitPrice: design.pricing.basePrice,
        customizations,
        subtotal
      }],
      measurements,
      delivery: {
        address: deliveryAddress,
        zone: deliveryZone,
        fee: deliveryFee,
        method: 'standard'
      },
      pricing: {
        subtotal,
        deliveryFee,
        platformFee: platformMargin,
        total,
        shopPayout
      },
      status: 'pending_payment',
      timeline: [{
        status: 'pending_payment',
        timestamp: new Date(),
        note: 'Order created, awaiting payment'
      }]
    };

    const order = new Order(orderData);
    await order.save();

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/orders
// @desc    Get orders (filtered by role)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};

    // Role-based filtering
    if (req.user.role === 'customer') {
      query.customerId = req.user.id;
    } else if (req.user.role === 'shop') {
      query.shopId = req.user.id;
    }
    // Admin sees all orders

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('designId', 'nameAr nameEn images')
      .populate('customerId', 'nameAr nameEn email phone')
      .populate('shopId', 'businessNameAr businessNameEn')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Order.countDocuments(query);

    // Privacy: Hide shop identity from customer
    const sanitizedOrders = orders.map(order => {
      const orderObj = order.toObject();
      if (req.user.role === 'customer') {
        delete orderObj.shopId;
        orderObj.shopAnonymous = true;
      }
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
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('designId', 'nameAr nameEn images pricing')
      .populate('customerId', 'nameAr nameEn email phone')
      .populate('shopId', 'businessNameAr businessNameEn phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization check
    if (req.user.role === 'customer' && order.customerId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (req.user.role === 'shop' && order.shopId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Privacy: Hide shop identity from customer
    const orderObj = order.toObject();
    if (req.user.role === 'customer') {
      delete orderObj.shopId;
      delete orderObj.pricing.shopPayout;
      orderObj.shopAnonymous = true;
    }

    res.json({ success: true, data: orderObj });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Shop/Admin)
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization
    if (req.user.role === 'shop' && order.shopId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (req.user.role === 'customer') {
      return res.status(403).json({ success: false, message: 'Customers cannot update order status' });
    }

    // Update status
    order.status = status;
    order.timeline.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user.id,
      note
    });

    // Auto-trigger delivery when ready
    if (status === 'ready_for_delivery' && !order.delivery.jobId) {
      // Create delivery job (will be handled by delivery service)
      order.delivery.status = 'pending_assignment';
    }

    await order.save();

    // TODO: Send notification to customer
    // TODO: Update design analytics

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization
    if (req.user.role === 'customer' && order.customerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Check if cancellable
    const nonCancellableStatuses = ['out_for_delivery', 'delivered', 'completed', 'cancelled'];
    if (nonCancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    order.status = 'cancelled';
    order.cancellation = {
      cancelledBy: req.user.id,
      reason,
      timestamp: new Date()
    };
    order.timeline.push({
      status: 'cancelled',
      timestamp: new Date(),
      updatedBy: req.user.id,
      note: reason
    });

    await order.save();

    // TODO: Process refund
    // TODO: Send notifications

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/orders/:id/review
// @desc    Submit order review (Customer only)
// @access  Private
router.post('/:id/review', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Only customers can review orders' });
    }

    const { rating, comment } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.customerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed orders' });
    }

    if (order.review) {
      return res.status(400).json({ success: false, message: 'Order already reviewed' });
    }

    order.review = {
      rating,
      comment,
      createdAt: new Date()
    };

    await order.save();

    // TODO: Update shop rating
    // TODO: Update design rating

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
