const mongoose = require('mongoose');

const ViewSchema = new mongoose.Schema({
  article: { type: mongoose.Schema.Types.ObjectId, ref: "Article", required: true, index: true },
  ipAddress: { type: String, required: true },
  userAgent: String,
}, { timestamps: true });

// Compound index to quickly find if an IP has already viewed an article
ViewSchema.index({ article: 1, ipAddress: 1 });

module.exports = mongoose.model('View', ViewSchema);
