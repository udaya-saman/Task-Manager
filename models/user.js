const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    lastActiveAt: { type: Date, default: Date.now },
    theme: { type: String, default: 'light' },
});

const User = mongoose.model('User', userSchema);

module.exports = User;