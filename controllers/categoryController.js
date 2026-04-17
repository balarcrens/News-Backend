const Category = require('../models/Category');
const Article = require('../models/Article');
const slugify = require('slugify');

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 }).lean();

        // Enrich categories with article counts
        const categoriesWithCount = await Promise.all(categories.map(async (cat) => {
            const count = await Article.countDocuments({ category: cat._id, status: 'published' });
            return { ...cat, articleCount: count };
        }));

        res.json(categoriesWithCount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCategoryBySlug = async (req, res) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug, isActive: true });
        if (category) {
            res.json(category);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name, description, parentCategory, media, seo, displayOrder, isActive } = req.body;
        const slug = slugify(name, { lower: true, strict: true });

        const category = await Category.create({
            name,
            slug,
            description,
            parentCategory,
            media,
            seo,
            displayOrder,
            isActive
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (name) {
            req.body.slug = slugify(name, { lower: true, strict: true });
        }

        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (category) {
            res.json(category);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (category) {
            res.json({ message: 'Category removed' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
};
