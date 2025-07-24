const User = require('../models/user');
const Task = require('../models/task');
const Category = require('../models/category');

exports.updateTheme = async (req, res) => {
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
};

exports.deleteInactiveUsers = async () => {
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