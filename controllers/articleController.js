const Article = require('../models/Article');
const slugify = require('slugify');

// @desc    Create an article
// @route   POST /api/articles
// @access  Private/Admin
const createArticle = async (req, res) => {
  try {
    const articleData = req.body;

    // Auto-generate slug if not provided
    if (!articleData.slug && articleData.title) {
      articleData.slug = slugify(articleData.title, { lower: true, strict: true });
    }

    if (req.user) articleData.author = req.user._id;

    const article = await Article.create(articleData);
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all articles (support for drafts/published)
// @route   GET /api/articles
// @access  Public
const getArticles = async (req, res) => {
  try {
    const filter = {};
    // If user is not admin and is just a public request, return only published
    if (!req.user || req.user.role !== 'admin') {
      filter.status = 'published';
    }

    if (req.query.type) {
      filter.type = req.query.type;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.author) {
      filter.author = req.query.author;
    }

    if (req.query.tags) {
      filter.tags = { $in: req.query.tags.split(',') };
    }

    if (req.query.isFeatured) {
      filter.isFeatured = req.query.isFeatured === 'true';
    }

    if (req.query.isBreaking) {
      filter.isBreaking = req.query.isBreaking === 'true';
    }

    let sort = { createdAt: -1 };
    let projection = {};

    if (req.query.keyword) {
      filter.$text = { $search: req.query.keyword };
      projection = { score: { $meta: 'textScore' } };
      sort = { score: { $meta: 'textScore' } };
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      Article.find(filter, projection)
        .populate('category', 'name slug')
        .populate('tags', 'name slug')
        .populate('author', 'name avatar')
        .select('-content -engagement.likedByUsers -engagement.likedByIPs')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter)
    ]);

    res.json({
      articles,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get article by slug
// @route   GET /api/articles/:slug
// @access  Public
const getArticleBySlug = async (req, res) => {
  try {
    const query = { slug: req.params.slug };
    
    // If user is not admin and is just a public request, return only published
    if (!req.user || req.user.role !== 'admin') {
      query.status = 'published';
    }

    const article = await Article.findOneAndUpdate(
      query,
      { $inc: { 'engagement.views': 1 } },
      { new: true }
    )
      .populate('category', 'name')
      .populate('tags', 'name')
      .populate('author', 'name bio avatar')
      .lean();

    if (article) {
      const articleObj = article;
      
      // Check if current user or IP has liked
      let isLiked = false;
      if (req.user) {
        isLiked = article.engagement.likedByUsers.some(id => id.toString() === req.user._id.toString());
      } else {
        isLiked = article.engagement.likedByIPs.includes(req.ip);
      }
      
      articleObj.isLiked = isLiked;
      // Don't leak all users/IPs who liked
      delete articleObj.engagement.likedByUsers;
      delete articleObj.engagement.likedByIPs;

      res.json(articleObj);
    } else {
      res.status(404).json({ message: 'Article not found or not published' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private/Admin
const updateArticle = async (req, res) => {
  try {
    if (req.body.title && !req.body.slug) {
      req.body.slug = slugify(req.body.title, { lower: true, strict: true });
    }

    const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (article) {
      res.json(article);
    } else {
      res.status(404).json({ message: 'Article not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private/Admin
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (article) {
      res.json({ message: 'Article removed' });
    } else {
      res.status(404).json({ message: 'Article not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('category', 'name')
      .populate('tags', 'name')
      .populate('author', 'name bio avatar');

    if (article) {
      res.json(article);
    } else {
      res.status(404).json({ message: 'Article not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like an article
// @route   POST /api/articles/:id/like
// @access  Public
const likeArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    let isLiked = false;
    const userId = req.user ? req.user._id : null;
    const ip = req.ip;

    if (userId) {
      const index = article.engagement.likedByUsers.indexOf(userId);
      if (index === -1) {
        article.engagement.likedByUsers.push(userId);
        article.engagement.likes += 1;
        isLiked = true;
      } else {
        article.engagement.likedByUsers.splice(index, 1);
        article.engagement.likes = Math.max(0, article.engagement.likes - 1);
        isLiked = false;
      }
    } else {
      const index = article.engagement.likedByIPs.indexOf(ip);
      if (index === -1) {
        article.engagement.likedByIPs.push(ip);
        article.engagement.likes += 1;
        isLiked = true;
      } else {
        article.engagement.likedByIPs.splice(index, 1);
        article.engagement.likes = Math.max(0, article.engagement.likes - 1);
        isLiked = false;
      }
    }

    await article.save();
    res.json({ likes: article.engagement.likes, isLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createArticle,
  getArticles,
  getArticleBySlug,
  getArticleById,
  updateArticle,
  deleteArticle,
  likeArticle
};
