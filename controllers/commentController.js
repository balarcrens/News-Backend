const Comment = require('../models/Comment');
const Article = require('../models/Article');

// @desc    Add a comment to an article
// @route   POST /api/comments
// @access  Public (or Private if we want to enforce login)
const addComment = async (req, res) => {
  try {
    const { articleId, comment, parentComment } = req.body;
    let { userName, email, profilePicture } = req.body;

    if (req.user) {
      userName = req.user.name;
      email = req.user.email;
      profilePicture = req.user.profilePicture;
    }

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const newComment = await Comment.create({
      article: articleId,
      user: req.user ? req.user._id : null,
      userName,
      email,
      profilePicture,
      comment,
      parentComment: parentComment || null,
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
      article: req.params.articleId
    })
      .populate('user', 'name profilePicture')
      .populate('likes', 'name')
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

// @desc    Like / Unlike a comment
// @route   PUT /api/comments/:id/like
// @access  Private
const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user already liked
    const alreadyLiked = comment.likes.find(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      // Unlike
      comment.likes = comment.likes.filter(
        (userId) => userId.toString() !== req.user._id.toString()
      );
    } else {
      // Like
      comment.likes.push(req.user._id);
    }

    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addComment,
  getCommentsByArticle,
  deleteComment,
  likeComment
};
