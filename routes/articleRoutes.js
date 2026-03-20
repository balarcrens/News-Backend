const express = require('express');
const router = express.Router();
const {
  createArticle,
  getArticles,
  getArticleBySlug,
  getArticleById,
  updateArticle,
  deleteArticle,
  likeArticle
} = require('../controllers/articleController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Using a lightweight auth check for getArticles to allow admins to see drafts
// but not block public users. We'll use a custom middleware inline for optional auth.
const optionalProtect = require('jsonwebtoken');
const User = require('../models/User');

const semiProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = optionalProtect.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // ignore
    }
  }
  next();
};


router.route('/')
  .post(protect, admin, createArticle)
  .get(semiProtect, getArticles);

router.route('/:slug')
  .get(getArticleBySlug);

router.route('/id/:id')
  .get(protect, admin, getArticleById);

router.route('/:id')
  .put(protect, admin, updateArticle)
  .delete(protect, admin, deleteArticle);

router.post('/:id/like', likeArticle);

module.exports = router;
