 const axios = require('axios');
const { imagekit } = require('../config/imagekit');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Uploads a base64 image to ImageKit with automatic fallback to GitHub
 * @param {string} base64Data - The base64 string (including data prefix)
 * @param {string} fileName - Original filename or desired name
 * @param {string} folder - Destination folder / path
 * @returns {Promise<string>} - The resulting URL
 */
const uploadImage = async (base64Data, fileName, folder = 'news-assets') => {
    try {
        if (!base64Data) throw new Error('Base64 data is empty');
        
        console.log(`[Storage] Starting ImageKit upload for: ${fileName}`);
        
        // Clean filename to prevent API errors
        const safeName = fileName.replace(/[^a-z0-9.]/gi, '-').toLowerCase();

        // ImageKit Node SDK accepts the full data URL string directly.
        // Let's try passing the full string first, if it fails we strip it.
        const response = await imagekit.upload({
            file: base64Data, 
            fileName: `${Date.now()}-${safeName}`,
            folder: folder,
            useUniqueFileName: true
        });

        console.log(`[Storage] ImageKit success! URL: ${response.url}`);
        return response.url;
    } catch (error) {
        console.error(`[Storage] ImageKit primary failed:`, error.message || error);
        
        // Fallback to GitHub
        try {
            console.log(`[Storage] Attempting GitHub fallback...`);
            return await uploadToGitHub(base64Data, fileName, folder);
        } catch (fallbackError) {
            console.error(`[Storage] GitHub fallback also failed:`, fallbackError.message);
            throw new Error(`Storage failed: ${error.message} (Fallback: ${fallbackError.message})`);
        }
    }
};

/**
 * Fallback: Uploads base64 data to GitHub repository
 */
const uploadToGitHub = async (base64Data, fileName, folder) => {
    try {
        const token = process.env.GITHUB_TOKEN;
        const owner = process.env.REPO_OWNER; // Corrected from GITHUB_REPO_OWNER
        const repo = process.env.REPO_NAME;   // Corrected from GITHUB_REPO_NAME
        const branch = process.env.GITHUB_BRANCH || 'main';

        if (!token || !owner || !repo) {
            throw new Error('GitHub fallback credentials missing in .env');
        }

        const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
        const filePath = `uploads/${folder}/${Date.now()}-${fileName}`;
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

        console.log(`[Storage] Uploading to GitHub: ${filePath}`);

        const response = await axios.put(url, {
            message: `Upload backup image: ${fileName}`,
            content: base64Clean,
            branch: branch
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        // Return the RAW URL for display
        return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
    } catch (error) {
        console.error('[Storage] GitHub backup also failed:', error.response?.data || error.message);
        throw new Error('All storage providers failed. Please check logs and credentials.');
    }
};

module.exports = { uploadImage };
