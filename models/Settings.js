const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  siteName: String,
  siteDescription: String,
  logo: String,
  favicon: String,

  defaultMetaTitle: String,
  defaultMetaDescription: String,

  googleAnalyticsId: String,

  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
