const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const taskRoutes = require('./routes/task');
const handleErrors = require('./middleware/errorMiddleware');
const { deleteInactiveUsers } = require('./controllers/userController');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/task-manager', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tasks', taskRoutes);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error Handling Middleware
app.use(handleErrors);

// Schedule inactive user cleanup
cron.schedule('0 0 * * *', () => {
    console.log('Running daily inactive user cleanup job.');
    deleteInactiveUsers();
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});