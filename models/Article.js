const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true },
  slug: { type: String, unique: true, index: true, lowercase: true, trim: true },
  summary: { type: String, maxLength: [500, 'Summary cannot exceed 500 characters'] },
  content: { type: String, required: [true, 'Content is required'] },
  
  media: {
    featuredImage: String,
    imageAlt: String,
    gallery: [String],
    videoUrl: String,
  },

  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", index: true },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag", index: true }],

  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  
  customAuthor: {
    name: String,
    bio: String,
    profileImage: String,
  },
  
  source: {
    name: String,
    url: String,
  },

  seo: {
    metaTitle: String,
    metaDescription: { type: String, maxLength: 160 },
    keywords: [String],
    canonicalUrl: String,
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
  },

  status: {
    type: String,
    enum: ["draft", "published", "scheduled", "archived", "pending_review"],
    default: "draft",
    index: true
  },
  
  type: {
    type: String,
    enum: ["news", "blog"],
    default: "news",
    index: true
  },
  
  isFeatured: { type: Boolean, default: false },
  isBreaking: { type: Boolean, default: false },

  publishedAt: Date,
  scheduledAt: Date,

  engagement: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
  },

  automation: {
    aiGenerated: { type: Boolean, default: false },
    aiPrompt: String,
  },

  localization: {
    language: { type: String, default: "en" },
    country: String,
  },

  isVerified: { type: Boolean, default: false },

}, { timestamps: true });

// Text index for search functionality
ArticleSchema.index({ title: 'text', summary: 'text', content: 'text' });

module.exports = mongoose.model('Article', ArticleSchema);
