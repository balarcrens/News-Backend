const Article = require('../models/Article');
const Category = require('../models/Category');
const User = require('../models/User');
const Comment = require('../models/Comment');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalArticles = await Article.countDocuments();
    const publishedArticles = await Article.countDocuments({ status: 'published' });
    const draftArticles = await Article.countDocuments({ status: { $in: ['draft', 'pending_review'] } });
    
    const stats = await Article.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$engagement.views' },
          totalLikes: { $sum: '$engagement.likes' },
        }
      }
    ]);

    const totalViews = stats[0]?.totalViews || 0;
    const totalLikes = stats[0]?.totalLikes || 0;
    
    const totalComments = await Comment.countDocuments({ isApproved: true });
    
    const recentArticles = await Article.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt');

    res.json({
      totalArticles,
      publishedArticles,
      draftArticles,
      totalViews,
      totalLikes,
      totalComments,
      recentArticles
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
};
