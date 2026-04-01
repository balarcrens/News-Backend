const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');

// @desc    Get tag by slug
// @route   GET /api/tags/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const tag = await Tag.findOne({ slug: req.params.slug });
    if (!tag) return res.status(404).json({ message: 'Tag not found' });
    res.json(tag);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.find({});
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
