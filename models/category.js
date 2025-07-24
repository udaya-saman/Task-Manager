const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;