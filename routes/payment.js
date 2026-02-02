const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// @route   POST /api/payments/initialize
// @desc    Initialize payment for order
// @access  Private (Customer)
router.post('/initialize', auth, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { orderId, paymentMethod = 'card' } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.customerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (order.status !== 'pending_payment') {
      return res.status(400).json({ success: false, message: 'Order already processed' });
    }

    // TODO: Initialize payment gateway (UAE-compliant)
    // This would integrate with payment providers like:
    // - Telr
    // - PayTabs
    // - Network International
    // - Checkout.com

    const paymentData = {
      method: paymentMethod,
      amount: order.pricing.total,
      currency: 'AED',
      status: 'pending',
      initiatedAt: new Date(),
      // Payment gateway specific data
      gatewayOrderId: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      // This would be actual payment gateway URL
      paymentUrl: `${process.env.PAYMENT_GATEWAY_URL}/checkout/${order._id}`
    };

    order.payment = paymentData;
    await order.save();

    res.json({
      success: true,
      data: {
        orderId: order._id,
        paymentUrl: paymentData.paymentUrl,
        amount: order.pricing.total,
        currency: 'AED'
      }
    });
  } catch (error) {
    console.error('Error initializing payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/payments/webhook
// @desc    Payment gateway webhook
// @access  Public (with signature verification)
router.post('/webhook', async (req, res) => {
  try {
    // TODO: Verify webhook signature from payment gateway
    const { orderId, transactionId, status, amount } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Update payment status
    order.payment.status = status;
    order.payment.transactionId = transactionId;
    order.payment.paidAt = new Date();

    if (status === 'completed') {
      // Payment successful - update order status
      order.status = 'payment_confirmed';
      order.payment.escrow = {
        status: 'held',
        heldAt: new Date(),
        amount: order.pricing.total
      };

      order.timeline.push({
        status: 'payment_confirmed',
        timestamp: new Date(),
        note: 'Payment received and held in escrow'
      });

      // TODO: Send notification to shop
      // TODO: Send confirmation to customer
    } else if (status === 'failed') {
      order.status = 'payment_failed';
      order.timeline.push({
        status: 'payment_failed',
        timestamp: new Date(),
        note: 'Payment failed'
      });
    }

    await order.save();

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/payments/release/:orderId
// @desc    Release payment from escrow (after delivery)
// @access  Private (System/Admin)
router.post('/release/:orderId', auth, async (req, res) => {
  try {
    if (!['admin', 'system'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.payment.escrow.status !== 'held') {
      return res.status(400).json({
        success: false,
        message: 'Payment not in escrow or already released'
      });
    }

    if (order.status !== 'delivered' && order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Order must be delivered before releasing payment'
      });
    }

    // Release payment to shop
    order.payment.escrow.status = 'released';
    order.payment.escrow.releasedAt = new Date();
    order.payment.escrow.releasedTo = order.shopId;
    order.status = 'completed';
    order.completedAt = new Date();

    order.timeline.push({
      status: 'completed',
      timestamp: new Date(),
      note: 'Payment released to shop, order completed'
    });

    await order.save();

    // TODO: Trigger actual payment transfer to shop
    // TODO: Send notification to shop
    // TODO: Update shop revenue

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error releasing payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/payments/refund/:orderId
// @desc    Process refund
// @access  Private (Admin)
router.post('/refund/:orderId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { reason, amount } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Only cancelled orders can be refunded'
      });
    }

    const refundAmount = amount || order.pricing.total;

    // TODO: Process actual refund through payment gateway

    order.payment.refund = {
      amount: refundAmount,
      reason,
      status: 'completed',
      processedAt: new Date(),
      processedBy: req.user.id
    };

    order.payment.escrow.status = 'refunded';
    order.payment.escrow.refundedAt = new Date();

    order.timeline.push({
      status: 'refunded',
      timestamp: new Date(),
      note: `Refund processed: ${reason}`
    });

    await order.save();

    // TODO: Send notification to customer

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/payments/methods
// @desc    Get available payment methods
// @access  Public
router.get('/methods', async (req, res) => {
  try {
    // Return available payment methods
    const methods = [
      {
        id: 'card',
        nameEn: 'Credit/Debit Card',
        nameAr: 'بطاقة ائتمان/خصم',
        types: ['Visa', 'Mastercard', 'Amex'],
        enabled: true
      },
      {
        id: 'apple_pay',
        nameEn: 'Apple Pay',
        nameAr: 'آبل باي',
        enabled: true
      },
      {
        id: 'google_pay',
        nameEn: 'Google Pay',
        nameAr: 'جوجل باي',
        enabled: true
      },
      {
        id: 'samsung_pay',
        nameEn: 'Samsung Pay',
        nameAr: 'سامسونج باي',
        enabled: false
      }
    ];

    res.json({ success: true, data: methods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/payments/status/:orderId
// @desc    Check payment status
// @access  Private
router.get('/status/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization
    if (req.user.role === 'customer' && order.customerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (req.user.role === 'shop' && order.shopId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.payment.status,
        escrowStatus: order.payment.escrow?.status,
        amount: order.pricing.total,
        currency: 'AED'
      }
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
