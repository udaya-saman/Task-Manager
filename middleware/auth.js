const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret'; // Replace with a strong secret

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

module.exports = auth;