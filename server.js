
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your_jwt_secret'; // Replace with a strong secret

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/task-manager', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Task Schema
const taskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    completed: { type: Boolean, default: false },
});

const Task = mongoose.model('Task', taskSchema);

// Middleware to authenticate JWT
const auth = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).send({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
        return res.status(401).send({ error: 'Access denied.' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).send({ error: 'Invalid token.' });
    }
};

// --- API Routes ---

// User Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).send({ message: 'User created successfully.' });
    } catch (error) {
        res.status(400).send({ error: 'Error creating user.' });
    }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send({ error: 'Invalid credentials.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ error: 'Invalid credentials.' });
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.send({ token });
    } catch (error) {
        res.status(500).send({ error: 'Server error.' });
    }
});

// Get all tasks for a user
app.get('/api/tasks', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.userId });
        res.send(tasks);
    } catch (error) {
        res.status(500).send({ error: 'Server error.' });
    }
});

// Create a new task
app.post('/api/tasks', auth, async (req, res) => {
    try {
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
});

// Update a task
app.put('/api/tasks/:id', auth, async (req, res) => {
    try {
        const { title, category, completed } = req.body;
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { title, category, completed },
            { new: true }
        );
        if (!task) {
            return res.status(404).send({ error: 'Task not found.' });
        }
        res.send(task);
    } catch (error) {
        res.status(400).send({ error: 'Error updating task.' });
    }
});

// Delete a task
app.delete('/api/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        if (!task) {
            return res.status(404).send({ error: 'Task not found.' });
        }
        res.send({ message: 'Task deleted successfully.' });
    } catch (error) {
        res.status(500).send({ error: 'Server error.' });
    }
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
