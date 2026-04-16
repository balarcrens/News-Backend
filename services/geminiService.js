const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getPromptContent = async (fileName) => {
    try {
        const filePath = path.join(__dirname, fileName);
        const content = await fs.readFile(filePath, 'utf8');
        return content;
    } catch (error) {
        console.error(`Error reading prompt file ${fileName}:`, error);
        throw new Error(`Prompt configuration error: ${fileName} not found.`);
    }
};

const generateContent = async (promptName, replacements = {}) => {
    try {
        let promptTemplate = await getPromptContent(promptName);

        // Automatic date injection for contemporary context (2026 focus)
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        const yearStr = now.getFullYear().toString();
        
        promptTemplate = promptTemplate.replace(/{{current_date}}/g, dateStr);
        promptTemplate = promptTemplate.replace(/{{current_year}}/g, yearStr);

        // Dynamic replacements (e.g., {{selected_topic_here}})
        Object.keys(replacements).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            promptTemplate = promptTemplate.replace(regex, replacements[key] || '');
        });

        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const result = await model.generateContent(promptTemplate);
        const response = await result.response;
        const text = response.text();

        return JSON.parse(text);
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
};

module.exports = {
    generateContent
};
