const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
}, { timestamps: true });

module.exports = mongoose.model('Tag', TagSchema);
