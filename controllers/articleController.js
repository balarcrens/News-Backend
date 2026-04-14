const Article = require('../models/Article');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const slugify = require('slugify');


// @desc    Get data for Home page (Featured, Latest, Popular, Categories with Articles)
// @route   GET /api/articles/home
// @access  Public
const getHomeData = async (req, res) => {
  try {
    const [featured, latest, popular, allCategories] = await Promise.all([
      // 1. Featured Articles
      Article.find({ status: 'published', isFeatured: true })
        .populate('category', 'name slug')
        .populate('author', 'name avatar')
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(3)
        .lean(),

      // 2. Latest Articles
      Article.find({ status: 'published' })
        .populate('category', 'name slug')
        .populate('author', 'name avatar')
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(10)
        .lean(),

      // 3. Popular Articles
      Article.find({ status: 'published' })
        .populate('category', 'name slug')
        .populate('author', 'name avatar')
        .sort({ 'engagement.views': -1 })
        .limit(5)
        .lean(),

      // 4. All Active Categories
      Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 }).lean()
    ]);

    // 5. For each category, get its top 2 articles
    // We do this in parallel to keep it fast
    const categoriesWithArticles = await Promise.all(
      allCategories.map(async (cat) => {
        const articles = await Article.find({ 
          status: 'published', 
          category: cat._id 
        })
        .populate('category', 'name slug')
        .populate('author', 'name avatar')
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(2)
        .lean();

        return {
          ...cat,
          articles
        };
      })
    );

    // Filter out categories with no articles to keep frontend clean
    const activeCategories = categoriesWithArticles.filter(c => c.articles && c.articles.length > 0);

    res.json({
      featured,
      latest,
      popular,
      categories: activeCategories
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to process tags (find or create)
const processTags = async (tagsData) => {
  if (!tagsData || !Array.isArray(tagsData)) return [];
  
  const processedTags = [];
  for (const tag of tagsData) {
    // If it's already an ObjectId (or looks like one), keep it
    if (tag.toString().match(/^[0-9a-fA-F]{24}$/)) {
      processedTags.push(tag);
      continue;
    }

    // Otherwise, treat it as a tag name, find or create it
    const tagName = tag;
    if (!tagName) continue;

    let existingTag = await Tag.findOne({ 
      $or: [
        { name: new RegExp(`^${tagName}$`, 'i') },
        { slug: slugify(tagName, { lower: true, strict: true }) }
      ]
    });

    if (!existingTag) {
      existingTag = await Tag.create({
        name: tagName,
        slug: slugify(tagName, { lower: true, strict: true })
      });
    }
    processedTags.push(existingTag._id);
  }
  return processedTags;
};

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

    // Process tags if they are strings
    if (articleData.tags && Array.isArray(articleData.tags)) {
      articleData.tags = await processTags(articleData.tags);
    }

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

    if (req.query.startDate) {
      filter.createdAt = { ...filter.createdAt, $gte: new Date(req.query.startDate) };
    }

    if (req.query.endDate) {
      filter.createdAt = { ...filter.createdAt, $lte: new Date(req.query.endDate) };
    }

    let sort = { createdAt: -1 };
    if (req.query.sortBy === 'views') {
      sort = { 'engagement.views': -1 };
    } else if (req.query.sortBy === 'likes') {
      sort = { 'engagement.likes': -1 };
    } else if (req.query.sortBy === 'oldest') {
      sort = { createdAt: 1 };
    } else if (req.query.sortBy === 'newest') {
      sort = { createdAt: -1 };
    }

    let projection = {};
    if (req.query.keyword) {
      filter.$text = { $search: req.query.keyword };
      projection = { score: { $meta: 'textScore' } };
      // If no other sort is explicitly requested, sort by relevance score
      if (!req.query.sortBy || req.query.sortBy === 'relevance') {
        sort = { score: { $meta: 'textScore' } };
      }
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      Article.find(filter, projection)
        .populate('category', 'name slug')
        .populate('tags', 'name slug')
        .populate('author', 'name bio avatar')
        .select('-engagement.likedByUsers -engagement.likedByIPs')
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

    // Process tags if they are strings
    if (req.body.tags && Array.isArray(req.body.tags)) {
      req.body.tags = await processTags(req.body.tags);
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

    const userId = req.user._id;
    const index = article.engagement.likedByUsers.indexOf(userId);

    let isLiked = false;
    if (index === -1) {
      article.engagement.likedByUsers.push(userId);
      article.engagement.likes += 1;
      isLiked = true;
    } else {
      article.engagement.likedByUsers.splice(index, 1);
      article.engagement.likes = Math.max(0, article.engagement.likes - 1);
      isLiked = false;
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
  likeArticle,
  getHomeData
};
