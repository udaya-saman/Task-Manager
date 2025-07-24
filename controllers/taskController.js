const Task = require('../models/task');
const User = require('../models/user');

exports.getAllTasks = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.userId, { lastActiveAt: new Date() });
        const tasks = await Task.find({ userId: req.user.userId });
        res.send(tasks);
    } catch (error) {
        res.status(500).send({ error: 'Server error.' });
    }
};

exports.createTask = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.userId, { lastActiveAt: new Date() });
        const { title, category } = req.body;
        const task = new Task({
            userId: req.user.userId,
            title,
            category,
        });
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send({ error: 'Error creating task.' });
    }
};

exports.updateTask = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.userId, { lastActiveAt: new Date() });
        
        const { title, category, completed } = req.body;
        const updateData = { title, category, completed };

        if (completed === true) {
            updateData.completedAt = new Date();
        } else if (completed === false) {
            updateData.completedAt = null;
        }

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            updateData,
            { new: true }
        );

        if (!task) {
            return res.status(404).send({ error: 'Task not found.' });
        }
        res.send(task);
    } catch (error) {
        res.status(400).send({ error: 'Error updating task.' });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.userId, { lastActiveAt: new Date() });
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        if (!task) {
            return res.status(404).send({ error: 'Task not found.' });
        }
        res.send({ message: 'Task deleted successfully.' });
    } catch (error) {
        res.status(500).send({ error: 'Server error.' });
    }
};