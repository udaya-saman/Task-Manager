const Category = require('../models/category');
const Task = require('../models/task');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({ userId: req.user.userId });
        res.send(categories);
    } catch (error) {
        res.status(500).send({ error: 'Server error.' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const count = await Category.countDocuments({ userId: req.user.userId });
        if (count >= 10) {
            return res.status(400).send({ error: 'Maximum number of categories (10) reached.' });
        }
        const category = new Category({
            userId: req.user.userId,
            name: req.body.name,
        });
        await category.save();
        res.status(201).send(category);
    } catch (error) {
        res.status(400).send({ error: 'Error creating category.' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findOne({ _id: req.params.id, userId: req.user.userId });

        if (!category) {
            return res.status(404).send({ error: 'Category not found.' });
        }

        const oldName = category.name;
        const newName = req.body.name;

        category.name = newName;
        await category.save();

        await Task.updateMany({ userId: req.user.userId, category: oldName }, { category: newName });

        res.send(category);
    } catch (error) {
        res.status(400).send({ error: 'Error updating category.' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        if (!category) {
            return res.status(404).send({ error: 'Category not found.' });
        }
        res.send({ message: 'Category deleted successfully.' });
    } catch (error) {
        res.status(500).send({ error: 'Server error.' });
    }
};