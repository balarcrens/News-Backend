const express = require('express');
const router = express.Router();
const { generateTopics, generateArticle } = require('../controllers/aiController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/generate-topics', protect, admin, generateTopics);
router.post('/generate-article', protect, admin, generateArticle);

module.exports = router;
