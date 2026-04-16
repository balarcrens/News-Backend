const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  article: { type: mongoose.Schema.Types.ObjectId, ref: "Article", required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  profilePicture: { type: String },
  comment: { type: String, required: true, maxLength: 1000 },
  
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null }, // Support nested replies

  isApproved: { type: Boolean, default: false, index: true },
  likes: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);
