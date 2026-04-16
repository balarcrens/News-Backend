const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/generate-topics', protect, admin, aiController.generateTopics);
router.post('/suggest-titles', protect, admin, aiController.suggestTitles);
router.post('/generate-article', protect, admin, aiController.generateArticle);

module.exports = router;
