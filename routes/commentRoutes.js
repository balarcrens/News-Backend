const express = require('express');
const router = express.Router();
const {
  addComment,
  getCommentsByArticle,
  deleteComment,
  likeComment
} = require('../controllers/commentController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, addComment);

router.route('/article/:articleId')
  .get(getCommentsByArticle);

router.route('/:id')
  .delete(protect, admin, deleteComment);

router.route('/:id/like')
  .put(protect, likeComment);

module.exports = router;
