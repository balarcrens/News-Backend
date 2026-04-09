const View = require('../models/View');
const Article = require('../models/Article');

// @desc    Record a unique view for an article
// @route   POST /api/views/:articleId
// @access  Public
const recordView = async (req, res) => {
  try {
    const { articleId } = req.params;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Check if this IP has already viewed this article
    // We search for a view record for this article and IP
    const existingView = await View.findOne({ 
      article: articleId, 
      ipAddress 
    });

    if (existingView) {
      return res.status(200).json({ message: 'View already recorded', incremented: false });
    }

    // Create a new view record
    await View.create({
      article: articleId,
      ipAddress,
      userAgent
    });

    // Increment engagement.views in Article
    await Article.findByIdAndUpdate(articleId, {
      $inc: { 'engagement.views': 1 }
    });

    res.status(201).json({ message: 'View recorded successfully', incremented: true });
  } catch (error) {
    console.error('Error recording view:', error);
    res.status(500).json({ message: 'Server error while recording view' });
  }
};

module.exports = {
  recordView
};
