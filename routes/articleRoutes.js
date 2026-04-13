const express = require('express');
const router = express.Router();
const {
  createArticle,
  getArticles,
  getArticleBySlug,
  getArticleById,
  updateArticle,
  deleteArticle,
  likeArticle,
  getHomeData
} = require('../controllers/articleController');
const { protect, semiProtect, admin } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, admin, createArticle)
  .get(semiProtect, getArticles);

router.get('/home', semiProtect, getHomeData);

router.route('/:slug')
  .get(semiProtect, getArticleBySlug);

router.route('/id/:id')
  .get(protect, admin, getArticleById);

router.route('/:id')
  .put(protect, admin, updateArticle)
  .delete(protect, admin, deleteArticle);

router.post('/:id/like', protect, likeArticle);

module.exports = router;
