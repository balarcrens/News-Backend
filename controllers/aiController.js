const geminiService = require('../services/geminiService');

const generateTopics = async (req, res) => {
    try {
        const topics = await geminiService.generateContent('prompt1.md');
        res.status(200).json(topics);
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate topics', error: error.message });
    }
};

const generateArticle = async (req, res) => {
    const { topic } = req.body;

    if (!topic) {
        return res.status(400).json({ message: 'Topic is required for article generation' });
    }

    try {
        const article = await geminiService.generateContent('prompt2.md', {
            selected_topic_here: topic
        });
        res.status(200).json(article);
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate article', error: error.message });
    }
};

module.exports = {
    generateTopics,
    generateArticle
};
