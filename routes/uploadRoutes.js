const express = require('express');
const router = express.Router();
const { uploadImage } = require('../services/storageService');
const { protect, admin } = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/upload
 * @desc    Upload an image (Base64) with fallback
 * @access  Private/Admin
 */
router.post('/', protect, admin, async (req, res) => {
    try {
        console.log('[Upload Route] Received request');
        const { fileData, fileName, folder } = req.body;

        if (!fileData || !fileName) {
            console.warn('[Upload Route] Missing required fields');
            return res.status(400).json({ 
                success: false, 
                message: 'No file data or name provided' 
            });
        }

        console.log(`[Upload Route] Processing: ${fileName} in folder: ${folder}`);
        
        const imageUrl = await uploadImage(fileData, fileName, folder);

        return res.status(200).json({
            success: true,
            url: imageUrl
        });
    } catch (error) {
        console.error('[Upload Route] Server-side error:', error.message);
        
        // Ensure we always return JSON, even on crash, to avoid CORS block side-effects
        return res.status(500).json({ 
            success: false,
            message: error.message || 'Server-side upload processing failed'
        });
    }
});

module.exports = router;
