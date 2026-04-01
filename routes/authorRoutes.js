const express = require('express');
const router = express.Router();
const { getAuthorProfile } = require('../controllers/userController');

// @desc    Get author profile by ID
// @route   GET /api/authors/:id
// @access  Public
router.get('/:id', getAuthorProfile);

module.exports = router;
