const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Category = require('../models/Category');

// Supported languages from Frontend/src/components/LanguageSyncManager.jsx
const VALID_LANGS = [
  'en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa', 'ur', 
  'es', 'fr', 'de', 'ar', 'zh-CN', 'ja', 'ru', 'pt', 'it', 'tr', 'vi', 'th', 'id', 'ko'
];

const STATIC_PAGES = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: 'about', priority: '0.6', changefreq: 'monthly' },
  { path: 'contact', priority: '0.6', changefreq: 'monthly' },
  { path: 'privacy-policy', priority: '0.3', changefreq: 'monthly' },
  { path: 'terms-of-service', priority: '0.3', changefreq: 'monthly' },
  { path: 'cookie-policy', priority: '0.3', changefreq: 'monthly' },
  { path: 'disclaimer', priority: '0.3', changefreq: 'monthly' }
];

// Helper to generate alternate language links for a page
const getAlternateLinks = (baseUrl, path) => {
  let links = '';
  VALID_LANGS.forEach(lang => {
    const langPath = lang === 'en' ? (path ? `/${path}` : '') : `/${lang}${path ? `/${path}` : ''}`;
    links += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}${langPath}" />\n`;
  });
  // Add x-default (usually English)
  links += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${path ? `/${path}` : ''}" />\n`;
  return links;
};

// @desc    Generate fully improved dynamic sitemap XML
// @route   GET /sitemap.xml
// @access  Public
router.get('/', async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://nexoranews.dpdns.org';
    
    // Fetch published articles
    const articles = await Article.find({ status: 'published' })
      .select('slug updatedAt')
      .sort({ updatedAt: -1 });
    
    // Fetch categories
    const categories = await Category.find()
      .select('slug updatedAt');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    // 1. Static Pages (for all languages)
    STATIC_PAGES.forEach(page => {
      VALID_LANGS.forEach(lang => {
        const langPath = lang === 'en' ? (page.path ? `/${page.path}` : '') : `/${lang}${page.path ? `/${page.path}` : ''}`;
        xml += `
  <url>
    <loc>${baseUrl}${langPath}</loc>
${getAlternateLinks(baseUrl, page.path)}    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
      });
    });

    // 2. Articles (for all languages)
    articles.forEach(article => {
      const articlePath = `article/${article.slug}`;
      const lastMod = article.updatedAt.toISOString().split('T')[0];
      
      VALID_LANGS.forEach(lang => {
        const langPath = lang === 'en' ? `/${articlePath}` : `/${lang}/${articlePath}`;
        xml += `
  <url>
    <loc>${baseUrl}${langPath}</loc>
${getAlternateLinks(baseUrl, articlePath)}    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
      });
    });

    // 3. Categories (for all languages)
    categories.forEach(category => {
      const categoryPath = `category/${category.slug}`;
      const lastMod = category.updatedAt ? category.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      VALID_LANGS.forEach(lang => {
        const langPath = lang === 'en' ? `/${categoryPath}` : `/${lang}/${categoryPath}`;
        xml += `
  <url>
    <loc>${baseUrl}${langPath}</loc>
${getAlternateLinks(baseUrl, categoryPath)}    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
      });
    });

    xml += `\n</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap Error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
