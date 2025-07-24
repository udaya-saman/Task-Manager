
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
    lastActiveAt: { type: Date, default: Date.now },
    theme: { type: String, default: 'light' },
});

const User = mongoose.model('User', userSchema);

// Category Schema
const categorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
});

const Category = mongoose.model('Category', categorySchema);


// Task Schema
const taskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
}, { timestamps: true });

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
        user.lastActiveAt = new Date();
        await user.save();
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.send({ token });
    } catch (error) {
        res.status(500).send({ error: 'Server error.' });
    }
});

// Verify token and get user data
app.get('/api/auth/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).send({ error: 'User not found.' });
        }
        user.lastActiveAt = new Date();
        await user.save();
        res.send(user);
    } catch (error) {
        res.status(500).send({ error: 'Server error.' });
    }
});

// --- User Preferences ---
app.put('/api/user/theme', auth, async (req, res) => {
    try {
        const { theme } = req.body;
        if (!['light', 'dark'].includes(theme)) {
            return res.status(400).send({ error: 'Invalid theme.' });
        }
        await User.findByIdAndUpdate(req.user.userId, { theme });
        res.send({ message: 'Theme updated successfully.' });
    } catch (error) {
        res.status(500).send({ error: 'Server error.' });
    }
});

// --- Category Routes ---
app.get('/api/categories', auth, async (req, res) => {
    try {
        const categories = await Category.find({ userId: req.user.userId });
        res.send(categories);
    } catch (error) {
        res.status(500).send({ error: 'Server error.' });
    }
});

app.post('/api/categories', auth, async (req, res) => {
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
});

app.put('/api/categories/:id', auth, async (req, res) => {
    try {
        const category = await Category.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { name: req.body.name },
            { new: true }
        );
        if (!category) {
            return res.status(404).send({ error: 'Category not found.' });
        }
        res.send(category);
    } catch (error) {
        res.status(400).send({ error: 'Error updating category.' });
    }
});

app.delete('/api/categories/:id', auth, async (req, res) => {
    try {
        const category = await Category.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        if (!category) {
            return res.status(404).send({ error: 'Category not found.' });
        }
        res.send({ message: 'Category deleted successfully.' });
    } catch (error) {
        res.status(500).send({ error: 'Server error.' });
    }
});


// Get all tasks for a user
app.get('/api/tasks', auth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.userId, { lastActiveAt: new Date() });
        const tasks = await Task.find({ userId: req.user.userId });
        res.send(tasks);
    } catch (error) {
        res.status(500).send({ error: 'Server error.' });
    }
});

// Create a new task
app.post('/api/tasks', auth, async (req, res) => {
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
});

// Update a task
app.put('/api/tasks/:id', auth, async (req, res) => {
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
});

// Delete a task
app.delete('/api/tasks/:id', auth, async (req, res) => {
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
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Inactive User Cleanup ---
const deleteInactiveUsers = async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    console.log(`Running cleanup for users inactive since ${thirtyDaysAgo.toISOString()}`);
    
    try {
        const inactiveUsers = await User.find({ lastActiveAt: { $lt: thirtyDaysAgo } });
        
        if (inactiveUsers.length === 0) {
            console.log('No inactive users to delete.');
            return;
        }

        for (const user of inactiveUsers) {
            console.log(`Deleting inactive user ${user.username} (ID: ${user._id})`);
            await Task.deleteMany({ userId: user._id });
            await Category.deleteMany({ userId: user._id });
            await User.findByIdAndDelete(user._id);
            console.log(`Successfully deleted user ${user.username} and their data.`);
        }
    } catch (error) {
        console.error('Error during inactive user cleanup:', error);
    }
};

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    // Run the cleanup once on startup and then every 24 hours
    deleteInactiveUsers();
    setInterval(deleteInactiveUsers, 24 * 60 * 60 * 1000);
});
