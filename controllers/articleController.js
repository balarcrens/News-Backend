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

    if (req.query.keyword) {
      filter.$or = [
        { title: { $regex: req.query.keyword, $options: 'i' } },
        { summary: { $regex: req.query.keyword, $options: 'i' } },
        { content: { $regex: req.query.keyword, $options: 'i' } }
      ];
    }

    const articles = await Article.find(filter)
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(articles);
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

    const article = await Article.findOne(query)
      .populate('category', 'name')
      .populate('tags', 'name')
      .populate('author', 'name bio avatar');

    if (article) {
      res.json(article);
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

module.exports = {
  createArticle,
  getArticles,
  getArticleBySlug,
  getArticleById,
  updateArticle,
  deleteArticle
};
