const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true, index: true },
  description: { type: String, maxLength: 300 },
  
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null, index: true },

  media: {
    icon: String,
    image: String,
  },

  seo: {
    metaTitle: String,
    metaDescription: { type: String, maxLength: 160 },
  },

  // Added ordering for frontend UI control
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
