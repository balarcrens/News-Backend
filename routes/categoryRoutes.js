const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoryBySlug, // Added this
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getCategories)
  .post(protect, admin, createCategory);

router.get('/slug/:slug', getCategoryBySlug); // New public route for slugs

router.route('/:id')
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

module.exports = router;
