const express = require('express');
const router = express.Router();
const {
  addComment,
  getCommentsByArticle,
  deleteComment
} = require('../controllers/commentController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
  .post(addComment);

router.route('/article/:articleId')
  .get(getCommentsByArticle);

router.route('/:id')
  .delete(protect, admin, deleteComment);

module.exports = router;
