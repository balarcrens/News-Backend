const express = require('express');
const router = express.Router();
const { recordView } = require('../controllers/viewController');

router.post('/:articleId', recordView);

module.exports = router;
