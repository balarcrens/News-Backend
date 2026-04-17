const geminiService = require('../services/geminiService');

const generateTopics = async (req, res) => {
    try {
        const topics = await geminiService.generateContent('prompt1.md');
        res.status(200).json(topics);
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate topics', error: error.message });
    }
};

const suggestTitles = async (req, res) => {
    const { hint } = req.body;
    try {
        const suggestions = await geminiService.generateContent('prompt3.md', {
            user_hint: hint || 'General trending news'
        });
        res.status(200).json(suggestions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to suggest titles', error: error.message });
    }
};

const generateArticle = async (req, res) => {
    const { topic, hint } = req.body;

    if (!topic && !hint) {
        return res.status(400).json({ message: 'Topic or Hint is required for article generation' });
    }

    try {
        const context = hint ? `INSTRUCTION: ${hint}. BASE TOPIC: ${topic || 'trending news'}` : topic;

        const article = await geminiService.generateContent('prompt2.md', {
            selected_topic_here: context
        });
        res.status(200).json(article);
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate article', error: error.message });
    }
};

module.exports = {
    generateTopics,
    suggestTitles,
    generateArticle
};
