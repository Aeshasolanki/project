const express = require('express');
const router = express.Router();
const Design = require('../models/Design');
const { protect } = require('../middleware/auth');

// @route   GET /api/designs
// @desc    Browse all published designs (public/customer)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      priceMin,
      priceMax,
      fabricType,
      search,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { status: 'published' };

    if (category) query['category.main'] = category;
    if (fabricType) query.fabricType = fabricType;
    if (priceMin || priceMax) {
      query['pricing.basePrice'] = {};
      if (priceMin) query['pricing.basePrice'].$gte = parseFloat(priceMin);
      if (priceMax) query['pricing.basePrice'].$lte = parseFloat(priceMax);
    }
    if (search) {
      query.$or = [
        { 'nameAr': { $regex: search, $options: 'i' } },
        { 'nameEn': { $regex: search, $options: 'i' } },
        { 'descriptionAr': { $regex: search, $options: 'i' } },
        { 'descriptionEn': { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const designs = await Design.find(query)
      .populate('shopId', 'businessNameAr businessNameEn certificationLevel rating')
      .sort(sort)
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
    console.error('Error fetching designs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/designs/:id
// @desc    Get design details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const design = await Design.findById(req.params.id)
      .populate('shopId', 'businessNameAr businessNameEn certificationLevel rating reviewCount');

    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }

    // Increment view count
    design.analytics.viewCount += 1;
    await design.save();

    res.json({ success: true, data: design });
  } catch (error) {
    console.error('Error fetching design:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/designs
// @desc    Create new design (Shop only)
// @access  Private (Shop)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'shop') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const designData = {
      ...req.body,
      shopId: req.user.id,
      status: 'draft'
    };

    const design = new Design(designData);
    await design.save();

    res.status(201).json({ success: true, data: design });
  } catch (error) {
    console.error('Error creating design:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/designs/:id
// @desc    Update design (Shop only - own designs)
// @access  Private (Shop)
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'shop') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const design = await Design.findById(req.params.id);

    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }

    if (design.shopId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this design' });
    }

    Object.assign(design, req.body);
    await design.save();

    res.json({ success: true, data: design });
  } catch (error) {
    console.error('Error updating design:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/designs/:id/publish
// @desc    Publish design (requires shop certification)
// @access  Private (Shop)
router.put('/:id/publish', protect, async (req, res) => {
  try {
    if (req.user.role !== 'shop') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const ShopProfile = require('../models/ShopProfile');
    const shop = await ShopProfile.findOne({ userId: req.user.id });

    if (!shop || shop.certificationStatus !== 'certified') {
      return res.status(403).json({
        success: false,
        message: 'Shop must be certified to publish designs'
      });
    }

    const design = await Design.findById(req.params.id);

    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }

    if (design.shopId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    design.status = 'published';
    design.publishedAt = new Date();
    await design.save();

    res.json({ success: true, data: design });
  } catch (error) {
    console.error('Error publishing design:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/designs/:id
// @desc    Delete/archive design
// @access  Private (Shop)
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'shop') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const design = await Design.findById(req.params.id);

    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }

    if (design.shopId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    design.status = 'archived';
    await design.save();

    res.json({ success: true, message: 'Design archived successfully' });
  } catch (error) {
    console.error('Error archiving design:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
