const Comment = require('../models/Comment');
const Article = require('../models/Article');

// @desc    Add a comment to an article
// @route   POST /api/comments
// @access  Public (or Private if we want to enforce login)
const addComment = async (req, res) => {
  try {
    const { articleId, userName, email, comment, parentComment } = req.body;

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const newComment = await Comment.create({
      article: articleId,
      user: req.user ? req.user._id : null,
      userName,
      email,
      comment,
      parentComment: parentComment || null,
      isApproved: true // Auto-approving for now, can change to false for moderation
    });

    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all approved comments for an article
// @route   GET /api/comments/article/:articleId
// @access  Public
const getCommentsByArticle = async (req, res) => {
  try {
    const comments = await Comment.find({ 
      article: req.params.articleId, 
      isApproved: true 
    })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private/Admin
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addComment,
  getCommentsByArticle,
  deleteComment
};
